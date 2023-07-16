import React from 'react';

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}


function PricingComponent() {
    //
    //window.location.href = "https://google.de";

    // Usage!
    sleep(500).then(() => {
      window.location.href = process.env.REACT_APP_WIKI_URL
    });
    return (
      <div className='content'>
        <h2>Wiki</h2>
        <p>You should be redirected soon</p>
      </div>
    );
  }
  
  export default PricingComponent;
