// hooks/useOdometerValidation.js
import { useState, useCallback } from 'react';
import axios from 'axios';

export const useOdometerValidation = () => {
    const [odometerInfo, setOdometerInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchOdometerInfo = useCallback(async (carId) => {
        if (!carId) {
            setOdometerInfo(null);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Ошибка авторизации');
                return;
            }

            // Получаем информацию о минимальном показании одометра
            const response = await axios.get(`http://localhost:8080/admin/fuel-entries/counter-info/${carId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            console.log('Odometer info response:', response.data);
            setOdometerInfo(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching odometer info:', err);
            setOdometerInfo(null);
            setError('Ошибка при получении информации об одометре');
        } finally {
            setLoading(false);
        }
    }, []);

    const validateOdometer = useCallback((carId, odometerValue, dateTime) => {
        if (!odometerInfo || !carId) {
            return { isValid: true, message: '' };
        }

        const minAllowed = odometerInfo.minAllowedCounter || 0;
        const currentValue = parseInt(odometerValue);

        if (isNaN(currentValue)) {
            return { isValid: false, message: 'Введите корректное значение одометра' };
        }

        if (currentValue < minAllowed) {
            return {
                isValid: false,
                message: `Показание одометра не может быть меньше ${minAllowed} км (последнее зафиксированное значение)`
            };
        }

        return { isValid: true, message: 'Показание одометра корректно' };
    }, [odometerInfo]);

    const getMinAllowedOdometer = useCallback(() => {
        return odometerInfo?.minAllowedCounter || 0;
    }, [odometerInfo]);

    const getLastRecordInfo = useCallback(() => {
        if (!odometerInfo?.lastRecord) {
            return null;
        }

        const lastRecord = odometerInfo.lastRecord;
        return {
            counter: lastRecord.counter,
            dateTime: lastRecord.dateTime,
            type: lastRecord.type,
            description: lastRecord.description
        };
    }, [odometerInfo]);

    return {
        odometerInfo,
        loading,
        error,
        fetchOdometerInfo,
        validateOdometer,
        getMinAllowedOdometer,
        getLastRecordInfo
    };
};

// Компонент для отображения информации об одометре
import React from 'react';
import { Paper, Typography, Grid, Box, Chip } from '@mui/material';
import { Speed, Info, CalendarToday } from '@mui/icons-material';
import { motion } from 'framer-motion';

export const OdometerInfoDisplay = ({
                                        selectedCar,
                                        odometerInfo,
                                        showValidationMessage = false,
                                        validationResult = null
                                    }) => {
    const formatDateTime = (dateTimeStr) => {
        if (!dateTimeStr) return 'Не указано';
        try {
            const date = new Date(dateTimeStr);
            return date.toLocaleString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Некорректная дата';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'fuel':
                return 'Заправка';
            case 'service':
                return 'Сервисная запись';
            default:
                return 'Неизвестно';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'fuel':
                return '#ff9800';
            case 'service':
                return '#2196f3';
            default:
                return '#9e9e9e';
        }
    };

    if (!selectedCar) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Paper
                sx={{
                    p: 3,
                    background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1), rgba(33, 150, 243, 0.2))',
                    border: '1px solid #2196f3',
                    borderRadius: '12px',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Info sx={{ color: '#2196f3', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                        Информация об одометре
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            Текущий одометр автомобиля:
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {selectedCar.odometr || selectedCar.odometerReading || 0} км
                        </Typography>
                    </Grid>

                    {odometerInfo && (
                        <>
                            <Grid item xs={12} md={4}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                    Минимально допустимое показание:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff8c38' }}>
                                    {odometerInfo.minAllowedCounter || 0} км
                                </Typography>
                            </Grid>

                            {odometerInfo.lastRecord && Object.keys(odometerInfo.lastRecord).length > 0 && (
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                        Последняя запись:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Speed sx={{ fontSize: '1rem', color: '#76ff7a' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                {odometerInfo.lastRecord.counter} км
                                            </Typography>
                                            <Chip
                                                label={getTypeLabel(odometerInfo.lastRecord.type)}
                                                size="small"
                                                sx={{
                                                    backgroundColor: `${getTypeColor(odometerInfo.lastRecord.type)}20`,
                                                    color: getTypeColor(odometerInfo.lastRecord.type),
                                                    border: `1px solid ${getTypeColor(odometerInfo.lastRecord.type)}`,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarToday sx={{ fontSize: '0.9rem', color: '#2196f3' }} />
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                {formatDateTime(odometerInfo.lastRecord.dateTime)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}
                        </>
                    )}

                    <Grid item xs={12}>
                        <Typography variant="body2" sx={{ color: '#ff9800', fontStyle: 'italic' }}>
                            💡 Показание одометра должно быть больше или равно последнему зафиксированному значению
                        </Typography>
                    </Grid>

                    {showValidationMessage && validationResult && (
                        <Grid item xs={12}>
                            <Paper
                                sx={{
                                    p: 2,
                                    background: validationResult.isValid
                                        ? 'rgba(76, 175, 80, 0.1)'
                                        : 'rgba(244, 67, 54, 0.1)',
                                    border: `1px solid ${validationResult.isValid ? '#4caf50' : '#f44336'}`,
                                    borderRadius: '8px',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: validationResult.isValid ? '#4caf50' : '#f44336',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {validationResult.message}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </motion.div>
    );
};