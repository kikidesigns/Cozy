import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNostrStore } from '../lib/nostr/store';
import { AgentProfile, AgentTask, createProfileEvent, createTaskEvent } from '../lib/nostr/events';

const STORAGE_KEYS = {
  PROFILE: '@cozy_profile',
  TASKS: '@cozy_tasks'
};

export const useAgentMemory = () => {
  const { keys, relay } = useNostrStore();
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);

  // Load cached data and subscribe to updates
  useEffect(() => {
    if (!keys?.publicKey || !relay) return;

    const loadData = async () => {
      try {
        // Load cached data
        const [cachedProfile, cachedTasks] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.TASKS)
        ]);

        if (cachedProfile) setProfile(JSON.parse(cachedProfile));
        if (cachedTasks) setTasks(JSON.parse(cachedTasks));

        // Subscribe to profile updates
        await relay.subscribeToProfile(keys.publicKey, (event) => {
          const newProfile = JSON.parse(event.content);
          setProfile(newProfile);
          AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
        });

        // Subscribe to task updates
        await relay.subscribeToTasks(keys.publicKey, (event) => {
          const task = JSON.parse(event.content);
          setTasks(prev => {
            const newTasks = prev.filter(t => t.id !== task.id);
            return [...newTasks, task].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
          });
        });
      } catch (error) {
        console.error('Error loading agent data:', error);
      }
    };

    loadData();

    // Cleanup subscriptions
    return () => {
      if (relay) {
        relay.closeSubscription(`profile:${keys.publicKey}`);
        relay.closeSubscription(`tasks:${keys.publicKey}`);
      }
    };
  }, [keys?.publicKey, relay]);

  const updateProfile = useCallback(async (updates: Partial<AgentProfile>) => {
    if (!keys || !relay) return;

    try {
      const newProfile = { ...profile, ...updates } as AgentProfile;
      const event = await createProfileEvent(newProfile);
      
      // Publish to relay
      const published = await relay.publish(event);
      if (!published) throw new Error('Failed to publish profile update');
      
      setProfile(newProfile);
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [profile, keys, relay]);

  const createTask = useCallback(async (task: Omit<AgentTask, 'id'>) => {
    if (!keys || !relay) return;

    try {
      const newTask = {
        ...task,
        id: crypto.randomUUID()
      };

      const event = await createTaskEvent(newTask);
      
      // Publish to relay
      const published = await relay.publish(event);
      if (!published) throw new Error('Failed to publish task');
      
      setTasks(prev => [...prev, newTask]);
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([...tasks, newTask]));
      
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }, [tasks, keys, relay]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<AgentTask>) => {
    if (!keys || !relay) return;

    try {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) throw new Error('Task not found');

      const updatedTask = { ...tasks[taskIndex], ...updates };
      const event = await createTaskEvent(updatedTask);
      
      // Publish to relay
      const published = await relay.publish(event);
      if (!published) throw new Error('Failed to publish task update');
      
      const newTasks = [...tasks];
      newTasks[taskIndex] = updatedTask;
      
      setTasks(newTasks);
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
      
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }, [tasks, keys, relay]);

  return {
    profile,
    tasks,
    updateProfile,
    createTask,
    updateTask
  };
};