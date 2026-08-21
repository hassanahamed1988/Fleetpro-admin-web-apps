import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';

// Secret encryption key for server-side TOTP secret storage
const ENCRYPTION_KEY = 'fleetpro-secure-totp-encryption-key-32-chars';

/**
 * Hash password securely using bcrypt
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * Verify plaintext password against stored bcrypt hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  if (!hash) return false;
  // Fallback check for initial unhashed mock strings if any
  if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$')) {
    return password === hash;
  }
  return bcrypt.compareSync(password, hash);
}

/**
 * Simple reversible obfuscation/encryption for local storage / backend TOTP secrets
 */
export function encryptSecret(secret: string): string {
  try {
    const textBytes = new TextEncoder().encode(secret);
    const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
    const encrypted = textBytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
    return btoa(String.fromCharCode(...encrypted));
  } catch (e) {
    return secret;
  }
}

/**
 * Decrypt obfuscated TOTP secret
 */
export function decryptSecret(encryptedSecret: string): string {
  try {
    const raw = atob(encryptedSecret);
    const textBytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      textBytes[i] = raw.charCodeAt(i);
    }
    const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
    const decrypted = textBytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return encryptedSecret;
  }
}

/**
 * Create a new TOTP secret for a user
 */
export function createTotpSecret(): string {
  const secret = new OTPAuth.Secret({ size: 20 });
  return secret.base32;
}

/**
 * Generate Google Authenticator URI for a user
 */
export function getTotpUri(secretBase32: string, userEmail: string): string {
  const totp = new OTPAuth.TOTP({
    issuer: 'FleetPro Management',
    label: userEmail || 'Admin',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  });
  return totp.toString();
}

/**
 * Generate Data URL QR code image from TOTP URI
 */
export async function generateQrCodeDataUrl(uri: string): Promise<string> {
  return await QRCode.toDataURL(uri, {
    width: 200,
    margin: 1,
    color: {
      dark: '#18181b',
      light: '#ffffff',
    },
  });
}

/**
 * Verify TOTP 6-digit code against secret
 */
export function verifyTotpToken(secretBase32: string, token: string): boolean {
  try {
    const cleanToken = token.replace(/\s+/g, '').trim();
    if (cleanToken.length !== 6) return false;

    const totp = new OTPAuth.TOTP({
      issuer: 'FleetPro Management',
      label: 'Admin',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });

    const delta = totp.validate({ token: cleanToken, window: 1 });
    return delta !== null;
  } catch (err) {
    console.error('TOTP verification error:', err);
    return false;
  }
}
