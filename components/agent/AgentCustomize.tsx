import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useAgentMemory } from '../../hooks/useAgentMemory';

export const AgentCustomize = () => {
  const { profile, updateProfile } = useAgentMemory();
  const [name, setName] = useState(profile?.name || '');

  const handleNameSubmit = () => {
    if (name.trim()) {
      updateProfile({ name: name.trim() });
    }
  };

  // TODO: Add color picker component
  const handleColorChange = (color: string) => {
    updateProfile({ color });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        onBlur={handleNameSubmit}
        placeholder="Agent Name"
        placeholderTextColor="#666"
      />
      {/* TODO: Add color picker UI */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: '#000',
  },
});