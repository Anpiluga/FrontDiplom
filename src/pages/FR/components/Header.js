import React, { useContext, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Avatar, Menu, MenuItem, IconButton, Badge } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AccountCircle, Notifications, Brightness4, Brightness7 } from '@mui/icons-material';

const Header = () => {
    const { user, logout, darkMode, toggleTheme } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthPage = ['/register', '/login'].includes(location.pathname);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleAvatarClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
        handleMenuClose();
    };

    const profileInitial = user?.username ? user.username.charAt(0).toUpperCase() : '';

    return (
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
                        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                            <IconButton color="inherit">
                                <Badge badgeContent={3} color="error">
                                    <Notifications />
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
                                },
                            }}
                        >
                            <MenuItem
                                onClick={() => { navigate('/cars'); handleMenuClose(); }}
                                sx={{ color: darkMode ? '#ffffff' : '#1a1a1a', '&:hover': { background: darkMode ? 'rgba(255, 140, 56, 0.2)' : 'rgba(0, 0, 0, 0.1)' } }}
                            >
                                Список автомобилей
                            </MenuItem>
                            <MenuItem
                                onClick={() => { navigate('/drivers'); handleMenuClose(); }}
                                sx={{ color: darkMode ? '#ffffff' : '#1a1a1a', '&:hover': { background: darkMode ? 'rgba(255, 140, 56, 0.2)' : 'rgba(0, 0, 0, 0.1)' } }}
                            >
                                Список водителей
                            </MenuItem>
                            <MenuItem
                                onClick={handleLogout}
                                sx={{ color: darkMode ? '#ff4d4d' : '#ff4d4d', '&:hover': { background: darkMode ? 'rgba(255, 140, 56, 0.2)' : 'rgba(0, 0, 0, 0.1)' } }}
                            >
                                Выйти
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;