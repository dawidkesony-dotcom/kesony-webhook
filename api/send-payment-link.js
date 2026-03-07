import Twilio from 'twilio';

const twilio = Twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  console.log('SEND PAYMENT LINK HIT');

  res.status(200).send('OK');
}
