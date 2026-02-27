import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers ;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log('Webhook error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const duration = session.metadata?.duration || 'unknown';
    console.log(`Zapłacone! Czas: ${duration} min. Klient: ${session.customer_email || 'anon'}`);

    // Tu możesz dodać logikę: np. zapisz w bazie, wyślij SMS do Vapi
    // albo po prostu zostaw – Vapi i tak po callu sprawdzi payment_status
  }

  res.status(200).json({ received: true });
}

export const config = {
  api: {
    bodyParser: false, // bo Stripe wysyła raw body
  },
};
