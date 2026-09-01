import { Container, Box } from '@mui/material'
import AppRouter from './routes/AppRouter.jsx'

export default function App() {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse at top left, rgba(0, 255, 255, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at top right, rgba(255, 0, 255, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at bottom left, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at bottom right, rgba(255, 0, 255, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0a0a0a 0%, #050505 50%, #0a0a0a 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 255, 0.03) 2px,
            rgba(0, 255, 255, 0.03) 4px
          )
        `,
        pointerEvents: 'none',
        zIndex: 1
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '-50%',
        left: '-50%',
        width: '200%',
        height: '200%',
        background: `
          conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(0, 255, 255, 0.1) 60deg,
            transparent 120deg,
            rgba(255, 0, 255, 0.1) 180deg,
            transparent 240deg,
            rgba(0, 255, 255, 0.1) 300deg,
            transparent 360deg
          )
        `,
        animation: 'rotate 20s linear infinite',
        pointerEvents: 'none',
        zIndex: 0
      },
      '@keyframes rotate': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' }
      }
    }}>
      <Container maxWidth={false} disableGutters sx={{ 
        minHeight: '100vh',
        position: 'relative',
        zIndex: 2
      }}>
        <AppRouter />
      </Container>
    </Box>
  )
}
