import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return Colors.sageGreen;
      case 'in_progress':
        return Colors.skyBlue;
      default:
        return Colors.orangeBrown;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'in_progress':
        return 'clock-o';
      default:
        return 'hourglass-o';
    }
  };

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
                { backgroundColor: getStatusColor(task.status) }
              ]}>
                <FontAwesome 
                  name={getStatusIcon(task.status)} 
                  size={12} 
                  color={Colors.white}
                  style={styles.statusIcon}
                />
                <Text style={styles.statusText}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <Text style={styles.taskDescription}>{task.description}</Text>
            
            <View style={styles.taskFooter}>
              <View style={styles.dateContainer}>
                <FontAwesome name="calendar" size={12} color={Colors.softGray} />
                <Text style={styles.taskDate}>{task.date}</Text>
              </View>
              <TouchableOpacity 
                style={styles.detailsButton}
                onPress={() => router.push(`/task/${task.id}`)}
              >
                <Text style={styles.detailsButtonText}>View Details</Text>
                <FontAwesome name="arrow-right" size={12} color={Colors.orangeBrown} />
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
    backgroundColor: Colors.warmBeige,
  },
  taskList: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  taskTitle: {
    color: Colors.darkOrangeBrown,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  taskDescription: {
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskDate: {
    color: Colors.softGray,
    fontSize: 12,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.lightBeige,
  },
  detailsButtonText: {
    color: Colors.orangeBrown,
    fontSize: 12,
    fontWeight: '600',
  },
});