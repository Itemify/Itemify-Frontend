import {Box, Button, Typography, Table, TableBody, TableHead, TableRow, TableCell, Link, TextField, Switch, FormControl, InputLabel, OutlinedInput, InputAdornment, Autocomplete } from '@mui/material';
import React, { useState } from 'react';
import axios from "axios";
import { FileUploader } from "react-drag-drop-files";
import { gql, useMutation, useQuery } from '@apollo/client';
import { useKeycloak } from "@react-keycloak/web";
import Paper from '../utils/Paper';

const fileTypesIMG = ["PNG", "JPG", "JPEG", "WEBP"];
const fileTypesModels = ["STL"];

const GET_ITEM = gql`
  query get_item($id: Int!) {
    items_by_pk(item_id: $id) {
      description
      preview_img
      creatorByCreator {
        creator_name
        bio
        Role
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
        quantity
        is_license_applied_once
        license_name
        license_price
        show_renderer
      }
    }
    licenses {
      license_name
      license_description
      license_name_long
      commercial_usage
    }
  }
` 

const UPDATE_QUANTITIES = gql`
mutation UPDATE_ITEM_FILE_QUANTITIES($quantity: Int, $file_path: String) {
  update_item_files(where: {file_path: {_eq: $file_path}}, _set: {quantity: $quantity}) {
    returning {
      quantity
    }
  }
}
`;

const UPDATE_LICENSE = gql`
mutation UPDATE_ITEM_FILE_LICENSE($license: String, $file_path: String) {
  update_item_files(where: {file_path: {_eq: $file_path}}, _set: {license_name:$license}) {
    returning {
      quantity
    }
  }
}
`;

const UPDATE_LICENSE_COST = gql`
mutation UPDATE_ITEM_FILE_LICENSE_COST($licensePrice: Int, $file_path: String) {
  update_item_files(where: {file_path: {_eq: $file_path}}, _set: {license_price:$licensePrice}) {
    returning {
      quantity
    }
  }
}
`;

const UPDATE_LICENSE_APPLIED_ONCE = gql`
mutation UPDATE_ITEM_FILE_IS_APPLIED_ONCE($is_license_applied_once: Boolean, $file_path: String) {
  update_item_files(where: {file_path: {_eq: $file_path}}, _set: {is_license_applied_once:$is_license_applied_once}) {
    returning {
      quantity
    }
  }
}
`

const UPDATE_LICENSE_SHOW_RENDERER = gql`
mutation UPDATE_ITEM_FILE_SHOW_RENDERER($showRenderer: Boolean, $file_path: String) {
  update_item_files(where: {file_path: {_eq: $file_path}}, _set: {show_renderer:$showRenderer}) {
    returning {
      quantity
    }
  }
}
`

