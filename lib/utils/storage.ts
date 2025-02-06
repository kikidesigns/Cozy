import AsyncStorage from '@react-native-async-storage/async-storage';
import { Conversation, AgentTask } from '../nostr/events';

export const STORAGE_KEYS = {
  CONVERSATIONS: '@cozy_conversations',
  TASKS: '@cozy_tasks',
  LAST_SYNC: '@cozy_last_sync'
};

export const MAX_MESSAGES = 100;
export const MAX_TASK_AGE_DAYS = 30;

// Conversation Storage
export const saveConversation = async (conversation: Conversation): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const conversations = existingData ? JSON.parse(existingData) : {};
    
    // Keep only last MAX_MESSAGES
    if (conversation.messages.length > MAX_MESSAGES) {
      conversation.messages = conversation.messages.slice(-MAX_MESSAGES);
    }
    
    conversations[conversation.id] = conversation;
    await AsyncStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
};

export const getConversation = async (id: string): Promise<Conversation | null> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const conversations = existingData ? JSON.parse(existingData) : {};
    return conversations[id] || null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

export const getAllConversations = async (): Promise<Conversation[]> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    const conversations = existingData ? JSON.parse(existingData) : {};
    return Object.values(conversations);
  } catch (error) {
    console.error('Error getting all conversations:', error);
    throw error;
  }
};

// Task Storage
export const saveTask = async (task: AgentTask): Promise<void> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    const tasks = existingData ? JSON.parse(existingData) : {};
    tasks[task.id] = task;
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving task:', error);
    throw error;
  }
};

export const getTask = async (id: string): Promise<AgentTask | null> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    const tasks = existingData ? JSON.parse(existingData) : {};
    return tasks[id] || null;
  } catch (error) {
    console.error('Error getting task:', error);
    throw error;
  }
};

export const getAllTasks = async (): Promise<AgentTask[]> => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
    const tasks = existingData ? JSON.parse(existingData) : {};
    return Object.values(tasks);
  } catch (error) {
    console.error('Error getting all tasks:', error);
    throw error;
  }
};

// Cleanup routines
export const cleanupOldTasks = async (): Promise<void> => {
  try {
    const tasks = await getAllTasks();
    const now = Date.now();
    const maxAge = MAX_TASK_AGE_DAYS * 24 * 60 * 60 * 1000; // Convert days to ms
    
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.date).getTime();
      return now - taskDate < maxAge;
    });
    
    const tasksObj = filteredTasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as Record<string, AgentTask>);
    
    await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasksObj));
  } catch (error) {
    console.error('Error cleaning up old tasks:', error);
    throw error;
  }
};

export const updateLastSync = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('Error updating last sync:', error);
    throw error;
  }
};

export const getLastSync = async (): Promise<number> => {
  try {
    const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return lastSync ? parseInt(lastSync, 10) : 0;
  } catch (error) {
    console.error('Error getting last sync:', error);
    throw error;
  }
};