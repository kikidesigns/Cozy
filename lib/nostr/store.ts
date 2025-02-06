import { create } from 'zustand';
import { NostrKeys } from './nostr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nostr } from './nostr';

interface NostrState {
  keys: NostrKeys | null;
  initialized: boolean;
  error: string | null;
  setKeys: (keys: NostrKeys) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  initializeFromNsec: (nsec: string) => Promise<boolean>;
  generateNewKeys: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useNostrStore = create<NostrState>((set) => ({
  keys: null,
  initialized: false,
  error: null,

  setKeys: (keys) => set({ keys }),
  setError: (error) => set({ error }),
  setInitialized: (initialized) => set({ initialized }),

  initializeFromNsec: async (nsec) => {
    try {
      // Derive keys from nsec
      const keys = await nostr.deriveKeysFromNsec(nsec);
      
      // Save keys
      set({ keys, initialized: true, error: null });
      
      // Store nsec in AsyncStorage
      await AsyncStorage.setItem('@cozy_nsec', nsec);
      
      return true;
    } catch (error) {
      console.error('[NostrStore] Initialization error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize Nostr',
        initialized: false 
      });
      return false;
    }
  },

  generateNewKeys: async () => {
    try {
      // Generate new keys
      const keys = await nostr.generateNewKeys();
      
      // Save keys
      set({ keys, initialized: true, error: null });
      
      // Store nsec and mnemonic in AsyncStorage
      await AsyncStorage.setItem('@cozy_nsec', keys.nsec);
      if (keys.mnemonic) {
        await AsyncStorage.setItem('@cozy_mnemonic', keys.mnemonic);
      }
      
      return true;
    } catch (error) {
      console.error('[NostrStore] Key generation error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to generate keys',
        initialized: false
      });
      return false;
    }
  },

  logout: async () => {
    try {
      // Clear keys from state
      set({ keys: null, initialized: false, error: null });
      
      // Clear storage
      await AsyncStorage.multiRemove([
        '@cozy_nsec',
        '@cozy_mnemonic'
      ]);
    } catch (error) {
      console.error('[NostrStore] Logout error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to logout'
      });
    }
  }
}));