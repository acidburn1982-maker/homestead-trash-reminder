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
  types: PickupType[]
) {
  const dateLabel = new Date(pickupDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const typesList = types.map((t) => PICKUP_LABELS[t]).join(", ");

  const subject = `🗑️ Reminder: ${typesList} pickup tomorrow (${dateLabel})`;

  const html = `
    <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e40af; color: white; border-radius: 12px; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">🗑️ Pickup Reminder</h1>
        <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Homestead Zone 14</p>
      </div>

      <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-top: 16px;">
        <p style="font-size: 16px; color: #374151;">Hi ${name || "Neighbor"},</p>
        <p style="font-size: 16px; color: #374151;">
          Don't forget — tomorrow is <strong>${typesList}</strong> pickup day!
        </p>
        <p style="font-size: 18px; font-weight: bold; color: #1e40af;">📅 ${dateLabel}</p>

        <div style="margin-top: 16px;">
          ${types.map((t) => {
            const colors: Record<string, string> = {
              garbage: "#f59e0b",
              recycling: "#22c55e",
              bulky: "#3b82f6",
            };
            return `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="width: 12px; height: 12px; border-radius: 50%; background: ${colors[t]}; display: inline-block;"></span>
              <span style="color: #374151; font-size: 15px;">${PICKUP_LABELS[t]}</span>
            </div>`;
          }).join("")}
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
          Put your bins out tonight so you don't miss it!
        </p>
      </div>

      <div style="text-align: center; margin-top: 16px;">
        <a href="${getAppUrl()}" style="color: #1e40af; font-size: 13px;">View full 2026 schedule</a>
        &nbsp;·&nbsp;
        <a href="${getAppUrl()}/unsubscribe" style="color: #9ca3af; font-size: 13px;">Unsubscribe</a>
      </div>
    </div>
  `;

  return getResend().emails.send({ from: getFromEmail(), to, subject, html });
}
