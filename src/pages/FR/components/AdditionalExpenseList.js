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
    CircularProgress,
} from '@mui/material';
import {
    Edit,
    Delete,
    Add,
    AttachMoney,
    DirectionsCar,
    CurrencyRuble,
    CalendarToday,
    Description,
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

const AdditionalExpenseList = () => {
    const navigate = useNavigate();
    const [expenses, setExpenses] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchExpenses = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:8080/admin/additional-expenses', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (response.data) {
                    setExpenses(response.data);
                } else {
                    setError('Получены некорректные данные от сервера');
                }
            } catch (err) {
                console.error('Error fetching additional expenses', err);
                if (err.response) {
                    if (err.response.status === 403) {
                        setError('Ошибка доступа при загрузке расходов. Срок действия сессии мог истечь.');
                        setTimeout(() => navigate('/login'), 2000);
                    } else if (err.response.status === 404) {
                        setError('API для получения расходов не найден. Пожалуйста, убедитесь, что сервер запущен и API доступен.');
                    } else {
                        setError(`Ошибка при загрузке расходов: ${err.response.status} ${err.response.statusText}`);
                    }
                } else if (err.request) {
                    setError('Не удалось получить ответ от сервера. Пожалуйста, проверьте соединение и доступность сервера.');
                } else {
                    setError(`Ошибка при загрузке расходов: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, [navigate]);

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот расход?')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            await axios.delete(`http://localhost:8080/admin/additional-expenses/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setExpenses(expenses.filter((expense) => expense.id !== id));
        } catch (err) {
            console.error('Error deleting additional expense', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа при удалении расхода. Срок действия сессии мог истечь.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при удалении расхода. Пожалуйста, попробуйте снова позже.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Некорректная дата';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const sortedExpenses = [...expenses].sort((a, b) => b.id - a.id);

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
                        Дополнительные расходы
                    </Typography>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/additional-expenses/add')}
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
                            Добавить расход
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

                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress color="primary" />
                    </Box>
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
                                <TableCell sx={{ minWidth: 200 }}>Автомобиль</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>Тип расхода</TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>Сумма</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>Дата и время</TableCell>
                                <TableCell sx={{ minWidth: 300 }}>Описание</TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedExpenses.map((expense) => (
                                <TableRow
                                    key={expense.id}
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
                                    <TableCell align="center">{expense.id}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <DirectionsCar sx={{ mr: 1, color: '#ff8c38' }} />
                                            <Typography sx={{ fontWeight: 'bold' }}>
                                                {expense.carDetails}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AttachMoney sx={{ mr: 1, color: '#76ff7a', fontSize: '1.2rem' }} />
                                            <Typography>{expense.type}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CurrencyRuble sx={{ mr: 1, color: '#4caf50', fontSize: '1.2rem' }} />
                                            <Typography sx={{ fontWeight: 'bold' }}>
                                                {formatCurrency(expense.price)}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <CalendarToday sx={{ mr: 1, color: '#2196f3', fontSize: '1.2rem' }} />
                                            <Typography>{formatDateTime(expense.dateTime)}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Description sx={{ mr: 1, color: '#9c27b0', fontSize: '1.2rem' }} />
                                            <Typography
                                                sx={{
                                                    maxWidth: 300,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                title={expense.description}
                                            >
                                                {expense.description || 'Нет описания'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="Редактировать">
                                                <IconButton
                                                    onClick={() => navigate(`/additional-expenses/edit/${expense.id}`)}
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
                                                    onClick={() => handleDelete(expense.id)}
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

                            {sortedExpenses.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                            Список дополнительных расходов пуст
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

export default AdditionalExpenseList;