import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { globalStyles } from '../../constants/styles';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export default function JournalScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tasks = [
    { 
      id: 1, 
      title: 'Search for Bitcoin news', 
      status: 'pending',
      date: '2024-01-20'
    },
    { 
      id: 2, 
      title: 'Monitor Lightning Network status', 
      status: 'completed',
      date: '2024-01-19'
    },
    { 
      id: 3, 
      title: 'Check Nostr feed updates', 
      status: 'pending',
      date: '2024-01-18'
    },
  ];

  const handleTaskPress = (taskId: number) => {
    router.push({
      pathname: "/task/[id]",
      params: { id: taskId }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'pending':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.background }]}>
      <View style={[globalStyles.header, { backgroundColor: colors.primary }]}>
        <Text style={[globalStyles.title, { color: colors.surface }]}>Journal</Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
        {tasks.map(task => (
          <TouchableOpacity 
            key={task.id} 
            style={[
              globalStyles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                marginVertical: 8,
                padding: 16,
                borderRadius: 12,
                shadowColor: colors.textSecondary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }
            ]}
            onPress={() => handleTaskPress(task.id)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: '600',
                color: colors.text,
                flex: 1,
                marginRight: 12
              }}>
                {task.title}
              </Text>
              <View style={{
                backgroundColor: getStatusColor(task.status),
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 12,
              }}>
                <Text style={{ 
                  fontSize: 14,
                  color: colors.surface,
                  fontWeight: '500'
                }}>
                  {task.status === 'completed' ? '✓ Done' : '⏳ Pending'}
                </Text>
              </View>
            </View>
            <Text style={{ 
              color: colors.textSecondary, 
              marginTop: 8,
              fontSize: 14
            }}>
              {task.date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}