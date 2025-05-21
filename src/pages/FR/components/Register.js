import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Container, Typography, Alert, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || username.length < 5 || username.length > 50) {
            setError('Имя пользователя должно содержать от 5 до 50 символов');
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(username)) {
            setError('Имя пользователя может содержать только буквы и цифры');
            return;
        }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Введите корректный email');
            return;
        }
        if (email.length < 5 || email.length > 255) {
            setError('Email должен содержать от 5 до 255 символов');
            return;
        }
        if (!password || password.length < 8 || password.length > 255) {
            setError('Пароль должен содержать от 8 до 255 символов');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/auth/sign-up', {
                username,
                email,
                password,
            });
            login(response.data.token, username);
            navigate('/home');
        } catch (err) {
            console.error('Registration error:', err.response?.data || err.message);
            if (err.response?.data && typeof err.response.data === 'object') {
                const errorMessages = Object.values(err.response.data).join('; ');
                setError(errorMessages || 'Ошибка регистрации. Проверьте данные.');
            } else {
                setError(err.response?.data?.message || 'Ошибка регистрации. Проверьте данные.');
            }
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Typography variant="h4" align="center" sx={{ mb: 4 }}>
                    Регистрация
                </Typography>
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2,
                            background: 'rgba(211, 47, 47, 0.1)',
                            color: '#ff6f60',
                            border: '1px solid rgba(211, 47, 47, 0.3)',
                        }}
                    >
                        {error}
                    </Alert>
                )}
                <Box
                    sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        p: 4,
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Имя пользователя"
                            fullWidth
                            margin="normal"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            label="Пароль"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                                Зарегистрироваться
                            </Button>
                        </motion.div>
                    </form>
                    <Typography align="center" sx={{ mt: 2 }}>
                        Уже есть аккаунт? <Link to="/login" style={{ color: '#ff8c38' }}>Войти</Link>
                    </Typography>
                </Box>
            </motion.div>
        </Container>
    );
};

export default Register;