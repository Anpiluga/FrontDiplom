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
        <Container maxWidth="xl" sx={{ mt: 8, px: 3 }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                {/* Заголовок и описание */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography
                        variant="h3"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 3
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
                            mb: 4,
                            maxWidth: '900px',
                            mx: 'auto'
                        }}
                    >
                        VozilaFleet - автоматизированная система учёта затрат на плановое техническое обслуживание в таксопарках
                    </Typography>

                    <Grid container spacing={2} sx={{ maxWidth: '800px', mx: 'auto' }}>
                        <Grid item xs={12} md={6}>
                            <List sx={{ color: '#e0e0e0' }}>
                                <ListItem sx={{ py: 0.5 }}>
                                    <ListItemText
                                        primary="• Учёт стоимости эксплуатации"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.1rem' } }}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 0.5 }}>
                                    <ListItemText
                                        primary="• База данных автомобилей и водителей"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.1rem' } }}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 0.5 }}>
                                    <ListItemText
                                        primary="• Уведомления по ТО"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.1rem' } }}
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <List sx={{ color: '#e0e0e0' }}>
                                <ListItem sx={{ py: 0.5 }}>
                                    <ListItemText
                                        primary="• Сервисные напоминания"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.1rem' } }}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 0.5 }}>
                                    <ListItemText
                                        primary="• Анализ затрат по категориям"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.1rem' } }}
                                    />
                                </ListItem>
                                <ListItem sx={{ py: 0.5 }}>
                                    <ListItemText
                                        primary="• Функциональная статистика"
                                        sx={{ '& .MuiListItemText-primary': { fontSize: '1.1rem' } }}
                                    />
                                </ListItem>
                            </List>
                        </Grid>
                    </Grid>
                </Box>

                <Divider sx={{
                    my: 6,
                    backgroundColor: 'rgba(255, 140, 56, 0.3)',
                    height: '2px'
                }} />

                {/* Секция аналитики */}
                <Box sx={{ mb: 6 }}>
                    <Typography
                        variant="h4"
                        align="center"
                        sx={{
                            mb: 4,
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
                                p: 3,
                                mb: 4,
                                textAlign: 'center',
                                background: 'linear-gradient(45deg, rgba(255, 140, 56, 0.1), rgba(118, 255, 122, 0.1))',
                                border: '2px solid #ff8c38',
                                borderRadius: '16px'
                            }}
                        >
                            <Typography variant="h5" sx={{ mb: 1, color: '#ff8c38' }}>
                                Общие затраты
                            </Typography>
                            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#76ff7a' }}>
                                {formatCurrency(analyticsData.totalCosts)}
                            </Typography>
                        </Paper>
                    )}

                    {/* Графики */}
                    <Grid container spacing={4}>
                        {/* Общая гистограмма */}
                        <Grid item xs={12} lg={8}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: '16px',
                                background: 'rgba(44, 27, 71, 0.9)',
                                border: '1px solid rgba(255, 140, 56, 0.3)'
                            }}>
                                <Typography variant="h6" sx={{ mb: 3, color: '#ff8c38', fontWeight: 'bold' }}>
                                    Общие затраты по месяцам
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={monthlyChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" stroke="#fff" />
                                        <YAxis stroke="#fff" tickFormatter={formatCurrency} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="total" fill="#ff8c38" name="Общие затраты" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {/* Круговая диаграмма */}
                        <Grid item xs={12} lg={4}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: '16px',
                                background: 'rgba(44, 27, 71, 0.9)',
                                border: '1px solid rgba(255, 140, 56, 0.3)'
                            }}>
                                <Typography variant="h6" sx={{ mb: 3, color: '#ff8c38', fontWeight: 'bold' }}>
                                    Структура затрат
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {/* Гистограммы по категориям */}
                        <Grid item xs={12} md={6}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: '16px',
                                background: 'rgba(44, 27, 71, 0.9)',
                                border: '1px solid rgba(255, 140, 56, 0.3)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <LocalGasStation sx={{ mr: 1, color: '#ff8c38' }} />
                                    <Typography variant="h6" sx={{ color: '#ff8c38', fontWeight: 'bold' }}>
                                        Затраты на топливо
                                    </Typography>
                                </Box>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={categoryChartData.fuel}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" stroke="#fff" />
                                        <YAxis stroke="#fff" tickFormatter={formatCurrency} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" fill="#ff8c38" name="Топливо" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: '16px',
                                background: 'rgba(44, 27, 71, 0.9)',
                                border: '1px solid rgba(255, 140, 56, 0.3)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Build sx={{ mr: 1, color: '#76ff7a' }} />
                                    <Typography variant="h6" sx={{ color: '#76ff7a', fontWeight: 'bold' }}>
                                        Затраты на сервис
                                    </Typography>
                                </Box>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={categoryChartData.service}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" stroke="#fff" />
                                        <YAxis stroke="#fff" tickFormatter={formatCurrency} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" fill="#76ff7a" name="Сервис" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: '16px',
                                background: 'rgba(44, 27, 71, 0.9)',
                                border: '1px solid rgba(255, 140, 56, 0.3)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Inventory sx={{ mr: 1, color: '#2196f3' }} />
                                    <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                                        Затраты на запчасти
                                    </Typography>
                                </Box>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={categoryChartData.spareParts}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" stroke="#fff" />
                                        <YAxis stroke="#fff" tickFormatter={formatCurrency} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" fill="#2196f3" name="Запчасти" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{
                                p: 3,
                                borderRadius: '16px',
                                background: 'rgba(44, 27, 71, 0.9)',
                                border: '1px solid rgba(255, 140, 56, 0.3)'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <AttachMoney sx={{ mr: 1, color: '#ff6b6b' }} />
                                    <Typography variant="h6" sx={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                                        Дополнительные расходы
                                    </Typography>
                                </Box>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={categoryChartData.additional}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="month" stroke="#fff" />
                                        <YAxis stroke="#fff" tickFormatter={formatCurrency} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="value" fill="#ff6b6b" name="Доп расходы" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </motion.div>
        </Container>
    );
};

export default Home;