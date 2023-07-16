import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableHead, TableRow, TableCell, Link, CircularProgress, TextField, Button} from '@mui/material';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useKeycloak } from "@react-keycloak/web";
import Paper from "../../utils/Paper";

const GET_ITEM = gql`
  query GET_ITEM_FILES($id: Int!) {
    items_by_pk(item_id: $id) {
      item_files {
        file_name
        file_type
        item_id
        file_path
        dim_x
        dim_y
        dim_z
        filament_used
        quantity
      }
    }
  }
`

const INSERT_QUANTITIES = gql`
  mutation INSERT_DELIVERY_QUANTITIES($objs:[delivery_item_quantity_insert_input!]!) {
    insert_delivery_item_quantity(objects: $objs) {
        returning {
          quantity
          item_id
          file_name
        }
    }
  }
`

export default function QuantityComponent(props) {
  const [quantities, setQuantities] = useState([]);
  const [firstAfterLoading, setFirstAfterLoading] = useState(true);

  const { loading, error, data } = useQuery(GET_ITEM, { 
    variables: {id: props.itemID},
  });

  const [insertQuantities, { data: insertData, loading: insertLoading, error: insertError}] = useMutation(INSERT_QUANTITIES);

  useEffect(() => {
    if (insertData) {
      props.onNext()
    }
  })

  if (loading) return <Box sx={{display: "fley", verticalAlign: "center"}}><CircularProgress /></Box>;
  if (error) return <p>Error: {error}</p>;

  if(firstAfterLoading) {
    setQuantities(data.items_by_pk.item_files.filter(file => file.file_type === "item").map((file) => file.quantity));
    setFirstAfterLoading(false);
  }

  const onNext = () => {
    insertQuantities({
      variables: {
        objs: data.items_by_pk.item_files.filter(file => file.file_type === "item").map((file, index) => {
          return {
            delivery_id: props.deliveryID,
            item_id: file.item_id,
            file_name: file.file_name,
            quantity: quantities[index],
            filament_id: props.filament
          }
        })
      }
    })
  }

  const onInputChange = (index, value) => {
    setQuantities(quantities.slice(0,index).concat([value]).concat(quantities.slice(index + 1)))
  }
  
  return(
    <Paper sx={{mt:"8pt", p:"10pt 20pt", width: "100%", display: "flex", justifyContent: "space-between", flexDirection: "column"}}>
      <Box>
        <Typography variant='h5' style={{fontWeight:500}} sx={{pb:"4pt"}}>Downloads</Typography>
        
        <Table sx={{ width: "100%"}} aria-label="simple table">
        <TableHead>
            <TableRow>
            <TableCell align='left'>Name</TableCell>
            <TableCell align='right'>QTY</TableCell>
            </TableRow>
        </TableHead>
        <TableBody>
            {data.items_by_pk.item_files.filter(file => file.file_type === "item").map((row, index) => (
            <TableRow
                key={row.file_name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell component="th" scope="row">
                {row.file_name}
                </TableCell>
                <TableCell component="th" scope="row" align='right'>
                  <TextField
                    id="outlined-number"
                    label="Number"
                    type="number"
                    value={quantities[index]}
                    onInput={(event) => onInputChange(index, event.target.value)}
                    sx={{width: "50%", minWidth: "100px"}}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
      </Table>
    </Box>


    <Box sx={{display: "flex", flexDirection: "column", p: "8pt", gap: "8pt"}}>
      <Button variant="contained" onClick={onNext}>Next</Button>
    </Box>

  </Paper>

  )
}