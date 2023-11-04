import { Box, Fab, Pagination, Select, MenuItem, FormControl, InputLabel, FormGroup, FormControlLabel, Checkbox, Autocomplete, TextField, Chip, Divider} from '@mui/material';
import React, { useEffect } from 'react';
import Items from './Items';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useSearchParams } from "react-router-dom";
import { gql, useQuery } from '@apollo/client';
import LoadingComponent from '../LoadingComponent';
import ItemTagSearchBar from './ItemTagSearchBar';
import { useSelector, useDispatch } from 'react-redux';
import { addTag, rmTag, clearTags, setTags}  from '../../redux/tagsSlice';

const ITEM_COUNT = gql`
  query count_items($where: items_bool_exp) {
    items_aggregate(
      where: $where
    ) {
      aggregate {
        count
      }
    }
  }
`

const orderByOptions = ["Views Month", "Views Week", "Views Day", "Newest", "Weight"]

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function ItemComponent() {
    let [searchParams, setSearchParams] = useSearchParams()

    const pageSize = 24;

    const _page = searchParams.get("page");
    const [page, setPage] = React.useState(1);
    const _orderBy = searchParams.get("orderBy");
    const [orderBy, setOrderBy] = React.useState(_orderBy == null? orderByOptions[0]: _orderBy );

    const _tags = searchParams.get("tags") ? searchParams.get("tags").split(",") : [];
    
    const tags = useSelector((state) => state.tags.tags);
    const dispatch = useDispatch()

    if(page !== (_page != null ? parseInt(_page) : 1)) {
      setPage(_page != null ? parseInt(_page) : 1);
    }


    if(_tags !== null && (!arraysEqual(_tags, []) && !arraysEqual(_tags, tags))) {
      dispatch(setTags(_tags));
    }

    const handlePageChange = (event, value) => {
      setPage(value);
      searchParams.set("page", value);
      setSearchParams(searchParams);
    };

    const handleOrderChange = (label) => {
      setOrderBy(label);
      searchParams.set("orderBy", label);
      setSearchParams(searchParams);
    };

    const handleRemoveTag = (tag) => {
      let newTags =  tags.filter((t) => t !== tag)
      dispatch(setTags(newTags));
      searchParams.set("tags", newTags.join(","));
      setSearchParams(searchParams);
    }

    let navigate = useNavigate();

    let where_tag_objects = tags.map((tag) => {
      return {item_tags:{item_tag:{_in: [tag]}}}
    });

    where_tag_objects.push({published: {_eq: true}});
    let where = {_and: [...where_tag_objects]}

    const { loading, error, data } = useQuery(ITEM_COUNT, {
      variables: {
        where: where
      }
    });
    if (loading) return <LoadingComponent/>;
    if (error) return <p>Error: {error}</p>;

    return (

      <Box sx={{display:"flex", gap: "8pt", marginLeft: "auto", marginRight: "auto", width:"96%", maxWidth: {xl: "1600px", xxl: "1900px"}, marginBottom: "16pt", flexWrap:"wrap"}}>
        <Box sx={{mt:"16pt", width: "100%", display: "flex", flexWrap: "wrap", gap: "4pt", ml: "4pt"}}>
          {
            orderByOptions.map(
              (label) => (
                <Chip label={label} variant="filled" 
                  onClick={() => handleOrderChange(label)}
                  sx={{
                    backgroundColor: label === orderBy ? "#030303" : "lightgray", 
                    '&:hover': {
                      background: label === orderBy ? "#030303" : "lightgray",
                    },
                    color: label === orderBy ? "#DDD" : "#222"
                  }}/>
              )
            )
          }


        </Box>

        <Box sx={{mt:"4pt", width: "100%", display: "flex", flexWrap: "wrap", gap: "4pt", ml: "4pt"}}>
          {tags.map((tag) => <Chip
              label={tag}
              onDelete={() => handleRemoveTag(tag)}
            />)}
        </Box>

        <Box sx={{ml: {xs: "auto", md: "0px"}, mr: {xs: "auto", md: "0px"}, width: "100%", maxWidth: "100%"}}>
          
          <Items 
            page={page} pageSize={pageSize} 
            orderBy={orderBy} tags={tags}/>

          <Divider variant="middle" sx={{width:"90%", margin: "0pt auto !important"}}/>

          <Box sx={{width:"98%", mt: "16pt", mr: "auto", ml: "auto", p: "1%", display: "flex", justifyContent: "center"}}>
            
            <Pagination 
              page={page} 
              count={Math.ceil(data.items_aggregate.aggregate.count / pageSize)} 
              color="primary" 
              showFirstButton showLastButton 
              onChange={handlePageChange}/>
          </Box>
          

          <Fab color="primary" onClick={() => navigate("/upload")} aria-label="add" sx={{
            position: 'fixed !important',
            bottom: "10%",
            right: "10%",
          }}>
            <AddIcon />
          </Fab>
        </Box>
      </Box>
      
    );
  }
  
  export default ItemComponent;