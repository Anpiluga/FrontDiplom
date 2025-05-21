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
} from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';

const FuelForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await axios.get('http://localhost:8080/admin/cars', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setCars(response.data);
            } catch (err) {
                console.error('Error fetching cars', err);
                setError('Ошибка при загрузке автомобилей');
            }
        };

        const fetchFuelEntry = async () => {
            if (id) {
                try {
                    const response = await axios.get(`http://localhost:8080/admin/fuel-entries/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    setFormData({
                        carId: response.data.carId,
                        odometerReading: response.data.odometerReading,
                        gasStation: response.data.gasStation,
                        fuelType: response.data.fuelType,
                        volume: response.data.volume,
                        pricePerUnit: response.data.pricePerUnit,
                        totalCost: response.data.totalCost,
                        dateTime: response.data.dateTime.slice(0, 16),
                    });
                } catch (err) {
                    console.error('Error fetching fuel entry', err);
                    setError('Ошибка при загрузке записи о заправке');
                }
            }
        };

        fetchCars();
        fetchFuelEntry();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'volume' || name === 'pricePerUnit') {
            const volume = name === 'volume' ? value : formData.volume;
            const pricePerUnit = name === 'pricePerUnit' ? value : formData.pricePerUnit;
            if (volume && pricePerUnit) {
                setFormData((prev) => ({
                    ...prev,
                    totalCost: (parseFloat(volume) * parseFloat(pricePerUnit)).toFixed(2),
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
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
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
            } else {
                await axios.post('http://localhost:8080/admin/fuel-entries', data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
            }
            navigate('/fuel');
        } catch (err) {
            console.error('Error saving fuel entry', err);
            setError('Ошибка при сохранении записи о заправке');
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
                    {id ? 'Редактировать заправку' : 'Добавить заправку'}
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
                                <Select
                                    fullWidth
                                    name="carId"
                                    value={formData.carId || ''}
                                    onChange={handleChange}
                                    displayEmpty
                                    required
                                    sx={{
                                        height: '56px',
                                        '& .MuiSelect-select': {
                                            padding: '16.5px 14px',
                                        },
                                    }}
                                >
                                    <MenuItem value="" disabled>
                                        Выберите автомобиль
                                    </MenuItem>
                                    {cars.map((car) => (
                                        <MenuItem key={car.id} value={car.id}>
                                            {car.brand} {car.model}
                                        </MenuItem>
                                    ))}
                                </Select>
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
                                    label="Одометр (км)"
                                    name="odometerReading"
                                    type="number"
                                    value={formData.odometerReading}
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
                                    label="Заправка"
                                    name="gasStation"
                                    value={formData.gasStation}
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
                                <Select
                                    fullWidth
                                    name="fuelType"
                                    value={formData.fuelType}
                                    onChange={handleChange}
                                    displayEmpty
                                    required
                                    sx={{
                                        height: '56px',
                                        '& .MuiSelect-select': {
                                            padding: '16.5px 14px',
                                        },
                                    }}
                                >
                                    <MenuItem value="" disabled>
                                        Выберите тип топлива
                                    </MenuItem>
                                    <MenuItem value="GASOLINE">Бензин</MenuItem>
                                    <MenuItem value="DIESEL">ДТ</MenuItem>
                                    <MenuItem value="PROPANE">Пропан</MenuItem>
                                    <MenuItem value="METHANE">Метан</MenuItem>
                                    <MenuItem value="ELECTRICITY">Электричество</MenuItem>
                                </Select>
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                                    step="0.01"
                                    value={formData.volume}
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
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Цена за ед. (руб)"
                                    name="pricePerUnit"
                                    type="number"
                                    step="0.01"
                                    value={formData.pricePerUnit}
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
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Сумма (руб)"
                                    name="totalCost"
                                    type="number"
                                    step="0.01"
                                    value={formData.totalCost}
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                    sx={{ height: '56px' }}
                                />
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                    sx={{ height: '56px' }}
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
                                        onClick={() => navigate('/fuel')}
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

export default FuelForm;