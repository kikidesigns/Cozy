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
    console.log('[useNostrAuth] Attempting login...');
    return await initializeFromNsec(nsec);
  }, [initializeFromNsec]);

  const createNewAccount = useCallback(async (): Promise<CreateAccountResult> => {
    console.log('[useNostrAuth] Creating new account...');
    const success = await generateNewKeys();
    
    // Get fresh keys from store after generation
    const currentKeys = useNostrStore.getState().keys;
    console.log('[useNostrAuth] Account creation result:', { 
      success, 
      hasMnemonic: !!currentKeys?.mnemonic,
      mnemonic: currentKeys?.mnemonic?.slice(0, 10) + '...'
    });
    
    if (success && currentKeys?.mnemonic) {
      return {
        success: true,
        mnemonic: currentKeys.mnemonic
      };
    }
    return { success: false };
  }, [generateNewKeys]);

  const updateProfile = useCallback(async (profile: Profile) => {
    // TODO: Implement profile update via Nostr event
    console.log('[useNostrAuth] Profile update not implemented yet:', profile);
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