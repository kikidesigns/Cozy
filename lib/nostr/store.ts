import { create } from 'zustand';
import { NostrKeys } from './nostr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nostr } from './nostr';
import { NostrRelay } from './relay';

interface NostrState {
  keys: NostrKeys | null;
  relay: NostrRelay | null;
  initialized: boolean;
  error: string | null;
  setKeys: (keys: NostrKeys) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  initializeFromNsec: (nsec: string) => Promise<boolean>;
  generateNewKeys: () => Promise<boolean>;
  logout: () => Promise<void>;
  initializeRelay: () => Promise<void>;
}

export const useNostrStore = create<NostrState>((set, get) => ({
  keys: null,
  relay: null,
  initialized: false,
  error: null,

  setKeys: (keys) => set({ keys }),
  setError: (error) => set({ error }),
  setInitialized: (initialized) => set({ initialized }),

  initializeFromNsec: async (nsec) => {
    try {
      console.log('[NostrStore] Initializing from nsec...');
      // Derive keys from nsec
      const keys = await nostr.deriveKeysFromNsec(nsec);
      console.log('[NostrStore] Keys derived:', { npub: keys.npub });
      
      // Save keys
      set({ keys, initialized: true, error: null });
      
      // Store nsec in AsyncStorage
      await AsyncStorage.setItem('@cozy_nsec', nsec);
      console.log('[NostrStore] Nsec stored in AsyncStorage');

      // Initialize relay after keys are set
      await get().initializeRelay();
      
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
      console.log('[NostrStore] Generating new keys...');
      // Generate new keys
      const keys = await nostr.generateNewKeys();
      console.log('[NostrStore] Keys generated:', { 
        npub: keys.npub,
        hasMnemonic: !!keys.mnemonic,
        mnemonicLength: keys.mnemonic?.split(' ').length
      });
      
      // Save keys
      set({ keys, initialized: true, error: null });
      console.log('[NostrStore] Keys saved to state');
      
      // Store nsec and mnemonic in AsyncStorage
      await AsyncStorage.setItem('@cozy_nsec', keys.nsec);
      if (keys.mnemonic) {
        await AsyncStorage.setItem('@cozy_mnemonic', keys.mnemonic);
      }
      console.log('[NostrStore] Keys stored in AsyncStorage');

      // Initialize relay after keys are set
      await get().initializeRelay();
      
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
      console.log('[NostrStore] Logging out...');
      // Clean up relay
      const { relay } = get();
      if (relay) {
        relay.cleanup();
      }
      
      // Clear keys from state
      set({ keys: null, relay: null, initialized: false, error: null });
      
      // Clear storage
      await AsyncStorage.multiRemove([
        '@cozy_nsec',
        '@cozy_mnemonic'
      ]);
      console.log('[NostrStore] Storage cleared');
    } catch (error) {
      console.error('[NostrStore] Logout error:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to logout'
      });
    }
  },

  initializeRelay: async () => {
    try {
      console.log('[NostrStore] Initializing relay...');
      const relay = new NostrRelay();
      await relay.connect();
      set({ relay });
      console.log('[NostrStore] Relay initialized');
    } catch (error) {
      console.error('[NostrStore] Relay initialization error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize relay'
      });
    }
  }
}));