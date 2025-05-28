import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './pages/FR/context/AuthContext';
import Login from './pages/FR/components/Login';
import Register from './pages/FR/components/Register';
import CarList from './pages/FR/components/CarList';
import CarForm from './pages/FR/components/CarForm';
import CarView from './pages/FR/components/CarView';
import DriverList from './pages/FR/components/DriverList';
import DriverForm from './pages/FR/components/DriverForm';
import FuelList from './pages/FR/components/FuelList';
import FuelForm from './pages/FR/components/FuelForm';
import ServiceRecordList from './pages/FR/components/ServiceRecordList';
import ServiceRecordForm from './pages/FR/components/ServiceRecordForm';
import ServiceTaskList from './pages/FR/components/ServiceTaskList';
import ServiceTaskForm from './pages/FR/components/ServiceTaskForm';
import AdditionalExpenseList from './pages/FR/components/AdditionalExpenseList';
import AdditionalExpenseForm from './pages/FR/components/AdditionalExpenseForm';
import SparePartList from './pages/FR/components/SparePartList';
import SparePartForm from './pages/FR/components/SparePartForm';
import ReminderList from './pages/FR/components/ReminderList';
import Analytics from './pages/FR/components/Analytics';
import Home from './pages/FR/components/Home';
import ProtectedRoute from './pages/FR/components/ProtectedRoute';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ErrorBoundary } from 'react-error-boundary';
import Header from './pages/FR/components/Header';
import Sidebar from './pages/FR/components/Sidebar';
import getTheme from './pages/FR/theme/theme';
import { jwtDecode } from 'jwt-decode';
import './App.css';

function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ffffff' }}>
            <h2>Что-то пошло не так</h2>
            <p>{error.message}</p>
            <button onClick={resetErrorBoundary}>Попробовать снова</button>
        </div>
    );
}

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const { darkMode, logout } = useContext(AuthContext);

    const showSidebar = [
        '/home', '/cars', '/drivers', '/fuel', '/service-records', '/service-tasks',
        '/additional-expenses', '/analytics', '/spare-parts', '/reminders',
        '/cars/add', '/cars/edit', '/cars/view', '/drivers/add', '/drivers/edit',
        '/fuel/add', '/fuel/edit', '/service-records/add', '/service-records/edit',
        '/service-tasks/add', '/service-tasks/edit', '/additional-expenses/add',
        '/additional-expenses/edit', '/spare-parts/add', '/spare-parts/edit'
    ].some(path => location.pathname.startsWith(path));
    console.log('showSidebar:', showSidebar);
    const theme = getTheme(darkMode !== undefined ? darkMode : true);

    // Проверка токена при загрузке компонента
    useEffect(() => {
        // Функция для проверки валидности токена
        const checkToken = () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    const currentTime = Date.now() / 1000;

                    if (decoded.exp && decoded.exp < currentTime) {
                        console.log('Token expired, logging out automatically');
                        localStorage.removeItem('token');
                        localStorage.removeItem('username');
                        if (logout) {
                            logout();
                        }
                        if (!location.pathname.includes('/login')) {
                            navigate('/login');
                        }
                    }
                } catch (error) {
                    console.error('Invalid token format:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('username');
                    if (!location.pathname.includes('/login')) {
                        navigate('/login');
                    }
                }
            }
        };

        // Проверяем токен при загрузке компонента
        checkToken();

        // Периодическая проверка токена каждую минуту
        const tokenInterval = setInterval(checkToken, 60000);

        // Очистка интервала при размонтировании компонента
        return () => clearInterval(tokenInterval);
    }, [logout, navigate, location.pathname]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    background: theme.palette.background.default,
                }}
            >
                <Header />
                <Box sx={{ display: 'flex', paddingTop: '64px' }}>
                    {showSidebar && <Sidebar />}
                    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/home"
                                element={
                                    <ProtectedRoute>
                                        <Home />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Car routes */}
                            <Route
                                path="/cars"
                                element={
                                    <ProtectedRoute>
                                        <CarList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/cars/add"
                                element={
                                    <ProtectedRoute>
                                        <CarForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/cars/edit/:id"
                                element={
                                    <ProtectedRoute>
                                        <CarForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/cars/view/:id"
                                element={
                                    <ProtectedRoute>
                                        <CarView />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Driver routes */}
                            <Route
                                path="/drivers"
                                element={
                                    <ProtectedRoute>
                                        <DriverList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/drivers/add"
                                element={
                                    <ProtectedRoute>
                                        <DriverForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/drivers/edit/:id"
                                element={
                                    <ProtectedRoute>
                                        <DriverForm />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Fuel routes */}
                            <Route
                                path="/fuel"
                                element={
                                    <ProtectedRoute>
                                        <FuelList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/fuel/add"
                                element={
                                    <ProtectedRoute>
                                        <FuelForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/fuel/edit/:id"
                                element={
                                    <ProtectedRoute>
                                        <FuelForm />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Additional Expenses routes */}
                            <Route
                                path="/additional-expenses"
                                element={
                                    <ProtectedRoute>
                                        <AdditionalExpenseList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/additional-expenses/add"
                                element={
                                    <ProtectedRoute>
                                        <AdditionalExpenseForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/additional-expenses/edit/:id"
                                element={
                                    <ProtectedRoute>
                                        <AdditionalExpenseForm />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Service Record routes */}
                            <Route
                                path="/service-records"
                                element={
                                    <ProtectedRoute>
                                        <ServiceRecordList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/service-records/add"
                                element={
                                    <ProtectedRoute>
                                        <ServiceRecordForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/service-records/edit/:id"
                                element={
                                    <ProtectedRoute>
                                        <ServiceRecordForm />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Service Task routes */}
                            <Route
                                path="/service-tasks"
                                element={
                                    <ProtectedRoute>
                                        <ServiceTaskList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/service-tasks/add"
                                element={
                                    <ProtectedRoute>
                                        <ServiceTaskForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/service-tasks/edit/:id"
                                element={
                                    <ProtectedRoute>
                                        <ServiceTaskForm />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Spare Parts routes */}
                            <Route
                                path="/spare-parts"
                                element={
                                    <ProtectedRoute>
                                        <SparePartList />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/spare-parts/add"
                                element={
                                    <ProtectedRoute>
                                        <SparePartForm />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/spare-parts/edit/:id"
                                element={
                                    <ProtectedRoute>
                                        <SparePartForm />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Reminders route - НОВЫЙ */}
                            <Route
                                path="/reminders"
                                element={
                                    <ProtectedRoute>
                                        <ReminderList />
                                    </ProtectedRoute>
                                }
                            />
                            {/* Analytics route */}
                            <Route
                                path="/analytics"
                                element={
                                    <ProtectedRoute>
                                        <Analytics />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/" element={<Navigate to="/login" />} />
                        </Routes>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

function App() {
    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                window.location.reload();
            }}
            onError={(error, info) => {
                console.error('ErrorBoundary caught an error:', error, info);
            }}
        >
            <Router>
                <AuthProvider>
                    <AppContent />
                </AuthProvider>
            </Router>
        </ErrorBoundary>
    );
}

export default App;