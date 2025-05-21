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
                const response = await axios.get('http://localhost:8080/admin/cars', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setCars(response.data);
            } catch (err) {
                console.error('Error fetching cars', err);
                setError('Ошибка при загрузке автомобилей');
            }
        };

        fetchCars();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) return;

        try {
            await axios.delete(`http://localhost:8080/admin/cars/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setCars(cars.filter((car) => car.id !== id));
        } catch (err) {
            console.error('Error deleting car', err);
            setError('Ошибка при удалении автомобиля');
        }
    };

    const handleAssignDriver = async (carId, driverId) => {
        try {
            await axios.post(`http://localhost:8080/admin/cars/${carId}/assign-driver`,
                { driverId },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            // Обновляем список автомобилей
            const response = await axios.get('http://localhost:8080/admin/cars', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setCars(response.data);
        } catch (err) {
            console.error('Error assigning driver', err);
            setError('Ошибка при назначении водителя');
        }
    };

    const handleUnassignDriver = async (carId) => {
        try {
            await axios.post(`http://localhost:8080/admin/cars/${carId}/unassign-driver`,
                {},
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );

            // Обновляем список автомобилей
            const response = await axios.get('http://localhost:8080/admin/cars', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setCars(response.data);
        } catch (err) {
            console.error('Error unassigning driver', err);
            setError('Ошибка при отвязке водителя');
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