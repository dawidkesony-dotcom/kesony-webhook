import Twilio from "twilio";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    // ✅ Extract from Vapi tool-calls payload
    const toolCall = body?.message?.toolCallList?.[0];
    const duration = toolCall?.function?.arguments?.duration;

    const callId = body?.call?.id;
    const phone = body?.call?.customer?.number;

    if (!duration || !phone || !callId) {
      console.log("Missing data", { duration, phone, callId });
      return res.status(400).send("Missing duration/phone/callId");
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

    const urlWithMetadata =
      `${paymentLink}?prefilled_metadata[callId]=${encodeURIComponent(callId)}`;

    await twilio.messages.create({
      body: `Kesony Garage: płatność za ${duration} min konsultacji:\n${urlWithMetadata}`,
      from: TWILIO_NUMBER,
      to: phone,
    });

    return res.json({
      results: [
        {
          toolCallId: toolCall.id,
          result: "SMS sent successfully"
        }
      ]
    });

  } catch (err) {
    console.error("SEND PAYMENT LINK ERROR:", err);
    return res.status(500).send(err.message);
  }
}
