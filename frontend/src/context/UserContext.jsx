import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

function UserProvider({ children }) {
  // Base URL for API
const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  const [selectedImage,setSelectedImage]=useState(null)
   const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

 const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${apiBase}/user/current`, {
        withCredentials: true 
      });
      setUserData(result.data);
    } catch (error) {
      // Token invalid or not found → force logout state
      setUserData(null);
      console.error("User not authenticated:", error.response?.data || error.message);
      
    
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    handleCurrentUser();
  }, [])

  if (loading) {
    return <div>Loading...</div>; // show loader until auth check finishes
  }

  

  return (
    <UserContext.Provider
      value={{
        apiBase,
        userData,
        setUserData,
        handleCurrentUser,
        selectedImage,
        setSelectedImage,
        
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
