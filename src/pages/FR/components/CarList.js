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
    Chip,
} from '@mui/material';
import {
    Edit,
    Delete,
    Add,
    DirectionsCar,
    Person,
    PersonOff,
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

const CarList = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:8080/admin/cars', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (response.data) {
                    setCars(response.data);
                } else {
                    setError('Получены некорректные данные от сервера');
                }
            } catch (err) {
                console.error('Error fetching cars', err);
                if (err.response) {
                    if (err.response.status === 403) {
                        setError('Ошибка доступа при загрузке автомобилей. Срок действия сессии мог истечь.');
                        setTimeout(() => navigate('/login'), 2000);
                    } else if (err.response.status === 404) {
                        setError('API для получения автомобилей не найден. Пожалуйста, убедитесь, что сервер запущен и API доступен.');
                    } else {
                        setError(`Ошибка при загрузке автомобилей: ${err.response.status} ${err.response.statusText}`);
                    }
                } else if (err.request) {
                    setError('Не удалось получить ответ от сервера. Пожалуйста, проверьте соединение и доступность сервера.');
                } else {
                    setError(`Ошибка при загрузке автомобилей: ${err.message}`);
                }
            }
        };

        fetchCars();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            await axios.delete(`http://localhost:8080/admin/cars/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setCars(cars.filter((car) => car.id !== id));
        } catch (err) {
            console.error('Error deleting car', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа при удалении автомобиля. Срок действия сессии мог истечь.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при удалении автомобиля. Пожалуйста, попробуйте снова позже.');
            }
        }
    };

    const handleAssignDriver = async (carId, driverId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            await axios.post(`http://localhost:8080/admin/cars/${carId}/assign-driver`,
                { driverId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Обновляем список автомобилей
            const response = await axios.get('http://localhost:8080/admin/cars', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setCars(response.data);
        } catch (err) {
            console.error('Error assigning driver', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа при назначении водителя. Срок действия сессии мог истечь.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при назначении водителя. Пожалуйста, попробуйте снова позже.');
            }
        }
    };

    const handleUnassignDriver = async (carId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            await axios.post(`http://localhost:8080/admin/cars/${carId}/unassign-driver`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Обновляем список автомобилей
            const response = await axios.get('http://localhost:8080/admin/cars', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setCars(response.data);
        } catch (err) {
            console.error('Error unassigning driver', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа при отвязке водителя. Срок действия сессии мог истечь.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при отвязке водителя. Пожалуйста, попробуйте снова позже.');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'IN_USE':
                return '#4caf50'; // Зеленый
            case 'IN_REPAIR':
                return '#f44336'; // Красный
            case 'IN_MAINTENANCE':
                return '#ff9800'; // Оранжевый
            default:
                return '#9e9e9e'; // Серый
        }
    };

    const getStatusName = (status) => {
        switch (status) {
            case 'IN_USE':
                return 'Используется';
            case 'IN_REPAIR':
                return 'На ремонте';
            case 'IN_MAINTENANCE':
                return 'На обслуживании';
            default:
                return 'Неизвестно';
        }
    };

    const sortedCars = [...cars].sort((a, b) => a.id - b.id);

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
                        Список автомобилей
                    </Typography>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/cars/add')}
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
                            Добавить автомобиль
                        </Button>
                    </motion.div>
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
                                <TableCell sx={{ minWidth: 180 }}>Автомобиль</TableCell>
                                <TableCell sx={{ minWidth: 100 }}>Год</TableCell>
                                <TableCell sx={{ minWidth: 120 }}>Госномер</TableCell>
                                <TableCell sx={{ minWidth: 180 }}>VIN</TableCell>
                                <TableCell sx={{ minWidth: 120 }}>Статус</TableCell>
                                <TableCell sx={{ minWidth: 200 }}>Водитель</TableCell>
                                <TableCell align="center" sx={{ minWidth: 200 }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedCars.map((car) => (
                                <TableRow
                                    key={car.id}
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
                                    <TableCell align="center">{car.id}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <DirectionsCar sx={{ mr: 1, color: '#ff8c38' }} />
                                            <Typography sx={{ fontWeight: 'bold' }}>
                                                {car.brand} {car.model}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{car.year}</TableCell>
                                    <TableCell>{car.licensePlate}</TableCell>
                                    <TableCell>{car.vin}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusName(car.status)}
                                            size="small"
                                            sx={{
                                                backgroundColor: `${getStatusColor(car.status)}20`,
                                                color: getStatusColor(car.status),
                                                fontWeight: 'bold',
                                                border: `1px solid ${getStatusColor(car.status)}`,
                                                px: 1
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {car.driverFullName ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Person sx={{ mr: 1, color: '#4caf50' }} />
                                                <Typography>{car.driverFullName}</Typography>
                                                <Tooltip title="Отвязать водителя">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleUnassignDriver(car.id)}
                                                        sx={{ ml: 1 }}
                                                    >
                                                        <PersonOff fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        ) : (
                                            <Typography sx={{ color: 'text.secondary' }}>
                                                Не назначен
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="Редактировать">
                                                <IconButton
                                                    onClick={() => navigate(`/cars/edit/${car.id}`)}
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
                                                    onClick={() => handleDelete(car.id)}
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

                            {sortedCars.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                            Список автомобилей пуст
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

export default CarList;