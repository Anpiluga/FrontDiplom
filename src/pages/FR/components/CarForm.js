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
    FormControlLabel,
    Switch,
    FormControl,
    InputLabel,
    Tabs,
    Tab,
    Paper,
    RadioGroup,
    Radio,
    IconButton,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    Delete,
    Photo,
    Description,
    Settings,
    LocalGasStation,
    DirectionsCar,
    Add,
    CloudUpload,
    Person,
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const CarForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState(0);
    const [drivers, setDrivers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        licensePlate: '',
        vin: '',
        odometr: '',
        fuelConsumption: '',
        status: 'IN_USE',
        driverId: '',
        counterType: 'ODOMETER',
        secondaryCounterEnabled: false,
        secondaryCounterType: 'MOTHOURS',
        fuelType: 'GASOLINE',
        fuelTankVolume: '',
        description: '',
    });

    // Функция для получения заголовков с токеном
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            return null;
        }
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    };

    useEffect(() => {
        const fetchDrivers = async () => {
            setLoading(true);
            try {
                const headers = getAuthHeaders();
                if (!headers) {
                    setError('Ошибка авторизации: токен отсутствует');
                    navigate('/login');
                    return;
                }

                console.log('Fetching drivers with headers:', headers);

                const response = await axios({
                    method: 'get',
                    url: 'http://localhost:8080/admin/drivers',
                    headers: headers,
                    timeout: 10000,
                    validateStatus: (status) => {
                        return status < 500;
                    }
                });

                console.log('Drivers response status:', response.status);
                console.log('Drivers response data:', response.data);

                if (response.status === 403) {
                    console.error('403 error when fetching drivers');
                    setError('У вас нет прав для просмотра списка водителей');
                } else if (response.status === 200) {
                    if (Array.isArray(response.data)) {
                        setDrivers(response.data);
                    } else {
                        setError('Получен неверный формат данных для списка водителей');
                        console.error('Unexpected response format for drivers:', response.data);
                    }
                } else {
                    setError(`Ошибка при получении списка водителей: ${response.status}`);
                }
            } catch (err) {
                console.error('Error fetching drivers:', err);
                if (err.response) {
                    console.log('Error response data:', err.response.data);
                    console.log('Error response status:', err.response.status);
                    console.log('Error response headers:', err.response.headers);

                    if (err.response.status === 403) {
                        setError('Ошибка доступа при загрузке водителей. Проверьте ваши права доступа.');
                    } else if (err.response.status === 401) {
                        setError('Ошибка аутентификации. Пожалуйста, войдите в систему заново.');
                        setTimeout(() => navigate('/login'), 2000);
                    } else {
                        setError(`Ошибка при загрузке водителей: ${err.response.status} ${err.response.statusText}`);
                    }
                } else if (err.request) {
                    console.log('Request:', err.request);
                    setError('Сервер не отвечает. Пожалуйста, проверьте соединение.');
                } else {
                    setError(`Ошибка при инициализации запроса: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchCar = async () => {
            if (id) {
                setLoading(true);
                try {
                    const headers = getAuthHeaders();
                    if (!headers) {
                        setError('Ошибка авторизации: токен отсутствует');
                        navigate('/login');
                        return;
                    }

                    console.log('Fetching car with ID:', id);

                    const response = await fetch(`http://localhost:8080/admin/cars/${id}`, {
                        method: 'GET',
                        headers: headers
                    });

                    console.log('Car response status:', response.status);

                    if (response.ok) {
                        const carData = await response.json();
                        console.log('Car data received:', carData);

                        setFormData({
                            brand: carData.brand || '',
                            model: carData.model || '',
                            year: carData.year || '',
                            licensePlate: carData.licensePlate || '',
                            vin: carData.vin || '',
                            odometr: carData.odometr || '',
                            fuelConsumption: carData.fuelConsumption || '',
                            status: carData.status || 'IN_USE',
                            driverId: carData.driverId || '',
                            counterType: carData.counterType || 'ODOMETER',
                            secondaryCounterEnabled: carData.secondaryCounterEnabled || false,
                            secondaryCounterType: carData.secondaryCounterType || 'MOTHOURS',
                            fuelType: carData.fuelType || 'GASOLINE',
                            fuelTankVolume: carData.fuelTankVolume || '',
                            description: carData.description || '',
                        });
                    } else if (response.status === 403) {
                        console.error('403 error when fetching car');
                        try {
                            const errorData = await response.json();
                            setError(`Ошибка доступа: ${errorData.message || 'У вас нет прав для этой операции'}`);
                        } catch (jsonErr) {
                            setError('Ошибка доступа: у вас нет прав для просмотра этого автомобиля');
                        }
                    } else if (response.status === 401) {
                        setError('Ошибка аутентификации. Пожалуйста, войдите в систему заново.');
                        setTimeout(() => navigate('/login'), 2000);
                    } else {
                        setError(`Ошибка при получении данных автомобиля: ${response.status} ${response.statusText}`);
                    }
                } catch (err) {
                    console.error('Error fetching car:', err);
                    setError(`Ошибка при загрузке автомобиля: ${err.message}`);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchDrivers();
        fetchCar();
    }, [id, navigate]);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleToggleSecondaryCounter = (e) => {
        setFormData((prev) => ({
            ...prev,
            secondaryCounterEnabled: e.target.checked,
        }));
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleDocsChange = (event) => {
        setSelectedDocs([...selectedDocs, ...event.target.files]);
    };

    const handleRemoveDoc = (index) => {
        const newDocs = [...selectedDocs];
        newDocs.splice(index, 1);
        setSelectedDocs(newDocs);
    };

    const handleCounterTypeChange = (type) => {
        setFormData((prev) => ({
            ...prev,
            counterType: type,
        }));
    };

    const handleSecondaryCounterTypeChange = (type) => {
        setFormData((prev) => ({
            ...prev,
            secondaryCounterType: type,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const headers = getAuthHeaders();
            if (!headers) {
                setError('Ошибка авторизации: токен отсутствует');
                navigate('/login');
                return;
            }

            const data = {
                brand: formData.brand,
                model: formData.model,
                year: parseInt(formData.year),
                licensePlate: formData.licensePlate,
                vin: formData.vin,
                odometr: parseInt(formData.odometr),
                fuelConsumption: parseFloat(formData.fuelConsumption),
                status: formData.status,
                counterType: formData.counterType,
                secondaryCounterEnabled: formData.secondaryCounterEnabled,
                secondaryCounterType: formData.secondaryCounterType,
                fuelType: formData.fuelType,
                fuelTankVolume: formData.fuelTankVolume ? parseFloat(formData.fuelTankVolume) : null,
                description: formData.description,
            };

            console.log('Sending request with data:', data);
            console.log('Auth headers:', headers);

            const url = id
                ? `http://localhost:8080/admin/cars/${id}`
                : 'http://localhost:8080/admin/cars';

            const method = id ? 'PUT' : 'POST';

            console.log(`Making ${method} request to ${url}`);

            const response = await fetch(url, {
                method: method,
                headers: headers,
                body: JSON.stringify(data)
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                console.log('Car saved successfully');

                // Если есть водитель для назначения, назначаем его отдельно
                if (formData.driverId) {
                    try {
                        await fetch(`http://localhost:8080/admin/cars/${id || (await response.json()).id}/assign-driver`, {
                            method: 'POST',
                            headers: headers,
                            body: JSON.stringify({ driverId: parseInt(formData.driverId) })
                        });
                    } catch (assignError) {
                        console.error('Error assigning driver:', assignError);
                        setError('Автомобиль сохранен, но произошла ошибка при назначении водителя');
                    }
                }

                navigate('/cars');
            } else if (response.status === 403) {
                try {
                    const errorData = await response.json();
                    setError(`Ошибка доступа: ${errorData.message || 'У вас нет прав для этой операции'}`);
                } catch (jsonErr) {
                    setError('Ошибка доступа: у вас нет прав для сохранения автомобиля');
                }
            } else if (response.status === 401) {
                setError('Ошибка аутентификации. Пожалуйста, войдите в систему заново.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(`Ошибка при сохранении автомобиля: ${response.status} ${response.statusText}`);
            }
        } catch (err) {
            console.error('Error saving car:', err);
            setError(`Ошибка при сохранении автомобиля: ${err.message}`);
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
                    {id ? 'Редактирование автомобиля' : 'Добавление автомобиля'}
                </Typography>

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

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: 'flex',
                    flex: 1,
                    gap: 4,
                    height: 'calc(100% - 100px)',
                    overflowY: 'hidden'
                }}
            >
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

                {/* Основная часть формы */}
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
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Модель автомобиля"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Год выпуска"
                                        name="year"
                                        type="number"
                                        value={formData.year}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Государственный номер"
                                        name="licensePlate"
                                        value={formData.licensePlate}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="VIN номер"
                                        name="vin"
                                        value={formData.vin}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Пробег (км)"
                                        name="odometr"
                                        type="number"
                                        value={formData.odometr}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        sx={{ height: '56px' }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth sx={{ height: '56px' }}>
                                        <InputLabel>Статус автомобиля</InputLabel>
                                        <Select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            label="Статус автомобиля"
                                        >
                                            <MenuItem value="IN_USE">Используется</MenuItem>
                                            <MenuItem value="IN_REPAIR">На ремонте</MenuItem>
                                            <MenuItem value="IN_MAINTENANCE">На обслуживании</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <FormControl
                                        fullWidth
                                        sx={{
                                            height: '56px',
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
                                        <InputLabel>Водитель</InputLabel>
                                        <Select
                                            name="driverId"
                                            value={formData.driverId || ''}
                                            onChange={handleChange}
                                            label="Водитель"
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
                                                formData.driverId ? <Person sx={{ color: '#4caf50', mr: 1 }} /> : null
                                            }
                                        >
                                            <MenuItem value="">
                                                <em>Без водителя</em>
                                            </MenuItem>
                                            {drivers.map((driver) => (
                                                <MenuItem key={driver.id} value={driver.id} sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    py: 1.5
                                                }}>
                                                    <Person sx={{ color: '#4caf50' }} />
                                                    <Typography>{driver.firstName} {driver.lastName} {driver.middleName}</Typography>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Тип счетчика */}
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                                        Счетчик
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
                                        <Box
                                            onClick={() => handleCounterTypeChange('ODOMETER')}
                                            sx={{
                                                border: '1px solid',
                                                borderColor: formData.counterType === 'ODOMETER'
                                                    ? '#ff8c38'
                                                    : 'rgba(255, 255, 255, 0.2)',
                                                borderRadius: '8px',
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: formData.counterType === 'ODOMETER'
                                                    ? 'rgba(255, 140, 56, 0.1)'
                                                    : 'transparent',
                                                minWidth: '180px',
                                            }}
                                        >
                                            <Radio
                                                checked={formData.counterType === 'ODOMETER'}
                                                sx={{ color: formData.counterType === 'ODOMETER' ? '#ff8c38' : undefined }}
                                            />
                                            <Typography>Одометр</Typography>
                                        </Box>

                                        <Box
                                            onClick={() => handleCounterTypeChange('MOTHOURS')}
                                            sx={{
                                                border: '1px solid',
                                                borderColor: formData.counterType === 'MOTHOURS'
                                                    ? '#ff8c38'
                                                    : 'rgba(255, 255, 255, 0.2)',
                                                borderRadius: '8px',
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                backgroundColor: formData.counterType === 'MOTHOURS'
                                                    ? 'rgba(255, 140, 56, 0.1)'
                                                    : 'transparent',
                                                minWidth: '180px',
                                            }}
                                        >
                                            <Radio
                                                checked={formData.counterType === 'MOTHOURS'}
                                                sx={{ color: formData.counterType === 'MOTHOURS' ? '#ff8c38' : undefined }}
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
                                                checked={formData.secondaryCounterEnabled}
                                                onChange={handleToggleSecondaryCounter}
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                                        color: '#4caf50',
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                                        },
                                                    },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                        backgroundColor: '#4caf50',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Typography sx={{ color: formData.secondaryCounterEnabled ? '#4caf50' : undefined }}>
                                                Вкл второй счетчик
                                            </Typography>
                                        }
                                    />
                                </Grid>

                                {/* Второй счетчик (показывается только если включен) */}
                                {formData.secondaryCounterEnabled && (
                                    <Grid item xs={12}>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, ml: 4 }}>
                                            <Box
                                                onClick={() => handleSecondaryCounterTypeChange('ODOMETER')}
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: formData.secondaryCounterType === 'ODOMETER'
                                                        ? '#ff8c38'
                                                        : 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '8px',
                                                    p: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    backgroundColor: formData.secondaryCounterType === 'ODOMETER'
                                                        ? 'rgba(255, 140, 56, 0.1)'
                                                        : 'transparent',
                                                    minWidth: '180px',
                                                }}
                                            >
                                                <Radio
                                                    checked={formData.secondaryCounterType === 'ODOMETER'}
                                                    sx={{ color: formData.secondaryCounterType === 'ODOMETER' ? '#ff8c38' : undefined }}
                                                />
                                                <Typography>Одометр</Typography>
                                            </Box>

                                            <Box
                                                onClick={() => handleSecondaryCounterTypeChange('MOTHOURS')}
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: formData.secondaryCounterType === 'MOTHOURS'
                                                        ? '#ff8c38'
                                                        : 'rgba(255, 255, 255, 0.2)',
                                                    borderRadius: '8px',
                                                    p: 2,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    backgroundColor: formData.secondaryCounterType === 'MOTHOURS'
                                                        ? 'rgba(255, 140, 56, 0.1)'
                                                        : 'transparent',
                                                    minWidth: '180px',
                                                }}
                                            >
                                                <Radio
                                                    checked={formData.secondaryCounterType === 'MOTHOURS'}
                                                    sx={{ color: formData.secondaryCounterType === 'MOTHOURS' ? '#ff8c38' : undefined }}
                                                />
                                                <Typography>Моточасы</Typography>
                                            </Box>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>
                        )}

                        {/* Вкладка "Топливо" */}
                        {activeTab === 1 && (
                            <Grid container spacing={4}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Топливные баки</Typography>
                                    <Box sx={{ display: 'flex', mb: 4, gap: 3, alignItems: 'center' }}>
                                        <FormControl sx={{ minWidth: 220, flex: 1 }}>
                                            <InputLabel>Тип топлива</InputLabel>
                                            <Select
                                                name="fuelType"
                                                value={formData.fuelType || 'GASOLINE'}
                                                onChange={handleChange}
                                                label="Тип топлива"
                                            >
                                                <MenuItem value="GASOLINE">Бензин</MenuItem>
                                                <MenuItem value="DIESEL">Дизель</MenuItem>
                                                <MenuItem value="PROPANE">Пропан</MenuItem>
                                                <MenuItem value="METHANE">Метан</MenuItem>
                                                <MenuItem value="ELECTRICITY">Электричество</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            label="Объем (л)"
                                            name="fuelTankVolume"
                                            type="number"
                                            value={formData.fuelTankVolume}
                                            onChange={handleChange}
                                            variant="outlined"
                                            sx={{ flex: 1 }}
                                        />

                                        <Button
                                            variant="outlined"
                                            color="error"
                                            sx={{
                                                minWidth: '50px',
                                                height: '50px',
                                                borderRadius: '25px',
                                            }}
                                        >
                                            <Delete />
                                        </Button>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        startIcon={<Add />}
                                        sx={{ mb: 5 }}
                                    >
                                        Добавить
                                    </Button>

                                    <Divider sx={{ my: 4 }} />

                                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Средний расход ТС на 100 км</Typography>
                                    <Box sx={{ display: 'flex', mb: 4, gap: 3, alignItems: 'center' }}>
                                        <FormControl sx={{ minWidth: 220, flex: 1 }}>
                                            <InputLabel>Тип топлива</InputLabel>
                                            <Select
                                                name="fuelType"
                                                value={formData.fuelType || 'GASOLINE'}
                                                onChange={handleChange}
                                                label="Тип топлива"
                                                disabled
                                            >
                                                <MenuItem value="GASOLINE">Бензин</MenuItem>
                                                <MenuItem value="DIESEL">Дизель</MenuItem>
                                                <MenuItem value="PROPANE">Пропан</MenuItem>
                                                <MenuItem value="METHANE">Метан</MenuItem>
                                                <MenuItem value="ELECTRICITY">Электричество</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            label="Расход (л/100км)"
                                            name="fuelConsumption"
                                            type="number"
                                            value={formData.fuelConsumption}
                                            onChange={handleChange}
                                            variant="outlined"
                                            required
                                            sx={{ flex: 1 }}
                                        />
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        startIcon={<Add />}
                                        sx={{ mb: 4 }}
                                    >
                                        Добавить
                                    </Button>
                                </Grid>
                            </Grid>
                        )}

                        {/* Вкладка "Дополнительно" */}
                        {activeTab === 2 && (
                            <Grid container spacing={4}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Фотография автомобиля</Typography>

                                    <Box
                                        sx={{
                                            height: '250px',
                                            width: '100%',
                                            border: '2px dashed',
                                            borderColor: 'rgba(255, 140, 56, 0.5)',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            cursor: 'pointer',
                                            mb: 4,
                                            background: selectedFile ?
                                                `url(${URL.createObjectURL(selectedFile)}) no-repeat center/cover` :
                                                'transparent',
                                            position: 'relative',
                                        }}
                                        component="label"
                                    >
                                        {!selectedFile && (
                                            <>
                                                <Photo sx={{ fontSize: 60, color: 'rgba(255, 140, 56, 0.7)' }} />
                                                <Typography variant="body1" sx={{ mt: 2, color: 'rgba(255, 140, 56, 0.7)' }}>
                                                    Нажмите, чтобы загрузить фото
                                                </Typography>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={handleFileChange}
                                        />

                                        {selectedFile && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 12,
                                                    right: 12,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                                    borderRadius: '50%',
                                                    p: 1,
                                                }}
                                            >
                                                <IconButton
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedFile(null);
                                                    }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </Box>

                                    <Typography variant="h6" sx={{ mb: 3, mt: 4, fontWeight: 'bold' }}>Документы</Typography>

                                    <Box sx={{ mb: 4 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<CloudUpload />}
                                            component="label"
                                            sx={{
                                                px: 3,
                                                py: 1.5
                                            }}
                                        >
                                            Выбрать файлы
                                            <input
                                                type="file"
                                                hidden
                                                multiple
                                                onChange={handleDocsChange}
                                            />
                                        </Button>

                                        <Box sx={{ mt: 3 }}>
                                            {selectedDocs.map((doc, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        p: 2,
                                                        border: '1px solid',
                                                        borderColor: 'rgba(255, 255, 255, 0.2)',
                                                        borderRadius: '8px',
                                                        mb: 1.5,
                                                    }}
                                                >
                                                    <Typography variant="body2">{doc.name}</Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveDoc(index)}
                                                    >
                                                        <Delete fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>

                                    <Typography variant="h6" sx={{ mb: 3, mt: 4, fontWeight: 'bold' }}>Описание</Typography>

                                    <TextField
                                        fullWidth
                                        label="Описание автомобиля"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        multiline
                                        rows={6}
                                        variant="outlined"
                                    />
                                </Grid>
                            </Grid>
                        )}
                    </Paper>

                    {/* Кнопки действий */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
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
                                }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : (id ? 'Обновить' : 'Сохранить')}
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/cars')}
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
            </Box>
        </Container>
    );
};

export default CarForm;