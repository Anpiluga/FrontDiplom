import { createTheme } from '@mui/material/styles';

const getTheme = (mode) => createTheme({
    palette: {
        mode: mode ? 'dark' : 'light',
        primary: {
            main: mode ? '#ff8c38' : '#ff8c38',
        },
        secondary: {
            main: mode ? '#76ff7a' : '#76ff7a',
        },
        background: {
            default: mode
                ? 'linear-gradient(135deg, #2c1b47 0%, #1a1a1a 100%)'
                : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
            paper: mode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        },
        text: {
            primary: mode ? '#ffffff' : '#1a1a1a',
            secondary: mode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        },
    },
    typography: {
        fontFamily: "'Ubuntu', sans-serif",
        h3: {
            fontFamily: "'Ubuntu', sans-serif",
            fontWeight: 700,
            background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        h4: {
            fontFamily: "'Ubuntu', sans-serif",
            fontWeight: 600,
            color: mode ? '#ffffff' : '#1a1a1a',
        },
        h5: {
            fontFamily: "'Ubuntu', sans-serif",
            fontWeight: 600,
            color: mode ? '#ffffff' : '#1a1a1a',
        },
        h6: {
            fontFamily: "'Ubuntu', sans-serif",
            fontWeight: 500,
            color: mode ? '#ffffff' : '#1a1a1a',
        },
        body1: {
            fontFamily: "'Ubuntu', sans-serif",
            color: mode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        },
        body2: {
            fontFamily: "'Ubuntu', sans-serif",
            color: mode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        },
        subtitle1: {
            fontFamily: "'Ubuntu', sans-serif",
            color: mode ? '#ffffff' : '#1a1a1a',
        },
        subtitle2: {
            fontFamily: "'Ubuntu', sans-serif",
            color: mode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        },
        caption: {
            fontFamily: "'Ubuntu', sans-serif",
            color: mode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: "'Ubuntu', sans-serif",
                    borderRadius: '12px',
                    textTransform: 'none',
                    padding: '10px 20px',
                    transition: 'all 0.3s ease',
                    fontSize: '16px',
                    color: mode ? '#ffffff' : '#1a1a1a',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: mode ? '0 4px 15px rgba(255, 140, 56, 0.4)' : '0 4px 15px rgba(0, 0, 0, 0.2)',
                    },
                },
                contained: {
                    background: 'linear-gradient(45deg, #ff8c38, #76ff7a)',
                    color: '#1a1a1a',
                },
                outlined: {
                    borderColor: mode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    color: mode ? '#ffffff' : '#1a1a1a',
                    '&:hover': {
                        borderColor: '#ff8c38',
                        color: '#ff8c38',
                    },
                },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                root: {
                    fontFamily: "'Ubuntu', sans-serif",
                },
                primary: {
                    fontFamily: "'Ubuntu', sans-serif",
                    fontSize: '16px',
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
                secondary: {
                    fontFamily: "'Ubuntu', sans-serif",
                    color: mode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontFamily: "'Ubuntu', sans-serif",
                    fontSize: '16px',
                    color: mode ? '#ffffff' : '#1a1a1a',
                    '&:hover': {
                        background: mode ? 'rgba(255, 140, 56, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    background: mode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: mode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    boxShadow: mode ? '0 4px 30px rgba(0, 0, 0, 0.2)' : '0 4px 30px rgba(0, 0, 0, 0.1)',
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    fontFamily: "'Ubuntu', sans-serif",
                    borderBottom: mode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    color: mode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                },
                head: {
                    fontFamily: "'Ubuntu', sans-serif",
                    background: mode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    color: mode ? '#ff8c38' : '#ff8c38',
                    fontWeight: 600,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiInputBase-root': {
                        fontFamily: "'Ubuntu', sans-serif",
                        background: mode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '8px',
                        color: mode ? '#ffffff' : '#1a1a1a',
                    },
                    '& .MuiInputLabel-root': {
                        fontFamily: "'Ubuntu', sans-serif",
                        color: mode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    },
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: mode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                        },
                        '&:hover fieldset': {
                            borderColor: '#ff8c38',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#ff8c38',
                        },
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    fontFamily: "'Ubuntu', sans-serif",
                    background: mode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    borderRadius: '8px',
                    color: mode ? '#ffffff' : '#1a1a1a',
                    '& .MuiSelect-icon': {
                        color: mode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    },
                    '&:before': {
                        borderColor: mode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                    },
                    '&:hover:not(.Mui-disabled):before': {
                        borderColor: '#ff8c38',
                    },
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontFamily: "'Ubuntu', sans-serif",
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    fontFamily: "'Ubuntu', sans-serif",
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    fontFamily: "'Ubuntu', sans-serif",
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
                h1: {
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
                h2: {
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
                h3: {
                    // Сохраняем градиент для h3
                },
                h4: {
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
                h5: {
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
                h6: {
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
                body1: {
                    color: mode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
                },
                body2: {
                    color: mode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                },
                subtitle1: {
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
                subtitle2: {
                    color: mode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
                },
                caption: {
                    color: mode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
                input: {
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
            },
        },
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    color: mode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: mode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontFamily: "'Ubuntu', sans-serif",
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    background: mode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: mode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    color: mode ? '#ffffff' : '#1a1a1a',
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    fontFamily: "'Ubuntu', sans-serif",
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    fontFamily: "'Ubuntu', sans-serif",
                    color: mode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    '&.Mui-selected': {
                        color: '#ff8c38',
                    },
                },
            },
        },
    },
});

export default getTheme;