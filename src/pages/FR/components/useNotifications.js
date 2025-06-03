import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Функция для получения токена
    const getToken = useCallback(() => {
        return localStorage.getItem('token');
    }, []);

    // Функция для создания заголовков авторизации
    const getAuthHeaders = useCallback(() => {
        const token = getToken();
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : null;
    }, [getToken]);

    // Функция для получения количества непрочитанных уведомлений
    const fetchUnreadCount = useCallback(async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return;

            const response = await axios.get('http://localhost:8080/admin/notifications/count', {
                headers,
                timeout: 5000
            });

            const count = response.data?.count || 0;
            setUnreadCount(count);
            return count;
        } catch (err) {
            console.error('Error fetching unread count:', err);
            return 0;
        }
    }, [getAuthHeaders]);

    // Функция для получения всех уведомлений с фильтрами
    const fetchNotifications = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const headers = getAuthHeaders();
            if (!headers) {
                setError('Ошибка авторизации');
                return [];
            }

            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.type && filters.type !== 'all') params.append('type', filters.type);
            if (filters.status && filters.status !== 'all') params.append('status', filters.status);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);

            const response = await axios.get(
                `http://localhost:8080/admin/notifications?${params.toString()}`,
                { headers, timeout: 10000 }
            );

            const notificationData = response.data || [];
            setNotifications(notificationData);
            setError('');
            return notificationData;
        } catch (err) {
            console.error('Error fetching notifications:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему заново.');
            } else if (err.code === 'ECONNABORTED') {
                setError('Превышено время ожидания ответа от сервера');
            } else {
                setError('Ошибка при загрузке уведомлений');
            }
            return [];
        } finally {
            setLoading(false);
        }
    }, [getAuthHeaders]);

    // Функция для получения статистики уведомлений
    const fetchNotificationStats = useCallback(async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return {};

            const response = await axios.get('http://localhost:8080/admin/notifications/stats', {
                headers,
                timeout: 5000
            });

            return response.data || {};
        } catch (err) {
            console.error('Error fetching notification stats:', err);
            return {};
        }
    }, [getAuthHeaders]);

    // Функция для отметки уведомления как прочитанного
    const markAsRead = useCallback(async (notificationId) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return false;

            await axios.patch(
                `http://localhost:8080/admin/notifications/${notificationId}/read`,
                {},
                { headers, timeout: 5000 }
            );

            // Обновляем локальное состояние
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );

            // Обновляем счетчик
            await fetchUnreadCount();
            return true;
        } catch (err) {
            console.error('Error marking notification as read:', err);
            return false;
        }
    }, [getAuthHeaders, fetchUnreadCount]);

    // Функция для отметки всех уведомлений как прочитанных
    const markAllAsRead = useCallback(async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return false;

            await axios.patch('http://localhost:8080/admin/notifications/read-all', {}, {
                headers,
                timeout: 10000
            });

            // Обновляем локальное состояние
            setNotifications(prev =>
                prev.map(notification => ({ ...notification, read: true }))
            );

            // Обновляем счетчик
            setUnreadCount(0);
            return true;
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            return false;
        }
    }, [getAuthHeaders]);

    // Функция для деактивации уведомления
    const deactivateNotification = useCallback(async (notificationId) => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return false;

            await axios.patch(
                `http://localhost:8080/admin/notifications/${notificationId}/deactivate`,
                {},
                { headers, timeout: 5000 }
            );

            // Удаляем из локального состояния
            setNotifications(prev =>
                prev.filter(notification => notification.id !== notificationId)
            );

            // Обновляем счетчик
            await fetchUnreadCount();
            return true;
        } catch (err) {
            console.error('Error deactivating notification:', err);
            return false;
        }
    }, [getAuthHeaders, fetchUnreadCount]);

    // Функция для принудительной проверки уведомлений на сервере
    const triggerNotificationCheck = useCallback(async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return false;

            const response = await axios.post('http://localhost:8080/admin/notifications/check', {}, {
                headers,
                timeout: 15000
            });

            // После проверки обновляем счетчик
            await fetchUnreadCount();

            return {
                success: true,
                created: response.data?.created || 0,
                message: response.data?.message || 'Проверка завершена'
            };
        } catch (err) {
            console.error('Error triggering notification check:', err);
            return {
                success: false,
                error: 'Ошибка при проверке уведомлений'
            };
        }
    }, [getAuthHeaders, fetchUnreadCount]);

    // Автоматическое обновление счетчика при монтировании компонента
    useEffect(() => {
        const token = getToken();
        if (token) {
            fetchUnreadCount();
        }
    }, [getToken, fetchUnreadCount]);

    // Периодическое обновление счетчика (каждые 2 минуты)
    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 120000); // 2 минуты

        return () => clearInterval(interval);
    }, [getToken, fetchUnreadCount]);

    // Функция для сброса состояния при выходе пользователя
    const resetNotifications = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
        setError('');
        setLoading(false);
    }, []);

    return {
        // Состояние
        notifications,
        unreadCount,
        loading,
        error,

        // Функции
        fetchNotifications,
        fetchUnreadCount,
        fetchNotificationStats,
        markAsRead,
        markAllAsRead,
        deactivateNotification,
        triggerNotificationCheck,
        resetNotifications,

        // Утилиты
        hasUnreadNotifications: unreadCount > 0,
        totalNotifications: notifications.length,
    };
};