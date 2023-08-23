import "./App.css";
import axios from "axios";

import UserContextProvider from "./pages/UserContext";

import Routes from "./pages/Routes";

function App() {
  axios.defaults.baseURL = "http://localhost:5000";
  axios.defaults.withCredentials = true;

  return (
    <>
      <UserContextProvider>
        <Routes />
      </UserContextProvider>
    </>
  );
}

export default App;
