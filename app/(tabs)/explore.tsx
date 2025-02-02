import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { globalStyles } from '../../constants/styles';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ExploreScreen() {
  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Explore</Text>
      
      <ScrollView>
        <View style={styles.searchHeader}>
          <IconSymbol
            name="house.fill"
            size={24}
            color="#666"
          />
          <Text style={styles.searchText}>Search Nostr Network</Text>
        </View>
        
        {/* Placeholder for search results */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Search results will appear here
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 20,
  },
  searchText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  placeholder: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
});