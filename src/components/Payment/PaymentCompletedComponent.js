import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Paper from '../utils/Paper';

function PaymentCompletedComponent() {
    let navigate = useNavigate();

    return (
      <Paper className='content' elevation={2}>
        <h1>Thank you for choosing us</h1>
        <Button variant='contained' onClick={() => navigate("/")}>Go Back</Button>
      </Paper>
    );
  }
  
  export default PaymentCompletedComponent;