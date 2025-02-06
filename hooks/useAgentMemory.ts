import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNostrStore } from '../lib/nostr/store';
import { AgentProfile, AgentTask, createProfileEvent, createTaskEvent } from '../lib/nostr/events';

const STORAGE_KEYS = {
  PROFILE: '@cozy_profile',
  TASKS: '@cozy_tasks'
};

export const useAgentMemory = () => {
  const { keys } = useNostrStore();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = async () => {
    try {
      const [cachedProfile, cachedTasks] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.TASKS)
      ]);

      if (cachedProfile) setProfile(JSON.parse(cachedProfile));
      if (cachedTasks) setTasks(JSON.parse(cachedTasks));
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const updateProfile = useCallback(async (updates: Partial<AgentProfile>) => {
    if (!keys) return;

    try {
      const newProfile = { ...profile, ...updates } as AgentProfile;
      const event = await createProfileEvent(newProfile);
      
      // TODO: Publish event to relays
      
      setProfile(newProfile);
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [profile, keys]);

  const createTask = useCallback(async (task: Omit<AgentTask, 'id'>) => {
    if (!keys) return;

    try {
      const newTask = {
        ...task,
        id: crypto.randomUUID()
      };

      const event = await createTaskEvent(newTask);
      
      // TODO: Publish event to relays
      
      setTasks(prev => [...prev, newTask]);
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([...tasks, newTask]));
      
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }, [tasks, keys]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<AgentTask>) => {
    if (!keys) return;

    try {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) throw new Error('Task not found');

      const updatedTask = { ...tasks[taskIndex], ...updates };
      const event = await createTaskEvent(updatedTask);
      
      // TODO: Publish event to relays
      
      const newTasks = [...tasks];
      newTasks[taskIndex] = updatedTask;
      
      setTasks(newTasks);
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, [tasks, keys]);

  return {
    profile,
    tasks,
    updateProfile,
    createTask,
    updateTask
  };
};