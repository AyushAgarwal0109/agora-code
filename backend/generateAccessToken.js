import { appointment } from '../../models';
import { RtcRole, RtcTokenBuilder } from 'agora-access-token';
import { AGORA_APPID, AGORA_APP_CERTIFICATE } from '../../config/index';

const generateAccessToken = async (req, res, next) => {
  const { appointment_id } = req.body;

  // set response header
  res.header('Acess-Control-Allow-Origin', '*');

  //get channel name
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  function generateString(length) {
    let randomString = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      randomString += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
    }

    return randomString;
  }
  const channelName = generateString(7);

  //get uid

  const result = await appointment.findOne({ _id: appointment_id });
  let uid_doctor = result.d_id;
  let uid_patient = result.p_id;

  //get role

  let role_meet = RtcRole.PUBLISHER;

  // get the expire time

  let expireTime = 1200;

  // calculate privilege expire time

  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  //build the token

  const token_doctor = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APPID,
    AGORA_APP_CERTIFICATE,
    channelName,
    uid_doctor,
    role_meet,
    privilegeExpireTime
  );
  const token_patient = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APPID,
    AGORA_APP_CERTIFICATE,
    channelName,
    uid_patient,
    role_meet,
    privilegeExpireTime
  );

  //return the token
  return res.json({
    token_doctor: token_doctor,
    token_patient: token_patient,
    channel_name: channelName,
    patient_uid: uid_patient,
    doctor_uid: uid_doctor,
    privilegeExpireTime: privilegeExpireTime,
    time_limit_seconds: expireTime,
    app_id: AGORA_APPID,
    app_certificate: AGORA_APP_CERTIFICATE,
  });
};

export default generateAccessToken;
