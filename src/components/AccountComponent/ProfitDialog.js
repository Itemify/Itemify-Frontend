import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { gql, useQuery, useMutation } from '@apollo/client';

const UPDATE_BANK_ACCOUNT = gql`
mutation UPDATE_BANK_ACCOUNT($sub: String!, $iban: String, $bankaccountname: String) {
  update_creators_by_pk(pk_columns: {sub: $sub}, _set: {iban: $iban, bankaccountname: $bankaccountname}) {
    sub
  }
}
`

function ProfitDialog(props) {
  const [updateBankingAccount, { dataBank, loadingBank, errorBank }] = useMutation(UPDATE_BANK_ACCOUNT);
  const [iban, setIBAN] = React.useState("")
  const [bankAccountName, setBankAccountName] = React.useState("")

  const handleClose = () => {
    console.log("close");

    updateBankingAccount({
        variables: {
            sub: props.sub,
            iban: iban,
            bankaccountname: bankAccountName
        }
    });

    

    console.log("Finishing!");

    props.handleClose()
  };


  return (
    <div>
       <Dialog onClose={props.handleClose} open={true}>
        <DialogTitle>Set your Bank information</DialogTitle>
        <DialogContent>
          <DialogContentText>
            We will pay you monthly to this bank account.
          </DialogContentText>
          <TextField
            sx={{width:{xs: "90%", md: "500px"}}}
            autoFocus
            margin="dense"
            id="bio-text"
            label="Your Name"
            fullWidth
            variant="standard"
            multiline
            rows={1}
            value={bankAccountName}
            onChange={(e) => setBankAccountName(e.target.value)}
          />
          <TextField
            sx={{width:{xs: "90%", md: "500px"}}}
            margin="dense"
            id="bio-text"
            label="IBAN"
            fullWidth
            variant="standard"
            multiline
            rows={1}
            value={iban}
            onChange={(e) => setIBAN(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose}>Cancel</Button>
          <Button onClick={handleClose}>Set</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ProfitDialog;