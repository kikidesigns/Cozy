import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Custom theme with cozy colors
const CozyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.orangeBrown,
    background: Colors.warmBeige,
    card: Colors.white,
    text: Colors.darkOrangeBrown,
    border: Colors.softGray,
  },
};

const CozyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.lightBeige,
    background: '#2C1810',
    card: Colors.darkOrangeBrown,
    text: Colors.lightBeige,
    border: Colors.softGray,
  },
};

const screenOptions = {
  headerStyle: {
    backgroundColor: Colors.orangeBrown,
  },
  headerTintColor: Colors.white,
  headerTitleStyle: {
    fontWeight: '600',
  },
  contentStyle: {
    backgroundColor: Colors.warmBeige,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CozyDarkTheme : CozyTheme}>
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen 
          name="home" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="wallet" 
          options={{
            headerShown: true,
            headerTitle: 'Wallet',
            headerBackTitle: 'Home',
          }}
        />
        <Stack.Screen 
          name="journal" 
          options={{
            headerShown: true,
            headerTitle: 'Journal',
            headerBackTitle: 'Home',
          }}
        />
        <Stack.Screen 
          name="task/[id]" 
          options={{
            headerShown: true,
            headerTitle: 'Task Details',
            headerBackTitle: 'Journal',
          }}
        />
        <Stack.Screen name="+not-found" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}