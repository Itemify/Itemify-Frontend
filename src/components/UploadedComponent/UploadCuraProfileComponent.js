import { Box, Button, Typography } from '@mui/material';
import React, { Suspense, useState } from 'react';
import axios from "axios";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["CURAPROFILE"];

function UploadCuraProfileComponent(props) {
    let { id, name } = props;
    var filename = "";
    const handleChange = (file) => {
      var data = new FormData();
      data.append("is_image", "True");
      data.append("model_id", id);
      data.append('file', file);
      filename = file;
  
      axios.request({
        method: "post",
        url: REACT_APP_PYTHON_BACKEND_URL + "/files",
        data: data
      })
      .then((response) => {
        
      })
    };

    return (
        <Box>
            <Typography variant='h5' sx={{pt: "16pt", pb: "8pt"}}>Images</Typography>
            <FileUploader id="uploader" handleChange={handleChange} name="file" types={fileTypes}/>

            <Box sx={{display:"flex", flexDirection:"row", marginTop:"2%", justifyContent:"space-between"}}>
              <Button variant="text" onClick={e => props.onBack()}>BACK</Button>
              <Button variant="contained" onClick={e => {props.onFinish()}}>Next</Button>
            </Box>
        </Box>
    );
}

export default UploadCuraProfileComponent;
