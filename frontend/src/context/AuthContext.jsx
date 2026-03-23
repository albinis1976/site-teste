import { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService";
import userService from "../services/userService";
import { setAccessToken } from "../services/api";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const refresh = localStorage.getItem("refresh");
      const storedLegacyAccess = localStorage.getItem("access");

      if (storedLegacyAccess) {
        localStorage.removeItem("access");
      }

      if (refresh) {
        try {
          const userData = await userService.getProfile();
          setUser(userData);
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);

      setAccessToken(data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.removeItem("access");

      const userData = await userService.getProfile();
      setUser(userData);
      return { ...data, user: userData };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem("refresh");
    localStorage.removeItem("access");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};