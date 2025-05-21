import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    Alert,
} from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';

const DriverForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDriver = async () => {
            if (id) {
                try {
                    const response = await axios.get(`http://localhost:8080/admin/drivers/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    setFormData({
                        firstName: response.data.firstName,
                        lastName: response.data.lastName,
                        phoneNumber: response.data.phoneNumber,
                    });
                } catch (err) {
                    console.error('Error fetching driver', err);
                    setError('Ошибка при загрузке водителя');
                }
            }
        };

        fetchDriver();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                phoneNumber: formData.phoneNumber,
            };

            if (id) {
                await axios.put(`http://localhost:8080/admin/drivers/${id}`, data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
            } else {
                await axios.post('http://localhost:8080/admin/drivers', data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
            }
            navigate('/drivers');
        } catch (err) {
            console.error('Error saving driver', err);
            setError('Ошибка при сохранении водителя');
        }
    };

    return (
        <Container maxWidth={false} sx={{ maxWidth: '1600px', mt: 4, pt: 4, px: { xs: 2, sm: 4 } }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    sx={{
                        mb: 6,
                        background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    {id ? 'Редактировать водителя' : 'Добавить водителя'}
                </Typography>
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 4,
                            maxWidth: '800px',
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
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        maxWidth: '1200px',
                        mx: 'auto',
                        p: 4,
                        borderRadius: '12px',
                        border: '2px solid transparent',
                        borderImage: 'linear-gradient(45deg, #ff8c38, #76ff7a) 1',
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'rgba(44, 27, 71, 0.9)'
                                : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Grid container spacing={4}>
                        <Grid item xs={12} sm={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Имя"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{ height: '56px' }}
                                />
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Фамилия"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{ height: '56px' }}
                                />
                            </motion.div>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <TextField
                                    fullWidth
                                    label="Номер телефона"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    required
                                    variant="outlined"
                                    sx={{ height: '56px' }}
                                />
                            </motion.div>
                        </Grid>
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="contained"
                                        type="submit"
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: '8px',
                                            background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                                            color: '#1a1a1a',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #76ff7a, #ff8c38)',
                                            },
                                        }}
                                    >
                                        Сохранить
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/drivers')}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: '8px',
                                            borderColor: '#ff8c38',
                                            color: '#ff8c38',
                                            '&:hover': {
                                                borderColor: '#76ff7a',
                                                color: '#76ff7a',
                                            },
                                        }}
                                    >
                                        Отмена
                                    </Button>
                                </motion.div>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </motion.div>
        </Container>
    );
};

export default DriverForm;