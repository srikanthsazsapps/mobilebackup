import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Path } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// CutBar component with top border stroke spanning full top edge
const CutBar = ({
  height: barHeight,
  width: barWidth,
  cut = 12,
  color1,
  color2,
  borderColor = '#000',
  borderWidth = 2,
}) => {
  // Main fill path
  const fillPath = `
    M0,0
    H${barWidth - cut}
    L${barWidth},${cut}
    V${barHeight}
    H0
    Z
  `;

  // Top border stroke path (from left corner across the diagonal)
  const topBorderPath = `
    M0,0
    H${barWidth - cut}
    L${barWidth},${cut}
  `;

  return (
    <Svg height={barHeight} width={barWidth} style={{ position: 'absolute', bottom: 0, left: 0 }}>
      {/* Gradient fill */}
      <Defs>
        <SvgGradient id="grad" x1="0.5" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor={color1} />
          <Stop offset="1" stopColor={color2} />
        </SvgGradient>
      </Defs>

      {/* Filled bar */}
      <Path d={fillPath} fill="url(#grad)" />

      {/* Top border stroke */}
      <Path
        d={topBorderPath}
        stroke={borderColor}
        strokeWidth={borderWidth}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
};

const AccountBarChart = ({ isExpanded }) => {
  const receivablesAmount = '₹2,22,76,533';
  const payablesAmount = '₹6,45,31,874';

  const receivablesHeight = 120;
  const payablesHeight = 120;
  const barWidth = 50;
  const cutSize = 12;
  const dotSize = 5;
  const lineHeight = 18;

  const receivableColor = '#84b5f5ff';
  const payableColor = '#D6B0FF';

  // Animation for the bar chart container - completely invisible when expanded
  const animatedBarChartStyle = useAnimatedStyle(() => {
    const expandedValue = isExpanded?.value || 0;
    
    return {
      opacity: interpolate(expandedValue, [0, 0.3], [1, 0], 'clamp'),
      transform: [
        {
          scale: interpolate(expandedValue, [0, 0.5], [1, 0.8], 'clamp'),
        },
      ],
      pointerEvents: expandedValue > 0.5 ? 'none' : 'auto',
    };
  });

  // Animation for the cards - show when expanded
  const animatedCardsStyle = useAnimatedStyle(() => {
    const expandedValue = isExpanded?.value || 0;
    
    return {
      opacity: interpolate(expandedValue, [0.3, 0.7, 1], [0, 0.5, 1], 'clamp'),
      transform: [
        {
          translateY: interpolate(expandedValue, [0, 1], [50, 0], 'clamp'),
        },
        {
          scale: interpolate(expandedValue, [0.3, 1], [0.9, 1], 'clamp'),
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      {/* Bar Chart - Completely hidden when expanded */}
      <Animated.View style={[styles.mainContainer, animatedBarChartStyle]}>
        <View style={styles.chartContainer}>
          {/* Outstanding Text in Top-Left Corner */}
          <View style={styles.outstandingText}>
            <Text style={styles.outstandingLabel}>Outstanding Amount</Text>
            <Text style={styles.outstandingAmount}>23,78,767</Text>
          </View>

          {/* Receivables */}
          <View style={styles.column}>
            <Text style={[styles.amountText, { color: '#0270FF' }]}>{receivablesAmount}</Text>
            <View style={styles.barWrapper}>
              <CutBar
                height={receivablesHeight}
                width={barWidth}
                cut={cutSize}
                color1={receivableColor}
                color2="#fff"
                borderColor="#3E89EC"
                borderWidth={2}
              />
              {/* Connector */}
              <View style={[styles.connector, { bottom: receivablesHeight, right: 46 }]}>
                <View
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: '#0270FF',
                    marginTop: 2,
                  }}
                />
                <View style={{ width: 2, height: lineHeight, backgroundColor: '#0270FF' }} />
              </View>
            </View>
          </View>

          {/* Payables */}
          <View style={styles.column}>
            <Text style={[styles.amountText, { color: '#AF66FF' }]}>{payablesAmount}</Text>
            <View style={styles.barWrapper}>
              <CutBar
                height={payablesHeight}
                width={barWidth}
                cut={cutSize}
                color1={payableColor}
                color2="#fff"
                borderColor="#A569BD"
                borderWidth={2}
              />
              <View style={[styles.connector, { bottom: payablesHeight, right: 46 }]}>
                <View
                  style={{
                    width: dotSize,
                    height: dotSize,
                    borderRadius: dotSize / 2,
                    backgroundColor: '#AF66FF',
                    marginTop: 2,
                  }}
                />
                <View style={{ width: 2, height: lineHeight, backgroundColor: '#AF66FF' }} />
              </View>
            </View>
          </View>
        </View>

        {/* Labels */}
        <View style={styles.bottomSection}>
          <Text style={styles.labelText}>Receivables</Text>
          <Text style={styles.labelText}>Payables</Text>
        </View>
      </Animated.View>

      {/* Cards View - Show when expanded */}
      <Animated.View style={[styles.cardsContainer, animatedCardsStyle]}>
        <View style={styles.cardsRow}>
          {/* Receivables Card */}
          <View style={[styles.card, styles.receivablesCard]}>
            <Text style={styles.cardTitle}>Total Receivables</Text>
            <Text style={[styles.cardAmount, { color: '#0270FF' }]}>{receivablesAmount}</Text>
            
          </View>

          {/* Payables Card */}
          <View style={[styles.card, styles.payablesCard]}>
            <Text style={styles.cardTitle}>Total Payables</Text>
            <Text style={[styles.cardAmount, { color: '#AF66FF' }]}>{payablesAmount}</Text>
          </View>
        </View>
       
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
    position: 'relative',
  },
  mainContainer: {
    width: width * 0.88,
    maxWidth: 480,
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 8,
    bottom: 200,
  },
  chartContainer: {
    paddingVertical: 5,
    paddingHorizontal: 26,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: '#fbfdff',
    position: 'relative', 
  },
  outstandingText: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3f3f3ff',
    paddingHorizontal: 12,
    paddingVertical: 6,        
    borderRadius: 8,     
  },
  outstandingLabel: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  outstandingAmount: {
    fontSize: 15,
    color: '#3E89EC',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  column: {
    alignItems: 'center',
    width: 100,
  },
  amountText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    marginBottom: 8,
    top: 50,
    left: 15,
    textAlign: 'center',
  },
  barWrapper: {
    height: 140,
    width: 50,
    position: 'relative',
    justifyContent: 'flex-end',
    top: 50,
  },
  connector: {
    position: 'absolute',
    alignItems: 'center',
  },
  bottomSection: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
  },
  labelText: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  cardsContainer: {
    position: 'absolute',
    width: '120%',
    height:30,
    top: 10,
    paddingHorizontal: 30,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 15,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
    bottom:3
  },
  receivablesCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#0270FF',
  },
  payablesCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#AF66FF',
  },
  cardTitle: {
    fontSize: 12,
    color: '#787878',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  cardAmount: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  cardSubtitle: {
    marginTop: 4,
  },
  cardSubtitleText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  outstandingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    alignItems: 'center',
    borderTopWidth: 4,
    borderTopColor: '#3E89EC',
  },
  outstandingCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  outstandingCardAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#3E89EC',
    textAlign: 'center',
    marginBottom: 4,
  },
  outstandingCardSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
});

export default AccountBarChart;