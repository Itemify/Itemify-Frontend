import React from 'react';
import { FileUploader } from "react-drag-drop-files";
import axios from 'axios';
import './UploadComponent.css';
import { useNavigate } from "react-router-dom";
import { useKeycloak } from "@react-keycloak/web";
import Paper from '../utils/Paper';
import { Box, Container, Typography } from '@mui/material';

const fileTypes = ["STL"];

const steps = [
  {
    index: 1,
    title: "1. Drop your main File here!",
    description: "The model dropped here will be shown later in every step to help you visually through the steps."
  },
  {
    index: 2,
    title: "2. Label the Object",
    description: "Here you have to name and describe your model."
  },
  {
    index: 3,
    title: "3. Upload",
    description: "Here you can upload images and more models. If you want to make some money with your model, this makes it more interesting for buyers."
  },
  {
    index: 4,
    title: "4. Best Practices",
    description: "Tell us how you think its the easiest to print your model. So we and others can perform the best while printing it."
  },
  {
    index: 5,
    title: "5. Review Everything",
    description: "Here you can see how the published model will look. If you want to publish it this way, you can press publish on the bottom."
  },
]

function UploadComponent() {
  const { keycloak } = useKeycloak();
  let navigate = useNavigate();
  var filename = "";

  const handleChange = (file) => {
    var data = new FormData();
    data.append("is_image", "False");
    data.append("model_id", "-1");
    data.append('file', file);
    filename = file;

    axios.request({
      method: "post",
      url: process.env.REACT_APP_PYTHON_BACKEND_URL + "/files",
      headers: {
        'Authorization': 'Bearer ' + keycloak.token
      },
      data: data
    })
    .then((response) => {
      console.log(response);
      navigate( "/uploaded/" + response.data["recordId"] + "/" + filename.name);
    })
  };


  return (
    <Paper className='content' sx={{textAlign: "center"}}>
      <Typography variant="h5" component="div" style={{ textAlign: 'center', fontWeight: 500 }}>
        Uploader
      </Typography>

      <Paper bgcolor="background.secondary" sx={{p: "8pt", m: "8pt 0pt"}}>
        <FileUploader id="uploader" handleChange={handleChange} name="file" types={fileTypes}/>
      </Paper>

      <Paper bgcolor="background.secondary" sx={{marginBottom: "8pt", padding: "8pt 8pt"}}>
        <Typography variant="p" component="div" style={{ textAlign: 'center', fontWeight: 300 }}>
          Here you can upload your .stl file. 
          After uploading you have to go through these steps to publish the model:
      </Typography>
      </Paper>

        

        <Box sx={{ textAlign: "center", width: "100%", display: "flex", justifyContent:"space-around", gap: "8pt",flexWrap: {xs: "wrap", md: "nowrap"}}}>
          
          {steps.map((x) => 
            <Paper bgcolor="background.secondary" sx={{paddingTop: "16pt", paddingBottom: "16pt", flex: 1}}>
              <Container>
                <h3>{x.title}</h3>
                <p>{x.description}</p>
              </Container>
            </Paper>
          )}
          
        </Box>

        <p>
          You will get 20% of all revenue made by your model.
        </p>
        
        

    </Paper>
  );
}

export default UploadComponent;
