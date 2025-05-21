// Login.js
import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TextField, Button, Container, Typography, Alert, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/auth/sign-in', {
                username,
                password,
            });
            const { token } = response.data; // Предполагаем, что сервер возвращает { token }
            login(token, username);
            navigate('/home');
        } catch (err) {
            setError('Неверный логин или пароль');
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
                    Вход
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
                                Войти
                            </Button>
                        </motion.div>
                    </form>
                    <Typography align="center" sx={{ mt: 2 }}>
                        Нет аккаунта? <Link to="/register" style={{ color: '#ff8c38' }}>Зарегистрироваться</Link>
                    </Typography>
                </Box>
            </motion.div>
        </Container>
    );
};

export default Login;