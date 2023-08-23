const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const UserModel = require("./models/User");
const MessageModel = require("./models/Message");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db");

const ws = require("ws");

dotenv.config();

connectDB();
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json("no token");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const foundUser = await UserModel.findOne({ username });
    if (foundUser) {
      const passOK = bcrypt.compareSync(password, foundUser.password);
      if (passOK) {
        jwt.sign(
          { userId: foundUser._id, username },
          jwtSecret,
          {},
          (err, token) => {
            res
              .cookie("token", token, { sameSite: "none", secure: true })
              .json({
                id: foundUser._id,
              });
          }
        );
      }
    }
  } catch (error) {
    if (error) throw error;
    console.log(error);
    res.status(500).json("error");
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await UserModel.create({
      username: username,
      password: hashedPassword,
    });
    jwt.sign(
      { userId: createdUser._id, username },
      jwtSecret,
      {},
      (err, token) => {
        if (err) throw err;
        res
          .cookie("token", token, { sameSite: "none", secure: true })
          .status(201)
          .json({ id: createdUser._id });
      }
    );
  } catch (err) {
    if (err) throw err;
    console.log(err);
    res.status(500).json("error");
  }
});

const server = app.listen(5000);

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  //read username and id form the cookie for this connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
          if (err) throw err;
          const { userId, username } = userData;
          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;
    if (recipient && text) {
      const messageDoc = await MessageModel.create({
        sender: connection.userId,
        recipient,
        text,
      });

      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              id: messageDoc._id,
            })
          )
        );
    }
  });

  //notify everyone about online people(when someone connects)

  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
});
