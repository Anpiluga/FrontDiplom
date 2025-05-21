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

const DriverList = () => {
    const navigate = useNavigate();
    const [drivers, setDrivers] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDrivers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/admin/drivers', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setDrivers(response.data);
            } catch (err) {
                console.error('Error fetching drivers', err);
                setError('Ошибка при загрузке водителей');
            }
        };

        fetchDrivers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этого водителя?')) return;

        try {
            await axios.delete(`http://localhost:8080/admin/drivers/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setDrivers(drivers.filter((driver) => driver.id !== id));
        } catch (err) {
            console.error('Error deleting driver', err);
            setError('Ошибка при удалении водителя');
        }
    };

    const sortedDrivers = [...drivers].sort((a, b) => a.id - b.id);

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
                    Список водителей
                </Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/drivers/add')}
                        sx={{ mb: 2 }}
                    >
                        Добавить водителя
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
                                <TableCell sx={{ minWidth: 150 }}>Имя</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>Фамилия</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>Телефон</TableCell>
                                <TableCell sx={{ minWidth: 200 }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedDrivers.map((driver) => (
                                <motion.tr
                                    key={driver.id}
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
                                    <TableCell>{driver.id}</TableCell>
                                    <TableCell>{driver.firstName}</TableCell>
                                    <TableCell>{driver.lastName}</TableCell>
                                    <TableCell>{driver.phoneNumber}</TableCell>
                                    <TableCell>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => navigate(`/drivers/edit/${driver.id}`)}
                                                sx={{ mr: 1, mb: 1 }}
                                            >
                                                Редактировать
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDelete(driver.id)}
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

export default DriverList;