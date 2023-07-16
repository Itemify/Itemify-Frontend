import React from 'react';
import Card from '@mui/material/Card'
import { Box, Container, CircularProgress } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography'
import { gql, useQuery } from '@apollo/client';
import LoadingComponent from './LoadingComponent';
import Paper from './utils/Paper';

const GET_MATERIALS = gql`
  query get_materials {
    materials {
      material_img
      material_name
      material_price_per_gram
      material_price_per_print
    }
  }
` 

function PricingElement(mat) {
  return (
    <Paper bgcolor="background.secondary" sx={{paddingTop: "16pt", paddingBottom: "16pt"}}>
        <Container>
          <Typography variant="h5" component="div" style={{ textAlign: 'center', fontWeight: 500 }}>
            {mat.material_name}
          </Typography>
          <Box sx={{padding:"16pt 0pt"}}>
            <img src={mat.material_img} alt="PLA"
              style={{ maxWidth: "100%", borderRadius: "8pt"}}
            />
          </Box>
          
          <Typography component="div" style={{ textAlign: 'center', fontWeight: 300, fontSize: "0.8rem" }}>
            Base Costs
          </Typography>
          <Typography component="div" style={{ textAlign: 'center', fontWeight: 500 }}>
            {mat.material_price_per_print / 100}€
          </Typography>
          <Typography component="div" style={{ textAlign: 'center', fontWeight: 300, fontSize: "0.8rem" }}>
            Cost per weight:
          </Typography>
          <Typography component="div" style={{ textAlign: 'center', fontWeight: 500 }}>
            {mat.material_price_per_gram}ct/g
          </Typography>
          <Typography component="div" style={{ textAlign: 'center', fontWeight: 300, fontSize: "0.8rem" }}>
            Shipping
          </Typography>
          <Typography component="div" style={{ textAlign: 'center', fontWeight: 500 }}>
            Variable
          </Typography>
        </Container>
    </Paper>
  )
  
}

function PricingComponent() {
  const { loading, error, data } = useQuery(GET_MATERIALS);

  if (loading) return <LoadingComponent/>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className='content'>
      <Box sx={{ width: "100%", display: "flex", justifyContent:"space-between", gap: "8pt",flexWrap: {xs: "wrap", md: "nowrap"}}}>
        {data.materials.map((mat) => { return PricingElement(mat)} )}
      </Box>
    </div>
    );
  }
  
  export default PricingComponent;