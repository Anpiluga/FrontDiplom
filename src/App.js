import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './pages/FR/context/AuthContext';
import Login from './pages/FR/components/Login';
import Register from './pages/FR/components/Register';
import CarList from './pages/FR/components/CarList';
import CarForm from './pages/FR/components/CarForm';
import DriverList from './pages/FR/components/DriverList';
import DriverForm from './pages/FR/components/DriverForm';
import FuelList from './pages/FR/components/FuelList';
import FuelForm from './pages/FR/components/FuelForm';
import Home from './pages/FR/components/Home';
import ProtectedRoute from './pages/FR/components/ProtectedRoute';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { ErrorBoundary } from 'react-error-boundary';
import Header from './pages/FR/components/Header';
import Sidebar from './pages/FR/components/Sidebar';
import getTheme from './pages/FR/theme/theme';
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
    const { darkMode } = useContext(AuthContext);
    console.log('Current path:', location.pathname);
    console.log('darkMode:', darkMode);
    const showSidebar = ['/home', '/cars', '/drivers', '/fuel', '/cars/add', '/cars/edit', '/drivers/add', '/drivers/edit', '/fuel/add', '/fuel/edit'].some(path => location.pathname.startsWith(path));
    console.log('showSidebar:', showSidebar);
    const theme = getTheme(darkMode !== undefined ? darkMode : true);

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