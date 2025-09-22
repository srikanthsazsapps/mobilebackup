import React, { useEffect, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { DashesDataContext } from '../../../components/common/DashesDataContext';

const PieChart = ({ dataType = 'vehicleTrip' }) => {
  const { productionData } = useContext(DashesDataContext);

  useEffect(() => {
    console.log('PieChart: dataType:', dataType);
    console.log('PieChart: productionData:', productionData);
  }, [productionData, dataType]);

  // Function to aggregate data by key field before calculating totals
  const aggregateData = (data, keyField, aggregateFields) => {
    if (!data || !Array.isArray(data)) return [];
    
    const grouped = {};
    
    data.forEach(item => {
      const key = item[keyField];
      if (!key) return;
      
      if (!grouped[key]) {
        // Initialize with the first occurrence
        grouped[key] = { ...item };
        // Convert aggregate fields to numbers
        aggregateFields.forEach(field => {
          grouped[key][field] = parseFloat(item[field]) || 0;
        });
      } else {
        // Aggregate the numeric fields
        aggregateFields.forEach(field => {
          grouped[key][field] += parseFloat(item[field]) || 0;
        });
      }
    });
    
    return Object.values(grouped);
  };

  // Function to calculate totals from aggregated data
  const calculateTotals = (data, field1, field2, keyField, aggregateFields) => {
    if (!data || !Array.isArray(data)) return { total1: 0, total2: 0 };
    
    // First aggregate the data, then calculate totals
    const aggregatedData = aggregateData(data, keyField, aggregateFields);
    
    const total1 = aggregatedData.reduce((sum, item) => sum + (parseFloat(item[field1]) || 0), 0);
    const total2 = aggregatedData.reduce((sum, item) => sum + (parseFloat(item[field2]) || 0), 0);
    
    return { total1, total2 };
  };

  const dataConfigs = {
    vehicleTrip: {
      pieData: (() => {
        const totals = calculateTotals(productionData[5], 'TotalTrip', 'NW', 'VechNumber', ['TotalTrip', 'NW']);
        return [
          { value: totals.total1 || 1, color: '#10B981' },
          { value: totals.total2 || 1, color: '#D6B0FF' },
        ];
      })(),
      labels: { label1: 'Total Trips', label2: 'Net Weight' },
      values: (() => {
        const totals = calculateTotals(productionData[5], 'TotalTrip', 'NW', 'VechNumber', ['TotalTrip', 'NW']);
        return { 
          value1: `${totals.total1}`, 
          value2: `${totals.total2}` 
        };
      })()
    },
    ebReading: {
      pieData: (() => {
        const totals = calculateTotals(productionData[1], 'RunningUnit', 'RawProduced', 'ReadingToDate', ['RunningUnit', 'RawProduced']);
        return [
          { value: totals.total1 || 1, color: '#216ECF' },
          { value: totals.total2 || 1, color: '#FB9DB3' },
        ];
      })(),
      labels: { label1: 'Running Unit', label2: 'Metric Ton' },
      values: (() => {
        const totals = calculateTotals(productionData[1], 'RunningUnit', 'RawProduced', 'ReadingToDate', ['RunningUnit', 'RawProduced']);
        return { 
          value1: `${totals.total1}`, 
          value2: `${totals.total2}` 
        };
      })()
    },
    diesel: {
      pieData: (() => {
        const totals = calculateTotals(productionData[2], 'ClosingStock', 'ClosingStockValue', 'Date', ['ClosingStock', 'ClosingStockValue']);
        return [
          { value: Math.abs(totals.total1) || 1, color: '#F59E0B' },
          { value: Math.abs(totals.total2) || 1, color: '#EF4444' },
        ];
      })(),
      labels: { label1: 'Opening Stock', label2: 'Closing Stock' },
      values: (() => {
        const totals = calculateTotals(productionData[2], 'ClosingStock', 'ClosingStockValue', 'Date', ['ClosingStock', 'ClosingStockValue']);
        return { 
          value1: `${Math.abs(totals.total1)}`, 
          value2: `${Math.abs(totals.total2)}` 
        };
      })()
    },
    transportTrip: {
      pieData: (() => {
        const totals = calculateTotals(productionData[0], 'NoLoad', 'TQty', 'TransportName', ['NoLoad', 'TQty', 'TransportCharges']);
        return [
          { value: totals.total1 || 1, color: '#8B5CF6' },
          { value: totals.total2 || 1, color: '#06B6D4' },
        ];
      })(),
      labels: { label1: 'Total Trips', label2: 'Net Weight' },
      values: (() => {
        const totals = calculateTotals(productionData[0], 'NoLoad', 'TQty', 'TransportName', ['NoLoad', 'TQty', 'TransportCharges']);
        return { 
          value1: `${totals.total1}`, 
          value2: `${totals.total2}` 
        };
      })()
    },
    salesOrder: {
      pieData: (() => {
        const totals = calculateTotals(productionData[3], 'SupQty', 'BalQty', 'CustomerName', ['ReqQty', 'SupQty', 'BalQty']);
        return [
          { value: totals.total1 || 1, color: '#EC4899' },
          { value: totals.total2 || 1, color: '#14B8A6' },
        ];
      })(),
      labels: { label1: 'Supplied Qty', label2: 'Balance Qty' },
      values: (() => {
        const totals = calculateTotals(productionData[3], 'SupQty', 'BalQty', 'CustomerName', ['ReqQty', 'SupQty', 'BalQty']);
        return { 
          value1: `${totals.total1}`, 
          value2: `${totals.total2}` 
        };
      })()
    },
    rawMaterial: {
      pieData: (() => {
        const totals = calculateTotals(productionData[4], 'TotalTrip', 'NW', 'ItemName', ['TotalTrip', 'NW']);
        return [
          { value: totals.total1 || 1, color: '#F97316' },
          { value: totals.total2 || 1, color: '#84CC16' },
        ];
      })(),
      labels: { label1: 'Total Trips', label2: 'Net Weight' },
      values: (() => {
        const totals = calculateTotals(productionData[4], 'TotalTrip', 'NW', 'ItemName', ['TotalTrip', 'NW']);
        return { 
          value1: `${totals.total1}`, 
          value2: `${totals.total2}` 
        };
      })()
    }
  };

  const darken = (hex, factor = 0.7) => {
    const n = hex.replace('#', '');
    const r = Math.round(parseInt(n.substring(0, 2), 16) * factor);
    const g = Math.round(parseInt(n.substring(2, 4), 16) * factor);
    const b = Math.round(parseInt(n.substring(4, 6), 16) * factor);
    const toHex = v => v.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const createPieSegmentPath = (percentage, startAngle = 0, radius = 80, explode = 0, cx = 110, cy = 100) => {
    if (percentage <= 0) {
      console.log('PieChart: Skipping segment with zero or negative percentage');
      return { d: '' }; // Return empty path for invalid percentage
    }
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;

    const a0 = (startAngle * Math.PI) / 180;
    const a1 = (endAngle * Math.PI) / 180;
    const amid = ((startAngle + endAngle) / 2) * (Math.PI / 180);

    const offX = explode * Math.cos(amid);
    const offY = explode * Math.sin(amid);

    const x1 = cx + radius * Math.cos(a0) + offX;
    const y1 = cy + radius * Math.sin(a0) + offY;
    const x2 = cx + radius * Math.cos(a1) + offX;
    const y2 = cy + radius * Math.sin(a1) + offY;

    const largeArcFlag = angle > 180 ? 1 : 0;

    // Ensure full circle for 100% segment
    if (percentage >= 100) {
      return {
        d: `M ${cx} ${cy}
            M ${cx + radius} ${cy}
            A ${radius} ${radius} 0 1 1 ${cx - radius} ${cy}
            A ${radius} ${radius} 0 1 1 ${cx + radius} ${cy}
            Z`
      };
    }

    return {
      d: `M ${cx + offX} ${cy + offY}
          L ${x1} ${y1}
          A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`
    };
  };

  const config = dataConfigs[dataType] || dataConfigs.vehicleTrip;
  
  // Ensure minimum values for rendering
  const adjustedPieData = config.pieData.map(slice => ({
    ...slice,
    value: slice.value === 0 ? 1 : Math.abs(slice.value) // Use absolute value and minimum 1
  }));
  
  const total = adjustedPieData.reduce((sum, slice) => sum + slice.value, 0);
  const pieData = adjustedPieData.map(slice => ({
    ...slice,
    value: total > 0 ? (slice.value / total) * 100 : 50 // Equal split if no data
  }));

  console.log('PieChart: Config for', dataType, ':', config);
  console.log('PieChart: Adjusted pie data:', adjustedPieData);
  console.log('PieChart: Total value:', total);
  console.log('PieChart: Pie data:', pieData);

  // Always show the pie chart, even with default data
  const maxValue = Math.max(...pieData.map(d => d.value));

  const animValues = useRef(
    pieData.map(() => ({
      scale: new Animated.Value(0.5),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    console.log('PieChart: Starting animations for', pieData.length, 'segments');
    const animations = pieData.map((slice, idx) => {
      return Animated.parallel([
        Animated.timing(animValues[idx].scale, {
          toValue: 1,
          duration: 500,
          delay: idx * 100,
          useNativeDriver: true,
        }),
        Animated.timing(animValues[idx].opacity, {
          toValue: 1,
          duration: 500,
          delay: idx * 100,
          useNativeDriver: true,
        }),
      ]);
    });
    Animated.stagger(100, animations).start(() => {
      console.log('PieChart: Animations completed');
    });
  }, [animValues, pieData]);

  const RADIUS = 80;
  const DEPTH = 6;
  const EXPLODE = 5;
  const SVG_W = 220;
  const SVG_H = 220;
  const CX = 110;
  const CY = 110; // Adjusted to center vertically

  return (
    <View style={styles.container}>
      <View style={styles.chartSection}>
        <View style={styles.pieChartContainer}>
          <Svg width={SVG_W} height={SVG_H} style={styles.svg}>
            <Defs>
              <RadialGradient id="shine" cx="50%" cy="40%" r="70%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                <Stop offset="70%" stopColor="#ffffff" stopOpacity="0.0" />
              </RadialGradient>
            </Defs>

            {pieData.reduce((acc, slice, idx) => {
              const start = acc.angle;
              const explodeAmt = slice.value === maxValue ? EXPLODE : 0;
              const { d } = createPieSegmentPath(slice.value, start, RADIUS, explodeAmt, CX, CY);
              acc.angle += (slice.value / 100) * 360;

              if (slice.value > 0) {
                acc.paths.push(
                  <Path
                    key={`depth-${idx}`}
                    d={d}
                    fill={darken(slice.color, 0.6)}
                    opacity={0.95}
                    transform={`translate(0, ${DEPTH})`}
                  />
                );
              }
              return acc;
            }, { angle: -90, paths: [] }).paths}

            {pieData.reduce((acc, slice, idx) => {
              const start = acc.angle;
              const explodeAmt = slice.value === maxValue ? EXPLODE : 0;
              const { d } = createPieSegmentPath(slice.value, start, RADIUS, explodeAmt, CX, CY);
              acc.angle += (slice.value / 100) * 360;

              if (slice.value > 0) {
                acc.paths.push(
                  <AnimatedPath
                    key={`top-${idx}`}
                    d={d}
                    fill={slice.color}
                    stroke="#ffffff"
                    strokeWidth={3}
                    style={{
                      transform: [{ scale: animValues[idx].scale }],
                      opacity: animValues[idx].opacity,
                      transformOrigin: `${CX}px ${CY}px`,
                    }}
                  />
                );
              }
              return acc;
            }, { angle: -90, paths: [] }).paths}

            <Path
              d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 1 1 ${CX + RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 1 1 ${CX - RADIUS} ${CY} Z`}
              fill="url(#shine)"
              pointerEvents="none"
            />
          </Svg>
        </View>

        <View style={styles.labelsContainer}>
          {pieData.map((slice, idx) => (
            <View key={idx} style={styles.dataPoint}>
              <View style={styles.labelRow}>
                <View style={[styles.colorDot, { backgroundColor: slice.color }]} />
                <Text style={styles.labelText}>
                  {idx === 0 ? config.labels.label1 : config.labels.label2}
                </Text>
              </View>
              <Text style={styles.valueText}>
                {idx === 0 ? config.values.value1 : config.values.value2}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartContainer: {
    marginRight: 20,
    right:20,
    bottom:30
  },
  svg: {
    backgroundColor: 'transparent', // Ensure SVG is visible
  },
  labelsContainer: {
    flex: 1,
    right:35,
    bottom:25
  },
  dataPoint: {
    marginBottom: 15,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  labelText: {
    fontSize: 14,
    color: '#666',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 18,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default PieChart;