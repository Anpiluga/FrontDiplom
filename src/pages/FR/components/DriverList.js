import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Alert,
    Box,
    IconButton,
    Tooltip,
    Avatar,
    FormControlLabel,
    Switch,
} from '@mui/material';
import {
    Edit,
    Delete,
    Add,
    Person,
    DirectionsCar,
    Phone,
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

const DriverList = () => {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [carFilter, setCarFilter] = useState(null); // null - все, true - с авто, false - без авто

    useEffect(() => {
        fetchDrivers();
    }, [carFilter]);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            let url = 'http://localhost:8080/admin/drivers';
            if (carFilter !== null) {
                url += `/filter?hasCar=${carFilter}`;
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.data) {
                setDrivers(response.data);
            } else {
                setError('Получены некорректные данные от сервера');
            }
        } catch (err) {
            console.error('Error fetching drivers', err);
            if (err.response) {
                if (err.response.status === 403) {
                    setError('Ошибка доступа при загрузке водителей. Срок действия сессии мог истечь.');
                    setTimeout(() => navigate('/login'), 2000);
                } else if (err.response.status === 404) {
                    setError('API для получения водителей не найден. Пожалуйста, убедитесь, что сервер запущен и API доступен.');
                } else {
                    setError(`Ошибка при загрузке водителей: ${err.response.status} ${err.response.statusText}`);
                }
            } else if (err.request) {
                setError('Не удалось получить ответ от сервера. Пожалуйста, проверьте соединение и доступность сервера.');
            } else {
                setError(`Ошибка при загрузке водителей: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого водителя?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            await axios.delete(`http://localhost:8080/admin/drivers/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setDrivers(drivers.filter((driver) => driver.id !== id));
        } catch (err) {
            console.error('Error deleting driver', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа при удалении водителя. Срок действия сессии мог истечь.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при удалении водителя. Пожалуйста, попробуйте снова позже.');
            }
        }
    };

    const getRandomColor = (id) => {
        const colors = [
            '#f44336', '#e91e63', '#9c27b0', '#673ab7',
            '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
            '#009688', '#4caf50', '#8bc34a', '#cddc39',
            '#ffc107', '#ff9800', '#ff5722'
        ];

        // Используем ID водителя для получения стабильного цвета для одного и того же водителя
        return colors[id % colors.length];
    };

    const getInitials = (firstName, lastName) => {
        const firstInitial = firstName && firstName.length > 0 ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName && lastName.length > 0 ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}`;
    };

    const handleFilterChange = (event) => {
        const value = event.target.checked;
        setCarFilter(value ? true : null); // true - только с авто, null - все
    };

    const handleFilterToggle = () => {
        if (carFilter === null) {
            setCarFilter(true); // Показать только с авто
        } else if (carFilter === true) {
            setCarFilter(false); // Показать только без авто
        } else {
            setCarFilter(null); // Показать всех
        }
    };

    const getFilterText = () => {
        if (carFilter === null) return 'Все водители';
        if (carFilter === true) return 'С автомобилем';
        return 'Без автомобиля';
    };

    const sortedDrivers = [...drivers].sort((a, b) => a.id - b.id);

    return (
        <Container maxWidth={false} sx={{ maxWidth: '1800px', mt: 4, pt: 4, px: 3 }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 4
                }}>
                    <Typography
                        variant="h4"
                        sx={{
                            background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 'bold'
                        }}
                    >
                        Список водителей
                    </Typography>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/drivers/add')}
                            startIcon={<Add />}
                            sx={{
                                background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                color: '#1a1a1a',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                px: 3,
                                py: 1.5,
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #76ff7a, #ff8c38)',
                                }
                            }}
                        >
                            Добавить водителя
                        </Button>
                    </motion.div>
                </Box>

                {/* Фильтр */}
                <Box sx={{
                    mb: 4,
                    p: 3,
                    border: '1px solid rgba(255, 140, 56, 0.3)',
                    borderRadius: '12px',
                    background: 'rgba(255, 140, 56, 0.05)',
                }}>
                    <Typography variant="h6" sx={{ mb: 2, color: '#ff8c38', fontWeight: 'bold' }}>
                        Фильтр по назначению автомобиля
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            variant={carFilter === null ? "contained" : "outlined"}
                            onClick={() => setCarFilter(null)}
                            sx={{
                                borderColor: '#ff8c38',
                                color: carFilter === null ? '#1a1a1a' : '#ff8c38',
                                background: carFilter === null ? 'linear-gradient(45deg, #ff8c38, #76ff7a)' : 'transparent',
                                '&:hover': {
                                    borderColor: '#76ff7a',
                                    color: carFilter === null ? '#1a1a1a' : '#76ff7a',
                                }
                            }}
                        >
                            Все водители
                        </Button>
                        <Button
                            variant={carFilter === true ? "contained" : "outlined"}
                            onClick={() => setCarFilter(true)}
                            startIcon={<DirectionsCar />}
                            sx={{
                                borderColor: '#ff8c38',
                                color: carFilter === true ? '#1a1a1a' : '#ff8c38',
                                background: carFilter === true ? 'linear-gradient(45deg, #ff8c38, #76ff7a)' : 'transparent',
                                '&:hover': {
                                    borderColor: '#76ff7a',
                                    color: carFilter === true ? '#1a1a1a' : '#76ff7a',
                                }
                            }}
                        >
                            С автомобилем
                        </Button>
                        <Button
                            variant={carFilter === false ? "contained" : "outlined"}
                            onClick={() => setCarFilter(false)}
                            startIcon={<Person />}
                            sx={{
                                borderColor: '#ff8c38',
                                color: carFilter === false ? '#1a1a1a' : '#ff8c38',
                                background: carFilter === false ? 'linear-gradient(45deg, #ff8c38, #76ff7a)' : 'transparent',
                                '&:hover': {
                                    borderColor: '#76ff7a',
                                    color: carFilter === false ? '#1a1a1a' : '#76ff7a',
                                }
                            }}
                        >
                            Без автомобиля
                        </Button>
                    </Box>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
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

                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: '16px',
                        border: '2px solid transparent',
                        borderImage: 'linear-gradient(45deg, #ff8c38, #76ff7a) 1',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(44, 27, 71, 0.9)'
                                : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        overflow: 'hidden',
                        '& .MuiTableRow-head': {
                            background: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'linear-gradient(90deg, rgba(40, 20, 60, 0.9), rgba(60, 30, 90, 0.9))'
                                    : 'linear-gradient(90deg, rgba(240, 240, 240, 0.9), rgba(250, 250, 250, 0.9))',
                        },
                        '& .MuiTableCell-head': {
                            fontWeight: 'bold',
                            color: '#ff8c38',
                            borderBottom: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? '2px solid rgba(255, 140, 56, 0.3)'
                                    : '2px solid rgba(255, 140, 56, 0.5)',
                        }
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" sx={{ width: 70 }}>ID</TableCell>
                                <TableCell sx={{ minWidth: 300 }}>Водитель</TableCell>
                                <TableCell sx={{ minWidth: 180 }}>Телефон</TableCell>
                                <TableCell sx={{ minWidth: 250 }}>Автомобиль</TableCell>
                                <TableCell align="center" sx={{ minWidth: 200 }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedDrivers.map((driver) => (
                                <TableRow
                                    key={driver.id}
                                    component={motion.tr}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    sx={{
                                        '&:hover': {
                                            background: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(0, 0, 0, 0.03)',
                                        },
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                                    }}
                                >
                                    <TableCell align="center">{driver.id}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Avatar
                                                sx={{
                                                    bgcolor: getRandomColor(driver.id),
                                                    mr: 2,
                                                    width: 40,
                                                    height: 40,
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                {getInitials(driver.firstName, driver.lastName)}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontWeight: 'bold' }}>
                                                    {driver.firstName} {driver.lastName}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                    {driver.middleName || ''}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Phone sx={{ mr: 1, color: '#76ff7a', fontSize: '1.2rem' }} />
                                            <Typography>{driver.phoneNumber}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {driver.hasCar ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <DirectionsCar sx={{ mr: 1, color: '#4caf50', fontSize: '1.2rem' }} />
                                                <Typography sx={{ fontWeight: 'bold' }}>
                                                    Назначен на автомобиль
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                                Не назначен
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="Редактировать">
                                                <IconButton
                                                    onClick={() => navigate(`/drivers/edit/${driver.id}`)}
                                                    sx={{
                                                        color: '#ff8c38',
                                                        '&:hover': { backgroundColor: 'rgba(255, 140, 56, 0.1)' }
                                                    }}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Удалить">
                                                <IconButton
                                                    onClick={() => handleDelete(driver.id)}
                                                    sx={{
                                                        color: '#f44336',
                                                        '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                                                    }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {sortedDrivers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                            {loading ? 'Загрузка...' : 'Список водителей пуст'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </motion.div>
        </Container>
    );
};

export default DriverList;