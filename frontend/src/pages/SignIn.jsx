import React, { useState, useContext } from 'react'
import backgroundImage from '../assets/bg-image.webp'
import { FaEye, FaEyeSlash, FaQuestionCircle } from "react-icons/fa"
import { useNavigate, Link } from "react-router-dom"
import { UserContext } from "../context/UserContext"
import axios from 'axios'

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showHelper, setShowHelper] = useState(false)
  const { apiBase, setUserData , geminiApiKey, setGeminiApiKey} = useContext(UserContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [validatingApiKey, setValidatingApiKey] = useState(false)

  const validateGeminiApiKey = async (apiKey) => {
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello"
                }
              ]
            }
          ]
        })
      })
      
      return response.ok
    } catch (error) {
      return false
    }
  }
const handleSubmit = async (e) => {
  e.preventDefault()
  setErr("")

  if (!geminiApiKey.trim()) {
    setErr("Please enter your Gemini API key")
    return
  }

  setLoading(true)
  try {
    // Step 1: Authenticate user first
    let result = await axios.post(
      `${apiBase}/auth/signin`,
      { email, password },
      { withCredentials: true }
    )

    console.log(result.data)

    // Step 2: Validate Gemini API key AFTER successful signin
    setValidatingApiKey(true)
    const isValidApiKey = await validateGeminiApiKey(geminiApiKey)
    setValidatingApiKey(false)

    if (!isValidApiKey) {
      setErr("Invalid Gemini API key. Please check your API key and try again.")
      setLoading(false)
      return
    }

    // Step 3: Store user data with Gemini key
    const userDataWithApiKey = {
      ...result.data,
      geminiApiKey: geminiApiKey,
    }

    setUserData(userDataWithApiKey)
    navigate("/customize")
    setLoading(false)
  } catch (error) {
    let message = "Sign in failed"
    if (!error.response) {
      message =
        "Cannot reach the server. Make sure the backend is running on http://localhost:8000 and CORS is enabled."
    } else {
      message =
        error.response.data?.message ||
        error.response.data ||
        error.message ||
        message
    }
    setUserData(null)
    setLoading(false)
    setErr(message)
    console.error("SignIn failed:", error)
  }
}

  const GeminiApiHelper = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">How to Get Gemini API Key</h3>
          <button
            onClick={() => setShowHelper(false)}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="text-gray-300 space-y-3 text-sm">
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">Step 1: Visit Google AI Studio</h4>
            <p>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Google AI Studio</a></p>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">Step 2: Sign In</h4>
            <p>Sign in with your Google account</p>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">Step 3: Create API Key</h4>
            <p>Click "Create API Key" button</p>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">Step 4: Choose Project</h4>
            <p>Select an existing Google Cloud project or create a new one</p>
          </div>
          
          <div>
            <h4 className="text-blue-400 font-semibold mb-2">Step 5: Copy API Key</h4>
            <p>Copy the generated API key and paste it here</p>
          </div>
          
          <div className="bg-yellow-900/30 p-3 rounded-md mt-4">
            <p className="text-yellow-300 text-xs">
              <strong>Note:</strong> Keep your API key secure and never share it publicly. 
              The API key will be stored locally and removed when you sign out.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
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
            w-[90%] h-[700px] max-w-[500px] 
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
            Login to <span className="text-blue-400">Virtual Assistant</span>
          </h1>

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

          {/* Gemini API Key Input */}
          <div className="relative w-full">
            <div className="flex items-center gap-2 mb-2">
              <label className="text-white text-sm font-medium">Google Gemini API Key</label>
              <FaQuestionCircle
                className="text-blue-400 cursor-pointer hover:text-blue-300"
                onClick={() => setShowHelper(true)}
                title="How to get Gemini API Key?"
              />
            </div>
            <div className="relative h-[60px]">
              <input
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your Gemini API Key"
                className="w-full h-full border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-3 rounded-full text-[18px] outline-none"
                required
                onChange={(e) => setGeminiApiKey(e.target.value)}
                value={geminiApiKey}
              />
              {showApiKey ? (
                <FaEyeSlash
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white cursor-pointer w-[25px] h-[25px]"
                  onClick={() => setShowApiKey(!showApiKey)}
                />
              ) : (
                <FaEye
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white cursor-pointer w-[25px] h-[25px]"
                  onClick={() => setShowApiKey(!showApiKey)}
                />
              )}
            </div>
          </div>

          {err && <p className="text-red-500 text-center">{err}</p>}

          <button
            type="submit"
            disabled={loading || validatingApiKey}
            className="w-full h-[60px] mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[20px] font-semibold rounded-full shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-blue-600/80 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validatingApiKey ? "Validating API Key..." : loading ? "Signing In..." : "Sign In"}
          </button>

          <p className="text-gray-300 text-[16px] mt-4">
            Want to create a New Account?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </form>
      </div>

      {showHelper && <GeminiApiHelper />}
    </>
  )
}

export default SignIn