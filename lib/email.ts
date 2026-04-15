import { Resend } from "resend";
import { PickupType, PICKUP_LABELS } from "./schedule";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

function getFromEmail() {
  return process.env.FROM_EMAIL || "reminders@homesteadtrash.com";
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "https://homesteadtrash.com";
}

export async function sendPickupReminderEmail(
  to: string,
  name: string,
  pickupDate: string,
  types: PickupType[],
  language = "en"
) {
  const dateLabel = new Date(pickupDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const typesList = types.map((tp) => PICKUP_LABELS[tp]).join(", ");

  const strings: Record<string, Record<string, string>> = {
    en: {
      subject: `🗑️ Reminder: ${typesList} pickup tomorrow (${dateLabel})`,
      greeting: `Hi ${name || "Neighbor"},`,
      body: `Don't forget — tomorrow is <strong>${typesList}</strong> pickup day!`,
      cta: `Put your bins out tonight so you don't miss it!`,
      viewSchedule: "View full 2026 schedule",
      unsubscribe: "Unsubscribe",
    },
    es: {
      subject: `🗑️ Recordatorio: ${typesList} mañana (${dateLabel})`,
      greeting: `Hola ${name || "Vecino/a"},`,
      body: `¡No olvides — mañana es día de <strong>${typesList}</strong>!`,
      cta: `¡Saca los cubos esta noche para no perderte la recolección!`,
      viewSchedule: "Ver horario completo 2026",
      unsubscribe: "Cancelar suscripción",
    },
    ht: {
      subject: `🗑️ Rapèl: ${typesList} demen (${dateLabel})`,
      greeting: `Bonjou ${name || "Vwazen"},`,
      body: `Pa bliye — demen se jou <strong>${typesList}</strong>!`,
      cta: `Mete bwat ou yo deyò aswè a pou ou pa rate ranmase a!`,
      viewSchedule: "Wè orè konplè 2026",
      unsubscribe: "Dezenskri",
    },
  };

  const s = strings[language] || strings.en;

  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e40af; color: white; border-radius: 12px; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🗑️ Pickup Reminder</h1>
        <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Homestead Zone 14</p>
      </div>

      <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-top: 16px;">
        <p style="font-size: 16px; color: #374151;">${s.greeting}</p>
        <p style="font-size: 16px; color: #374151;">${s.body}</p>
        <p style="font-size: 18px; font-weight: bold; color: #1e40af;">📅 ${dateLabel}</p>

        <div style="margin-top: 16px;">
          ${types.map((tp) => {
            const colors: Record<string, string> = {
              garbage: "#f59e0b",
              recycling: "#22c55e",
              bulky: "#3b82f6",
            };
            return `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="width: 12px; height: 12px; border-radius: 50%; background: ${colors[tp]}; display: inline-block;"></span>
              <span style="color: #374151; font-size: 15px;">${PICKUP_LABELS[tp]}</span>
            </div>`;
          }).join("")}
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">${s.cta}</p>
      </div>

      <div style="text-align: center; margin-top: 16px;">
        <a href="${getAppUrl()}" style="color: #1e40af; font-size: 13px;">${s.viewSchedule}</a>
        &nbsp;·&nbsp;
        <a href="${getAppUrl()}/unsubscribe" style="color: #9ca3af; font-size: 13px;">${s.unsubscribe}</a>
      </div>
    </div>
  `;

  return getResend().emails.send({ from: getFromEmail(), to, subject: s.subject, html });
}
