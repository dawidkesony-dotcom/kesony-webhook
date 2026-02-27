import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
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
    console.error(err.message);
    res.status(400).json({ error: err.message });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    console.log('Płatność OK! Czas:', event.data.object.metadata?.duration || 'nieznany');
  }

  res.status(200).json({ received: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
