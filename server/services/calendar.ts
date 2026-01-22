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
  title?: string;
  description?: string;
}

interface CalendarTestResult {
  success: boolean;
  message: string;
  details?: any;
  error?: string;
}

function getCalendarAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  console.log('[Calendar Auth] Checking credentials...');
  console.log('[Calendar Auth] GOOGLE_CLIENT_ID:', clientId ? `Set (${clientId.substring(0, 20)}...)` : 'NOT SET');
  console.log('[Calendar Auth] GOOGLE_CLIENT_SECRET:', clientSecret ? `Set (${clientSecret.length} chars)` : 'NOT SET');
  console.log('[Calendar Auth] GOOGLE_REFRESH_TOKEN:', refreshToken ? `Set (${refreshToken.substring(0, 20)}...)` : 'NOT SET');

  if (!clientId || !clientSecret || !refreshToken) {
    console.warn('[Calendar Auth] Google Calendar credentials not configured. Calendar integration disabled.');
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

  console.log('[Calendar Auth] OAuth2 client created successfully');
  return oauth2Client;
}

export async function testCalendarConnection(): Promise<CalendarTestResult> {
  console.log('[Calendar Test] Starting connection test...');
  
  const auth = getCalendarAuth();
  
  if (!auth) {
    return {
      success: false,
      message: 'Credenciais do Google Calendar não configuradas',
      error: 'Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET or GOOGLE_REFRESH_TOKEN'
    };
  }

  try {
    console.log('[Calendar Test] Testing authentication...');
    const calendar = google.calendar({ version: 'v3', auth });
    
    console.log('[Calendar Test] Fetching calendar list...');
    const calendarList = await calendar.calendarList.list();
    
    console.log('[Calendar Test] Calendar list fetched successfully');
    console.log('[Calendar Test] Number of calendars:', calendarList.data.items?.length || 0);

    const now = new Date();
    const startTime = new Date(now.getTime() + 60 * 60 * 1000);
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const testEvent = {
      summary: '[TESTE] Evento de Teste - RoomBooker',
      description: 'Este é um evento de teste para verificar a integração com o Google Calendar. Pode ser excluído.',
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      attendees: [],
      reminders: {
        useDefault: false,
        overrides: []
      }
    };

    console.log('[Calendar Test] Creating test event...');
    console.log('[Calendar Test] Event details:', JSON.stringify(testEvent, null, 2));

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: testEvent,
      sendUpdates: 'none'
    });

    console.log('[Calendar Test] Event created successfully!');
    console.log('[Calendar Test] Event ID:', response.data.id);
    console.log('[Calendar Test] Event link:', response.data.htmlLink);

    if (response.data.id) {
      console.log('[Calendar Test] Deleting test event...');
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: response.data.id
      });
      console.log('[Calendar Test] Test event deleted');
    }

    return {
      success: true,
      message: 'Conexão com Google Calendar funcionando corretamente!',
      details: {
        calendarsFound: calendarList.data.items?.length || 0,
        primaryCalendar: calendarList.data.items?.find(c => c.primary)?.summary || 'N/A',
        testEventCreated: true,
        testEventDeleted: true
      }
    };
  } catch (error: any) {
    console.error('[Calendar Test] ERROR:', error.message);
    console.error('[Calendar Test] Full error:', JSON.stringify(error, null, 2));
    
    let errorMessage = error.message || 'Erro desconhecido';
    
    if (error.code === 401) {
      errorMessage = 'Token de autenticação inválido ou expirado. Gere um novo refresh token no OAuth Playground.';
    } else if (error.code === 403) {
      errorMessage = 'Acesso negado. Verifique se a API do Google Calendar está habilitada no Google Cloud Console e se os escopos OAuth estão corretos.';
    } else if (error.code === 400) {
      errorMessage = 'Requisição inválida. Verifique as credenciais OAuth.';
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error.message,
      details: {
        code: error.code,
        errors: error.errors
      }
    };
  }
}

function buildDateTime(date: string, time: string): string {
  return `${date}T${time}:00`;
}

