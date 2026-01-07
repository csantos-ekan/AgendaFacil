import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailParams {
  to: string[];
  subject: string;
  html: string;
}

interface ReservationEmailData {
  organizerName: string;
  roomName: string;
  roomLocation: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: string[];
}

function getEmailConfig(): EmailConfig | null {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');

  if (!user || !pass) {
    console.warn('SMTP credentials not configured. Email sending disabled.');
    return null;
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  };
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function buildReservationEmailHtml(data: ReservationEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3B82F6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
        .info-row { margin: 12px 0; }
        .label { font-weight: bold; color: #374151; }
        .value { color: #1f2937; }
        .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">Convite para Reunião</h2>
        </div>
        <div class="content">
          <p>Você foi convidado(a) para uma reunião por <strong>${data.organizerName}</strong>.</p>
          
          <div class="info-row">
            <span class="label">Sala:</span>
            <span class="value">${data.roomName}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Local:</span>
            <span class="value">${data.roomLocation}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Data:</span>
            <span class="value">${formatDate(data.date)}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Horário:</span>
            <span class="value">${data.startTime} às ${data.endTime}</span>
          </div>
          
          <div class="footer">
            <p>Este é um e-mail automático do sistema RoomBooker Corporate.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendReservationEmail(data: ReservationEmailData): Promise<boolean> {
  const config = getEmailConfig();
  
  if (!config) {
    console.log('Email sending skipped: SMTP not configured');
    return false;
  }

  if (!data.participants || data.participants.length === 0) {
    console.log('No participants to send email to');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport(config);

    const emailParams: EmailParams = {
      to: data.participants,
      subject: `Convite para reunião – ${data.roomName}`,
      html: buildReservationEmailHtml(data)
    };

    await transporter.sendMail({
      from: config.auth.user,
      to: emailParams.to.join(', '),
      subject: emailParams.subject,
      html: emailParams.html
    });

    console.log(`Reservation email sent successfully to: ${data.participants.join(', ')}`);
    return true;
  } catch (error) {
    console.error('Error sending reservation email:', error);
    return false;
  }
}

export function parseParticipantEmails(emailString: string): string[] {
  if (!emailString || emailString.trim() === '') {
    return [];
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailString
    .split(',')
    .map(email => email.trim())
    .filter(email => email.length > 0 && emailRegex.test(email));
}
