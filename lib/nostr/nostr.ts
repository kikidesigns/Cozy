import { getPublicKey, nip19 } from 'nostr-tools';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex } from '@noble/hashes/utils';
import * as bip39 from 'bip39';

export interface NostrKeys {
  privateKey: string;
  publicKey: string;
  npub: string;
  nsec: string;
  mnemonic?: string;
}

/**
 * Service for interacting with the Nostr network
 */
export class Nostr {
  constructor() {
    console.log('Nostr service initialized');
  }

  /**
   * Generates a new key pair with mnemonic
   */
  async generateNewKeys(): Promise<NostrKeys> {
    try {
      // Generate mnemonic (12 words = 128 bits)
      const mnemonic = bip39.generateMnemonic(128);
      
      // Hash the mnemonic to get a 32-byte private key
      const hash = sha256(mnemonic);
      const privateKey = bytesToHex(hash);

      // Get public key using nostr-tools
      const publicKey = getPublicKey(privateKey);

      // Convert to bech32 format
      const npub = nip19.npubEncode(publicKey);
      const nsec = nip19.nsecEncode(privateKey);

      return {
        privateKey,
        publicKey,
        npub,
        nsec,
        mnemonic
      };
    } catch (error) {
      console.error('[Nostr] Failed to generate keys:', error);
      throw error;
    }
  }

  /**
   * Derives Nostr keys from a private key (nsec)
   */
  async deriveKeysFromNsec(nsec: string): Promise<NostrKeys> {
    try {
      // Decode nsec to get private key
      const { type, data: privateKey } = nip19.decode(nsec);
      if (type !== 'nsec') throw new Error('Invalid nsec key');

      // Get public key using nostr-tools
      const publicKey = getPublicKey(privateKey as string);

      // Convert to bech32 format
      const npub = nip19.npubEncode(publicKey);

      return {
        privateKey: privateKey as string,
        publicKey,
        npub,
        nsec
      };
    } catch (error) {
      console.error('[Nostr] Failed to derive keys:', error);
      throw error;
    }
  }

  /**
   * Derives Nostr keys from a mnemonic
   */
  async deriveKeysFromMnemonic(mnemonic: string): Promise<NostrKeys> {
    try {
      if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic');
      }

      // Hash the mnemonic to get a 32-byte private key
      const hash = sha256(mnemonic);
      const privateKey = bytesToHex(hash);

      // Get public key using nostr-tools
      const publicKey = getPublicKey(privateKey);

      // Convert to bech32 format
      const npub = nip19.npubEncode(publicKey);
      const nsec = nip19.nsecEncode(privateKey);

      return {
        privateKey,
        publicKey,
        npub,
        nsec,
        mnemonic
      };
    } catch (error) {
      console.error('[Nostr] Failed to derive keys from mnemonic:', error);
      throw error;
    }
  }
}

// Singleton instance
export const nostr = new Nostr();