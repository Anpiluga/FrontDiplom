import React, { useContext, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Avatar, Menu, MenuItem, IconButton, Badge } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AccountCircle, Notifications, Brightness4, Brightness7 } from '@mui/icons-material';
import NotificationDialog from './NotificationDialog';
import { useNotifications } from './useNotifications';

const Header = () => {
    const { user, logout, darkMode, toggleTheme } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthPage = ['/register', '/login'].includes(location.pathname);

    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
    const open = Boolean(anchorEl);

    // Используем хук уведомлений
    const {
        unreadCount,
        fetchUnreadCount,
        resetNotifications,
        hasUnreadNotifications
    } = useNotifications();

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        resetNotifications(); // Сбрасываем уведомления при выходе
        logout();
        navigate('/login');
        handleMenuClose();
    };

    const handleNotificationClick = () => {
        setNotificationDialogOpen(true);
    };

    const handleNotificationDialogClose = () => {
        setNotificationDialogOpen(false);
        // Обновляем счетчик после закрытия диалога
        setTimeout(() => {
            fetchUnreadCount();
        }, 500);
    };

    const profileInitial = user?.username ? user.username.charAt(0).toUpperCase() : '';

    return (
        <>
            <AppBar
                position="fixed"
                sx={{
                    background: darkMode ? 'rgba(44, 27, 71, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
            >
                <Toolbar
                    sx={{
                        height: '80px',
                        minHeight: '80px',
                        padding: '0 24px',
                    }}
                >
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => navigate('/home')}
                            style={{ cursor: 'pointer' }}
                        >
                            <Typography
                                variant="h5"
                                sx={{
                                    fontSize: '1.5rem',
                                    fontFamily: "'Ubuntu', sans-serif",
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                <Link
                                    to="/home"
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit',
                                    }}
                                >
                                    Система учёта затрат VozilaFleet
                                </Link>
                            </Typography>
                        </motion.div>
                    </Box>
                    {!isAuthPage && user && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                                <IconButton onClick={toggleTheme} color="inherit">
                                    {darkMode ? <Brightness7 /> : <Brightness4 />}
                                </IconButton>
                            </motion.div>

                            {/* Кнопка уведомлений с улучшенной анимацией */}
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ duration: 0.3 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <IconButton
                                    color="inherit"
                                    onClick={handleNotificationClick}
                                    sx={{
                                        position: 'relative',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 140, 56, 0.1)',
                                        },
                                        // Добавляем эффект свечения для важных уведомлений
                                        ...(hasUnreadNotifications && {
                                            boxShadow: '0 0 15px rgba(255, 140, 56, 0.5)',
                                            animation: 'glow 2s ease-in-out infinite alternate',
                                            '@keyframes glow': {
                                                '0%': {
                                                    boxShadow: '0 0 5px rgba(255, 140, 56, 0.5)',
                                                },
                                                '100%': {
                                                    boxShadow: '0 0 20px rgba(255, 140, 56, 0.8)',
                                                },
                                            },
                                        })
                                    }}
                                >
                                    <Badge
                                        badgeContent={unreadCount > 99 ? '99+' : unreadCount}
                                        color="error"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                backgroundColor: unreadCount > 0 ? '#f44336' : 'transparent',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '0.7rem',
                                                minWidth: unreadCount > 99 ? '24px' : '20px',
                                                height: '20px',
                                                borderRadius: '10px',
                                                border: '2px solid',
                                                borderColor: darkMode ? '#2c1b47' : '#ffffff',
                                                // Анимация пульсации для новых уведомлений
                                                animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                                                '@keyframes pulse': {
                                                    '0%': {
                                                        transform: 'scale(1)',
                                                        opacity: 1,
                                                    },
                                                    '50%': {
                                                        transform: 'scale(1.2)',
                                                        opacity: 0.8,
                                                    },
                                                    '100%': {
                                                        transform: 'scale(1)',
                                                        opacity: 1,
                                                    },
                                                },
                                                // Добавляем задержку анимации для более естественного эффекта
                                                animationDelay: '0.5s',
                                            }
                                        }}
                                        max={99}
                                        showZero={false}
                                        overlap="circular"
                                    >
                                        <Notifications
                                            sx={{
                                                fontSize: '1.5rem',
                                                color: hasUnreadNotifications ? '#ff8c38' : 'inherit',
                                                // Добавляем свечение для иконки при наличии уведомлений
                                                filter: hasUnreadNotifications
                                                    ? 'drop-shadow(0 0 6px rgba(255, 140, 56, 0.7))'
                                                    : 'none',
                                                transition: 'all 0.3s ease',
                                            }}
                                        />
                                    </Badge>
                                </IconButton>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.1, rotate: 360 }} transition={{ duration: 0.5 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: 'transparent',
                                        background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                        color: '#1a1a1a',
                                        width: 60,
                                        height: 60,
                                        cursor: 'pointer',
                                        border: '2px solid #ff8c38',
                                        boxShadow: '0 0 12px rgba(255, 140, 56, 0.6)',
                                        transition: 'box-shadow 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 0 25px rgba(255, 140, 56, 0.9)',
                                        },
                                    }}
                                    onClick={handleAvatarClick}
                                >
                                    {profileInitial}
                                </Avatar>
                            </motion.div>

                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleMenuClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                PaperProps={{
                                    sx: {
                                        background: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        border: darkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                                        borderRadius: '12px',
                                        mt: 1,
                                    },
                                }}
                            >
                                <MenuItem
                                    onClick={() => { navigate('/cars'); handleMenuClose(); }}
                                    sx={{
                                        color: darkMode ? '#ffffff' : '#1a1a1a',
                                        '&:hover': { background: darkMode ? 'rgba(255, 140, 56, 0.2)' : 'rgba(0, 0, 0, 0.1)' },
                                        borderRadius: '8px',
                                        mx: 1,
                                        my: 0.5,
                                    }}
                                >
                                    Список автомобилей
                                </MenuItem>
                                <MenuItem
                                    onClick={() => { navigate('/drivers'); handleMenuClose(); }}
                                    sx={{
                                        color: darkMode ? '#ffffff' : '#1a1a1a',
                                        '&:hover': { background: darkMode ? 'rgba(255, 140, 56, 0.2)' : 'rgba(0, 0, 0, 0.1)' },
                                        borderRadius: '8px',
                                        mx: 1,
                                        my: 0.5,
                                    }}
                                >
                                    Список водителей
                                </MenuItem>
                                <MenuItem
                                    onClick={() => { navigate('/reminders'); handleMenuClose(); }}
                                    sx={{
                                        color: darkMode ? '#ffffff' : '#1a1a1a',
                                        '&:hover': { background: darkMode ? 'rgba(255, 140, 56, 0.2)' : 'rgba(0, 0, 0, 0.1)' },
                                        borderRadius: '8px',
                                        mx: 1,
                                        my: 0.5,
                                    }}
                                >
                                    Напоминания о ТО
                                </MenuItem>
                                <MenuItem
                                    onClick={handleLogout}
                                    sx={{
                                        color: '#ff4d4d',
                                        '&:hover': { background: 'rgba(255, 77, 77, 0.1)' },
                                        borderRadius: '8px',
                                        mx: 1,
                                        my: 0.5,
                                    }}
                                >
                                    Выйти
                                </MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* Диалог уведомлений */}
            <NotificationDialog
                open={notificationDialogOpen}
                onClose={handleNotificationDialogClose}
            />
        </>
    );
};

export default Header;