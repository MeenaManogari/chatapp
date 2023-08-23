import React from "react";
import axios from "axios";
import { useState, useContext } from "react";
import { UserContext } from "./UserContext";
import "./pages.css";

const RegisterAndLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const url = isLoginOrRegister === "register" ? "register" : "login";
      const { data } = await axios.post(url, { username, password });
      setLoggedInUsername(username);
      setId(data.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="reg_main">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <div className="btn">
          {" "}
          <button type="submit">
            {isLoginOrRegister === "register" ? "Register" : "Login"}
          </button>
        </div>

        <div className="login_button">
          {isLoginOrRegister === "register" && (
            <div className="btns">
              Already a member?
              <button onClick={() => setIsLoginOrRegister("login")}>
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === "login" && (
            <div className="btns">
              Don't have an account?
              <button onClick={() => setIsLoginOrRegister("register")}>
                Register
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterAndLogin;
