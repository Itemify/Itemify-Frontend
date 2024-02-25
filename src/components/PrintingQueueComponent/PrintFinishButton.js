import { IconButton, Typography, useTheme } from '@mui/material';
import React from 'react';
import Paper from '../utils/Paper';
import HelpIcon from '@mui/icons-material/Help';
import { Box } from '@mui/system';
import { gql, useMutation, useQuery } from '@apollo/client';
import LoadingComponent from '../LoadingComponent';
import DoneIcon from '@mui/icons-material/Done';
import ErrorIcon from '@mui/icons-material/Error';

const FINISH_PRINT = gql`
    mutation FINISH_PRINT($job_id: Int) {
    update_print_queue(where: {job_id: {_eq: $job_id}}, _set: {finished: true}) {
        returning {
        job_id
        finished
        }
    }
    }
`

function PrintFinishButton(props) {
    const theme = useTheme();

    const [finish_job, { data, loading, error }] = useMutation(FINISH_PRINT);

    if (loading) return <LoadingComponent/>;
    if (error) return <ErrorIcon/>

    console.log(data);

    return (
      <div className='content'>
        <IconButton aria-label="finish-print">
            <DoneIcon />
        </IconButton>
      </div>
    );
  }
  
  export default PrintFinishButton;
