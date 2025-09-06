import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/UserContext'
import axios from 'axios'

function Customize2() {
    const { userData, setUserData } = useContext(UserContext)
    const [AssistantName, setAssistantName] = useState(userData?.assistantName || "")
    const navigate = useNavigate()
    
    console.log("Customize2 userData:", userData)
    
    const handleUpdateAssistant = async () => {
        try {
            let formData = new FormData()
            formData.append("assistantName", AssistantName)
            if (userData?.backendImage) {
                formData.append("assistantImage", userData.backendImage)
            } else if (userData?.selectedImage) {
                formData.append("imageUrl", userData.selectedImage)
            }
            const result = await axios.post(`/api/user/update`, formData, { withCredentials: true })
            console.log(result.data)
            setUserData(result.data)
            navigate("/")
        } catch (error) {
            console.error("Update failed:", error)
            // Show error message to user
            alert("Failed to update assistant. Please try again.")
        }
    }
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[blue] flex justify-center items-center flex-col'>
        <h1 className='text-white text-2xl mb-8'>Enter your assistant name</h1>
        <input
          type="text"
          placeholder="eg: shifra"
          className="w-[600px] h-[60px] border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-3 rounded-full text-[18px] outline-none"
          required 
          onChange={(e) => setAssistantName(e.target.value)} 
          value={AssistantName}
        />
        <button 
          className="w-full h-[60px] mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[20px] font-semibold rounded-full shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-blue-600/80 cursor-pointer"
          onClick={handleUpdateAssistant}
        >
          Finally Create your assistant 
        </button> 
    </div>
  )
}

export default Customize2