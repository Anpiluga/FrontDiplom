import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Alert,
    Box,
    Tabs,
    Tab,
    Switch,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
} from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import TextField from '@mui/material/TextField';

const CarList = () => {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [error, setError] = useState('');
    const [selectedCarId, setSelectedCarId] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [carDetails, setCarDetails] = useState({
        brand: '',
        model: '',
        year: '',
        licensePlate: '',
        driverId: '',
        counterType: 'odometer', // 'odometer' или 'motohours'
        secondaryCounterEnabled: false,
    });
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await axios.get('http://localhost:8080/admin/cars', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setCars(response.data);
            } catch (err) {
                console.error('Error fetching cars', err);
                setError('Ошибка при загрузке автомобилей');
            }
        };

        const fetchDrivers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/admin/drivers', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setDrivers(response.data);
            } catch (err) {
                console.error('Error fetching drivers', err);
            }
        };

        fetchCars();
        fetchDrivers();
    }, []);

    useEffect(() => {
        if (selectedCarId) {
            const fetchCarDetails = async () => {
                try {
                    const response = await axios.get(`http://localhost:8080/admin/cars/${selectedCarId}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                    });
                    const car = response.data;
                    setCarDetails({
                        brand: car.brand,
                        model: car.model,
                        year: car.year,
                        licensePlate: car.licensePlate,
                        driverId: car.driverId || '',
                        counterType: car.counterType || 'odometer',
                        secondaryCounterEnabled: car.secondaryCounterEnabled || false,
                    });
                } catch (err) {
                    console.error('Error fetching car details', err);
                }
            };
            fetchCarDetails();
        }
    }, [selectedCarId]);

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот автомобиль?')) return;

        try {
            await axios.delete(`http://localhost:8080/admin/cars/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            setCars(cars.filter((car) => car.id !== id));
            setSelectedCarId(null);
        } catch (err) {
            console.error('Error deleting car', err);
            setError('Ошибка при удалении автомобиля');
        }
    };

    const handleSave = async () => {
        try {
            const data = {
                brand: carDetails.brand,
                model: carDetails.model,
                year: parseInt(carDetails.year),
                licensePlate: carDetails.licensePlate,
                driverId: carDetails.driverId ? parseInt(carDetails.driverId) : null,
                counterType: carDetails.counterType,
                secondaryCounterEnabled: carDetails.secondaryCounterEnabled,
            };

            if (selectedCarId) {
                await axios.put(`http://localhost:8080/admin/cars/${selectedCarId}`, data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
            } else {
                const response = await axios.post('http://localhost:8080/admin/cars', data, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setCars([...cars, response.data]);
            }
            setError('');
        } catch (err) {
            console.error('Error saving car', err);
            setError('Ошибка при сохранении автомобиля');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCarDetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleToggleSecondaryCounter = (e) => {
        setCarDetails((prev) => ({
            ...prev,
            secondaryCounterEnabled: e.target.checked,
        }));
    };

    const sortedCars = [...cars].sort((a, b) => a.id - b.id);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth={false} sx={{ maxWidth: '1600px', mt: 4, pt: 4, display: 'flex' }}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    sx={{
                        mb: 4,
                        background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    Список автомобилей
                </Typography>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setSelectedCarId(null);
                            setCarDetails({
                                brand: '',
                                model: '',
                                year: '',
                                licensePlate: '',
                                driverId: '',
                                counterType: 'odometer',
                                secondaryCounterEnabled: false,
                            });
                            setTabValue(0);
                        }}
                        sx={{ mb: 2 }}
                    >
                        Добавить автомобиль
                    </Button>
                </motion.div>
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2,
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
                <Box sx={{ display: 'flex' }}>
                    <Box sx={{ width: '300px', mr: 2 }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            orientation="vertical"
                            sx={{
                                borderRight: 1,
                                borderColor: 'divider',
                                background: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(44, 27, 71, 0.9)'
                                        : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '8px 0 0 8px',
                            }}
                        >
                            <Tab label="Информация" />
                            <Tab label="Топливо" />
                            <Tab label="Дополнительно" />
                        </Tabs>
                        <Box sx={{ p: 2 }}>
                            {tabValue === 0 && (
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Марка"
                                        name="brand"
                                        value={carDetails.brand}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        sx={{ mb: 2, height: '56px' }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Модель"
                                        name="model"
                                        value={carDetails.model}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        sx={{ mb: 2, height: '56px' }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Год"
                                        name="year"
                                        type="number"
                                        value={carDetails.year}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        sx={{ mb: 2, height: '56px' }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Госномер"
                                        name="licensePlate"
                                        value={carDetails.licensePlate}
                                        onChange={handleChange}
                                        required
                                        variant="outlined"
                                        sx={{ mb: 2, height: '56px' }}
                                    />
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Водитель</InputLabel>
                                        <Select
                                            name="driverId"
                                            value={carDetails.driverId || ''}
                                            onChange={handleChange}
                                            label="Водитель"
                                        >
                                            <MenuItem value="">
                                                <em>Без водителя</em>
                                            </MenuItem>
                                            {drivers.map((driver) => (
                                                <MenuItem key={driver.id} value={driver.id}>
                                                    {driver.firstName} {driver.lastName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Тип счётчика</InputLabel>
                                        <Select
                                            name="counterType"
                                            value={carDetails.counterType}
                                            onChange={handleChange}
                                            label="Тип счётчика"
                                        >
                                            <MenuItem value="odometer">Одометр</MenuItem>
                                            <MenuItem value="motohours">Моточасы</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={carDetails.secondaryCounterEnabled}
                                                onChange={handleToggleSecondaryCounter}
                                                color="primary"
                                            />
                                        }
                                        label="Вкл/выкл второй счётчик"
                                        sx={{ mb: 2 }}
                                    />
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleSave}
                                            sx={{
                                                width: '100%',
                                                py: 1.5,
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
                                </Box>
                            )}
                            {tabValue === 1 && (
                                <Box>
                                    <TextField
                                        fullWidth
                                        label="Объём топливного бака (л)"
                                        name="fuelTankVolume"
                                        value={carDetails.fuelTankVolume || ''}
                                        onChange={handleChange}
                                        variant="outlined"
                                        sx={{ mb: 2, height: '56px' }}
                                    />
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Тип топлива</InputLabel>
                                        <Select
                                            name="fuelType"
                                            value={carDetails.fuelType || ''}
                                            onChange={handleChange}
                                            label="Тип топлива"
                                        >
                                            <MenuItem value="GASOLINE">Бензин</MenuItem>
                                            <MenuItem value="DIESEL">ДТ</MenuItem>
                                            <MenuItem value="PROPANE">Пропан</MenuItem>
                                            <MenuItem value="METHANE">Метан</MenuItem>
                                            <MenuItem value="ELECTRICITY">Электричество</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        fullWidth
                                        label="Средний расход на 100 км (л)"
                                        name="fuelConsumption"
                                        value={carDetails.fuelConsumption || ''}
                                        onChange={handleChange}
                                        variant="outlined"
                                        sx={{ mb: 2, height: '56px' }}
                                    />
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleSave}
                                            sx={{
                                                width: '100%',
                                                py: 1.5,
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
                                </Box>
                            )}
                            {tabValue === 2 && (
                                <Box>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '200px',
                                            border: '2px dashed #ff8c38',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mb: 2,
                                            borderRadius: '8px',
                                            background: (theme) =>
                                                theme.palette.mode === 'dark'
                                                    ? 'rgba(44, 27, 71, 0.5)'
                                                    : 'rgba(255, 255, 255, 0.5)',
                                        }}
                                    >
                                        <Typography variant="h6" color="text.secondary">
                                            +
                                        </Typography>
                                    </Box>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            sx={{
                                                width: '100%',
                                                mb: 2,
                                                borderColor: '#ff8c38',
                                                color: '#ff8c38',
                                                '&:hover': {
                                                    borderColor: '#76ff7a',
                                                    color: '#76ff7a',
                                                },
                                            }}
                                        >
                                            Загрузить фото
                                            <input type="file" hidden />
                                        </Button>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            sx={{
                                                width: '100%',
                                                mb: 2,
                                                borderColor: '#ff8c38',
                                                color: '#ff8c38',
                                                '&:hover': {
                                                    borderColor: '#76ff7a',
                                                    color: '#76ff7a',
                                                },
                                            }}
                                        >
                                            Выбрать файлы
                                            <input type="file" multiple hidden />
                                        </Button>
                                    </motion.div>
                                    <TextField
                                        fullWidth
                                        label="Описание автомобиля"
                                        name="description"
                                        value={carDetails.description || ''}
                                        onChange={handleChange}
                                        variant="outlined"
                                        multiline
                                        rows={4}
                                        sx={{ mb: 2 }}
                                    />
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button
                                            variant="contained"
                                            onClick={handleSave}
                                            sx={{
                                                width: '100%',
                                                py: 1.5,
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
                                </Box>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                        <TableContainer
                            component={Paper}
                            sx={{
                                minWidth: '1300px',
                                border: '2px solid transparent',
                                borderImage: 'linear-gradient(45deg, #ff8c38, #76ff7a) 1',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                background: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'linear-gradient(135deg, rgba(30, 30, 30, 0.9), rgba(50, 50, 50, 0.9))'
                                        : 'linear-gradient(135deg, rgba(200, 200, 200, 0.9), rgba(220, 220, 220, 0.9))',
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ minWidth: 80 }}>ID</TableCell>
                                        <TableCell sx={{ minWidth: 150 }}>Марка</TableCell>
                                        <TableCell sx={{ minWidth: 150 }}>Модель</TableCell>
                                        <TableCell sx={{ minWidth: 100 }}>Год</TableCell>
                                        <TableCell sx={{ minWidth: 150 }}>Госномер</TableCell>
                                        <TableCell sx={{ minWidth: 150 }}>Водитель</TableCell>
                                        <TableCell sx={{ minWidth: 200 }}>Действия</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedCars.map((car) => (
                                        <motion.tr
                                            key={car.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            sx={{
                                                '&:hover': {
                                                    background: (theme) =>
                                                        theme.palette.mode === 'dark'
                                                            ? 'rgba(255, 255, 255, 0.05)'
                                                            : 'rgba(0, 0, 0, 0.05)',
                                                    cursor: 'pointer',
                                                },
                                            }}
                                            onClick={() => {
                                                setSelectedCarId(car.id);
                                                setTabValue(0);
                                            }}
                                        >
                                            <TableCell>{car.id}</TableCell>
                                            <TableCell>{car.brand}</TableCell>
                                            <TableCell>{car.model}</TableCell>
                                            <TableCell>{car.year}</TableCell>
                                            <TableCell>{car.licensePlate}</TableCell>
                                            <TableCell>{car.driver ? `${car.driver.firstName} ${car.driver.lastName}` : 'Нет водителя'}</TableCell>
                                            <TableCell>
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/cars/edit/${car.id}`);
                                                        }}
                                                        sx={{ mr: 1, mb: 1 }}
                                                    >
                                                        Редактировать
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(car.id);
                                                        }}
                                                        sx={{ mb: 1 }}
                                                    >
                                                        Удалить
                                                    </Button>
                                                </motion.div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
            </motion.div>
        </Container>
    );
};

export default CarList;