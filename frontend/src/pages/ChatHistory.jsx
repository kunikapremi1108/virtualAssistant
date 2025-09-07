import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";


function ChatHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState(null);
   const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/user/history", {
          withCredentials: true,
        });
        if (res.data?.history) {
          setHistory(res.data.history);
        }
        if (res.data?.userName) {
          setUserName(res.data.name);
          console.log("User Name:", res.data.name);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-black text-white">
      {/* Header */}
    <button
      onClick={() => navigate("/home")}
      className="fixed top-4 left-4 sm:top-3 sm:left-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-300 ease-in-out z-50  focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    
    >
          <FaArrowLeft className="w-7 h-7" /> 
    </button>
      <header className="p-5 bg-black/40 backdrop-blur-md  shadow-md text-center sticky top-0 z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Chat History</h1>
        {userName && (
          <p className="text-gray-400 mt-1 text-sm">
            Welcome back, <span className="font-semibold text-white">{userName}</span>
          </p>
        )}
      </header>

      {/* Chat messages */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 space-y-6">
        {(() => {
          if (loading) {
            return (
              <p className="text-gray-400 text-center">Loading chat history...</p>
            );
          }
          if (history.length === 0) {
            return (
              <div className="text-center text-gray-400 mt-20">
                <h3 className="text-xl md:text-2xl font-semibold mb-2">
                  No chat history yet
                </h3>
                <p className="text-gray-500">Your past conversations will appear here.</p>
              </div>
            );
          }
          return history.map((entry) => {
            const [timestamp, rest] = entry.split(": User:");
            const [userMessage, assistantMessage] =
              rest?.split("| Assistant:") || [];

            return (
              <div
                key={timestamp}
                className="space-y-3 max-w-2xl mx-auto w-full"
              >
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-[75%] sm:max-w-md px-4 py-3 rounded-2xl bg-blue-600 text-white shadow-lg">
                    <p className="break-words">{userMessage?.trim()}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">
                      {new Date(timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Assistant message */}
                <div className="flex justify-start">
                  <div className="max-w-[75%] sm:max-w-md px-4 py-3 rounded-2xl bg-gray-800 text-gray-100 border border-blue-900 shadow-md">
                    <p className="break-words">{assistantMessage?.trim()}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {new Date(timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Date separator */}
                <p className="text-xs text-gray-500 text-center italic mt-4">
                  {new Date(timestamp).toLocaleDateString()}
                </p>
              </div>
            );
          });
        })()}
      </main>
    </div>
  );
}

export default ChatHistory;
