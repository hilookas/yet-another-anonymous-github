import CryptoJS from 'crypto-js';

// Encryption key - should use environment variables in production
const SECRET_KEY = process.env.CRYPTO_SECRET_KEY || 'your-secret-key-here';

export interface GitHubConfig {
  type: 'gh';
  repo: string;
  branch: string;
  anonymizeTerms: string[];
}

function toUrlSafeBase64(str: string): string {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafeBase64(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding = signs
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return base64;
}

export function encryptConfig(config: GitHubConfig): string {
  const jsonString = JSON.stringify(config);
  const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  return toUrlSafeBase64(encrypted);
}

export function decryptConfig(encryptedString: string): GitHubConfig | null {
  try {
    const base64 = fromUrlSafeBase64(encryptedString);
    const decrypted = CryptoJS.AES.decrypt(base64, SECRET_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    const config = JSON.parse(jsonString) as GitHubConfig;
    // Validate config format
    if (config.type !== 'gh' || !config.repo || !config.branch || !Array.isArray(config.anonymizeTerms)) {
      return null;
    }
    return config;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

export function anonymizeContent(content: string, terms: string[]): string {
  let anonymizedContent = content;
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<![\\w])${escapedTerm}(?![\\w])`, 'gi');
    anonymizedContent = anonymizedContent.replace(regex, `XXXX-${i + 1}`);
  }
  return anonymizedContent;
} 