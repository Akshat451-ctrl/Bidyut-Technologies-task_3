import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem("fh_token") || "");
  const [loading, setLoading] = useState(true);

  // Set axios default header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // On mount, fetch user if token exists
  useEffect(() => {
    async function fetchMe() {
      if (!token) { setLoading(false); return; }
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);
      } catch {
        setToken("");
        localStorage.removeItem("fh_token");
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem("fh_token", t);
    axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
  };

  const register = async (name, email, password) => {
    const res = await axios.post("/api/auth/register", { name, email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem("fh_token", t);
    axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("fh_token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateProfile = async (data) => {
    const res = await axios.put("/api/auth/update", data);
    setUser(res.data.user);
    return res.data.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    await axios.put("/api/auth/change-password", { currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
