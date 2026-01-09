import crypto from 'crypto';

const RAW_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ENCRYPTION_KEY = crypto.createHash('sha256').update(RAW_KEY).digest();
const ALGORITHM = 'aes-256-gcm';

export function encryptCPF(cpf: string): string {
  if (!cpf) return '';
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM, 
    ENCRYPTION_KEY, 
    iv
  );
  
  let encrypted = cipher.update(cpf, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decryptCPF(encryptedCPF: string): string {
  if (!encryptedCPF) return '';
  
  try {
    const parts = encryptedCPF.split(':');
    if (parts.length !== 3) return '';
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      ENCRYPTION_KEY, 
      iv
    );
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting CPF:', error);
    return '';
  }
}
