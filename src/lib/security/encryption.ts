
import { supabase } from '@/integrations/supabase/client';

// Encryption utilities for client-side data protection
class EncryptionManager {
  private readonly algorithm = 'AES-GCM';
  private readonly keyLength = 256;
  private readonly ivLength = 12; // 96 bits for GCM

  // Generate a cryptographic key
  async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  // Derive key from password using PBKDF2
  async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // OWASP recommended minimum
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false, // not extractable
      ['encrypt', 'decrypt']
    );
  }

  // Generate random salt
  generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(16));
  }

  // Generate random IV
  generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.ivLength));
  }

  // Encrypt data
  async encrypt(data: string, key: CryptoKey): Promise<{
    encryptedData: string;
    iv: string;
  }> {
    const encoder = new TextEncoder();
    const iv = this.generateIV();
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      encoder.encode(data)
    );

    return {
      encryptedData: this.arrayBufferToBase64(encryptedBuffer),
      iv: this.arrayBufferToBase64(iv),
    };
  }

  // Decrypt data
  async decrypt(encryptedData: string, iv: string, key: CryptoKey): Promise<string> {
    const decoder = new TextDecoder();
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: this.base64ToArrayBuffer(iv),
      },
      key,
      this.base64ToArrayBuffer(encryptedData)
    );

    return decoder.decode(decryptedBuffer);
  }

  // Convert ArrayBuffer to Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Convert Base64 to ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Key storage utilities (using IndexedDB for security)
  async storeKey(keyName: string, key: CryptoKey): Promise<void> {
    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    localStorage.setItem(`enc_key_${keyName}`, JSON.stringify(exportedKey));
  }

  async retrieveKey(keyName: string): Promise<CryptoKey | null> {
    const storedKey = localStorage.getItem(`enc_key_${keyName}`);
    if (!storedKey) return null;

    try {
      const keyData = JSON.parse(storedKey);
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: this.algorithm },
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.error('Failed to retrieve encryption key:', error);
      return null;
    }
  }

  // Clear all stored keys
  clearStoredKeys(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('enc_key_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const encryptionManager = new EncryptionManager();

// PII Field encryption utilities
export interface EncryptedField {
  data: string;
  iv: string;
  salt?: string;
}

export class PIIEncryption {
  private static readonly PII_KEY_NAME = 'pii_master_key';

  // Initialize PII encryption for a user session
  static async initializePIIEncryption(userPassword: string): Promise<boolean> {
    try {
      const salt = encryptionManager.generateSalt();
      const key = await encryptionManager.deriveKeyFromPassword(userPassword, salt);
      
      await encryptionManager.storeKey(this.PII_KEY_NAME, key);
      localStorage.setItem('pii_salt', encryptionManager.arrayBufferToBase64(salt));
      
      return true;
    } catch (error) {
      console.error('Failed to initialize PII encryption:', error);
      return false;
    }
  }

  // Encrypt PII field
  static async encryptPIIField(value: string): Promise<EncryptedField | null> {
    try {
      const key = await encryptionManager.retrieveKey(this.PII_KEY_NAME);
      if (!key) throw new Error('PII encryption key not found');

      const result = await encryptionManager.encrypt(value, key);
      return {
        data: result.encryptedData,
        iv: result.iv,
      };
    } catch (error) {
      console.error('Failed to encrypt PII field:', error);
      return null;
    }
  }

  // Decrypt PII field
  static async decryptPIIField(encryptedField: EncryptedField): Promise<string | null> {
    try {
      const key = await encryptionManager.retrieveKey(this.PII_KEY_NAME);
      if (!key) throw new Error('PII encryption key not found');

      return await encryptionManager.decrypt(encryptedField.data, encryptedField.iv, key);
    } catch (error) {
      console.error('Failed to decrypt PII field:', error);
      return null;
    }
  }

  // Clear PII encryption data
  static clearPIIEncryption(): void {
    localStorage.removeItem(`enc_key_${this.PII_KEY_NAME}`);
    localStorage.removeItem('pii_salt');
  }
}
