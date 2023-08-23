import React from "react";
import { useState, useContext, useEffect } from "react";

import send from "../assets/send-icon.png";
import Avatar from "../components/Avatar";
import "./pages.css";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const { username, id } = useContext(UserContext);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };

  const handleMessage = (e) => {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    console.log("sending");
    ws.send(
      JSON.stringify({
        recipient: selectedUser,
        text: newMessage,
      })
    );
    setNewMessage("");
    setMessages((prev) => [
      ...prev,
      { text: newMessage, sender: id, recipient: selectedUser },
    ]);
  };

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const messageWithoutDupes = uniqBy(messages, "id");

  return (
    <div className="chat_page">
      <div className="chat_list">
        <div className="chat_head">
          <h3>MyChat</h3>
        </div>
        {Object.keys(onlinePeopleExclOurUser).map((userId) => (
          <div
            className="chat_name"
            key={userId}
            onClick={() => setSelectedUser(userId)}
          >
            <Avatar username={onlinePeople[userId]} userId={userId} />
            {onlinePeople[userId]}
          </div>
        ))}
      </div>
      <div className="chat_area">
        <div className="conversations">
          {!selectedUser && <div className="chats">select a chat</div>}
          {!!selectedUser && (
            <div className="chat_msgs">
              {messageWithoutDupes.map((message) => (
                <div className="chat_texts">
                  sender:{message.sender}
                  <br />
                  my id:{id}
                  <br />
                  {message.text}
                </div>
              ))}
              <div></div>
            </div>
          )}
        </div>
        {!!selectedUser && (
          <form className="txt_msg" onSubmit={sendMessage}>
            {" "}
            <input
              type="text"
              placeholder="Enter Message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit">
              <img src={send} alt="Send" width={30} height={30} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
