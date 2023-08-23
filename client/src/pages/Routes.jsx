import React from "react";
import { useContext } from "react";
import Chat from "./Chat";
import RegisterAndLogin from "./RegisterAndLogin";
import { UserContext } from "./UserContext";

const Routes = () => {
  const { username, id } = useContext(UserContext);

  if (username) {
    return <Chat />;
  }
  return (
    <>
      <RegisterAndLogin />
    </>
  );
};

export default Routes;
