import React from 'react'

function Card({ image, selectedImage, setSelectedImage }) {
  const isSelected = selectedImage === image

  return (
    <div
      className={`relative w-[250px] h-[150px] rounded-2xl overflow-hidden cursor-pointer 
      transform transition-all duration-300 
      ${isSelected ? "ring-4 ring-blue-400 scale-105" : "hover:scale-105"}
      hover:shadow-xl hover:shadow-blue-900`}
      onClick={() => setSelectedImage(image)}
    >
      {/* Image */}
      <img
        src={image}
        alt="Assistant option"
        className="w-full h-full object-cover"
      />

      {/* Overlay if selected */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/40 to-purple-500/40 "></div>
      )}

      {/* Subtle bottom gradient for readability */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/40 to-transparent"></div>
    </div>
  )
}

export default Card
