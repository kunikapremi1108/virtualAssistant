import React, { useContext, useState, useRef, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import { FaMicrophone, FaStop } from "react-icons/fa";
import axios from "axios";

function Home() {
    const { apiBase, userData, setUserData } = useContext(UserContext)
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [messages, setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const recognitionRef = useRef(null)
    const synthRef = useRef(null)


    useEffect(() => {
        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = false
            recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // 🎙 Start Listening
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // ⏹ Stop Listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

    const speak = (text) => {
        if (synthRef.current) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            synthRef.current.speak(utterance)
        }
    }

    const handleSendMessage = async (message) => {
        if (!message.trim()) return

        const userMessage = { type: 'user', text: message, timestamp: new Date() }
        setMessages(prev => [...prev, userMessage])
        setIsProcessing(true)

        try {
            // Send to Gemini API via backend
            const response = await axios.post(`${apiBase}/assistant/chat`, {
                message: message,
                userId: userData._id
            }, { withCredentials: true })

      const assistantMessage = {
        type: "assistant",
        text: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speak(response.data.response);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        type: "assistant",
        text: "⚠️ Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // ↩️ Enter Key to Send
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(currentMessage);
    }
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      {/* Sidebar with Assistant Info */}
      <div className="w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 flex flex-col items-center p-6">
        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white/20">
          <img
            src={userData?.assistantImage || "/default-avatar.png"}
            alt="Assistant"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-white text-xl font-bold mb-2">
          {userData?.assistantName || "Assistant"}
        </h2>
        <p className="text-gray-300 text-sm text-center mb-6">
          Your AI Virtual Assistant
        </p>

        {/* Voice Controls */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex space-x-4">
            {!isListening ? (
              <button
                onClick={startListening}
                className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <FaMicrophone size={24} />
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="w-16 h-16 bg-gray-500 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <FaStop size={24} />
              </button>
            )}
          </div>
          <p className="text-white text-sm">
            {isListening ? "🎤 Listening..." : "Tap to speak"}
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <h3 className="text-2xl mb-4">Welcome to your Virtual Assistant!</h3>
              <p>Start a conversation by typing a message or using voice input.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white backdrop-blur-sm"
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white/10 text-white backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/10">
          <div className="flex space-x-4">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              disabled={isProcessing}
            />
            <button
              onClick={() => handleSendMessage(currentMessage)}
              disabled={!currentMessage.trim() || isProcessing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
