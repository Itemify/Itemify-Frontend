import { Box, Typography, Button, Avatar, IconButton, CircularProgress, RadioGroup, Radio, FormControlLabel, Checkbox, Tooltip} from '@mui/material';
import ImageGallery from 'react-image-gallery';
import { Canvas } from '@react-three/fiber';
import { Model } from '../3DModels/Model';
import { PresentationControls } from '@react-three/drei';
import React, { Suspense, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { gql, useMutation } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import Paper from '../utils/Paper';
import ItemGalleryModelComponent from './ItemGalleryModelComponent';

const UPDATE_ITEM_PREVIEWS = gql`
  mutation UPDATE_ITEM_PREVIEWS($filename: String, $preview_img: String, $item_id: Int) {
    update_items(
      _set: {filename: $filename, preview_img: $preview_img}, 
      where: {item_id: {_eq: $item_id}}) {
      returning {
        preview_img
        filename
      }
    }
  }
`

function ItemGalleryComponent(props) {
  let [searchParams, setSearchParams] = useSearchParams()
  let [creator_sub, setCreatorSub] = useState("");
  let [previewIMG, setPreviewIMG] = useState(props.previewImage);
  let [previewModel, setPreviewModel] = useState(props.previewFilename);
  let page = props.page;

  const { initialized, keycloak } = useKeycloak();
  const [updateItemPreviews, { data: DataPreviews, loading, error }] = useMutation(UPDATE_ITEM_PREVIEWS);

  let isLoggedIn = initialized && keycloak.authenticated;

  if(isLoggedIn && keycloak.idToken) {
      if(creator_sub === "") setCreatorSub(keycloak.idTokenParsed.sub);
  } else if(isLoggedIn) {
      keycloak.loadUserProfile(function () {
        setCreatorSub(keycloak.idTokenParsed.sub);
      }, function() {
        console.log("failed to load user info!");
      })
  };

  const is_by_logged_in_user = creator_sub === props.sub;

  const onPreviewIMGChange = (img) => {
    updateItemPreviews({
      variables: {
        filename: previewModel,
        preview_img: img,
        item_id: props.itemID
      }
    })

    setPreviewIMG(img);
  };

  const onPreviewModelChange = (model) => {
    updateItemPreviews({
      variables: {
        filename: model,
        preview_img: previewIMG,
        item_id: props.itemID
      }
    })

    setPreviewModel(model);
  };

  let imagesItems = props.itemImages.map(({image_name}) => (
    <Box
      sx={{ borderRadius: "16pt"}}
      bgcolor="background.secondary" 
      className="image-gallery-image" >
      <Box
        component="img"
        src={process.env.REACT_APP_S3_BUCKET_URL + image_name}
        sx={{width: "100%", aspectRatio: "4/3", objectFit: "cover",  borderRadius: "16pt"}}
        alt={image_name}/>
      
      {
        is_by_logged_in_user &&
        <Tooltip title="Thumbnail">
          <Checkbox 
            checked={previewIMG === image_name}
            disabled={previewIMG === image_name}
            onChange={(event) => onPreviewIMGChange(image_name)}
            sx={{position:"absolute", right: "8pt", top: "8pt"}} />
        </Tooltip>
      }
    </Box>
  ));

  let imagesItemsThumbnails = props.itemImages.map(({image_name}) => (
    <Box
      sx={{ borderRadius: "8pt"}}
      className="image-gallery-thumbnail-inner" bgcolor="background.secondary"  >
      <Box
        component="img"
        className="image-gallery-thumbnail-image"
        src={process.env.REACT_APP_S3_BUCKET_URL + image_name}
        sx={{width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "8pt"}}
        alt={image_name}/>
    </Box>
  ));

  let imagesFrames = imagesItems.map((item, index) => ({
    renderItem: () => item,
    renderThumbInner: () => imagesItemsThumbnails[index],
    thumbnail: "..."
  })); 

  let modelItems = props.itemFiles.filter(file => file.file_type === "item" && file.show_renderer).map((item) => ( // itemFiles & color-----------------
    <ItemGalleryModelComponent item={item} color={props.color} 
      previewModel={previewModel}
      is_by_logged_in_user={is_by_logged_in_user} 
      onPreviewModelChange={onPreviewModelChange}
      onPreviewIMGChange={onPreviewIMGChange}/>
  ));

  let modelItemsThumbnails = props.itemFiles.filter(file => file.file_type === "item" && file.show_renderer).map((item) => ( // itemFiles & color-----------------
    <ItemGalleryModelComponent item={item} isThumbnail color={props.color} 
      previewModel={previewModel}
      is_by_logged_in_user={is_by_logged_in_user} 
      onPreviewModelChange={onPreviewModelChange}
      onPreviewIMGChange={onPreviewIMGChange}/>
  ));

  let item_frames = modelItems.map((item, index) => ({
    renderItem: () => item,
    renderThumbInner: () => modelItemsThumbnails[index],
    thumbnail: "..."
  }));

  imagesFrames = imagesFrames.concat(item_frames);

  return (
    <Box>
      {imagesFrames.length > 0  ?
        <Paper sx={{mt: "8pt"}}>
          <ImageGallery startIndex={page} items={imagesFrames} 
            showFullscreenButton={true} onSlide={props.handlePageChange} 
            showPlayButton={false} disableSwipe/>
        </Paper> 
        : 
        <div></div>
      }
    </Box>
    )
}

export default ItemGalleryComponent;
