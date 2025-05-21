import React from 'react';
import { Container, Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <Container maxWidth="md" sx={{ mt: 8, textAlign: 'left' }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Typography
                    variant="h3"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Добро пожаловать в систему VozilaFleet!
                </Typography>
                <Typography
                    variant="h4"
                    gutterBottom
                    sx={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: '#ff8c38',
                        marginBottom: 4,
                    }}
                >
                    VozilaFleet - автоматизированная система учёта затрат на плановое техническое обслуживание в парках такси
                </Typography>
                <List sx={{ color: '#e0e0e0', maxWidth: '600px' }}>
                    <ListItem>
                        <ListItemText primary="- Стоимость эксплуатации" sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="- Составления и хранения базы данных по автомобилям и водителям" sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="- Своевременные уведомления по необходимости тех. обслуживания" sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="- Сервисные напоминания" sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="- Анализ затрат по отдельным категориям" sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="- Функциональная статистика" sx={{ '& .MuiListItemText-primary': { fontSize: '1.2rem' } }} />
                    </ListItem>
                </List>
            </motion.div>
        </Container>
    );
};

export default Home;