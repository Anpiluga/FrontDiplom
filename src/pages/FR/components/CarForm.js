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
} from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';

const CarForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: '',
        licensePlate: '',
        driverId: '',
        counterType: 'odometer',
        secondaryCounterEnabled: false,
    });
    const [drivers, setDrivers] = useState([]);
    const [error, setError] = useState('');

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
                    setFormData({
                        brand: response.data.brand,
                        model: response.data.model,
                        year: response.data.year,
                        licensePlate: response.data.licensePlate,
                        driverId: response.data.driverId || '',
                        counterType: response.data.counterType || 'odometer',
                        secondaryCounterEnabled: response.data.secondaryCounterEnabled || false,
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                brand: formData.brand,
                model: formData.model,
                year: parseInt(formData.year),
                licensePlate: formData.licensePlate,
                driverId: formData.driverId ? parseInt(formData.driverId) : null,
                counterType: formData.counterType,
                secondaryCounterEnabled: formData.secondaryCounterEnabled,
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
        <Container maxWidth={false} sx={{ maxWidth: '1600px', mt: 4, pt: 4, px: { xs: 2, sm: 4 } }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    sx={{
                        mb: 6,
                        background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {id ? 'Редактировать автомобиль' : 'Добавить автомобиль'}
                </Typography>
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 4,
                            maxWidth: '800px',
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
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        maxWidth: '1200px',
                        mx: 'auto',
                        p: 4,
                        borderRadius: '12px',
                        border: '2px solid transparent',
                        borderImage: 'linear-gradient(45deg, #ff8c38, #76ff7a) 1',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(44, 27, 71, 0.9)'
                                : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Марка"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{ height: '56px' }}
                                />
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Модель"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{ height: '56px' }}
                                />
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Год"
                                    name="year"
                                    type="number"
                                    value={formData.year}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{ height: '56px' }}
                                />
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Госномер"
                                    name="licensePlate"
                                    value={formData.licensePlate}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{ height: '56px' }}
                                />
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2}}
                            >
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
                                                {driver.firstName} {driver.lastName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2}}
                            >
                                <FormControl fullWidth>
                                    <InputLabel>Тип счётчика</InputLabel>
                                    <Select
                                        name="counterType"
                                        value={formData.counterType}
                                        onChange={handleChange}
                                        label="Тип счётчика"
                                    >
                                        <MenuItem value="odometer">Одометр</MenuItem>
                                        <MenuItem value="motohours">Моточасы</MenuItem>
                                    </Select>
                                </FormControl>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3}}
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.secondaryCounterEnabled}
                                            onChange={handleToggleSecondaryCounter}
                                            color="primary"
                                        />
                                    }
                                    label="Вкл/выкл второй счётчик"
                                />
                            </motion.div>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
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
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #76ff7a, #ff8c38)',
                                            },
                                        }}
                                    >
                                        Сохранить
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
                        </Grid>
                    </Grid>
                </Box>
            </motion.div>
        </Container>
    );
};

export default CarForm;