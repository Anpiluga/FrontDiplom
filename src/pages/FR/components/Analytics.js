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
    const [cars, setCars] = useState([]);
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

            const response = await axios.get('http://localhost:8080/admin/cars', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCars(response.data || []);
        } catch (err) {
            console.error('Error fetching cars:', err);
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации');
                navigate('/login');
                return;
            }

            // Получаем общую статистику
            const totalResponse = await axios.get('http://localhost:8080/admin/analytics/total-expenses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Получаем месячную статистику
            const monthlyResponse = await axios.get(`http://localhost:8080/admin/analytics/monthly-expenses?monthsBack=${monthsBack}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setTotalData(totalResponse.data);
            setMonthlyData(monthlyResponse.data);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Ошибка при загрузке аналитики');
        } finally {
            setLoading(false);
        }
    };

    const fetchCarAnalytics = async () => {
        if (!selectedCar) return;

        try {
            const token = localStorage.getItem('token');

            // Получаем расходы по автомобилю
            const expensesResponse = await axios.get(`http://localhost:8080/admin/analytics/car/${selectedCar}/expenses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Получаем стоимость километра
            const costPerKmResponse = await axios.get(`http://localhost:8080/admin/analytics/car/${selectedCar}/cost-per-km`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setCarExpenses(expensesResponse.data);
            setCostPerKm(costPerKmResponse.data);
        } catch (err) {
            console.error('Error fetching car analytics:', err);
            setError('Ошибка при загрузке аналитики автомобиля');
        }
    };

    const formatCurrency = (value) => {
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

    const pieData = totalData ? [
        { name: 'Топливо', value: totalData.fuelCosts, percentage: totalData.fuelPercentage },
        { name: 'Сервис', value: totalData.serviceCosts, percentage: totalData.servicePercentage },
        { name: 'Запчасти', value: totalData.sparePartsCosts, percentage: totalData.sparePartsPercentage },
        { name: 'Доп расходы', value: totalData.additionalCosts, percentage: totalData.additionalPercentage },
    ].filter(item => item.value > 0) : [];

    const monthlyChartData = monthlyData ? monthlyData.months.map((month, index) => ({
        month,
        total: monthlyData.totalExpenses[index],
        fuel: monthlyData.fuelExpenses[index],
        service: monthlyData.serviceExpenses[index],
        spareParts: monthlyData.sparePartsExpenses[index],
        additional: monthlyData.additionalExpenses[index],
    })) : [];

    const carPieData = carExpenses ? [
        { name: 'Топливо', value: carExpenses.fuelCosts, percentage: carExpenses.fuelPercentage },
        { name: 'Сервис', value: carExpenses.serviceCosts, percentage: carExpenses.servicePercentage },
        { name: 'Запчасти', value: carExpenses.sparePartsCosts, percentage: carExpenses.sparePartsPercentage },
        { name: 'Доп расходы', value: carExpenses.additionalCosts, percentage: carExpenses.additionalPercentage },
    ].filter(item => item.value > 0) : [];

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
                                                setMonthsBack(e.target.value);
                                                fetchAnalytics();
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
                                                {formatCurrency(totalData.totalCosts)}
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
                                                {formatCurrency(totalData.fuelCosts)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {totalData.fuelPercentage.toFixed(1)}%
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
                                                {formatCurrency(totalData.serviceCosts)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {totalData.servicePercentage.toFixed(1)}%
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
                                                {formatCurrency(totalData.sparePartsCosts)}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {totalData.sparePartsPercentage.toFixed(1)}%
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}

                        {/* Основной график месячной статистики - на всю ширину */}
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

                        {/* Круговая диаграмма */}
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

                        {/* Линейный график общих расходов */}
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
                                    {cars.map((car) => (
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
                                                    {formatCurrency(carExpenses.totalCosts)}
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
                                                    {formatCurrency(carExpenses.fuelCosts)}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    {costPerKm && !costPerKm.error && (
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Card sx={{ background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.2))', border: '1px solid #2196f3', borderRadius: '16px' }}>
                                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                                    <Speed sx={{ fontSize: 40, color: '#2196f3', mb: 2 }} />
                                                    <Typography variant="h6" sx={{ color: '#2196f3', mb: 1 }}>Стоимость 1 км пути</Typography>
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                        {formatCurrency(costPerKm.costPerKm)}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    )}
                                    {costPerKm && !costPerKm.error && (
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Card sx={{ background: 'linear-gradient(45deg, rgba(156, 39, 176, 0.1), rgba(156, 39, 176, 0.2))', border: '1px solid #9c27b0', borderRadius: '16px' }}>
                                                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                                                    <Speed sx={{ fontSize: 40, color: '#9c27b0', mb: 2 }} />
                                                    <Typography variant="h6" sx={{ color: '#9c27b0', mb: 1 }}>Пробег</Typography>
                                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                                        {costPerKm.currentOdometer} км
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    )}
                                </Grid>

                                {/* График структуры расходов автомобиля */}
                                <Paper sx={{ p: 4, mb: 8, borderRadius: '16px', background: 'rgba(44, 27, 71, 0.9)', border: '1px solid rgba(255, 140, 56, 0.3)' }}>
                                    <Typography variant="h5" sx={{ mb: 4, color: '#ff8c38', fontWeight: 'bold', textAlign: 'center' }}>
                                        Структура расходов автомобиля
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={[carExpenses]} layout="horizontal" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                            <XAxis type="number" stroke="#fff" tickFormatter={formatCurrency} fontSize={12} />
                                            <YAxis type="category" dataKey="name" stroke="#fff" fontSize={14} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="fuelCosts" fill="#ff8c38" name="Топливо" />
                                            <Bar dataKey="serviceCosts" fill="#76ff7a" name="Сервис" />
                                            <Bar dataKey="sparePartsCosts" fill="#2196f3" name="Запчасти" />
                                            <Bar dataKey="additionalCosts" fill="#ff6b6b" name="Доп расходы" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>

                                {/* Круговая диаграмма автомобиля */}
                                <Paper sx={{ p: 4, borderRadius: '16px', background: 'rgba(44, 27, 71, 0.9)', border: '1px solid rgba(255, 140, 56, 0.3)', maxWidth: '800px', mx: 'auto' }}>
                                    <Typography variant="h5" sx={{ mb: 4, color: '#ff8c38', fontWeight: 'bold', textAlign: 'center' }}>
                                        Распределение затрат
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={500}>
                                        <PieChart>
                                            <Pie
                                                data={carPieData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={150}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                                                labelLine={false}
                                                fontSize={14}
                                            >
                                                {carPieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Paper>
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