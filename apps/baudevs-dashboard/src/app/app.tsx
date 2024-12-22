import { Box, Button, Typography } from '@mui/material';


  export function App() {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Box>
          <Typography variant="h4">Baudevs Dashboard</Typography>
          <Button variant="contained" color="primary" className="mt-4">
            Hello from MUI
          </Button>
        </Box>
      </div>
    );
  }


export default App;