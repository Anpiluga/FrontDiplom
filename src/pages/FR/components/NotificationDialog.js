import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    IconButton,
    Tooltip,
    Alert,
    CircularProgress,
    Paper,
} from '@mui/material';
import {
    NotificationsActive,
    Warning,
    Error,
    Info,
    DirectionsCar,
    CalendarToday,
    Speed,
    Close,
    CheckCircle,
    Search,
    FilterList,
    Refresh,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from './useNotifications';

const NotificationDialog = ({ open, onClose }) => {
    const {
        notifications,
        loading,
        error,
        fetchNotifications,
        fetchNotificationStats,
        markAsRead,
        markAllAsRead,
        deactivateNotification,
        triggerNotificationCheck,
    } = useNotifications();

    const [stats, setStats] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    // Фильтры
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('priority');

    // Эффект для загрузки данных при открытии диалога
    useEffect(() => {
        if (open) {
            loadNotifications();
            loadStats();
        }
    }, [open]);

    // Эффект для обновления уведомлений при изменении фильтров
    useEffect(() => {
        if (open) {
            const delayedUpdate = setTimeout(() => {
                loadNotifications();
            }, 300); // Debounce для поиска

            return () => clearTimeout(delayedUpdate);
        }
    }, [searchTerm, typeFilter, statusFilter, sortBy, open]);

    const loadNotifications = async () => {
        await fetchNotifications({
            search: searchTerm,
            type: typeFilter,
            status: statusFilter,
            sortBy: sortBy,
        });
    };

    const loadStats = async () => {
        const statsData = await fetchNotificationStats();
        setStats(statsData);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const checkResult = await triggerNotificationCheck();

            await Promise.all([
                loadNotifications(),
                loadStats()
            ]);

            if (checkResult.success && checkResult.created > 0) {
                console.log(`Создано новых уведомлений: ${checkResult.created}`);
            }
        } catch (err) {
            console.error('Error refreshing notifications:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        const success = await markAsRead(notificationId);
        if (success) {
            await loadStats();
        }
    };

    const handleMarkAllAsRead = async () => {
        const success = await markAllAsRead();
        if (success) {
            setStats(prev => ({ ...prev, unread: 0 }));
        }
    };

    const handleDeactivateNotification = async (notificationId) => {
        const success = await deactivateNotification(notificationId);
        if (success) {
            await loadStats();
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'WARNING':
                return <Warning sx={{ color: '#ff9800' }} />;
            case 'OVERDUE':
                return <Error sx={{ color: '#f44336' }} />;
            case 'INFO':
                return <Info sx={{ color: '#2196f3' }} />;
            default:
                return <NotificationsActive sx={{ color: '#2196f3' }} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'WARNING':
                return '#ff9800';
            case 'OVERDUE':
                return '#f44336';
            case 'INFO':
                return '#2196f3';
            default:
                return '#2196f3';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'WARNING':
                return 'Предупреждение';
            case 'OVERDUE':
                return 'Просрочено';
            case 'INFO':
                return 'Информация';
            default:
                return 'Уведомление';
        }
    };

    const formatDateTime = (dateTime) => {
        try {
            const date = new Date(dateTime);
            const now = new Date();
            const diffInMinutes = Math.floor((now - date) / (1000 * 60));

            if (diffInMinutes < 1) {
                return 'только что';
            } else if (diffInMinutes < 60) {
                return `${diffInMinutes} мин. назад`;
            } else if (diffInMinutes < 1440) {
                const hours = Math.floor(diffInMinutes / 60);
                return `${hours} час${hours === 1 ? '' : hours < 5 ? 'а' : 'ов'} назад`;
            } else {
                return date.toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (e) {
            return 'Некорректная дата';
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setTypeFilter('all');
        setStatusFilter('all');
        setSortBy('priority');
    };

    const getNotificationPriority = (notification) => {
        if (notification.type === 'OVERDUE') return 0;
        if (notification.type === 'WARNING') return 1;
        if (!notification.read) return 2;
        return 3;
    };

    // Сортировка уведомлений
    const sortedNotifications = [...notifications].sort((a, b) => {
        if (sortBy === 'priority') {
            return getNotificationPriority(a) - getNotificationPriority(b);
        } else if (sortBy === 'date') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'km') {
            if (a.kmToNextService === null && b.kmToNextService === null) return 0;
            if (a.kmToNextService === null) return 1;
            if (b.kmToNextService === null) return -1;
            return a.kmToNextService - b.kmToNextService;
        } else if (sortBy === 'car') {
            return a.carDetails.localeCompare(b.carDetails);
        }
        return 0;
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
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
                    minHeight: '80vh',
                    maxHeight: '90vh',
                }
            }}
        >
            <DialogTitle sx={{
                color: '#ff8c38',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <NotificationsActive sx={{ mr: 2, fontSize: '2rem' }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Уведомления о ТО
                    </Typography>
                    {(stats.unread || 0) > 0 && (
                        <Chip
                            label={`${stats.unread} новых`}
                            size="small"
                            sx={{
                                ml: 2,
                                backgroundColor: '#f44336',
                                color: 'white',
                                fontWeight: 'bold',
                                animation: 'pulse 2s infinite',
                                '@keyframes pulse': {
                                    '0%': { opacity: 1 },
                                    '50%': { opacity: 0.7 },
                                    '100%': { opacity: 1 },
                                },
                            }}
                        />
                    )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Обновить уведомления">
                        <IconButton
                            onClick={handleRefresh}
                            disabled={refreshing}
                            sx={{ color: '#ff8c38' }}
                        >
                            <Refresh sx={{
                                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                                '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' },
                                }
                            }} />
                        </IconButton>
                    </Tooltip>
                    <IconButton onClick={onClose} sx={{ color: '#ff8c38' }}>
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* Статистика */}
                {Object.keys(stats).length > 0 && (
                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 140, 56, 0.3)' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    background: 'rgba(255, 140, 56, 0.1)',
                                    border: '1px solid rgba(255, 140, 56, 0.3)'
                                }}>
                                    <Typography variant="h4" sx={{ color: '#ff8c38', fontWeight: 'bold' }}>
                                        {stats.total || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Всего
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    background: 'rgba(33, 150, 243, 0.1)',
                                    border: '1px solid rgba(33, 150, 243, 0.3)'
                                }}>
                                    <Typography variant="h4" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                                        {stats.unread || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Непрочитанные
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    background: 'rgba(255, 152, 0, 0.1)',
                                    border: '1px solid rgba(255, 152, 0, 0.3)'
                                }}>
                                    <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                                        {stats.warning || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Предупреждения
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper sx={{
                                    p: 2,
                                    textAlign: 'center',
                                    background: 'rgba(244, 67, 54, 0.1)',
                                    border: '1px solid rgba(244, 67, 54, 0.3)'
                                }}>
                                    <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                        {stats.overdue || 0}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Просрочено
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Фильтры */}
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 140, 56, 0.3)' }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Поиск"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Поиск по автомобилю или сообщению..."
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1, color: '#ff8c38' }} />
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Тип</InputLabel>
                                <Select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    label="Тип"
                                >
                                    <MenuItem value="all">Все типы</MenuItem>
                                    <MenuItem value="warning">Предупреждения</MenuItem>
                                    <MenuItem value="overdue">Просрочено</MenuItem>
                                    <MenuItem value="info">Информация</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Статус</InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    label="Статус"
                                >
                                    <MenuItem value="all">Все</MenuItem>
                                    <MenuItem value="unread">Непрочитанные</MenuItem>
                                    <MenuItem value="read">Прочитанные</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Сортировка</InputLabel>
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    label="Сортировка"
                                >
                                    <MenuItem value="priority">По приоритету</MenuItem>
                                    <MenuItem value="date">По дате</MenuItem>
                                    <MenuItem value="km">По километрам</MenuItem>
                                    <MenuItem value="car">По автомобилю</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    onClick={clearFilters}
                                    startIcon={<FilterList />}
                                    size="small"
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
                                {(stats.unread || 0) > 0 && (
                                    <Button
                                        variant="contained"
                                        onClick={handleMarkAllAsRead}
                                        startIcon={<CheckCircle />}
                                        size="small"
                                        sx={{
                                            background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                            color: '#1a1a1a',
                                        }}
                                    >
                                        Прочитать все
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Список уведомлений */}
                <Box sx={{
                    maxHeight: '50vh',
                    overflow: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none'
                    }
                }}>
                    {error && (
                        <Alert severity="error" sx={{ m: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress color="primary" />
                        </Box>
                    )}

                    {!loading && sortedNotifications.length === 0 && !error && (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <NotificationsActive sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                                Нет уведомлений
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                                    ? 'Попробуйте изменить фильтры поиска'
                                    : 'Все ваши автомобили в порядке!'
                                }
                            </Typography>
                        </Box>
                    )}

                    <List sx={{ p: 0 }}>
                        <AnimatePresence>
                            {sortedNotifications.map((notification, index) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.02 }}
                                >
                                    <ListItem
                                        sx={{
                                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                            backgroundColor: notification.read
                                                ? 'transparent'
                                                : 'rgba(255, 140, 56, 0.05)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 140, 56, 0.1)',
                                            },
                                            py: 2,
                                            position: 'relative',
                                            '&::before': !notification.read ? {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: '4px',
                                                backgroundColor: getTypeColor(notification.type),
                                            } : {},
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: '40px' }}>
                                            {getTypeIcon(notification.type)}
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <DirectionsCar sx={{ color: '#ff8c38', fontSize: '1.2rem' }} />
                                                    <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                                        {notification.carDetails}
                                                    </Typography>
                                                    <Chip
                                                        label={getTypeLabel(notification.type)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: `${getTypeColor(notification.type)}20`,
                                                            color: getTypeColor(notification.type),
                                                            border: `1px solid ${getTypeColor(notification.type)}`,
                                                            fontWeight: 'bold',
                                                            fontSize: '0.75rem'
                                                        }}
                                                    />
                                                    {!notification.read && (
                                                        <Chip
                                                            label="Новое"
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: '#2196f3',
                                                                color: 'white',
                                                                fontSize: '0.7rem',
                                                                animation: 'pulse 2s infinite',
                                                                '@keyframes pulse': {
                                                                    '0%': { opacity: 1 },
                                                                    '50%': { opacity: 0.7 },
                                                                    '100%': { opacity: 1 },
                                                                },
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography
                                                        sx={{
                                                            color: getTypeColor(notification.type),
                                                            fontWeight: notification.type === 'OVERDUE' ? 'bold' : 'normal',
                                                            mb: 2,
                                                            fontSize: '0.95rem'
                                                        }}
                                                    >
                                                        {notification.message}
                                                    </Typography>

                                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                                        {notification.kmToNextService !== null && (
                                                            <Grid item xs={6} sm={3}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <Speed sx={{ color: '#76ff7a', fontSize: '1rem', mr: 0.5 }} />
                                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                        До ТО: {notification.kmToNextService >= 0
                                                                        ? `${notification.kmToNextService} км`
                                                                        : `просрочено на ${Math.abs(notification.kmToNextService)} км`
                                                                    }
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        )}

                                                        {notification.serviceCount !== null && (
                                                            <Grid item xs={6} sm={3}>
                                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                    <CheckCircle sx={{ color: '#4caf50', fontSize: '1rem', mr: 0.5 }} />
                                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                        Выполнено ТО: {notification.serviceCount}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        )}

                                                        <Grid item xs={12} sm={6}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <CalendarToday sx={{ color: '#2196f3', fontSize: '1rem', mr: 0.5 }} />
                                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                    {formatDateTime(notification.createdAt)}
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            }
                                        />

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                                            {!notification.read && (
                                                <Tooltip title="Отметить как прочитанное">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        sx={{
                                                            color: '#4caf50',
                                                            '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                                                        }}
                                                    >
                                                        <CheckCircle fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Tooltip title="Скрыть уведомление">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDeactivateNotification(notification.id)}
                                                    sx={{
                                                        color: '#f44336',
                                                        '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                                                    }}
                                                >
                                                    <Close fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </ListItem>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </List>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255, 140, 56, 0.3)' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mr: 'auto' }}>
                    {refreshing ? 'Обновление...' : `Всего уведомлений: ${sortedNotifications.length}`}
                </Typography>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderColor: '#ff8c38',
                        color: '#ff8c38',
                        '&:hover': {
                            borderColor: '#76ff7a',
                            color: '#76ff7a',
                        }
                    }}
                >
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default NotificationDialog;