import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { gql, useQuery } from '@apollo/client';
import CheckoutForm from "./CheckoutForm";
import "./Checkout.css";
import { useParams, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Stepper, Step, StepLabel, Typography} from '@mui/material';
import ItemGalleryComponent from "../ItemDescriptionComponent/ItemGalleryComponent";
import DeliveryComponent from "./Delivery/DeliveryComponent";
import QuantityComponent from "./Quantity/QuantityComponent";
import Paper from "../utils/Paper";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe("pk_live_51L6AazEgfnYT7YfLYJXXyi55Bg4l81m6Ydbv7LLBYaZWxpAmI2W27OT4BWZzDoVwCxWVS1jl83aEq2Z5nnMZdmMm001nFsLJQx");

const GET_ITEM = gql`
  query get_item_description($id: Int!) {
    items_by_pk(item_id: $id) {
      description
      preview_img
      creatorByCreator {
        sub
        creator_name
        bio
        Role
        username
      }
      filename
      item_id
      name
      statusof
      item_images {
        image_name
      }
      item_files {
        file_name
        file_type
        item_id
        file_path
        dim_x
        dim_y
        dim_z
        filament_used
      }
    }

    materials {
      material_name
      material_price_per_gram
      material_price_per_print
    }

    filaments {
      filament_id
      material
      color_r
      color_g
      color_b
    }
  }
`

function rgb(r, g, b){
  return "rgb("+r+","+g+","+b+")";
}

const steps = ['Delivery Options', 'Quantities','Payment'];


export default function CheckoutComponent(props) {
  let { id, material, filament } = useParams();

  const [clientSecret, setClientSecret] = useState("");
  const [price, setPrice] = useState(-1);
  const [shippingCost, setShippingCost] = useState(-1);
  const [licenseCost, setLicenseCost] = useState(-1);
  const [activeStep, setActiveStep] = useState(0);

  const [deliveryID, setDeliveryID] = useState(-1);

  const [firstPaymentIntent, setFirstPaymentIntent] = useState(true)

  const { loading, error, data } = useQuery(GET_ITEM, { 
    variables: {id},
  });

  if(activeStep === 2 && firstPaymentIntent) {
    setFirstPaymentIntent(false);
      // Create PaymentIntent as soon as step 3 is reached
    fetch(process.env.REACT_APP_PYTHON_BACKEND_URL + "/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({delivery_id: deliveryID}),
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setPrice(data.price);
        setShippingCost(data.shipping_cost);
        setLicenseCost(data.license_cost);
      });
    
  }

  if (loading) return <Box sx={{display: "fley", verticalAlign: "center"}}><CircularProgress /></Box>;
  if (error) return <p>Error: {error}</p>;

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  const filamentObj = data.filaments.find(e => filament == e.filament_id);
  const color = rgb(filamentObj.color_r, filamentObj.color_g, filamentObj. color_b);

  const onNextDelivery = (delivery_id) => {
    setActiveStep(activeStep + 1);
    setDeliveryID(delivery_id);
  };

  const onNextQuantity = () => {
    setActiveStep(activeStep + 1);
  }

  let stepComponentArray = [
    <DeliveryComponent onNext={onNextDelivery} material={material} filament={filament}/>,
    <QuantityComponent onNext={onNextQuantity} itemID={id} deliveryID={deliveryID} filament={filament}/>,
    <Paper sx={{mt: "8pt", p: "8pt", display: "flex", gap: "8pt", flexDirection: "column", width: {xs: "100%", md:"50%"}}}>
      {clientSecret && (
        <>
          <Box sx={{display: "flex", justifyContent: "space-between"}}>
            <Typography variant='p' style={{fontWeight:500, marginTop: "4pt"}}>Total: </Typography>
            <Typography variant='p' style={{fontWeight:500, marginTop: "4pt"}}>{(shippingCost + price + licenseCost)/ 100 + "€"}</Typography>
          </Box>
          <Box sx={{display: "flex", justifyContent: "space-between"}}>
            <Typography variant='p' style={{fontWeight:300, marginTop: "4pt"}}>Object Price: </Typography>
            <Typography variant='p' style={{fontWeight:300, marginTop: "4pt"}}>{price / 100 + "€"}</Typography>
          </Box>
          <Box sx={{display: "flex", justifyContent: "space-between"}}>
            <Typography variant='p' style={{fontWeight:300, marginTop: "4pt"}}>License Price: </Typography>
            <Typography variant='p' style={{fontWeight:300, marginTop: "4pt"}}>{licenseCost / 100 + "€"}</Typography>
          </Box>
          <Box sx={{display: "flex", justifyContent: "space-between", mb: "8pt"}}>
            <Typography variant='p' style={{fontWeight:300, marginTop: "4pt"}}>Shipping Cost: </Typography>
            <Typography variant='p' style={{fontWeight:300, marginTop: "4pt"}}>{shippingCost/ 100 + "€"}</Typography>
          </Box>
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        </>
      )}
    </Paper>
  ]

  return (
    <Box className="content" sx={{display: "flex", justifyContent: "center", flexDirection: "column"}}>
      <Paper>
        <Stepper activeStep={activeStep} sx={{pt:"8pt", pb: "8pt"}}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};
                    
            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </Paper>

      <Box sx={{display: "flex", justifyContent: "center", flexWrap:{xs: "wrap", md: "nowrap"}}}>
        <Box sx={{width: {xs: "92vw", md: "50%"}, mr: {xs: "0pt", md: "8pt"}}}>
          <ItemGalleryComponent itemFiles={data.items_by_pk.item_files} itemImages={data.items_by_pk.item_images} color={color}/>
        </Box>
        
        {stepComponentArray[activeStep]}
      </Box>
    </Box>
  );
}
