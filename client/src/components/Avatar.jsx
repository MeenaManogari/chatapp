import React from "react";
import "./components.css";

const Avatar = ({ userId, username }) => {
  return (
    <>
      <div className="pro_pic">{username[0]}</div>
    </>
  );
};

export default Avatar;
