import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Cookies from 'universal-cookie';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleLoginDialog, openLoginDialog, closeLoginDialog } from '../../../redux/loginSlice';
import { useKeycloak } from '@react-keycloak/web';

export default function LoginDialog(props) {
  const dispatch = useDispatch();
  const openMenu = useSelector((state) => state.login.openMenu);
  const { keycloak, initialized } = useKeycloak();

    let closeFun = function() {
      dispatch(closeLoginDialog());
    }; 

  return (
    <div>
      <Dialog
        open={openMenu}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          To do this action you need an account!
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            To do this action you need an account. You can login and register by following the dialog or pressing the button in the top right.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button id="close" onClick={closeFun}>
            Close
          </Button>
          <Button id="register" onClick={keycloak.login} autoFocus>
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
