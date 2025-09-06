import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Customize from "./pages/Customize";
import Customize2 from "./pages/Customize2";
import Home from "./pages/Home";
import { UserContext } from "./context/UserContext";

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
          {/* After login, first step is customize */}
          <Route path="/customize" element={<Customize />} />
          <Route path="/customize2" element={<Customize2 />} />
          <Route path="/home" element={<Home />} />
        </>
      )}

      {/* Catch all → redirect based on auth */}
      <Route
        path="*"
        element={<Navigate to={userData ? "/customize" : "/signup"} />}
      />
    </Routes>
  );
};

export default App;
