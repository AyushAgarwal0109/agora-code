import { useState } from 'react';
import Button from '@material-ui/core/Button';
import VideoCall from './VideoCall';

const Join = () => {
  const [inCall, setInCall] = useState(false);

  return (
    <div style={{ height: '100%' }}>
      {inCall ? (
        <VideoCall setInCall={setInCall} />
      ) : (
        <Button
          variant='contained'
          color='primary'
          onClick={() => setInCall(true)}
        >
          Join Call
        </Button>
      )}
    </div>
  );
};

export default Join;
