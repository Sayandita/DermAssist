import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the Context
export const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check localStorage for token on initial load
    // If found, we restore the user state
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, []);

    const API_BASE = import.meta.env.VITE_API_URL || '';

    // Login function
    const login = async (email, password) => {
        try {
            setLoading(true);
            setError(null);

            // Make API call. Vite proxy handles /api
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post(`${API_BASE}/api/auth/login`, { email, password }, config);

            // Save to localStorage and state
            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            setLoading(false);
            return true; // Success
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Invalid email or password');
            return false; // Failure
        }
    };

    // Signup function
    const signup = async (name, email, password) => {
        try {
            setLoading(true);
            setError(null);

            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post(`${API_BASE}/api/auth/signup`, { name, email, password }, config);

            localStorage.setItem('userInfo', JSON.stringify(data));
            setUser(data);
            setLoading(false);
            return true; // Success
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to register account');
            return false; // Failure
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, signup, logout, setError }}>
            {children}
        </AuthContext.Provider>
    );
};
