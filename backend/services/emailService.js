const { Resend } = require('resend');

let resend = null;
try {
  if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
} catch (e) { console.warn('[Email] Resend init failed:', e.message); }

const FROM = 'Freya Santé <noreply@freya-pfe.dz>';
const APP  = process.env.FRONTEND_URL || 'http://localhost:3000';

const html = (title, body) => `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center">
<table width="100%" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden">
  <tr><td style="background:linear-gradient(135deg,#1E3A8A,#2563EB);padding:32px;text-align:center">
    <div style="font-size:28px;font-weight:900;color:#fff">Freya</div>
    <div style="font-size:12px;color:rgba(255,255,255,.7);margin-top:4px">Santé connectée, vie simplifiée</div>
  </td></tr>
  <tr><td style="padding:32px">
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:800">${title}</h2>
    ${body}
  </td></tr>
  <tr><td style="padding:16px 32px 32px;text-align:center;border-top:1px solid #f1f5f9">
    <p style="margin:0;color:#94a3b8;font-size:11px">Freya Santé &mdash; Algérie · Email automatique</p>
  </td></tr>
</table></td></tr></table></body></html>`;

const p   = (t) => `<p style="margin:0 0 12px;color:#475569;font-size:14px;line-height:1.7">${t}</p>`;
const btn = (t, u) => `<div style="margin:24px 0 0;text-align:center"><a href="${u}" style="display:inline-block;background:#2563EB;color:#fff;padding:13px 28px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px">${t}</a></div>`;

const send = async (to, subject, htmlContent) => {
  if (!resend || !to) return;
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, html: htmlContent });
  if (error) {
    console.error('[Email] Resend API error:', JSON.stringify(error));
    throw new Error(error.message || 'Resend API error');
  }
  return data;
};

const sendWelcomePatient = async (email, firstName) => {
  try {
    await send(email, 'Bienvenue sur Freya Santé !', html(
      `Bienvenue, ${firstName} !`,
      p(`Votre compte patient a été créé avec succès sur <strong>Freya Santé</strong>.`) +
      p(`Prenez rendez-vous avec des médecins et des laboratoires, gérez votre dossier médical et suivez vos consultations.`) +
      btn('Accéder à mon espace', `${APP}/patient`)
    ));
  } catch (e) { console.warn('[Email] sendWelcomePatient:', e.message); }
};

const sendWelcomeDoctor = async (email, firstName) => {
  try {
    await send(email, 'Compte médecin créé — Freya Santé', html(
      `Dr. ${firstName}, bienvenue !`,
      p(`Votre compte médecin a été créé avec succès sur <strong>Freya Santé</strong>.`) +
      p(`Complétez votre profil et configurez vos disponibilités pour recevoir des patients.`) +
      btn('Accéder à mon espace', `${APP}/doctor`)
    ));
  } catch (e) { console.warn('[Email] sendWelcomeDoctor:', e.message); }
};

const sendWelcomeLab = async (email, labName) => {
  try {
    await send(email, 'Compte laboratoire créé — Freya Santé', html(
      `Bienvenue, ${labName} !`,
      p(`Votre compte laboratoire a été créé avec succès sur <strong>Freya Santé</strong>.`) +
      p(`Configurez vos disponibilités pour commencer à recevoir des rendez-vous de patients.`) +
      btn('Accéder à mon espace', `${APP}/labo`)
    ));
  } catch (e) { console.warn('[Email] sendWelcomeLab:', e.message); }
};

module.exports = { sendWelcomePatient, sendWelcomeDoctor, sendWelcomeLab };
