import React from 'react';
import { View } from 'react-native';
import { useAgentMemory } from '../../hooks/useAgentMemory';

// TODO: Add proper Three.js/React Three Fiber implementation
export const AgentDisplay = () => {
  const { profile } = useAgentMemory();

  return (
    <View 
      style={{ 
        width: 100, 
        height: 100, 
        borderRadius: 50,
        backgroundColor: profile?.color || '#888',
      }} 
    />
  );
};