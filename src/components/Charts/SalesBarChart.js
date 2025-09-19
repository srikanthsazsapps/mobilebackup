import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, processColor, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-charts-wrapper';

const { width, height } = Dimensions.get('window');

const BarChartComponent = ({ data }) => {
  const [isLandscape, setIsLandscape] = useState(width > height);

  // Sort data by TotalNetWeight in descending order
  const sortedData = data.sort((a, b) => b.TotalNetWeight - a.TotalNetWeight);

  // Prepare chart data with consistent colors per product
  const chartData = {
    dataSets: [
      {
        values: sortedData.map(item => item.TotalNetWeight),
        label: 'Net Weight',
        config: { colors: sortedData.map((_, index) => processColor(getColorFromPalette(index))) },
      },
      {
        values: sortedData.map(item => item.TotalNetAmount),
        label: 'Net Amount',
        config: { colors: sortedData.map((_, index) => processColor(getColorFromPalette(index))) },
      },
      {
        values: sortedData.map(item => item.Trips),
        label: 'Trips',
        config: { colors: sortedData.map((_, index) => processColor(getColorFromPalette(index))) },
      },
    ],
    labels: sortedData.map(item => item.ProductName), // Product names as x-axis labels
  };

  useEffect(() => {
    const onChange = ({ window }) => {
      setIsLandscape(window.width > window.height);
    };
    const dimensionListener = Dimensions.addEventListener('change', onChange);

    return () => {
      dimensionListener.remove();
    };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: isLandscape ? 'row' : 'column',
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <BarChart
          style={{ width: '100%', height: 300 }}
          data={chartData}
          xAxis={{
            valueFormatter: chartData.labels,
            granularityEnabled: true,
            granularity: 1,
            drawLabels: false, // Hide axis labels; we'll use the custom legend for names
            textSize: 10,
            textColor: processColor('#333'),
          }}
          yAxis={{
            left: { axisMinimum: 0 },
            right: { enabled: false },
          }}
          chartDescription={{ text: '' }}
          legend={{ enabled: false }} // Disable default legend
          animation={{ durationX: 1000 }}
          gridBackgroundColor={processColor('#ffffff')}
          drawBarShadow={false}
          drawValueAboveBar={true}
          pinchZoom={false}
          doubleTapToZoomEnabled={false}
          highlightFullBarEnabled={false}
        />
      </View>

      {/* Custom Legend */}
      <View style={styles.legendContainer}>
        {sortedData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColorBox,
                { backgroundColor: getColorFromPalette(index) },
              ]}
            />
            <Text style={styles.legendLabel}>{item.ProductName}</Text>
          </View>
        ))}
      </View>

      <View
        style={{
          flex: 1,
          marginTop: isLandscape ? 0 : 20,
        }}
      >
        <View style={styles.row}>
          <Text style={[styles.cell, styles.header]}>Product</Text>
          <Text style={[styles.cell, styles.header]}>Net Amount</Text>
          <Text style={[styles.cell, styles.header]}>Net Weight</Text>
          <Text style={[styles.cell, styles.header]}>Trips</Text>
        </View>
        {sortedData.map((item, index) => (
          <View
            key={index}
            style={[styles.row, { backgroundColor: getColorFromPalette(index) }]}
          >
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
  '#8E44AD', '#2980B9', '#D35400', '#27AE60', '#F39C12',
  '#1F618D', '#16A085', '#E74C3C', '#9B59B6', '#F1C40F'
];

const getColorFromPalette = index => colorPalette[index % colorPalette.length];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 4,
  },
  legendColorBox: {
    width: 15,
    height: 15,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 12,
    color: '#333',
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

export default BarChartComponent;
