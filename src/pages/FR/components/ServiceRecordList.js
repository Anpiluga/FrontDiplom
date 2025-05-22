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
    CircularProgress,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Slider,
    Collapse,
} from '@mui/material';
import {
    Edit,
    Delete,
    Add,
    Assignment,
    DirectionsCar,
    CurrencyRuble,
    CalendarToday,
    Speed,
    Search,
    ExpandMore,
    ExpandLess,
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

const ServiceRecordList = () => {
    const navigate = useNavigate();
    const [serviceRecords, setServiceRecords] = useState([]);
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Фильтры
    const [searchTerm, setSearchTerm] = useState('');
    const [carFilter, setCarFilter] = useState('');
    const [startDateFromFilter, setStartDateFromFilter] = useState('');
    const [startDateToFilter, setStartDateToFilter] = useState('');
    const [endDateFromFilter, setEndDateFromFilter] = useState('');
    const [endDateToFilter, setEndDateToFilter] = useState('');
    const [minCost, setMinCost] = useState(0);
    const [maxCost, setMaxCost] = useState(100000);

    useEffect(() => {
        fetchServiceRecords();
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await axios.get('http://localhost:8080/admin/cars', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setCars(response.data || []);
        } catch (err) {
            console.error('Error fetching cars', err);
        }
    };

    const fetchServiceRecords = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            let url = 'http://localhost:8080/admin/service-records';
            const params = new URLSearchParams();

            if (searchTerm) params.append('search', searchTerm);
            if (carFilter) params.append('carId', carFilter);
            if (startDateFromFilter) params.append('startDateFrom', startDateFromFilter);
            if (startDateToFilter) params.append('startDateTo', startDateToFilter);
            if (endDateFromFilter) params.append('endDateFrom', endDateFromFilter);
            if (endDateToFilter) params.append('endDateTo', endDateToFilter);
            if (minCost > 0) params.append('minCost', minCost);
            if (maxCost < 100000) params.append('maxCost', maxCost);

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
                setServiceRecords(response.data);
            } else {
                setError('Получены некорректные данные от сервера');
            }
        } catch (err) {
            console.error('Error fetching service records', err);
            if (err.response) {
                if (err.response.status === 403) {
                    setError('Ошибка доступа при загрузке сервисных записей. Срок действия сессии мог истечь.');
                    setTimeout(() => navigate('/login'), 2000);
                } else if (err.response.status === 404) {
                    setError('API для получения сервисных записей не найден. Пожалуйста, убедитесь, что сервер запущен и API доступен.');
                } else {
                    setError(`Ошибка при загрузке сервисных записей: ${err.response.status} ${err.response.statusText}`);
                }
            } else if (err.request) {
                setError('Не удалось получить ответ от сервера. Пожалуйста, проверьте соединение и доступность сервера.');
            } else {
                setError(`Ошибка при загрузке сервисных записей: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту сервисную запись?')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            await axios.delete(`http://localhost:8080/admin/service-records/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setServiceRecords(serviceRecords.filter((record) => record.id !== id));
        } catch (err) {
            console.error('Error deleting service record', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа при удалении записи. Срок действия сессии мог истечь.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при удалении сервисной записи. Пожалуйста, попробуйте снова позже.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchServiceRecords();
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCarFilter('');
        setStartDateFromFilter('');
        setStartDateToFilter('');
        setEndDateFromFilter('');
        setEndDateToFilter('');
        setMinCost(0);
        setMaxCost(100000);
        setTimeout(() => {
            fetchServiceRecords();
        }, 100);
    };

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('ru-RU');
        } catch (e) {
            return 'Некорректная дата';
        }
    };

    const getStatusColor = (startDate, plannedEndDate) => {
        const today = new Date();
        const start = new Date(startDate);
        const plannedEnd = plannedEndDate ? new Date(plannedEndDate) : null;

        if (start > today) {
            return { color: '#2196f3', label: 'Запланировано' };
        } else if (plannedEnd && today > plannedEnd) {
            return { color: '#f44336', label: 'Просрочено' };
        } else {
            return { color: '#ff9800', label: 'В работе' };
        }
    };

    const sortedServiceRecords = [...serviceRecords].sort((a, b) => b.id - a.id);

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
                        Сервисные записи
                    </Typography>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/service-records/add')}
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
                            Добавить запись
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
                            placeholder="Поиск по автомобилю или деталям..."
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
                                        <InputLabel>Автомобиль</InputLabel>
                                        <Select
                                            value={carFilter}
                                            onChange={(e) => setCarFilter(e.target.value)}
                                            label="Автомобиль"
                                        >
                                            <MenuItem value="">Все автомобили</MenuItem>
                                            {cars.map((car) => (
                                                <MenuItem key={car.id} value={car.id}>
                                                    {car.brand} {car.model} ({car.licensePlate})
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Дата начала с"
                                        type="date"
                                        value={startDateFromFilter}
                                        onChange={(e) => setStartDateFromFilter(e.target.value)}
                                        size="small"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Дата начала по"
                                        type="date"
                                        value={startDateToFilter}
                                        onChange={(e) => setStartDateToFilter(e.target.value)}
                                        size="small"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Дата окончания с"
                                        type="date"
                                        value={endDateFromFilter}
                                        onChange={(e) => setEndDateFromFilter(e.target.value)}
                                        size="small"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Дата окончания по"
                                        type="date"
                                        value={endDateToFilter}
                                        onChange={(e) => setEndDateToFilter(e.target.value)}
                                        size="small"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle1" sx={{ mb: 2, color: '#ff8c38', fontWeight: 'bold' }}>
                                        Диапазон стоимости: {minCost} ₽ - {maxCost} ₽
                                    </Typography>
                                    <Slider
                                        value={[minCost, maxCost]}
                                        onChange={(e, newValue) => {
                                            setMinCost(newValue[0]);
                                            setMaxCost(newValue[1]);
                                        }}
                                        valueLabelDisplay="auto"
                                        min={0}
                                        max={100000}
                                        step={1000}
                                        sx={{
                                            color: '#ff8c38',
                                            '& .MuiSlider-thumb': {
                                                backgroundColor: '#ff8c38',
                                            },
                                            '& .MuiSlider-track': {
                                                backgroundColor: '#ff8c38',
                                            },
                                            '& .MuiSlider-rail': {
                                                backgroundColor: 'rgba(255, 140, 56, 0.3)',
                                            },
                                        }}
                                    />
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
                                <TableCell sx={{ minWidth: 200 }}>Автомобиль</TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>Счётчик</TableCell>
                                <TableCell sx={{ minWidth: 120 }}>Дата начала</TableCell>
                                <TableCell sx={{ minWidth: 120 }}>План. окончание</TableCell>
                                <TableCell sx={{ minWidth: 300 }}>Детали</TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>Сумма</TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>Статус</TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedServiceRecords.map((record) => {
                                const statusInfo = getStatusColor(record.startDate, record.plannedEndDate);

                                return (
                                    <TableRow
                                        key={record.id}
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
                                        <TableCell align="center">{record.id}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <DirectionsCar sx={{ mr: 1, color: '#ff8c38' }} />
                                                <Typography sx={{ fontWeight: 'bold' }}>
                                                    {record.carDetails}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Speed sx={{ mr: 1, color: '#76ff7a', fontSize: '1.2rem' }} />
                                                <Typography>{record.counterReading}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarToday sx={{ mr: 1, color: '#2196f3', fontSize: '1.2rem' }} />
                                                <Typography>{formatDate(record.startDate)}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {record.plannedEndDate ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <CalendarToday sx={{ mr: 1, color: '#ff9800', fontSize: '1.2rem' }} />
                                                    <Typography>{formatDate(record.plannedEndDate)}</Typography>
                                                </Box>
                                            ) : (
                                                <Typography sx={{ color: 'text.secondary' }}>Не указано</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    maxWidth: 300,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                title={record.details}
                                            >
                                                {record.details || 'Нет описания'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {record.totalCost ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <CurrencyRuble sx={{ mr: 1, color: '#4caf50', fontSize: '1.2rem' }} />
                                                    <Typography sx={{ fontWeight: 'bold' }}>{record.totalCost} ₽</Typography>
                                                </Box>
                                            ) : (
                                                <Typography sx={{ color: 'text.secondary' }}>Не указано</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={statusInfo.label}
                                                size="small"
                                                sx={{
                                                    backgroundColor: `${statusInfo.color}20`,
                                                    color: statusInfo.color,
                                                    fontWeight: 'bold',
                                                    border: `1px solid ${statusInfo.color}`,
                                                    px: 1
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Tooltip title="Редактировать">
                                                    <IconButton
                                                        onClick={() => navigate(`/service-records/edit/${record.id}`)}
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
                                                        onClick={() => handleDelete(record.id)}
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
                                );
                            })}

                            {sortedServiceRecords.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                            Список сервисных записей пуст
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

export default ServiceRecordList;