function UploadImages(props) {
    const { keycloak } = useKeycloak();
    let { id } = props;

    const [firstAfterLoading, setFirstAfterLoading] = useState(false);

    const { loading, error, data, refetch } = useQuery(GET_ITEM, { 
      variables: {id}
    });

    const [updateQuantities, { data: insertDataQuantities, loading: insertLoadingQuantities, error: insertErrorQuantities}] = useMutation(UPDATE_QUANTITIES);
    const [updateLicense, { data: insertLicense, loading: insertLoadingLicense, error: insertErrorLicense}] = useMutation(UPDATE_LICENSE);
    const [updateLicenseCost, { data: insertDataLicenseCost, loading: insertLoadingLicenseCost, error: insertErrorLicenseCost}] = useMutation(UPDATE_LICENSE_COST);
    const [updateLicenseAppliedOnce, { data: insertDataLicenseAppliedOnce, loading: insertLoadingLicenseAppliedOnce, error: insertErrorLicenseAppliedOnce}] = useMutation(UPDATE_LICENSE_APPLIED_ONCE);
    const [updateShowRenderer, { data: insertDataShowRenderer, loading: insertLoadingShowRenderer, error: insertErrorShowRenderer}] = useMutation(UPDATE_LICENSE_SHOW_RENDERER);

    if((insertDataQuantities || insertLicense || insertDataLicenseCost || insertDataLicenseAppliedOnce || insertDataShowRenderer) && firstAfterLoading) {
      refetch(id);
    }

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const handleChangeIMG = (file) => {
      var data = new FormData();
      data.append("is_image", "True");
      data.append("model_id", id);
      data.append('file', file);

      console.log(data);
  
      axios.request({
        method: "post",
        headers: { 'Authorization': 'Bearer ' + keycloak.token },
        url: process.env.REACT_APP_PYTHON_BACKEND_URL + "/files",
        data: data
      })
      .then((response) => {
        refetch({id})
      })
    };

    const handleChangeModel = (file) => {
      var data = new FormData();
      data.append("is_image", "False");
      data.append("model_id", id);
      data.append('file', file);
  
      axios.request({
        method: "post",
        headers: { 'Authorization': 'Bearer ' + keycloak.token },
        url: process.env.REACT_APP_PYTHON_BACKEND_URL + "/files",
        data: data
      })
      .then((response) => {
        refetch({id})
      })
    };

    let licenseNames = data.licenses.map((dat) => dat.license_name);

    return (
      <Box>
        <Paper sx={{mt:"8pt", pl:"8pt", pr: "8pt", pb: "16px"}}>
            <Typography variant='h5' sx={{pt: "16pt", pb: "8pt"}}>Images</Typography>
            <FileUploader id="uploader" handleChange={handleChangeIMG} name="file" types={fileTypesIMG}/>
        </Paper>

        <Paper sx={{mt:"8pt", pl:"8pt", pr: "8pt", pb: "16px"}}>
            <Typography variant='h5' sx={{pt: "16pt", pb: "8pt"}}>Other Models</Typography>
            <FileUploader id="uploader" handleChange={handleChangeModel} name="file" types={fileTypesModels}/>

            
        </Paper>

        <Paper sx={{mt:"8pt", p:"10pt 20pt"}}>
          <Table sx={{ width: "100%"}} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align='left'>Name</TableCell>
                <TableCell align="right">License</TableCell>
                <TableCell align="right">QTY</TableCell>
                <TableCell align="right">LicenseCost</TableCell>
                <TableCell align="right">IsCostAppliedOnce</TableCell>
                <TableCell align="right">Allow Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items_by_pk.item_files.filter(file => file.file_type === "item").map((row, index) => (
                <TableRow
                  key={row.file_name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {row.file_name}
                  </TableCell>
                  <TableCell align="right">   
                    <Autocomplete
                      class="license-field"
                      disablePortalupdateQuantities
                      options={licenseNames}
                      sx={{marginTop: "2%"}}
                      defaultValue={row.license_name}
                      disableClearable
                      onChange={
                        (event, newValue) => {
                          updateLicense({variables: {file_path: row.file_path, license: newValue}});
                        }
                      }
                      renderInput={(params) => <TextField {...params} label="Licenses*" />}
                    />      
                  </TableCell>
                  <TableCell align="right">   
                    <TextField
                      id="outlined-number"
                      label="Quantity"
                      type="number"
                      value={row.quantity}
                      InputProps={{
                        inputProps: { 
                            max: 999, min: 0 
                        }
                    }}
                      onInput={(event) => {
                        if(event.target.value == "") {
                          updateQuantities({variables: {file_path: row.file_path, quantity: 0}}); 
                          setFirstAfterLoading(true);
                          return;
                        }

                          if(event.target.value >= 0 && event.target.value < 1000) {
                            updateQuantities({variables: {file_path: row.file_path, quantity: event.target.value}}); 
                            setFirstAfterLoading(true);
                          }

                          
                        }
                      }
                      sx={{width: "50%", minWidth: "100px"}}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />                 
                  </TableCell>
                  <TableCell align="right">   
                    <FormControl fullWidth sx={{ m: 1 }}>
                      <InputLabel htmlFor="outlined-adornment-amount">Amount</InputLabel>
                      <OutlinedInput
                        id="outlined-adornment-amount"
                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                        label="Amount"
                        value={(row.license_price / 100).toFixed(2)}
                        onChange={(event) => {
                          if(event.target.value == "") {
                            updateLicenseCost({variables: {file_path: row.file_path, licensePrice: 0}}); 
                            setFirstAfterLoading(true);
                            return;
                          }
  
                            if(event.target.value >= 0 && event.target.value < 1500) {
                              updateLicenseCost({variables: {file_path: row.file_path, licensePrice: (event.target.value * 100).toFixed(0)}}); 
                              setFirstAfterLoading(true);
                            }
                          }
                        }
                      />
                    </FormControl>              
                  </TableCell>
                  <TableCell align="right">
                    <Switch checked={row.is_license_applied_once} onChange={(event) => {
                      updateLicenseAppliedOnce({variables: {file_path: row.file_path, is_license_applied_once: event.target.checked}}); 
                      setFirstAfterLoading(true);
                    }}/>
                  </TableCell>
                  <TableCell align="right">
                    <Switch checked={row.show_renderer} onChange={(event) => {
                        updateShowRenderer({variables: {file_path: row.file_path, showRenderer: event.target.checked}}); 
                        setFirstAfterLoading(true);
                      }}/>
                  </TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
        </Paper>

        <Paper sx={{mt:"8pt", p:"8pt"}}>
            <Box sx={{display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
              <Button variant="text" onClick={e => props.onBack()}>BACK</Button>
              <Button variant="contained" onClick={e => {props.onFinish()}} id="next-button">Next</Button>
            </Box>
        </Paper>
        
      </Box>
    );
}

export default UploadImages;
