import React from 'react'

function Card({ image, selectedImage, setSelectedImage }) {
  return (
    <div
      className={`w-[250px] h-[150px] border-2 border-black rounded-2xl overflow-hidden cursor-pointer
      hover:shadow-2xl hover:shadow-blue-950
      ${selectedImage === image ? "border-4 border-white" : ""}`}
      onClick={() => setSelectedImage(image)}
    >
      <img
        src={image}
        alt="Assistant option"
        className="w-full h-full object-cover"
      />
    </div>
  )
}

export default Card
