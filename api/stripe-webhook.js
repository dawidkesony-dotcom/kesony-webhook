export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const body = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : req.body;

    console.log('PAYMENT LINK REQUEST:', body);

    return res.status(200).send('OK');
  } catch (err) {
    console.error('ERROR:', err);
    return res.status(500).send('ERROR');
  }
}
