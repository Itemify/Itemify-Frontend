import React, { useEffect, useState } from "react";
import { Autocomplete, Box, Button, TextField } from "@mui/material";
import { gql, useMutation, useQuery } from '@apollo/client';
import { useKeycloak } from "@react-keycloak/web";
import LoadingComponent from "../../LoadingComponent";
import Paper from "../../utils/Paper";

const INSERT_DELIVERY = gql`
    mutation INSERT_DELIVERY_ADDRESS($city: String, $country: String, $email: String, $creator_sub: String = null, $family_name: String, $given_name: String, $postal_code: String, $street: String, $street_nr: String, $material: String = "", $filament: Int = 10) {
    insert_delivery_address_one(object: {
        city: $city, country: $country, creator_sub: $creator_sub, 
        family_name: $family_name, given_name: $given_name, 
        email: $email
        postal_code: $postal_code, street: $street, street_nr: $street_nr, 
        material: $material, filament: $filament
        }) {
            delivery_id
        }
    }

`
const GET_COUNTRIES = gql`
    query get_item_description {
        countries {
            country_name
            shipping_cost
        }
    }
`
const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
  
export default function DeliveryComponent(props) {
    const { keycloak, initialized } = useKeycloak();


    const [givenName, setGivenName] = useState("");
    const [givenNameError, setGivenNameError] = useState(false);
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState(false);

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(false);

    const [street, setStreet] = useState("");
    const [streetError, setStreetError] = useState(false);
    const [streetNr, setStreetNr] = useState("1");
    const [streetNrError, setStreetNrError] = useState(false);

    const [postalCode, setPostalCode] = useState("");
    const [postalCodeError, setPostalCodeError] = useState(false);
    const [city, setCity] = useState("");
    const [cityError, setCityError] = useState(false);

    const [country, setCountry] = useState("Germany");
    const [countryError, setCountryError] = useState(false);

    let [creator_sub, setCreatorSub] = useState(null);

    let isLoggedIn = initialized && keycloak.authenticated;


    if(isLoggedIn && keycloak.idToken) {
        if(creator_sub === "") setCreatorSub(keycloak.idTokenParsed.sub);
    } else if(isLoggedIn) {
        keycloak.loadUserProfile(function () {
          setCreatorSub(keycloak.profile.sub);
        }, function() {
          console.log("failed to load user info!");
        })
    };

    const [insertDelivery, { data, loading, error }] = useMutation(INSERT_DELIVERY);

    const { data: dataCountries, loading: loadingCountries, error: errorCountries } = useQuery(GET_COUNTRIES);

    const onNext = () => {
        setGivenNameError(false);
        setNameError(false);
        setStreetError(false);
        setPostalCodeError(false);
        setCityError(false);
        setCountryError(false);
        setEmailError(false);

        let error = false;
        if(givenName === "") {
            setGivenNameError(true);
            error = true;
        }

        if(name === "") {
            setNameError(true);
            error = true;
        }

        if(street === "") {
            setStreetError(true);
            error = true;
        }

        if(postalCode === "") {
            setPostalCodeError(true);
            error = true;
        }

        if(city === "") {
            setCityError(true);
            error = true;
        }

        if(country === "") {
            setCountryError(true);
            error = true;
        }

        if (!validateEmail(email)) {
            setEmailError(true);
            error = true;
        }

        if(error) return;

        insertDelivery({
            variables: {
                city: city,
                country: country,
                family_name: name,
                given_name: givenName,
                postal_code: postalCode,
                street: street,
                street_nr: streetNr,
                creator_sub: creator_sub,
                material: props.material,
                filament: props.filament,
                email: email
            }
        })
    }

    useEffect(() => {
        if (data) {
            props.onNext(data.insert_delivery_address_one.delivery_id);
        }
    });

    if (loadingCountries) return <LoadingComponent/>;
    if (errorCountries) return <p>Error: {error}</p>;
  

    const countryNames = dataCountries.countries.map((country) => country.country_name).sort();
  return(
    <Paper sx={{mt: "8pt", display: "flex", justifyContent: "space-between", flexDirection: "column"}}>
        <Box
            component="form"
            sx={{display: "flex", flexDirection: "column", p: "8pt", gap: "8pt", flexWrap: "wrap"}}
            noValidate
            autoComplete="off"
        >
            <Box sx={{display: "flex", gap: "8pt", flexWrap: {xs: "wrap", md: "nowrap"}}}>
                <TextField sx={{width: {xs: "100%", md: "50%"}}} label="Given Name" variant="outlined" 
                    error={givenNameError}
                    value={givenName} onInput={e => setGivenName(e.target.value)} />
                <TextField sx={{width: {xs: "100%", md: "50%"}}} label="Last Name" variant="outlined" 
                    error={nameError}
                    value={name} onInput={e => setName(e.target.value)} />
            </Box>

            <TextField sx={{width: "100%"}} label="Email" variant="outlined" 
                    error={emailError}
                    value={email} onInput={e => setEmail(e.target.value)} />

            <Box sx={{display: "flex", gap: "8pt", flexWrap: {xs: "wrap", md: "nowrap"}}}>
                <TextField sx={{width: {xs: "100%", md: "70%"}}} label="Street" variant="outlined" 
                    error={streetError}
                    value={street} onInput={e => setStreet(e.target.value)} />
                <TextField sx={{width: {xs: "100%", md: "30%"}}} label="Street Nr" variant="outlined" 
                    value={streetNr} onInput={e => setStreetNr(e.target.value)} />
            </Box>

            <Box sx={{display: "flex", gap: "8pt", flexWrap: {xs: "wrap", md: "nowrap"}}}>
                <TextField sx={{width: {xs: "100%", md: "30%"}}} label="Postal Code" variant="outlined" 
                    error={postalCodeError}
                    value={postalCode} onInput={e => setPostalCode(e.target.value)} />
                <TextField sx={{width: {xs: "100%", md: "70%"}}} label="City" variant="outlined" 
                    error={cityError}
                    value={city} onInput={e => setCity(e.target.value)} />
            </Box>

            <Autocomplete
                disablePortal
                options={countryNames}
                value={country}
                autoHighlight
                onChange={(e, newValues) => {
                    console.log(newValues);
                    setCountry(newValues);
                }}
                renderInput={(params) => <TextField 
                    error={countryError} {...params} label="Country" />}
                />
        </Box>

        <Box sx={{display: "flex", flexDirection: "column", p: "8pt", gap: "8pt"}}>
            <Button variant="contained" onClick={onNext}>Next</Button>
        </Box>
    </Paper>

  )
}