import { Typography, Table, TableBody, TableHead, TableRow, TableCell, Link, Switch, Box} from '@mui/material';
import React from 'react';
import Paper from '../utils/Paper';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

function DownloadTableComponent(props) {
    const [page, setPage] = React.useState('1');

    const handleChange = (event, newValue) => {
      setPage(newValue);
    };

    return (<Paper bgcolor="background.secondary" sx={{mt:"8pt", p:"10pt 20pt"}}>
        <Typography variant='h5' style={{fontWeight:500}} sx={{pb:"4pt", ml: "8px"}}>Downloads</Typography>
        
        <TabContext value={page}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleChange} aria-label="lab API tabs example">
                <Tab label="Model Information" value="1" />
                <Tab label="Licensing" value="2" />
            </TabList>
            </Box>
            <TabPanel value="1" sx={{padding: "0"}}>
                <Table sx={{ width: "100%"}} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                        <TableCell align='left'>Name</TableCell>
                        <TableCell align='left'>Dimensions</TableCell>
                        <TableCell align='left'>Weight</TableCell>
                        <TableCell align="right">Download</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.itemFiles.filter(file => file.file_type === "item").map((row) => (
                        <TableRow
                            key={row.file_name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.file_name}
                            </TableCell>
                            <TableCell component="th" scope="row" align='left'>
                                {Math.round(row.dim_x) + "x" + Math.round(row.dim_y) + "x" + Math.round(row.dim_z)}
                            </TableCell>
                            <TableCell component="th" scope="row" align='left'>
                                {Math.round(row.filament_used * 3)}
                            </TableCell>
                            <TableCell align="right">
                                {
                                    row.show_renderer ? 
                                    <Link href={process.env.REACT_APP_S3_BUCKET_URL + row.file_path}>Download</Link>:
                                    <p>Forbidden by Artist</p>
                                }
                                
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabPanel>
            <TabPanel value="2" sx={{padding: "0"}}>
            <Table sx={{ width: "100%"}} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                        <TableCell align='left'>Name</TableCell>
                        <TableCell align='left'>License</TableCell>
                        <TableCell align='left'>QTY</TableCell>
                        <TableCell align="right">License Cost</TableCell>
                        <TableCell align="right" sx={{display: {xs: "none", sm: "table-cell"}}}>IsCostAppliedOnce</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.itemFiles.filter(file => file.file_type === "item").map((row) => (
                        <TableRow
                            key={row.file_name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.file_name}
                            </TableCell>
                            <TableCell component="th" scope="row" align='left'>
                                {row.license_name}
                            </TableCell>
                            <TableCell component="th" scope="row" align='left'>
                                {row.quantity}
                            </TableCell>    
                            <TableCell align="right">
                                {(row.license_price / 100).toFixed(2)}€
                            </TableCell>
                            <TableCell align="right"  sx={{display: {xs: "none", sm: "table-cell"}}}>
                                <Switch disabled checked={row.is_license_applied_once} />
                                
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TabPanel>
        </TabContext>


    </Paper>
  )
}

export default DownloadTableComponent;
