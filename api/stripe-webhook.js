import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];

  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const callId = session.metadata?.callId;

    if (!callId) {
      console.log('No callId in metadata');
      return res.json({ received: true });
    }

    console.log('Payment confirmed for call:', callId);

    // ✅ Fetch call from Vapi
    const callRes = await fetch(`https://api.vapi.ai/call/${callId}`, {
      headers: {
        Authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
      },
    });

    const callData = await callRes.json();
    const controlUrl = callData.monitor?.controlUrl;

    if (!controlUrl) {
      console.log('No controlUrl found');
      return res.json({ received: true });
    }

    // ✅ Transfer to Dawid
    await fetch(controlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'transfer',
        destination: {
          type: 'number',
          number: '+447774604133',
        },
      }),
    });

    console.log('✅ Transferred to Dawid');
  }

  res.json({ received: true });
}
