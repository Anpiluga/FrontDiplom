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
    IconButton,
    Divider,
} from '@mui/material';
import {
    Delete,
    Photo,
    Description,
    Settings,
    LocalGasStation,
    DirectionsCar,
    Add,
    CloudUpload
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

const CarForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [drivers, setDrivers] = useState([]);
    const [error, setError] = useState('');
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

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/admin/drivers', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setDrivers(response.data);
            } catch (err) {
                console.error('Error fetching drivers', err);
                setError('Ошибка при загрузке водителей');
            }
        };

        const fetchCar = async () => {
            if (id) {
                try {
                    const response = await axios.get(`http://localhost:8080/admin/cars/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    const carData = response.data;
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
                } catch (err) {
                    console.error('Error fetching car', err);
                    setError('Ошибка при загрузке автомобиля');
                }
            }
        };

        fetchDrivers();
        fetchCar();
    }, [id]);

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
        try {
            const data = {
                brand: formData.brand,
                model: formData.model,
                year: parseInt(formData.year),
                licensePlate: formData.licensePlate,
                vin: formData.vin,
                odometr: parseInt(formData.odometr),
                fuelConsumption: parseFloat(formData.fuelConsumption),
                status: formData.status,
                driverId: formData.driverId ? parseInt(formData.driverId) : null,
                counterType: formData.counterType,
                secondaryCounterEnabled: formData.secondaryCounterEnabled,
                secondaryCounterType: formData.secondaryCounterType,
                fuelType: formData.fuelType,
                fuelTankVolume: formData.fuelTankVolume ? parseFloat(formData.fuelTankVolume) : null,
                description: formData.description,
            };

            if (id) {
                await axios.put(`http://localhost:8080/admin/cars/${id}`, data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
            } else {
                await axios.post('http://localhost:8080/admin/cars', data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
            }
            navigate('/cars');
        } catch (err) {
            console.error('Error saving car', err);
            setError('Ошибка при сохранении автомобиля');
        }
    };

    return (
        <Container
            maxWidth={false}
            sx={{
                mt: 4,
                pt: 4,
                px: 4,
                height: 'calc(100vh - 80px)',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', height: '100%' }}>
                {/* Боковая панель с вкладками */}
                <Box sx={{ width: 250, mr: 3 }}>
                    <Paper
                        elevation={4}
                        sx={{
                            height: '100%',
                            borderRadius: '16px',
                            background: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(44, 27, 71, 0.9)'
                                    : 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <Tabs
                            orientation="vertical"
                            value={activeTab}
                            onChange={handleTabChange}
                            sx={{ borderRight: 1, borderColor: 'divider', height: '100%' }}
                        >
                            <Tab
                                label="Информация"
                                icon={<DirectionsCar />}
                                sx={{
                                    minHeight: '72px',
                                    '&.Mui-selected': {
                                        color: '#ff8c38',
                                    }
                                }}
                                iconPosition="start"
                            />
                            <Tab
                                label="Топливо"
                                icon={<LocalGasStation />}
                                sx={{
                                    minHeight: '72px',
                                    '&.Mui-selected': {
                                        color: '#ff8c38',
                                    }
                                }}
                                iconPosition="start"
                            />
                            <Tab
                                label="Дополнительно"
                                icon={<Settings />}
                                sx={{
                                    minHeight: '72px',
                                    '&.Mui-selected': {
                                        color: '#ff8c38',
                                    }
                                }}
                                iconPosition="start"
                            />
                        </Tabs>
                    </Paper>
                </Box>

                {/* Основная часть формы */}
                <Box sx={{ flexGrow: 1 }}>
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
                                height: 'calc(100% - 120px)',
                                overflow: 'auto',
                            }}
                        >
                            {/* Вкладка "Информация" */}
                            {activeTab === 0 && (
                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            label="Марка автомобиля"
                                            name="brand"
                                            value={formData.brand}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
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
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
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
                                        <FormControl fullWidth>
                                            <InputLabel>Водитель</InputLabel>
                                            <Select
                                                name="driverId"
                                                value={formData.driverId || ''}
                                                onChange={handleChange}
                                                label="Водитель"
                                            >
                                                <MenuItem value="">
                                                    <em>Без водителя</em>
                                                </MenuItem>
                                                {drivers.map((driver) => (
                                                    <MenuItem key={driver.id} value={driver.id}>
                                                        {driver.firstName} {driver.lastName} {driver.middleName}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    {/* Тип счетчика */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                                            Счетчик
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
                                                    minWidth: '150px',
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
                                                    minWidth: '150px',
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
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
                                                        minWidth: '150px',
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
                                                        minWidth: '150px',
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
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Топливные баки</Typography>
                                        <Box sx={{ display: 'flex', mb: 3, gap: 2, alignItems: 'center' }}>
                                            <FormControl sx={{ minWidth: 200 }}>
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
                                                sx={{ width: '150px' }}
                                            />

                                            <Button
                                                variant="outlined"
                                                color="error"
                                                sx={{
                                                    minWidth: '40px',
                                                    height: '40px',
                                                    borderRadius: '20px',
                                                }}
                                            >
                                                <Delete />
                                            </Button>
                                        </Box>

                                        <Button
                                            variant="outlined"
                                            startIcon={<Add />}
                                            sx={{ mb: 4 }}
                                        >
                                            Добавить
                                        </Button>

                                        <Divider sx={{ my: 3 }} />

                                        <Typography variant="h6" sx={{ mb: 2 }}>Средний расход ТС на 100 км</Typography>
                                        <Box sx={{ display: 'flex', mb: 3, gap: 2, alignItems: 'center' }}>
                                            <FormControl sx={{ minWidth: 200 }}>
                                                <InputLabel>Тип топлива</InputLabel>
                                                <Select
                                                    name="fuelType"
                                                    value={formData.fuelType || 'GASOLINE'}
                                                    onChange={handleChange}
                                                    label="Тип топлива"
                                                    disabled  // Disabled because we're reusing the same fuelType
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
                                                sx={{ width: '150px' }}
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
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Typography variant="h6" sx={{ mb: 2 }}>Фотография автомобиля</Typography>

                                        <Box
                                            sx={{
                                                height: '200px',
                                                width: '100%',
                                                border: '2px dashed',
                                                borderColor: 'rgba(255, 140, 56, 0.5)',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                                cursor: 'pointer',
                                                mb: 3,
                                                background: selectedFile ?
                                                    `url(${URL.createObjectURL(selectedFile)}) no-repeat center/cover` :
                                                    'transparent',
                                                position: 'relative',
                                            }}
                                            component="label"
                                        >
                                            {!selectedFile && (
                                                <>
                                                    <Photo sx={{ fontSize: 48, color: 'rgba(255, 140, 56, 0.7)' }} />
                                                    <Typography variant="body1" sx={{ mt: 1, color: 'rgba(255, 140, 56, 0.7)' }}>
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
                                                        bottom: 8,
                                                        right: 8,
                                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                                        borderRadius: '50%',
                                                        p: 0.5,
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

                                        <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Документы</Typography>

                                        <Box sx={{ mb: 3 }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CloudUpload />}
                                                component="label"
                                            >
                                                Выбрать файлы
                                                <input
                                                    type="file"
                                                    hidden
                                                    multiple
                                                    onChange={handleDocsChange}
                                                />
                                            </Button>

                                            <Box sx={{ mt: 2 }}>
                                                {selectedDocs.map((doc, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            p: 1,
                                                            border: '1px solid',
                                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                                            borderRadius: '4px',
                                                            mb: 1,
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

                                        <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Описание</Typography>

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
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '8px',
                                        background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                        color: '#1a1a1a',
                                        fontSize: '16px',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #76ff7a, #ff8c38)',
                                        },
                                    }}
                                >
                                    {id ? 'Обновить' : 'Сохранить'}
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/cars')}
                                    sx={{
                                        px: 4,
                                        py: 1.5,
                                        borderRadius: '8px',
                                        borderColor: '#ff8c38',
                                        color: '#ff8c38',
                                        fontSize: '16px',
                                        '&:hover': {
                                            borderColor: '#76ff7a',
                                            color: '#76ff7a',
                                        },
                                    }}
                                >
                                    Отмена
                                </Button>
                            </motion.div>
                        </Box>
                    </motion.div>
                </Box>
            </Box>
        </Container>
    );
};

export default CarForm;