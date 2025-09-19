import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, processColor, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-charts-wrapper';

const { width, height } = Dimensions.get('window');

const DonutChart = ({ data }) => {
  const [selectedEntry, setSelectedEntry] = useState(null); // State to store selected slice info
  const [isLandscape, setIsLandscape] = useState(width > height); // Check for landscape orientation

  // Sort data by TotalNetWeight in descending order
  const sortedData = data.sort((a, b) => b.TotalNetWeight - a.TotalNetWeight);

  // Prepare the data for the PieChart
  const chartData = sortedData.map((item, index) => ({
    value: item.TotalNetWeight,
    label: item.ProductName,
    color: processColor(getColorFromPalette(index)), // Using processColor for the chart colors
  }));

  useEffect(() => {
    const onChange = ({ window }) => {
      setIsLandscape(window.width > window.height);
    };
    const dimensionListener = Dimensions.addEventListener('change', onChange);

    // Add event listener for orientation change
    // Clean up the listener when component unmounts
    return () => {
      dimensionListener.remove();
    };
  }, []);
  // Function to handle slice selection
  const handleSelect = event => {
    const entry = event.nativeEvent;
    if (entry && entry.data) {
      setSelectedEntry(entry.data); // Store selected entry info in state
    } else {
      setSelectedEntry(null); // Clear if no slice is selected
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: isLandscape ? 'row' : 'column', // Change layout direction based on orientation
        },
      ]}>
      <View
        style={{
          flex: 1,
          borderRadius: 30,
          alignItems: 'center',
        }}>
        <PieChart
          style={{
            width: '100%',
            height: 250,
          }}
          data={{
            dataSets: [
              {
                values: chartData,
                label: 'Product wise Sales',
                config: {
                  colors: chartData.map(item => item.color),
                  valueTextSize: 12,
                  valueTextColor: processColor('white'),
                  sliceSpace: 3,
                  selectionShift: 13,
                  valueFormatter: "#'%'",
                },
              },
            ],
          }}
          accessor="value"
          chartDescription={{ text: '' }}
          legend={{
            enabled: false,
          }}
          usePercentValues={true}
          centerText={
            selectedEntry ? selectedEntry.label + ' - ' + selectedEntry.value : 'Sales'
          }
          
          styledCenterText={{
            size: 15, 
            color: processColor('black'),
          }}
          holeRadius={45}
          transparentCircleRadius={50}
          entryLabelColor={processColor('white')}
          rotationEnabled={true}
          drawEntryLabels={false}
          animation={{
            durationX: 1000,
            durationY: 1000,
          }}
          onSelect={handleSelect}
        />
      </View>

      <View
        style={{
          flex: 1,
          marginTop: isLandscape ? 0 : 20, // Add marginTop for portrait mode
        }}>
        <View style={styles.row}>
          <Text style={[styles.cell, styles.header]}>Product</Text>
          <Text style={[styles.cell, styles.header]}>Net Amount</Text>
          <Text style={[styles.cell, styles.header]}>Net Weight</Text>
          <Text style={[styles.cell, styles.header]}>Trips</Text>
        </View>
        {/* Table Data */}
        {sortedData.map((item, index) => (
          <View
            key={index}
            style={[styles.row, { backgroundColor: getColorFromPalette(index) }]}>
            <Text style={[styles.cell, { color: 'white' }]}>{item.ProductName}</Text>
            <Text style={[styles.cell, { color: 'white' }]}>{item.TotalNetAmount}</Text>
            <Text style={[styles.cell, { color: 'white' }]}>{item.TotalNetWeight}</Text>
            <Text style={[styles.cell, { color: 'white' }]}>{item.Trips}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const colorPalette = [
  '#8E44AD', // Medium Purple
  '#2980B9', // Medium Blue
  '#D35400', // Vibrant Orange
  '#27AE60', // Medium Green
  '#F39C12', // Strong Yellow
  '#1F618D', // Deep Sky Blue
  '#16A085', // Teal
  '#E74C3C', // Bright Red
  '#9B59B6', // Rich Violet
  '#F1C40F', // Golden Yellow
];

const getColorFromPalette = index => colorPalette[index % colorPalette.length];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 14,
    backgroundColor: '#f0f0f0',
    color: '#333',
    paddingVertical: 8,
  },
});

export default DonutChart;
