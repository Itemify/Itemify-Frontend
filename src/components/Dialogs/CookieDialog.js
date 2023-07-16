import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Cookies from 'universal-cookie';
import { Link } from 'react-router-dom';

export default function CookieDialog(props) {
  const cookies = new Cookies();
  const _accepted = false; cookies.get("cookiesAccepted");
  const [open, setOpen] = React.useState(_accepted ? false : true);
  
  if(_accepted) props.onCookieAccept()

  const current = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(current.getFullYear() + 2);

  
  const handleClose = () => {
    console.log("handle Close");
    setOpen(false);
    cookies.set("cookiesAccepted", true, {expires: nextYear, path:"/", sameSite:"strict"})

    props.onCookieAccept()
  };

  

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"This Sites uses Cookies."}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <p>
              Cookies are used for authentication, payment transactions and to prevent the site of showing you this dialog again. 
              Everything else is without cookies. To use this site, you have to agree to the use of cookies.
            </p>
            <p>
              Cookies are small text files on your machine.
            </p>
            <p>
              If you disagree, you can open this dialog again by reloading the site.
            </p>
            <p>
              Here you can find our privacy policy:
            </p>
            <a href="/privacy">Here</a>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button id="disagreeCookies" onClick={() => setOpen(false)}>
            Disagree
          </Button>
          <Button id="allowCookies" onClick={handleClose} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
