import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Animated,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';

// Utility function for donut arcs
const describeArc = (cx, cy, r, thickness, startAngle, endAngle) => {
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };
  const startOuter = polarToCartesian(cx, cy, r, endAngle);
  const endOuter = polarToCartesian(cx, cy, r, startAngle);
  const startInner = polarToCartesian(cx, cy, r - thickness, endAngle);
  const endInner = polarToCartesian(cx, cy, r - thickness, startAngle);
  const arcSweep = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M', startOuter.x, startOuter.y,
    'A', r, r, 0, arcSweep, 0, endOuter.x, endOuter.y,
    'L', endInner.x, endInner.y,
    'A', r - thickness, r - thickness, 0, arcSweep, 1, startInner.x, startInner.y,
    'Z',
  ].join(' ');
};

const chartData = [
  { value: 35, color: '#4A90E2' }, // blue
  { value: 25, color: '#7ED321' }, // green
  { value: 20, color: '#F5A623' }, // orange
  { value: 20, color: '#BD10E0' }, // violet
];

const iconFontMap = {
  'EB Reading': '🏭',
  'Diesel Usage': '⛽',
};

const ProductionDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const navigation = useNavigation();

  const translateY = useRef(new Animated.Value(0)).current;

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY, velocityY } = event.nativeEvent;
      let toValue = 0;
      if (translationY > 100 || velocityY > 500) {
        toValue = 300;
      } else {
        toValue = 0;
      }
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    }
  };

  const renderDonutChart = () => {
    const size = 180;
    const strokeWidth = 22;
    const center = size / 2;
    const radius = center - 6;
    let startAngle = 0;

    return (
      <Svg width={size} height={size} style={styles.chartSvg}>
        <G>
          {chartData.map((seg, idx) => {
            const endAngle = startAngle + (seg.value / 100) * 360;
            const arc = describeArc(center, center, radius, strokeWidth, startAngle, endAngle);
            startAngle = endAngle;
            return <Path key={idx} d={arc} fill={seg.color} />;
          })}
        </G>
      </Svg>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Production</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Donut Chart */}
      <View style={styles.chartContainer}>
        <View style={styles.chartBox}>{renderDonutChart()}</View>
      </View>

      {/* Period Toggle */}
      <View style={styles.periodContainer}>
        {['Today', 'Yesterday', 'Month', 'Custom'].map(period => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              selectedPeriod === period && styles.selectedPeriod,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period && styles.selectedPeriodText,
              ]}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Draggable Usage Details Panel */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.detailsContainer,
            {
              transform: [
                {
                  translateY: translateY.interpolate({
                    inputRange: [0, 300],
                    outputRange: [0, 300],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.detailsDrag} />
          <Text style={styles.detailsHeader}>Usage detail</Text>

          <View style={styles.detailsRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>EB Reading</Text>
              <View style={styles.detailData}>
                <Text style={styles.detailValue}>320</Text>
                <Text style={styles.detailUnit}>Unit</Text>
                <Text style={styles.detailEmoji}>{iconFontMap['EB Reading']}</Text>
              </View>
            </View>

            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Diesel Usage</Text>
              <View style={styles.detailData}>
                <Text style={styles.detailValue}>1000</Text>
                <Text style={styles.detailUnit}>Liter</Text>
                <Text style={styles.detailEmoji}>{iconFontMap['Diesel Usage']}</Text>
              </View>
            </View>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Total Net Weight</Text>
              <Text style={styles.detailBigValue}>200 TON</Text>
            </View>

            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Transport Amount</Text>
              <Text style={styles.detailBigValue}>2,00,000</Text>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2B2B2B',
  },
  menuButton: {
    backgroundColor: '#444B5A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 18,
  },
  menuText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: { alignItems: 'center', marginTop: 20, marginBottom: 4 },
  chartBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  periodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginVertical: 13,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
  },
  selectedPeriod: {
    backgroundColor: '#3976FE',
  },
  periodText: {
    fontSize: 13,
    color: '#222',
    fontWeight: '700',
  },
  selectedPeriodText: {
    color: '#fff',
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
  },
  detailsDrag: {
    alignSelf: 'center',
    width: 50,
    height: 5,
    backgroundColor: '#CCC',
    borderRadius: 3,
    marginBottom: 10,
  },
  detailsHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    marginBottom: 14,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  detailBox: {
    width: '48%',  // 50% - a little margin
    backgroundColor: '#F7F7FC',
    padding: 12,
    borderRadius: 14,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 13,
    color: '#7C7D89',
    marginBottom: 8,
    fontWeight: '600',
  },
  detailData: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailEmoji: {
    fontSize: 22,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  detailUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginLeft: 4,
  },
  detailBigValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginTop: 4,
  },
});

export default ProductionDashboard;
