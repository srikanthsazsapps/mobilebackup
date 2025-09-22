import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const InteractivePieChart = ({ 
  receivablesTotal, 
  payablesTotal, 
  activeTab, 
  formatIndianNumber 
}) => {
  const size = 120;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate the stroke dash arrays for semicircles
  const halfCircumference = circumference /2;
  
  // Colors based on active tab
  const receivablesColor = activeTab === 'Receivables' ? '#4A90E2' : '#B8D4F0';
  const payablesColor = activeTab === 'Payables' ? '#F5A3C7' : '#F5C7D8';
  
  // Total amount
  const totalAmount = receivablesTotal + Math.abs(payablesTotal);

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size/2}, ${size/2}`}>
            {/* Left semicircle - Receivables */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={receivablesColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${halfCircumference} ${circumference}`}
              fill="transparent"
              strokeLinecap="round"
            />
            {/* Right semicircle - Payables */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={payablesColor}
              strokeWidth={strokeWidth}
              strokeDasharray={`${halfCircumference} ${circumference}`}
              strokeDashoffset={-halfCircumference}
              fill="transparent"
              strokeLinecap="round"
            />
          </G>
        </Svg>
        
        {/* Total amount in center */}
        <View style={styles.centerText}>
          <Text style={styles.totalAmount}>
            ₹{formatIndianNumber(totalAmount)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },
});

export default InteractivePieChart;