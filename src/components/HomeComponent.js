import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown'
import markdown from '../res/home.md'
import Paper from './utils/Paper';

function HomeComponent() {
    let [text, setText] = useState("");

    fetch(markdown).then(res => res.text()).then(t => setText(t));

    return (
      <Paper className='content' elevation={2}>
        <ReactMarkdown>
          {text}
        </ReactMarkdown>
      </Paper>
    );
  }
  
  export default HomeComponent;