export async function createCalendarEvent(data: CalendarEventData): Promise<string | null> {
  const auth = getCalendarAuth();
  
  if (!auth) {
    console.log('Calendar event creation skipped: Google Calendar not configured');
    return null;
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });

    const attendees = data.participants.map(email => ({
      email,
      responseStatus: 'needsAction'
    }));

    const eventTitle = data.title || `Reunião – ${data.roomName}`;
    const eventDescription = data.description 
      ? `${data.description}\n\nSala: ${data.roomName}\nLocal: ${data.roomLocation}\nOrganizador: ${data.organizerName}`
      : `Sala: ${data.roomName}\nLocal: ${data.roomLocation}\nOrganizador: ${data.organizerName}`;

    const event = {
      summary: eventTitle,
      location: data.roomLocation,
      description: eventDescription,
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
    return response.data.id || null;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
}

interface RecurringCalendarEventData {
  organizerName: string;
  organizerEmail: string;
  roomName: string;
  roomLocation: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  participants: string[];
  title?: string;
  description?: string;
  recurrenceRule: {
    repeatEvery: number;
    repeatPeriod: 'day' | 'week' | 'month' | 'year';
    weekDays?: number[];
  };
}

function buildRRule(recurrenceRule: RecurringCalendarEventData['recurrenceRule'], endDate: string): string {
  const freqMap: Record<string, string> = {
    'day': 'DAILY',
    'week': 'WEEKLY',
    'month': 'MONTHLY',
    'year': 'YEARLY'
  };
  
  const freq = freqMap[recurrenceRule.repeatPeriod];
  const interval = recurrenceRule.repeatEvery;
  
  const untilDate = endDate.replace(/-/g, '') + 'T235959Z';
  
  let rrule = `RRULE:FREQ=${freq};INTERVAL=${interval};UNTIL=${untilDate}`;
  
  if (recurrenceRule.repeatPeriod === 'week' && recurrenceRule.weekDays && recurrenceRule.weekDays.length > 0) {
    const dayMap: Record<number, string> = {
      0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA'
    };
    const byDay = recurrenceRule.weekDays.map(d => dayMap[d]).join(',');
    rrule += `;BYDAY=${byDay}`;
  }
  
  return rrule;
}

export async function createRecurringCalendarEvent(data: RecurringCalendarEventData): Promise<string | null> {
  const auth = getCalendarAuth();
  
  if (!auth) {
    console.log('Recurring calendar event creation skipped: Google Calendar not configured');
    return null;
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });

    const attendees = data.participants.map(email => ({
      email,
      responseStatus: 'needsAction'
    }));

    const eventTitle = data.title || `Reunião – ${data.roomName}`;
    const eventDescription = data.description 
      ? `${data.description}\n\nSala: ${data.roomName}\nLocal: ${data.roomLocation}\nOrganizador: ${data.organizerName}`
      : `Sala: ${data.roomName}\nLocal: ${data.roomLocation}\nOrganizador: ${data.organizerName}`;

    const rrule = buildRRule(data.recurrenceRule, data.endDate);
    console.log('[Calendar] Generated RRULE:', rrule);

    const event = {
      summary: eventTitle,
      location: data.roomLocation,
      description: eventDescription,
      start: {
        dateTime: buildDateTime(data.startDate, data.startTime),
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: buildDateTime(data.startDate, data.endTime),
        timeZone: 'America/Sao_Paulo'
      },
      recurrence: [rrule],
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

    console.log(`Recurring calendar event created successfully: ${response.data.id}`);
    return response.data.id || null;
  } catch (error) {
    console.error('Error creating recurring calendar event:', error);
    return null;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const auth = getCalendarAuth();
  
  if (!auth) {
    console.log('Calendar event deletion skipped: Google Calendar not configured');
    return false;
  }

  try {
    const calendar = google.calendar({ version: 'v3', auth });
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
      sendUpdates: 'all'
    });

    console.log(`Calendar event deleted successfully: ${eventId}`);
    return true;
  } catch (error: any) {
    if (error.code === 404 || error.code === 410) {
      console.log(`Calendar event not found (may have been already deleted): ${eventId}`);
      return true;
    }
    console.error('Error deleting calendar event:', error);
    return false;
  }
}
