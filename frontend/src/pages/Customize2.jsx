import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import axios from "axios";

function Customize2() {
  const { userData, setUserData } = useContext(UserContext);
  const [assistantName, setAssistantName] = useState(userData?.assistantName || "");
  const navigate = useNavigate();

  // Logout: clear context and go to signup
  const handleLogout = () => {
    setUserData(null);
    navigate("/signup");
  };

  // Go back to customize
  const handleCustomize = () => {
    navigate("/customize");
  };

  // Update assistant (name + image)
  const handleUpdateAssistant = async () => {
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);

      if (userData?.backendImage) {
        formData.append("assistantImage", userData.backendImage);
      } else if (userData?.selectedImage) {
        formData.append("imageUrl", userData.selectedImage);
      }

      const result = await axios.post(`/api/user/update`, formData, {
        withCredentials: true,
      });

      console.log(result.data);
      setUserData(result.data);
      navigate("/"); // go to Home after successful update
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update assistant. Please try again.");
    }
  };
  

  return (
    <div className="w-full h-screen bg-gradient-to-b from-black to-blue-900 flex flex-col justify-center items-center px-6">
      {/* Heading */}
      <h1 className="text-white text-3xl font-bold mb-8">
        Enter Your Assistant Name
      </h1>

      {/* Input field */}
      <input
        type="text"
        placeholder="e.g: Shifra"
        className="w-[90%] max-w-[500px] h-[55px] border-2 border-white bg-transparent text-white placeholder-gray-400 px-5 rounded-full text-lg outline-none focus:ring-2 focus:ring-blue-400"
        required
        onChange={(e) => setAssistantName(e.target.value)}
        value={assistantName}
      />

      {/* Final create button */}
      <button
        onClick={handleUpdateAssistant}
        className="w-[90%] max-w-[500px] h-[55px] mt-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-lg font-semibold rounded-full shadow-lg shadow-blue-500/40 transition-transform duration-300 hover:scale-105 hover:shadow-blue-600/80"
      >
        Finally Create Your Assistant
      </button>

      {/* Extra action buttons */}
      <div className="flex flex-col gap-4 w-[90%] max-w-[500px] mt-10">
        <button
          onClick={handleCustomize}
          className="py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-white font-bold"
        >
          Customize Your Assistant
        </button>

        <button
          onClick={handleLogout}
          className="py-3 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-bold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Customize2;
