const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter;

function getTransporter() {
  if (!transporter && env.smtp.host) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined
    });
  }
  return transporter;
}

/** Envoie un email. Sans SMTP configuré (dev), l'email est affiché dans la console. */
async function sendMail({ to, subject, text }) {
  const t = getTransporter();
  if (!t) {
    if (!env.isTest) console.log(`[mail non envoyé, SMTP absent] À: ${to} | ${subject}\n${text}`);
    return { simulated: true };
  }
  return t.sendMail({ from: env.smtp.from, to, subject, text });
}

module.exports = { sendMail };
