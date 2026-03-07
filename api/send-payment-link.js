import Twilio from "twilio";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // ✅ Vercel/Vapi czasem daje body jako string
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    const { duration, phone, callId } = body || {};
    if (!duration || !phone || !callId) {
      return res.status(400).send("Missing duration/phone/callId");
    }

    const TWILIO_SID = (process.env.TWILIO_SID || "").trim();
    const TWILIO_AUTH_TOKEN = (process.env.TWILIO_AUTH_TOKEN || "").trim();
    const TWILIO_NUMBER = (process.env.TWILIO_NUMBER || "").trim();

    // ✅ pokaże w Vercel logs co jest dostępne (bez ujawniania sekretów)
    console.log("TWILIO ENV CHECK", {
      hasSid: !!TWILIO_SID,
      hasToken: !!TWILIO_AUTH_TOKEN,
      hasNumber: !!TWILIO_NUMBER,
      vercelEnv: process.env.VERCEL_ENV,
    });

    if (!TWILIO_SID) return res.status(500).send("Missing TWILIO_SID");
    if (!TWILIO_AUTH_TOKEN) return res.status(500).send("Missing TWILIO_AUTH_TOKEN");
    if (!TWILIO_NUMBER) return res.status(500).send("Missing TWILIO_NUMBER");

    const twilio = Twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

    let paymentLink;
    if (duration === "15") paymentLink = "https://buy.stripe.com/5kQdRa8WCaBO9Kf3O43VC00";
    else if (duration === "30") paymentLink = "https://buy.stripe.com/3cI28s7Sy6lycWr2K03VC01";
    else if (duration === "60") paymentLink = "https://buy.stripe.com/dRm9AUa0GdO0bSnckA3VC02";
    else return res.status(400).send("Invalid duration");

    const urlWithMetadata =
      `${paymentLink}?prefilled_metadata[callId]=${encodeURIComponent(callId)}`;

    const to = phone.startsWith("+44") ? phone : "+44" + phone.replace(/^0/, "");

    await twilio.messages.create({
      body: `Kesony Garage: płatność za ${duration} min konsultacji:\n${urlWithMetadata}`,
      from: TWILIO_NUMBER,
      to,
    });

    return res.status(200).send("✅ SMS sent");
  } catch (err) {
    console.error("SEND PAYMENT LINK ERROR:", err);
    return res.status(500).send(err?.message || "Server error");
  }
}
