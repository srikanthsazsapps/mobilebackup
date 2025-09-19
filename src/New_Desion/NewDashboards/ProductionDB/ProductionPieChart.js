import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, Animated, Text } from "react-native";
import Svg, { G, Path, Defs, RadialGradient, Stop } from "react-native-svg";
import { useFocusEffect } from "@react-navigation/native";
import { useAnimatedReaction, runOnJS } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const size = Math.min(width * 0.7, 250);

// Sample Data
const data = [
  { name: "Raw Material Purchase", value: 40, color: "#216ECF" },
  { name: "Quarry to Crusher", value: 20, color: "#FB9DB3" },
  { name: "Crusher to Quarry", value: 15, color: "#D6B0FF" },
  { name: "Quarry to Stockyard", value: 25, color: "#77F5B0" },
];

const categories = [
    { key: 'daybook', label: 'Request Qty', value: '2000 TON' },
    { key: 'stock', label: 'Supplied Qty', value: '500 TON' },
    { key: 'cancelledBill', label: 'Balance Qty', value: '250 TON' },
  ];

const ProductionPieChart = ({ isExpanded }) => {
  const svgSize = size + 80;
  const center = svgSize / 2;
  const radius = size * 0.33;
  const innerRadius = size * 0.2;

  // State for carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Calculate total value
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate angles for each segment with spacing
  const segmentSpacing = 3;
  const totalSpacing = segmentSpacing * data.length;
  const availableAngle = 360 - totalSpacing;

  // Create animated values for each segment
  const animatedOpacity = useRef(data.map(() => new Animated.Value(0))).current;
  const animatedScale = useRef(data.map(() => new Animated.Value(0.8))).current;
  
  // Create animated values for labels
  const labelOpacity = useRef(data.map(() => new Animated.Value(0))).current;
  const labelTranslateX = useRef(data.map(() => new Animated.Value(30))).current;
  const labelScale = useRef(data.map(() => new Animated.Value(0.8))).current;

  // Create animated values for carousel
  const carouselOpacity = useRef(new Animated.Value(0)).current;
  const carouselScale = useRef(new Animated.Value(0.8)).current;
  const carouselTranslateX = useRef(new Animated.Value(100)).current;

  // Create animated values for pie chart container
  const pieChartOpacity = useRef(new Animated.Value(1)).current;
  const pieChartScale = useRef(new Animated.Value(1)).current;
  const pieChartTranslateX = useRef(new Animated.Value(0)).current;

  // Calculate segment details with percentage
  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * availableAngle;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const midAngle = (startAngle + endAngle) / 2;

    currentAngle += angle + segmentSpacing;

    return {
      ...item,
      percentage: Math.round(percentage),
      startAngle,
      endAngle,
      midAngle,
      angle,
    };
  });

  // State to track expansion for React components
  const [isExpandedState, setIsExpandedState] = useState(false);

  // Listen to shared value changes using useAnimatedReaction
  useAnimatedReaction(
    () => isExpanded.value,
    (currentValue, previousValue) => {
      if (currentValue !== previousValue) {
        runOnJS(setIsExpandedState)(currentValue);
      }
    },
    [isExpanded]
  );

  // Carousel auto-scroll effect when expanded
  useEffect(() => {
    let interval;
    if (isExpandedState) {
      interval = setInterval(() => {
        setGlowIntensity(prev => (prev >= 1 ? 0 : prev + 0.05));
        setCurrentIndex(prev => (prev + 1) % segments.length);
      }, 3000);
    } else {
      setGlowIntensity(0);
      setCurrentIndex(0);
    }
    
    return () => interval && clearInterval(interval);
  }, [isExpandedState, segments.length]);

  // Animate carousel scroll
  useEffect(() => {
    Animated.timing(scrollX, {
      toValue: currentIndex * 180,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, scrollX]);

  // Function to create SVG path for donut segment
  const createPath = (startAngle, angle, outerRadius, innerRadius) => {
    const endAngle = startAngle + angle;
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;

    const x1 = center + outerRadius * Math.cos(startAngleRad);
    const y1 = center + outerRadius * Math.sin(startAngleRad);
    const x2 = center + outerRadius * Math.cos(endAngleRad);
    const y2 = center + outerRadius * Math.sin(endAngleRad);

    const x3 = center + innerRadius * Math.cos(endAngleRad);
    const y3 = center + innerRadius * Math.sin(endAngleRad);
    const x4 = center + innerRadius * Math.cos(startAngleRad);
    const y4 = center + innerRadius * Math.sin(startAngleRad);

    const largeArcFlag = angle <= 180 ? "0" : "1";

    return [
      "M", x1, y1,
      "A", outerRadius, outerRadius, 0, largeArcFlag, 1, x2, y2,
      "L", x3, y3,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 0, x4, y4,
      "Z"
    ].join(" ");
  };

  // Function to start animation based on isExpanded
  const startAnimation = () => {
    if (isExpandedState) {
      // Animate pie chart out and carousel in
      Animated.parallel([
        // Pie chart exit animation
        Animated.timing(pieChartOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pieChartScale, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pieChartTranslateX, {
          toValue: -100,
          duration: 500,
          useNativeDriver: true,
        }),
        // Carousel enter animation
        Animated.timing(carouselOpacity, {
          toValue: 1,
          duration: 400,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.spring(carouselScale, {
          toValue: 1,
          delay: 200,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(carouselTranslateX, {
          toValue: 0,
          duration: 500,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate carousel out and pie chart in
      Animated.parallel([
        // Carousel exit animation
        Animated.timing(carouselOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(carouselScale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(carouselTranslateX, {
          toValue: 100,
          duration: 400,
          useNativeDriver: true,
        }),
        // Pie chart enter animation
        Animated.timing(pieChartOpacity, {
          toValue: 1,
          duration: 400,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pieChartScale, {
          toValue: 1,
          duration: 400,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pieChartTranslateX, {
          toValue: 0,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start pie chart segments animation after transition
        const opacityAnimations = segments.map((segment, index) =>
          Animated.timing(animatedOpacity[index], {
            toValue: 1,
            duration: 400,
            delay: index * 100,
            useNativeDriver: true,
          })
        );

        const scaleAnimations = segments.map((segment, index) =>
          Animated.timing(animatedScale[index], {
            toValue: 1,
            duration: 400,
            delay: index * 100,
            useNativeDriver: true,
          })
        );

        const labelOpacityAnimations = segments.map((segment, index) =>
          Animated.timing(labelOpacity[index], {
            toValue: 1,
            duration: 500,
            delay: 200 + (index * 120),
            useNativeDriver: true,
          })
        );

        const labelSlideAnimations = segments.map((segment, index) =>
          Animated.timing(labelTranslateX[index], {
            toValue: 0,
            duration: 500,
            delay: 200 + (index * 120),
            useNativeDriver: true,
          })
        );

        const labelScaleAnimations = segments.map((segment, index) =>
          Animated.spring(labelScale[index], {
            toValue: 1,
            delay: 250 + (index * 120),
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          })
        );

        Animated.parallel([
          Animated.stagger(100, opacityAnimations),
          Animated.stagger(100, scaleAnimations),
          Animated.stagger(120, labelOpacityAnimations),
          Animated.stagger(120, labelSlideAnimations),
          Animated.stagger(120, labelScaleAnimations),
        ]).start();
      });

      // Reset segment animations
      animatedOpacity.forEach((anim) => anim.setValue(0));
      animatedScale.forEach((anim) => anim.setValue(0.8));
      labelOpacity.forEach((anim) => anim.setValue(0));
      labelTranslateX.forEach((anim) => anim.setValue(30));
      labelScale.forEach((anim) => anim.setValue(0.8));
    }
  };

  // Run animation when the screen comes into focus or isExpanded changes
  useFocusEffect(
    React.useCallback(() => {
      startAnimation();
      return () => {
        // Cleanup if needed
      };
    }, [isExpandedState])
  );

  // Custom Animated Path component
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  // Carousel Component
  // Replace CarouselSlider with this
const CarouselSlider = () => {
  return (
    <Animated.View
      style={[
        styles.carouselContainer,
        {
          opacity: carouselOpacity,
          transform: [{ scale: carouselScale }, { translateX: carouselTranslateX }],
        },
      ]}
    >
      <View style={styles.singleCard}>
        {/* First row - Raw Material Purchase */}
        <View style={styles.firstRow}>
          <Text style={styles.firstRowLabel}>{data[0].name}</Text>
          <Text style={styles.firstRowValue}>
            {data[0].value.toLocaleString()}
          </Text>
        </View>

        {/* Second row - Other 3 values */}
        <View style={styles.secondRow}>
          {data.slice(1).map((item, index) => (
            <View key={index} style={styles.secondRowItem}>
              <Text style={styles.secondRowLabel}>{item.name}</Text>
              <Text style={styles.secondRowValue}>
                {item.value.toLocaleString()} TON
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

  
  return (
    <View style={styles.container}>
      {/* Pie Chart View */}
      <Animated.View 
        style={[
          styles.mainContent,
          {
            opacity: pieChartOpacity,
            transform: [
              { scale: pieChartScale },
              { translateX: pieChartTranslateX }
            ]
          }
        ]}
      >
        <View style={styles.chartContainer}>
          <Svg width={svgSize} height={svgSize}>
            <Defs>
              {segments.map((segment, index) => (
                <RadialGradient 
                  key={`glow-${index}`} 
                  id={`glow-${index}`}
                  cx="50%" 
                  cy="50%" 
                  r="50%"
                >
                  <Stop 
                    offset="0%" 
                    stopColor={segment.color} 
                    stopOpacity={0.8} 
                  />
                  <Stop 
                    offset="100%" 
                    stopColor={segment.color} 
                    stopOpacity={0.1} 
                  />
                </RadialGradient>
              ))}
            </Defs>
            <G>
              {segments.map((segment, index) => (
                <G key={index}>
                  <AnimatedPath
                    d={createPath(segment.startAngle, segment.angle, radius, innerRadius)}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth={2}
                    opacity={animatedOpacity[index]}
                    transform={[
                      {
                        scale: animatedScale[index]
                      }
                    ]}
                    style={{
                      transformOrigin: `${center}px ${center}px`
                    }}
                  />
                </G>
              ))}
            </G>
          </Svg>
        </View>
        
        <View style={styles.labelContainer}>
          {segments.map((segment, index) => (
            <Animated.View 
              key={index} 
              style={[
                styles.labelItem,
                {
                  opacity: labelOpacity[index],
                  transform: [
                    { translateX: labelTranslateX[index] },
                    { scale: labelScale[index] }
                  ]
                }
              ]}
            >
              <Animated.View 
                style={[
                  styles.colorBox, 
                  { 
                    backgroundColor: segment.color,
                    transform: [{ scale: labelScale[index] }]
                  }
                ]} 
              />
              <View style={styles.labelTextContainer}>
                <Animated.Text 
                  style={[
                    styles.labelText,
                    {
                      opacity: labelOpacity[index],
                      transform: [{ scale: labelScale[index] }]
                    }
                  ]}
                >
                  {segment.name}
                </Animated.Text>
                <Animated.Text 
                  style={[
                    styles.valueText,
                    {
                      opacity: labelOpacity[index],
                      transform: [{ scale: labelScale[index] }]
                    }
                  ]}
                >
                  {segment.value.toLocaleString()}
                </Animated.Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Carousel View */}
      <CarouselSlider />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  mainContent: {
    flexDirection: "row", 
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%", 
  },
  chartContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1, 
    left: 15,
    top: 40,
    width: size + 80,
    height: size + 80,
  },
  labelContainer: {
    justifyContent: "center",
    flex: 1, 
    paddingLeft: 20, 
    left: 30,
    top: 50
  },
  labelItem: {
    flexDirection: "row",
    alignItems: "center", 
    marginVertical: 8,
  },
  colorBox: {
    width: 3,
    height: 30,
    marginRight: 10,
    borderRadius: 2,
  },
  labelTextContainer: {
    flexDirection: "column",
  },
  labelText: {
    fontSize: 10.16,
    color: "#7F7B7B",
    fontWeight: "500",
  },
  valueText: {
    fontSize: 18,
    color: "#555",
    fontWeight: "600",
  },
  // Carousel Styles
  carouselContainer: {
    position: 'absolute',
    top: '50%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    top:-25
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
  },
  carouselValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  singleCard: {
  width: '90%',
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  borderColor:'#A2A2A2',
  borderWidth:1
  // elevation: 3,
},

firstRow: {
  marginBottom: 12,
  marginLeft:8
},

firstRowLabel: {
  fontSize: 12,
  color: '#6B7280',
  fontWeight: '500',
},

firstRowValue: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#000',
},

secondRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap:17
},

secondRowItem: {
  alignItems: 'center',
  flex: 1,
},

secondRowLabel: {
  fontSize: 10,
  color: '#6B7280',
  marginBottom: 4,
  textAlign: 'center',
},

secondRowValue: {
  fontSize: 16,
  fontWeight: '600',
  color: '#000',
  textAlign: 'center',
},

});

export default ProductionPieChart;