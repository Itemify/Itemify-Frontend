import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import Paper from './utils/Paper';

function LegalNoticeComponent() {
    
    return (
      <Box className="content">
        <Paper sx={{p:"8pt 16pt", mb: "4pt"}}>
            <Typography component="h2" sx={{fontWeight:"500", fontSize: "1.2em", textAlign:"center"}}>Service Provider</Typography>
        </Paper>
        <Paper sx={{p:"16pt 16pt"}}>
            <Typography sx={{fontWeight:"500", fontSize: "1.1em", color:"#222", textAlign:"center"}}>Niklas Baack</Typography>
            <Typography sx={{fontWeight:"400", fontSize: "1em", color: "#666", textAlign:"center"}}>Stammestraße 66</Typography>
            <Typography sx={{fontWeight:"400", fontSize: "1em", color: "#666", textAlign:"center"}}>30459 Hannover</Typography>
            <Typography sx={{fontWeight:"400", fontSize: "1em", color: "#666", mt: "0.7em", textAlign:"center"}}>Kleingewerbe</Typography>

            <Typography sx={{fontWeight:"400", fontSize: "1em", color: "#666", mt: "0.3em", textAlign:"center"}}>Email: contact@itemify.eu</Typography>
      
        </Paper>
        <Paper >
          <Typography component="h2" sx={{fontWeight:"500", fontSize: "1.2em", mt: "0.5em", textAlign:"center"}}>Privacy Policy</Typography>


          <Box sx={{display:"flex", justifyContent:"center"}}>
            <Link to="/privacy">Here</Link>
          </Box>

        </Paper>
      </Box>
    );
  }
  
  export default LegalNoticeComponent;