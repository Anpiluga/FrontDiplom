import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Collapse, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, LocalTaxi, DirectionsCar, People, LocalGasStation } from '@mui/icons-material';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [fleetOpen, setFleetOpen] = useState(false);
    const [fuelOpen, setFuelOpen] = useState(false);

    const handleFleetClick = () => {
        setFleetOpen(!fleetOpen);
    };

    const handleFuelClick = () => {
        setFuelOpen(!fuelOpen);
    };

    const drawerWidth = 240;

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    background: (theme) =>
                        theme.palette.mode === 'dark'
                            ? 'rgba(44, 27, 71, 0.9)'
                            : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRight: (theme) =>
                        theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.1)'
                            : '1px solid rgba(0, 0, 0, 0.1)',
                },
            }}
        >
            <Box sx={{ height: 'calc(100vh - 80px)', overflow: 'hidden', pt: '80px' }}>
                <List>
                    {/* Вкладка "Главная" */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            button
                            onClick={() => navigate('/home')}
                            sx={{
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon>
                                <Home sx={{ color: '#ff8c38' }} />
                            </ListItemIcon>
                            <ListItemText primary="Главная" />
                        </ListItem>
                    </motion.div>

                    {/* Вкладка "Мой автопарк" */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            button
                            onClick={handleFleetClick}
                            sx={{
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon>
                                <LocalTaxi sx={{ color: '#ff8c38' }} />
                            </ListItemIcon>
                            <ListItemText primary="Мой автопарк" />
                        </ListItem>
                    </motion.div>

                    <Collapse in={fleetOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ListItem sx={{ pl: 4 }}>
                                    <Button
                                        fullWidth
                                        variant={location.pathname === '/cars' ? 'contained' : 'outlined'}
                                        onClick={() => navigate('/cars')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            color: location.pathname === '/cars' ? '#1a1a1a' : 'inherit',
                                            '&:hover': {
                                                background: location.pathname === '/cars'
                                                    ? 'linear-gradient(45deg, #ff8c38, #76ff7a)'
                                                    : (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 140, 56, 0.2)'
                                                            : 'rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <DirectionsCar sx={{ mr: 1 }} />
                                        Список автомобилей
                                    </Button>
                                </ListItem>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ListItem sx={{ pl: 4 }}>
                                    <Button
                                        fullWidth
                                        variant={location.pathname === '/drivers' ? 'contained' : 'outlined'}
                                        onClick={() => navigate('/drivers')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            color: location.pathname === '/drivers' ? '#1a1a1a' : 'inherit',
                                            '&:hover': {
                                                background: location.pathname === '/drivers'
                                                    ? 'linear-gradient(45deg, #ff8c38, #76ff7a)'
                                                    : (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 140, 56, 0.2)'
                                                            : 'rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <People sx={{ mr: 1 }} />
                                        Список водителей
                                    </Button>
                                </ListItem>
                            </motion.div>
                        </List>
                    </Collapse>

                    {/* Вкладка "Топливо" */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            button
                            onClick={handleFuelClick}
                            sx={{
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon>
                                <LocalGasStation sx={{ color: '#ff8c38' }} />
                            </ListItemIcon>
                            <ListItemText primary="Топливо" />
                        </ListItem>
                    </motion.div>

                    <Collapse in={fuelOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ListItem sx={{ pl: 4 }}>
                                    <Button
                                        fullWidth
                                        variant={location.pathname === '/fuel' ? 'contained' : 'outlined'}
                                        onClick={() => navigate('/fuel')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            color: location.pathname === '/fuel' ? '#1a1a1a' : 'inherit',
                                            '&:hover': {
                                                background: location.pathname === '/fuel'
                                                    ? 'linear-gradient(45deg, #ff8c38, #76ff7a)'
                                                    : (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 140, 56, 0.2)'
                                                            : 'rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <LocalGasStation sx={{ mr: 1 }} />
                                        Заправки
                                    </Button>
                                </ListItem>
                            </motion.div>
                        </List>
                    </Collapse>
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar;