import { OAuth2Client } from 'google-auth-library';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

const ALLOWED_DOMAIN = 'ekan.com.br';
const ADMIN_EMAIL = 'tmotta@ekan.com.br';

function getRedirectUri(): string {
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000';
  const protocol = domain.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${domain}/api/auth/google/callback`;
}

export function getOAuth2Client(): OAuth2Client {
  return new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    getRedirectUri()
  );
}

export function getGoogleAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'select_account',
    hd: ALLOWED_DOMAIN,
  });
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
  hd?: string;
}

export async function getGoogleUserInfo(code: string): Promise<GoogleUserInfo> {
  const oauth2Client = getOAuth2Client();
  
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token!,
    audience: GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  
  if (!payload) {
    throw new Error('Não foi possível obter informações do usuário');
  }
  
  return {
    email: payload.email!,
    name: payload.name || payload.email!.split('@')[0],
    picture: payload.picture,
    hd: payload.hd,
  };
}

export function validateDomain(email: string): boolean {
  const domain = email.split('@')[1];
  return domain === ALLOWED_DOMAIN;
}

export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function getCallbackUrl(): string {
  return getRedirectUri();
}
