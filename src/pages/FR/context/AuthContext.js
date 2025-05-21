import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [darkMode, setDarkMode] = useState(true); // Добавляем состояние темы

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');
        if (token && storedUsername) {
            try {
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;
                if (decoded.exp && decoded.exp < currentTime) {
                    console.log('Token expired, logging out');
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    setUser(null);
                } else {
                    setUser({ username: storedUsername, role: decoded.role });
                }
            } catch (error) {
                console.error('Invalid token', error);
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                setUser(null);
            }
        }
    }, []);

    const login = (token, username) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        try {
            const decoded = jwtDecode(token);
            setUser({ username, role: decoded.role });
        } catch (error) {
            console.error('Invalid token during login', error);
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
    };

    const toggleTheme = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, darkMode, toggleTheme }}>
            {children}
        </AuthContext.Provider>
    );
};