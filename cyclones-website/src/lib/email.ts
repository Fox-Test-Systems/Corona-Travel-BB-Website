import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "Cyclones Baseball <noreply@cyclones-baseball.com>";

export async function sendNoteNotification({
  parentEmail,
  parentName,
  playerName,
  coachName,
  noteContent,
  portalUrl,
}: {
  parentEmail: string;
  parentName: string;
  playerName: string;
  coachName: string;
  noteContent: string;
  portalUrl: string;
}): Promise<void> {
  if (!resend) {
    console.log(
      "Email not configured (RESEND_API_KEY missing) — skipping notification"
    );
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: parentEmail,
    subject: `New coach note for ${playerName} — Cyclones Baseball`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0A0A0F; color: #E5E7EB; padding: 32px; border-radius: 12px;">
        <h2 style="color: #00FF66; margin-bottom: 4px;">⚾ New Message from Coach ${coachName}</h2>
        <p>Hi ${parentName},</p>
        <p>Coach <strong>${coachName}</strong> has posted a new note for <strong>${playerName}</strong>:</p>
        <blockquote style="border-left: 4px solid #00FF66; padding: 12px 16px; margin: 20px 0; background: #1A1A2E; border-radius: 0 8px 8px 0;">
          ${noteContent.replace(/\n/g, "<br/>")}
        </blockquote>
        <p style="margin-top: 24px;">
          <a href="${portalUrl}" style="background: #00FF66; color: #000; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Open Player Portal
          </a>
        </p>
        <p style="color: #6B7280; font-size: 12px; margin-top: 32px; border-top: 1px solid #1A1A2E; padding-top: 16px;">
          Cyclones U9 Travel Baseball &bull; You're receiving this because you have a player portal account.
        </p>
      </div>
    `,
  });
}
