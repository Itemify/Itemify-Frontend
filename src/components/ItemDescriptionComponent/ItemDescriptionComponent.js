import { Box, Typography, Button, Avatar, IconButton, CircularProgress, RadioGroup, Radio, Link} from '@mui/material';
import React, { Suspense, useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import DescriptionComponent  from './DescriptionComponent'
import DownloadTableComponent from './DownloadTableComponent';
import ItemTagsComponent from './ItemTagsComponent';
import ItemGalleryComponent from './ItemGalleryComponent';
import axios from 'axios';
import LicenseComponent from './LicenseComponent';
import LoadingComponent from '../LoadingComponent';
import { useTheme } from '@emotion/react';
import Paper from '../utils/Paper';
import UserAvatar from '../UserSpecifics/UserAvatar';

const GET_ITEM = gql`
  query get_item_description($id: Int!) {
    items_by_pk(item_id: $id) {
      commercial_usage
      original_on
      description
      preview_img
      creatorByCreator {
        sub
        creator_name
        bio
        Role
        username
      }
      filename
      item_id
      name
      statusof
      license {
        license_description
        license_name
        license_name_long
      }
      item_images {
        image_name
      }
      item_files {
        file_name
        file_type
        item_id
        file_path
        dim_x
        dim_y
        dim_z
        filament_used
        render_image
        quantity
        is_license_applied_once
        license_name
        license_price
        show_renderer
      }
    }

    materials {
      material_name
      material_price_per_gram
      material_price_per_print
    }

    filaments {
      filament_id
      material
      color_r
      color_g
      color_b
    }
  }
`

function rgb(r, g, b){
  return "rgb("+r+","+g+","+b+")";
}

function ItemDescriptionComponent() {
    const theme = useTheme();
    let navigate = useNavigate();
    let [searchParams, setSearchParams] = useSearchParams()

    let { id } = useParams();

    const { loading, error, data } = useQuery(GET_ITEM, { 
      variables: {id}
    });

    const _material = searchParams.get("material");
    const [material, setMaterial] = React.useState("PLA")
    const _color = searchParams.get("color");
    const [color, setColor] = React.useState(rgb(30,30,30))
    const [galleryPage, setGalleryPage] = React.useState(0);

    if(material !== (_material ? _material : "PLA"))
      setMaterial(_material ? _material : "PLA")

    if(color !== (_color ? _color : rgb(30,30,30)))
      setColor(_color ? _color : rgb(30,30,30));

    useEffect(() => {
      axios.request({
        method: "POST",
        url: process.env.REACT_APP_PYTHON_BACKEND_URL + "/update-views/" + id,
      })
    }, [])


    if (loading) return <LoadingComponent/>;
    if (error) return <p>Error: {error}</p>;



    function getMaterial() {
      return data.materials.filter((mat) => mat.material_name === material)[0]
    }

    let materials = {}

    data.materials.forEach(mat => {
      materials[mat.material_name] = data.filaments.filter((filament) => filament.material === mat.material_name).map((filament) => rgb(filament.color_r, filament.color_g, filament.color_b))
    })

    const controlPropsMaterials = (item) => ({
      checked: material + " " + color === item,
      onChange: handleMaterialChange,
      value: item,
      name: 'color-radio-button-demo',
      inputProps: { 'aria-label': item },
    });
    const handleMaterialChange = (event) => {
      searchParams.set("material", event.target.value.split(" ")[0]);
      searchParams.set("color", event.target.value.split(" ")[1]);
      setSearchParams(searchParams);

      setMaterial(event.target.value.split(" ")[0]);
      setColor(event.target.value.split(" ")[1])
    };

    const print_dimensions = data.items_by_pk.item_files.filter(file => file.file_type === "item").reduce(
      function (previousValue, currentValue) {
        return {
          dim_x: Math.round(Math.max(previousValue.dim_x, currentValue.dim_x)), 
          dim_y: Math.round(Math.max(previousValue.dim_y, currentValue.dim_y)), 
          dim_z: Math.round(Math.max(previousValue.dim_z, currentValue.dim_z))
        }
      }, 
      {dim_x: 0, dim_y: 0, dim_z: 0});

    const print_weight = data.items_by_pk.item_files.filter(file => file.file_type === "item").map(
      row => row.filament_used * row.quantity
    ).reduce((a, b) => {
      return a + (typeof(b) == "undefined" ? 0 : b);
    }, 
      0
    ) * 3 ;

    const overallQuantity = data.items_by_pk.item_files.filter(file => file.file_type === "item").map(
      row => row.quantity
    ).reduce((a, b) => a + b);

    const license_cost = data.items_by_pk.item_files.map(file => {
      return (file.is_license_applied_once ? 1 : file.quantity) * file.license_price;
    }).reduce((partialSum, a) => partialSum + a, 0);

    const print_price = license_cost + (getMaterial().material_price_per_print * overallQuantity + getMaterial().material_price_per_gram * print_weight);

    let filament_id = data.filaments.find(e => color === rgb(e.color_r, e.color_g, e.color_b) && e.material === material).filament_id;

    return (
      <Box sx={{display:"flex", gap: "8pt", marginLeft: "auto", marginRight: "auto", width:"100%", maxWidth: "1200px", marginBottom: "16pt", flexWrap:{xs: "wrap-reverse", md: "nowrap"}, justifyContent: "center"}}>
            
        <Box component="aside" sx={{width: {xs: "98%", md: "150px"}, ml: {xs: "2%", md: "0px"}, mr: {xs:"2%", md: "0pt"}, mt:{xs:"0px", md: "16pt"}}}>
          <Box sx={{ top: "8pt"}}>
            <Paper bgcolor="background.secondary" sx={{p: "8pt 0pt", width: {xs: "100%", md: "150px"}, display: "flex", flexDirection: "column", alignItems: "center"}}>
              <Typography variant='h6' style={{fontWeight:500, fontSize: "small", marginBottom: "8pt", color: "#696969"}}>Uploader</Typography>

              <IconButton sx={{ p: 0 }} onClick={() => {
                navigate("/account/" + data.items_by_pk.creatorByCreator.sub)
              }}>
                <UserAvatar username={data.items_by_pk.creatorByCreator.username} />
              </IconButton>

              <Typography variant='p' style={{fontWeight:500, marginTop: "4pt"}}>{data.items_by_pk.creatorByCreator.username}</Typography>

              <Typography variant='p' style={{fontWeight:300, marginTop: "4pt", color: "#696969" , textAlign: "center"}}>{data.items_by_pk.creatorByCreator.bio}</Typography>

              
              {data.items_by_pk.original_on != null && <Box sx={{marginTop: "4pt", display: "flex", flexDirection: "column"}}>
                <Typography variant='p' style={{ marginTop: "4pt", textAlign: "center"}}>Originally Uploaded</Typography>
                <Link sx={{textAlign: "center"}} href={data.items_by_pk.original_on}>here</Link>
              </Box> }
            </Paper>

            <ItemTagsComponent tags={data.items_by_pk.item_tags} id={id}/>
          </Box>
        </Box>

        <Box sx={{ width: {xs: "96%", md: "65%"}, m: {xs: "0% 2%", md: "16pt 0px"}}}>
          <Paper>
            <Typography variant='h3' sx={{p:"10pt 32pt", textAlign:'center', fontWeight:800, overflow: "hidden"}}>{data.items_by_pk.name}</Typography>
          </Paper>


          <ItemGalleryComponent 
            itemFiles={data.items_by_pk.item_files} 
            sub={data.items_by_pk.creatorByCreator.sub}
            itemImages={data.items_by_pk.item_images} color={color} 
            itemID={id}
            page={galleryPage}
            handlePageChange={(index) => setGalleryPage(index)}
            previewFilename={data.items_by_pk.filename} previewImage={data.items_by_pk.preview_img}/>
          
          <DownloadTableComponent itemFiles={data.items_by_pk.item_files} sub={data.items_by_pk.creatorByCreator.sub}/>

          <DescriptionComponent itemID={id} description={data.items_by_pk.description} sub={data.items_by_pk.creatorByCreator.sub}/>

          <LicenseComponent license={data.items_by_pk.license}/>
        </Box>

        <Box component="aside" sx={{width: {xs: "96%", md: "150px"}, ml: {xs:"2%", md: "0pt"}, mt:{xs:"8pt", md: "16pt"}, mr: {xs: "2%", md: "0px"}}}>
          <Box sx={{position: "sticky", top: "8pt"}}>
            <Paper bgcolor="background.secondary" sx={{p: "8pt", display: "flex", flexDirection: "column", alignItems: "center"}}>
              <Typography variant='h6' style={{fontWeight:300}}>{Math.round(print_price) / 100}€ </Typography>
              <Typography variant='p' style={{fontWeight:500}} sx={{pb:"8pt"}}>Price</Typography>
              
              <Typography variant='h6' style={{fontWeight:300}}>{print_dimensions.dim_x + "x" + print_dimensions.dim_y + "x" + print_dimensions.dim_z}</Typography>
              <Typography variant='p' style={{fontWeight:500}} sx={{pb:"8pt"}}>Dimension in mm</Typography>

              <Typography variant='h6' style={{fontWeight:300}}>{Math.round(print_weight)}</Typography>
              <Typography variant='p' style={{fontWeight:500}} sx={{pb:"8pt"}}>Weight in g</Typography>

              <Button
                disabled={(data.items_by_pk.commercial_usage === false && !data.items_by_pk.license.commercial_usage) || print_weight === 0} 
                variant="contained" onClick={() => navigate("/checkout" + "/" + id + "/" + material + "/" + filament_id)}>Get it!</Button>

            </Paper>

            <Paper bgcolor="background.secondary" sx={{p: "8pt 0pt", mt: "8pt", top: "8pt", width: {xs: "100%", md: "150px"}, display: "flex", flexDirection: "column", alignItems: "center"}}>
              <Typography variant='h6' style={{fontWeight:500, fontSize: "small", marginBottom: "8pt", color: "gray"}}>Material</Typography>

              <RadioGroup>
                {
                  Object.keys(materials).map((mat) => {
                    return (
                      <Box sx={{display: "flex", flexDirection: "column"}}>
                        <Box sx={{display: "flex", flexWrap: "wrap", justifyContent: "center", rowGap: "0pt", margin: "0pt 8pt"}}>
                          {materials[mat].map((col) => (<Radio {...controlPropsMaterials(mat + " " + col)} sx={{ padding: "4pt",
                            color: col,
                            '&.Mui-checked': {
                              color: col,
                            },
                          }}/>))}
                        </Box>
                        <Typography variant='p' style={{fontWeight:300, marginBottom: "8pt", color: "gray", textAlign: "center"}}>{mat}</Typography>
                      </Box>
                    )
                  })
                }
              </RadioGroup>
            </Paper>
          </Box>
        </Box>
      </Box>
      
      
    );
  }
  
  export default ItemDescriptionComponent;
