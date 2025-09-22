import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated } from 'react-native';
import { Svg, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  interpolate,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const SalesPieChart = ({ 
  selectedCategory, 
  data = { daybook: 3045678, stock: 30, cancelledBill: 20, anpr: 25 }, 
  chartTransition
}) => {
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = React.useRef(new RNAnimated.Value(0)).current;

  const categoryColors = {
    daybook: '#4A90E2',    // Blue for Total Amount
    stock: '#50E3C2',     // Green for Total Trip
    cancelledBill: '#FF69B4',
    anpr: '#FFB84D',
  };

  const categories = [
    { key: 'daybook', label: 'Total Amount', value: data.daybook, color: categoryColors.daybook },
    { key: 'stock', label: 'Total Trip', value: data.stock, color: categoryColors.stock },
    { key: 'cancelledBill', label: 'Cancelled Bill', value: data.cancelledBill, color: categoryColors.cancelledBill },
    { key: 'anpr', label: 'ANPR', value: data.anpr, color: categoryColors.anpr },
  ];

  useEffect(() => {
    let interval;
    if (!selectedCategory) {
      // Automatic scrolling when no category is selected
      interval = setInterval(() => {
        setGlowIntensity(prev => (prev >= 1 ? 0 : prev + 0.05));
        setCurrentIndex(prev => (prev + 1) % categories.length);
      }, 1000); // Increased to 4000ms for smoother, less frequent transitions
    } else {
      // Set specific index when a category is selected
      setGlowIntensity(0);
      const selectedIdx = categories.findIndex(
        cat => cat.key.toLowerCase().replace(/\s+/g, '') === 
               selectedCategory.toLowerCase().replace(/\s+/g, '')
      );
      setCurrentIndex(selectedIdx !== -1 ? selectedIdx : 0);
    }
    
    return () => interval && clearInterval(interval);
  }, [selectedCategory, categories.length]);

  useEffect(() => {
    RNAnimated.timing(scrollX, {
      toValue: currentIndex * 180,
      duration: 600, // Slightly longer duration for smoother scrolling
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [currentIndex, scrollX]);

  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  const radius = 70;
  const strokeWidth = 12;
  const centerX = 100;
  const centerY = 100;
  
  const segments = [];
  let startAngle = -90;
  
  Object.entries(data).forEach(([key, value]) => {
    const percentage = (value / total) * 100;
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
    const normalizedSelected = selectedCategory?.toLowerCase().replace(/\s+/g, '');
    const isSelected = normalizedSelected === normalizedKey;
    
    segments.push({
      key,
      startAngle,
      endAngle,
      color: categoryColors[key],
      isSelected,
      percentage,
      value
    });
    
    startAngle = endAngle + 2;
  });

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const pieAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(
        interpolate(chartTransition.value, [0, 0.6, 1], [1, 0.3, 0]),
        { duration: 100, easing: Easing.out(Easing.cubic) } // Increased to 2000ms, cubic easing
      ),
      transform: [
        {
          scale: withTiming(
            interpolate(chartTransition.value, [0, 0.6, 1], [1, 0.85, 0.7]),
            { duration: 100, easing: Easing.out(Easing.cubic) } // Increased to 2000ms
          )
        },
        {
          translateX: withTiming(
            interpolate(chartTransition.value, [0, 1], [0, -100]),
            { duration: 1000, easing: Easing.out(Easing.cubic) }
          )
        }
      ]
    };
  });

  const carouselAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(
        interpolate(chartTransition.value, [0, 0.2, 1], [0, 0.2, 1]),
        { duration: 100, easing: Easing.out(Easing.cubic), delay: 100 } // Increased to 2000ms, 300ms delay
      ),
      transform: [
        {
          scale: withTiming(
            interpolate(chartTransition.value, [0, 0.4, 1], [0.7, 0.85, 1]),
            { duration: 100, easing: Easing.out(Easing.cubic), delay: 100 } // Increased to 2000ms
          )
        },
        // Optional: Add slide-in-from-right effect if desired
        {
          translateX: withTiming(
            interpolate(chartTransition.value, [0, 1], [100, 0]),
            { duration: 2000, easing: Easing.out(Easing.cubic), delay: 300 }
          )
        }
      ]
    };
  });

  const CarouselSlider = () => {
    return (
      <Animated.View style={[styles.carouselContainer, carouselAnimatedStyle]}>
        <RNAnimated.ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={[styles.carouselContent, { justifyContent: 'center' }]}
          scrollEnabled={false}
          snapToInterval={180}
          decelerationRate="fast"
        >
          {categories.map((category, index) => (
            <RNAnimated.View
              key={category.key}
              style={[
                styles.carouselItem,
                { borderColor: category.color },
                {
                  transform: [
                    {
                      translateX: scrollX.interpolate({
                        inputRange: [index * 180, (index + 1) * 180],
                        outputRange: [0, -180],
                        extrapolate: 'clamp'
                      })
                    }
                  ]
                }
              ]}
            >
                <View style={[styles.leftBorder, { backgroundColor: category.color }]} />

              <View style={styles.cardContent}>
                <Text style={styles.carouselLabel}>{category.label}</Text>
                <Text style={[styles.carouselValue]}>
                  {category.key === 'daybook' 
                    ? category.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                    : category.value.toString()
                  }
                </Text>
              </View>
            </RNAnimated.View>
          ))}
        </RNAnimated.ScrollView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { alignSelf: 'center' }]}>
        <Animated.View style={[styles.pieChartWrapper, pieAnimatedStyle]}>
          <Svg width="200" height="200" viewBox="0 0 200 200" style={styles.svg}>
            <Defs>
              {segments.map((segment) => (
                <RadialGradient 
                  key={`glow-${segment.key}`} 
                  id={`glow-${segment.key}`}
                  cx="50%" 
                  cy="50%" 
                  r="50%"
                >
                  <Stop 
                    offset="0%" 
                    stopColor={segment.color} 
                    stopOpacity={segment.isSelected ? 0.8 : 0.6} 
                  />
                  <Stop 
                    offset="100%" 
                    stopColor={segment.color} 
                    stopOpacity={segment.isSelected ? 0.3 : 0.1} 
                  />
                </RadialGradient>
              ))}
            </Defs>
            {segments.map((segment, index) => {
              const glowRadius = segment.isSelected ? radius + (glowIntensity * 10) : radius;
              const currentStrokeWidth = segment.isSelected ? strokeWidth + 4 : strokeWidth;
              
              return (
                <React.Fragment key={`${segment.key}-${index}`}>
                  {segment.isSelected && (
                    <>
                      <Path
                        d={describeArc(centerX, centerY, glowRadius + 8, segment.startAngle, segment.endAngle)}
                        fill="none"
                        stroke={segment.color}
                        strokeWidth={currentStrokeWidth + 8}
                        strokeLinecap="round"
                        opacity={0.15 * (1 - glowIntensity * 0.5)}
                      />
                      <Path
                        d={describeArc(centerX, centerY, glowRadius + 4, segment.startAngle, segment.endAngle)}
                        fill="none"
                        stroke={segment.color}
                        strokeWidth={currentStrokeWidth + 4}
                        strokeLinecap="round"
                        opacity={0.25 * (1 - glowIntensity * 0.3)}
                      />
                    </>
                  )}
                  <Path
                    d={describeArc(centerX, centerY, radius, segment.startAngle, segment.endAngle)}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={currentStrokeWidth}
                    strokeLinecap="round"
                    opacity={segment.isSelected ? 1 : selectedCategory ? 0.4 : 1}
                  />
                </React.Fragment>
              );
            })}
          </Svg>
          <View style={styles.centerContent}>
            <Text style={styles.centerNumber}>20</Text>
            <Text style={styles.centerLabel}>Bills Edited</Text>
          </View>
        </Animated.View>
        <CarouselSlider />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    bottom: 30,
    width: '100%',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    width: '100%',
  },
  pieChartWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  svg: {
    overflow: 'visible',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#374151',
  },
  centerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 160,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carousel: {
    width: '100%',
  },
  carouselContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  carouselItem: {
    width: 160,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  leftBorder: {
    width: 4,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  carouselLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
    bottom:5
  },
  carouselValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color:'#000'
  },
});


export default SalesPieChart;