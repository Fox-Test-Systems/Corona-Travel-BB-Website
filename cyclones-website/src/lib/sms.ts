import twilio from "twilio";
import { getSmsRecipients } from "./staff";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

function getTwilioClient() {
  if (!accountSid || !authToken || !fromNumber) {
    return null;
  }
  return twilio(accountSid, authToken);
}

export async function notifyStaffOfContact(
  senderName: string,
  subject: string,
  message: string
): Promise<{ sent: number; skipped: number }> {
  const client = getTwilioClient();
  const recipients = getSmsRecipients();

  if (!client || recipients.length === 0) {
    console.log("SMS not configured — skipping notifications");
    return { sent: 0, skipped: recipients.length };
  }

  const body =
    `⚾ Cyclones Contact Form\n` +
    `From: ${senderName}\n` +
    `Subject: ${subject}\n` +
    `${message.slice(0, 200)}${message.length > 200 ? "..." : ""}`;

  let sent = 0;
  let skipped = 0;

  for (const to of recipients) {
    try {
      await client.messages.create({
        body,
        from: fromNumber,
        to,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send SMS to ${to}:`, err);
      skipped++;
    }
  }

  return { sent, skipped };
}

export async function notifyStaffOfTryout(
  playerName: string,
  parentName: string,
  parentPhone: string
): Promise<{ sent: number; skipped: number }> {
  const client = getTwilioClient();
  const recipients = getSmsRecipients();

  if (!client || recipients.length === 0) {
    console.log("SMS not configured — skipping notifications");
    return { sent: 0, skipped: recipients.length };
  }

  const body =
    `⚾ New Tryout Registration!\n` +
    `Player: ${playerName}\n` +
    `Parent: ${parentName}\n` +
    `Phone: ${parentPhone}`;

  let sent = 0;
  let skipped = 0;

  for (const to of recipients) {
    try {
      await client.messages.create({
        body,
        from: fromNumber,
        to,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send SMS to ${to}:`, err);
      skipped++;
    }
  }

  return { sent, skipped };
}
