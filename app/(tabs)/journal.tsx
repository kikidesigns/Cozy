import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { globalStyles } from '../../constants/styles';

export default function JournalScreen() {
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

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Journal</Text>

      <ScrollView>
        {tasks.map(task => (
          <TouchableOpacity 
            key={task.id} 
            style={globalStyles.card}
            onPress={() => handleTaskPress(task.id)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '600' }}>
                {task.title}
              </Text>
              <Text style={{ 
                fontSize: 14,
                color: task.status === 'completed' ? 'green' : 'orange'
              }}>
                {task.status === 'completed' ? '✓' : '⏳'}
              </Text>
            </View>
            <Text style={{ color: '#666', marginTop: 5 }}>{task.date}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}