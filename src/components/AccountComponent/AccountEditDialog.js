import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { gql, useQuery, useMutation } from '@apollo/client';

const UPDATE_BIO = gql`
    mutation updateCreator($sub: String, $bio: String) {
        update_creators(where: {sub: {_eq: $sub}}, _set: {bio: $bio}) {
            returning {
                bio
                sub
            }
        }
    }
`

function AccountEditDialog(props) {
  const [updateBio, { dataBio, loadingBio, errorBio }] = useMutation(UPDATE_BIO);
  const [bio, setBio] = React.useState(props.bio)

  const handleClose = () => {
    console.log("close");

    updateBio({
        variables: {
            sub: props.sub,
            bio: bio
        }
    });

    props.handleClose()
  };

  return (
    <div>
      <Dialog onClose={props.handleClose} open={true}>
        <DialogTitle>Edit Bio</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To edit you bio you can type your text here.
          </DialogContentText>
          <TextField
            sx={{width:{xs: "90%", md: "500px"}}}
            autoFocus
            margin="dense"
            id="bio-text"
            label="Bio"
            fullWidth
            variant="standard"
            multiline
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Edit</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AccountEditDialog;