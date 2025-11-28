import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail(
  userEmail: string,
  userName: string,
  treeLabel: string,
  latitude: number,
  longitude: number,
  pinId: number
) {
  const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const treeUrl = `${appUrl}/?pin=${pinId}`;

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
            <h1>🌳 Tree Adoption Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${userName},</p>

            <p>Congratulations! You have successfully adopted a tree through the Adopt a Tree program.</p>

            <div class="tree-info">
              <h3>Your Tree Details:</h3>
              <p><strong>Label:</strong> ${treeLabel}</p>
              <p><strong>Location:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
            </div>

            <p><strong>Your Responsibilities:</strong></p>
            <ul>
              <li>Water your tree regularly, especially during dry periods</li>
              <li>Monitor the tree's health and report any issues</li>
              <li>Keep the area around the tree clean</li>
              <li>Be a champion for your tree and encourage others to adopt!</li>
            </ul>

            <p style="text-align: center;">
              <a href="${treeUrl}" class="button">View in App</a>
              <a href="${mapUrl}" class="button">View on Google Maps</a>
            </p>

            <p>Thank you for contributing to a greener Thermi, Thessaloniki!</p>

            <div class="footer">
              <p>This is an automated message from Adopt a Tree</p>
              <p>If you have any questions, please contact us.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Adopt a Tree <onboarding@resend.dev>',
      to: userEmail,
      subject: `Tree Adoption Confirmed: ${treeLabel}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
