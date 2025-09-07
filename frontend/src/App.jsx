import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Customize from "./pages/Customize";
import Home from "./pages/Home";
import { UserContext } from "./context/UserContext";
import ChatHistory from "./pages/ChatHistory";

const App = () => {
  const { userData } = useContext(UserContext);

  return (
    <Routes>
      {/* Default route → Signup */}
      <Route path="/" element={<Navigate to="/signup" />} />

      {/* Public Routes */}
      {!userData && (
        <>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </>
      )}

      {/* Private Routes */}
      {userData && (
        <>
          <Route path="/customize" element={<Customize />} />
          <Route path="/home" element={<Home />} />
           <Route path="/chat-history" element={<ChatHistory />} />
        </>
      )}

      {/* Catch all → redirect based on auth */}
      <Route
        path="*"
        element={<Navigate to={userData ? "/home" : "/signin"} />}
      />
    </Routes>
  );
};

export default App;
