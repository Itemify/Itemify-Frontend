import { Box, Button, Checkbox, CircularProgress, Slider, Typography } from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from '@apollo/client';
import { FormControlLabel } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';

let INSERT_ITEM = gql`
  mutation InsertItemSettings($creator_sub: String, $infill_pattern: String, $infill_percentage: Int, $item_id: Int, $layer_height: numeric, $supports: Boolean, $wall_thickness: Int, $top_bottom_thickness: Int) {
    insert_item_settings(objects: {infill_pattern: $infill_pattern, infill_percentage: $infill_percentage, item_id: $item_id, 
      layer_height: $layer_height, supports: $supports, wall_thickness: $wall_thickness, top_bottom_thickness: $top_bottom_thickness, creator_sub: $creator_sub}) {
        returning {
          item_setting_id
        }   
    }
  }
`

function BestPracticesComponent(props) {
    let { id } = props;  

    // at first this is not important. Its only this way because hooks cant be called conditionally. 
    // TODO: Move this to annother component
    const [insertItem, { data, loading, error }] = useMutation(INSERT_ITEM);
    const [layerHeight, setLayerHeight] = useState(20);
    const [wallThickness, setWallThickness] = useState(2);
    const [infill, setInfill] = useState(20);
    const [supports, setSupports] = useState(true);
    const [plaAllowed, setPLAAllowed] = useState(true);
    const [petgAllowed, setPETGAllowed] = useState(true);
    const [absAllowed, setABSAllowed] = useState(true);
    let navigate = useNavigate();
    const { initialized, keycloak } = useKeycloak();
    let isLoggedIn = initialized && keycloak.authenticated;

    function back() {
      navigate("/upload");
    };

    if(data) {
      props.onFinish();
    }

    if (loading) return (
      <CircularProgress />
    );
    if (error) return (
      <h1>{"" + error}</h1>
    );

    return (
        <Box sx={{display:"flex", flexDirection:"column", marginTop:"2%", pt: "16pt"}}>
            
            <Box sx={{display: "flex"}}>
              <Box sx={{width: "46%", m: "0px 2%"}}>
                <Typography>Layer Height</Typography>
                <Slider
                  aria-label="Small steps"
                  value={layerHeight}
                  onChange={(event) => setLayerHeight(event.target.value)}
                  step={0.04}
                  marks
                  min={0.12}
                  max={0.32}
                  valueLabelDisplay="auto"
                  
                />
              </Box>
              <Box sx={{width: "46%", m: "0px 2%"}}>
                <Typography>Wall Thickness</Typography>
                <Slider
                  aria-label="Small steps"
                  value={wallThickness}
                  onChange={(event) => setWallThickness(event.target.value)}
                  step={1}
                  marks
                  min={1}
                  max={5}
                  valueLabelDisplay="auto"
                  
                />
              </Box>
            </Box>

            <Box sx={{display: "flex"}}>
              <Box sx={{width: "46%", m: "0px 2%"}}>
                <Typography>Infill Percentage</Typography>
                <Slider
                  aria-label="Small steps"
                  value={infill}
                  onChange={(event) => setInfill(event.target.value)}
                  step={1}
                  marks
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                  
                />
              </Box>
              <Box sx={{width: "46%", m: "0px 2%"}}>
                <Typography>Print Speed</Typography>
                <Slider
                  aria-label="Small steps"
                  defaultValue={2}
                  step={1}
                  marks
                  min={1}
                  max={5}
                  valueLabelDisplay="off"                  
                />
              </Box>
            </Box>

            <Box sx={{display: "flex", justifyContent: "space-around"}}>
              <FormControlLabel control={<Checkbox checked={supports} onChange={(event) => setSupports(event.target.checked)}/>} label="Supports" />
              <FormControlLabel control={<Checkbox checked={plaAllowed} onChange={(event) => setPLAAllowed(event.target.checked)}/>} label="PLA" />
              <FormControlLabel control={<Checkbox checked={petgAllowed} onChange={(event) => setPETGAllowed(event.target.checked)}/>} label="PETG" />
              <FormControlLabel control={<Checkbox checked={absAllowed} onChange={(event) => setABSAllowed(event.target.checked)}/>} label="ABS" />
            </Box>
            
              

            <Box sx={{display:"flex", flexDirection:"row", marginTop:"2%", justifyContent:"space-between"}}>
              <Button variant="text" onClick={back}>BACK</Button>
              <Button variant="contained" disabled={!isLoggedIn} id="next-button" onClick={e => {
                try {
                  insertItem({
                    variables: {
                      infill_pattern: "cubic",
                      infill_percentage: infill,
                      item_id: id,
                      layer_height: layerHeight,
                      supports: supports,
                      top_bottom_thickness: 4,
                      wall_thickness: wallThickness,
                      creator_sub: keycloak.tokenParsed.sub
                    }
                  });
                } catch(e) {
                  console.error(e);
                }
              }}>Next</Button>
            </Box>
        </Box>
    );
  }
  
  export default BestPracticesComponent;
