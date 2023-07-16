import React, { Suspense } from 'react';
import { Box, Grid, IconButton, Tooltip, Typography, Skeleton } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { gql, useQuery } from '@apollo/client';
import ControlledModel from '../3DModels/ControlledModell';
import LoadingComponent from '../LoadingComponent';
import { useTheme } from '@emotion/react';
import ItemVote from './ItemVote';
import Paper from '../utils/Paper';
import UserAvatar from '../UserSpecifics/UserAvatar';

function Items(props) {
  const GET_ITEMS = gql`
    query GET_ITEMS($page: Int, $pageSize: Int, 
      $where:items_with_views_bool_exp, $order_by:[items_with_views_order_by!]) {
        items_with_views(
            where: $where
            offset: $page, 
            limit: $pageSize
            order_by: $order_by
        ) {
            creator
            description
            item_id
            name
            statusof
            filename
            preview_img
            creatorByCreator {
              creator_name
              username
              sub
            }
        }
    }
  `;

  let navigate = useNavigate();
  const theme = useTheme();

  // GRAPHQL INIT 

  let where_tag_objects = props.tags.map((tag) => {
    return {item_tags_valid:{item_tag:{_in: [tag]}}}
  });

  if(props.creator)
    where_tag_objects.push({creator:{_eq: props.creator}});

  if(!props.showAll)
    where_tag_objects.push({published: {_eq: true}});

  let where = {_and: [...where_tag_objects]}

  let order_by = {statusof: "desc"};

  switch (props.orderBy) {
    case "Newest":
      order_by = {statusof: "desc"};
      break;
    case "Views Day":
      order_by = {views_1d: "desc"};
      break;
    case "Views Week":
      order_by = {views_7d: "desc"};
      break;
    case "Views Month":
      order_by = {views_30d: "desc"};
      break;
    case "Weight":
      order_by = {weight: "desc"};
      break;
    default:
      order_by = {statusof: "desc"};
  }


  const { loading, error, data } = useQuery(GET_ITEMS, { variables: {
    page: (props.page - 1) * props.pageSize,
    pageSize: props.pageSize,
    order_by: order_by,
    where: where
  } });

  let emptyElements = new Array(30).fill(0);
  if (loading) return <Grid container sx={{pl:"0pt", pr: "0pt", maxWidth: "100%"}}>
      {emptyElements.map((i) => (
        <Grid item sx={{cursor: "pointer", overflow: "hidden", p: "4px !important"}} xs={12} sm={6} lg={4} xl={3} xxl={2}>

          <Skeleton variant="rectangular" height={300} sx={{aspectRatio: "4/3", width: "100%", borderRadius: "3%"}}/>
        </Grid>
      ))}
    </Grid>

  if (error) return <p>Error: {error}</p>;

  if (data.items_with_views.length == 0) return <Paper sx={{display: "flex", justifyContent: "center", p: "8pt"}}>
    <Typography>With this query you wont find anything!</Typography>
  </Paper>

  return <Grid container sx={{pl:"0pt", pr: "0pt", width: "100%"}}>
    {data.items_with_views.map(({ creator, description, item_id, name, statusof, filename, preview_img, creatorByCreator}) => (
      <Grid item key={item_id} 
        sx={{cursor: "pointer", overflow: "hidden", p: "4pt !important"}} 
        xs={12} sm={6} lg={4} xl={3} xxl={2} onClick={() => navigate("/item/" + item_id, {replace: "false"})}>

        <Box>
            <Box component="img" loading="lazy" sx={{width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "3%"}} src={process.env.REACT_APP_S3_BUCKET_URL + preview_img} alt={name}/>

            <Box sx={{p:"4pt 8pt", display: "flex", justifyContent: "space-between"}}>
              <IconButton sx={{ p: 0 }} onClick={(e) => {
                e.stopPropagation();
                navigate("/account/" + creatorByCreator.sub);
              }}>
                
                <UserAvatar username={creatorByCreator.username}/>
                
                
              </IconButton>

              <p class="text-base antialiased" style={{padding: "10pt 10pt", margin: "0px", overflow:"hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                {name}
              </p>

              <ItemVote sub={creatorByCreator.sub} item_id={item_id}/>

            </Box>
          </Box>
      </Grid>
    ))}
  </Grid>
  }
  
  export default Items;
