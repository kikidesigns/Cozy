import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { globalStyles } from '../../constants/styles';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';

export default function TaskScreen() {
  const { id } = useLocalSearchParams();
  const [comment, setComment] = React.useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Mock task data - in real app would fetch based on id
  const task = {
    id: Number(id),
    title: 'Search for Bitcoin news',
    description: 'Monitor major crypto news outlets for significant Bitcoin updates and summarize key points.',
    status: 'pending',
    date: '2024-01-20'
  };

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.background }]}>
      <View style={[globalStyles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity 
          style={[globalStyles.backButton, { marginLeft: 16 }]}
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 16, color: colors.surface }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[globalStyles.title, { color: colors.surface, flex: 1, textAlign: 'center', marginRight: 48 }]}>
          {task.title}
        </Text>
      </View>
      
      <View style={{ flex: 1, padding: 16 }}>
        <View style={[
          globalStyles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            padding: 16,
            borderRadius: 12,
            shadowColor: colors.textSecondary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }
        ]}>
          <Text style={{ 
            fontSize: 16, 
            marginBottom: 10,
            color: colors.text
          }}>
            {task.description}
          </Text>
          <Text style={{ color: colors.textSecondary }}>Date: {task.date}</Text>
          <View style={{
            backgroundColor: task.status === 'completed' ? colors.success : colors.warning,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: 'flex-start',
            marginTop: 8
          }}>
            <Text style={{ 
              color: colors.surface,
              fontWeight: '500'
            }}>
              Status: {task.status}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            marginBottom: 10,
            color: colors.text
          }}>
            Add Comment
          </Text>
          <TextInput
            style={[
              globalStyles.input,
              { 
                height: 100,
                textAlignVertical: 'top',
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
                padding: 12
              }
            ]}
            multiline
            placeholder="Enter your comment..."
            placeholderTextColor={colors.textSecondary}
            value={comment}
            onChangeText={setComment}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <TouchableOpacity 
            style={[
              globalStyles.button,
              { 
                flex: 1,
                backgroundColor: colors.success,
                borderRadius: 12,
                padding: 16
              }
            ]}
            onPress={() => router.back()}
          >
            <Text style={[globalStyles.buttonText, { color: colors.surface }]}>
              Complete Task
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              globalStyles.button,
              { 
                flex: 1,
                backgroundColor: colors.error,
                borderRadius: 12,
                padding: 16
              }
            ]}
            onPress={() => router.back()}
          >
            <Text style={[globalStyles.buttonText, { color: colors.surface }]}>
              Deny Task
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}