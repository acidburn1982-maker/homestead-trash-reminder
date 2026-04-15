import twilio from "twilio";
import { PickupType, PICKUP_LABELS } from "./schedule";

function getTwilioClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
}

function getFromNumber() {
  return `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER!}`;
}

export async function sendPickupReminderWhatsApp(
  to: string,
  name: string,
  pickupDate: string,
  types: PickupType[],
  language = "en"
) {
  const dateLabel = new Date(pickupDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "short", day: "numeric",
  });

  const typesList = types.map((t) => PICKUP_LABELS[t]).join(" & ");

  const messages: Record<string, string> = {
    en: `🗑️ *Homestead Zone 14 Reminder*\n\n${typesList} pickup is *TOMORROW* (${dateLabel}).\n\nPut your bins out tonight!\n\n_Reply STOP to unsubscribe_`,
    es: `🗑️ *Recordatorio Zona 14 Homestead*\n\n¡Mañana es día de *${typesList}* (${dateLabel})!\n\nSaca los cubos esta noche.\n\n_Responde STOP para cancelar_`,
    ht: `🗑️ *Rapèl Zòn 14 Homestead*\n\nDemen se jou *${typesList}* (${dateLabel}).\n\nMete bwat ou yo deyò aswè a!\n\n_Reponn STOP pou dezenskri_`,
  };

  const body = messages[language] || messages.en;
  const toFormatted = `whatsapp:${to.startsWith("+") ? to : "+" + to}`;

  return getTwilioClient().messages.create({ body, from: getFromNumber(), to: toFormatted });
}
