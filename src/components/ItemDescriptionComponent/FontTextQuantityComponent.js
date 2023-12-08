import React, { useEffect } from 'react';
import {Box, Button} from '@mui/material';
import TextField from '@mui/material/TextField';
import Paper from '../utils/Paper';


function FontTextQuantityComponent(props) {   
    const [letters, setLetters] = React.useState("Itemify");

    useEffect(() => {
        if(props.isFont)
            props.setQuantity("Itemify");
    }, []);

    return props.isFont &&
            <Paper bgcolor="background.secondary" sx={{mt:"8pt", p:"10pt 20pt"}}>
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                }}>
                    <TextField id="standard-basic" label="Letters" 
                        variant="standard" value={letters} 
                        onChange={(event) => {
                            setLetters(event.target.value); 
                        }}
                        onKeyDown={(ev) => {
                            if (ev.key === 'Enter') {
                            // Do code here
                            ev.preventDefault();

                            props.setQuantity(letters)
                            }
                        }}/>

                    <Button variant="contained" onClick={() => {props.setQuantity(letters)}}>Calculate Cost</Button>
                </Box>
            </Paper>
    
}

export default FontTextQuantityComponent;