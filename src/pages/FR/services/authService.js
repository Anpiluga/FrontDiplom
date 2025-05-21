import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Базовый URL API
const API_URL = 'http://localhost:8080';

// Функция для получения токена из localStorage
export const getToken = () => {
    return localStorage.getItem('token');
};

// Функция для проверки валидности токена
export const checkToken = () => {
    const token = getToken();
    if (!token) {
        return false;
    }

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        return !(decoded.exp && decoded.exp < currentTime);
    } catch (error) {
        console.error('Invalid token', error);
        return false;
    }
};

// Функция для настройки общих заголовков авторизации
export const authHeader = () => {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// Функция для выполнения авторизованного запроса
export const authRequest = async (method, url, data = null) => {
    const token = getToken();

    // Проверка наличия токена
    if (!token) {
        throw new Error('Auth token not found');
    }

    // Проверка валидности токена
    if (!checkToken()) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        window.location.href = '/login';
        throw new Error('Token expired');
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    try {
        let response;

        switch (method.toLowerCase()) {
            case 'get':
                response = await axios.get(`${API_URL}${url}`, { headers });
                break;
            case 'post':
                response = await axios.post(`${API_URL}${url}`, data, { headers });
                break;
            case 'put':
                response = await axios.put(`${API_URL}${url}`, data, { headers });
                break;
            case 'delete':
                response = await axios.delete(`${API_URL}${url}`, { headers });
                break;
            default:
                throw new Error(`Unsupported method: ${method}`);
        }

        return response.data;
    } catch (error) {
        // Детальное логирование ошибки
        console.error(`Error in ${method.toUpperCase()} request to ${url}:`, error);
        console.log('Error response:', error.response);
        console.log('Error request:', error.request);

        // Если ответ 403, возможно, проблема с правами доступа или истекшим токеном
        if (error.response && error.response.status === 403) {
            console.warn('Access denied (403 Forbidden). Preserving auth session to retry.');
            // Не делаем немедленный выход, так как возможно проблема только с конкретным запросом
        }

        throw error;
    }
};

// Вспомогательные функции для авторизованных запросов
export const get = (url) => authRequest('get', url);
export const post = (url, data) => authRequest('post', url, data);
export const put = (url, data) => authRequest('put', url, data);
export const del = (url) => authRequest('delete', url);

// Функции аутентификации
export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/sign-in`, { username, password });
        const { token } = response.data;

        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (username, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/sign-up`, { username, email, password });
        const { token } = response.data;

        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('username', username);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
};