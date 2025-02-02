import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { globalStyles } from '../../constants/styles';

const MOCK_TASK = {
  id: '1',
  title: 'Review Code PR',
  description: 'Review and provide feedback on the latest pull request. Check for code quality, test coverage, and documentation.',
  status: 'pending',
  date: '2024-01-20',
  files: [
    { id: 1, name: 'main.tsx', type: 'code' },
    { id: 2, name: 'README.md', type: 'document' },
  ],
  comments: [
    { id: 1, text: 'Started review process', timestamp: '2024-01-20 10:00' },
    { id: 2, text: 'Found some issues in error handling', timestamp: '2024-01-20 11:30' },
  ],
};

export default function TaskScreen() {
  const { id } = useLocalSearchParams();
  const [comment, setComment] = useState('');
  const task = MOCK_TASK; // In real app, fetch task by id

  const handleAddComment = () => {
    if (comment.trim()) {
      // In real app, save comment to backend
      setComment('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{task.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Associated Files</Text>
        {task.files.map((file) => (
          <View key={file.id} style={styles.fileItem}>
            <Text style={styles.fileName}>
              {file.type === 'code' ? '📄' : '📑'} {file.name}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comments</Text>
        {task.comments.map((comment) => (
          <View key={comment.id} style={styles.commentItem}>
            <Text style={styles.commentText}>{comment.text}</Text>
            <Text style={styles.commentTime}>{comment.timestamp}</Text>
          </View>
        ))}
      </View>

      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          placeholder="Add a comment..."
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddComment}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.denyButton]}>
          <Text style={styles.actionButtonText}>Deny</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.confirmButton]}>
          <Text style={styles.actionButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2a2a2a',
  },
  title: {
    color: '#fff',
    fontSize: 20,
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
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  fileItem: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  fileName: {
    color: '#fff',
    fontSize: 14,
  },
  commentItem: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  commentText: {
    color: '#fff',
    fontSize: 14,
  },
  commentTime: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
  inputSection: {
    padding: 20,
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    padding: 10,
    color: '#fff',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  denyButton: {
    backgroundColor: '#FF6B6B',
  },
  confirmButton: {
    backgroundColor: '#4ECDC4',
  },
  actionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});