import Twilio from 'twilio';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('No');
    }

    const { duration, phone, callId } = req.body;

    if (!duration || !phone || !callId) {
      return res.status(400).send('Brak danych');
    }

    const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER } = process.env;

    if (!TWILIO_SID || !TWILIO_AUTH_TOKEN || !TWILIO_NUMBER) {
      return res.status(500).send('Missing Twilio env vars');
    }

    const twilio = Twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

    let paymentLink;

    if (duration === '15')
      paymentLink = 'https://buy.stripe.com/5kQdRa8WCaBO9Kf3O43VC00';
    else if (duration === '30')
      paymentLink = 'https://buy.stripe.com/3cI28s7Sy6lycWr2K03VC01';
    else if (duration === '60')
      paymentLink = 'https://buy.stripe.com/dRm9AUa0GdO0bSnckA3VC02';
    else
      return res.status(400).send('Zły czas');

    const urlWithMetadata =
      `${paymentLink}?prefilled_metadata[callId]=${callId}`;

    await twilio.messages.create({
      body: `Kesony Garage: płatność za ${duration} min konsultacji:\n${urlWithMetadata}`,
      from: TWILIO_NUMBER,
      to: phone.startsWith('+44')
        ? phone
        : '+44' + phone.replace(/^0/, '')
    });

    return res.status(200).send('✅ SMS wysłany');

  } catch (err) {
    console.error('SEND PAYMENT LINK ERROR:', err);
    return res.status(500).send(err.message);
  }
}
