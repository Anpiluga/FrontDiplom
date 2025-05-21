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
    Paper,
    FormControl,
    InputLabel,
    Divider,
} from '@mui/material';
import { LocalGasStation } from '@mui/icons-material';
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

                    // Форматируем дату и время для поля ввода datetime-local
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
                } catch (err) {
                    console.error('Error fetching fuel entry', err);
                    setError('Ошибка при загрузке записи о заправке');
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
                    fuelType: 'GASOLINE' // Установка значения по умолчанию
                }));
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
                                <FormControl fullWidth>
                                    <InputLabel>Автомобиль</InputLabel>
                                    <Select
                                        name="carId"
                                        value={formData.carId || ''}
                                        onChange={handleChange}
                                        label="Автомобиль"
                                        required
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

                        <Grid item xs={12} md={6}>
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
                            {id ? 'Обновить' : 'Сохранить'}
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