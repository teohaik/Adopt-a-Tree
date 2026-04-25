import { Resend } from 'resend';
import { translations, Language } from './i18n/translations';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(
  userEmail: string,
  userName: string,
  treeLabel: string,
  latitude: number,
  longitude: number,
  pinId: number,
  lang: Language = 'el'
) {
  const t = translations[lang];
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const treeUrl = `${appUrl}/?email=${encodeURIComponent(userEmail)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #16a34a;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .tree-info {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #16a34a;
          }
          .button {
            display: inline-block;
            background-color: #16a34a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 5px;
          }
          .footer {
            text-align: center;
            color: #6b7280;
            font-size: 14px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${t.emailTitle}</h1>
          </div>
          <div class="content">
            <p>${t.emailGreeting(userName)}</p>

            <p>${t.emailCongrats}</p>

            <div class="tree-info">
              <h3>${t.emailDetailsTitle}</h3>
              <p><strong>${t.emailLabelField}</strong> ${treeLabel}</p>
              <p><strong>${t.emailLocationField}</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
            </div>

            <p><strong>${t.emailResponsibilitiesTitle}</strong></p>
            <ul>
              <li>${t.emailResp1}</li>
              <li>${t.emailResp2}</li>
              <li>${t.emailResp3}</li>
              <li>${t.emailResp4}</li>
            </ul>

            <p style="text-align: center;">
              <a href="${treeUrl}" class="button">${t.emailViewTrees}</a>
              <a href="${mapUrl}" class="button">${t.emailViewMaps}</a>
              <a href="https://mytree.epi-thermi.gr/guide" class="button">${t.emailWateringGuide}</a>
            </p>

            <p>${t.emailThankYou}</p>

            <div class="footer">
              <p>${t.emailFooter}</p>
              <p>${t.emailFooterContact}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || `${t.emailFromName} <onboarding@resend.dev>`,
      to: userEmail,
      subject: t.emailSubject(treeLabel),
      html: htmlContent,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}

export async function sendRejectionEmail(
  userEmail: string,
  userName: string,
  treeLabel: string,
  reason: string,
  lang: Language = 'el'
) {
  const t = translations[lang];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .reason-box { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${t.emailRejectionTitle}</h1>
          </div>
          <div class="content">
            <p>${t.emailGreeting(userName)}</p>
            <p>${t.emailRejectionBody}</p>
            <div class="reason-box">
              <p><strong>${t.emailRejectionReasonTitle}</strong></p>
              <p>${reason}</p>
            </div>
            <p>${t.emailRejectionClosing}</p>
            <div class="footer">
              <p>${t.emailFooter}</p>
              <p>${t.emailFooterContact}</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || `${t.emailFromName} <onboarding@resend.dev>`,
      to: userEmail,
      subject: t.emailRejectionSubject(treeLabel),
      html: htmlContent,
    });
  } catch (error) {
    console.error('Failed to send rejection email:', error);
    throw error;
  }
}
