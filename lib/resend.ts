import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");
const FROM = process.env.RESEND_FROM_EMAIL || "campus@yourdomain.com";

export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to Campus!",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#6366f1;">Welcome, ${name}!</h1>
        <p>Your Campus account is ready. Start exploring:</p>
        <ul>
          <li>Join your university classes</li>
          <li>Connect with clubs</li>
          <li>Share projects and earn XP</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Go to Dashboard
        </a>
      </div>
    `,
  });
}

export async function sendAssignmentDueReminder(
  to: string,
  name: string,
  assignmentTitle: string,
  className: string,
  dueDate: string,
  classId: string,
  assignmentId: string
) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `"${assignmentTitle}" is due soon`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Hi ${name},</h2>
        <p>Your assignment <strong>"${assignmentTitle}"</strong> in <strong>${className}</strong> is due on <strong>${dueDate}</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/classes/${classId}/assignments/${assignmentId}"
           style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
          View Assignment
        </a>
      </div>
    `,
  });
}

export async function sendWeeklyDigest(data: {
  to: string;
  name: string;
  xp: number;
  rank: string;
  streak: number;
  topPostTitle?: string;
  topPostId?: string;
}) {
  await resend.emails.send({
    from: FROM,
    to: data.to,
    subject: "Your Campus Weekly Digest",
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h1 style="color:#6366f1;">Weekly Digest</h1>
        <p>Hi ${data.name}, here's your week on Campus:</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>XP</strong></td><td>${data.xp.toLocaleString()}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Rank</strong></td><td>${data.rank}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;"><strong>Streak</strong></td><td>${data.streak} days</td></tr>
        </table>
        ${
          data.topPostTitle
            ? `<p style="margin-top:16px;">Top post this week: <a href="${process.env.NEXT_PUBLIC_APP_URL}/forum/${data.topPostId}">${data.topPostTitle}</a></p>`
            : ""
        }
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display:inline-block;margin-top:16px;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Open Campus
        </a>
      </div>
    `,
  });
}
