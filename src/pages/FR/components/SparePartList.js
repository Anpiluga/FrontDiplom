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
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    CircularProgress,
} from '@mui/material';
import {
    Edit,
    Delete,
    Add,
    Category,
    Search,
    Inventory,
    CurrencyRuble,
    Build,
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

const SparePartList = () => {
    const navigate = useNavigate();
    const [spareParts, setSpareParts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const categories = {
        'CONSUMABLES': { name: 'Расходники', color: '#ff8c38' },
        'OILS': { name: 'Масла', color: '#76ff7a' },
        'TECHNICAL_FLUIDS': { name: 'Пр. технические жидкости', color: '#2196f3' },
        'ENGINE_ELEMENTS': { name: 'Элементы двигателя', color: '#f44336' },
        'ENGINE_FUEL_SYSTEM': { name: 'Система питания двигателя', color: '#9c27b0' },
        'ENGINE_EXHAUST_SYSTEM': { name: 'Система выпуска газов двигателя', color: '#ff9800' },
        'COOLING_SYSTEM': { name: 'Система охлаждения', color: '#00bcd4' },
        'BODY_ELEMENTS': { name: 'Элементы кузова', color: '#795548' },
        'INSTRUMENTS_EQUIPMENT': { name: 'Приборы и доп. оборудование', color: '#607d8b' },
        'ELECTRICAL_EQUIPMENT': { name: 'Электрооборудование', color: '#ffeb3b' },
        'BRAKES': { name: 'Тормоза', color: '#e91e63' },
        'STEERING': { name: 'Рулевое управление', color: '#8bc34a' },
        'WHEELS_HUBS': { name: 'Колёса и ступицы', color: '#cddc39' },
        'SUSPENSION_ELEMENTS': { name: 'Элементы подвески', color: '#ffc107' },
        'FRAME_ELEMENTS': { name: 'Элементы рамы', color: '#ff5722' },
        'TRANSMISSION': { name: 'Коробка передач', color: '#3f51b5' },
        'CLUTCH_ELEMENTS': { name: 'Элементы сцепления', color: '#009688' },
        'OTHER': { name: 'Прочее', color: '#9e9e9e' },
    };

    const units = {
        'PIECES': 'шт.',
        'LITERS': 'л.',
        'METERS': 'м.',
        'RUNNING_METERS': 'пог. м.',
        'UNITS': 'ед.'
    };

    useEffect(() => {
        fetchSpareParts();
    }, []);

    const fetchSpareParts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:8080/admin/spare-parts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.data) {
                setSpareParts(response.data);
            } else {
                setError('Получены некорректные данные от сервера');
            }
        } catch (err) {
            console.error('Error fetching spare parts', err);
            if (err.response) {
                if (err.response.status === 403) {
                    setError('Ошибка доступа при загрузке запчастей. Срок действия сессии мог истечь.');
                    setTimeout(() => navigate('/login'), 2000);
                } else if (err.response.status === 404) {
                    setError('API для получения запчастей не найден. Пожалуйста, убедитесь, что сервер запущен и API доступен.');
                } else {
                    setError(`Ошибка при загрузке запчастей: ${err.response.status} ${err.response.statusText}`);
                }
            } else if (err.request) {
                setError('Не удалось получить ответ от сервера. Пожалуйста, проверьте соединение и доступность сервера.');
            } else {
                setError(`Ошибка при загрузке запчастей: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту запчасть?')) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            await axios.delete(`http://localhost:8080/admin/spare-parts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setSpareParts(spareParts.filter((part) => part.id !== id));
        } catch (err) {
            console.error('Error deleting spare part', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа при удалении запчасти. Срок действия сессии мог истечь.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при удалении запчасти. Пожалуйста, попробуйте снова позже.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm) {
            fetchSpareParts();
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/admin/spare-parts/search?name=${searchTerm}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setSpareParts(response.data);
        } catch (err) {
            console.error('Error searching spare parts', err);
            setError('Ошибка при поиске запчастей');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryFilter = async (category) => {
        setCategoryFilter(category);
        if (!category) {
            fetchSpareParts();
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/admin/spare-parts/category/${category}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            setSpareParts(response.data);
        } catch (err) {
            console.error('Error filtering spare parts', err);
            setError('Ошибка при фильтрации запчастей');
        } finally {
            setLoading(false);
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

    const sortedSpareParts = [...spareParts].sort((a, b) => a.id - b.id);

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
                        Запчасти на складе
                    </Typography>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="contained"
                            onClick={() => navigate('/spare-parts/add')}
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
                            Добавить запчасть
                        </Button>
                    </motion.div>
                </Box>

                {/* Фильтры и поиск */}
                <Box sx={{ mb: 4, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                            label="Поиск по названию"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: '250px' }}
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
                    </Box>

                    <FormControl size="small" sx={{ minWidth: '200px' }}>
                        <InputLabel>Фильтр по категории</InputLabel>
                        <Select
                            value={categoryFilter}
                            onChange={(e) => handleCategoryFilter(e.target.value)}
                            label="Фильтр по категории"
                        >
                            <MenuItem value="">Все категории</MenuItem>
                            {Object.entries(categories).map(([key, value]) => (
                                <MenuItem key={key} value={key}>
                                    {value.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {(searchTerm || categoryFilter) && (
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setSearchTerm('');
                                setCategoryFilter('');
                                fetchSpareParts();
                            }}
                            sx={{
                                borderColor: '#ff8c38',
                                color: '#ff8c38',
                                '&:hover': {
                                    borderColor: '#76ff7a',
                                    color: '#76ff7a',
                                }
                            }}
                        >
                            Сбросить фильтры
                        </Button>
                    )}
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
                                <TableCell sx={{ minWidth: 200 }}>Название</TableCell>
                                <TableCell sx={{ minWidth: 180 }}>Категория</TableCell>
                                <TableCell sx={{ minWidth: 150 }}>Производитель</TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>Цена за ед.</TableCell>
                                <TableCell align="center" sx={{ minWidth: 100 }}>Количество</TableCell>
                                <TableCell align="center" sx={{ minWidth: 80 }}>Ед. изм.</TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>Общая сумма</TableCell>
                                <TableCell sx={{ minWidth: 200 }}>Описание</TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedSpareParts.map((part) => {
                                const categoryInfo = categories[part.category] || { name: 'Неизвестно', color: '#9e9e9e' };

                                return (
                                    <TableRow
                                        key={part.id}
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
                                        <TableCell align="center">{part.id}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Inventory sx={{ mr: 1, color: '#ff8c38' }} />
                                                <Typography sx={{ fontWeight: 'bold' }}>
                                                    {part.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={<Category />}
                                                label={categoryInfo.name}
                                                size="small"
                                                sx={{
                                                    backgroundColor: `${categoryInfo.color}20`,
                                                    color: categoryInfo.color,
                                                    fontWeight: 'bold',
                                                    border: `1px solid ${categoryInfo.color}`,
                                                    px: 1
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Build sx={{ mr: 1, color: '#76ff7a', fontSize: '1.2rem' }} />
                                                <Typography>{part.manufacturer}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CurrencyRuble sx={{ mr: 1, color: '#4caf50', fontSize: '1.2rem' }} />
                                                <Typography>{formatCurrency(part.pricePerUnit)}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography sx={{ fontWeight: 'bold' }}>{part.quantity}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography>{units[part.unit] || part.unit}</Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CurrencyRuble sx={{ mr: 1, color: '#ff8c38', fontSize: '1.2rem' }} />
                                                <Typography sx={{ fontWeight: 'bold', color: '#ff8c38' }}>
                                                    {formatCurrency(part.totalSum)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    maxWidth: 200,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                title={part.description}
                                            >
                                                {part.description || 'Нет описания'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                <Tooltip title="Редактировать">
                                                    <IconButton
                                                        onClick={() => navigate(`/spare-parts/edit/${part.id}`)}
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
                                                        onClick={() => handleDelete(part.id)}
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

                            {sortedSpareParts.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                            Список запчастей пуст
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

export default SparePartList;