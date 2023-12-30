import {
  Routes,
  Route,
  BrowserRouter
} from "react-router-dom";
import React, { Suspense, lazy, useState } from 'react';
import MenuAppBar from "./components/MenuAppBar"
import PricingComponent from "./components/PricingComponent"
import './App.css';
import PrivateRoute from "./helpers/PrivateRoute";
import { Box, CircularProgress } from "@mui/material";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from "@apollo/client";
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { useKeycloak } from "@react-keycloak/web";
import CookieDialog from "./components/Dialogs/CookieDialog";
import LoadingComponent from "./components/LoadingComponent";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";
import Logo from "./components/Logo";
import { Provider } from 'react-redux'
import store from './redux/store'


const HomeComponent = lazy(() => import('./components/HomeComponent'));
const ItemComponent = lazy(() => import('./components/ItemComponent/ItemComponent'));
const ItemDescriptionComponent = lazy(() => import('./components/ItemDescriptionComponent/ItemDescriptionComponent'));
const WikiComponent = lazy(() => import('./components/WikiComponent'));
const UploadComponent = lazy(() => import('./components/UploadComponent/UploadComponent'));
const UploadedComponent = lazy(() => import('./components/UploadedComponent/UploadedComponent'));
const NotImplementedComponent = lazy(() => import('./components/NotImplementedComponent'));
const CheckoutComponent = lazy(() => import('./components/Payment/CheckoutComponent'));
const PaymentCompletedComponent = lazy(() => import('./components/Payment/PaymentCompletedComponent'));
const LegalNoticeComponent = lazy(() => import('./components/LegalNoticeComponent'));
const PrivacyPolicyComponent = lazy(() => import('./components/PrivacyPolicyComponent/PrivacyPolicyComponent'));
const AccountComponent = lazy(() => import('./components/AccountComponent/AccountComponent'));
const LoginPopup = lazy(() => import('./components/Dialogs/LoginDialog/LoginDialog'));
const PrintingQueueComponent = lazy(() => import('./components/PrintingQueueComponent/PrintingQueueComponent'));


const apolloCache = new InMemoryCache();

const theme = createTheme({
  palette: {
    background: {
      default: "#FFF",
      secondary: "rgba(13,12,34,0.05)"
    },
    primary: {
      light: '#48a999',
      main: '#00796b',
      dark: '#004c40',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ce467b',
      main: '#c2185b',
      dark: '#87103f',
      contrastText: '#FFF',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 2000,
    },
  },
});

function App() {

  const { keycloak, initialized } = useKeycloak();
  const [ cookiesAccepted, setCookiesAccepted] = useState(false);

  keycloak.onAuthRefreshError = () => {
    window.location.href = "/";
  };
  
  const httpLink = createHttpLink({
    uri: process.env.REACT_APP_HASURA_URL
  });

  const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem('token');

    let isLoggedIn = initialized && keycloak.authenticated;
    // return the headers to the context so httpLink can read them

    let auth = isLoggedIn ? {
      headers: {
        ...headers,
        authorization: "Bearer " + keycloak.token,
      }
    }: {
      headers: {
        ...headers,
      }
    }
    return auth
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(`GraphQL Error: ${message}`),
      );
    }
    if (networkError) {
      console.log(`Network Error: ${networkError.message}`);
    }
  });

  const retryLink = new RetryLink({
    delay: {
      initial: 100,
      max: 2000,
      jitter: true,
    },
    attempts: {
      max: 5,
      retryIf: (error, _operation) => !!error,
    },
  });

  const client = new ApolloClient({
    link: retryLink.concat(authLink).concat(errorLink).concat(httpLink),
    cache:apolloCache,

  });

  // if(!cookiesAccepted && window.location.pathname !== "/privacy") return <CookieDialog onCookieAccept={() => setCookiesAccepted(true)}/>

  return (
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <ApolloProvider client={client}>
          <CssBaseline />
          
          <BrowserRouter>
            <Suspense fallback={<LoadingComponent/>}>
              <LoginPopup/>
            </Suspense>

            <MenuAppBar/>

            <Suspense fallback={<LoadingComponent/>}>
              <Routes>
                <Route path='/' element={ <ItemComponent/>}/>
                <Route path='/pricing' element= {<PricingComponent/>}/>
                <Route path='/upload'element={
                  <PrivateRoute>
                    <UploadComponent/>
                  </PrivateRoute>
                }/>
                <Route path='/wiki' element= {<WikiComponent/>}/>
                <Route path='/info' element= {<HomeComponent/>}/>
                <Route path='/item/:id' element= {<ItemDescriptionComponent/>}/>
                <Route path="/uploaded/:id/:name" element={<UploadedComponent/>}/>
                <Route path="/notImplemented" element={<NotImplementedComponent/>} />
                <Route path='/checkout/:id/:material/:filament' element={<CheckoutComponent/>} />
                <Route path='/finished' element={<PaymentCompletedComponent/>} />
                <Route path='/legal' element={<LegalNoticeComponent/>} />
                <Route path='/privacy' element={<PrivacyPolicyComponent/>} />
                <Route path='/account/:id' element={<AccountComponent/>} />
                <Route path='/logo' element={<Logo/>} />
                <Route path='/queue' element={<PrintingQueueComponent/>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ApolloProvider>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
