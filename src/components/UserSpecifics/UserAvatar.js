import { borderRadius } from "@mui/system";
import Avatar from "boring-avatars";

export default function UserAvatar(props) {
    return (
        <Avatar
            name={props.username}
            variant="beam"
            colors={["#CCCCCC", "#E9E9E9", "#006666", "#008584", "#F5F5F5"]}/>
    )
}