import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle, Text as SVGText } from 'react-native-svg';

const PieChart = ({ data, type }) => {
  const outerRadius = 100;
  const innerRadius = 80;
  const centerX = Dimensions.get('window').width / 2;
  const centerY = outerRadius + 20;

  const calculatePath = (startAngle, endAngle) => {
    const x1 = centerX + outerRadius * Math.cos(startAngle);
    const y1 = centerY + outerRadius * Math.sin(startAngle);
    const x2 = centerX + outerRadius * Math.cos(endAngle);
    const y2 = centerY + outerRadius * Math.sin(endAngle);
    
    const x3 = centerX + innerRadius * Math.cos(endAngle);
    const y3 = centerY + innerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(startAngle);
    const y4 = centerY + innerRadius * Math.sin(startAngle);

    const largeArc = endAngle - startAngle <= Math.PI ? 0 : 1;
    
    return `M ${x1} ${y1} 
            A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2}
            L ${x3} ${y3}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
            Z`;
  };

  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
  const totalQty = data.reduce((sum, item) => sum + (item.Qty || 0), 0);
  const totalAmount = data.reduce((sum, item) => sum + (item.NetAmount || 0), 0);
  const total = type === 'value' ? totalAmount : totalQty;

  let currentAngle = 0;
  
  return (
    <View style={styles.container}>
      <Svg height={2 * outerRadius + 40} width={Dimensions.get('window').width}>
        <G>
          {data.map((item, index) => {
            const value = type === 'value' ? item.NetAmount : item.Qty;
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 2 * Math.PI;
            const path = calculatePath(currentAngle, currentAngle + angle);
            
            currentAngle += angle;
            
            return (
              <G key={index}>
                <Path d={path} fill={colors[index % colors.length]} />
              </G>
            );
          })}
          <Circle
            cx={centerX}
            cy={centerY}
            r={innerRadius - 1}
            fill="white"
          />
          <SVGText
            x={centerX}
            y={centerY - 20}
            fill="#333333"
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="24"
            fontWeight="bold">
            {type === 'value' ? 'Total Value' : 'Total Qty'}
          </SVGText>
          <SVGText
            x={centerX}
            y={centerY + 20}
            fill="#333333"
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="18">
            {type === 'value' 
              ? `₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` 
              : totalQty.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </SVGText>
        </G>
      </Svg>
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colors[index % colors.length] }]} />
            <Text style={styles.legendText}>
              {type === 'value' 
                ? `${item.Product || item.Name}: ₹${item.NetAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                : `${item.Product || item.Name}: ${item.Qty.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 'auto',
    alignItems: 'center',
  },
  legendContainer: {
    marginTop: 5,
    width: '100%',
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    justifyContent: 'center',
  },
  legendColor: {
    width: 20,
    height: 20,
    marginRight: 10,
    borderRadius: 4,
  },
  legendText: {
    color: '#333333',
    fontSize: 14,
  },
});

export default PieChart;