import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { globalStyles } from '@/constants/styles';
import { welcomeStyles as styles } from './styles';

interface BackupScreenProps {
  nsec: string;
  onConfirm: () => void;
}

export function BackupScreen({ nsec, onConfirm }: BackupScreenProps) {
  const [showNsec, setShowNsec] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(nsec);
    Alert.alert('Copied', 'Private key copied to clipboard');
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={[globalStyles.container, styles.container]}>
        <Text style={[globalStyles.title, styles.title]}>Backup Your Private Key</Text>
        
        <View style={styles.nsecContainer}>
          <Text style={styles.warningText}>
            This is your private key (nsec). Save it somewhere safe - you'll need it to log back in!
          </Text>
          
          <View style={styles.nsecBox}>
            <Text style={styles.nsecText}>
              {showNsec ? nsec : nsec.slice(0, 12) + '...'}
            </Text>
            <TouchableOpacity 
              style={styles.showButton}
              onPress={() => setShowNsec(!showNsec)}
            >
              <Text style={styles.showButtonText}>
                {showNsec ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[globalStyles.button, styles.button, styles.copyButton]}
          onPress={handleCopy}
        >
          <Text style={[globalStyles.buttonText, styles.copyButtonText]}>
            Copy Private Key
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[globalStyles.button, styles.button, styles.confirmButton]}
          onPress={onConfirm}
        >
          <Text style={[globalStyles.buttonText, styles.confirmButtonText]}>
            I've Saved My Private Key
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}