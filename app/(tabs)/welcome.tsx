import { StyleSheet, View, Text, Platform, useWindowDimensions, Pressable } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  
  return (
    <View style={[
      styles.container,
      {
        width: Platform.OS === 'web' ? width : '100%',
        height: Platform.OS === 'web' ? height : '100%',
      }
    ]}>
      <Text style={styles.title}>Welcome to Cozy</Text>
      <Text style={styles.subtitle}>Your personal AI companion</Text>
      <Pressable 
        style={styles.button}
        onPress={() => router.push('/home')}
      >
        <Text style={styles.buttonText}>Enter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.platform,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 24,
    color: Colors.sun,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.platform,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 20,
    fontWeight: 'bold',
  },
});