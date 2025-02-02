import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { globalStyles } from '../constants/styles';

const MOCK_TASKS = [
  {
    id: '1',
    title: 'Review Code PR',
    description: 'Review and provide feedback on the latest pull request',
    status: 'pending',
    date: '2024-01-20',
  },
  {
    id: '2',
    title: 'Update Documentation',
    description: 'Update the API documentation with new endpoints',
    status: 'in_progress',
    date: '2024-01-19',
  },
  {
    id: '3',
    title: 'Bug Fix',
    description: 'Fix the login screen validation issue',
    status: 'completed',
    date: '2024-01-18',
  },
];

export default function JournalScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.taskList}>
        {MOCK_TASKS.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={styles.taskCard}
            onPress={() => router.push(`/task/${task.id}`)}
          >
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={[
                styles.statusBadge,
                task.status === 'completed' && styles.statusCompleted,
                task.status === 'in_progress' && styles.statusInProgress,
              ]}>
                <Text style={styles.statusText}>
                  {task.status === 'completed' ? '✓' :
                   task.status === 'in_progress' ? '⟳' : '⌛'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.taskDescription}>{task.description}</Text>
            
            <View style={styles.taskFooter}>
              <Text style={styles.taskDate}>{task.date}</Text>
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => router.push(`/task/${task.id}`)}
              >
                <Text style={styles.detailsButtonText}>View Details →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  taskList: {
    padding: 15,
  },
  taskCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  taskTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#666',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  statusCompleted: {
    backgroundColor: '#4ECDC4',
  },
  statusInProgress: {
    backgroundColor: '#FFB347',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskDescription: {
    color: '#888',
    fontSize: 14,
    marginBottom: 15,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDate: {
    color: '#666',
    fontSize: 12,
  },
  detailsButton: {
    backgroundColor: '#333',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  detailsButtonText: {
    color: '#4ECDC4',
    fontSize: 12,
  },
});