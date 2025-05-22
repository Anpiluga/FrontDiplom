import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Collapse, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Home,
    LocalTaxi,
    DirectionsCar,
    People,
    Receipt,
    LocalGasStation,
    AttachMoney,
    Build,
    Assignment,
    Task,
    Analytics,
    Inventory,
    Category
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [fleetOpen, setFleetOpen] = useState(false);
    const [expensesOpen, setExpensesOpen] = useState(false);
    const [serviceOpen, setServiceOpen] = useState(false);
    const [warehouseOpen, setWarehouseOpen] = useState(false);

    const handleFleetClick = () => {
        setFleetOpen(!fleetOpen);
    };

    const handleExpensesClick = () => {
        setExpensesOpen(!expensesOpen);
    };

    const handleServiceClick = () => {
        setServiceOpen(!serviceOpen);
    };

    const handleWarehouseClick = () => {
        setWarehouseOpen(!warehouseOpen);
    };

    const drawerWidth = 280;

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
                                minHeight: '70px',
                                padding: '16px 24px',
                                margin: '8px 16px',
                                borderRadius: '12px',
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                                ...(location.pathname === '/home' && {
                                    background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                                        color: '#1a1a1a',
                                        fontWeight: 'bold',
                                    },
                                }),
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: '56px' }}>
                                <Home sx={{ color: location.pathname === '/home' ? '#1a1a1a' : '#ff8c38', fontSize: '28px' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Главная"
                                primaryTypographyProps={{
                                    fontSize: '18px',
                                    fontWeight: location.pathname === '/home' ? 'bold' : 'normal'
                                }}
                            />
                        </ListItem>
                    </motion.div>

                    {/* Вкладка "Мой таксопарк" */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            button
                            onClick={handleFleetClick}
                            sx={{
                                minHeight: '70px',
                                padding: '16px 24px',
                                margin: '8px 16px',
                                borderRadius: '12px',
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                                ...(fleetOpen && {
                                    background: 'rgba(255, 140, 56, 0.1)',
                                }),
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: '56px' }}>
                                <LocalTaxi sx={{ color: '#ff8c38', fontSize: '28px' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Мой таксопарк"
                                primaryTypographyProps={{
                                    fontSize: '18px'
                                }}
                            />
                        </ListItem>
                    </motion.div>

                    <Collapse in={fleetOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ListItem sx={{ pl: 2, pr: 3, py: 1 }}>
                                    <Button
                                        fullWidth
                                        variant={location.pathname === '/cars' ? 'contained' : 'outlined'}
                                        onClick={() => navigate('/cars')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            color: location.pathname === '/cars' ? '#1a1a1a' : 'inherit',
                                            minHeight: '48px',
                                            fontSize: '16px',
                                            textTransform: 'none',
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
                                        <DirectionsCar sx={{ mr: 2, fontSize: '22px' }} />
                                        Список автомобилей
                                    </Button>
                                </ListItem>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ListItem sx={{ pl: 2, pr: 3, py: 1 }}>
                                    <Button
                                        fullWidth
                                        variant={location.pathname === '/drivers' ? 'contained' : 'outlined'}
                                        onClick={() => navigate('/drivers')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            color: location.pathname === '/drivers' ? '#1a1a1a' : 'inherit',
                                            minHeight: '48px',
                                            fontSize: '16px',
                                            textTransform: 'none',
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
                                        <People sx={{ mr: 2, fontSize: '22px' }} />
                                        Список водителей
                                    </Button>
                                </ListItem>
                            </motion.div>
                        </List>
                    </Collapse>

                    {/* Вкладка "Расходы" */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            button
                            onClick={handleExpensesClick}
                            sx={{
                                minHeight: '70px',
                                padding: '16px 24px',
                                margin: '8px 16px',
                                borderRadius: '12px',
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                                ...(expensesOpen && {
                                    background: 'rgba(255, 140, 56, 0.1)',
                                }),
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: '56px' }}>
                                <Receipt sx={{ color: '#ff8c38', fontSize: '28px' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Расходы"
                                primaryTypographyProps={{
                                    fontSize: '18px'
                                }}
                            />
                        </ListItem>
                    </motion.div>

                    <Collapse in={expensesOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ListItem sx={{ pl: 2, pr: 3, py: 1 }}>
                                    <Button
                                        fullWidth
                                        variant={location.pathname === '/fuel' ? 'contained' : 'outlined'}
                                        onClick={() => navigate('/fuel')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            color: location.pathname === '/fuel' ? '#1a1a1a' : 'inherit',
                                            minHeight: '48px',
                                            fontSize: '16px',
                                            textTransform: 'none',
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
                                        <LocalGasStation sx={{ mr: 2, fontSize: '22px' }} />
                                        Заправки
                                    </Button>
                                </ListItem>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ListItem sx={{ pl: 2, pr: 3, py: 1 }}>
                                    <Button
                                        fullWidth
                                        variant={location.pathname === '/additional-expenses' ? 'contained' : 'outlined'}
                                        onClick={() => navigate('/additional-expenses')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            color: location.pathname === '/additional-expenses' ? '#1a1a1a' : 'inherit',
                                            minHeight: '48px',
                                            fontSize: '16px',
                                            textTransform: 'none',
                                            '&:hover': {
                                                background: location.pathname === '/additional-expenses'
                                                    ? 'linear-gradient(45deg, #ff8c38, #76ff7a)'
                                                    : (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 140, 56, 0.2)'
                                                            : 'rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <AttachMoney sx={{ mr: 2, fontSize: '22px' }} />
                                        Доп расходы
                                    </Button>
                                </ListItem>
                            </motion.div>
                        </List>
                    </Collapse>

                    {/* Вкладка "Сервис" */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            button
                            onClick={handleServiceClick}
                            sx={{
                                minHeight: '70px',
                                padding: '16px 24px',
                                margin: '8px 16px',
                                borderRadius: '12px',
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                                ...(serviceOpen && {
                                    background: 'rgba(255, 140, 56, 0.1)',
                                }),
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: '56px' }}>
                                <Build sx={{ color: '#ff8c38', fontSize: '28px' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Сервис"
                                primaryTypographyProps={{
                                    fontSize: '18px'
                                }}
                            />
                        </ListItem>
                    </motion.div>

                    <Collapse in={serviceOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ListItem sx={{ pl: 2, pr: 3, py: 1 }}>
                                    <Button
                                        fullWidth
                                        variant={location.pathname === '/service-records' ? 'contained' : 'outlined'}
                                        onClick={() => navigate('/service-records')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            color: location.pathname === '/service-records' ? '#1a1a1a' : 'inherit',
                                            minHeight: '48px',
                                            fontSize: '16px',
                                            textTransform: 'none',
                                            '&:hover': {
                                                background: location.pathname === '/service-records'
                                                    ? 'linear-gradient(45deg, #ff8c38, #76ff7a)'
                                                    : (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 140, 56, 0.2)'
                                                            : 'rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <Assignment sx={{ mr: 2, fontSize: '22px' }} />
                                        Сервисные записи
                                    </Button>
                                </ListItem>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ListItem sx={{ pl: 2, pr: 3, py: 1 }}>
                                    <Button
                                        fullWidth
                                        variant={location.pathname === '/service-tasks' ? 'contained' : 'outlined'}
                                        onClick={() => navigate('/service-tasks')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            color: location.pathname === '/service-tasks' ? '#1a1a1a' : 'inherit',
                                            minHeight: '48px',
                                            fontSize: '16px',
                                            textTransform: 'none',
                                            '&:hover': {
                                                background: location.pathname === '/service-tasks'
                                                    ? 'linear-gradient(45deg, #ff8c38, #76ff7a)'
                                                    : (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 140, 56, 0.2)'
                                                            : 'rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <Task sx={{ mr: 2, fontSize: '22px' }} />
                                        Сервисные задачи
                                    </Button>
                                </ListItem>
                            </motion.div>
                        </List>
                    </Collapse>

                    {/* Вкладка "Анализ расходов" */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            button
                            onClick={() => navigate('/analytics')}
                            sx={{
                                minHeight: '70px',
                                padding: '16px 24px',
                                margin: '8px 16px',
                                borderRadius: '12px',
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                                ...(location.pathname === '/analytics' && {
                                    background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                                        color: '#1a1a1a',
                                        fontWeight: 'bold',
                                    },
                                }),
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: '56px' }}>
                                <Analytics sx={{ color: location.pathname === '/analytics' ? '#1a1a1a' : '#ff8c38', fontSize: '28px' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Анализ расходов"
                                primaryTypographyProps={{
                                    fontSize: '18px',
                                    fontWeight: location.pathname === '/analytics' ? 'bold' : 'normal'
                                }}
                            />
                        </ListItem>
                    </motion.div>

                    {/* Вкладка "Склад" */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            button
                            onClick={handleWarehouseClick}
                            sx={{
                                minHeight: '70px',
                                padding: '16px 24px',
                                margin: '8px 16px',
                                borderRadius: '12px',
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                                ...(warehouseOpen && {
                                    background: 'rgba(255, 140, 56, 0.1)',
                                }),
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: '56px' }}>
                                <Inventory sx={{ color: '#ff8c38', fontSize: '28px' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Склад"
                                primaryTypographyProps={{
                                    fontSize: '18px'
                                }}
                            />
                        </ListItem>
                    </motion.div>

                    <Collapse in={warehouseOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <ListItem sx={{ pl: 2, pr: 3, py: 1 }}>
                                    <Button
                                        fullWidth
                                        variant={location.pathname === '/spare-parts' ? 'contained' : 'outlined'}
                                        onClick={() => navigate('/spare-parts')}
                                        sx={{
                                            justifyContent: 'flex-start',
                                            color: location.pathname === '/spare-parts' ? '#1a1a1a' : 'inherit',
                                            minHeight: '48px',
                                            fontSize: '16px',
                                            textTransform: 'none',
                                            '&:hover': {
                                                background: location.pathname === '/spare-parts'
                                                    ? 'linear-gradient(45deg, #ff8c38, #76ff7a)'
                                                    : (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 140, 56, 0.2)'
                                                            : 'rgba(0, 0, 0, 0.1)',
                                            },
                                        }}
                                    >
                                        <Category sx={{ mr: 2, fontSize: '22px' }} />
                                        Запчасти
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