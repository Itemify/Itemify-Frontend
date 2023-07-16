import { Box, Button, CircularProgress } from '@mui/material';
import React from 'react';

function LoadingComponent() {
    return (
        <Box sx={{display: "flex", verticalAlign: "center", justifyContent: "center", width:"100%", padding: "16pt 16t"}}>
            <CircularProgress />
        </Box>
    );
  }
  
  export default LoadingComponent;