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
    Chip,
} from '@mui/material';
import { Assignment, DirectionsCar, Warning, Info } from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const ServiceRecordForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateToken } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        carId: '',
        counterReading: '',
        startDateTime: '',
        plannedEndDateTime: '',
        details: '',
        totalCost: '',
    });
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [validationLoading, setValidationLoading] = useState(false);
    const [odometerValidation, setOdometerValidation] = useState({
        minAllowed: 0,
        isValid: true,
        message: '',
        lastRecord: null
    });

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

        const fetchServiceRecord = async () => {
            if (id) {
                try {
                    const token = localStorage.getItem('token');

                    if (!token) {
                        setError('Ошибка авторизации: токен отсутствует');
                        navigate('/login');
                        return;
                    }

                    const response = await axios.get(`http://localhost:8080/admin/service-records/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    });

                    if (response.data) {
                        // Форматируем дату и время для поля ввода datetime-local
                        const startDateTime = response.data.startDateTime ?
                            new Date(response.data.startDateTime).toISOString().slice(0, 16) :
                            '';
                        const plannedEndDateTime = response.data.plannedEndDateTime ?
                            new Date(response.data.plannedEndDateTime).toISOString().slice(0, 16) :
                            '';

                        setFormData({
                            carId: response.data.carId,
                            counterReading: response.data.counterReading,
                            startDateTime: startDateTime,
                            plannedEndDateTime: plannedEndDateTime,
                            details: response.data.details || '',
                            totalCost: response.data.totalCost || '',
                        });

                        // Загружаем информацию об одометре для выбранного автомобиля
                        if (response.data.carId) {
                            await fetchOdometerInfo(response.data.carId);
                        }
                    } else {
                        setError('Получены некорректные данные от сервера');
                    }
                } catch (err) {
                    console.error('Error fetching service record', err);
                    if (err.response && err.response.status === 403) {
                        setError('Ошибка доступа: у вас нет прав для просмотра этой сервисной записи');
                        setTimeout(() => navigate('/login'), 2000);
                    } else {
                        setError(`Ошибка при загрузке сервисной записи: ${err.message}`);
                    }
                }
            } else {
                // Устанавливаем текущую дату и время для нового ввода
                const now = new Date();
                const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);

                setFormData(prev => ({
                    ...prev,
                    startDateTime: localDateTime,
                }));
            }
        };

        fetchCars();
        fetchServiceRecord();
    }, [id, navigate]);

    // Загружаем информацию об одометре при выборе автомобиля
    const fetchOdometerInfo = async (carId) => {
        if (!carId) {
            setOdometerValidation({
                minAllowed: 0,
                isValid: true,
                message: '',
                lastRecord: null
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/admin/service-records/counter-info/${carId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            setOdometerValidation({
                minAllowed: response.data.minAllowedCounter || 0,
                isValid: true,
                message: `Минимально допустимое значение: ${response.data.minAllowedCounter || 0} км`,
                lastRecord: response.data.lastRecord
            });
        } catch (err) {
            console.error('Error fetching odometer info', err);
            setOdometerValidation({
                minAllowed: 0,
                isValid: true,
                message: 'Не удалось получить информацию об одометре',
                lastRecord: null
            });
        }
    };

    // Валидация показания одометра в реальном времени
    const validateOdometerReading = async (carId, counterReading, startDateTime) => {
        if (!carId || !counterReading || !startDateTime) return;

        setValidationLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Используем тот же эндпоинт валидации, что и для заправок
            const response = await axios.post('http://localhost:8080/admin/fuel-entries/validate-counter', {
                carId: carId,
                counterReading: parseInt(counterReading),
                dateTime: startDateTime
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            setOdometerValidation(prev => ({
                ...prev,
                isValid: response.data.valid,
                message: response.data.message,
                minAllowed: response.data.minAllowedCounter || prev.minAllowed
            }));
        } catch (err) {
            console.error('Error validating odometer reading', err);
            setOdometerValidation(prev => ({
                ...prev,
                isValid: false,
                message: 'Ошибка при валидации показания одометра'
            }));
        } finally {
            setValidationLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Загружаем информацию об одометре при выборе автомобиля
        if (name === 'carId' && value) {
            fetchOdometerInfo(value);
        }

        // Валидируем показание одометра при изменении
        if (name === 'counterReading' || name === 'startDateTime') {
            const carId = name === 'carId' ? value : formData.carId;
            const counterReading = name === 'counterReading' ? value : formData.counterReading;
            const startDateTime = name === 'startDateTime' ? value : formData.startDateTime;

            if (carId && counterReading && startDateTime) {
                // Debounce валидации
                setTimeout(() => {
                    validateOdometerReading(carId, counterReading, startDateTime);
                }, 500);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!odometerValidation.isValid) {
            setError('Некорректное показание одометра. Проверьте введенные данные.');
            return;
        }

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
                counterReading: parseInt(formData.counterReading),
                startDateTime: new Date(formData.startDateTime).toISOString(),
                plannedEndDateTime: formData.plannedEndDateTime ? new Date(formData.plannedEndDateTime).toISOString() : null,
                details: formData.details,
                totalCost: formData.totalCost ? parseFloat(formData.totalCost) : null,
            };

            if (id) {
                await axios.put(`http://localhost:8080/admin/service-records/${id}`, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            } else {
                await axios.post('http://localhost:8080/admin/service-records', data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            }
            navigate('/service-records');
        } catch (err) {
            console.error('Error saving service record', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа: у вас нет прав для сохранения сервисной записи');
                setTimeout(() => navigate('/login'), 2000);
            } else if (err.response && err.response.status === 400) {
                setError(err.response.data.message || 'Ошибка при сохранении сервисной записи');
            } else {
                setError('Ошибка при сохранении сервисной записи');
            }
        } finally {
            setLoading(false);
        }
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
                    {id ? 'Редактировать сервисную запись' : 'Добавить сервисную запись'}
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
                        <Assignment sx={{ fontSize: 32, color: '#ff8c38', mr: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Данные о сервисной записи
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
                                                        {car.licensePlate}
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
                                <Box sx={{ position: 'relative' }}>
                                    <TextField
                                        fullWidth
                                        label="Показание одометра (км)"
                                        name="counterReading"
                                        type="number"
                                        value={formData.counterReading}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        error={!odometerValidation.isValid}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                height: '56px',
                                            }
                                        }}
                                    />
                                    {validationLoading && (
                                        <CircularProgress
                                            size={20}
                                            sx={{
                                                position: 'absolute',
                                                right: 45,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#ff8c38'
                                            }}
                                        />
                                    )}
                                </Box>

                                {/* Информация об одометре */}
                                <Box sx={{ mt: 1 }}>
                                    {odometerValidation.minAllowed > 0 && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Info sx={{ fontSize: 16, color: '#2196f3', mr: 1 }} />
                                            <Typography variant="caption" sx={{ color: '#2196f3' }}>
                                                Минимальное показание одометра: {odometerValidation.minAllowed} км
                                            </Typography>
                                        </Box>
                                    )}

                                    {!odometerValidation.isValid && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                            <Warning sx={{ fontSize: 16, color: '#f44336', mr: 1 }} />
                                            <Typography variant="caption" sx={{ color: '#f44336' }}>
                                                {odometerValidation.message}
                                            </Typography>
                                        </Box>
                                    )}

                                    {odometerValidation.lastRecord && (
                                        <Chip
                                            size="small"
                                            label={`Последняя запись: ${odometerValidation.lastRecord.counter} км (${odometerValidation.lastRecord.type === 'fuel' ? 'заправка' : 'сервис'})`}
                                            sx={{
                                                backgroundColor: 'rgba(118, 255, 122, 0.1)',
                                                color: '#76ff7a',
                                                border: '1px solid rgba(118, 255, 122, 0.3)',
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    )}
                                </Box>
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
                                    label="Дата и время начала работ"
                                    name="startDateTime"
                                    type="datetime-local"
                                    value={formData.startDateTime}
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

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Планируемая дата и время окончания"
                                    name="plannedEndDateTime"
                                    type="datetime-local"
                                    value={formData.plannedEndDateTime}
                                    onChange={handleChange}
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

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Общая стоимость (руб)"
                                    name="totalCost"
                                    type="number"
                                    inputProps={{ step: "0.01" }}
                                    value={formData.totalCost}
                                    onChange={handleChange}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        <Grid item xs={12}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Детали работ"
                                    name="details"
                                    multiline
                                    rows={4}
                                    value={formData.details}
                                    onChange={handleChange}
                                    variant="outlined"
                                    placeholder="Подробное описание выполняемых работ..."
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
                            disabled={!odometerValidation.isValid || loading}
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
                            onClick={() => navigate('/service-records')}
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

export default ServiceRecordForm;