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
            <h1>🌳 Επιβεβαίωση Υιοθεσίας Δέντρου!</h1>
          </div>
          <div class="content">
            <p>Αγαπητέ/ή ${userName},</p>

            <p>Συγχαρητήρια! Υιοθέτησες επιτυχώς ένα δέντρο μέσω του προγράμματος Υιοθέτησε ένα Δέντρο.</p>

            <div class="tree-info">
              <h3>Λεπτομέρειες Δέντρου:</h3>
              <p><strong>Ετικέτα:</strong> ${treeLabel}</p>
              <p><strong>Τοποθεσία:</strong> ${latitude.toFixed(6)}, ${longitude.toFixed(6)}</p>
            </div>

            <p><strong>Οι Υποχρεώσεις Σου:</strong></p>
            <ul>
              <li>Πότισε το δέντρο σου τακτικά, ειδικά κατά τις ξηρές περιόδους</li>
              <li>Παρακολούθησε την υγεία του δέντρου και ανάφερε τυχόν προβλήματα</li>
              <li>Κράτησε την περιοχή γύρω από το δέντρο καθαρή</li>
              <li>Γίνε πρεσβευτής των δέντρων και ενθάρρυνε άλλους να συμμετάσχουν!</li>
            </ul>

            <p style="text-align: center;">
              <a href="${treeUrl}" class="button">Δες τα Δέντρα Σου</a>
              <a href="${mapUrl}" class="button">Προβολή στο Google Maps</a>
            </p>

            <p>Ευχαριστούμε που συμβάλλεις σε μια πιο πράσινη Θέρμη Θεσσαλονίκης!</p>

            <div class="footer">
              <p>Αυτό είναι ένα αυτόματο μήνυμα από το Υιοθέτησε ένα Δέντρο</p>
              <p>Για οποιαδήποτε ερώτηση, επικοινώνησε μαζί μας.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Υιοθέτησε ένα Δέντρο <onboarding@resend.dev>',
      to: userEmail,
      subject: `Επιβεβαίωση Υιοθεσίας: ${treeLabel}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
