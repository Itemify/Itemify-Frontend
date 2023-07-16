import { gql, useMutation } from '@apollo/client';
import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'
import { Box, Typography, IconButton, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import Paper from '../utils/Paper';

const UPDATE_DESCRIPTION = gql`
  mutation update_items($id:Int!, $description:String) {
    update_items_by_pk(
      pk_columns: {item_id:$id}
      _set:{
        description: $description
      }
    ) {
      item_id
      description
    }
  }
`

function DescriptionComponent(props) {
    const { initialized, keycloak } = useKeycloak();

    const id = props.itemID;

    const [updateDescription, { dataDescription, loadingDescription, errorDescription }] = useMutation(UPDATE_DESCRIPTION);

    const [changeText, setChangeText] = React.useState(false)
    const [descriptionText, setDescriptionText] = React.useState(props.description)

    let [creator_sub, setCreatorSub] = useState("");

    const handleDescriptionChange = (event) => {
        setDescriptionText(event.target.value)
    };

    const editStoreButton = () => {
        if(changeText) {
          updateDescription({
            variables: {
              id: props.itemID,
              description: descriptionText
            }
          })
        } 
        
        setChangeText(!changeText);
    }

    let isLoggedIn = initialized && keycloak.authenticated;

    if(isLoggedIn && keycloak.idToken) {
        if(creator_sub === "") setCreatorSub(keycloak.idTokenParsed.sub);
    } else if(isLoggedIn) {
        keycloak.loadUserProfile(function () {
          setCreatorSub(keycloak.profile.sub);
        }, function() {
          console.log("failed to load user info!");
        })
    };
  
    const is_by_logged_in_user = creator_sub === props.sub;

    return (
        <Paper sx={{mt:"8pt", p:"10pt 20pt", overflow: "hidden"}}>
            <Box sx={{display: "flex", justifyContent: "space-between"}}>
            <Typography variant='h5' style={{fontWeight:500}} sx={{pb:"4pt"}}>Description</Typography>

            {
                is_by_logged_in_user ? 
                <IconButton aria-label="delete" onClick={editStoreButton}>
                {changeText ? <SaveIcon />: <EditIcon />}
                </IconButton> : null
            }
            </Box>
            {
            changeText ? 
                <TextField id="description" label="Description" variant="outlined" multiline defaultValue={descriptionText} onChange={handleDescriptionChange} sx={{width: "100%"}} rows={4}/>
            :
                <ReactMarkdown>
                {descriptionText}
                </ReactMarkdown>
            }
        
      </Paper>
    )
}

export default DescriptionComponent;