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
} from '@mui/material';
import { Inventory, Category, Build } from '@mui/icons-material';
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
        dateTime: '', // Добавляем поле dateTime
    });
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

            // Проверяем истек ли токен (с запасом в 5 минут)
            if (decoded.exp && (decoded.exp - 300) < currentTime) {
                console.error('Token expired or will expire soon');
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                setError('Сессия истекла. Пожалуйста, войдите в систему заново.');
                navigate('/login');
                return null;
            }

            // Логируем информацию о токене для отладки
            console.log('Token is valid. Expires at:', new Date(decoded.exp * 1000));
            console.log('Current time:', new Date());
            console.log('Token payload:', decoded);

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
            timeout: 10000 // 10 секунд таймаут
        };
    };

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
                        // Обрабатываем dateTime для отображения в форме
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
                    dateTime: localDateTime, // Устанавливаем текущую дату/время
                }));
            }
        };

        fetchSparePart();
    }, [id, navigate]);

    // Универсальная функция для обработки ошибок API
    const handleApiError = (err, operation) => {
        console.error(`Error during ${operation}:`, err);
        console.error('Error response:', err.response);
        console.error('Error request:', err.request);

        if (err.response) {
            const { status, data, statusText } = err.response;
            console.error('Response status:', status);
            console.error('Response data:', data);
            console.error('Response headers:', err.response.headers);

            switch (status) {
                case 401:
                    setError('Ошибка авторизации. Пожалуйста, войдите в систему заново.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    setTimeout(() => navigate('/login'), 2000);
                    break;

                case 403:
                    console.error('403 Forbidden error details:', {
                        url: err.config?.url,
                        method: err.config?.method,
                        headers: err.config?.headers,
                        data: err.config?.data
                    });

                    // Проверяем, не истек ли токен
                    const currentToken = localStorage.getItem('token');
                    if (currentToken) {
                        try {
                            const decoded = jwtDecode(currentToken);
                            const currentTime = Date.now() / 1000;
                            console.log('Token check for 403:', {
                                exp: decoded.exp,
                                currentTime,
                                expired: decoded.exp && decoded.exp < currentTime,
                                role: decoded.role,
                                username: decoded.sub || decoded.username
                            });

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

                    // Более детальное сообщение об ошибке 403
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
            console.error('No response received:', err.request);
            setError(`Нет ответа от сервера при ${operation}. Проверьте:\n• Подключение к интернету\n• Доступность сервера (http://localhost:8080)\n• Настройки брандмауэра`);
        } else {
            console.error('Request setup error:', err.message);
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

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Очищаем предыдущие ошибки

        try {
            // Валидация данных
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
                dateTime: new Date(formData.dateTime).toISOString(), // Преобразуем в ISO формат
            };

            console.log('Submitting spare part data:', data);
            console.log('Using token:', token.substring(0, 20) + '...');

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
                            whiteSpace: 'pre-line' // Позволяет отображать переносы строк
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
                                    placeholder="например, Масляный фильтр"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <FormControl fullWidth>
                                    <InputLabel>Категория</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        label="Категория"
                                        required
                                        sx={{
                                            height: '56px',
                                        }}
                                        startAdornment={
                                            formData.category ? <Category sx={{ color: '#ff8c38', mr: 1 }} /> : null
                                        }
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

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Производитель"
                                    name="manufacturer"
                                    value={formData.manufacturer}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="например, Bosch"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Цена за единицу (руб)"
                                    name="pricePerUnit"
                                    type="number"
                                    inputProps={{ step: "0.01", min: "0" }}
                                    value={formData.pricePerUnit}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Количество"
                                    name="quantity"
                                    type="number"
                                    inputProps={{ step: "0.01", min: "0" }}
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
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

                        {/* Добавляем поле для даты и времени */}
                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Дата и время добавления"
                                    name="dateTime"
                                    type="datetime-local"
                                    value={formData.dateTime}
                                    onChange={handleChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                    variant="outlined"
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
                                transition={{ duration: 0.5, delay: 0.3 }}
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

                        <Grid item xs={12}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
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
                                    placeholder="Дополнительная информация о запчасти..."
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