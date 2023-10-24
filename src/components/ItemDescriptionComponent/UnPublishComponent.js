import { gql, useMutation } from '@apollo/client';
import { useKeycloak } from "@react-keycloak/web";
import React, { useState } from 'react';
import { Box, Typography, IconButton, TextField, Fab } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';

const PUBLISH_ITEM = gql`
mutation publish_item($id: Int!, $published: Boolean) {
  update_items_by_pk(pk_columns: {item_id: $id}, _set: {published: $published}) {
    item_id
    published
  }
}
` 

function UnPublishComponent(props) {
    const [publish_item, { data, loading, error }] = useMutation(PUBLISH_ITEM);
    let [creator_sub, setCreatorSub] = React.useState("");
    let [username, setUsername] = React.useState("");


    console.log(data);

    let currentStatus = data ? data.update_items_by_pk.published : props.published;

    const { keycloak, initialized } = useKeycloak();
    let isLoggedIn = initialized && keycloak.authenticated;

    if(isLoggedIn && keycloak.idToken) {
      if(creator_sub === "") setCreatorSub(keycloak.idTokenParsed.sub);
      if(username === "") setUsername(keycloak.idTokenParsed.preferred_username);
    } else if(isLoggedIn) {
      keycloak.loadUserProfile(function (userInfo) {
        setCreatorSub(keycloak.profile.sub);
        setUsername(userInfo.preferred_username);
      }, function() {
        console.log("failed to load user info!");
      })
    } 

    const is_by_logged_in_user = creator_sub === props.sub;
    const is_admin = isLoggedIn ? keycloak.resourceAccess.itemify.roles.some((role) => role === 'admin'): false;


    return is_by_logged_in_user || is_admin ? (
        <Fab variant="extended"sx={{
            position: 'absolute',
            bottom: "60pt",
            right: "60pt",
          }}
            onClick={e => {
                publish_item({
                  variables: {
                    id: props.id,
                    published: !currentStatus
                  }
                });
            }}>
              
              {currentStatus ? "Unpublish" : "Publish"}
            <SendRoundedIcon sx={{ ml: 1 }} />
        </Fab>
    ) : (
      <></>
    )
}

export default UnPublishComponent;