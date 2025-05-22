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
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Collapse,
} from '@mui/material';
import {
    Edit,
    Delete,
    Add,
    Task,
    Assignment,
    Search,
    ExpandMore,
    ExpandLess,
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

const ServiceTaskList = () => {
    const navigate = useNavigate();
    const [serviceTasks, setServiceTasks] = useState([]);
    const [serviceRecords, setServiceRecords] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Фильтры
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceRecordFilter, setServiceRecordFilter] = useState('');

    useEffect(() => {
        fetchServiceTasks();
        fetchServiceRecords();
    }, []);

    const fetchServiceRecords = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://localhost:8080/admin/service-records', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setServiceRecords(response.data || []);
        } catch (err) {
            console.error('Error fetching service records', err);
        }
    };

    const fetchServiceTasks = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            let url = 'http://localhost:8080/admin/service-tasks';
            const params = new URLSearchParams();

            if (searchTerm) params.append('search', searchTerm);
            if (serviceRecordFilter) params.append('serviceRecordId', serviceRecordFilter);

            if (params.toString()) {
                url += `/filter?${params.toString()}`;
            }

            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.data) {
                setServiceTasks(response.data);
            } else {
                setError('Получены некорректные данные от сервера');
            }
        } catch (err) {
            console.error('Error fetching service tasks', err);
            if (err.response) {
                if (err.response.status === 403) {
                    setError('Ошибка доступа при загрузке сервисных задач. Срок действия сессии мог истечь.');
                    setTimeout(() => navigate('/login'), 2000);
                } else if (err.response.status === 404) {
                    setError('API для получения сервисных задач не найден. Пожалуйста, убедитесь, что сервер запущен и API доступен.');
                } else {
                    setError(`Ошибка при загрузке сервисных задач: ${err.response.status} ${err.response.statusText}`);
                }
            } else if (err.request) {
                setError('Не удалось получить ответ от сервера. Пожалуйста, проверьте соединение и доступность сервера.');
            } else {
                setError(`Ошибка при загрузке сервисных задач: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту сервисную задачу?')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            await axios.delete(`http://localhost:8080/admin/service-tasks/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setServiceTasks(serviceTasks.filter((task) => task.id !== id));
        } catch (err) {
            console.error('Error deleting service task', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа при удалении задачи. Срок действия сессии мог истечь.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при удалении сервисной задачи. Пожалуйста, попробуйте снова позже.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchServiceTasks();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setServiceRecordFilter('');
        setTimeout(() => {
            fetchServiceTasks();
        }, 100);
    };

    const sortedServiceTasks = [...serviceTasks].sort((a, b) => b.id - a.id);

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
                        Сервисные задачи
                    </Typography>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/service-tasks/add')}
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
                            Добавить задачу
                        </Button>
                    </motion.div>
                </Box>

                {/* Фильтры */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                        <TextField
                            label="Поиск"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: '250px' }}
                            placeholder="Поиск по названию задачи или описанию..."
                        />
                        <IconButton
                            onClick={handleSearch}
                            sx={{
                                color: '#ff8c38',
                                '&:hover': { backgroundColor: 'rgba(255, 140, 56, 0.1)' }
                            }}
                        >
                            <Search />
                        </IconButton>
                        <Button
                            variant="outlined"
                            startIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                            onClick={() => setShowFilters(!showFilters)}
                            sx={{
                                borderColor: '#ff8c38',
                                color: '#ff8c38',
                                '&:hover': {
                                    borderColor: '#76ff7a',
                                    color: '#76ff7a',
                                }
                            }}
                        >
                            Фильтры
                        </Button>
                    </Box>

                    <Collapse in={showFilters}>
                        <Box sx={{
                            p: 3,
                            border: '1px solid rgba(255, 140, 56, 0.3)',
                            borderRadius: '12px',
                            background: 'rgba(255, 140, 56, 0.05)',
                        }}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Сервисная запись</InputLabel>
                                        <Select
                                            value={serviceRecordFilter}
                                            onChange={(e) => setServiceRecordFilter(e.target.value)}
                                            label="Сервисная запись"
                                        >
                                            <MenuItem value="">Все записи</MenuItem>
                                            {serviceRecords.map((record) => (
                                                <MenuItem key={record.id} value={record.id}>
                                                    ID {record.id} - {record.carDetails} (начата: {new Date(record.startDate).toLocaleDateString('ru-RU')})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleSearch}
                                    sx={{
                                        background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                        color: '#1a1a1a',
                                    }}
                                >
                                    Применить фильтры
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={clearFilters}
                                    sx={{
                                        borderColor: '#ff8c38',
                                        color: '#ff8c38',
                                        '&:hover': {
                                            borderColor: '#76ff7a',
                                            color: '#76ff7a',
                                        }
                                    }}
                                >
                                    Сбросить
                                </Button>
                            </Box>
                        </Box>
                    </Collapse>
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
                                <TableCell sx={{ minWidth: 350 }}>Сервисная запись</TableCell>
                                <TableCell sx={{ minWidth: 200 }}>Задача</TableCell>
                                <TableCell sx={{ minWidth: 300 }}>Описание</TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedServiceTasks.map((task) => (
                                <TableRow
                                    key={task.id}
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
                                    <TableCell align="center">{task.id}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Assignment sx={{ mr: 1, color: '#ff8c38' }} />
                                            <Typography sx={{ fontWeight: 'bold' }}>
                                                {task.serviceRecordDetails}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Task sx={{ mr: 1, color: '#76ff7a', fontSize: '1.2rem' }} />
                                            <Typography sx={{ fontWeight: 'bold' }}>{task.taskName}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                maxWidth: 300,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}
                                            title={task.taskDescription}
                                        >
                                            {task.taskDescription || 'Нет описания'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <Tooltip title="Редактировать">
                                                <IconButton
                                                    onClick={() => navigate(`/service-tasks/edit/${task.id}`)}
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
                                                    onClick={() => handleDelete(task.id)}
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

                            {sortedServiceTasks.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                            Список сервисных задач пуст
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

export default ServiceTaskList;