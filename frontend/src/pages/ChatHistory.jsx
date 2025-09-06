import React, { useEffect, useState } from "react";
import axios from "axios";

function ChatHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const[userName,setUserName]=useState(null)

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
    <div className="min-h-screen  h-[100vh] bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex text-white">
      {/* Header */}
      <div className="p-6 border-b border-white/10 text-center">
        <h1 className="text-4xl font-bold">Chat History</h1>
      </div>
       <br />
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {(() => {
          if (loading) {
            return (
              <p className="text-gray-400 text-center">Loading chat history...</p>
            );
          }
          if (history.length === 0) {
            return (
              <div className="text-center text-gray-400 mt-20">
                <h3 className="text-2xl mb-4">No chat history yet</h3>
                <p>Your past conversations will appear here.</p>
              </div>
            );
          }
          return history.map((entry) => {
            // Parse each entry
            const [timestamp, rest] = entry.split(": User:");
            const [userMessage, assistantMessage] =
              rest?.split("| Assistant:") || [];

            // Use timestamp as key (assuming it's unique)
            return (
              <div key={timestamp} className="space-y-2">
                {/* User message */}
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-blue-600 text-white shadow-md">
                    <p>{userMessage?.trim()}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Assistant message */}
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-white/10 text-white backdrop-blur-sm border border-white/20 shadow-md">
                    <p>{assistantMessage?.trim()}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Date separator */}
                <p className="text-xs text-gray-500 text-center italic mt-2">
                  {new Date(timestamp).toLocaleDateString()}
                </p>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
}

export default ChatHistory;
