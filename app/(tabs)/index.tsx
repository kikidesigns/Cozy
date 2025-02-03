import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { globalStyles } from '../../constants/styles';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={[globalStyles.container, { backgroundColor: colors.background }]}>
      <View style={[
        globalStyles.header,
        { 
          backgroundColor: colors.primary,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 48,
          paddingBottom: 16
        }
      ]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surface,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
          </TouchableOpacity>

          <View style={{
            marginLeft: 12,
            height: 4,
            width: 100,
            backgroundColor: colors.surface,
            borderRadius: 2,
            opacity: 0.8
          }} />

          <TouchableOpacity 
            style={{
              marginLeft: 12,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surface,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => router.push('/journal')}
          >
            <Text style={{ fontSize: 20 }}>📝</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={{
            backgroundColor: colors.surface,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16
          }}
          onPress={() => router.push('/wallet')}
        >
          <Text style={{ 
            fontSize: 16, 
            fontWeight: 'bold',
            color: colors.text
          }}>
            ₿ 0.0001
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 100 }}>🤖</Text>
        <Text style={{ 
          fontSize: 24, 
          marginTop: 20,
          color: colors.text
        }}>
          Your Agent
        </Text>
      </View>

      <View style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0,
        padding: 16,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        shadowColor: colors.textSecondary,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4
      }}>
        <TextInput
          style={[
            globalStyles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text,
              borderRadius: 20,
              paddingHorizontal: 16
            }
          ]}
          placeholder="Chat with your agent..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>
    </View>
  );
}