import React, { createContext, useContext, useState } from 'react';

// Create a context for user authentication and role
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

// UserProvider component that provides the context values
export const UserProvider = ({ children }) => {
  const [auth, setAuth] = useState(false);  // Authentication status
  const [role, setRole] = useState(null);  // User role (client or doctor)

  // Function to log in the user and set role
  const login = (role) => {
    setAuth(true);
    setRole(role);
  };

  // Function to log out the user
  const logout = () => {
    setAuth(false);
    setRole(null);
  };

  return (
    <UserContext.Provider value={{ auth, role, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
