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
  types: PickupType[]
) {
  const dateLabel = new Date(pickupDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const typesList = types.map((t) => PICKUP_LABELS[t]).join(" & ");

  const body =
    `🗑️ Homestead Zone 14 Reminder:\n` +
    `${typesList} pickup is TOMORROW (${dateLabel}).\n` +
    `Put your bins out tonight!\n` +
    `Reply STOP to unsubscribe.`;

  return getTwilioClient().messages.create({ body, from: getFromNumber(), to });
}
