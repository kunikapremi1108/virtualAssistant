import React, { useContext, useState, useRef, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { UserContext } from '../context/UserContext'
import { FaMicrophone, FaStop, FaCog, FaRobot, FaSignOutAlt } from 'react-icons/fa'
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import image5 from "../assets/image5.webp";

import axios from 'axios'

// Import the conversation modes (create this file or inline the data)
const CONVERSATION_MODES = {
  default: { displayName: "General Assistant", icon: "💬" },
  study: { displayName: "Study Helper", icon: "📚" },
  emotional: { displayName: "Emotional Support", icon: "💝" },
  casual: { displayName: "Casual Chat", icon: "😊" },
  websearch: { displayName: "Web Research", icon: "🔍" },
  advanced: { displayName: "Advanced Mode", icon: "🔧" }
};

const VOICE_SETTINGS = {
  language: {
    english: "English", 
    hindi: "hindi",
  },
  speechRate: {
    slow: { value: 0.8, label: "Slow" },
    normal: { value: 1.0, label: "Normal" },
    fast: { value: 1.2, label: "Fast" }
  }
};

function Home() {
    const { apiBase, userData, setUserData } = useContext(UserContext)
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [messages, setMessages] = useState([])
    const [currentMessage, setCurrentMessage] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    
    // New state for conversation modes and voice settings
    const [conversationMode, setConversationMode] = useState('default')
    const [voiceSettings, setVoiceSettings] = useState({
      language: 'auto',
      speechRate: 'normal',
      voiceStyle: 'friendly'
    })
    
    const recognitionRef = useRef(null)
    const synthRef = useRef(null)
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize speech recognition
        if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = false
            recognitionRef.current.lang = 'en-US'

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                setCurrentMessage(transcript)
                handleSendMessage(transcript)
            }

            recognitionRef.current.onend = () => {
                setIsListening(false)
            }
        }

        // Initialize speech synthesis
        synthRef.current = window.speechSynthesis

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
        }
    }, [])

    const startListening = () => {
        if (recognitionRef.current && !isListening) {
            setIsListening(true)
            recognitionRef.current.start()
        }
    }

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        }
    }

    // Enhanced speak function with TTS config
    const speakWithConfig = (text, ttsConfig) => {
        if (synthRef.current) {
            // Stop any current speech
            synthRef.current.cancel()
            
            const utterance = new SpeechSynthesisUtterance(text)
            
            // Apply TTS configuration
            if (ttsConfig) {
                utterance.lang = ttsConfig.language || 'en-US'
                utterance.rate = parseFloat(ttsConfig.rate) || 1.0
                utterance.pitch = 1.0 // Browser limitation for pitch
            } else {
                utterance.lang = 'en-US'
                utterance.rate = VOICE_SETTINGS.speechRate[voiceSettings.speechRate]?.value || 1.0
            }
            
            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            utterance.onerror = () => setIsSpeaking(false)
            
            synthRef.current.speak(utterance)
        }
    }

    // Legacy speak function for backward compatibility
    const speak = (text) => {
        speakWithConfig(text, null)
    }

    const handleSendMessage = async (message) => {
        if (!message.trim()) return

        const userMessage = { 
            type: 'user', 
            text: message, 
            timestamp: new Date(),
            mode: conversationMode 
        }
        setMessages(prev => [...prev, userMessage])
        setIsProcessing(true)

        try {
            // Enhanced API call with mode and voice settings
            const response = await axios.post(`${apiBase}/assistant/chat`, {
                message: message,
                userId: userData._id,
                mode: conversationMode,
                voiceSettings: voiceSettings
            }, { withCredentials: true })

            const assistantMessage = { 
                type: 'assistant', 
                text: response.data.response,
                mode: response.data.metadata?.mode || conversationMode,
                language: response.data.metadata?.language || 'english',
                timestamp: new Date() 
            }
            setMessages(prev => [...prev, assistantMessage])
            
            // Use enhanced TTS with configuration from backend
            if (response.data.metadata?.ttsConfig) {
                speakWithConfig(response.data.response, response.data.metadata.ttsConfig)
            } else {
                speak(response.data.response)
            }
            
        } catch (error) {
            console.error('Error sending message:', error)
            const errorMessage = { 
                type: 'assistant', 
                text: 'Sorry, I encountered an error. Please try again.', 
                timestamp: new Date(),
                isError: true
            }
            setMessages(prev => [...prev, errorMessage])
            speak('Sorry, I encountered an error. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage(currentMessage)
            setCurrentMessage('')
        }
    }
    const handleLogOut = async () => {
        try {
          await axios.post(`${apiBase}/auth/logout`, {}, { withCredentials: true })
          setUserData(null)
          navigate('/signin')
        } catch (error) {
          console.error('Logout failed:', error)
        }
      }

    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel()
            setIsSpeaking(false)
        }
    }

    return (
        <div className='w-full h-[100vh] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex'>
            {/* Enhanced Sidebar */}
            <div className='w-96 bg-black/20 backdrop-blur-sm border-r border-white/10 flex flex-col p-6'>
                {/* Assistant Info */}
                <div className='flex flex-col items-center mb-6'>
                    <div className='w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-white/20'>
                        <img 
                            src={userData?.assistantImage || image5} 
                            alt="Assistant" 
                            className='w-full h-full object-cover'
                        />
                    </div>
                    <h2 className='text-white text-xl font-bold mb-2'>
                        {userData?.assistantName || 'Virtual Assistant'}
                    </h2>
                   <button 
  onClick={() => navigate('/customize')}
  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors mb-3"
>
  Customize your Assistant
</button>
                </div>

                {/* Conversation Mode Selector */}
                <div className='mb-6'>
                    <label className='text-white text-sm font-medium mb-2 block'>
                        Conversation Mode
                    </label>
                    <select
                        value={conversationMode}
                        onChange={(e) => setConversationMode(e.target.value)}
                        className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500'
                    >
                        {Object.entries(CONVERSATION_MODES).map(([key, mode]) => (
                            <option key={key} value={key} className='bg-gray-800'>
                                {mode.icon} {mode.displayName}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Voice Controls */}
                <div className='flex flex-col items-center space-y-4 mb-6'>
                    <div className='flex space-x-4'>
                        {!isListening ? (
                            <button
                                onClick={startListening}
                                disabled={isProcessing}
                                className='w-16 h-16 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors'
                            >
                                <FaMicrophone size={24} />
                            </button>
                        ) : (
                            <button
                                onClick={stopListening}
                                className='w-16 h-16 bg-gray-500 hover:bg-gray-600 rounded-full flex items-center justify-center text-white transition-colors'
                            >
                                <FaStop size={24} />
                            </button>
                        )}
                        
                        {isSpeaking && (
                            <button
                                onClick={stopSpeaking}
                                className='w-16 h-16 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white transition-colors'
                            >
                                <FaStop size={24} />
                            </button>
                        )}
                    </div>
                    
                    <p className='text-white text-sm text-center'>
                        {isListening ? 'Listening...' : 
                         isSpeaking ? 'Speaking...' : 
                         'Tap to speak'}
                    </p>
                </div>

                {/* Settings Toggle */}
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className='flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors mb-4'
                >
                    <FaCog size={16} />
                    <span>Voice Settings</span>
                </button>

                {/* Voice Settings Panel */}
                {showSettings && (
                    <div className='bg-black/30 rounded-lg p-4 mb-4 space-y-4'>
                        <div>
                            <label className='text-white text-sm font-medium mb-2 block'>
                                Language
                            </label>
                            <select
                                value={voiceSettings.language}
                                onChange={(e) => setVoiceSettings(prev => ({...prev, language: e.target.value}))}
                                className='w-full bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm'
                            >
                                {Object.entries(VOICE_SETTINGS.language).map(([key, label]) => (
                                    <option key={key} value={key} className='bg-gray-800'>{label}</option>
                                ))}
                            </select>
                        </div>
                        
                    </div>
                )}
                   {/* Chat History Button */}
                <button
                    onClick={() => navigate('/chat-history')}
                    className='flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mt-auto'
                >
                    <span>View Chat History</span>
                </button>
                  {/* Logout Button */}
             
                         <div className="flex justify-center mt-6">
                        <button  
                            onClick={() => handleLogOut()}  
                            className="flex items-center gap-2 text-white text-m font-semibold hover:text-gray-400 transition-colors duration-200"
                        >
                            <FaSignOutAlt size={28} />
                            Logout
                        </button>
                        </div>

            </div>
            
            {/* Main Chat Area */}
            <div className='flex-1 flex flex-col'>
                {/* Messages */}
                <div className='flex-1 overflow-y-auto p-6 space-y-4'>
                    {messages.length === 0 ? (
                        <div className='text-center text-gray-400 mt-20'>
                            <FaRobot size={64} className='mx-auto mb-4 opacity-50' />
                            <h3 className='text-2xl mb-4'>Welcome to your Enhanced Virtual Assistant!</h3>
                            <p className='mb-2'>Current mode: <span className='text-blue-300'>{CONVERSATION_MODES[conversationMode]?.displayName}</span></p>
                            <p>Start a conversation by typing a message or using voice input.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        msg.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : msg.isError 
                                            ? 'bg-red-500/20 text-red-200 backdrop-blur-sm border border-red-500/30'
                                            : 'bg-white/10 text-white backdrop-blur-sm'
                                    }`}
                                >
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                    <div className='flex justify-between items-center mt-1'>
                                        <p className='text-xs opacity-70'>
                                            {msg.timestamp.toLocaleTimeString()}
                                        </p>
                                        {msg.type === 'assistant' && msg.mode && (
                                            <span className='text-xs opacity-60 ml-2'>
                                                {CONVERSATION_MODES[msg.mode]?.icon}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isProcessing && (
                        <div className='flex justify-start'>
                            <div className='bg-white/10 text-white backdrop-blur-sm px-4 py-2 rounded-lg'>
                                <div className='flex space-x-1'>
                                    <div className='w-2 h-2 bg-white rounded-full animate-bounce'></div>
                                    <div className='w-2 h-2 bg-white rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
                                    <div className='w-2 h-2 bg-white rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className='p-6 border-t border-white/10'>
                    <div className='flex space-x-4'>
                        <input
                            type='text'
                            value={currentMessage}
                            onChange={(e) => setCurrentMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Type your message for ${CONVERSATION_MODES[conversationMode]?.displayName}...`}
                            className='flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500'
                            disabled={isProcessing}
                        />
                        <button
                            onClick={() => {
                                handleSendMessage(currentMessage);
                                setCurrentMessage("");
                            }}
                            disabled={!currentMessage.trim() || isProcessing}
                            className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors'
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home