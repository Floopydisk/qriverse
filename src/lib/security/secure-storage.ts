
import { encryptionManager, EncryptedField } from './encryption';

// Secure storage utilities for sensitive data
export class SecureStorage {
  private static readonly STORAGE_PREFIX = 'sec_';
  private static readonly ENCRYPTION_KEY_NAME = 'storage_master_key';

  // Initialize secure storage
  static async initialize(masterPassword?: string): Promise<boolean> {
    try {
      let key: CryptoKey;
      
      if (masterPassword) {
        const salt = encryptionManager.generateSalt();
        key = await encryptionManager.deriveKeyFromPassword(masterPassword, salt);
        localStorage.setItem(`${this.STORAGE_PREFIX}salt`, this.arrayBufferToBase64(salt));
      } else {
        key = await encryptionManager.generateKey();
      }

      await encryptionManager.storeKey(this.ENCRYPTION_KEY_NAME, key);
      return true;
    } catch (error) {
      console.error('Failed to initialize secure storage:', error);
      return false;
    }
  }

  // Store encrypted data
  static async setItem(key: string, value: any): Promise<boolean> {
    try {
      const encryptionKey = await encryptionManager.retrieveKey(this.ENCRYPTION_KEY_NAME);
      if (!encryptionKey) {
        throw new Error('Secure storage not initialized');
      }

      const serializedValue = JSON.stringify(value);
      const encrypted = await encryptionManager.encrypt(serializedValue, encryptionKey);
      
      const storageData: EncryptedField = {
        data: encrypted.encryptedData,
        iv: encrypted.iv,
      };

      localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, JSON.stringify(storageData));
      return true;
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return false;
    }
  }

  // Retrieve and decrypt data
  static async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const encryptionKey = await encryptionManager.retrieveKey(this.ENCRYPTION_KEY_NAME);
      if (!encryptionKey) {
        console.warn('Secure storage not initialized');
        return null;
      }

      const storedData = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      if (!storedData) return null;

      const encryptedField: EncryptedField = JSON.parse(storedData);
      const decryptedValue = await encryptionManager.decrypt(
        encryptedField.data,
        encryptedField.iv,
        encryptionKey
      );

      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  }

  // Remove encrypted data
  static removeItem(key: string): void {
    localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
  }

  // Clear all secure storage
  static clear(): void {
    const keysToRemove = Object.keys(localStorage).filter(key => 
      key.startsWith(this.STORAGE_PREFIX)
    );
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    encryptionManager.clearStoredKeys();
  }

  // Check if secure storage is initialized
  static async isInitialized(): Promise<boolean> {
    const key = await encryptionManager.retrieveKey(this.ENCRYPTION_KEY_NAME);
    return key !== null;
  }

  // Utility methods
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

// Session storage alternative for temporary secure data
export class SecureSessionStorage {
  private static readonly SESSION_PREFIX = 'sec_session_';
  private static sessionKey: CryptoKey | null = null;

  // Initialize session storage with a temporary key
  static async initialize(): Promise<boolean> {
    try {
      this.sessionKey = await encryptionManager.generateKey();
      return true;
    } catch (error) {
      console.error('Failed to initialize secure session storage:', error);
      return false;
    }
  }

  // Store encrypted data in session storage
  static async setItem(key: string, value: any): Promise<boolean> {
    try {
      if (!this.sessionKey) {
        await this.initialize();
      }

      if (!this.sessionKey) {
        throw new Error('Session storage not initialized');
      }

      const serializedValue = JSON.stringify(value);
      const encrypted = await encryptionManager.encrypt(serializedValue, this.sessionKey);
      
      const storageData: EncryptedField = {
        data: encrypted.encryptedData,
        iv: encrypted.iv,
      };

      sessionStorage.setItem(`${this.SESSION_PREFIX}${key}`, JSON.stringify(storageData));
      return true;
    } catch (error) {
      console.error('Failed to store encrypted session data:', error);
      return false;
    }
  }

  // Retrieve and decrypt session data
  static async getItem<T = any>(key: string): Promise<T | null> {
    try {
      if (!this.sessionKey) {
        return null;
      }

      const storedData = sessionStorage.getItem(`${this.SESSION_PREFIX}${key}`);
      if (!storedData) return null;

      const encryptedField: EncryptedField = JSON.parse(storedData);
      const decryptedValue = await encryptionManager.decrypt(
        encryptedField.data,
        encryptedField.iv,
        this.sessionKey
      );

      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Failed to retrieve encrypted session data:', error);
      return null;
    }
  }

  // Remove session data
  static removeItem(key: string): void {
    sessionStorage.removeItem(`${this.SESSION_PREFIX}${key}`);
  }

  // Clear all secure session storage
  static clear(): void {
    const keysToRemove = Object.keys(sessionStorage).filter(key => 
      key.startsWith(this.SESSION_PREFIX)
    );
    
    keysToRemove.forEach(key => sessionStorage.removeItem(key));
    this.sessionKey = null;
  }
}
