import { useState, useEffect } from 'react';
import { useMicrophoneAndCameraTracks } from './settings.js';
import { Grid } from '@material-ui/core';
import Video from './Video';
import Controls from './Controls';
import { getAccessToken } from './getAccessToken.js';
import { createClient } from 'agora-rtc-react';

export default function VideoCall(props) {
  const { setInCall } = props;
  const [users, setUsers] = useState([]);
  const [start, setStart] = useState(false);
  const { ready, tracks } = useMicrophoneAndCameraTracks();
  const [config, setConfig] = useState();
  const [channelName, setChannelName] = useState();
  const [patientUid, setPatientUid] = useState();
  const [client, setClient] = useState();

  useEffect(() => {
    setLocalState();
  }, []);

  const setLocalState = async () => {
    let tokenDetails = await getAccessToken();
    console.log(tokenDetails);
    if (tokenDetails) {
      setChannelName(tokenDetails.channel_name);
      setPatientUid(tokenDetails.patient_uid);
      const configurations = {
        mode: 'rtc',
        codec: 'vp8',
        appId: tokenDetails.app_id,
        token: tokenDetails.token_doctor,
      };
      setConfig(configurations);
      const createdClient = createClient(configurations);
      setClient(createdClient);
    }
  };

  useEffect(() => {
    if (client && channelName && config) {
      let init = async (name) => {
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video') {
            setUsers((prevUsers) => {
              return [...prevUsers, user];
            });
          }
          if (mediaType === 'audio') {
            user.audioTrack.play();
          }
        });

        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'audio') {
            if (user.audioTrack) user.audioTrack.stop();
          }
          if (mediaType === 'video') {
            setUsers((prevUsers) => {
              return prevUsers.filter((User) => User.uid !== user.uid);
            });
          }
        });

        client.on('user-left', (user) => {
          setUsers((prevUsers) => {
            return prevUsers.filter((User) => User.uid !== user.uid);
          });
        });

        try {
          console.log(config.appId, name, config.token, patientUid);
          await client.join(config.appId, name, config.token, patientUid);
        } catch (error) {
          console.log(error);
        }

        if (tracks) await client.publish([tracks[0], tracks[1]]);
        setStart(true);
      };

      if (ready && tracks) {
        try {
          init(channelName);
        } catch (error) {
          console.log(error);
        }
      }
    }
  }, [channelName, client, ready, tracks]);

  return (
    <Grid container direction='column' style={{ height: '100%' }}>
      <Grid item style={{ height: '5%' }}>
        {ready && tracks && (
          <Controls
            tracks={tracks}
            setStart={setStart}
            setInCall={setInCall}
            client={client}
          />
        )}
      </Grid>
      <Grid item style={{ height: '95%' }}>
        {start && tracks && <Video tracks={tracks} users={users} />}
      </Grid>
    </Grid>
  );
}
