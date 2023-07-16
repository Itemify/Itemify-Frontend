import { Box } from "@mui/material";

export default function Paper(props) {
    let _sx = {...(props.sx), borderRadius:"4pt"}

    return <Box {...props} sx={_sx}>

    </Box>
}