import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

import App from './App.jsx'
import { AuthProvider } from './state/AuthContext.jsx'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { 
      main: '#00ffff',
      light: '#40e0d0',
      dark: '#00ced1',
      contrastText: '#000000'
    },
    secondary: { 
      main: '#ff00ff',
      light: '#ff40ff',
      dark: '#e040ff',
      contrastText: '#ffffff'
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
      dark: '#050505'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0'
    },
    error: {
      main: '#ff0040'
    },
    success: {
      main: '#00ff40'
    },
    warning: {
      main: '#ffaa00'
    },
    info: {
      main: '#00aaff'
    }
  },
  shape: { 
    borderRadius: 16 
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      textShadow: '0 0 20px rgba(0, 255, 255, 0.5)'
    },
    h2: {
      fontWeight: 600,
      textShadow: '0 0 15px rgba(0, 255, 255, 0.4)'
    },
    h3: {
      fontWeight: 600,
      textShadow: '0 0 10px rgba(0, 255, 255, 0.3)'
    },
    h4: {
      fontWeight: 600,
      textShadow: '0 0 8px rgba(255, 0, 255, 0.3)'
    },
    button: {
      textTransform: 'none',
      fontWeight: 600
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #00ffff 0%, #ff00ff 100%)',
          border: '2px solid transparent',
          backgroundClip: 'padding-box, border-box',
          backgroundOrigin: 'padding-box, border-box',
          backgroundImage: `
            linear-gradient(45deg, #1a1a1a, #1a1a1a),
            linear-gradient(45deg, #00ffff, #ff00ff)
          `,
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3), 0 0 40px rgba(255, 0, 255, 0.2)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(255, 0, 255, 0.3)',
            backgroundImage: `
              linear-gradient(45deg, #2a2a2a, #2a2a2a),
              linear-gradient(45deg, #40e0d0, #ff40ff)
            `
          },
          '&:active': {
            transform: 'translateY(0)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #00ffff 0%, #00ced1 100%)',
          boxShadow: '0 0 25px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.1)',
          '&:hover': {
            background: 'linear-gradient(45deg, #40e0d0 0%, #00ffff 100%)',
            boxShadow: '0 0 35px rgba(0, 255, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)'
          }
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #ff00ff 0%, #e040ff 100%)',
          boxShadow: '0 0 25px rgba(255, 0, 255, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.1)',
          '&:hover': {
            background: 'linear-gradient(45deg, #ff40ff 0%, #ff00ff 100%)',
            boxShadow: '0 0 35px rgba(255, 0, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
          border: '1px solid rgba(0, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            borderColor: 'rgba(0, 255, 255, 0.4)',
            boxShadow: '0 12px 40px rgba(0, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(26, 26, 26, 0.8)',
            border: '1px solid rgba(0, 255, 255, 0.3)',
            borderRadius: '12px',
            '&:hover': {
              borderColor: 'rgba(0, 255, 255, 0.5)',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)'
            },
            '&.Mui-focused': {
              borderColor: '#00ffff',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 10px rgba(0, 255, 255, 0.1)'
            }
          },
          '& .MuiInputLabel-root': {
            color: '#b0b0b0',
            '&.Mui-focused': {
              color: '#00ffff'
            }
          },
          '& .MuiInputBase-input': {
            color: '#ffffff'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
