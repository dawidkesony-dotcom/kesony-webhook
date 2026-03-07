import Twilio from "twilio";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const toolCall = body?.message?.toolCallList?.[0];
    const duration = toolCall?.function?.arguments?.duration;
    const toolCallId = toolCall?.id;

    if (!duration || !toolCallId) {
      console.log("Missing duration/toolCallId");
      return res.status(400).send("Missing duration");
    }

    // ✅ Extract callId from webhook metadata
    const callId = body?.call?.id || body?.callId;

    // ✅ If callId not provided, extract from toolCall metadata
    const inferredCallId = body?.message?.call?.id || body?.call?.id;

    const finalCallId = callId || inferredCallId;

    if (!finalCallId) {
      console.log("No callId in payload");
      return res.status(400).send("Missing callId");
    }

    // ✅ Fetch call from Vapi
    const callRes = await fetch(`https://api.vapi.ai/call/${finalCallId}`, {
      headers: {
        Authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}`
      }
    });

    const callData = await callRes.json();
    const phone = callData?.customer?.number;

    if (!phone) {
      console.log("No phone in callData", callData);
      return res.status(400).send("Missing phone");
    }

    const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_NUMBER } = process.env;
    const twilio = Twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

    let paymentLink;
    if (duration === "15")
      paymentLink = "https://buy.stripe.com/5kQdRa8WCaBO9Kf3O43VC00";
    else if (duration === "30")
      paymentLink = "https://buy.stripe.com/3cI28s7Sy6lycWr2K03VC01";
    else if (duration === "60")
      paymentLink = "https://buy.stripe.com/dRm9AUa0GdO0bSnckA3VC02";
    else
      return res.status(400).send("Invalid duration");

    await twilio.messages.create({
      body: `Kesony Garage: płatność za ${duration} min konsultacji:\n${paymentLink}`,
      from: TWILIO_NUMBER,
      to: phone
    });

    return res.json({
      results: [
        {
          toolCallId,
          result: "SMS sent"
        }
      ]
    });

  } catch (err) {
    console.error("ERROR:", err);
    return res.status(500).send(err.message);
  }
}
