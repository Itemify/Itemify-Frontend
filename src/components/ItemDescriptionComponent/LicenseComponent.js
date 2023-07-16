import { gql, useMutation } from '@apollo/client';
import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'
import { Box, Typography, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Paper from '../utils/Paper';


function LicenseComponent(props) {
    return (
        <Paper sx={{mt:"8pt", p:"10pt 20pt"}}>
            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <Typography variant='h5' style={{fontWeight:500}} sx={{pb:"4pt"}}>License</Typography>
            </Box>

            <Typography variant='h6' style={{fontWeight:500}} sx={{pb:"4pt"}}>{props.license.license_name_long}</Typography>

            <Typography variant='p' style={{fontWeight:300}} sx={{pb:"4pt"}}>{props.license.license_description}</Typography>
      </Paper>
    )
}

export default LicenseComponent;