import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'completed' | 'in_progress';
  date: string;
  priority?: 'high' | 'medium' | 'low';
}

export default function TaskScreen() {
  const { id } = useLocalSearchParams();
  const [comment, setComment] = React.useState('');

  // Mock task data - in real app would fetch based on id
  const task: Task = {
    id: Number(id),
    title: 'Search for Bitcoin news',
    description: 'Monitor major crypto news outlets for significant Bitcoin updates and summarize key points. Look for market trends, technical developments, and regulatory updates.',
    status: 'pending',
    date: '2024-01-20',
    priority: 'high'
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Task Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{task.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
            <FontAwesome 
              name={getStatusIcon(task.status)} 
              size={14} 
              color={Colors.white}
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </Text>
          </View>
        </View>
        
        {/* Task Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <FontAwesome name="calendar" size={14} color={Colors.softGray} />
              <Text style={styles.metaText}>{task.date}</Text>
            </View>
            {task.priority && (
              <View style={styles.metaItem}>
                <FontAwesome name="flag" size={14} color={Colors.softGray} />
                <Text style={styles.metaText}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Add Comment</Text>
          <TextInput
            style={styles.commentInput}
            multiline
            placeholder="Enter your comment..."
            placeholderTextColor={Colors.softGray}
            value={comment}
            onChangeText={setComment}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.denyButton]}
          onPress={() => router.back()}
        >
          <FontAwesome name="times" size={18} color={Colors.white} />
          <Text style={styles.actionButtonText}>Deny Task</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => router.back()}
        >
          <FontAwesome name="check" size={18} color={Colors.white} />
          <Text style={styles.actionButtonText}>Complete Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmBeige,
  },
  scrollView: {
    flex: 1,
  },
  titleSection: {
    padding: 20,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.softGray,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  card: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: Colors.softGray,
  },
  commentSection: {
    margin: 20,
    marginTop: 0,
  },
  commentInput: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    fontSize: 15,
    color: Colors.text,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  denyButton: {
    backgroundColor: Colors.error,
  },
  completeButton: {
    backgroundColor: Colors.sageGreen,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});