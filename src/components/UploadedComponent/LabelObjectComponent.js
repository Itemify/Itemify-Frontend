import { Autocomplete, Box, Button, Checkbox, CircularProgress, Divider, FormControlLabel, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { gql, useMutation, useQuery } from '@apollo/client';
import { useKeycloak } from "@react-keycloak/web";
import LoadingComponent from '../LoadingComponent';

let INSERT_ITEM = gql`
mutation InsertItems($creator: String, $creator_name: String, $description: String, $filename: String, $image_name: String, $item_id: Int, $name: String, $file_path: String, $license_name: String, $license_name_lower: String, $originalOn: String) {
  insert_items(objects: {creator: $creator, description: $description, filename: $filename, preview_img: $image_name, item_id: $item_id, name: $name, license_name: $license_name, original_on: $originalOn}, on_conflict: {constraint: items_pkey, update_columns: [name, description]}) {
    returning {
      item_id
      statusof
    }
  }
  insert_item_files(objects: {item_id: $item_id, file_type: "item", file_path: $file_path, file_name: $filename, license_name: $license_name}, on_conflict: {constraint: item_files_pkey, update_columns: [quantity]}) {
    returning {
      item_id
    }
  }
  insert_item_images_one(object: {image_name: $image_name, item_id: $item_id}) {
    image_name
    item_id
  }

  insert_item_tags(objects: 
    [
      {
        item_id: $item_id
        item_tag: $license_name_lower
        voteable: false
        item_tag_votes: {
          data: {
            creator_sub: $creator
            vote: 1
          }
        }
      }, 
      {
        item_id: $item_id, 
        item_tag: $creator_name,
        voteable: false
        item_tag_votes: {
          data: {
            creator_sub: $creator
            vote: 1
          }
        }
      },
      {
        item_id: $item_id, 
        item_tag: "untagged",
        item_tag_votes: {
          data: {
            creator_sub: $creator
            vote: 1
          }
        }
      }
    ],
    on_conflict: {constraint: item_tags_pkey, update_columns: []}
    ) {
      returning {
        item_id
        item_tag
      }
    }
  }
`

const GET_LICENSES = gql`
  query get_licenses {
    licenses {
      license_name
      license_description
      license_name_long
      commercial_usage
    }
  }
`

function LabelObjectComponent(props) {
    let { id, name } = props;  
    let [state_name, setName] = useState(name);
    let [description, setDescription] = useState('## Markdowntitle  \nMarkdowndescription  \nBTW: You can change this after Uploading your file');
    let [creator_sub, setCreatorSub] = useState("");
    let [username, setUsername] = React.useState("");
    let [inputLicense, setInputLicense] = useState("Creative Commons - Attribution-NonCommercial-ShareAlike ");
    let [originalOn, setOriginalOn] = useState("");
    let [commercialUsage, setCommercialUsage] = useState(false);

    let navigate = useNavigate();

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
      

    // at first this is not important. Its only this way because hooks cant be called conditionally. 
    // TODO: Move this to annother component
    const [insertItem, { data, loading, error }] = useMutation(INSERT_ITEM);

    const { loading: licenseLoading, error: licenseError, data: licenseData } = useQuery(GET_LICENSES);

    useEffect(() => {
      if(data) {
        fetch(process.env.REACT_APP_PYTHON_BACKEND_URL + "/calculate-size", {
          method: "POST",
          headers: { "Content-Type": "application/json", 'Authorization': 'Bearer ' + keycloak.token },
          body: JSON.stringify({ id: 1, file_path: parseInt(id) + "/" +  name,  file_name: name}),
        }, )
  
        props.onFinish();
      }
    }, [data])
  
    if (licenseLoading) return <LoadingComponent/>;
    if (licenseError) return <p>Error: {error}</p>;

    function back() {
      navigate("/upload");
    };



    if (loading) return (
      <Box sx={{display:"flex", justifyContent: "center", pt: "2%"}}>
        <CircularProgress />
      </Box>
    );
    if (error) return (
      <h1>{"" + error}</h1>
    );

    let licenseNames = licenseData.licenses.map((dat) => dat.license_name_long);
    console.log(licenseNames);
    let commercialUsageLicense = licenseData.licenses.filter(license => license.license_name_long === inputLicense)[0].commercial_usage;

    return (
        <Box sx={{display:"flex", flexDirection:"column", marginTop:"2%", pt: "16pt"}}>
            <TextField id="name-field" 
                value={state_name} onInput={e => setName(e.target.value)} 
                label="Name*" variant="outlined" />

            <TextField id="description-field" 
              value={description} onInput={e => setDescription(e.target.value)} 
              label="Description" variant="outlined" 
              minRows={4}
              multiline sx={{marginTop: "2%"}}/>

            <Autocomplete
              id="license-field"
              disablePortal
              autoHighlight
              options={licenseNames}
              sx={{marginTop: "2%"}}
              defaultValue={inputLicense}
              onChange={
                (event, newValue) => {
                  setInputLicense(newValue);
                }
              }
              renderInput={(params) => <TextField {...params} label="Licenses*" />}
            />

            <Box sx={{mt: "8pt", display: commercialUsageLicense ? "none": "flex", flexDirection: "column"}}>

              <Divider/>
              <p>Do you agree with the commercial usage of the Item uploaded so far and any you will upload under this name by Itemify? If you are not the creator of the Item you are not allowed to press this checkbox.</p>
              <FormControlLabel
                control={
                  <Checkbox value={commercialUsage} onChange={(e) => setCommercialUsage(e.target.checked)}/>
                }
                label="I do Agree"
              />
            </Box>

            <TextField id="original-field" 
                sx={{mt: "8pt"}}
                value={originalOn} onInput={e => setOriginalOn(e.target.value)} 
                label="Original Uploaded on (Attribution URL)" variant="outlined" />

            <Box sx={{display:"flex", flexDirection:"row", marginTop:"2%", justifyContent:"space-between"}}>
              <Button variant="text" id="back-button" onClick={back}>BACK</Button>
              <Button variant="contained" id="next-button" onClick={e => {
                if(licenseData.licenses.filter(license => license.license_name_long === inputLicense).length !== 0) {
                  console.log("License Error")
                }
                try {
                  insertItem({
                    variables: {
                      creator: creator_sub,
                      description: description,
                      item_id: parseInt(id),
                      name: state_name,
                      filename: name,
                      file_path: parseInt(id) + "/" +  name,
                      license_name: licenseData.licenses.filter(license => license.license_name_long === inputLicense)[0].license_name,
                      license_name_lower: licenseData.licenses.filter(license => license.license_name_long === inputLicense)[0].license_name.toLowerCase(),
                      commercial_usage: commercialUsage,
                      original_on: originalOn,
                      creator_name: username,
                      image_name: parseInt(id) + "/img/" +  name + ".png"
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
  
  export default LabelObjectComponent;
