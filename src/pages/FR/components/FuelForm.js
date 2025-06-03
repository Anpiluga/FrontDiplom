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
import { LocalGasStation, DirectionsCar, Warning, Info } from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const FuelForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateToken } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        carId: '',
        odometerReading: '',
        gasStation: '',
        fuelType: '',
        volume: '',
        pricePerUnit: '',
        totalCost: '',
        dateTime: '',
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

        const fetchFuelEntry = async () => {
            if (id) {
                try {
                    const token = localStorage.getItem('token');

                    if (!token) {
                        setError('Ошибка авторизации: токен отсутствует');
                        navigate('/login');
                        return;
                    }

                    const response = await axios.get(`http://localhost:8080/admin/fuel-entries/${id}`, {
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
                            carId: response.data.carId,
                            odometerReading: response.data.odometerReading,
                            gasStation: response.data.gasStation,
                            fuelType: response.data.fuelType,
                            volume: response.data.volume,
                            pricePerUnit: response.data.pricePerUnit,
                            totalCost: response.data.totalCost,
                            dateTime: dateTime,
                        });

                        // Загружаем информацию об одометре для выбранного автомобиля
                        if (response.data.carId) {
                            await fetchOdometerInfo(response.data.carId);
                        }
                    } else {
                        setError('Получены некорректные данные от сервера');
                    }
                } catch (err) {
                    console.error('Error fetching fuel entry', err);
                    if (err.response && err.response.status === 403) {
                        setError('Ошибка доступа: у вас нет прав для просмотра этой заправки');
                        setTimeout(() => navigate('/login'), 2000);
                    } else {
                        setError(`Ошибка при загрузке записи о заправке: ${err.message}`);
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
                    dateTime: localDateTime,
                    fuelType: 'GASOLINE'
                }));
            }
        };

        fetchCars();
        fetchFuelEntry();
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
            const response = await axios.get(`http://localhost:8080/admin/fuel-entries/counter-info/${carId}`, {
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
    const validateOdometerReading = async (carId, odometerReading, dateTime) => {
        if (!carId || !odometerReading || !dateTime) return;

        setValidationLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/admin/fuel-entries/validate-counter', {
                carId: carId,
                counterReading: parseInt(odometerReading),
                dateTime: dateTime
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

        // Автоматический расчет общей стоимости при изменении объема или цены
        if (name === 'volume' || name === 'pricePerUnit') {
            const volume = name === 'volume' ? value : formData.volume;
            const pricePerUnit = name === 'pricePerUnit' ? value : formData.pricePerUnit;

            if (volume && pricePerUnit) {
                const total = (parseFloat(volume) * parseFloat(pricePerUnit)).toFixed(2);
                setFormData((prev) => ({
                    ...prev,
                    totalCost: total,
                }));
            }
        }

        // Загружаем информацию об одометре при выборе автомобиля
        if (name === 'carId' && value) {
            fetchOdometerInfo(value);
        }

        // Валидируем показание одометра при изменении
        if (name === 'odometerReading' || name === 'dateTime') {
            const carId = name === 'carId' ? value : formData.carId;
            const odometerReading = name === 'odometerReading' ? value : formData.odometerReading;
            const dateTime = name === 'dateTime' ? value : formData.dateTime;

            if (carId && odometerReading && dateTime) {
                // Debounce валидации
                setTimeout(() => {
                    validateOdometerReading(carId, odometerReading, dateTime);
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

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации: токен отсутствует');
                navigate('/login');
                return;
            }

            const data = {
                carId: parseInt(formData.carId),
                odometerReading: parseInt(formData.odometerReading),
                gasStation: formData.gasStation,
                fuelType: formData.fuelType,
                volume: parseFloat(formData.volume),
                pricePerUnit: parseFloat(formData.pricePerUnit),
                totalCost: parseFloat(formData.totalCost),
                dateTime: new Date(formData.dateTime).toISOString(),
            };

            if (id) {
                await axios.put(`http://localhost:8080/admin/fuel-entries/${id}`, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            } else {
                await axios.post('http://localhost:8080/admin/fuel-entries', data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            }
            navigate('/fuel');
        } catch (err) {
            console.error('Error saving fuel entry', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа: у вас нет прав для сохранения заправки');
                setTimeout(() => navigate('/login'), 2000);
            } else if (err.response && err.response.status === 400) {
                setError(err.response.data.message || 'Ошибка при сохранении записи о заправке');
            } else {
                setError('Ошибка при сохранении записи о заправке');
            }
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
                    {id ? 'Редактировать заправку' : 'Добавить заправку'}
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
                        <LocalGasStation sx={{ fontSize: 32, color: '#ff8c38', mr: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Данные о заправке
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
                                        name="odometerReading"
                                        type="number"
                                        value={formData.odometerReading}
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
                                    label="Название заправки"
                                    name="gasStation"
                                    value={formData.gasStation}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="например, Лукойл"
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
                                <FormControl fullWidth>
                                    <InputLabel>Тип топлива</InputLabel>
                                    <Select
                                        name="fuelType"
                                        value={formData.fuelType || 'GASOLINE'}
                                        onChange={handleChange}
                                        label="Тип топлива"
                                        required
                                        sx={{
                                            height: '56px',
                                        }}
                                    >
                                        <MenuItem value="GASOLINE">Бензин</MenuItem>
                                        <MenuItem value="DIESEL">ДТ</MenuItem>
                                        <MenuItem value="PROPANE">Пропан</MenuItem>
                                        <MenuItem value="METHANE">Метан</MenuItem>
                                        <MenuItem value="ELECTRICITY">Электричество</MenuItem>
                                    </Select>
                                </FormControl>
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
                                    label="Объём (л)"
                                    name="volume"
                                    type="number"
                                    inputProps={{ step: "0.01" }}
                                    value={formData.volume}
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
                                <TextField
                                    fullWidth
                                    label="Цена за единицу (руб)"
                                    name="pricePerUnit"
                                    type="number"
                                    inputProps={{ step: "0.01" }}
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
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Общая стоимость (руб)"
                                    name="totalCost"
                                    type="number"
                                    inputProps={{ step: "0.01", readOnly: true }}
                                    value={formData.totalCost}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                            backgroundColor: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(0, 0, 0, 0.05)',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
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
                            onClick={() => navigate('/fuel')}
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

export default FuelForm;