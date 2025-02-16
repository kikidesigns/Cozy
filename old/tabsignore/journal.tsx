import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { globalStyles } from '../../constants/styles';
import { Colors } from '../../constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Task {
  id: number;
  title: string;
  status: 'pending' | 'completed' | 'in_progress';
  date: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
}

export default function JournalScreen() {
  const tasks: Task[] = [
    { 
      id: 1, 
      title: 'Search for Bitcoin news', 
      status: 'pending',
      date: '2024-01-20',
      description: 'Find and analyze recent Bitcoin news and market trends.',
      priority: 'high'
    },
    { 
      id: 2, 
      title: 'Monitor Lightning Network status', 
      status: 'completed',
      date: '2024-01-19',
      description: 'Check Lightning Network capacity and channel status.',
      priority: 'medium'
    },
    { 
      id: 3, 
      title: 'Check Nostr feed updates', 
      status: 'in_progress',
      date: '2024-01-18',
      description: 'Review and analyze recent Nostr feed activity.',
      priority: 'low'
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
        return 'check-circle';
      case 'in_progress':
        return 'clock-o';
      case 'pending':
        return 'hourglass-o';
      default:
        return 'circle-o';
    }
  };

  const getPriorityColor = (priority?: Task['priority']) => {
    switch (priority) {
      case 'high':
        return Colors.error;
      case 'medium':
        return Colors.warning;
      case 'low':
        return Colors.sageGreen;
      default:
        return Colors.softGray;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[globalStyles.container, styles.container]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {tasks.map(task => (
            <TouchableOpacity 
              key={task.id} 
              style={[styles.taskCard]}
              onPress={() => handleTaskPress(task.id)}
            >
              <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
              <View style={styles.taskContent}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskTitle}>
                    {task.title}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
                    <FontAwesome 
                      name={getStatusIcon(task.status)} 
                      size={14} 
                      color={Colors.white}
                      style={styles.statusIcon}
                    />
                  </View>
                </View>
                
                {task.description && (
                  <Text style={styles.taskDescription}>
                    {task.description}
                  </Text>
                )}
                
                <Text style={styles.taskDate}>{task.date}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            // TODO: Implement add task functionality
          }}
        >
          <FontAwesome name="plus" size={24} color={Colors.white} />
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
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  priorityIndicator: {
    width: 4,
    backgroundColor: Colors.softGray,
  },
  taskContent: {
    flex: 1,
    padding: 16,
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
    marginRight: 12,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.softGray,
  },
  statusIcon: {
    marginLeft: 1, // Fine-tune icon position
  },
  taskDescription: {
    fontSize: 14,
    color: Colors.text,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
  taskDate: {
    fontSize: 12,
    color: Colors.softGray,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.orangeBrown,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});