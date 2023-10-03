import { Box, Typography, Button, Avatar, IconButton, CircularProgress, RadioGroup, Radio, FormControlLabel, Checkbox, Tooltip} from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { Model } from '../3DModels/Model';
import { PresentationControls } from '@react-three/drei';
import React, { Suspense, useState } from 'react';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';



export default function ItemGalleryModelComponent({item, isThumbnail, is_by_logged_in_user, color, previewModel, previewIMG, onPreviewModelChange, onPreviewIMGChange}) {
    const [mode, setMode] = useState("img")

    return (
        item.render_image && mode === 'img' ?
        <Box>
            <Box
                component="img"
                src={process.env.REACT_APP_S3_BUCKET_URL + item.render_image}
                sx={{width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "8pt"}}
                alt={item.render_image}
            />
            {
                is_by_logged_in_user && ! isThumbnail &&
                <Tooltip title="Thumbnail">
                    <Checkbox 
                        checked={previewIMG === item.render_image}
                        disabled={previewIMG === item.render_image}
                        onChange={(event) => onPreviewIMGChange(item.render_image)}
                        sx={{position:"absolute", right: "8pt", top: "8pt"}} />
                </Tooltip>
            }

            {
                ! isThumbnail &&
                <Tooltip title="3D">
                    <Checkbox 
                        checked={mode === "3D"}
                        onChange={(event) => setMode("3D")}
                        icon={<ViewInArIcon/>}
                        sx={{position:"absolute", left: "8pt", bottom: "8pt"}} />
                </Tooltip>
            }
        </Box>


        :

        <Box bgcolor="background.secondary" className="image-gallery-thumbnail-inner" sx={{aspectRatio: "4/3", bottom: "0px", top: "0px", borderRadius: "16pt"}}>
            <Canvas camera={{ position: [0, 100, 0] }} style={{ borderRadius: "16pt"}}>
                <Suspense fallback={null}>
                    <color attach="background" args={["lightgrey"]} />
                    <ambientLight/>
                    <pointLight position={[10, 10, 10]}/>
                    <PresentationControls polar={[-Infinity, +Infinity]}>
                    <Model color={color} url={process.env.REACT_APP_S3_BUCKET_URL + item.file_path} /> 
                    </PresentationControls>
                </Suspense>
            </Canvas>
    
            {
            is_by_logged_in_user && ! isThumbnail &&
            <Tooltip title="Thumbnail">
                <Checkbox 
                    checked={previewModel === item.file_name}
                    disabled={previewModel === item.file_name}
                    onChange={(event) => onPreviewModelChange(item.file_hasname)}
                    sx={{position:"absolute", right: "8pt", top: "8pt"}} />
            </Tooltip>
            }
            {
                ! isThumbnail &&
                <Tooltip title="Image View">
                    <Checkbox 
                        checked={mode === "img"}
                        onChange={(event) => setMode("img")}
                        icon={<InsertPhotoIcon/>}
                        sx={{position:"absolute", left: "8pt", bottom: "8pt"}} />
                </Tooltip>
            }
  
      </Box>
    )
}