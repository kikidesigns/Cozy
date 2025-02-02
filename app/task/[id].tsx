import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { globalStyles } from '../../constants/styles';

export default function TaskScreen() {
  const { id } = useLocalSearchParams();
  const [comment, setComment] = React.useState('');

  // Mock task data - in real app would fetch based on id
  const task = {
    id: Number(id),
    title: 'Search for Bitcoin news',
    description: 'Monitor major crypto news outlets for significant Bitcoin updates and summarize key points.',
    status: 'pending',
    date: '2024-01-20'
  };

  return (
    <View style={globalStyles.container}>
      <TouchableOpacity 
        style={globalStyles.backButton}
        onPress={() => router.back()}
      >
        <Text style={{ fontSize: 16 }}>← Back</Text>
      </TouchableOpacity>

      <Text style={[globalStyles.title, { marginTop: 60 }]}>{task.title}</Text>
      
      <View style={globalStyles.card}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>{task.description}</Text>
        <Text style={{ color: '#666' }}>Date: {task.date}</Text>
        <Text style={{ 
          color: task.status === 'completed' ? 'green' : 'orange',
          marginTop: 5
        }}>
          Status: {task.status}
        </Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>
          Add Comment
        </Text>
        <TextInput
          style={[globalStyles.input, { height: 100, textAlignVertical: 'top' }]}
          multiline
          placeholder="Enter your comment..."
          value={comment}
          onChangeText={setComment}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
        <TouchableOpacity 
          style={[globalStyles.button, { flex: 1, backgroundColor: 'green' }]}
          onPress={() => router.back()}
        >
          <Text style={globalStyles.buttonText}>Complete Task</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[globalStyles.button, { flex: 1, backgroundColor: 'red' }]}
          onPress={() => router.back()}
        >
          <Text style={globalStyles.buttonText}>Deny Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}