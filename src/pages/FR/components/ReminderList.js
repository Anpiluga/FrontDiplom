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
    Chip,
    CircularProgress,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    IconButton,
} from '@mui/material';
import {
    NotificationsActive,
    DirectionsCar,
    CalendarToday,
    Speed,
    Settings,
    Warning,
    CheckCircle,
    Error,
    Add,
} from '@mui/icons-material';
import axios from 'axios';
import { motion } from 'framer-motion';

const ReminderList = () => {
    const navigate = useNavigate();
    const [reminders, setReminders] = useState([]);
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
    const [settingsForm, setSettingsForm] = useState({
        serviceIntervalKm: '',
        notificationThresholdKm: 500,
        notificationsEnabled: true
    });

    useEffect(() => {
        fetchReminders();
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

    const fetchReminders = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                navigate('/login');
                return;
            }

            const response = await axios.get('http://localhost:8080/admin/reminders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.data) {
                setReminders(response.data);
                setError('');
            } else {
                setError('Получены некорректные данные от сервера');
            }
        } catch (err) {
            console.error('Error fetching reminders', err);
            if (err.response) {
                if (err.response.status === 403) {
                    setError('Ошибка доступа при загрузке напоминаний. Срок действия сессии мог истечь.');
                    setTimeout(() => navigate('/login'), 2000);
                } else if (err.response.status === 404) {
                    setError('API для получения напоминаний не найден. Пожалуйста, убедитесь, что сервер запущен и API доступен.');
                } else {
                    setError(`Ошибка при загрузке напоминаний: ${err.response.status} ${err.response.statusText}`);
                }
            } else if (err.request) {
                setError('Не удалось получить ответ от сервера. Пожалуйста, проверьте соединение и доступность сервера.');
            } else {
                setError(`Ошибка при загрузке напоминаний: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSettings = async (carId) => {
        setSelectedCar(carId);
        setOpenSettingsDialog(true);

        // Пытаемся загрузить существующие настройки
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/admin/reminders/settings/car/${carId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (response.data) {
                setSettingsForm({
                    serviceIntervalKm: response.data.serviceIntervalKm || '',
                    notificationThresholdKm: response.data.notificationThresholdKm || 500,
                    notificationsEnabled: response.data.notificationsEnabled !== false
                });
            }
        } catch (err) {
            // Если настройки не найдены, используем значения по умолчанию
            setSettingsForm({
                serviceIntervalKm: '',
                notificationThresholdKm: 500,
                notificationsEnabled: true
            });
        }
    };

    const handleSaveSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации. Пожалуйста, войдите в систему.');
                return;
            }

            await axios.post('http://localhost:8080/admin/reminders/settings', {
                carId: selectedCar,
                serviceIntervalKm: parseInt(settingsForm.serviceIntervalKm),
                notificationThresholdKm: parseInt(settingsForm.notificationThresholdKm),
                notificationsEnabled: settingsForm.notificationsEnabled
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            setOpenSettingsDialog(false);
            fetchReminders(); // Обновляем список напоминаний
        } catch (err) {
            console.error('Error saving settings', err);
            if (err.response && err.response.status === 403) {
                setError('Ошибка доступа при сохранении настроек. Срок действия сессии мог истечь.');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError('Ошибка при сохранении настроек напоминаний.');
            }
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Не указано';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('ru-RU');
        } catch (e) {
            return 'Некорректная дата';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'OK':
                return <CheckCircle sx={{ color: '#4caf50', fontSize: '1.5rem' }} />;
            case 'WARNING':
                return <Warning sx={{ color: '#ff9800', fontSize: '1.5rem' }} />;
            case 'OVERDUE':
                return <Error sx={{ color: '#f44336', fontSize: '1.5rem' }} />;
            default:
                return <NotificationsActive sx={{ color: '#2196f3', fontSize: '1.5rem' }} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OK':
                return { color: '#4caf50', label: 'В норме' };
            case 'WARNING':
                return { color: '#ff9800', label: 'Внимание' };
            case 'OVERDUE':
                return { color: '#f44336', label: 'Просрочено' };
            default:
                return { color: '#2196f3', label: 'Не настроено' };
        }
    };

    const sortedReminders = [...reminders].sort((a, b) => {
        // Сначала просроченные, потом предупреждения, потом нормальные
        const statusOrder = { 'OVERDUE': 0, 'WARNING': 1, 'OK': 2 };
        return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
    });

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
                        Напоминания о ТО
                    </Typography>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="contained"
                            onClick={fetchReminders}
                            startIcon={<NotificationsActive />}
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
                            Обновить
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
                                <TableCell sx={{ width: 80 }}>Статус</TableCell>
                                <TableCell sx={{ minWidth: 250 }}>Автомобиль</TableCell>
                                <TableCell align="center" sx={{ minWidth: 150 }}>
                                    Интервал ТО (км)
                                </TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>
                                    Последнее ТО
                                </TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>
                                    Дата последнего ТО
                                </TableCell>
                                <TableCell align="center" sx={{ minWidth: 120 }}>
                                    Текущий одометр (км)
                                </TableCell>
                                <TableCell align="center" sx={{ minWidth: 150 }}>
                                    До следующего ТО
                                </TableCell>
                                <TableCell sx={{ minWidth: 300 }}>Сообщение</TableCell>
                                <TableCell align="center" sx={{ width: 120 }}>Действия</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedReminders.map((reminder) => {
                                const statusInfo = getStatusColor(reminder.status);

                                return (
                                    <TableRow
                                        key={reminder.carId}
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
                                        <TableCell>
                                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                {getStatusIcon(reminder.status)}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <DirectionsCar sx={{ mr: 1, color: '#ff8c38' }} />
                                                <Typography sx={{ fontWeight: 'bold' }}>
                                                    {reminder.carDetails}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                                    {reminder.serviceIntervalKm ? `${reminder.serviceIntervalKm} км` : 'Не указано'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                                    Интервал указан в сервисной книжке
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Speed sx={{ mr: 1, color: '#76ff7a', fontSize: '1.2rem' }} />
                                                <Typography>
                                                    {reminder.lastServiceOdometer ? `${reminder.lastServiceOdometer} км` : 'Нет данных'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CalendarToday sx={{ mr: 1, color: '#2196f3', fontSize: '1.2rem' }} />
                                                <Typography>
                                                    {formatDate(reminder.lastServiceDate)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Speed sx={{ mr: 1, color: '#ff8c38', fontSize: '1.2rem' }} />
                                                <Typography sx={{ fontWeight: 'bold' }}>
                                                    {reminder.currentOdometer ? `${reminder.currentOdometer}` : 'Не указано'}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={reminder.kmToNextService !== null
                                                    ? `${reminder.kmToNextService} км`
                                                    : 'Не рассчитано'
                                                }
                                                sx={{
                                                    backgroundColor: `${statusInfo.color}20`,
                                                    color: statusInfo.color,
                                                    fontWeight: 'bold',
                                                    border: `1px solid ${statusInfo.color}`,
                                                    fontSize: '0.9rem',
                                                    px: 1
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    maxWidth: 300,
                                                    color: statusInfo.color,
                                                    fontWeight: reminder.status === 'OVERDUE' ? 'bold' : 'normal'
                                                }}
                                            >
                                                {reminder.message || 'Нет сообщения'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Настроить напоминания">
                                                <IconButton
                                                    onClick={() => handleOpenSettings(reminder.carId)}
                                                    sx={{
                                                        color: '#ff8c38',
                                                        '&:hover': { backgroundColor: 'rgba(255, 140, 56, 0.1)' }
                                                    }}
                                                >
                                                    <Settings />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}

                            {sortedReminders.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                                            Нет данных о напоминаниях
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Диалог настроек */}
                <Dialog
                    open={openSettingsDialog}
                    onClose={() => setOpenSettingsDialog(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '16px',
                            background: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(44, 27, 71, 0.95)'
                                    : 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 140, 56, 0.3)',
                        }
                    }}
                >
                    <DialogTitle sx={{
                        color: '#ff8c38',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Settings sx={{ mr: 2 }} />
                        Настройки напоминаний
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ pt: 2 }}>
                            <TextField
                                fullWidth
                                label="Интервал ТО"
                                type="number"
                                value={settingsForm.serviceIntervalKm}
                                onChange={(e) => setSettingsForm({
                                    ...settingsForm,
                                    serviceIntervalKm: e.target.value
                                })}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">км</InputAdornment>,
                                }}
                                helperText="Интервал указан в сервисной книжке автомобиля (например: 10000 км, 15000 км)"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Предупреждать за"
                                type="number"
                                value={settingsForm.notificationThresholdKm}
                                onChange={(e) => setSettingsForm({
                                    ...settingsForm,
                                    notificationThresholdKm: e.target.value
                                })}
                                sx={{ mb: 3 }}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">км до ТО</InputAdornment>,
                                }}
                                helperText="За сколько километров до ТО показывать предупреждение (обычно 500-1000 км)"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button
                            onClick={() => setOpenSettingsDialog(false)}
                            sx={{
                                borderColor: '#ff8c38',
                                color: '#ff8c38',
                                '&:hover': {
                                    borderColor: '#76ff7a',
                                    color: '#76ff7a',
                                }
                            }}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleSaveSettings}
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                color: '#1a1a1a',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #76ff7a, #ff8c38)',
                                }
                            }}
                        >
                            Сохранить
                        </Button>
                    </DialogActions>
                </Dialog>
            </motion.div>
        </Container>
    );
};

export default ReminderList;