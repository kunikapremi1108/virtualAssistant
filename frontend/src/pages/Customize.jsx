import React, { useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import Card from "../components/Card";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image3.webp";
import image4 from "../assets/image4.webp";
import image5 from "../assets/image5.webp";
import { LuImagePlus } from "react-icons/lu";

function Customize() {
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const inputImage = useRef();
  const navigate = useNavigate();
  const { userData, setUserData } = useContext(UserContext);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleNext = () => {
    const updatedUserData = {
      ...userData,
      selectedImage: selectedImage,
      backendImage: backendImage,
      frontendImage: frontendImage,
    };
    setUserData(updatedUserData);
    console.log("Updated userData:", updatedUserData);
    navigate("/customize2");
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center p-6">
      {/* Heading */}
      <h1 className="text-4xl font-extrabold text-white drop-shadow-lg mb-10 text-center animate-fadeIn">
        Choose Your <span className="text-indigo-400">Assistant</span> Image
      </h1>

      {/* Cards Container */}
      <div className="w-150px max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
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

        {/* Upload Card */}
        <div
          className={`w-[250px] h-[180px] rounded-2xl bg-white/10 border-2 border-white/30 backdrop-blur-lg 
          flex items-center justify-center cursor-pointer transition-all duration-300 
          hover:scale-105 hover:shadow-2xl hover:shadow-indigo-700/50 ${
            selectedImage === "input"
              ? "ring-4 ring-indigo-500 scale-105"
              : ""
          }`}
          onClick={() => {
            inputImage.current.click();
            setSelectedImage("input");
          }}
        >
          {!frontendImage && (
            <LuImagePlus className="text-white w-10 h-10 opacity-70 hover:opacity-100 transition" />
          )}
          {frontendImage && (
            <img
              src={frontendImage}
              className="w-full h-full object-cover rounded-2xl"
            />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />
      </div>

      {/* Next Button */}
      {selectedImage && (
        <button
          onClick={handleNext}
          className="mt-10 px-10 py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 
          text-white text-lg font-bold tracking-wide shadow-lg shadow-indigo-500/40 
          hover:scale-110 hover:shadow-pink-600/50 transition-all duration-300"
        >
          Next →
        </button>
      )}
    </div>
  );
}

export default Customize;
