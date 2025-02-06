import { useCallback } from 'react';
import { useNostrStore } from '../lib/nostr/store';

interface Profile {
  name?: string;
  color?: string;
}

export function useNostrAuth() {
  const { initializeFromNsec, keys, error } = useNostrStore();

  const login = useCallback(async (nsec: string) => {
    return await initializeFromNsec(nsec);
  }, [initializeFromNsec]);

  const updateProfile = useCallback(async (profile: Profile) => {
    // TODO: Implement profile update via Nostr event
    console.log('Profile update not implemented yet:', profile);
    return true;
  }, []);

  return {
    login,
    updateProfile,
    keys,
    error,
    isAuthenticated: !!keys
  };
}