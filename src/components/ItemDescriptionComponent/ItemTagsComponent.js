import { Box, Typography, IconButton, CircularProgress, useTheme} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import AddIcon from '@mui/icons-material/Add';
import React from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useKeycloak } from '@react-keycloak/web';
import LoadingComponent from '../LoadingComponent';
import { Link } from 'react-router-dom';
import Paper from '../utils/Paper';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLoginDialog, openLoginDialog, closeLoginDialog } from '../../redux/loginSlice';

let INSERT_TAG = gql`
  mutation InsertTag($item_tag: String, $creator_sub: String, $item_id: Int, $vote: Int = 1) {
    insert_item_tags_one(object: {item_id: $item_id, item_tag: $item_tag, item_tag_votes: {data: {creator_sub: $creator_sub, vote: $vote}}}) {
      item_id
      item_tag
    }
  }
`;
let GET_TAGS = gql`
    query MyQuery($itemid:Int = 96) {
        item_tags(where: {item_id: {_eq: $itemid}}) {
            item_id
            item_tag
            voteable
            item_tag_votes_aggregate {
                aggregate {
                    sum {
                        vote
                    }
                }
            }
        }
    }
`;

const INSERT_VOTE = gql`
    mutation insertItemTagVote($creator_sub: String, $item_id: Int, $vote: Int, $item_tag: String) {
        insert_item_tag_votes_one(object: {creator_sub: $creator_sub, item_id: $item_id, item_tag: $item_tag, vote: $vote}, on_conflict: {constraint: item_tag_votes_pkey, update_columns: vote}) {
            creator_sub
            item_id
            item_tag
            statusof
            vote
        }
    }
`
  
function ItemTagsComponent(props) {
    const { initialized, keycloak } = useKeycloak();
    const theme = useTheme();

    const tagResults = useQuery(GET_TAGS, { 
        variables: {
            itemid: props.id
        },
      });

    const [addTagState, setAddTagState] = React.useState(false);

    let [creator_sub, setCreatorSub] = React.useState("");
    const [insertTag, { data, loading, error }] = useMutation(INSERT_TAG);
    const [insertVote, vote_ref] = useMutation(INSERT_VOTE);
    const [newTag, setNewTag] = React.useState("");

    const dispatch = useDispatch();
    const openMenu = useSelector((state) => state.login.openMenu);

    if (tagResults.loading) return <LoadingComponent/>;
    if (tagResults.error) return <p>Error: {tagResults.error}</p>;

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

    let handleKeyDownTagAdd = (e) => {
        if(e.key === "Enter") {
            insertTag({
                variables: {
                    item_tag: newTag.toLowerCase().trim(),
                    item_id: props.id,
                    creator_sub: creator_sub,
                }
            })

            setAddTagState(false);
        }
    }

    if (data || vote_ref.data) {
        tagResults.refetch({itemid: props.id});
    }

    const handleChangeNewTag = (e) => {
        setNewTag(e.target.value)
    }

    const handleVote = (tag, vote) => {
        if(!creator_sub ) {
            dispatch(openLoginDialog());
        } else {
            insertVote({variables: {"creator_sub": creator_sub, "item_id": props.id, "vote": vote, "item_tag": tag.item_tag}}); 
            tagResults.refetch({itemid: props.id});
        }
    }
    
    return (
        <Paper bgcolor="background.secondary" sx={{p: "8pt 0pt", mt: "8pt", top: "8pt", width: {xs: "100%", md: "150px"}, display: "flex", flexDirection: "column", alignItems: "center"}}>
            <Typography variant='h6' style={{fontWeight:500, fontSize: "small", marginBottom: "8pt", color: "gray"}}>Tags</Typography>

            <Box sx={{ml: "8pt", mr: "8pt"}}>
            {
                [...tagResults.data.item_tags].sort(
                    (a, b) => (b.item_tag_votes_aggregate.aggregate.sum.vote - a.item_tag_votes_aggregate.aggregate.sum.vote)
                    ).sort((a,b) => b.voteable - a.voteable).map((tag) => {
                    return (
                        <Box sx={{background: (tag.item_tag_votes_aggregate.aggregate.sum.vote ? tag.item_tag_votes_aggregate.aggregate.sum.vote : 1) >= 1 ? theme.palette.primary.main : "#666", 
                            display: "flex", borderRadius: "999px", justifyContent: "space-between", alignItems: "center", mb: "4pt"}}>

                            <IconButton disabled={!tag.voteable} onClick={() => {handleVote(tag, -1);}}>
                                <ArrowDropDownIcon/>
                            </IconButton>
                            
                            <Link to={"/?tags=" + tag.item_tag} style={{ textDecoration: 'none' }}>
                                <Typography variant='h6' style={{fontWeight:800, fontSize: "small", color: "white", textAlign: "center", wordBreak: "break-all"}}>
                                    {tag.item_tag + " (" + (tag.item_tag_votes_aggregate.aggregate.sum.vote ? tag.item_tag_votes_aggregate.aggregate.sum.vote : 1) + ")"}
                                </Typography>
                            </Link>

                            <IconButton disabled={!tag.voteable} onClick={() => {handleVote(tag, 1);}}>
                                <ArrowDropUpIcon/>
                            </IconButton>
                        </Box>
                    )
                })
            }
                {
                    !(creator_sub === "") ? 
                    <Box sx={{background: theme.palette.primary.main, display: "flex", borderRadius: "999px", justifyContent: "center", alignItems: "center", width: "100%"}}>
                        {
                            addTagState ? 
                            <input 
                                type="text" autoFocus 
                                style={{border:"1px solid #FFFFFF", color: "#FFFFFF", borderRadius: "999px", width: "100%", background: theme.palette.primary.main, textAlign: "center", height: "40px"}} 
                                onKeyDown={handleKeyDownTagAdd}
                                onChange={handleChangeNewTag}
                                value={newTag} />
                            : <IconButton onClick={() => setAddTagState(true)}><AddIcon/></IconButton>
                        }

                        {
                            loading && <LoadingComponent />
                        }
                    </Box>
                    : <div className='empty'></div>
                }  
            </Box>
        </Paper>
    )
}

export default ItemTagsComponent;