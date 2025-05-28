import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Tabs,
    Tab,
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    LineChart,
    Line,
    Area,
    AreaChart
} from 'recharts';
import {
    Analytics as AnalyticsIcon,
    TrendingUp,
    LocalGasStation,
    Build,
    Inventory,
    CurrencyRuble,
    DirectionsCar,
    Speed
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Analytics = () => {
    const navigate = useNavigate();
    const [totalData, setTotalData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [carExpenses, setCarExpenses] = useState(null);
    const [costPerKm, setCostPerKm] = useState(null);
    const [cars, setCars] = useState([]); // Инициализируем пустым массивом
    const [selectedCar, setSelectedCar] = useState('');
    const [monthsBack, setMonthsBack] = useState(6);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const COLORS = ['#ff8c38', '#76ff7a', '#2196f3', '#ff6b6b', '#9c27b0', '#ff9800'];

    useEffect(() => {
        fetchCars();
        fetchAnalytics();
    }, []);

    useEffect(() => {
        if (selectedCar) {
            fetchCarAnalytics();
        }
    }, [selectedCar, monthsBack]);

    const fetchCars = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации');
                navigate('/login');
                return;
            }

            console.log('Fetching cars for analytics...');
            const response = await axios.get('http://localhost:8080/admin/cars', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Cars response:', response.data);
            // Убеждаемся, что устанавливаем массив
            setCars(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error('Error fetching cars:', err);
            setCars([]); // Устанавливаем пустой массив в случае ошибки
        }
    };

    const fetchAnalytics = async (customMonthsBack = null) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации');
                navigate('/login');
                return;
            }

            console.log('Fetching analytics data...');

            // Используем переданное значение или текущее состояние
            const actualMonthsBack = customMonthsBack !== null ? customMonthsBack : monthsBack;

            // Получаем общую статистику
            const totalResponse = await axios.get('http://localhost:8080/admin/analytics/total-expenses', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Total expenses response:', totalResponse.data);

            // Получаем месячную статистику с актуальным значением
            const monthlyResponse = await axios.get(`http://localhost:8080/admin/analytics/monthly-expenses?monthsBack=${actualMonthsBack}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Monthly expenses response:', monthlyResponse.data);

            setTotalData(totalResponse.data);
            setMonthlyData(monthlyResponse.data);
            setError(''); // Очищаем ошибки при успешной загрузке
        } catch (err) {
            console.error('Error fetching analytics:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему заново.');
                navigate('/login');
            } else {
                setError('Ошибка при загрузке аналитики');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCarAnalytics = async () => {
        if (!selectedCar) return;

        try {
            const token = localStorage.getItem('token');

            console.log('Fetching car analytics for car:', selectedCar);

            // Получаем расходы по автомобилю
            const expensesResponse = await axios.get(`http://localhost:8080/admin/analytics/car/${selectedCar}/expenses`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Car expenses response:', expensesResponse.data);

            // Получаем стоимость километра
            const costPerKmResponse = await axios.get(`http://localhost:8080/admin/analytics/car/${selectedCar}/cost-per-km`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Cost per km response:', costPerKmResponse.data);

            setCarExpenses(expensesResponse.data);
            setCostPerKm(costPerKmResponse.data);
        } catch (err) {
            console.error('Error fetching car analytics:', err);
            setError('Ошибка при загрузке аналитики автомобиля');
        }
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) {
            return '0 ₽';
        }
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(44, 27, 71, 0.95)',
                    border: '1px solid #ff8c38',
                    borderRadius: '8px',
                    padding: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                }}>
                    <p style={{ color: '#fff', margin: '0 0 5px 0' }}>{`${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color, margin: '2px 0' }}>
                            {`${entry.name}: ${formatCurrency(entry.value)}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Безопасное создание данных для круговой диаграммы
    const pieData = totalData && totalData.totalCosts > 0 ? [
        { name: 'Топливо', value: totalData.fuelCosts || 0, percentage: totalData.fuelPercentage || 0 },
        { name: 'Сервис', value: totalData.serviceCosts || 0, percentage: totalData.servicePercentage || 0 },
        { name: 'Запчасти', value: totalData.sparePartsCosts || 0, percentage: totalData.sparePartsPercentage || 0 },
        { name: 'Доп расходы', value: totalData.additionalCosts || 0, percentage: totalData.additionalPercentage || 0 },
    ].filter(item => item.value > 0) : [];

    // Безопасное создание данных для месячного графика
    const monthlyChartData = React.useMemo(() => {
        if (!monthlyData || !monthlyData.months || !Array.isArray(monthlyData.months)) {
            return [];
        }

        return monthlyData.months.map((month, index) => ({
            month,
            total: (monthlyData.totalExpenses && monthlyData.totalExpenses[index]) || 0,
            fuel: (monthlyData.fuelExpenses && monthlyData.fuelExpenses[index]) || 0,
            service: (monthlyData.serviceExpenses && monthlyData.serviceExpenses[index]) || 0,
            spareParts: (monthlyData.sparePartsExpenses && monthlyData.sparePartsExpenses[index]) || 0,
            additional: (monthlyData.additionalExpenses && monthlyData.additionalExpenses[index]) || 0,
        }));
    }, [monthlyData]);

    // Безопасное создание данных для круговой диаграммы автомобиля
    const carPieData = carExpenses && carExpenses.totalCosts > 0 ? [
        { name: 'Топливо', value: carExpenses.fuelCosts || 0, percentage: carExpenses.fuelPercentage || 0 },
        { name: 'Сервис', value: carExpenses.serviceCosts || 0, percentage: carExpenses.servicePercentage || 0 },
        { name: 'Доп расходы', value: carExpenses.additionalCosts || 0, percentage: carExpenses.additionalPercentage || 0 },
    ].filter(item => item.value > 0) : [];

    // Создание данных для барного графика автомобиля (убираем запчасти)
    const carBarData = carExpenses ? [{
        name: 'Расходы',
        fuel: carExpenses.fuelCosts || 0,
        service: carExpenses.serviceCosts || 0,
        additional: carExpenses.additionalCosts || 0,
    }] : [];

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress color="primary" size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>Загрузка аналитики...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, pt: 4, px: 4 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
                    <AnalyticsIcon sx={{ fontSize: 40, color: '#ff8c38', mr: 2 }} />
                    <Typography
                        variant="h4"
                        sx={{
                            background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold'
                        }}
                    >
                        Анализ расходов
                    </Typography>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 4,
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

                {/* Навигация по вкладкам */}
                <Paper sx={{ mb: 6, borderRadius: '16px' }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        centered
                        sx={{
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#ff8c38',
                            },
                            '& .Mui-selected': {
                                color: '#ff8c38 !important',
                            },
                        }}
                    >
                        <Tab label="Общая статистика" />
                        <Tab label="Анализ по автомобилям" />
                    </Tabs>
                </Paper>

                {/* Общая статистика */}
                {activeTab === 0 && (
                    <Box>
                        {/* Фильтры */}
                        <Paper sx={{ p: 4, mb: 6, borderRadius: '16px' }}>
                            <Typography variant="h6" sx={{ mb: 4, color: '#ff8c38', fontWeight: 'bold' }}>
                                Настройки анализа
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Количество месяцев</InputLabel>
                                        <Select
                                            value={monthsBack}
                                            onChange={(e) => {
                                                const newMonthsBack = e.target.value;
                                                setMonthsBack(newMonthsBack);
                                                // Немедленно загружаем данные с новым значением
                                                fetchAnalytics(newMonthsBack);
                                            }}
                                            label="Количество месяцев"
                                        >
                                            <MenuItem value={3}>3 месяца</MenuItem>
                                            <MenuItem value={6}>6 месяцев</MenuItem>
                                            <MenuItem value={12}>12 месяцев</MenuItem>
                                            <MenuItem value={24}>24 месяца</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Общие карточки статистики */}
                        {totalData && (
                            <Grid container spacing={4} sx={{ mb: 8 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ background: 'linear-gradient(45deg, rgba(255, 140, 56, 0.1), rgba(118, 255, 122, 0.1))', border: '1px solid #ff8c38', borderRadius: '16px' }}>
                                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <TrendingUp sx={{ fontSize: 40, color: '#ff8c38', mb: 2 }} />
                                            <Typography variant="h6" sx={{ color: '#ff8c38', mb: 1 }}>Общие затраты</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#76ff7a' }}>
                                                {formatCurrency(totalData.totalCosts || 0)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ background: 'linear-gradient(45deg, rgba(255, 140, 56, 0.1), rgba(255, 140, 56, 0.2))', border: '1px solid #ff8c38', borderRadius: '16px' }}>
                                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <LocalGasStation sx={{ fontSize: 40, color: '#ff8c38', mb: 2 }} />
                                            <Typography variant="h6" sx={{ color: '#ff8c38', mb: 1 }}>Топливо</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {formatCurrency(totalData.fuelCosts || 0)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {(totalData.fuelPercentage || 0).toFixed(1)}%
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ background: 'linear-gradient(45deg, rgba(118, 255, 122, 0.1), rgba(118, 255, 122, 0.2))', border: '1px solid #76ff7a', borderRadius: '16px' }}>
                                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <Build sx={{ fontSize: 40, color: '#76ff7a', mb: 2 }} />
                                            <Typography variant="h6" sx={{ color: '#76ff7a', mb: 1 }}>Сервис</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {formatCurrency(totalData.serviceCosts || 0)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {(totalData.servicePercentage || 0).toFixed(1)}%
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card sx={{ background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.2))', border: '1px solid #2196f3', borderRadius: '16px' }}>
                                        <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                            <Inventory sx={{ fontSize: 40, color: '#2196f3', mb: 2 }} />
                                            <Typography variant="h6" sx={{ color: '#2196f3', mb: 1 }}>Запчасти</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {formatCurrency(totalData.sparePartsCosts || 0)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {(totalData.sparePartsPercentage || 0).toFixed(1)}%
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}

                        {/* Основной график месячной статистики */}
                        {monthlyChartData.length > 0 && (
                            <Paper sx={{ p: 4, mb: 8, borderRadius: '16px', background: 'rgba(44, 27, 71, 0.9)', border: '1px solid rgba(255, 140, 56, 0.3)' }}>
                                <Typography variant="h5" sx={{ mb: 4, color: '#ff8c38', fontWeight: 'bold', textAlign: 'center' }}>
                                    Расходы по месяцам
                                </Typography>
                                <ResponsiveContainer width="100%" height={450}>
                                    <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" stroke="#fff" fontSize={14} />
                                        <YAxis stroke="#fff" tickFormatter={formatCurrency} fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="fuel" stackId="a" fill="#ff8c38" name="Топливо" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="service" stackId="a" fill="#76ff7a" name="Сервис" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="spareParts" stackId="a" fill="#2196f3" name="Запчасти" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="additional" stackId="a" fill="#ff6b6b" name="Доп расходы" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        )}

                        {/* Круговая диаграмма */}
                        {pieData.length > 0 && (
                            <Paper sx={{ p: 4, mb: 8, borderRadius: '16px', background: 'rgba(44, 27, 71, 0.9)', border: '1px solid rgba(255, 140, 56, 0.3)', maxWidth: '800px', mx: 'auto' }}>
                                <Typography variant="h5" sx={{ mb: 4, color: '#ff8c38', fontWeight: 'bold', textAlign: 'center' }}>
                                    Структура затрат
                                </Typography>
                                <ResponsiveContainer width="100%" height={500}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={150}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                                            labelLine={false}
                                            fontSize={14}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        )}

                        {/* Линейный график общих расходов */}
                        {monthlyChartData.length > 0 && (
                            <Paper sx={{ p: 4, borderRadius: '16px', background: 'rgba(44, 27, 71, 0.9)', border: '1px solid rgba(255, 140, 56, 0.3)' }}>
                                <Typography variant="h5" sx={{ mb: 4, color: '#ff8c38', fontWeight: 'bold', textAlign: 'center' }}>
                                    Тренд общих расходов
                                </Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <AreaChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" stroke="#fff" fontSize={14} />
                                        <YAxis stroke="#fff" tickFormatter={formatCurrency} fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="total" stroke="#ff8c38" fill="rgba(255, 140, 56, 0.3)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Paper>
                        )}

                        {/* Сообщение, если нет данных */}
                        {(!totalData || (totalData.totalCosts === 0)) && (
                            <Paper sx={{
                                p: 6,
                                textAlign: 'center',
                                background: 'rgba(44, 27, 71, 0.9)',
                                border: '1px solid rgba(255, 140, 56, 0.3)',
                                borderRadius: '16px'
                            }}>
                                <Typography variant="h5" sx={{ color: '#ff8c38', mb: 2 }}>
                                    Нет данных для отображения
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                    Начните добавлять расходы, чтобы увидеть статистику
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                )}

                {/* Анализ по автомобилям */}
                {activeTab === 1 && (
                    <Box>
                        {/* Выбор автомобиля */}
                        <Paper sx={{ p: 4, mb: 6, borderRadius: '16px' }}>
                            <Typography variant="h6" sx={{ mb: 4, color: '#ff8c38', fontWeight: 'bold' }}>
                                Выберите автомобиль для анализа
                            </Typography>
                            <FormControl fullWidth sx={{ maxWidth: '500px' }}>
                                <InputLabel>Автомобиль</InputLabel>
                                <Select
                                    value={selectedCar}
                                    onChange={(e) => setSelectedCar(e.target.value)}
                                    label="Автомобиль"
                                >
                                    {Array.isArray(cars) && cars.map((car) => (
                                        <MenuItem key={car.id} value={car.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <DirectionsCar sx={{ mr: 1, color: '#ff8c38' }} />
                                                {car.brand} {car.model} ({car.licensePlate})
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Paper>

                        {selectedCar && carExpenses && (
                            <Box>
                                {/* Карточки статистики автомобиля */}
                                <Grid container spacing={4} sx={{ mb: 8 }}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Card sx={{ background: 'linear-gradient(45deg, rgba(255, 140, 56, 0.1), rgba(118, 255, 122, 0.1))', border: '1px solid #ff8c38', borderRadius: '16px' }}>
                                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                                <TrendingUp sx={{ fontSize: 40, color: '#ff8c38', mb: 2 }} />
                                                <Typography variant="h6" sx={{ color: '#ff8c38', mb: 1 }}>Общие затраты</Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#76ff7a' }}>
                                                    {formatCurrency(carExpenses.totalCosts || 0)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <Card sx={{ background: 'linear-gradient(45deg, rgba(255, 140, 56, 0.1), rgba(255, 140, 56, 0.2))', border: '1px solid #ff8c38', borderRadius: '16px' }}>
                                            <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                                <LocalGasStation sx={{ fontSize: 40, color: '#ff8c38', mb: 2 }} />
                                                <Typography variant="h6" sx={{ color: '#ff8c38', mb: 1 }}>Топливо</Typography>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                    {formatCurrency(carExpenses.fuelCosts || 0)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        {costPerKm && !costPerKm.error && (
                                            <Card sx={{ background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.2))', border: '1px solid #2196f3', borderRadius: '16px' }}>
                                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                                    <Speed sx={{ fontSize: 40, color: '#9c27b0', mb: 2 }} />
                                                    <Typography variant="h6" sx={{ color: '#9c27b0', mb: 1 }}>Пробег</Typography>
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                        {costPerKm.currentOdometer || 0} км
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        {costPerKm && !costPerKm.error && (
                                            <Card sx={{ background: 'linear-gradient(45deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.2))', border: '1px solid #4caf50', borderRadius: '16px' }}>
                                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                                    <CurrencyRuble sx={{ fontSize: 40, color: '#4caf50', mb: 2 }} />
                                                    <Typography variant="h6" sx={{ color: '#4caf50', mb: 1 }}>Стоимость 1 км пути</Typography>
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                        {costPerKm.costPerKm ? `${costPerKm.costPerKm.toFixed(2)} ₽` : '0 ₽'}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </Grid>
                                </Grid>

                                {/* Графики автомобиля в одну строку */}
                                <Grid container spacing={3} sx={{ mb: 8, justifyContent: 'center' }}>
                                    {/* График структуры расходов автомобиля */}
                                    <Grid item xs={12} lg={6}>
                                        <Paper sx={{ p: 3, borderRadius: '16px', background: 'rgba(44, 27, 71, 0.9)', border: '1px solid rgba(255, 140, 56, 0.3)', height: '480px' }}>
                                            <Typography variant="h6" sx={{ mb: 3, color: '#ff8c38', fontWeight: 'bold', textAlign: 'center' }}>
                                                Структура расходов автомобиля
                                            </Typography>
                                            <ResponsiveContainer width="100%" height={380}>
                                                <BarChart data={carBarData} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                    <XAxis
                                                        dataKey="name"
                                                        stroke="#fff"
                                                        fontSize={12}
                                                        tick={false}
                                                    />
                                                    <YAxis stroke="#fff" tickFormatter={formatCurrency} fontSize={10} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Legend
                                                        wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                                                        iconType="rect"
                                                    />
                                                    <Bar dataKey="fuel" fill="#ff8c38" name="Топливо" />
                                                    <Bar dataKey="service" fill="#76ff7a" name="Сервис" />
                                                    <Bar dataKey="additional" fill="#ff6b6b" name="Доп расходы" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </Paper>
                                    </Grid>

                                    {/* Круговая диаграмма автомобиля */}
                                    <Grid item xs={12} lg={6}>
                                        {carPieData.length > 0 && (
                                            <Paper sx={{ p: 3, borderRadius: '16px', background: 'rgba(44, 27, 71, 0.9)', border: '1px solid rgba(255, 140, 56, 0.3)', height: '480px' }}>
                                                <Typography variant="h6" sx={{ mb: 3, color: '#ff8c38', fontWeight: 'bold', textAlign: 'center' }}>
                                                    Распределение затрат
                                                </Typography>
                                                <ResponsiveContainer width="100%" height={380}>
                                                    <PieChart>
                                                        <Pie
                                                            data={carPieData}
                                                            cx="50%"
                                                            cy="50%"
                                                            outerRadius={120}
                                                            fill="#8884d8"
                                                            dataKey="value"
                                                            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                                                            labelLine={false}
                                                            fontSize={12}
                                                        >
                                                            {carPieData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Paper>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {selectedCar && !carExpenses && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <CircularProgress color="primary" size={60} />
                                <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                                    Загрузка данных об автомобиле...
                                </Typography>
                            </Box>
                        )}

                        {!selectedCar && (
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <DirectionsCar sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
                                <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                                    Выберите автомобиль для просмотра аналитики
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </motion.div>
        </Container>
    );
};

export default Analytics;