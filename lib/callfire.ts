import { PickupType, PICKUP_LABELS } from "./schedule";

const CALLFIRE_API_URL = "https://api.callfire.com/v2/texts/send";

function getAuth() {
  const login = process.env.CALLFIRE_APP_LOGIN;
  const password = process.env.CALLFIRE_APP_PASSWORD;
  if (!login || !password) throw new Error("Missing CALLFIRE_APP_LOGIN or CALLFIRE_APP_PASSWORD");
  return "Basic " + Buffer.from(`${login}:${password}`).toString("base64");
}

function getFromNumber() {
  return process.env.CALLFIRE_FROM_NUMBER!;
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
    en: `Homestead Zone 14: ${typesList} pickup TOMORROW (${dateLabel}). Put bins out tonight! Reply STOP to unsubscribe.`,
    es: `Zona 14 Homestead: Manana es ${typesList} (${dateLabel}). Saca los cubos esta noche! Responde STOP para cancelar.`,
    ht: `Zon 14 Homestead: Demen ${typesList} (${dateLabel}). Mete bwat ou yo deyo aswe a! Reponn STOP pou dezenskri.`,
  };

  const message = messages[language] || messages.en;
  const phoneNumber = to.startsWith("+") ? to : `+${to}`;

  const res = await fetch(CALLFIRE_API_URL, {
    method: "POST",
    headers: {
      Authorization: getAuth(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        phoneNumber,
        message,
        fromNumber: getFromNumber(),
      },
    ]),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`CallFire error ${res.status}: ${errorText}`);
  }

  return res.json();
}
