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
import { AttachMoney, DirectionsCar } from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const AdditionalExpenseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateToken } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        carId: '',
        type: '',
        price: '',
        dateTime: '',
        description: '',
    });
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [minOdometerInfo, setMinOdometerInfo] = useState(null);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Ошибка авторизации: токен отсутствует');
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:8080/admin/cars', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
                setCars(response.data);
            } catch (err) {
                console.error('Error fetching cars', err);
                if (err.response?.status === 403) {
                    setError('Ошибка доступа при загрузке автомобилей. Проверьте ваши права доступа.');
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setError('Ошибка при загрузке автомобилей. Пожалуйста, попробуйте снова позже.');
                }
            }
        };

        const fetchExpense = async () => {
            if (id) {
                try {
                    const token = localStorage.getItem('token');

                    if (!token) {
                        setError('Ошибка авторизации: токен отсутствует');
                        navigate('/login');
                        return;
                    }

                    const response = await axios.get(`http://localhost:8080/admin/additional-expenses/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    });

                    if (response.data) {
                        const dateTime = response.data.dateTime ?
                            new Date(response.data.dateTime).toISOString().slice(0, 16) :
                            '';

                        setFormData({
                            carId: response.data.carId || '',
                            type: response.data.type || '',
                            price: response.data.price || '',
                            dateTime: dateTime,
                            description: response.data.description || '',
                        });

                        // Загружаем информацию об одометре для выбранного автомобиля
                        if (response.data.carId) {
                            fetchOdometerInfo(response.data.carId);
                        }
                    } else {
                        setError('Получены некорректные данные от сервера');
                    }
                } catch (err) {
                    console.error('Error fetching additional expense', err);
                    if (err.response && err.response.status === 403) {
                        setError('Ошибка доступа: у вас нет прав для просмотра этого расхода');
                        setTimeout(() => navigate('/login'), 2000);
                    } else {
                        setError(`Ошибка при загрузке расхода: ${err.message}`);
                    }
                }
            } else {
                const now = new Date();
                const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);

                setFormData(prev => ({
                    ...prev,
                    dateTime: localDateTime,
                }));
            }
        };

        fetchCars();
        fetchExpense();
    }, [id, navigate]);

    const fetchOdometerInfo = async (carId) => {
        if (!carId) {
            setMinOdometerInfo(null);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Получаем информацию о минимальном показании одометра
            const response = await axios.get(`http://localhost:8080/admin/fuel-entries/counter-info/${carId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            console.log('Odometer info response:', response.data);
            setMinOdometerInfo(response.data);
        } catch (err) {
            console.error('Error fetching odometer info:', err);
            setMinOdometerInfo(null);
        }
    };

    const handleCarChange = (carId) => {
        setFormData(prev => ({ ...prev, carId }));
        fetchOdometerInfo(carId);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'carId') {
            handleCarChange(value);
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации: токен отсутствует');
                navigate('/login');
                return;
            }

            const data = {
                carId: parseInt(formData.carId),
                type: formData.type,
                price: parseFloat(formData.price),
                dateTime: new Date(formData.dateTime).toISOString(),
                description: formData.description,
            };

            if (id) {
                await axios.put(`http://localhost:8080/admin/additional-expenses/${id}`, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            } else {
                await axios.post('http://localhost:8080/admin/additional-expenses', data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            }
            navigate('/additional-expenses');
        } catch (err) {
            console.error('Error saving additional expense', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа: у вас нет прав для сохранения расхода');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при сохранении расхода');
            }
        } finally {
            setLoading(false);
        }
    };

    const expenseTypes = [
        'Штраф',
        'Страховка',
        'Техосмотр',
        'Транспортный налог',
        'Парковка',
        'Мойка',
        'Комиссия банка',
        'Прочее'
    ];

    const getSelectedCarDetails = () => {
        if (!formData.carId) return null;
        const selectedCar = cars.find(car => car.id.toString() === formData.carId.toString());
        return selectedCar;
    };

    const selectedCar = getSelectedCarDetails();

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
                    {id ? 'Редактировать расход' : 'Добавить расход'}
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
                        <AttachMoney sx={{ fontSize: 32, color: '#ff8c38', mr: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Данные о расходе
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
                                <FormControl
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '56px',
                                            background: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(0, 0, 0, 0.05)',
                                        },
                                        '& .MuiSelect-select': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }
                                    }}
                                >
                                    <InputLabel>Автомобиль</InputLabel>
                                    <Select
                                        name="carId"
                                        value={formData.carId || ''}
                                        onChange={handleChange}
                                        label="Автомобиль"
                                        required
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 300,
                                                    background: (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(44, 27, 71, 0.95)'
                                                            : 'rgba(255, 255, 255, 0.95)',
                                                    backdropFilter: 'blur(10px)',
                                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
                                                }
                                            }
                                        }}
                                        startAdornment={
                                            formData.carId ? <DirectionsCar sx={{ color: '#ff8c38', mr: 1 }} /> : null
                                        }
                                    >
                                        <MenuItem value="" disabled>
                                            Выберите автомобиль
                                        </MenuItem>
                                        {cars.map((car) => (
                                            <MenuItem
                                                key={car.id}
                                                value={car.id}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    py: 1.5
                                                }}
                                            >
                                                <DirectionsCar sx={{ color: '#ff8c38' }} />
                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Typography sx={{ fontWeight: 'bold' }}>{car.brand} {car.model}</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        {car.licensePlate} • Одометр: {car.odometr || 0} км
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <FormControl fullWidth>
                                    <InputLabel>Тип расхода</InputLabel>
                                    <Select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        label="Тип расхода"
                                        required
                                        sx={{
                                            height: '56px',
                                        }}
                                    >
                                        {expenseTypes.map((type) => (
                                            <MenuItem key={type} value={type}>
                                                {type}
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
                                    label="Сумма (руб)"
                                    name="price"
                                    type="number"
                                    inputProps={{ step: "0.01", min: "0" }}
                                    value={formData.price}
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
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Дата и время"
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

                        {/* Информация об одометре */}
                        {selectedCar && (
                            <Grid item xs={12}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <Paper
                                        sx={{
                                            p: 3,
                                            background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.2))',
                                            border: '1px solid #2196f3',
                                            borderRadius: '12px',
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ color: '#2196f3', mb: 2, fontWeight: 'bold' }}>
                                            Информация об одометре
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={4}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Текущий одометр:
                                                </Typography>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                    {selectedCar.odometr || 0} км
                                                </Typography>
                                            </Grid>
                                            {minOdometerInfo && (
                                                <Grid item xs={12} md={4}>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                        Последнее зафиксированное показание:
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {minOdometerInfo.minAllowedCounter || 0} км
                                                    </Typography>
                                                </Grid>
                                            )}
                                            <Grid item xs={12} md={4}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Примечание:
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#ff9800' }}>
                                                    Дополнительные расходы не требуют указания одометра
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
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
                                    placeholder="Дополнительная информация о расходе..."
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
                            onClick={() => navigate('/additional-expenses')}
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

export default AdditionalExpenseForm;