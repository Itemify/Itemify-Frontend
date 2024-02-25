import { Divider, Link, Typography, useTheme } from '@mui/material';
import React from 'react';
import Paper from '../utils/Paper';
import HelpIcon from '@mui/icons-material/Help';
import { Box } from '@mui/system';
import { gql, useQuery } from '@apollo/client';
import LoadingComponent from '../LoadingComponent';
import { useKeycloak } from '@react-keycloak/web';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PrinterControlsComponent from './PrinterControlsCoponent';

const GET_PRINTER_AND_QUEUE = gql`
  query PRINTER_AND_QUEUE {
    printer {
      printer_name
      printer_model
      printer_id
      print_queue(order_by: {priority: desc, creation_ts: asc}) {
        gcode_file
        creation_ts
        priority
        stl_file
        job_id
      }
    }
  }
`

function PrintingQueueComponent(props) {
    const theme = useTheme();

    const { loading, error, data } = useQuery(GET_PRINTER_AND_QUEUE);
    let [creator_sub, setCreatorSub] = React.useState("");
    let [username, setUsername] = React.useState("");


    console.log(data);;

    const { keycloak, initialized } = useKeycloak();
    let isLoggedIn = initialized && keycloak.authenticated;

    if(isLoggedIn && keycloak.idToken) {
      if(creator_sub === "") setCreatorSub(keycloak.idTokenParsed.sub);
      if(username === "") setUsername(keycloak.idTokenParsed.preferred_username);
    } else if(isLoggedIn) {
      keycloak.loadUserProfile(function (userInfo) {
        setCreatorSub(keycloak.profile.sub);
        setUsername(userInfo.preferred_username);
      }, function() {
        console.log("failed to load user info!");
      })
    } 

    const is_by_logged_in_user = creator_sub === props.sub;
    const is_admin = isLoggedIn ? keycloak.resourceAccess.itemify.roles.some((role) => role === 'admin'): false;


    console.log("Printing Queue")


    if (loading) return <LoadingComponent/>;

    console.log(data);

    return (
      <div className='content'>
        <Typography variant='h3' sx={{p:"10pt 32pt", textAlign:'center', fontWeight:800, overflow: "hidden"}}>Printing Queue</Typography>

        <Paper bgcolor="background.secondary" sx={{p: "8pt", display: "flex", flexDirection: "column"}}>
          <Box sx={{display: "flex", gap: "8pt"}}>
            <HelpIcon/>
            <h3>Information</h3>
          </Box>
          <p>Here you can find your own printing queue.</p>
          <p>You can add your octoprint 3d printer to Itemify and automate them, make it repeat not working 3d prints and just care for the next model you want to print.</p>
        </Paper>

      <Box>
        {
          isLoggedIn &&
          data.printer.map((printer) => (
            <Paper bgcolor="background.secondary" sx={{p: "8pt", mt: "8pt", display: "flex", flexDirection: "column"}}>
              <Typography variant='h5' sx={{p:"10pt 32pt", textAlign:'center', fontWeight:700, overflow: "hidden"}}>{printer.printer_name}</Typography>
              <Box sx={{display: "flex", justifyContent: "space-between", padding: "0px 8pt", mb: "8pt"}}>
                <Box sx={{mr: "auto", height: "max-content"}}>
                  <Typography sx={{fontWeight: "700"}}>Printer Controls</Typography>
                </Box>
                
                <PrinterControlsComponent printerid={printer.printer_id}/>
              </Box>

              <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0px 8pt", mb: "8pt"}}>
                <Typography sx={{fontWeight: "700"}}>Printer Model</Typography>
                <Typography>{printer.printer_model}</Typography>
              </Box>

              <Box sx={{display: "flex", justifyContent: "space-between", padding: "0px 8pt", mb: "8pt"}}>
                <Typography sx={{fontWeight: "700"}}>Printer ID</Typography>
                <Typography>{printer.printer_id}</Typography>
              </Box>

              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Index</TableCell>
                      <TableCell align="right">File</TableCell>
                      <TableCell align="right">Priority</TableCell>
                      <TableCell align="right">Job ID</TableCell>
                      <TableCell align="right">Creation Time</TableCell>
                      <TableCell align="right">Cancel</TableCell>
                      <TableCell align="right">Duplicate</TableCell>
                      <TableCell align="right">Printer</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {printer.print_queue.map((row, index) => (
                      <TableRow
                        key={row.name}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {index}
                        </TableCell>
                        <TableCell align="right">
                          <Link href={row.gcode_file}>
                          {row.gcode_file.replace("https://itemify-models.fra1.cdn.digitaloceanspaces.com/", "")}
                          </Link>
                        </TableCell>
                        <TableCell align="right">{row.priority}</TableCell>
                        <TableCell align="right">{row.job_id}</TableCell>
                        <TableCell align="right">{new Date(row.creation_ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))
        }
      </Box>


      </div>
    );
  }
  
  export default PrintingQueueComponent;
