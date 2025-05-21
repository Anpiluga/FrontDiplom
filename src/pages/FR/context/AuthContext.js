import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [darkMode, setDarkMode] = useState(true);

    // Функция для проверки валидности токена
    const isTokenValid = (token) => {
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            // Добавляем небольшой buffer (5 минут) для избежания проблем с синхронизацией времени
            const buffer = 5 * 60; // 5 минут
            const isExpired = decoded.exp && (decoded.exp - buffer) < currentTime;

            if (isExpired) {
                console.log('Token is expired or will expire soon');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Invalid token format:', error);
            return false;
        }
    };

    // Функция для очистки токена и пользователя
    const clearAuth = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');

        if (token && storedUsername) {
            if (isTokenValid(token)) {
                try {
                    const decoded = jwtDecode(token);
                    setUser({
                        username: storedUsername,
                        role: decoded.role,
                        id: decoded.id,
                        email: decoded.email
                    });
                    console.log('User authenticated successfully:', storedUsername);
                } catch (error) {
                    console.error('Error decoding token during initialization:', error);
                    clearAuth();
                }
            } else {
                console.log('Token invalid during initialization, clearing auth');
                clearAuth();
            }
        }
    }, []);

    const login = (token, username) => {
        if (!isTokenValid(token)) {
            console.error('Attempting to login with invalid token');
            return false;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('username', username);

        try {
            const decoded = jwtDecode(token);
            setUser({
                username,
                role: decoded.role,
                id: decoded.id,
                email: decoded.email
            });
            console.log('Login successful for user:', username);
            return true;
        } catch (error) {
            console.error('Invalid token during login:', error);
            clearAuth();
            return false;
        }
    };

    const logout = () => {
        console.log('Logging out user');
        clearAuth();
    };

    const toggleTheme = () => {
        setDarkMode((prevMode) => !prevMode);
    };

    // Функция для проверки и обновления токена
    const updateToken = () => {
        const token = localStorage.getItem('token');
        const storedUsername = localStorage.getItem('username');

        if (token && storedUsername) {
            if (isTokenValid(token)) {
                return token;
            } else {
                console.log('Token expired during update, logging out');
                clearAuth();
                return null;
            }
        }
        return null;
    };

    // Функция для получения авторизационных заголовков
    const getAuthHeaders = () => {
        const token = updateToken();
        if (token) {
            return {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
        }
        return null;
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            darkMode,
            toggleTheme,
            updateToken,
            getAuthHeaders,
            isTokenValid: () => isTokenValid(localStorage.getItem('token'))
        }}>
            {children}
        </AuthContext.Provider>
    );
};