import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRole = (r) => {
    if (!r) return "customer";
    r = r.toUpperCase();
    if (r.includes("ADMIN")) return "admin";
    if (r.includes("VENDOR")) return "vendor";
    return "customer"; // Default to customer
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      parsedUser.role = mapRole(parsedUser.role);
      setUser(parsedUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // LoginRequest expects 'username', not 'email'
      const response = await api.post("/auth/login", { username, password });
      const data = response.data;

      const token = data.accessToken || data.token || data.Token;

      const isFlattened = data.username && data.id;
      const backendUser = isFlattened ? data : data.user || data.User;

      if (!token || !backendUser) {
        console.error("Login response missing token or user data:", data);
        throw new Error("Invalid response from server");
      }

      // Normalize user properties
      // Helper to map backend roles to frontend roles
      const mapRole = (r) => {
        if (!r) return "customer";
        r = r.toUpperCase();
        if (r.includes("ADMIN")) return "admin";
        if (r.includes("VENDOR")) return "vendor";
        return "customer"; // Default to customer for ROLE_USER
      };

      const rawRole =
        (backendUser.roles && backendUser.roles[0]) ||
        backendUser.role ||
        backendUser.Role;

      const normalizedUser = {
        name: backendUser.username || backendUser.name || backendUser.Name,
        email: backendUser.email || backendUser.Email,
        role: mapRole(rawRole),
        id: backendUser.id || backendUser.Id,
        isApproved: backendUser.isApproved,
        isSuspended: backendUser.isSuspended,
        location: backendUser.location || backendUser.Location,
      };

      const userData = { ...normalizedUser, token };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (name, email, password, role, location) => {
    try {
      // Register endpoint returns { message: "..." }
      // Backend expects: { username, email, password, role: ["value"], location }
      await api.post("/auth/register", {
        username: name,
        email,
        password,
        role: [role],
        location,
      });
      // Do NOT login automatically. Waiting for OTP verification.
      // return await login(name, password);
      return { success: true, message: "OTP Sent" };
    } catch (error) {
      // Error handling: backend sends { message: "..." } or standard Spring error object
      // Error handling: backend sends { message: "..." } or standard Spring error object with 'errors' array
      let errorMsg = "Registration failed";
      const data = error.response?.data;
      if (data) {
        if (data.message) errorMsg = data.message;
        // Check for Spring Boot validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const validationDetails = data.errors
            .map((err) => err.defaultMessage)
            .join("; ");
          if (validationDetails) errorMsg += `: ${validationDetails}`;
        } else if (typeof data === "string") {
          errorMsg = data;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      console.error("Registration failed:", errorMsg);
      throw new Error(errorMsg);
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const response = await api.post("/auth/verify-otp", { email, otp });
      return response.data;
    } catch (error) {
      console.error(
        "OTP Verification failed:",
        error.response?.data?.message || error.message,
      );
      throw new Error(
        error.response?.data?.message || "OTP Verification failed",
      );
    }
  };

  const resendOtp = async (email) => {
    try {
      const response = await api.post("/auth/resend-otp", { email });
      return response.data;
    } catch (error) {
      console.error(
        "Resend OTP failed:",
        error.response?.data?.message || error.message,
      );
      throw new Error(error.response?.data?.message || "Resend OTP failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, verifyOtp, resendOtp, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
