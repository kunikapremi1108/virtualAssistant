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
      {/* Default route → always start with signup */}
      <Route path="/" element={<Navigate to="/signup" />} />

      {/* Public routes */}
      {!userData && (
        <>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          {/* If not logged in, redirect any other path to signup */}
          <Route path="*" element={<Navigate to="/signup" />} />
        </>
      )}

      {/* Private routes */}
      {userData && (
        <>
          {/* Step 1: After signup/signin → Customize */}
          <Route path="/customize" element={<Customize />} />

          {/* Step 2: After customize → Customize2 */}
          <Route path="/customize2" element={<Customize2 />} />

          {/* Step 3: After create assistant → Home */}
          <Route path="/home" element={<Home />} />

          {/* If logged in but path invalid, go to customize first */}
          <Route path="*" element={<Navigate to="/customize" />} />
        </>
      )}
    </Routes>
  );
};

export default App;
