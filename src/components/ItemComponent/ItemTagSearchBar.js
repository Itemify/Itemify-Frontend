import { Box, Fab, Pagination, Select, MenuItem, FormControl, InputLabel, FormGroup, FormControlLabel, Checkbox, Autocomplete, TextField, Chip, InputBase} from '@mui/material';
import useAutocomplete from '@mui/material/useAutocomplete';
import React, { useEffect } from 'react';
import Items from './Items';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate, useSearchParams } from "react-router-dom";
import { gql, useQuery } from '@apollo/client';
import LoadingComponent from '../LoadingComponent';
import { alpha, styled } from '@mui/system';
import SearchIcon from '@mui/icons-material/Search';

const ITEM_COUNT = gql`
  query count_items($input_tags: _text, $limit: Int, $like: String) {
    get_filtered_tag_counts(args: {input_tags: $input_tags}, limit: $limit, where: {item_tag: {_like: $like}}) {
      count
      item_tag
    }
  }
`

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const Listbox = styled('ul')(({ theme }) => ({
  width: 200,
  margin: 0,
  padding: 0,
  zIndex: 1,
  position: 'absolute',
  listStyle: 'none',
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : '#000',
  overflow: 'auto',
  maxHeight: 200,
  border: '1px solid rgba(0,0,0,.25)',
  '& li.Mui-focused': {
    backgroundColor: '#4a8df6',
    color: 'white',
    cursor: 'pointer',
  },
  '& li:active': {
    backgroundColor: '#2977f5',
    color: 'white',
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export default function ItemTagSearchBar(props) {
    const [tagFieldValue, setTagFieldValue] = React.useState("");
    const [tagFieldValueInput, setTagFieldValueInput] = React.useState("");

    const handleAddTag = (event, newValue) => {
        setTagFieldValueInput("")
        setTagFieldValue("");

        props.handleAddTag(event, newValue);
      }

    const { loading, error, data} = useQuery(ITEM_COUNT, {
        variables: {
          input_tags: "{" + props.tags.map((x) => "\"" + x + "\"").join(",") + "}",
          limit: 20 + props.tags.length,
          like: tagFieldValueInput + "%"
        }
      });

    let tagPos = [];

    if(data) {
      tagPos = data.get_filtered_tag_counts.filter((x) => !props.tags.some((y) => (y === x.item_tag)))
      .map((tag) => tag.item_tag + " (" +tag.count + ")");
    }

    return(
        <div>
          <Autocomplete
            disablePortal
            autoHighlight
            options={tagPos}
            sx={{ width: "100%", minWidth: "130px"}}
            filterOptions={(x) => x}
            value={tagFieldValue}
            onChange={handleAddTag}
            inputValue={tagFieldValueInput}
            onInputChange={(event, newInputValue) => {
                setTagFieldValueInput(newInputValue);
            }}
            renderInput={(params) => 
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  ref={params.InputProps.ref}
                  inputProps={params.inputProps}
                  placeholder="Search…"
                />
              </Search>
            }
        />
        </div>
    )
}