import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAgentMemory } from '../../hooks/useAgentMemory';

export default function JournalScreen() {
  const { tasks, updateTask } = useAgentMemory();

  const renderTask = ({ item }) => (
    <TouchableOpacity 
      style={styles.taskItem}
      onPress={() => updateTask(item.id, { 
        status: item.status === 'pending' ? 'in_progress' : 'completed' 
      })}
    >
      <View style={styles.taskHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskStatus}>{item.status}</Text>
      </View>
      <Text style={styles.taskDescription}>{item.description}</Text>
      <Text style={styles.taskDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  taskItem: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskStatus: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  taskDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  taskDate: {
    fontSize: 12,
    color: '#666',
  },
});