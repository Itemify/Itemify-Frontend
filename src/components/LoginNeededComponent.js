import { Button } from '@mui/material';
import React from 'react';
import { useKeycloak } from "@react-keycloak/web";

function LoginNeededComponent() {
    const { keycloak } = useKeycloak();
    
    return (
      <div className='content'>
        <h2>You need to login to do this action</h2>
        {keycloak.authenticated ? 
            <Button variant="contained" onClick={() => keycloak.logout()}>Logout</Button> :
            <Button variant="contained" onClick={() => keycloak.login()}>Login</Button>}
        
      </div>
    );
  }
  
  export default LoginNeededComponent;