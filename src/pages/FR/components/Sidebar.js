import React, { useState, useContext } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Collapse, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
    Category,
    NotificationsActive,
    ExitToApp
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);
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

    const handleLogout = () => {
        if (window.confirm('Вы уверены, что хотите выйти из системы?')) {
            logout();
            navigate('/login');
        }
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
                            ? '2px solid rgba(255, 140, 56, 0.3)'
                            : '2px solid rgba(255, 140, 56, 0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh',
                },
            }}
        >
            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                paddingTop: '64px', // Добавляем отступ сверху для Header
                '&::-webkit-scrollbar': {
                    width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(255, 140, 56, 0.3)',
                    borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(255, 140, 56, 0.5)',
                },
            }}>
                <List sx={{ paddingTop: '20px' }}>
                    {/* Главная */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            onClick={() => navigate('/home')}
                            sx={{
                                cursor: 'pointer',
                                minHeight: '70px',
                                padding: '16px 24px',
                                margin: '8px 16px',
                                borderRadius: '12px',
                                background: location.pathname === '/home' ? 'rgba(255, 140, 56, 0.1)' : 'transparent',
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: '56px' }}>
                                <Home sx={{
                                    color: location.pathname === '/home' ? '#1a1a1a' : '#ff8c38',
                                    fontSize: '28px'
                                }} />
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

                    {/* Вкладка "Автопарк" */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            onClick={handleFleetClick}
                            sx={{
                                cursor: 'pointer',
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
                                primary="Таксопарк"
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
                                        Автомобили
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
                                        Водители
                                    </Button>
                                </ListItem>
                            </motion.div>
                        </List>
                    </Collapse>

                    {/* Напоминания */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            onClick={() => navigate('/reminders')}
                            sx={{
                                cursor: 'pointer',
                                minHeight: '70px',
                                padding: '16px 24px',
                                margin: '8px 16px',
                                borderRadius: '12px',
                                background: location.pathname === '/reminders' ? 'rgba(255, 140, 56, 0.1)' : 'transparent',
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: '56px' }}>
                                <NotificationsActive sx={{
                                    color: location.pathname === '/reminders' ? '#1a1a1a' : '#ff8c38',
                                    fontSize: '28px'
                                }} />
                            </ListItemIcon>
                            <ListItemText
                                primary="Напоминания"
                                primaryTypographyProps={{
                                    fontSize: '18px',
                                    fontWeight: location.pathname === '/reminders' ? 'bold' : 'normal'
                                }}
                            />
                        </ListItem>
                    </motion.div>

                    {/* Вкладка "Расходы" */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            onClick={handleExpensesClick}
                            sx={{
                                cursor: 'pointer',
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
                                        Доп. расходы
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
                            onClick={handleServiceClick}
                            sx={{
                                cursor: 'pointer',
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
                                        Записи ТО
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
                                        Задачи ТО
                                    </Button>
                                </ListItem>
                            </motion.div>
                        </List>
                    </Collapse>

                    {/* Анализ расходов */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListItem
                            onClick={() => navigate('/analytics')}
                            sx={{
                                cursor: 'pointer',
                                minHeight: '70px',
                                padding: '16px 24px',
                                margin: '8px 16px',
                                borderRadius: '12px',
                                background: location.pathname === '/analytics' ? 'rgba(255, 140, 56, 0.1)' : 'transparent',
                                '&:hover': {
                                    background: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 140, 56, 0.2)'
                                            : 'rgba(0, 0, 0, 0.1)',
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: '56px' }}>
                                <Analytics sx={{
                                    color: location.pathname === '/analytics' ? '#1a1a1a' : '#ff8c38',
                                    fontSize: '28px'
                                }} />
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
                            onClick={handleWarehouseClick}
                            sx={{
                                cursor: 'pointer',
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

            {/* Кнопка выхода внизу боковой панели */}
            <Box sx={{
                padding: '16px',
                borderTop: (theme) =>
                    theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 140, 56, 0.3)'
                        : '1px solid rgba(255, 140, 56, 0.5)',
            }}>
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleLogout}
                        sx={{
                            color: '#ff4d4d',
                            borderColor: '#ff4d4d',
                            minHeight: '48px',
                            fontSize: '16px',
                            textTransform: 'none',
                            justifyContent: 'flex-start',
                            '&:hover': {
                                borderColor: '#ff3333',
                                backgroundColor: 'rgba(255, 77, 77, 0.1)',
                                color: '#ff3333',
                            },
                        }}
                    >
                        <ExitToApp sx={{ mr: 2, fontSize: '22px' }} />
                        Выйти из системы
                    </Button>
                </motion.div>
            </Box>
        </Drawer>
    );
};

export default Sidebar;