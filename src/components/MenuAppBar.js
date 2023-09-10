import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Canvas } from '@react-three/fiber'
import RendererComponent from './RendererComponent/RendererComponent';
import { useKeycloak } from "@react-keycloak/web";
import { Link, useTheme } from '@mui/material';
import { Link as RouterLink} from 'react-router-dom';
import { gql, useMutation } from '@apollo/client';
import { useSelector, useDispatch } from 'react-redux';
import { addTag, rmTag, clearTags, setTags}  from '../redux/tagsSlice';
import ItemTagSearchBar from './ItemComponent/ItemTagSearchBar';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserAvatar from './UserSpecifics/UserAvatar';

const pages = [
  {'title': 'Upload', 'href': '/upload'},
  {'title': 'Pricing', 'href': '/pricing'}, 
  {'title': 'Wiki', 'href': process.env.REACT_APP_WIKI_URL || "https://wiki.itemify.eu", 'otherPage': true}, 
  {'title': 'Legal Notice', 'href': '/legal'},
  {'title': "Discord", 'href': process.env.REACT_APP_DISCORD_URL || "https://discord.gg/6Gk8rS6y", 'otherPage': true},
  {'title': "Instagram", 'href': process.env.REACT_APP_INSTAGRAM_URL || "https://www.instagram.com/itemify.eu/", 'otherPage': true},
  {'title': "Github", 'href': process.env.REACT_APP_GITHUB_URL || "https://github.com/Itemify", 'otherPage': true},
];

const INSERT_CREATOR = gql`
  mutation upsert_creators(
    $username:String, 
    $sub:String, $creator_name:String, 
    $bio:String, $role:String) {
    insert_creators(
      objects: [{
        username: $username,
        sub: $sub,
        creator_name: $creator_name,
        bio: $bio,
        Role:$role
    }],
    on_conflict: {constraint: creators_pkey, update_columns: []}
    ) {
      returning {
        username
      }
    }
  }
`

const ResponsiveAppBar = () => {
  let [searchParams, setSearchParams] = useSearchParams()
  const theme = useTheme();
  const { keycloak, initialized } = useKeycloak();
  
  const [creator_sub, setCreatorSub] = React.useState("");
  const [username, setUsername] = React.useState("Anonym User");

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [insertCreator, creator] = useMutation(INSERT_CREATOR);

  const [showOnlySearchBar, setShowOnlySearchBar] = React.useState(false);
  
  const tags = useSelector((state) => state.tags.tags);
  const dispatch = useDispatch();

  

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  let isLoggedIn = initialized && keycloak.authenticated;

  if (isLoggedIn && username === "Anonym User") {
    keycloak.loadUserInfo().then(userInfo => { 
      setUsername(userInfo.preferred_username ? userInfo.preferred_username : "A");
      setCreatorSub(userInfo.sub);

      insertCreator({
        variables: {
          username: userInfo.preferred_username,
          sub: userInfo.sub,
          creator_name: userInfo.name,
          bio: "This user didnt set his bio!"
        }
      })
    });
  }
  

  let navigate = useNavigate();
  let location = useLocation();

  
  if(location.pathname !== "/") {
    console.log(location.pathname);
    if(tags.length > 0)
      dispatch(setTags([]));
  }

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    navigate("notImplemented")
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const routeTo = (page) => {
    if('otherPage' in page && page.otherPage) 
      window.location.href = page.href;
    else 
      navigate(page.href);
  }

  const handleAddTag = (event, newValue) => {
    let newTag = newValue.split("(")[0].trim();
    
    if(location.pathname === "/") {
      searchParams.set("tags", tags.concat([newTag]));
      setSearchParams(searchParams);
      dispatch(addTag(newTag));
    }
    else {
      dispatch(setTags([newTag]));
      navigate("/", {searchParams: {tags: [newTag]}});
    }
  }

  console.log(username);

  if(showOnlySearchBar) return (
    <AppBar position="static">
      <Container sx={{maxWidth:"none !important", paddingLeft: "0px !important", paddingRight: "8pt !important"}}>
        <Toolbar disableGutters style={{justifyContent:"center"}}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={() => setShowOnlySearchBar(false)}
            color="inherit"
          >
              <ArrowBackIcon/>
          </IconButton>

          <ItemTagSearchBar tags={tags} handleAddTag={handleAddTag}/>
        </Toolbar>
      </Container>
    </AppBar>
  )           

  return (
    <AppBar position="static">
      <Container sx={{maxWidth:"none !important", paddingLeft: "0px !important", paddingRight: "0pt !important"}}>
        <Toolbar disableGutters style={{justifyContent:"center"}}>
          <Box sx={{display:"flex"}}>
            <Canvas className='block'>
              <ambientLight intensity={0.3}/>
              <pointLight position={[3, 3, 3]} intensity={1}/>
              <RendererComponent position={[0, 0, -1]} />
            </Canvas>
            <Link component={RouterLink} 
              sx={{
                color: "white",
                fontSize: {xs: "24pt", md: "32pt" }, fontFamily: "Kanit, sans-serif",
                textAlign: "right",
                pr: "8pt",
                width: "fit-content",
                margin: "auto 0pt"
              }} 
              to="/" className="logo">Itemify</Link>
          </Box>

          <Box sx={{display:"flex"}}>
            <Box sx={{display: {xs: "none", sm: "block"}}}>
              <ItemTagSearchBar tags={tags} handleAddTag={handleAddTag}/>
            </Box>

            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={() => setShowOnlySearchBar(true)}
              color="inherit"
              sx={{display: {xs: "block", sm: "none"}}}
              >
                <SearchIcon/>
            </IconButton>
          </Box>

          <Box sx={{display: "flex"}}>
            <Box sx={{ width: "fit-content", display: 'block'}}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
              <MenuIcon />
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}    
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: 'block',
              }}
            >
              
              {pages.map((page) => (
                <MenuItem key={page.title} onClick={() => routeTo(page)}>
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}

            </Menu>
          </Box>
            {
              isLoggedIn ?
              <Box sx={{marginLeft:"16pt", mt:"auto", mb:"auto"}}>
                <Tooltip  title="Open settings">
                  <IconButton sx={{ p: 0 }} onClick={handleClick}>
                    <UserAvatar username={username}/>
                  </IconButton> 
                </Tooltip>

                <Menu
                  id="demo-positioned-menu"
                  aria-labelledby="demo-positioned-button"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                >
                  <MenuItem onClick={() => navigate("/account/" + creator_sub)}>My account</MenuItem>
                  <MenuItem onClick={keycloak.logout}>Logout</MenuItem>
                </Menu>
              </Box>
              : 
              <Button variant="contained" color="secondary" sx={{ml: "8pt", mt:"auto", mb:"auto"}} onClick={() => keycloak.login()}>login</Button>
            }
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default ResponsiveAppBar;
