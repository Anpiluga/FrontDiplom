// api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            console.log('401 Unauthorized, attempting to handle...');
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const signIn = async (username, password) => {
    const response = await api.post('/auth/sign-in', { username, password });
    return response.data;
};

export const signUp = async (username, email, password) => {
    const response = await api.post('/auth/sign-up', { username, email, password });
    return response.data;
};

export const getCars = async () => {
    const response = await api.get('/admin/cars');
    return response.data;
};

export const createCar = async (carData) => {
    const response = await api.post('/admin/cars', carData);
    return response.data;
};

export const updateCar = async (id, carData) => {
    const response = await api.put(`/admin/cars/${id}`, carData);
    return response.data;
};

export const deleteCar = async (id) => {
    await api.delete(`/admin/cars/${id}`);
};

export const getDrivers = async () => {
    const response = await api.get('/admin/drivers');
    return response.data;
};

export const createDriver = async (driverData) => {
    const response = await api.post('/admin/drivers', driverData);
    return response.data;
};

export const updateDriver = async (id, driverData) => {
    const response = await api.put(`/admin/drivers/${id}`, driverData);
    return response.data;
};

export const deleteDriver = async (id) => {
    await api.delete(`/admin/drivers/${id}`);
};

export const assignDriver = async (carId, driverId) => {
    const response = await api.post(`/admin/cars/${carId}/assign-driver`, { driverId });
    return response.data;
};

export const unassignDriver = async (carId) => {
    const response = await api.post(`/admin/cars/${carId}/unassign-driver`);
    return response.data;
};