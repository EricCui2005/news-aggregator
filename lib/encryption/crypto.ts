import CryptoJS from 'crypto-js';

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET!;

export function encryptApiKey(apiKey: string): string {
  if (!ENCRYPTION_SECRET) {
    throw new Error('ENCRYPTION_SECRET not configured');
  }
  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_SECRET).toString();
}

export function decryptApiKey(encryptedApiKey: string): string {
  if (!ENCRYPTION_SECRET) {
    throw new Error('ENCRYPTION_SECRET not configured');
  }
  const bytes = CryptoJS.AES.decrypt(encryptedApiKey, ENCRYPTION_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}
