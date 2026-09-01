import { Box, LinearProgress } from '@mui/material'

export default function LoadingBlock() {
  return (
    <Box sx={{ width: '100%', py: 2 }}>
      <LinearProgress />
    </Box>
  )
}
