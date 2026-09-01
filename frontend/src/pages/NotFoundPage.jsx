import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Stack spacing={2}>
        <Typography variant="h3" fontWeight={800}>
          404
        </Typography>
        <Typography color="text.secondary">Page not found</Typography>
        <Box>
          <Button component={RouterLink} to="/login" variant="contained">
            Go to Login
          </Button>
        </Box>
      </Stack>
    </Container>
  )
}
