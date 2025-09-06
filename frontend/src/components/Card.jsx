import React, { useContext } from 'react'
import { UserContext } from '../context/UserContext'

function Card({ image, selectedImage, setSelectedImage }) {
  return (
    <div className={`w-[250px] h-[150px] bg-[blue] border-2 border-[black] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white
    ${selectedImage === image ? "border-4 border-white hover:shadow-2xl hover:shadow-blue-950" : ""}
   `} onClick={() => { setSelectedImage(image) }}>
        <img src={image} className='h-full object-cover' alt="Assistant option" /> 
    </div>
  )
}

export default Card 