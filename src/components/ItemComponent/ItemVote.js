import { gql, useMutation, useLazyQuery } from '@apollo/client';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, IconButton, useTheme } from '@mui/material';
import { useKeycloak } from '@react-keycloak/web';
import { useState } from 'react';

const IS_LIKED_BY_USER = gql`
    query IsLikedByUser($creator_sub: String!, $item_id: Int!) {
        creator_liked_item_by_pk(creator_sub: $creator_sub, item_id: $item_id) {
            creator_sub
            item_id
        }
    }
`

const INSERT_LIKE = gql`
    mutation INSERT_LIKE($creator_sub: String, $item_id: Int) {
        insert_creator_liked_item_one(
            object: {creator_sub: $creator_sub, item_id: $item_id}
        ) {
            creator_sub
            item_id
        }
    }
`

const DELETE_LIKE = gql`
    mutation DELETE_LIKE($creator_sub: String!, $item_id: Int!) {
        delete_creator_liked_item_by_pk(creator_sub: $creator_sub, item_id: $item_id) {
            creator_sub
            item_id
        }
    }
`

export default function ItemVote(props) {
    const theme = useTheme();
    const { initialized, keycloak } = useKeycloak();
    let [creator_sub, setCreatorSub] = useState("");
    let [gotLike, setGotLike] = useState(false)

    const [getLike, {loading, error, data, refetch}] = useLazyQuery(IS_LIKED_BY_USER);

    const [insertLike, { data: dataLike, loading: loadingLike, error: errorLike }] = useMutation(INSERT_LIKE);
    const [deleteLike, { data: dataDLike, loading: loadingDLike, error: errorDLike }] = useMutation(DELETE_LIKE);

    let isLoggedIn = initialized && keycloak.authenticated;

    if(isLoggedIn && keycloak.idToken) {
        if(creator_sub === "") setCreatorSub(keycloak.idTokenParsed.sub);
    } else if(isLoggedIn) {
        keycloak.loadUserProfile(function () {
          setCreatorSub(keycloak.profile.sub);
        }, function() {
          console.log("failed to load user info!");
        })
    };
  
    if(creator_sub !== "" && !loading && !(data === undefined)) {
        getLike({variables: {"item_id": props.item_id, creator_sub: creator_sub}});
    } 

    const is_by_logged_in_user = (creator_sub === props.sub);

    if(!((dataLike === undefined) && (dataDLike === undefined))) {
        refetch({variables: {"item_id": props.item_id, creator_sub: creator_sub}});
    }

    return (
        <Box>
            <IconButton  disabled={!isLoggedIn || is_by_logged_in_user || loading || data === undefined} onClick={(e) => {
                e.stopPropagation();

                if(data !== undefined && !data.creator_liked_item_by_pk) {
                    insertLike({
                        variables: {
                            item_id: props.item_id,
                            creator_sub: creator_sub,
                        }
                    })
                } else if(data.creator_liked_item_by_pk) {
                    deleteLike({
                        variables: {
                            item_id: props.item_id,
                            creator_sub: creator_sub,
                        }
                    })
                }
                }
            } >
                {data === undefined || !data.creator_liked_item_by_pk ? <FavoriteBorderIcon/> : <FavoriteIcon sx={{color: "#ff6d75"}}/>}
            </IconButton>

        </Box>
    )
}