import { useKeycloak } from "@react-keycloak/web";
import LoginNeededComponent from "../components/LoginNeededComponent";
import React from 'react';

function PrivateRoute ({ children }) {
 const { keycloak } = useKeycloak();

 const isLoggedIn = keycloak.authenticated;

 return isLoggedIn ? children : <LoginNeededComponent/>;
};

export default PrivateRoute;