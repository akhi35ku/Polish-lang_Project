const nodemailer = require('nodemailer');
const { env } = require('./env');

let transporter;

if (env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE, // true for 465, false for 587 (STARTTLS)
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
} else {
  // Development fallback: emails are printed to the server console instead of sent,
  // so the whole flow (welcome email, OTP) works without SMTP credentials.
  transporter = nodemailer.createTransport({ jsonTransport: true });
  console.warn('⚠️  SMTP_HOST not set — emails will be logged to the console (dev mode).');
}

async function sendMail({ to, subject, html, text }) {
  const info = await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html, text });
  if (!env.SMTP_HOST) {
    const parsed = JSON.parse(info.message);
    console.log('\n📧 ──────── EMAIL (dev console transport) ────────');
    console.log(`To:      ${parsed.to?.[0]?.address || to}`);
    console.log(`Subject: ${parsed.subject}`);
    console.log(`Text:    ${parsed.text}`);
    console.log('──────────────────────────────────────────────────\n');
  }
  return info;
}

module.exports = { sendMail };
