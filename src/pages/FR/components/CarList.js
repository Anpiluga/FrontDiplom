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
} from '@mui/material';
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

    const sortedCars = [...cars].sort((a, b) => a.id - b.id);

    return (
        <Container maxWidth={false} sx={{ maxWidth: '1600px', mt: 4, pt: 4 }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
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
                    Список автомобилей
                </Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/cars/add')}
                        sx={{ mb: 2 }}
                    >
                        Добавить автомобиль
                    </Button>
                </motion.div>
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2,
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
                        minWidth: '1300px',
                        border: '2px solid transparent',
                        borderImage: 'linear-gradient(45deg, #ff8c38, #76ff7a) 1',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))'
                                : 'linear-gradient(135deg, rgba(200, 200, 200, 0.9), rgba(220, 220, 220, 0.9))',
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ minWidth: 80 }}>ID</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>Марка</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>Модель</TableCell>
                                <TableCell sx={{ minWidth: 100 }}>Год</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>Госномер</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>VIN</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>Водитель</TableCell>
                                <TableCell sx={{ minWidth: 200 }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedCars.map((car) => (
                                <motion.tr
                                    key={car.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    sx={{
                                        '&:hover': {
                                            background: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(0, 0, 0, 0.05)',
                                        },
                                    }}
                                >
                                    <TableCell>{car.id}</TableCell>
                                    <TableCell>{car.brand}</TableCell>
                                    <TableCell>{car.model}</TableCell>
                                    <TableCell>{car.year}</TableCell>
                                    <TableCell>{car.licensePlate}</TableCell>
                                    <TableCell>{car.vin}</TableCell>
                                    <TableCell>{car.driverFullName || 'Нет водителя'}</TableCell>
                                    <TableCell>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => navigate(`/cars/edit/${car.id}`)}
                                                sx={{ mr: 1, mb: 1 }}
                                            >
                                                Редактировать
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDelete(car.id)}
                                                sx={{ mb: 1 }}
                                            >
                                                Удалить
                                            </Button>
                                        </motion.div>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </motion.div>
        </Container>
    );
};

export default CarList;