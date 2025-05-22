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
import { Inventory, Category, Build } from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const SparePartForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateToken } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        manufacturer: '',
        pricePerUnit: '',
        quantity: '',
        unit: '',
        description: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = [
        { value: 'CONSUMABLES', label: 'Расходники' },
        { value: 'OILS', label: 'Масла' },
        { value: 'TECHNICAL_FLUIDS', label: 'Пр. технические жидкости' },
        { value: 'ENGINE_ELEMENTS', label: 'Элементы двигателя' },
        { value: 'ENGINE_FUEL_SYSTEM', label: 'Система питания двигателя' },
        { value: 'ENGINE_EXHAUST_SYSTEM', label: 'Система выпуска газов двигателя' },
        { value: 'COOLING_SYSTEM', label: 'Система охлаждения' },
        { value: 'BODY_ELEMENTS', label: 'Элементы кузова' },
        { value: 'INSTRUMENTS_EQUIPMENT', label: 'Приборы и доп. оборудование' },
        { value: 'ELECTRICAL_EQUIPMENT', label: 'Электрооборудование' },
        { value: 'BRAKES', label: 'Тормоза' },
        { value: 'STEERING', label: 'Рулевое управление' },
        { value: 'WHEELS_HUBS', label: 'Колёса и ступицы' },
        { value: 'SUSPENSION_ELEMENTS', label: 'Элементы подвески' },
        { value: 'FRAME_ELEMENTS', label: 'Элементы рамы' },
        { value: 'TRANSMISSION', label: 'Коробка передач' },
        { value: 'CLUTCH_ELEMENTS', label: 'Элементы сцепления' },
        { value: 'OTHER', label: 'Прочее' },
    ];

    const units = [
        { value: 'PIECES', label: 'шт.' },
        { value: 'LITERS', label: 'л.' },
        { value: 'METERS', label: 'м.' },
        { value: 'RUNNING_METERS', label: 'пог. м.' },
        { value: 'UNITS', label: 'ед.' },
    ];

    useEffect(() => {
        const fetchSparePart = async () => {
            if (id) {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');

                    if (!token) {
                        setError('Ошибка авторизации: токен отсутствует');
                        navigate('/login');
                        return;
                    }

                    const response = await axios.get(`http://localhost:8080/admin/spare-parts/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    });

                    if (response.data) {
                        setFormData({
                            name: response.data.name || '',
                            category: response.data.category || '',
                            manufacturer: response.data.manufacturer || '',
                            pricePerUnit: response.data.pricePerUnit || '',
                            quantity: response.data.quantity || '',
                            unit: response.data.unit || '',
                            description: response.data.description || '',
                        });
                    } else {
                        setError('Получены некорректные данные от сервера');
                    }
                } catch (err) {
                    console.error('Error fetching spare part', err);
                    if (err.response && err.response.status === 403) {
                        setError('Ошибка доступа: у вас нет прав для просмотра этой запчасти');
                        setTimeout(() => navigate('/login'), 2000);
                    } else {
                        setError(`Ошибка при загрузке запчасти: ${err.message}`);
                    }
                } finally {
                    setLoading(false);
                }
            } else {
                // Устанавливаем значения по умолчанию для новой записи
                setFormData(prev => ({
                    ...prev,
                    category: 'CONSUMABLES',
                    unit: 'PIECES'
                }));
            }
        };

        fetchSparePart();
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
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации: токен отсутствует');
                navigate('/login');
                return;
            }

            const data = {
                name: formData.name,
                category: formData.category,
                manufacturer: formData.manufacturer,
                pricePerUnit: parseFloat(formData.pricePerUnit),
                quantity: parseFloat(formData.quantity),
                unit: formData.unit,
                description: formData.description,
            };

            if (id) {
                await axios.put(`http://localhost:8080/admin/spare-parts/${id}`, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            } else {
                await axios.post('http://localhost:8080/admin/spare-parts', data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            }
            navigate('/spare-parts');
        } catch (err) {
            console.error('Error saving spare part', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа: у вас нет прав для сохранения запчасти');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при сохранении запчасти');
            }
        } finally {
            setLoading(false);
        }
    };

    const getTotalSum = () => {
        const price = parseFloat(formData.pricePerUnit) || 0;
        const quantity = parseFloat(formData.quantity) || 0;
        return (price * quantity).toFixed(2);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
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
                    {id ? 'Редактировать запчасть' : 'Добавить запчасть'}
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
                        <Inventory sx={{ fontSize: 32, color: '#ff8c38', mr: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Данные о запчасти
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
                                <TextField
                                    fullWidth
                                    label="Название запчасти"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="например, Масляный фильтр"
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
                                transition={{ duration: 0.5 }}
                            >
                                <FormControl fullWidth>
                                    <InputLabel>Категория</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        label="Категория"
                                        required
                                        sx={{
                                            height: '56px',
                                        }}
                                        startAdornment={
                                            formData.category ? <Category sx={{ color: '#ff8c38', mr: 1 }} /> : null
                                        }
                                    >
                                        {categories.map((category) => (
                                            <MenuItem key={category.value} value={category.value}>
                                                {category.label}
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
                                    label="Производитель"
                                    name="manufacturer"
                                    value={formData.manufacturer}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="например, Bosch"
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
                                    label="Цена за единицу (руб)"
                                    name="pricePerUnit"
                                    type="number"
                                    inputProps={{ step: "0.01", min: "0" }}
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
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Количество"
                                    name="quantity"
                                    type="number"
                                    inputProps={{ step: "0.01", min: "0" }}
                                    value={formData.quantity}
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
                                <FormControl fullWidth>
                                    <InputLabel>Единица измерения</InputLabel>
                                    <Select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleChange}
                                        label="Единица измерения"
                                        required
                                        sx={{
                                            height: '56px',
                                        }}
                                    >
                                        {units.map((unit) => (
                                            <MenuItem key={unit.value} value={unit.value}>
                                                {unit.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </motion.div>
                        </Grid>

                        {/* Отображение общей суммы */}
                        <Grid item xs={12}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <Paper
                                    sx={{
                                        p: 3,
                                        background: 'linear-gradient(45deg, rgba(255, 140, 56, 0.1), rgba(118, 255, 122, 0.1))',
                                        border: '2px solid #ff8c38',
                                        borderRadius: '12px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h6" sx={{ mb: 1, color: '#ff8c38' }}>
                                        Общая сумма
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#76ff7a' }}>
                                        {formatCurrency(getTotalSum())}
                                    </Typography>
                                </Paper>
                            </motion.div>
                        </Grid>

                        <Grid item xs={12}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
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
                                    placeholder="Дополнительная информация о запчасти..."
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
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (id ? 'Обновить' : 'Сохранить')}
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/spare-parts')}
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

export default SparePartForm;