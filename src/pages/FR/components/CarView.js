import React, { useState, useEffect } from 'react';
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
    FormControlLabel,
    Switch,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Paper,
    RadioGroup,
    Radio,
    Divider,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    DirectionsCar,
    LocalGasStation,
    Settings,
    ArrowBack,
    Person,
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

const CarView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [carData, setCarData] = useState({
        brand: '',
        model: '',
        year: '',
        licensePlate: '',
        vin: '',
        odometr: '',
        fuelConsumption: '',
        status: 'IN_USE',
        driverFullName: '',
        counterType: 'ODOMETER',
        secondaryCounterEnabled: false,
        secondaryCounterType: 'MOTHOURS',
        fuelType: 'GASOLINE',
        fuelTankVolume: '',
        description: '',
    });

    useEffect(() => {
        const fetchCar = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Ошибка авторизации: токен отсутствует');
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`http://localhost:8080/admin/cars/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (response.data) {
                    setCarData({
                        brand: response.data.brand || '',
                        model: response.data.model || '',
                        year: response.data.year || '',
                        licensePlate: response.data.licensePlate || '',
                        vin: response.data.vin || '',
                        odometr: response.data.odometr || '',
                        fuelConsumption: response.data.fuelConsumption || '',
                        status: response.data.status || 'IN_USE',
                        driverFullName: response.data.driverFullName || '',
                        counterType: response.data.counterType || 'ODOMETER',
                        secondaryCounterEnabled: response.data.secondaryCounterEnabled || false,
                        secondaryCounterType: response.data.secondaryCounterType || 'MOTHOURS',
                        fuelType: response.data.fuelType || 'GASOLINE',
                        fuelTankVolume: response.data.fuelTankVolume || '',
                        description: response.data.description || '',
                    });
                } else {
                    setError('Получены некорректные данные от сервера');
                }
            } catch (err) {
                console.error('Error fetching car:', err);
                if (err.response?.status === 403) {
                    setError('Ошибка доступа: у вас нет прав для просмотра этого автомобиля');
                    setTimeout(() => navigate('/login'), 2000);
                } else if (err.response?.status === 404) {
                    setError('Автомобиль не найден');
                } else {
                    setError(`Ошибка при загрузке автомобиля: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchCar();
    }, [id, navigate]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'IN_USE':
                return '#4caf50'; // Зеленый
            case 'IN_REPAIR':
                return '#f44336'; // Красный
            case 'IN_MAINTENANCE':
                return '#ff9800'; // Оранжевый
            default:
                return '#9e9e9e'; // Серый
        }
    };

    const getStatusName = (status) => {
        switch (status) {
            case 'IN_USE':
                return 'Используется';
            case 'IN_REPAIR':
                return 'На ремонте';
            case 'IN_MAINTENANCE':
                return 'На обслуживании';
            default:
                return 'Неизвестно';
        }
    };

    const getFuelTypeName = (type) => {
        switch (type) {
            case 'GASOLINE':
                return 'Бензин';
            case 'DIESEL':
                return 'Дизель';
            case 'PROPANE':
                return 'Пропан';
            case 'METHANE':
                return 'Метан';
            case 'ELECTRICITY':
                return 'Электричество';
            default:
                return 'Неизвестно';
        }
    };

    return (
        <Container
            maxWidth={false}
            sx={{
                mt: 6,
                pt: 4,
                px: 4,
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(100vh - 120px)'
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/cars')}
                        sx={{
                            mr: 3,
                            color: '#ff8c38',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 140, 56, 0.1)',
                            },
                        }}
                    >
                        Назад к списку
                    </Button>
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{
                            flex: 1,
                            background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Информация об автомобиле
                    </Typography>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
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

            <Box sx={{
                display: 'flex',
                flex: 1,
                gap: 4,
                height: 'calc(100% - 100px)',
                overflowY: 'hidden'
            }}>
                {/* Боковая панель с вкладками */}
                <Box
                    sx={{
                        width: 250,
                        height: 'auto',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Paper
                        elevation={4}
                        sx={{
                            borderRadius: '16px',
                            background: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(44, 27, 71, 0.9)'
                                    : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <Tabs
                            orientation="vertical"
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{
                                width: '100%',
                                '& .MuiTabs-flexContainer': {
                                    alignItems: 'stretch',
                                }
                            }}
                        >
                            <Tab
                                label="Информация"
                                icon={<DirectionsCar />}
                                sx={{
                                    minHeight: '72px',
                                    padding: '20px 30px',
                                    alignItems: 'flex-start',
                                    '&.Mui-selected': {
                                        color: '#ff8c38',
                                        background: (theme) => theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.1)'
                                            : 'rgba(255, 140, 56, 0.05)'
                                    },
                                    display: 'flex',
                                    gap: 1,
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                }}
                                iconPosition="start"
                            />
                            <Tab
                                label="Топливо"
                                icon={<LocalGasStation />}
                                sx={{
                                    minHeight: '72px',
                                    padding: '20px 30px',
                                    alignItems: 'flex-start',
                                    '&.Mui-selected': {
                                        color: '#ff8c38',
                                        background: (theme) => theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.1)'
                                            : 'rgba(255, 140, 56, 0.05)'
                                    },
                                    display: 'flex',
                                    gap: 1,
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                }}
                                iconPosition="start"
                            />
                            <Tab
                                label="Дополнительно"
                                icon={<Settings />}
                                sx={{
                                    minHeight: '72px',
                                    padding: '20px 30px',
                                    alignItems: 'flex-start',
                                    '&.Mui-selected': {
                                        color: '#ff8c38',
                                        background: (theme) => theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.1)'
                                            : 'rgba(255, 140, 56, 0.05)'
                                    },
                                    display: 'flex',
                                    gap: 1
                                }}
                                iconPosition="start"
                            />
                        </Tabs>
                    </Paper>
                </Box>

                {/* Основная часть с информацией */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Paper
                        elevation={4}
                        sx={{
                            p: 4,
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
                            overflowY: 'auto'
                        }}
                    >
                        {/* Вкладка "Информация" */}
                        {activeTab === 0 && (
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Марка автомобиля"
                                        value={carData.brand}
                                        InputProps={{ readOnly: true }}
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Модель автомобиля"
                                        value={carData.model}
                                        InputProps={{ readOnly: true }}
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Год выпуска"
                                        value={carData.year}
                                        InputProps={{ readOnly: true }}
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Государственный номер"
                                        value={carData.licensePlate}
                                        InputProps={{ readOnly: true }}
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="VIN номер"
                                        value={carData.vin}
                                        InputProps={{ readOnly: true }}
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Пробег (км)"
                                        value={carData.odometr}
                                        InputProps={{ readOnly: true }}
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Статус автомобиля
                                        </Typography>
                                        <Chip
                                            label={getStatusName(carData.status)}
                                            sx={{
                                                backgroundColor: `${getStatusColor(carData.status)}20`,
                                                color: getStatusColor(carData.status),
                                                fontWeight: 'bold',
                                                border: `1px solid ${getStatusColor(carData.status)}`,
                                                fontSize: '16px',
                                                height: '40px',
                                                px: 2
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Водитель
                                        </Typography>
                                        {carData.driverFullName ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Person sx={{ mr: 1, color: '#4caf50' }} />
                                                <Typography sx={{ fontSize: '16px' }}>{carData.driverFullName}</Typography>
                                            </Box>
                                        ) : (
                                            <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                                Не назначен
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* Тип счетчика */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                        Счетчик
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                                        <Box
                                            sx={{
                                                border: '1px solid',
                                                borderColor: carData.counterType === 'ODOMETER'
                                                    ? '#ff8c38'
                                                    : 'rgba(255, 255, 255, 0.2)',
                                                borderRadius: '8px',
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                backgroundColor: carData.counterType === 'ODOMETER'
                                                    ? 'rgba(255, 140, 56, 0.1)'
                                                    : 'transparent',
                                                minWidth: '180px',
                                            }}
                                        >
                                            <Radio
                                                checked={carData.counterType === 'ODOMETER'}
                                                disabled
                                                sx={{ color: carData.counterType === 'ODOMETER' ? '#ff8c38' : undefined }}
                                            />
                                            <Typography>Одометр</Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                border: '1px solid',
                                                borderColor: carData.counterType === 'MOTHOURS'
                                                    ? '#ff8c38'
                                                    : 'rgba(255, 255, 255, 0.2)',
                                                borderRadius: '8px',
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                backgroundColor: carData.counterType === 'MOTHOURS'
                                                    ? 'rgba(255, 140, 56, 0.1)'
                                                    : 'transparent',
                                                minWidth: '180px',
                                            }}
                                        >
                                            <Radio
                                                checked={carData.counterType === 'MOTHOURS'}
                                                disabled
                                                sx={{ color: carData.counterType === 'MOTHOURS' ? '#ff8c38' : undefined }}
                                            />
                                            <Typography>Моточасы</Typography>
                                        </Box>
                                    </Box>
                                </Grid>

                                {/* Переключатель для второго счетчика */}
                                <Grid item xs={12} sx={{ mt: 1 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={carData.secondaryCounterEnabled}
                                                disabled
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        color: '#4caf50',
                                                    },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                        backgroundColor: '#4caf50',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography sx={{ color: carData.secondaryCounterEnabled ? '#4caf50' : undefined }}>
                                                Вкл второй счетчик
                                            </Typography>
                                        }
                                    />
                                </Grid>
                            </Grid>
                        )}

                        {/* Вкладка "Топливо" */}
                        {activeTab === 1 && (
                            <Grid container spacing={4}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Топливные баки</Typography>
                                    <Box sx={{ display: 'flex', mb: 4, gap: 3, alignItems: 'center' }}>
                                        <TextField
                                            label="Тип топлива"
                                            value={getFuelTypeName(carData.fuelType)}
                                            InputProps={{ readOnly: true }}
                                            sx={{ flex: 1 }}
                                        />

                                        <TextField
                                            label="Объем (л)"
                                            value={carData.fuelTankVolume || 'Не указано'}
                                            InputProps={{ readOnly: true }}
                                            sx={{ flex: 1 }}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 4 }} />

                                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Средний расход ТС на 100 км</Typography>
                                    <Box sx={{ display: 'flex', mb: 4, gap: 3, alignItems: 'center' }}>
                                        <TextField
                                            label="Тип топлива"
                                            value={getFuelTypeName(carData.fuelType)}
                                            InputProps={{ readOnly: true }}
                                            sx={{ flex: 1 }}
                                        />

                                        <TextField
                                            label="Расход (л/100км)"
                                            value={carData.fuelConsumption}
                                            InputProps={{ readOnly: true }}
                                            sx={{ flex: 1 }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        )}

                        {/* Вкладка "Дополнительно" */}
                        {activeTab === 2 && (
                            <Grid container spacing={4}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Описание</Typography>

                                    <TextField
                                        fullWidth
                                        label="Описание автомобиля"
                                        value={carData.description || 'Описание отсутствует'}
                                        InputProps={{ readOnly: true }}
                                        multiline
                                        rows={6}
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Container>
    );
};

export default CarView;