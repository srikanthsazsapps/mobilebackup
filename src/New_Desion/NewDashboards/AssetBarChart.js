
// AssetBarChart Component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AssetBarChart = ({ statusCounts, highlyUsedVehiclesLength, loaderVehiclesLength }) => {
  const assetData = [
    { label: 'FC Ending', value: statusCounts['FC Ending'] || 0, color: '#FFB6C1' },
    { label: 'Permit', value: statusCounts['Permit'] || 0, color: '#FFEB9C' },
    { label: 'Insurance', value: statusCounts['Insurance'] || 0, color: '#E6E6FA' },
    { label: 'Tax', value: statusCounts['Tax'] || 0, color: '#B6D7FF' },
    { label: 'Trip Wise', value: highlyUsedVehiclesLength || 0, color: '#C1FFC1' },
    { label: 'Hours Wise', value: loaderVehiclesLength || 0, color: '#FFDAB9' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.barsContainer}>
        {assetData.map((item, index) => (
          <View key={index} style={styles.barWrapper}>
            <View style={styles.bar}>
              <View style={[styles.topSection, { backgroundColor: item.color }]}>
                <Text style={styles.valueText}>{item.value}</Text>
              </View>
              <View style={styles.blueFill} />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.labelsContainer}>
        {assetData.map((item, index) => (
          <View key={index} style={styles.labelWrapper}>
            <Text style={styles.labelText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    margin: 10,
    overflow: 'hidden',
    top:2,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  bar: {
    top: 20,
    width: 40,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  topSection: {
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  valueText: {
    top: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  blueFill: {
    height: '60%',
    backgroundColor: '#4A90E2',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  labelsContainer: {
    backgroundColor: '#70666650',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  labelWrapper: {
    flex: 0.4,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 9,
    fontWeight: '500',
    color: '#000000ff',
    textAlign: 'center',
  },
});

export default AssetBarChart;
