import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.sun,
        tabBarStyle: {
          backgroundColor: Colors.background,
        },
        tabBarActiveTintColor: Colors.platform,
        tabBarInactiveTintColor: Colors.sun,
      }}>
      <Tabs.Screen
        name="welcome"
        options={{
          title: 'Welcome',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="cube" color={color} />,
        }}
      />
    </Tabs>
  );
}

// You'll need to install @expo/vector-icons
import { Ionicons } from '@expo/vector-icons';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}