import { Box, CircularProgress, Step, StepLabel, Stepper, Fab } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Model } from '../3DModels/Model';
import { PresentationControls } from '@react-three/drei';
import { useParams, useSearchParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from '@apollo/client';
import LabelObjectComponent from './LabelObjectComponent';
import UploadImages from './UploadImages';
import BestPracticesComponent from './BestPracticesComponent';
import ItemDescriptionComponent from '../ItemDescriptionComponent/ItemDescriptionComponent';
import Paper from '../utils/Paper';


const PUBLISH_ITEM = gql`
  mutation publish_item($id:Int!) {
    update_items_by_pk(
      pk_columns:{item_id: $id}
      _set: { published: true }
    ) {
      item_id
      published
    }
  }
` 

function UploadedComponent() {
    let navigate = useNavigate();
    let [searchParams, setSearchParams] = useSearchParams()

    let { id, name } = useParams();
    const _page = searchParams.get("page");
    const [activeStep, setActiveStep] = React.useState(_page ? _page : 0);

    const [publish_item, { data, loading, error }] = useMutation(PUBLISH_ITEM);

    if (loading) return (
      <Box sx={{display:"flex", justifyContent: "center", pt: "2%"}}>
        <CircularProgress />
      </Box>
    );

    if (error) return (
      <h1>{"" + error}</h1>
    );

    if(data) {
      navigate("/")
    }

    const onStepChange = (index) => {
      searchParams.set("page", index);
      setSearchParams(searchParams);

      setActiveStep(index);
    };

    let steps = ['Label the Object', 'Upload Stuff', 'Best Practices', 'Review'];
    let stepComponentArray = [
        <Paper sx={{mt:"8pt", pl:"8pt", pr: "8pt", pb: "16px"}}>
            <LabelObjectComponent id={id} name={name} onFinish={() => onStepChange(1)}/>
        </Paper>,
        <UploadImages id={id} name={name} onFinish={() => onStepChange(2)} onBack={() => {onStepChange(0)}}/>,
        <Paper sx={{mt:"8pt", pl:"8pt", pr: "8pt", pb: "16px"}}>
          <BestPracticesComponent id={id} name={name} onFinish={() => onStepChange(3)}/>,
        </Paper>, 
        <Box sx={{mt:"0pt", pl:"0pt", pr: "0pt", pb: "16px"}}>
          <ItemDescriptionComponent/>
          <Fab variant="extended"sx={{
            position: 'absolute',
            bottom: "60pt",
            right: "60pt",
          }}
            onClick={e => {
                publish_item({
                  variables: {
                    id: parseInt(id)
                  }
                });
            }}>
              
              Publish
              <SendRoundedIcon sx={{ ml: 1 }} />
            </Fab>
        </Box>
        
    ]

    return (
      <Box className='content'>
          <Paper>
            <Stepper activeStep={activeStep} sx={{mb:"8pt", pt:"8pt", pb: "8pt"}}>
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
          <Paper autoComplete="off">
            <Canvas camera={{ position: [0, 100, 0] }}>
              <Suspense fallback={null}>
                <color attach="background" args={["lightgrey"]} />
                <ambientLight/>
                <pointLight position={[10, 10, 10]}/>
                

                <PresentationControls
                    polar={[-Infinity, +Infinity]}>
                    <Model url={process.env.REACT_APP_S3_BUCKET_URL + id + "/" + name} />
                </PresentationControls>
              </Suspense>
            </Canvas>
          </Paper> 
          
          {stepComponentArray[activeStep]}
       
      </Box>
      
    );
  }
  
  export default UploadedComponent;
