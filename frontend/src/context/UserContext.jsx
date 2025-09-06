import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

function UserProvider({ children }) {
  // Base URL for API
  const apiBase = "/api";
  const [selectedImage,setSelectedImage]=useState(null)

  const [userData, setUserData] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${apiBase}/user/current`, {
        withCredentials: true,
      });
      setUserData(result.data);
      console.log(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, [])
  

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
