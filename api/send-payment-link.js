import Stripe from 'stripe';
import Twilio from 'twilio';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const twilio = Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('No');

  const { duration, phone } = req.body;
  if (!duration || !phone) return res.status(400).send('Brak danych');

  let priceId;
  if (duration === '15') priceId = 'price_TWÓJ_DLA_15'; // ← wstaw swój price_...
  else if (duration === '30') priceId = 'price_TWÓJ_DLA_30';
  else if (duration === '60') priceId = 'price_1T5VdgKyVUTWasobAQfplP4B';
  else return res.status(400).send('Zły czas');

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ,
      line_items: ,
      mode: 'payment',
      success_url: 'https://google.com',
      cancel_url: 'https://google.com',
    });

    const link = session.url;

    await twilio.messages.create({
      body: `Kesony Garage: płatność za ${duration} min konsultacji: ${link}`,
      from: process.env.TWILIO_NUMBER,
      to: phone.startsWith('+44') ? phone : '+44' + phone.replace(/^0/, '')
    });

    res.status(200).send('SMS wysłany');
  } catch (err) {
    console.error(err);
    res.status(500).send('Błąd: ' + err.message);
  }
}
