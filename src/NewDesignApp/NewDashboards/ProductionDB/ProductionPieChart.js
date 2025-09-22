import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";
import Svg, { G, Path, Defs, RadialGradient, Stop } from "react-native-svg";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const size = Math.min(width * 0.7, 250);

// Sample Data
const data = [
  { name: "Raw Material Purchase", value: 40, color: "#216ECF" },
  { name: "Quarry to Crusher", value: 20, color: "#FB9DB3" }, 
  { name: "Crusher to Quarry", value: 15, color: "#D6B0FF" },
  { name: "Quarry to Stockyard", value: 25, color: "#77F5B0" },
];

const ProductionPieChart = () => {
  const svgSize = size + 80;
  const center = svgSize / 2;
  const radius = size * 0.33;
  const innerRadius = size * 0.2;

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

  // Function to start animation
  const startAnimation = () => {
    // Reset segment animations
    animatedOpacity.forEach((anim) => anim.setValue(0));
    animatedScale.forEach((anim) => anim.setValue(0.8));
    labelOpacity.forEach((anim) => anim.setValue(0));
    labelTranslateX.forEach((anim) => anim.setValue(30));
    labelScale.forEach((anim) => anim.setValue(0.8));

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
  };

  // Run animation when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      startAnimation();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  // Custom Animated Path component
  const AnimatedPath = Animated.createAnimatedComponent(Path);

  return (
    <View style={styles.container}>
      {/* Pie Chart View */}
      <View style={styles.mainContent}>
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
      </View>
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
    bottom: 220,
    width: size + 80,
    height: size + 80,
  },
  labelContainer: {
    justifyContent: "center",
    flex: 1, 
    paddingLeft: 20, 
    left: 20,
    bottom: 220
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
});

export default ProductionPieChart;