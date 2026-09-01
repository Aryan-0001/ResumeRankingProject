import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Fade,
  Select
} from '@mui/material'

import { api } from '../api/client.js'

export default function RegisterPage() {
  const nav = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('candidate')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      console.log('Submitting registration:', { email, password, role })
      const res = await api.post('/auth/register', { email, password, role })
      console.log('Registration response:', res.data)
      nav('/login', { replace: true })
    } catch (err) {
      console.error('Registration error:', err)
      const errorMessage = err?.response?.data?.detail || err?.message || 'Registration failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ 
      py: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    }}>
      <Fade in timeout={800}>
        <Card 
          elevation={24} 
          sx={{ 
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(15, 15, 15, 0.95) 100%)',
            border: '2px solid transparent',
            backgroundClip: 'padding-box, border-box',
            backgroundOrigin: 'padding-box, border-box',
            backgroundImage: `
              linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(15, 15, 15, 0.95)),
              linear-gradient(45deg, #ff00ff, #00ffff)
            `,
            boxShadow: `
              0 20px 60px rgba(0, 0, 0, 0.5),
              0 0 40px rgba(255, 0, 255, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #ff00ff, #00ffff, transparent)',
              animation: 'slide 3s ease-in-out infinite'
            },
            '@keyframes slide': {
              '0%': { transform: 'translateX(-100%)' },
              '100%': { transform: 'translateX(100%)' }
            }
          }}
        >
          <CardContent sx={{ p: 5 }}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography 
                  variant="h3" 
                  fontWeight={700}
                  sx={{
                    background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 30px rgba(255, 0, 255, 0.5)',
                    mb: 1
                  }}
                >
                  Create Account
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '1.1rem',
                    fontWeight: 400
                  }}
                >
                  Join the AI-Powered Job Matching Platform
                </Typography>
              </Box>

              <Fade in={!!error} timeout={300}>
                <Box>
                  {error && (
                    <Alert 
                      severity="error"
                      sx={{
                        background: 'rgba(255, 0, 64, 0.1)',
                        border: '1px solid rgba(255, 0, 64, 0.3)',
                        color: '#ff6b6b',
                        '& .MuiAlert-icon': {
                          color: '#ff0040'
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  )}
                </Box>
              </Fade>

              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={3}>
                  <TextField 
                    label="Email Address"
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(26, 26, 26, 0.8)',
                        border: '1px solid rgba(255, 0, 255, 0.3)',
                        borderRadius: '12px',
                        '&:hover': {
                          borderColor: 'rgba(255, 0, 255, 0.5)',
                          boxShadow: '0 0 15px rgba(255, 0, 255, 0.2)'
                        },
                        '&.Mui-focused': {
                          borderColor: '#ff00ff',
                          boxShadow: '0 0 20px rgba(255, 0, 255, 0.4), inset 0 0 10px rgba(255, 0, 255, 0.1)'
                        }
                      }
                    }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: 'rgba(26, 26, 26, 0.8)',
                        border: '1px solid rgba(255, 0, 255, 0.3)',
                        borderRadius: '12px',
                        '&:hover': {
                          borderColor: 'rgba(255, 0, 255, 0.5)',
                          boxShadow: '0 0 15px rgba(255, 0, 255, 0.2)'
                        },
                        '&.Mui-focused': {
                          borderColor: '#ff00ff',
                          boxShadow: '0 0 20px rgba(255, 0, 255, 0.4), inset 0 0 10px rgba(255, 0, 255, 0.1)'
                        }
                      }
                    }}
                  />
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    fullWidth
                    sx={{
                      background: 'rgba(26, 26, 26, 0.8)',
                      border: '1px solid rgba(255, 0, 255, 0.3)',
                      borderRadius: '12px',
                      '&:hover': {
                        borderColor: 'rgba(255, 0, 255, 0.5)',
                        boxShadow: '0 0 15px rgba(255, 0, 255, 0.2)'
                      },
                      '&.Mui-focused': {
                        borderColor: '#ff00ff',
                        boxShadow: '0 0 20px rgba(255, 0, 255, 0.4), inset 0 0 10px rgba(255, 0, 255, 0.1)'
                      },
                      '& .MuiSelect-select': {
                        color: '#ffffff'
                      },
                      '& .MuiInputLabel-root': {
                        color: '#b0b0b0'
                      }
                    }}
                  >
                    <MenuItem value="candidate">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🎯 Candidate - Looking for Jobs
                      </Box>
                    </MenuItem>
                    <MenuItem value="company">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🏢 Company - Hiring Talent
                      </Box>
                    </MenuItem>
                  </Select>

                  <Button 
                    type="submit" 
                    variant="contained" 
                    size="large" 
                    disabled={loading}
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #ff00ff 0%, #e040ff 100%)',
                      boxShadow: '0 0 25px rgba(255, 0, 255, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #ff40ff 0%, #ff00ff 100%)',
                        boxShadow: '0 0 35px rgba(255, 0, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
                        transform: 'translateY(-2px)'
                      },
                      '&:active': {
                        transform: 'translateY(0)'
                      }
                    }}
                  >
                    {loading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={20} sx={{ color: '#fff' }} />
                        Creating Account...
                      </Box>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </Stack>
              </Box>

              <Box sx={{ textAlign: 'center', pt: 2 }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary'
                  }}
                >
                  Already have an account?{' '}
                  <Link 
                    to="/login"
                    style={{
                      color: '#ff00ff',
                      textDecoration: 'none',
                      fontWeight: 600,
                      textShadow: '0 0 10px rgba(255, 0, 255, 0.5)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.textShadow = '0 0 20px rgba(255, 0, 255, 0.8)'
                      e.target.style.color = '#ff40ff'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textShadow = '0 0 10px rgba(255, 0, 255, 0.5)'
                      e.target.style.color = '#ff00ff'
                    }}
                  >
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  )
}
