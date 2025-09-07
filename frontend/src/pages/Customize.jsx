import React, { useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Card from "../components/Card";
import image1 from "../assets/image1.jpg";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image3.webp";
import image4 from "../assets/image4.webp";
import image5 from "../assets/image5.webp";
import image6 from "../assets/image6.jpeg";
import { LuImagePlus } from "react-icons/lu";
import axios from "axios";

function Customize() {
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [assistantName, setAssistantName] = useState("");
  const inputImage = useRef();
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(UserContext);
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
    setSelectedImage("input");
  };

  const handleSubmit = async () => {
    try {
      let formData = new FormData();
      formData.append("assistantName", assistantName);

      if (backendImage) {
        formData.append("assistantImage", backendImage);
      } else if (selectedImage) {
        formData.append("imageUrl", selectedImage);
      }

      const result = await axios.post(`${apiBase}/user/update`, formData, {
        withCredentials: true,
      });

      setUserData(result.data);
      navigate("/home");
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to create assistant. Please try again.");
    }
  };

  return (
<div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex flex-col items-center justify-center p-6">
      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-white drop-shadow-lg mb-10 text-center animate-fadeIn">
        Customize Your <span className="text-indigo-400">Assistant</span>
      </h1>

      {/* Avatar Selection */}
      <h2 className="text-xl text-white mb-4">Choose an Avatar</h2>
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center mb-10">
        <Card
          image={image1}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
        <Card
          image={image2}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
        <Card
          image={image3}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
        <Card
          image={image4}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
           <Card
          image={image5}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />
             <Card
          image={image6}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
        />

  
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />
      </div>

      {/* Assistant Name Input */}
      <h2 className="text-xl text-white mb-4">Enter Assistant Name</h2>
      <input
        type="text"
        placeholder="eg: Jarvis"
        className="w-[600px] max-w-[90%] h-[60px] border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-3 rounded-full text-[18px] outline-none mb-8"
        required
        value={assistantName}
        onChange={(e) => setAssistantName(e.target.value)}
      />

      {/* Submit Button */}
      {selectedImage && assistantName && (
        <button
          onClick={handleSubmit}
          className="px-12 py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 
          text-white text-lg font-bold tracking-wide shadow-lg shadow-indigo-500/40 
          hover:scale-110 hover:shadow-pink-600/50 transition-all duration-300"
        >
          Create Your Assistant →
        </button>
      )}
    </div>
  );
}

export default Customize;
