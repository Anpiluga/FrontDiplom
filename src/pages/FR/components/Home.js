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
import { CurrencyRuble, LocalGasStation, Build, Inventory, AttachMoney } from '@mui/icons-material';
import axios from 'axios';

const Home = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [monthlyData, setMonthlyData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // Получаем общую статистику
                const totalResponse = await axios.get('http://localhost:8080/admin/analytics/total-expenses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                // Получаем месячную статистику
                const monthlyResponse = await axios.get('http://localhost:8080/admin/analytics/monthly-expenses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                setAnalyticsData(totalResponse.data);
                setMonthlyData(monthlyResponse.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    const COLORS = ['#ff8c38', '#76ff7a', '#2196f3', '#ff6b6b'];

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

    const pieData = analyticsData ? [
        { name: 'Топливо', value: analyticsData.fuelCosts, percentage: analyticsData.fuelPercentage },
        { name: 'Сервис', value: analyticsData.serviceCosts, percentage: analyticsData.servicePercentage },
        { name: 'Запчасти', value: analyticsData.sparePartsCosts, percentage: analyticsData.sparePartsPercentage },
        { name: 'Доп расходы', value: analyticsData.additionalCosts, percentage: analyticsData.additionalPercentage },
    ] : [];

    const monthlyChartData = monthlyData ? monthlyData.months.map((month, index) => ({
        month,
        total: monthlyData.totalExpenses[index],
        fuel: monthlyData.fuelExpenses[index],
        service: monthlyData.serviceExpenses[index],
        spareParts: monthlyData.sparePartsExpenses[index],
        additional: monthlyData.additionalExpenses[index],
    })) : [];

    const categoryChartData = {
        fuel: monthlyData ? monthlyData.months.map((month, index) => ({
            month,
            value: monthlyData.fuelExpenses[index]
        })) : [],
        service: monthlyData ? monthlyData.months.map((month, index) => ({
            month,
            value: monthlyData.serviceExpenses[index]
        })) : [],
        spareParts: monthlyData ? monthlyData.months.map((month, index) => ({
            month,
            value: monthlyData.sparePartsExpenses[index]
        })) : [],
        additional: monthlyData ? monthlyData.months.map((month, index) => ({
            month,
            value: monthlyData.additionalExpenses[index]
        })) : []
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
                <Typography variant="h4">Загрузка...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 8, px: 4 }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Заголовок и описание */}
                <Box sx={{ textAlign: 'center', mb: 8 }}>
                    <Typography
                        variant="h3"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 4
                        }}
                    >
                        Добро пожаловать в систему VozilaFleet!
                    </Typography>

                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{
                            fontSize: { xs: '1.5rem', md: '2rem' },
                            fontWeight: 'bold',
                            color: '#ff8c38',
                            mb: 6,
                            maxWidth: '900px',
                            mx: 'auto'
                        }}
                    >
                        VozilaFleet - автоматизированная система учёта затрат на плановое техническое обслуживание в таксопарках
                    </Typography>

                    <Grid container spacing={4} sx={{ maxWidth: '1000px', mx: 'auto' }}>
                        <Grid item xs={12} md={6}>
                            <List sx={{ color: '#e0e0e0' }}>
                                <ListItem sx={{ py: 1 }}>
                                    <ListItemText
                                        primary="• Учёт стоимости эксплуатации"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1 }}>
                                    <ListItemText
                                        primary="• База данных автомобилей и водителей"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1 }}>
                                    <ListItemText
                                        primary="• Уведомления по ТО"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }}
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <List sx={{ color: '#e0e0e0' }}>
                                <ListItem sx={{ py: 1 }}>
                                    <ListItemText
                                        primary="• Сервисные напоминания"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1 }}>
                                    <ListItemText
                                        primary="• Анализ затрат по категориям"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 1 }}>
                                    <ListItemText
                                        primary="• Функциональная статистика"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }}
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{
                    my: 8,
                    backgroundColor: 'rgba(255, 140, 56, 0.3)',
                    height: '3px'
                }} />

                {/* Секция аналитики */}
                <Box sx={{ mb: 8 }}>
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{
                            mb: 6,
                            fontWeight: 'bold',
                            color: '#ff8c38'
                        }}
                    >
                        Стоимость эксплуатации таксопарка
                    </Typography>

                    {/* Общая стоимость */}
                    {analyticsData && (
                        <Paper
                            sx={{
                                p: 4,
                                mb: 8,
                                textAlign: 'center',
                                background: 'linear-gradient(45deg, rgba(255, 140, 56, 0.1), rgba(118, 255, 122, 0.1))',
                                border: '2px solid #ff8c38',
                                borderRadius: '16px',
                                maxWidth: '600px',
                                mx: 'auto'
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 2, color: '#ff8c38' }}>
                                Общие затраты
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#76ff7a' }}>
                                {formatCurrency(analyticsData.totalCosts)}
                            </Typography>
                        </Paper>
                    )}

                    {/* Основной график общих затрат по месяцам - на всю ширину */}
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

                    {/* Круговая диаграмма - отдельно */}
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

                    {/* Графики по категориям - каждый отдельно */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {/* Затраты на топливо */}
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

                        {/* Затраты на сервис */}
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

                        {/* Затраты на запчасти */}
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

                        {/* Дополнительные расходы */}
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
                    </Box>
                </Box>
            </motion.div>
        </Container>
    );
};

export default Home;