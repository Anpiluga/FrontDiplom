import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    TextField,
    Select,
    MenuItem,
    Button,
    Box,
    Grid,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Divider,
    CircularProgress,
} from '@mui/material';
import { Task, Assignment, Info } from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';

const ServiceTaskForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateToken } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        serviceRecordId: '',
        taskName: '',
        taskDescription: '',
    });
    const [serviceRecords, setServiceRecords] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedServiceRecordInfo, setSelectedServiceRecordInfo] = useState(null);

    useEffect(() => {
        const fetchServiceRecords = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Ошибка авторизации: токен отсутствует');
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:8080/admin/service-records', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
                setServiceRecords(response.data);
            } catch (err) {
                console.error('Error fetching service records', err);
                if (err.response?.status === 403) {
                    setError('Ошибка доступа при загрузке сервисных записей. Проверьте ваши права доступа.');
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    setError('Ошибка при загрузке сервисных записей. Пожалуйста, попробуйте снова позже.');
                }
            }
        };

        const fetchServiceTask = async () => {
            if (id) {
                try {
                    const token = localStorage.getItem('token');

                    if (!token) {
                        setError('Ошибка авторизации: токен отсутствует');
                        navigate('/login');
                        return;
                    }

                    const response = await axios.get(`http://localhost:8080/admin/service-tasks/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                    });

                    if (response.data) {
                        setFormData({
                            serviceRecordId: response.data.serviceRecordId,
                            taskName: response.data.taskName,
                            taskDescription: response.data.taskDescription || '',
                        });

                        // Находим информацию о выбранной сервисной записи
                        const selectedRecord = serviceRecords.find(record => record.id === response.data.serviceRecordId);
                        setSelectedServiceRecordInfo(selectedRecord);
                    } else {
                        setError('Получены некорректные данные от сервера');
                    }
                } catch (err) {
                    console.error('Error fetching service task', err);
                    if (err.response && err.response.status === 403) {
                        setError('Ошибка доступа: у вас нет прав для просмотра этой сервисной задачи');
                        setTimeout(() => navigate('/login'), 2000);
                    } else {
                        setError(`Ошибка при загрузке сервисной задачи: ${err.message}`);
                    }
                }
            }
        };

        fetchServiceRecords();
        fetchServiceTask();
    }, [id, navigate]);

    // Обновляем информацию о выбранной сервисной записи при изменении списка записей
    useEffect(() => {
        if (formData.serviceRecordId && serviceRecords.length > 0) {
            const selectedRecord = serviceRecords.find(record => record.id.toString() === formData.serviceRecordId.toString());
            setSelectedServiceRecordInfo(selectedRecord);
        }
    }, [formData.serviceRecordId, serviceRecords]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'serviceRecordId') {
            const selectedRecord = serviceRecords.find(record => record.id.toString() === value.toString());
            setSelectedServiceRecordInfo(selectedRecord);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации: токен отсутствует');
                navigate('/login');
                return;
            }

            const data = {
                serviceRecordId: parseInt(formData.serviceRecordId),
                taskName: formData.taskName,
                taskDescription: formData.taskDescription,
            };

            if (id) {
                await axios.put(`http://localhost:8080/admin/service-tasks/${id}`, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            } else {
                await axios.post('http://localhost:8080/admin/service-tasks', data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });
            }
            navigate('/service-tasks');
        } catch (err) {
            console.error('Error saving service task', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа: у вас нет прав для сохранения сервисной задачи');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при сохранении сервисной задачи');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'Не указано';
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return '#4caf50';
            case 'IN_PROGRESS':
                return '#ff9800';
            case 'CANCELLED':
                return '#f44336';
            case 'PLANNED':
            default:
                return '#2196f3';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'COMPLETED':
                return 'Выполнено';
            case 'IN_PROGRESS':
                return 'В работе';
            case 'CANCELLED':
                return 'Отменено';
            case 'PLANNED':
            default:
                return 'Запланировано';
        }
    };

    return (
        <Container
            maxWidth={false}
            sx={{
                mt: 6,
                pt: 4,
                px: 4,
                height: 'calc(100vh - 120px)',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
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
                    {id ? 'Редактировать сервисную задачу' : 'Добавить сервисную задачу'}
                </Typography>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 4,
                            maxWidth: '900px',
                            mx: 'auto',
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <CircularProgress color="primary" />
                    </Box>
                )}
            </motion.div>

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Paper
                    sx={{
                        maxWidth: '1200px',
                        width: '100%',
                        mx: 'auto',
                        p: 5,
                        borderRadius: '16px',
                        border: '2px solid transparent',
                        borderImage: 'linear-gradient(45deg, #ff8c38, #76ff7a) 1',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(44, 27, 71, 0.9)'
                                : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 4
                    }}>
                        <Task sx={{ fontSize: 32, color: '#ff8c38', mr: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Данные о сервисной задаче
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Grid container spacing={5} sx={{ flex: 1 }}>
                        <Grid item xs={12}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <FormControl
                                    fullWidth
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: '56px',
                                            background: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(0, 0, 0, 0.05)',
                                        },
                                        '& .MuiSelect-select': {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }
                                    }}
                                >
                                    <InputLabel>Сервисная запись</InputLabel>
                                    <Select
                                        name="serviceRecordId"
                                        value={formData.serviceRecordId || ''}
                                        onChange={handleChange}
                                        label="Сервисная запись"
                                        required
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    maxHeight: 300,
                                                    background: (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(44, 27, 71, 0.95)'
                                                            : 'rgba(255, 255, 255, 0.95)',
                                                    backdropFilter: 'blur(10px)',
                                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
                                                }
                                            }
                                        }}
                                        startAdornment={
                                            formData.serviceRecordId ? <Assignment sx={{ color: '#ff8c38', mr: 1 }} /> : null
                                        }
                                    >
                                        <MenuItem value="" disabled>
                                            Выберите сервисную запись
                                        </MenuItem>
                                        {serviceRecords.map((record) => (
                                            <MenuItem
                                                key={record.id}
                                                value={record.id}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    py: 1.5
                                                }}
                                            >
                                                <Assignment sx={{ color: '#ff8c38' }} />
                                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                    <Typography sx={{ fontWeight: 'bold' }}>
                                                        ID {record.id} - {record.carDetails}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Одометр: {record.counterReading} км •
                                                        Начата: {formatDateTime(record.startDateTime)} •
                                                        Статус: {getStatusLabel(record.status)}
                                                    </Typography>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </motion.div>
                        </Grid>

                        {/* Информация о выбранной сервисной записи */}
                        {selectedServiceRecordInfo && (
                            <Grid item xs={12}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                >
                                    <Paper
                                        sx={{
                                            p: 3,
                                            background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.2))',
                                            border: '1px solid #2196f3',
                                            borderRadius: '12px',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Info sx={{ color: '#2196f3', mr: 1 }} />
                                            <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                                                Детали сервисной записи
                                            </Typography>
                                        </Box>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={3}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Автомобиль:
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {selectedServiceRecordInfo.carDetails}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Показание одометра:
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {selectedServiceRecordInfo.counterReading} км
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Дата начала:
                                                </Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {formatDateTime(selectedServiceRecordInfo.startDateTime)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={3}>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                    Статус:
                                                </Typography>
                                                <Box sx={{
                                                    display: 'inline-block',
                                                    px: 2,
                                                    py: 0.5,
                                                    borderRadius: '12px',
                                                    backgroundColor: `${getStatusColor(selectedServiceRecordInfo.status)}20`,
                                                    border: `1px solid ${getStatusColor(selectedServiceRecordInfo.status)}`,
                                                    color: getStatusColor(selectedServiceRecordInfo.status),
                                                    fontWeight: 'bold',
                                                    fontSize: '0.875rem'
                                                }}>
                                                    {getStatusLabel(selectedServiceRecordInfo.status)}
                                                </Box>
                                            </Grid>
                                            {selectedServiceRecordInfo.details && (
                                                <Grid item xs={12}>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                                        Детали работ:
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {selectedServiceRecordInfo.details}
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Paper>
                                </motion.div>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Название задачи"
                                    name="taskName"
                                    value={formData.taskName}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    placeholder="например, Замена масла"
                                    sx={{
                                        '& .MuiInputBase-root': {
                                            height: '56px',
                                        }
                                    }}
                                />
                            </motion.div>
                        </Grid>

                        <Grid item xs={12}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Описание задачи"
                                    name="taskDescription"
                                    multiline
                                    rows={6}
                                    value={formData.taskDescription}
                                    onChange={handleChange}
                                    variant="outlined"
                                    placeholder="Подробное описание выполняемой задачи..."
                                />
                            </motion.div>
                        </Grid>
                    </Grid>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, gap: 3 }}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="contained"
                            type="submit"
                            disabled={loading}
                            sx={{
                                px: 5,
                                py: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                color: '#1a1a1a',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #76ff7a, #ff8c38)',
                                },
                                '&:disabled': {
                                    background: 'rgba(255, 255, 255, 0.3)',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : (id ? 'Обновить' : 'Сохранить')}
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/service-tasks')}
                            disabled={loading}
                            sx={{
                                px: 5,
                                py: 1.5,
                                borderRadius: '12px',
                                borderColor: '#ff8c38',
                                borderWidth: '2px',
                                color: '#ff8c38',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                '&:hover': {
                                    borderWidth: '2px',
                                    borderColor: '#76ff7a',
                                    color: '#76ff7a',
                                },
                                '&:disabled': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                }
                            }}
                        >
                            Отмена
                        </Button>
                    </motion.div>
                </Box>
            </Box>
        </Container>
    );
};

export default ServiceTaskForm;