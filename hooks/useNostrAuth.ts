import { useCallback } from 'react';
import { useNostrStore } from '../lib/nostr/store';

interface Profile {
  name?: string;
  color?: string;
}

interface CreateAccountResult {
  success: boolean;
  mnemonic?: string;
}

export function useNostrAuth() {
  const { initializeFromNsec, generateNewKeys, logout, keys, error } = useNostrStore();

  const login = useCallback(async (nsec: string) => {
    return await initializeFromNsec(nsec);
  }, [initializeFromNsec]);

  const createNewAccount = useCallback(async (): Promise<CreateAccountResult> => {
    const success = await generateNewKeys();
    if (success && keys?.mnemonic) {
      return {
        success: true,
        mnemonic: keys.mnemonic
      };
    }
    return { success: false };
  }, [generateNewKeys, keys]);

  const updateProfile = useCallback(async (profile: Profile) => {
    // TODO: Implement profile update via Nostr event
    console.log('Profile update not implemented yet:', profile);
    return true;
  }, []);

  return {
    login,
    createNewAccount,
    updateProfile,
    logout,
    keys,
    error,
    isAuthenticated: !!keys
  };
}