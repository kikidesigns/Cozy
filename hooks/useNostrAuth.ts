import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Stub values for testing
const STUB_NPUB = 'npub1zutzeysacnf9rru6zqwmxd54mud0k44tst6l70ja5mhv8jjumytsd2x7nu';
const STUB_NSEC = 'nsec10allq0gjx7fddtzef0ax00mdps9t2kmtrldkyjfs8l5xruwvh2dq0lhhkp';

export interface AgentProfile {
  name: string;
  color: string;
  npub: string;
}

interface NostrAuth {
  isAuthenticated: boolean;
  profile: AgentProfile | null;
  login: (nsec: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<AgentProfile>) => Promise<void>;
}

export function useNostrAuth(): NostrAuth {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<AgentProfile | null>(null);

  // Load profile from storage on mount
  useState(() => {
    AsyncStorage.getItem('agent_profile').then((stored) => {
      if (stored) {
        setProfile(JSON.parse(stored));
        setIsAuthenticated(true);
      }
    });
  });

  const login = useCallback(async (nsec: string): Promise<boolean> => {
    // For MVP, just validate against stub value
    if (nsec === STUB_NSEC) {
      const newProfile = {
        npub: STUB_NPUB,
        name: '',
        color: '',
      };
      
      await AsyncStorage.setItem('agent_profile', JSON.stringify(newProfile));
      setProfile(newProfile);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('agent_profile');
    setProfile(null);
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<AgentProfile>) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      ...updates,
    };

    await AsyncStorage.setItem('agent_profile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  }, [profile]);

  return {
    isAuthenticated,
    profile,
    login,
    logout,
    updateProfile,
  };
}