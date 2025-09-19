import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const InteractivePieChart = ({ 
  receivablesAmount = 0, 
  payablesAmount = 0, 
  activeTab = 'Receivables',
  formatIndianNumber 
}) => {
  const totalAmount = receivablesAmount + payablesAmount;
  
  // Calculate percentages for the donut chart
  const receivablesPercentage = totalAmount > 0 ? receivablesAmount / totalAmount : 0.5;
  const payablesPercentage = totalAmount > 0 ? payablesAmount / totalAmount : 0.5;

  const DonutChart = () => {
    const size = 160;
    const strokeWidth = 28;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    // Calculate stroke dash arrays based on percentages
    const receivablesStrokeDasharray = `${circumference * receivablesPercentage} ${circumference}`;
    const payablesStrokeDasharray = `${circumference * payablesPercentage} ${circumference}`;
    const payablesStrokeDashoffset = -circumference * receivablesPercentage;

    // Colors based on active tab
    const receivablesColor = activeTab === 'Receivables' ? '#4A90E2' : '#87CEEB';
    const payablesColor = activeTab === 'Payables' ? '#F5A3C7' : '#F0C0D0';
    
    // Opacity based on active tab
    const receivablesOpacity = activeTab === 'Receivables' ? 1 : 0.7;
    const payablesOpacity = activeTab === 'Payables' ? 1 : 0.7;

    return (
      <View style={[
        styles.chartContainer,
        activeTab === 'Receivables' && styles.chartShadowBlue,
        activeTab === 'Payables' && styles.chartShadowPink,
      ]}>
        <Svg width={size} height={size}>
          <G rotation="-90" origin={`${size/2}, ${size/2}`}>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F0F0F0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            
            {/* Receivables arc */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={receivablesColor}
              strokeWidth={strokeWidth}
              strokeDasharray={receivablesStrokeDasharray}
              fill="transparent"
              strokeLinecap="round"
              opacity={receivablesOpacity}
            />
            
            {/* Payables arc */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={payablesColor}
              strokeWidth={strokeWidth}
              strokeDasharray={payablesStrokeDasharray}
              strokeDashoffset={payablesStrokeDashoffset}
              fill="transparent"
              strokeLinecap="round"
              opacity={payablesOpacity}
            />
          </G>
        </Svg>
        
        {/* Center white circle for donut effect */}
        <View style={styles.centerCircle} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Donut Chart */}
      <View style={styles.chartWrapper}>
        <DonutChart />
      </View>
      
      {/* Total Amount */}
      <Text style={styles.totalAmount}>
        ₹{formatIndianNumber ? formatIndianNumber(totalAmount) : totalAmount.toLocaleString('en-IN')}
      </Text>
      
      {/* Divider line */}
      <View style={styles.divider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  chartShadowBlue: {
    // Shadow effect for iOS
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 8,
  },
  chartShadowPink: {
    // Shadow effect for iOS
    shadowColor: '#F5A3C7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 8,
  },
  centerCircle: {
    position: 'absolute',
    width: 104, // size - strokeWidth * 2
    height: 104,
    borderRadius: 52,
    backgroundColor: '#FFFFFF',
    top: 28, // strokeWidth
    left: 28,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 20,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
});

export default InteractivePieChart;