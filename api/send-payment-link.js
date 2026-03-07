import Stripe from 'stripe';
import Twilio from 'twilio';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const twilio = Twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('No');

  const { duration, phone, callId } = req.body;
  if (!duration || !phone || !callId)
    return res.status(400).send('Brak danych');

  let paymentLink;

  if (duration === '15')
    paymentLink = 'https://buy.stripe.com/5kQdRa8WCaBO9Kf3O43VC00';
  else if (duration === '30')
    paymentLink = 'https://buy.stripe.com/3cI28s7Sy6lycWr2K03VC01';
  else if (duration === '60')
    paymentLink = 'https://buy.stripe.com/dRm9AUa0GdO0bSnckA3VC02';
  else
    return res.status(400).send('Zły czas');

  // ✅ Attach callId so webhook can transfer
  const urlWithMetadata =
    `${paymentLink}?prefilled_metadata[callId]=${callId}`;

  try {
    await twilio.messages.create({
      body: `Kesony Garage: płatność za ${duration} min konsultacji:\n${urlWithMetadata}`,
      from: process.env.TWILIO_NUMBER,
      to: phone.startsWith('+44')
        ? phone
        : '+44' + phone.replace(/^0/, '')
    });

    res.status(200).send('✅ SMS wysłany');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd: ' + err.message);
  }
}
