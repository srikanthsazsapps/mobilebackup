import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
// import { DashesDataContext } from './DashesDataContext';
import { DashesDataContext } from './components/common/DashesDataContext';

const TestPage = () => {
  const { assetData, loadingStates } = useContext(DashesDataContext);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const groupByCategory = () => {
    const grouped = {};
    assetData.forEach(item => {
      const category = item.Category || 'Unknown';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  const renderItem = (item, index) => {
    return (
      <View key={index} style={styles.itemContainer}>
        <Text style={styles.itemHeader}>Item #{index + 1}</Text>
        {Object.entries(item).map(([key, value]) => (
          <View key={key} style={styles.fieldRow}>
            <Text style={styles.fieldName}>{key}:</Text>
            <Text style={styles.fieldValue}>{formatValue(value)}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCategory = (category, items, index) => {
    const isExpanded = expandedSections[category];
    
    return (
      <View key={category} style={styles.categoryContainer}>
        <TouchableOpacity onPress={() => toggleSection(category)} style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>
            {category} ({items.length} items)
          </Text>
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '►'}</Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.itemsContainer}>
            {items.map((item, idx) => renderItem(item, idx))}
          </View>
        )}
      </View>
    );
  };

  if (loadingStates.asset) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Asset Data...</Text>
      </View>
    );
  }

  if (!assetData || assetData.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noDataText}>No asset data available</Text>
        <Text style={styles.hintText}>
          Make sure you've selected a valid date range and company
        </Text>
      </View>
    );
  }

  const groupedData = groupByCategory();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Asset Data Viewer</Text>
        <Text style={styles.subtitle}>Total Items: {assetData.length}</Text>
        <Text style={styles.subtitle}>Categories: {Object.keys(groupedData).length}</Text>
      </View>

      {Object.entries(groupedData).map(([category, items], index) => 
        renderCategory(category, items, index)
      )}

      <View style={styles.rawDataSection}>
        <TouchableOpacity onPress={() => toggleSection('raw')} style={styles.categoryHeader}>
          <Text style={styles.categoryTitle}>Raw JSON Data</Text>
          <Text style={styles.expandIcon}>{expandedSections.raw ? '▼' : '►'}</Text>
        </TouchableOpacity>
        
        {expandedSections.raw && (
          <View style={styles.rawDataContainer}>
            <Text style={styles.rawDataText}>
              {JSON.stringify(assetData, null, 2)}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  noDataText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  categoryContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e8f4f8',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  expandIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemsContainer: {
    padding: 8,
  },
  itemContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  itemHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fieldName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495e',
    flex: 1,
  },
  fieldValue: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 2,
    textAlign: 'right',
  },
  rawDataSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  rawDataContainer: {
    padding: 16,
    backgroundColor: '#2c3e50',
  },
  rawDataText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default TestPage;
