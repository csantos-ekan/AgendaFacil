import { google } from 'googleapis';

interface CalendarEventData {
  organizerName: string;
  organizerEmail: string;
  roomName: string;
  roomLocation: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: string[];
}

function getCalendarAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('Google Calendar credentials not configured. Calendar integration disabled.');
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'https://developers.google.com/oauthplayground'
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  return oauth2Client;
}

function buildDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

export async function createCalendarEvent(data: CalendarEventData): Promise<boolean> {
  const auth = getCalendarAuth();
  
  if (!auth) {
    console.log('Calendar event creation skipped: Google Calendar not configured');
    return false;
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });

    const attendees = data.participants.map(email => ({
      email,
      responseStatus: 'needsAction'
    }));

    const event = {
      summary: `Reunião – ${data.roomName}`,
      location: data.roomLocation,
      description: `Sala: ${data.roomName}\nLocal: ${data.roomLocation}\nOrganizador: ${data.organizerName}`,
      start: {
        dateTime: buildDateTime(data.date, data.startTime),
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: buildDateTime(data.date, data.endTime),
        timeZone: 'America/Sao_Paulo'
      },
      attendees,
      reminders: {
        useDefault: true
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all'
    });

    console.log(`Calendar event created successfully: ${response.data.id}`);
    return true;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return false;
  }
}
