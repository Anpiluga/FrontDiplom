import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText, Grid, Paper, Divider } from '@mui/material';
import { motion } from 'framer-motion';
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
    ResponsiveContainer
} from 'recharts';
import {
    CurrencyRuble,
    LocalGasStation,
    Build,
    Inventory,
    AttachMoney,
    DirectionsCar,
    Engineering,
    Notifications,
    Assessment,
    Security,
    TrendingUp
} from '@mui/icons-material';
import axios from 'axios';

const Home = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.log('No token found');
                    setError('Необходима авторизация');
                    setLoading(false);
                    return;
                }

                console.log('Fetching analytics with token:', token.substring(0, 20) + '...');

                // Получаем общую статистику
                console.log('Fetching total expenses...');
                const totalResponse = await axios.get('http://localhost:8080/admin/analytics/total-expenses', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Total expenses response:', totalResponse.data);

                // Получаем месячную статистику
                console.log('Fetching monthly expenses...');
                const monthlyResponse = await axios.get('http://localhost:8080/admin/analytics/monthly-expenses', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Monthly expenses response:', monthlyResponse.data);

                // Проверяем полученные данные
                if (totalResponse.data) {
                    setAnalyticsData({
                        totalCosts: totalResponse.data.totalCosts || 0,
                        fuelCosts: totalResponse.data.fuelCosts || 0,
                        serviceCosts: totalResponse.data.serviceCosts || 0,
                        sparePartsCosts: totalResponse.data.sparePartsCosts || 0,
                        additionalCosts: totalResponse.data.additionalCosts || 0,
                        fuelPercentage: totalResponse.data.fuelPercentage || 0,
                        servicePercentage: totalResponse.data.servicePercentage || 0,
                        sparePartsPercentage: totalResponse.data.sparePartsPercentage || 0,
                        additionalPercentage: totalResponse.data.additionalPercentage || 0,
                    });
                    console.log('Analytics data set successfully');
                }

                if (monthlyResponse.data) {
                    setMonthlyData(monthlyResponse.data);
                    console.log('Monthly data set successfully');
                }

                setError(null); // Очищаем ошибки при успешной загрузке
            } catch (error) {
                console.error('Error fetching analytics:', error);
                console.error('Error response:', error.response?.data);
                console.error('Error status:', error.response?.status);

                if (error.response?.status === 401) {
                    setError('Ошибка авторизации. Пожалуйста, войдите в систему заново.');
                } else if (error.response?.status === 403) {
                    setError('Нет прав доступа к аналитике');
                } else if (error.response?.status === 404) {
                    setError('API аналитики не найден');
                } else if (error.request) {
                    setError('Нет ответа от сервера. Проверьте подключение.');
                } else {
                    setError('Ошибка при загрузке данных');
                }

                // Устанавливаем дефолтные значения
                setAnalyticsData({
                    totalCosts: 0,
                    fuelCosts: 0,
                    serviceCosts: 0,
                    sparePartsCosts: 0,
                    additionalCosts: 0,
                    fuelPercentage: 0,
                    servicePercentage: 0,
                    sparePartsPercentage: 0,
                    additionalPercentage: 0,
                });
                setMonthlyData({
                    months: [],
                    totalExpenses: [],
                    fuelExpenses: [],
                    serviceExpenses: [],
                    sparePartsExpenses: [],
                    additionalExpenses: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const COLORS = ['#ff8c38', '#76ff7a', '#2196f3', '#ff6b6b'];

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
    const pieData = analyticsData && analyticsData.totalCosts > 0 ? [
        { name: 'Топливо', value: analyticsData.fuelCosts, percentage: analyticsData.fuelPercentage },
        { name: 'Сервис', value: analyticsData.serviceCosts, percentage: analyticsData.servicePercentage },
        { name: 'Запчасти', value: analyticsData.sparePartsCosts, percentage: analyticsData.sparePartsPercentage },
        { name: 'Доп расходы', value: analyticsData.additionalCosts, percentage: analyticsData.additionalPercentage },
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

    // Безопасное создание данных для категорий
    const categoryChartData = React.useMemo(() => {
        if (!monthlyData || !monthlyData.months || !Array.isArray(monthlyData.months)) {
            return {
                fuel: [],
                service: [],
                spareParts: [],
                additional: []
            };
        }

        return {
            fuel: monthlyData.months.map((month, index) => ({
                month,
                value: (monthlyData.fuelExpenses && monthlyData.fuelExpenses[index]) || 0
            })),
            service: monthlyData.months.map((month, index) => ({
                month,
                value: (monthlyData.serviceExpenses && monthlyData.serviceExpenses[index]) || 0
            })),
            spareParts: monthlyData.months.map((month, index) => ({
                month,
                value: (monthlyData.sparePartsExpenses && monthlyData.sparePartsExpenses[index]) || 0
            })),
            additional: monthlyData.months.map((month, index) => ({
                month,
                value: (monthlyData.additionalExpenses && monthlyData.additionalExpenses[index]) || 0
            }))
        };
    }, [monthlyData]);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Typography variant="h4">Загрузка...</Typography>
                </motion.div>
            </Container>
        );
    }

    const features = [
        {
            icon: <DirectionsCar sx={{ fontSize: 40, color: '#ff8c38' }} />,
            title: 'Учёт стоимости эксплуатации',
            description: 'Полное отслеживание затрат на эксплуатацию автопарка'
        },
        {
            icon: <Engineering sx={{ fontSize: 40, color: '#76ff7a' }} />,
            title: 'Сервисные напоминания',
            description: 'Автоматические уведомления о плановом техобслуживании'
        },
        {
            icon: <Inventory sx={{ fontSize: 40, color: '#2196f3' }} />,
            title: 'База данных автомобилей и водителей',
            description: 'Централизованное управление информацией о парке'
        },
        {
            icon: <Assessment sx={{ fontSize: 40, color: '#ff6b6b' }} />,
            title: 'Анализ затрат по категориям',
            description: 'Детальная аналитика расходов с визуализацией'
        },
        {
            icon: <Notifications sx={{ fontSize: 40, color: '#9c27b0' }} />,
            title: 'Уведомления по ТО',
            description: 'Своевременные напоминания о техническом обслуживании'
        },
        {
            icon: <TrendingUp sx={{ fontSize: 40, color: '#00bcd4' }} />,
            title: 'Функциональная статистика',
            description: 'Подробные отчеты и прогнозирование затрат'
        }
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 8, px: 4 }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Главный заголовок с анимацией */}
                <Box sx={{ textAlign: 'center', mb: 8, position: 'relative' }}>
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <Typography
                            variant="h3"
                            gutterBottom
                            sx={{
                                fontWeight: 'bold',
                                background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 2,
                                position: 'relative',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: '-10px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '100px',
                                    height: '4px',
                                    background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                    borderRadius: '2px',
                                }
                            }}
                        >
                            Добро пожаловать в систему VozilaFleet!
                        </Typography>
                    </motion.div>

                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <Paper
                            sx={{
                                p: 4,
                                mt: 4,
                                background: 'linear-gradient(135deg, rgba(255, 140, 56, 0.1), rgba(118, 255, 122, 0.1))',
                                border: '2px solid transparent',
                                borderImage: 'linear-gradient(45deg, #ff8c38, #76ff7a) 1',
                                borderRadius: '20px',
                                backdropFilter: 'blur(10px)',
                                maxWidth: '900px',
                                mx: 'auto',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'linear-gradient(45deg, rgba(255, 140, 56, 0.05), rgba(118, 255, 122, 0.05))',
                                    zIndex: -1,
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <Security sx={{ fontSize: 50, color: '#ff8c38', mr: 2 }} />
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontSize: { xs: '1.5rem', md: '2rem' },
                                        fontWeight: 'bold',
                                        color: '#ff8c38',
                                        textAlign: 'center'
                                    }}
                                >
                                    VozilaFleet - автоматизированная система учёта затрат на плановое техническое обслуживание в таксопарках
                                </Typography>
                            </Box>
                        </Paper>
                    </motion.div>
                </Box>

                {/* Сетка функций с анимированными карточками */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <Grid container spacing={4} sx={{ mb: 8 }}>
                        {features.map((feature, index) => (
                            <Grid item xs={12} md={6} lg={4} key={index}>
                                <motion.div
                                    initial={{ y: 50, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: 0.7 + index * 0.1,
                                        ease: "easeOut"
                                    }}
                                    whileHover={{
                                        scale: 1.05,
                                        transition: { duration: 0.3 }
                                    }}
                                >
                                    <Paper
                                        sx={{
                                            p: 3,
                                            height: '220px',
                                            background: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(44, 27, 71, 0.8)'
                                                    : 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255, 140, 56, 0.2)',
                                            borderRadius: '16px',
                                            textAlign: 'center',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            '&:hover': {
                                                border: '2px solid #ff8c38',
                                                transform: 'translateY(-5px)',
                                                boxShadow: '0 10px 25px rgba(255, 140, 56, 0.3)',
                                                '&::before': {
                                                    opacity: 1,
                                                }
                                            },
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: '-100%',
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, transparent, rgba(255, 140, 56, 0.1), transparent)',
                                                opacity: 0,
                                                transition: 'all 0.6s ease',
                                                zIndex: 0,
                                            },
                                            '&:hover::before': {
                                                left: '100%',
                                                opacity: 1,
                                            }
                                        }}
                                    >
                                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                                            <motion.div
                                                whileHover={{
                                                    rotate: 360,
                                                    transition: { duration: 0.6 }
                                                }}
                                            >
                                                <Box sx={{ mb: 2 }}>
                                                    {feature.icon}
                                                </Box>
                                            </motion.div>

                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    mb: 2,
                                                    color: (theme) => theme.palette.mode === 'dark' ? '#ff8c38' : '#ff8c38'
                                                }}
                                            >
                                                {feature.title}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                                                    lineHeight: 1.6
                                                }}
                                            >
                                                {feature.description}
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>

                <Divider sx={{
                    my: 8,
                    backgroundColor: 'rgba(255, 140, 56, 0.3)',
                    height: '3px'
                }} />

                {/* Отображение ошибки */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Paper sx={{
                            p: 4,
                            mb: 6,
                            textAlign: 'center',
                            background: 'rgba(211, 47, 47, 0.1)',
                            border: '1px solid rgba(211, 47, 47, 0.3)',
                            borderRadius: '16px'
                        }}>
                            <Typography variant="h6" sx={{ color: '#ff6f60', mb: 2 }}>
                                Ошибка загрузки данных
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#ff6f60' }}>
                                {error}
                            </Typography>
                        </Paper>
                    </motion.div>
                )}

                {/* Секция аналитики */}
                <Box sx={{ mb: 8 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                    >
                        <Typography
                            variant="h4"
                            align="center"
                            sx={{
                                mb: 6,
                                fontWeight: 'bold',
                                color: '#ff8c38',
                                position: 'relative',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: '-10px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '80px',
                                    height: '3px',
                                    background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                    borderRadius: '2px',
                                }
                            }}
                        >
                            Стоимость эксплуатации таксопарка
                        </Typography>
                    </motion.div>

                    {/* Общая стоимость */}
                    {analyticsData && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 1.4 }}
                        >
                            <Paper
                                sx={{
                                    p: 4,
                                    mb: 8,
                                    textAlign: 'center',
                                    background: 'linear-gradient(45deg, rgba(255, 140, 56, 0.1), rgba(118, 255, 122, 0.1))',
                                    border: '2px solid #ff8c38',
                                    borderRadius: '16px',
                                    maxWidth: '600px',
                                    mx: 'auto',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'linear-gradient(45deg, rgba(255, 140, 56, 0.05), rgba(118, 255, 122, 0.05))',
                                        animation: 'pulse 3s ease-in-out infinite',
                                        '@keyframes pulse': {
                                            '0%': { opacity: 0.5 },
                                            '50%': { opacity: 0.8 },
                                            '100%': { opacity: 0.5 },
                                        }
                                    }
                                }}
                            >
                                <Typography variant="h5" sx={{ mb: 2, color: '#ff8c38' }}>
                                    Общие затраты
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#76ff7a' }}>
                                    {formatCurrency(analyticsData.totalCosts)}
                                </Typography>
                            </Paper>
                        </motion.div>
                    )}

                    {/* Основной график общих затрат по месяцам - на всю ширину */}
                    {monthlyChartData.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 1.6 }}
                        >
                            <Paper sx={{
                                p: 4,
                                mb: 8,
                                borderRadius: '16px',
                                background: 'rgba(44, 27, 71, 0.9)',
                                border: '1px solid rgba(255, 140, 56, 0.3)'
                            }}>
                                <Typography variant="h5" sx={{ mb: 4, color: '#ff8c38', fontWeight: 'bold', textAlign: 'center' }}>
                                    Общие затраты по месяцам
                                </Typography>
                                <ResponsiveContainer width="100%" height={450}>
                                    <BarChart data={monthlyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" stroke="#fff" fontSize={14} />
                                        <YAxis stroke="#fff" tickFormatter={formatCurrency} fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="total" fill="#ff8c38" name="Общие затраты" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </motion.div>
                    )}

                    {/* Круговая диаграмма - отдельно */}
                    {pieData.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, rotate: -180 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            transition={{ duration: 1, delay: 1.8 }}
                        >
                            <Paper sx={{
                                p: 4,
                                mb: 8,
                                borderRadius: '16px',
                                background: 'rgba(44, 27, 71, 0.9)',
                                border: '1px solid rgba(255, 140, 56, 0.3)',
                                maxWidth: '800px',
                                mx: 'auto'
                            }}>
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
                        </motion.div>
                    )}

                    {/* Графики по категориям - каждый отдельно */}
                    {(categoryChartData.fuel.length > 0 || categoryChartData.service.length > 0 ||
                        categoryChartData.spareParts.length > 0 || categoryChartData.additional.length > 0) && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {/* Затраты на топливо */}
                            {categoryChartData.fuel.length > 0 && categoryChartData.fuel.some(item => item.value > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, x: -100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 2.0 }}
                                >
                                    <Paper sx={{
                                        p: 4,
                                        borderRadius: '16px',
                                        background: 'rgba(44, 27, 71, 0.9)',
                                        border: '1px solid rgba(255, 140, 56, 0.3)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
                                            <LocalGasStation sx={{ mr: 2, color: '#ff8c38', fontSize: 32 }} />
                                            <Typography variant="h5" sx={{ color: '#ff8c38', fontWeight: 'bold' }}>
                                                Затраты на топливо
                                            </Typography>
                                        </Box>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={categoryChartData.fuel} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="month" stroke="#fff" fontSize={12} />
                                                <YAxis stroke="#fff" tickFormatter={formatCurrency} fontSize={11} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="value" fill="#ff8c38" name="Топливо" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </motion.div>
                            )}

                            {/* Затраты на сервис */}
                            {categoryChartData.service.length > 0 && categoryChartData.service.some(item => item.value > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 2.2 }}
                                >
                                    <Paper sx={{
                                        p: 4,
                                        borderRadius: '16px',
                                        background: 'rgba(44, 27, 71, 0.9)',
                                        border: '1px solid rgba(118, 255, 122, 0.3)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
                                            <Build sx={{ mr: 2, color: '#76ff7a', fontSize: 32 }} />
                                            <Typography variant="h5" sx={{ color: '#76ff7a', fontWeight: 'bold' }}>
                                                Затраты на сервис
                                            </Typography>
                                        </Box>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={categoryChartData.service} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="month" stroke="#fff" fontSize={12} />
                                                <YAxis stroke="#fff" tickFormatter={formatCurrency} fontSize={11} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="value" fill="#76ff7a" name="Сервис" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </motion.div>
                            )}

                            {/* Затраты на запчасти */}
                            {categoryChartData.spareParts.length > 0 && categoryChartData.spareParts.some(item => item.value > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, x: -100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 2.4 }}
                                >
                                    <Paper sx={{
                                        p: 4,
                                        borderRadius: '16px',
                                        background: 'rgba(44, 27, 71, 0.9)',
                                        border: '1px solid rgba(33, 150, 243, 0.3)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
                                            <Inventory sx={{ mr: 2, color: '#2196f3', fontSize: 32 }} />
                                            <Typography variant="h5" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                                                Затраты на запчасти
                                            </Typography>
                                        </Box>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={categoryChartData.spareParts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="month" stroke="#fff" fontSize={12} />
                                                <YAxis stroke="#fff" tickFormatter={formatCurrency} fontSize={11} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="value" fill="#2196f3" name="Запчасти" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </motion.div>
                            )}

                            {/* Дополнительные расходы */}
                            {categoryChartData.additional.length > 0 && categoryChartData.additional.some(item => item.value > 0) && (
                                <motion.div
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 2.6 }}
                                >
                                    <Paper sx={{
                                        p: 4,
                                        borderRadius: '16px',
                                        background: 'rgba(44, 27, 71, 0.9)',
                                        border: '1px solid rgba(255, 107, 107, 0.3)'
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
                                            <AttachMoney sx={{ mr: 2, color: '#ff6b6b', fontSize: 32 }} />
                                            <Typography variant="h5" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                                                Дополнительные расходы
                                            </Typography>
                                        </Box>
                                        <ResponsiveContainer width="100%" height={350}>
                                            <BarChart data={categoryChartData.additional} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                <XAxis dataKey="month" stroke="#fff" fontSize={12} />
                                                <YAxis stroke="#fff" tickFormatter={formatCurrency} fontSize={11} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="value" fill="#ff6b6b" name="Доп расходы" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Paper>
                                </motion.div>
                            )}
                        </Box>
                    )}

                    {/* Сообщение, если нет данных */}
                    {(!analyticsData || analyticsData.totalCosts === 0) && !error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 1.8 }}
                        >
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
                        </motion.div>
                    )}
                </Box>
            </motion.div>
        </Container>
    );
};

export default Home;