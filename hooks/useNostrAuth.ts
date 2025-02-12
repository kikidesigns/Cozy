import { useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNostrStore } from "../lib/nostr/store"

interface Profile {
  name?: string;
  color?: string;
}

interface CreateAccountResult {
  success: boolean;
  nsec?: string;
}

export function useNostrAuth() {
  const { initializeFromNsec, generateNewKeys, logout, keys, error } = useNostrStore();

  const getMnemonic = useCallback(async () => {
    try {
      return await AsyncStorage.getItem('@cozy_mnemonic');
    } catch (err) {
      console.error('Failed to get mnemonic:', err);
      return null;
    }
  }, []);

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
      hasKeys: !!currentKeys,
      nsecPreview: currentKeys?.nsec?.slice(0, 10) + '...'
    });

    if (success && currentKeys?.nsec) {
      return {
        success: true,
        nsec: currentKeys.nsec
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
    isAuthenticated: !!keys,
    getMnemonic
  };
}
