import React, { useState, useContext } from 'react'
import backgroundImage from '../assets/bg-image.webp'
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { useNavigate, Link } from "react-router-dom"
import { UserContext } from "../context/UserContext"


import axios from 'axios'

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const { apiBase, userData, setUserData} = useContext(UserContext)
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErr("")
    try {
      let result = await axios.post(
        `${apiBase}/auth/signup`,
        { name, email, password },  
        { withCredentials: true }
      )
      setUserData(result.data)
      
  if (result.status === 200) {
    console.log("Signup success, navigating to /customize")
    navigate("/customize")
  }
    } catch (error) {
      let message = "Signup failed"
      if (!error.response) {
        // Network/CORS/server-down
        message = "Cannot reach the server. Make sure the backend is running on http://localhost:8000 and CORS is enabled."
      } else {
        message = error.response.data?.message || error.response.data || error.message || message
      }
      setErr(message)
      console.error("Signup failed:", message)
      setUserData(null)
    }
  }

  return (
    <div
      className="w-full h-[100vh] flex justify-center items-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <form
        className="
          w-[90%] h-[600px] max-w-[500px] 
          bg-black/60
          rounded-[10px] backdrop-blur
          p-10
          ml-10
          shadow-lg shadow-blue-500/50
          flex flex-col items-center justify-center gap-5
        "
        onSubmit={handleSubmit}
      >
        <h1 className="text-[32px] font-bold text-white text-center mb-6">
          Register to <span className="text-blue-400">Virtual Assistant</span>
        </h1>

        {/* Name Input */}
        <input
          type="text"
          placeholder="Enter your Name"
          className="w-full h-[60px] border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-3 rounded-full text-[18px] outline-none"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
        />

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          className="w-full h-[60px] border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-3 rounded-full text-[18px] outline-none"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        {/* Password Input */}
        <div className="relative w-full h-[60px]">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full h-full border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-3 rounded-full text-[18px] outline-none"
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {showPassword ? (
            <FaEyeSlash
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white cursor-pointer w-[25px] h-[25px]"
              onClick={() => setShowPassword(!showPassword)}
            />
          ) : (
            <FaEye
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white cursor-pointer w-[25px] h-[25px]"
              onClick={() => setShowPassword(!showPassword)}
            />
          )}
        </div>
        {err&& <p className="text-red-500">{err}</p>}


        <button
          type="submit"
          className="w-full h-[60px] mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[20px] font-semibold rounded-full shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-blue-600/80"
        >
          Sign Up
        </button>

        <p className="text-gray-300 text-[16px] mt-4">
          Already have an account?{" "}
          <Link to="/signin" className="text-blue-400 hover:underline font-medium">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  )
}

export default SignUp
