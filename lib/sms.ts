import twilio from "twilio";
import { PickupType, PICKUP_LABELS } from "./schedule";

function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
}

function getFromNumber() {
  return process.env.TWILIO_PHONE_NUMBER!;
}

export async function sendPickupReminderSMS(
  to: string,
  name: string,
  pickupDate: string,
  types: PickupType[],
  language = "en"
) {
  const dateLabel = new Date(pickupDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const typesList = types.map((t) => PICKUP_LABELS[t]).join(" & ");

  const messages: Record<string, string> = {
    en: `🗑️ Homestead Zone 14: ${typesList} pickup TOMORROW (${dateLabel}). Put bins out tonight! Reply STOP to unsubscribe.`,
    es: `🗑️ Zona 14 Homestead: Mañana es ${typesList} (${dateLabel}). ¡Saca los cubos esta noche! Responde STOP para cancelar.`,
    ht: `🗑️ Zòn 14 Homestead: Demen ${typesList} (${dateLabel}). Mete bwat ou yo deyò aswè a! Reponn STOP pou dezenskri.`,
  };

  const body = messages[language] || messages.en;

  return getTwilioClient().messages.create({ body, from: getFromNumber(), to });
}
