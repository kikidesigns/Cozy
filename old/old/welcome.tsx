import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { useNostrAuth } from '@/hooks/useNostrAuth';
import { welcomeStyles as styles } from '@/components/welcome/styles';
import { LoginScreen, AGENT_COLORS } from '@/components/welcome/LoginScreen';
import { BackupScreen } from '@/components/welcome/BackupScreen';
import { createMetadataEvent, createProfileEvent } from '@/lib/nostr/events';
import { useNostrStore } from '@/lib/nostr/store';

export default function WelcomeScreen() {
  const { login, createNewAccount, error } = useNostrAuth();
  const [nsec, setNsec] = useState('');
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AGENT_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [backupNsec, setBackupNsec] = useState<string | null>(null);

  const updateProfile = async (name: string, color: string) => {
    const { relay } = useNostrStore.getState();
    if (!relay) {
      console.error('No relay connection available');
      return;
    }

    try {
      // Create and publish NIP-01 metadata event
      const metadata = await createMetadataEvent({ 
        name,
        about: `A Cozy agent named ${name}`,
      });
      await relay.publish(metadata);

      // Create and publish Cozy-specific profile event
      const profile = await createProfileEvent({
        name,
        color,
        health: 100 // Default starting health
      });
      await relay.publish(profile);

      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const handleLogin = async () => {
    if (!nsec) {
      Alert.alert('Error', 'Please enter your nsec key');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(nsec);
      if (success) {
        if (name || selectedColor) {
          await updateProfile(name || 'Anonymous', selectedColor);
        }
        router.replace('/home');
      } else {
        Alert.alert('Error', 'Invalid nsec key');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    console.log('[Welcome] Starting account creation...');
    setIsLoading(true);
    try {
      const result = await createNewAccount();
      console.log('[Welcome] Account creation result:', result);
      
      if (result.success && result.nsec) {
        console.log('[Welcome] Setting nsec and proceeding...');
        setBackupNsec(result.nsec);
      } else {
        console.log('[Welcome] Account creation failed:', { result });
        Alert.alert('Error', 'Failed to create account');
      }
    } catch (error) {
      console.error('[Welcome] Account creation error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmBackup = async () => {
    try {
      if (name || selectedColor) {
        await updateProfile(name || 'Anonymous', selectedColor);
      }
      router.replace('/home');
    } catch (error) {
      console.error('Failed to update profile after backup:', error);
      Alert.alert('Warning', 'Profile update failed, but you can continue');
      router.replace('/home');
    }
  };

  // If we have a backup nsec, show the backup screen
  if (backupNsec) {
    return (
      <BackupScreen 
        nsec={backupNsec}
        onConfirm={handleConfirmBackup}
      />
    );
  }

  // Otherwise show the login screen
  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      <LoginScreen
        nsec={nsec}
        name={name}
        selectedColor={selectedColor}
        isLoading={isLoading}
        onNsecChange={setNsec}
        onNameChange={setName}
        onColorSelect={setSelectedColor}
        onLogin={handleLogin}
        onCreateAccount={handleCreateAccount}
      />
    </ScrollView>
  );
}