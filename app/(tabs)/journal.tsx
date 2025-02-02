import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { globalStyles } from '../../constants/styles';
import { Colors } from '../../constants/Colors';

interface Task {
  id: number;
  title: string;
  status: 'pending' | 'completed' | 'in_progress';
  date: string;
  description?: string;
}

export default function JournalScreen() {
  const tasks: Task[] = [
    { 
      id: 1, 
      title: 'Search for Bitcoin news', 
      status: 'pending',
      date: '2024-01-20',
      description: 'Find and analyze recent Bitcoin news and market trends.'
    },
    { 
      id: 2, 
      title: 'Monitor Lightning Network status', 
      status: 'completed',
      date: '2024-01-19',
      description: 'Check Lightning Network capacity and channel status.'
    },
    { 
      id: 3, 
      title: 'Check Nostr feed updates', 
      status: 'in_progress',
      date: '2024-01-18',
      description: 'Review and analyze recent Nostr feed activity.'
    },
  ];

  const handleTaskPress = (taskId: number) => {
    router.push({
      pathname: "/task/[id]",
      params: { id: taskId }
    });
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return Colors.sageGreen;
      case 'in_progress':
        return Colors.skyBlue;
      case 'pending':
        return Colors.orangeBrown;
      default:
        return Colors.softGray;
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'in_progress':
        return '⚡';
      case 'pending':
        return '⏳';
      default:
        return '•';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        <Text style={[globalStyles.title, styles.title]}>Journal</Text>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {tasks.map(task => (
            <TouchableOpacity 
              key={task.id} 
              style={[styles.taskCard, { borderLeftColor: getStatusColor(task.status) }]}
              onPress={() => handleTaskPress(task.id)}
            >
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>
                  {task.title}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                  <Text style={styles.statusIcon}>
                    {getStatusIcon(task.status)}
                  </Text>
                </View>
              </View>
              
              {task.description && (
                <Text style={styles.taskDescription}>
                  {task.description}
                </Text>
              )}
              
              <Text style={styles.taskDate}>{task.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.warmBeige,
  },
  container: {
    padding: 20,
  },
  title: {
    color: Colors.darkOrangeBrown,
    marginBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 30,
    alignItems: 'center',
  },
  statusIcon: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.8,
    marginBottom: 8,
  },
  taskDate: {
    fontSize: 12,
    color: Colors.softGray,
    marginTop: 4,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 32,
    marginTop: -2,
  },
});