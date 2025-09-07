import React, { useContext, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import {
  FaMicrophone,
  FaStop,
  FaCog,
  FaRobot,
  FaSignOutAlt,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import image5 from "../assets/image5.webp";
import axios from "axios";

// Conversation modes
const CONVERSATION_MODES = {
  default: { displayName: "General Assistant", icon: "💬" },
  study: { displayName: "Study Helper", icon: "📚" },
  emotional: { displayName: "Emotional Support", icon: "💝" },
  casual: { displayName: "Casual Chat", icon: "😊" },
  websearch: { displayName: "Web Research", icon: "🔍" },
  advanced: { displayName: "Advanced Mode", icon: "🔧" },
};

const VOICE_SETTINGS = {
  language: {
    english: "English",
    hindi: "Hindi",
  },
  speechRate: {
    slow: { value: 0.8, label: "Slow" },
    normal: { value: 1.0, label: "Normal" },
    fast: { value: 1.2, label: "Fast" },
  },
};

function Home() {
  const { apiBase, userData, setUserData } = useContext(UserContext);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
 

  // New state
  const [conversationMode, setConversationMode] = useState("default");
  const [voiceSettings, setVoiceSettings] = useState({
    language: "english",
    speechRate: "normal",
    voiceStyle: "friendly",
  });

  const recognitionRef = useRef(null);
   const voiceSettingsRef = useRef(voiceSettings);
  const synthRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
  voiceSettingsRef.current = voiceSettings;
}, [voiceSettings]);

const handleVoiceResult = (transcript) => {
  setCurrentMessage("");
  handleSendMessage(transcript, { ...voiceSettingsRef.current });
};


  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;


      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage("");
         handleVoiceResult(transcript);
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

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
               const langMap = { english: "en-US", hindi: "hi-IN" };
      recognitionRef.current.lang = langMap[voiceSettings.language] || "en-US";
      setIsListening(true);
      recognitionRef.current.start();
    }
  };


  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakWithConfig = (text, ttsConfig) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (ttsConfig) {
        utterance.lang = ttsConfig.language || "en-US";
        utterance.rate = parseFloat(ttsConfig.rate) || 1.0;
      } else {
        utterance.lang = "en-US";
        utterance.rate =
          VOICE_SETTINGS.speechRate[voiceSettings.speechRate]?.value || 1.0;
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
    }
  };

  const speak = (text) => {
    speakWithConfig(text, null);
  };

  const handleSendMessage = async (message, voiceSettingsOverride = null) => {
    if (!message.trim()) return;

    const finalVoiceSettings = voiceSettingsOverride || voiceSettings;

    const userMessage = {
      type: "user",
      text: message,
      timestamp: new Date(),
      mode: conversationMode,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await axios.post(
        `${apiBase}/assistant/chat`,
        {
          message,
          userId: userData._id,
          mode: conversationMode,
          voiceSettings: finalVoiceSettings,
        },
        { withCredentials: true }
      );

      const assistantMessage = {
        type: "assistant",
        text: response.data.response,
        mode: response.data.metadata?.mode || conversationMode,
        language: response.data.metadata?.language || "english",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (response.data.metadata?.ttsConfig) {
        speakWithConfig(response.data.response, response.data.metadata.ttsConfig);
      } else {
        speak(response.data.response);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        type: "assistant",
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      speak("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(currentMessage);
      setCurrentMessage("");
    }
  };

  const handleLogOut = async () => {
    try {
      await axios.post(`${apiBase}/auth/logout`, {}, { withCredentials: true });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
   <div className="w-full h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex flex-col lg:flex-row">
  {/* Sidebar */}
  <aside className="lg:w-80 w-full lg:h-full h-auto bg-black/30 backdrop-blur-xl border-r border-white/30 flex flex-col p-4 lg:p-6">
    {/* Assistant Info */}
    <div className="flex flex-col items-center mb-4 lg:mb-6">
      <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden mb-4 border-4 border-white/30 shadow-lg">
        <img
          src={userData?.assistantImage || image5}
          alt="Assistant"
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-white text-lg lg:text-xl font-semibold mb-2 text-center">
        {userData?.assistantName || "Virtual Assistant"}
      </h2>
      <button
        onClick={() => navigate("/customize")}
        className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 rounded-lg text-sm transition mb-3"
      >
        Customize Assistant
      </button>
    </div>

    {/* Conversation Mode Selector */}
    <div className="mb-4 lg:mb-6">
      <label className="text-gray-300 text-sm font-medium mb-1 block">
        Conversation Mode
      </label>
      <select
        value={conversationMode}
        onChange={(e) => setConversationMode(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {Object.entries(CONVERSATION_MODES).map(([key, mode]) => (
          <option key={key} value={key} className="bg-gray-900">
            {mode.icon} {mode.displayName}
          </option>
        ))}
      </select>
    </div>

    {/* Voice Controls */}
    <div className="flex flex-col items-center space-y-3 mb-4 lg:mb-6">
      <div className="flex space-x-4">
        {!isListening ? (
          <button
            onClick={startListening}
            disabled={isProcessing}
            className="w-12 h-12 lg:w-14 lg:h-14 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 rounded-full flex items-center justify-center text-white shadow-lg"
          >
            <FaMicrophone size={20} />
          </button>
        ) : (
          <button
            onClick={stopListening}
            className="w-12 h-12 lg:w-14 lg:h-14 bg-gray-500 hover:bg-gray-600 rounded-full flex items-center justify-center text-white"
          >
            <FaStop size={20} />
          </button>
        )}

        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="w-12 h-12 lg:w-14 lg:h-14 bg-orange-500 hover:bg-orange-600 rounded-full flex items-center justify-center text-white"
          >
            <FaStop size={20} />
          </button>
        )}
      </div>

      <p className="text-gray-300 text-xs text-center">
        {isListening
          ? "Listening..."
          : isSpeaking
          ? "Speaking..."
          : "Tap to speak"}
      </p>
    </div>

    {/* Voice Settings */}
    <button
      onClick={() => setShowSettings(!showSettings)}
      className="flex items-center space-x-2 bg-gray-700/70 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition mb-4 w-full justify-center"
    >
      <FaCog size={16} />
      <span>Voice Settings</span>
    </button>

    {showSettings && (
      <div className="bg-gray-800/50 rounded-lg p-3 mb-4 space-y-4 w-full">
        <div>
          <label className="text-gray-300 text-sm font-medium mb-1 block">
            Language
          </label>
          <select
            value={voiceSettings.language}
            onChange={(e) =>
              setVoiceSettings((prev) => ({
                ...prev,
                language: e.target.value,
              }))
            }
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
          >
            {Object.entries(VOICE_SETTINGS.language).map(([key, label]) => (
              <option key={key} value={key} className="bg-gray-900">
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    )}

    {/* Footer Actions */}
    <div className="mt-auto space-y-2">
      <button
        onClick={() => navigate("/chat-history")}
        className="w-full bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition"
      >
        View Chat History
      </button>

      <button
        onClick={handleLogOut}
        className="flex items-center justify-center gap-2 w-full text-white font-medium hover:text-red-400 transition"
      >
        <FaSignOutAlt size={20} />
        Logout
      </button>
    </div>
  </aside>

  {/* Main Chat Area */}
  <main className="flex-1 flex flex-col">
    {/* Messages */}
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 mt-16 lg:mt-20">
          <FaRobot size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl lg:text-2xl font-semibold mb-2">
            Welcome to your Virtual Assistant!
          </h3>
          <p className="mb-1">
            Current mode:{" "}
            <span className="text-indigo-300">
              {CONVERSATION_MODES[conversationMode]?.displayName}
            </span>
          </p>
          <p className="text-sm text-gray-400">
            Start a conversation by typing or using voice input.
          </p>
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
              className={`max-w-full sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-md ${
                msg.type === "user"
                  ? "bg-indigo-600 text-white"
                  : msg.isError
                  ? "bg-red-500/20 text-red-200 border border-red-400/40"
                  : "bg-gray-800/40 text-gray-100 border border-gray-700/30"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.text}
              </ReactMarkdown>
              <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
                <span>{msg.timestamp.toLocaleTimeString()}</span>
                {msg.type === "assistant" && msg.mode && (
                  <span>{CONVERSATION_MODES[msg.mode]?.icon}</span>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {isProcessing && (
        <div className="flex justify-start">
          <div className="bg-gray-800/40 text-white px-3 py-2 rounded-xl">
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
    <div className="p-4 lg:p-6  bg-black/10 backdrop-blur-xl border-r ">
      <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <input
          type="text"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Message ${CONVERSATION_MODES[conversationMode]?.displayName}...`}
          className="flex-1 bg-gray-900/90 border border-gray-700/50 rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isProcessing}
        />
        <button
          onClick={() => {
            handleSendMessage(currentMessage);
            setCurrentMessage("");
          }}
          disabled={!currentMessage.trim() || isProcessing}
          className="bg-white text-gray-900 font-semibold 
                     hover:bg-gray-200 
                     disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed
                     px-6 sm:px-8 py-2 sm:py-3 rounded-xl shadow-md transition-all duration-300"
        >
          Send
        </button>
      </div>
    </div>
  </main>
</div>

  );
}


export default Home;
