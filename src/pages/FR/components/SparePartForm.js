import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    TextField,
    Select,
    MenuItem,
    Button,
    Box,
    Grid,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Divider,
    CircularProgress,
    InputAdornment,
} from '@mui/material';
import { Inventory, Category, Build, Speed, Warning, AttachMoney, Numbers } from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const SparePartForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateToken, isTokenValid, getAuthHeaders } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        manufacturer: '',
        pricePerUnit: '',
        quantity: '',
        unit: '',
        description: '',
        dateTime: '',
        carId: '',
        odometerReading: '',
    });
    const [cars, setCars] = useState([]);
    const [minOdometerReading, setMinOdometerReading] = useState(0);
    const [odometerInfo, setOdometerInfo] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = [
        { value: 'CONSUMABLES', label: 'Расходники' },
        { value: 'OILS', label: 'Масла' },
        { value: 'TECHNICAL_FLUIDS', label: 'Пр. технические жидкости' },
        { value: 'ENGINE_ELEMENTS', label: 'Элементы двигателя' },
        { value: 'ENGINE_FUEL_SYSTEM', label: 'Система питания двигателя' },
        { value: 'ENGINE_EXHAUST_SYSTEM', label: 'Система выпуска газов двигателя' },
        { value: 'COOLING_SYSTEM', label: 'Система охлаждения' },
        { value: 'BODY_ELEMENTS', label: 'Элементы кузова' },
        { value: 'INSTRUMENTS_EQUIPMENT', label: 'Приборы и доп. оборудование' },
        { value: 'ELECTRICAL_EQUIPMENT', label: 'Электрооборудование' },
        { value: 'BRAKES', label: 'Тормоза' },
        { value: 'STEERING', label: 'Рулевое управление' },
        { value: 'WHEELS_HUBS', label: 'Колёса и ступицы' },
        { value: 'SUSPENSION_ELEMENTS', label: 'Элементы подвески' },
        { value: 'FRAME_ELEMENTS', label: 'Элементы рамы' },
        { value: 'TRANSMISSION', label: 'Коробка передач' },
        { value: 'CLUTCH_ELEMENTS', label: 'Элементы сцепления' },
        { value: 'OTHER', label: 'Прочее' },
    ];

    const units = [
        { value: 'PIECES', label: 'шт.' },
        { value: 'LITERS', label: 'л.' },
        { value: 'METERS', label: 'м.' },
        { value: 'RUNNING_METERS', label: 'пог. м.' },
        { value: 'UNITS', label: 'ед.' },
    ];

    // Функция для проверки и обновления токена
    const checkAndUpdateToken = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found in localStorage');
            setError('Ошибка авторизации: токен отсутствует');
            navigate('/login');
            return null;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp && (decoded.exp - 300) < currentTime) {
                console.error('Token expired or will expire soon');
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                setError('Сессия истекла. Пожалуйста, войдите в систему заново.');
                navigate('/login');
                return null;
            }

            console.log('Token is valid. Expires at:', new Date(decoded.exp * 1000));
            return token;
        } catch (error) {
            console.error('Error decoding token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            setError('Ошибка токена авторизации');
            navigate('/login');
            return null;
        }
    };

    // Функция для создания запроса с правильными заголовками
    const createAxiosConfig = (token) => {
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 10000
        };
    };

    // Функция для загрузки автомобилей
    const fetchCars = async () => {
        try {
            const token = checkAndUpdateToken();
            if (!token) return;

            const config = createAxiosConfig(token);
            const response = await axios.get('http://localhost:8080/admin/cars', config);
            setCars(response.data || []);
        } catch (err) {
            console.error('Error fetching cars:', err);
            setCars([]);
        }
    };

    // Функция для получения информации об одометре
    const fetchOdometerInfo = async (carId) => {
        if (!carId) {
            setMinOdometerReading(0);
            setOdometerInfo(null);
            return;
        }

        try {
            const token = checkAndUpdateToken();
            if (!token) return;

            const config = createAxiosConfig(token);

            // Получаем информацию об одометре через API для заправок (они используют тот же сервис валидации)
            const response = await axios.get(`http://localhost:8080/admin/fuel-entries/counter-info/${carId}`, config);

            if (response.data) {
                const minAllowed = response.data.minAllowedCounter || 0;
                setMinOdometerReading(minAllowed);
                setOdometerInfo(response.data);
                console.log('Odometer info for car', carId, ':', response.data);
            }
        } catch (err) {
            console.error('Error fetching odometer info:', err);
            setMinOdometerReading(0);
            setOdometerInfo(null);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    useEffect(() => {
        if (formData.carId) {
            fetchOdometerInfo(formData.carId);
        }
    }, [formData.carId]);

    useEffect(() => {
        const fetchSparePart = async () => {
            if (id) {
                setLoading(true);
                try {
                    const token = checkAndUpdateToken();
                    if (!token) return;

                    console.log('Fetching spare part with id:', id);
                    const config = createAxiosConfig(token);

                    const response = await axios.get(`http://localhost:8080/admin/spare-parts/${id}`, config);

                    console.log('Spare part fetched successfully:', response.data);
                    if (response.data) {
                        const dateTime = response.data.dateTime ?
                            new Date(response.data.dateTime).toISOString().slice(0, 16) :
                            '';

                        setFormData({
                            name: response.data.name || '',
                            category: response.data.category || '',
                            manufacturer: response.data.manufacturer || '',
                            pricePerUnit: response.data.pricePerUnit || '',
                            quantity: response.data.quantity || '',
                            unit: response.data.unit || '',
                            description: response.data.description || '',
                            dateTime: dateTime,
                            carId: response.data.carId || '',
                            odometerReading: response.data.odometerReading || '',
                        });
                    } else {
                        setError('Получены некорректные данные от сервера');
                    }
                } catch (err) {
                    console.error('Error fetching spare part:', err);
                    handleApiError(err, 'загрузке запчасти');
                } finally {
                    setLoading(false);
                }
            } else {
                // Устанавливаем значения по умолчанию для новой записи
                const now = new Date();
                const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);

                setFormData(prev => ({
                    ...prev,
                    category: 'CONSUMABLES',
                    unit: 'PIECES',
                    dateTime: localDateTime,
                }));
            }
        };

        fetchSparePart();
    }, [id, navigate]);

    // Универсальная функция для обработки ошибок API
    const handleApiError = (err, operation) => {
        console.error(`Error during ${operation}:`, err);

        if (err.response) {
            const { status, data, statusText } = err.response;

            switch (status) {
                case 401:
                    setError('Ошибка авторизации. Пожалуйста, войдите в систему заново.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    setTimeout(() => navigate('/login'), 2000);
                    break;

                case 403:
                    const currentToken = localStorage.getItem('token');
                    if (currentToken) {
                        try {
                            const decoded = jwtDecode(currentToken);
                            const currentTime = Date.now() / 1000;

                            if (decoded.exp && decoded.exp < currentTime) {
                                setError('Сессия истекла. Пожалуйста, войдите в систему заново.');
                                localStorage.removeItem('token');
                                localStorage.removeItem('username');
                                setTimeout(() => navigate('/login'), 2000);
                                return;
                            }
                        } catch (decodeError) {
                            console.error('Error decoding token in 403 handler:', decodeError);
                        }
                    }

                    let forbiddenErrorMessage = 'Ошибка доступа: у вас нет прав для выполнения этой операции.';
                    if (operation.includes('сохранении')) {
                        forbiddenErrorMessage += '\n\nВозможные причины:\n• Недостаточно прав для создания/редактирования запчастей\n• Роль пользователя не позволяет выполнить эту операцию\n• Проблемы с сервером авторизации';
                    }
                    forbiddenErrorMessage += '\n\nОбратитесь к администратору системы для получения необходимых прав доступа.';
                    setError(forbiddenErrorMessage);
                    break;

                case 404:
                    if (operation.includes('загрузке')) {
                        setError('Запчасть не найдена');
                    } else {
                        setError('API не найден. Проверьте, что сервер запущен.');
                    }
                    break;

                case 400:
                    const validationErrorMessage = data?.message || data || 'Некорректные данные';
                    setError(`Ошибка валидации: ${validationErrorMessage}`);
                    break;

                case 500:
                    setError('Внутренняя ошибка сервера. Попробуйте позже или обратитесь к администратору.');
                    break;

                default:
                    setError(`Ошибка при ${operation}: ${status} ${statusText || 'Неизвестная ошибка'}`);
            }
        } else if (err.request) {
            setError(`Нет ответа от сервера при ${operation}. Проверьте:\n• Подключение к интернету\n• Доступность сервера (http://localhost:8080)\n• Настройки брандмауэра`);
        } else {
            setError(`Ошибка при ${operation}: ${err.message}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateFormData = () => {
        const errors = [];

        if (!formData.name.trim()) {
            errors.push('Название запчасти обязательно');
        }

        if (!formData.category) {
            errors.push('Категория обязательна');
        }

        if (!formData.manufacturer.trim()) {
            errors.push('Производитель обязателен');
        }

        if (!formData.pricePerUnit || isNaN(parseFloat(formData.pricePerUnit)) || parseFloat(formData.pricePerUnit) <= 0) {
            errors.push('Цена за единицу должна быть положительным числом');
        }

        if (!formData.quantity || isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) <= 0) {
            errors.push('Количество должно быть положительным числом');
        }

        if (!formData.unit) {
            errors.push('Единица измерения обязательна');
        }

        if (!formData.dateTime) {
            errors.push('Дата и время обязательны');
        }

        // Валидация автомобиля и одометра
        if (!formData.carId) {
            errors.push('Выбор автомобиля обязателен');
        }

        if (!formData.odometerReading || isNaN(parseInt(formData.odometerReading))) {
            errors.push('Показание одометра обязательно и должно быть числом');
        } else {
            const odometerValue = parseInt(formData.odometerReading);
            if (odometerValue < 0) {
                errors.push('Показание одометра не может быть отрицательным');
            }
            if (odometerValue < minOdometerReading) {
                errors.push(`Показание одометра не может быть меньше ${minOdometerReading} км`);
            }
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const validationErrors = validateFormData();
            if (validationErrors.length > 0) {
                setError('Пожалуйста, исправьте следующие ошибки:\n• ' + validationErrors.join('\n• '));
                setLoading(false);
                return;
            }

            const token = checkAndUpdateToken();
            if (!token) return;

            const data = {
                name: formData.name.trim(),
                category: formData.category,
                manufacturer: formData.manufacturer.trim(),
                pricePerUnit: parseFloat(formData.pricePerUnit),
                quantity: parseFloat(formData.quantity),
                unit: formData.unit,
                description: formData.description.trim(),
                dateTime: new Date(formData.dateTime).toISOString(),
                carId: parseInt(formData.carId),
                odometerReading: parseInt(formData.odometerReading),
            };

            console.log('Submitting spare part data:', data);

            const config = createAxiosConfig(token);
            let response;

            if (id) {
                console.log(`Updating spare part with id: ${id}`);
                response = await axios.put(`http://localhost:8080/admin/spare-parts/${id}`, data, config);
            } else {
                console.log('Creating new spare part');
                response = await axios.post('http://localhost:8080/admin/spare-parts', data, config);
            }

            console.log('Success response:', response.data);
            navigate('/spare-parts');
        } catch (err) {
            handleApiError(err, id ? 'сохранении изменений запчасти' : 'создании новой запчасти');
        } finally {
            setLoading(false);
        }
    };

    const getTotalSum = () => {
        const price = parseFloat(formData.pricePerUnit) || 0;
        const quantity = parseFloat(formData.quantity) || 0;
        return (price * quantity).toFixed(2);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatOdometerInfo = () => {
        if (!odometerInfo || !odometerInfo.lastRecord || Object.keys(odometerInfo.lastRecord).length === 0) {
            return 'Нет предыдущих записей';
        }

        const lastRecord = odometerInfo.lastRecord;
        const date = new Date(lastRecord.dateTime).toLocaleString('ru-RU');
        const typeLabel = lastRecord.type === 'fuel' ? 'Заправка' : 'Сервис';

        return `${lastRecord.counter} км (${typeLabel}, ${date})`;
    };

    return (
        <Container
            maxWidth={false}
            sx={{
                mt: 6,
                pt: 4,
                px: 4,
                height: 'calc(100vh - 120px)',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    sx={{
                        mb: 4,
                        background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {id ? 'Редактировать запчасть' : 'Добавить запчасть'}
                </Typography>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 4,
                            maxWidth: '900px',
                            mx: 'auto',
                            background: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(211, 47, 47, 0.1)'
                                    : 'rgba(211, 47, 47, 0.2)',
                            color: '#ff6f60',
                            border: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? '1px solid rgba(211, 47, 47, 0.3)'
                                    : '1px solid rgba(211, 47, 47, 0.5)',
                            whiteSpace: 'pre-line'
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <CircularProgress color="primary" />
                    </Box>
                )}
            </motion.div>

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Paper
                    sx={{
                        maxWidth: '1200px',
                        width: '100%',
                        mx: 'auto',
                        p: 5,
                        borderRadius: '16px',
                        border: '2px solid transparent',
                        borderImage: 'linear-gradient(45deg, #ff8c38, #76ff7a) 1',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(44, 27, 71, 0.9)'
                                : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 4
                    }}>
                        <Inventory sx={{ fontSize: 32, color: '#ff8c38', mr: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Данные о запчасти
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Grid container spacing={5} sx={{ flex: 1 }}>
                        {/* Название запчасти */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Название запчасти"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="Введите название запчасти"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Inventory sx={{ color: '#ff8c38' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        {/* Категория */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <FormControl fullWidth required>
                                    <InputLabel>Категория</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        label="Категория"
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Category sx={{ color: '#ff8c38', ml: 1 }} />
                                            </InputAdornment>
                                        }
                                        sx={{
                                            height: '56px',
                                        }}
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.value} value={category.value}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </motion.div>
                        </Grid>

                        {/* Производитель */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Производитель"
                                    name="manufacturer"
                                    value={formData.manufacturer}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="Введите производителя"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Build sx={{ color: '#76ff7a' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        {/* Цена за единицу */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Цена за единицу"
                                    name="pricePerUnit"
                                    type="number"
                                    value={formData.pricePerUnit}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="0.00"
                                    inputProps={{
                                        min: 0,
                                        step: 0.01
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <AttachMoney sx={{ color: '#ff8c38' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                                    }}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        {/* Количество */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Количество"
                                    name="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="0"
                                    inputProps={{
                                        min: 0,
                                        step: 0.01
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Numbers sx={{ color: '#76ff7a' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        {/* Единица измерения */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <FormControl fullWidth>
                                    <InputLabel>Единица измерения</InputLabel>
                                    <Select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        label="Единица измерения"
                                        required
                                        sx={{
                                            height: '56px',
                                        }}
                                    >
                                        {units.map((unit) => (
                                            <MenuItem key={unit.value} value={unit.value}>
                                                {unit.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </motion.div>
                        </Grid>

                        {/* Выбор автомобиля */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <FormControl fullWidth required>
                                    <InputLabel>Автомобиль</InputLabel>
                                    <Select
                                        name="carId"
                                        value={formData.carId}
                                        onChange={handleChange}
                                        label="Автомобиль"
                                        sx={{
                                            height: '56px',
                                        }}
                                    >
                                        <MenuItem value="" disabled>
                                            Выберите автомобиль
                                        </MenuItem>
                                        {cars.map((car) => (
                                            <MenuItem key={car.id} value={car.id}>
                                                {car.brand} {car.model} ({car.licensePlate})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </motion.div>
                        </Grid>

                        {/* Показание одометра */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Показание одометра"
                                    name="odometerReading"
                                    type="number"
                                    value={formData.odometerReading}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    inputProps={{
                                        min: minOdometerReading,
                                        step: 1
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Speed sx={{ color: '#2196f3' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: <InputAdornment position="end">км</InputAdornment>,
                                    }}
                                    helperText={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                            {minOdometerReading > 0 && (
                                                <>
                                                    <Warning sx={{ fontSize: '16px', color: '#ff8c38' }} />
                                                    <Typography variant="caption" sx={{ color: '#ff8c38' }}>
                                                        Минимальное значение: {minOdometerReading} км
                                                    </Typography>
                                                </>
                                            )}
                                            {odometerInfo && (
                                                <>
                                                    <Speed sx={{ fontSize: '16px', color: '#76ff7a', ml: 1 }} />
                                                    <Typography variant="caption" sx={{ color: '#76ff7a' }}>
                                                        Последняя запись: {formatOdometerInfo()}
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>
                                    }
                                    error={formData.odometerReading && parseInt(formData.odometerReading) < minOdometerReading}
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        {/* Дата и время добавления */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Дата и время установки/покупки"
                                    name="dateTime"
                                    type="datetime-local"
                                    value={formData.dateTime}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
                                    helperText="Укажите дату и время установки запчасти или покупки"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        {/* Отображение общей суммы */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.9 }}
                            >
                                <Paper
                                    sx={{
                                        p: 3,
                                        background: 'linear-gradient(45deg, rgba(255, 140, 56, 0.1), rgba(118, 255, 122, 0.1))',
                                        border: '2px solid #ff8c38',
                                        borderRadius: '12px',
                                        textAlign: 'center',
                                        height: '56px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#ff8c38', mb: 0.5 }}>
                                            Общая сумма
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#76ff7a' }}>
                                            {formatCurrency(getTotalSum())}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </motion.div>
                        </Grid>

                        {/* Описание */}
                        <Grid item xs={12}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.0 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Описание"
                                    name="description"
                                    multiline
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    variant="outlined"
                                    placeholder="Дополнительная информация о запчасти, причина замены, особенности установки..."
                                />
                            </motion.div>
                        </Grid>
                    </Grid>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 3 }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={loading}
                            sx={{
                                px: 5,
                                py: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                color: '#1a1a1a',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #76ff7a, #ff8c38)',
                                },
                                '&:disabled': {
                                    background: 'rgba(255, 255, 255, 0.3)',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (id ? 'Обновить' : 'Сохранить')}
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/spare-parts')}
                            disabled={loading}
                            sx={{
                                px: 5,
                                py: 1.5,
                                borderRadius: '12px',
                                borderColor: '#ff8c38',
                                borderWidth: '2px',
                                color: '#ff8c38',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                '&:hover': {
                                    borderWidth: '2px',
                                    borderColor: '#76ff7a',
                                    color: '#76ff7a',
                                },
                                '&:disabled': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                }
                            }}
                        >
                            Отмена
                        </Button>
                    </motion.div>
                </Box>
            </Box>
        </Container>
    );
};

export default SparePartForm;