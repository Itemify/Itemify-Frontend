import { gql, useQuery } from '@apollo/client';
import { Avatar, Box, Button, CircularProgress, IconButton, Pagination, Typography, useTheme } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';
import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Items from '../ItemComponent/Items';
import LoadingComponent from '../LoadingComponent';
import EditIcon from '@mui/icons-material/Edit';
import AccountEditDialog from './AccountEditDialog';
import ProfitDialog from './ProfitDialog';
import Paper from '../utils/Paper';
import UserAvatar from '../UserSpecifics/UserAvatar';

const GET_CREATOR = gql`
    query GetCreator($sub: String!, $nin: [Boolean!]) {
        creators_by_pk(sub: $sub) {
            Role
            bio
            creator_id
            creator_name
            statusof
            sub
            username
        }
        items_aggregate(where: {_and: {creatorByCreator: {sub: {_eq: $sub}}, published: {_nin: $nin}}}) {
            aggregate {
                count
            }
        }

        delivery_item_quantity_aggregate(where: {item: {creator: {_eq: $sub}}, delivery_address: {is_paid: {_eq: true}}}) {
            aggregate {
                sum {
                    price
                }
            }
        }
    }
`

function AccountComponent(props) {
    const theme = useTheme();
    let { id: sub } = useParams();
    const { initialized, keycloak } = useKeycloak();
    const [creator_sub, setCreatorSub] = useState("");
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [payMeDialogOpen, setPayMeDialogOpen] = useState(false);

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

    const is_by_logged_in_user = creator_sub === sub;

    const pageSize = 18;
    const [page, setPage] = React.useState(1);

    let navigate = useNavigate();

    // Data fetching
    const { loading, error, data } = useQuery(GET_CREATOR, { 
        variables: {
            "sub": sub,
            "nin": is_by_logged_in_user? []: [false] 
        }
    });

    if (loading) return <LoadingComponent/>;
    if (error) return <p>Error: {error}</p>;

    let moneyMade = Math.floor(data.delivery_item_quantity_aggregate.aggregate.sum.price / 5) / 100;

    return (
        <Box sx={{display:"flex", gap: "8pt", marginLeft: "auto", marginRight: "auto", width:"100%", maxWidth: "1600px", marginBottom: "16pt", flexWrap:{xs: "wrap", md: "nowrap"}}}>
            <Box component="aside" sx={{width: {xs: "96%", md: "150px"}, ml: {xs:"2%", md: "0pt"}, mt:{xs:"8pt", md: "24pt"}, mr: {xs: "2%", md: "0px"}}}>
                <Paper bgcolor="background.secondary" sx={{p: "8pt", position: "sticky", top: "8pt", display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <Typography variant='h6' style={{fontWeight:500, fontSize: "small", marginBottom: "8pt", color: "gray"}}>Uploader</Typography>

                    <IconButton sx={{ p: 0 }} onClick={() => {
                        navigate("/account/" + sub)
                    }}>
                        <UserAvatar username={data.creators_by_pk.username} />
                    </IconButton>

                    <Typography variant='p' style={{fontWeight:500, marginTop: "4pt"}}>{data.creators_by_pk.username}</Typography>

                    <Typography variant='p' style={{fontWeight:300, marginTop: "4pt", color: "gray", textAlign: "center"}}>{data.creators_by_pk.bio}</Typography>

                    { is_by_logged_in_user &&
                        <IconButton aria-label="edit-bio" onClick={() => setEditDialogOpen(true)}>
                            <EditIcon />
                        </IconButton>
                    }

                    { is_by_logged_in_user &&
                        <Box sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <Typography variant='p' style={{fontWeight:500, marginTop: "4pt"}}>{moneyMade}€</Typography>
                            <Typography variant='p' style={{fontWeight:500, marginTop: "4pt", color: "gray", marginTop:"-3px"}}>Made by selling</Typography>

                            <Button sx={{marginTop: "8pt"}} onClick={() => setPayMeDialogOpen(true)} variant="contained">Pay ME</Button>
                        </Box>
                        
                    }
                </Paper>
            </Box>
            <Box sx={{width:"96%", ml: "auto", mr: "auto", mt: {xs: "8pt", md: "19pt"}}}>
                <Items page={page} pageSize={pageSize} orderBy={"Newest"} showModels={false} tags={[]} creator={data.creators_by_pk.sub} showAll={is_by_logged_in_user}/>

                <Paper sx={{width:"98%", mt: "16pt", mr: "auto", ml: "auto", p: "1%", display: "flex", justifyContent: "center"}}>
                    <Pagination page={page} count={Math.ceil(data.items_aggregate.aggregate.count / pageSize)} color="primary" showFirstButton showLastButton onChange={(event, value) => setPage(value)} />
                </Paper>
            </Box>
            {
                editDialogOpen &&
                <AccountEditDialog sub={creator_sub} bio={data.creators_by_pk.bio} handleClose={() => setEditDialogOpen(false)}/>
            }
            {
                payMeDialogOpen &&
                <ProfitDialog sub={creator_sub} handleClose={() => setPayMeDialogOpen(false)}/>
            }
            
      </Box>
    );
  }
  
  export default AccountComponent;