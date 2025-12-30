const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmailAlert({ to, subject, body }) {
  await transporter.sendMail({
    from: `"Uptime Monitor" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: body
  });
}

module.exports = { sendEmailAlert };