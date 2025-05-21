import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Создаем экземпляр axios с настроенными параметрами
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    timeout: 10000, // 10 секунд таймаут для запросов
});

// Добавляем перехватчик запросов для автоматической установки токена в заголовке Authorization
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Проверяем валидность токена
                const decoded = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decoded.exp && decoded.exp < currentTime) {
                    console.error('Token expired, cannot proceed with request');
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    window.location.href = '/login';
                    return Promise.reject(new Error('Token expired'));
                }

                config.headers.Authorization = `Bearer ${token}`;
            } catch (error) {
                console.error('Invalid token, removing from storage', error);
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = '/login';
                return Promise.reject(error);
            }
        }
        return config;
    },
    error => Promise.reject(error)
);

// Добавляем перехватчик ответов для обработки ошибок аутентификации
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            const { status } = error.response;

            // Обработка ошибок аутентификации
            if (status === 401 || status === 403) {
                console.warn(`Received ${status} error, redirecting to login`);
                localStorage.removeItem('token');
                localStorage.removeItem('username');

                // Перенаправляем на логин только если это не текущая страница
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;