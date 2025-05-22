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
} from '@mui/material';
import { Assignment, DirectionsCar } from '@mui/icons-material';
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
        startDate: '',
        plannedEndDate: '',
        details: '',
        totalCost: '',
    });
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');

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
                        setFormData({
                            carId: response.data.carId,
                            counterReading: response.data.counterReading,
                            startDate: response.data.startDate,
                            plannedEndDate: response.data.plannedEndDate || '',
                            details: response.data.details || '',
                            totalCost: response.data.totalCost || '',
                        });
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
                // Устанавливаем текущую дату для нового ввода
                const today = new Date().toISOString().split('T')[0];
                setFormData(prev => ({
                    ...prev,
                    startDate: today,
                }));
            }
        };

        fetchCars();
        fetchServiceRecord();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                startDate: formData.startDate,
                plannedEndDate: formData.plannedEndDate || null,
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
            } else {
                setError('Ошибка при сохранении сервисной записи');
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
                                <TextField
                                    fullWidth
                                    label="Показание счётчика"
                                    name="counterReading"
                                    type="number"
                                    value={formData.counterReading}
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
                                    label="Дата начала работ"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
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
                                    label="Планируемая дата окончания"
                                    name="plannedEndDate"
                                    type="date"
                                    value={formData.plannedEndDate}
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