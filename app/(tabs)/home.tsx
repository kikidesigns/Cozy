import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.title, { color: Colors[colorScheme ?? 'light'].tint }]}>
        Home
      </ThemedText>
      <ThemedText style={styles.description}>
        This is your home screen. Make yourself comfortable!
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'center',
  },
});