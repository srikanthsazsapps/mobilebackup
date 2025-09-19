import React, { useEffect, useRef, useState, useContext } from "react";
import { View, Text, StyleSheet, Animated, Image } from "react-native";
import Svg, { Path, Defs, RadialGradient, Stop, Circle } from "react-native-svg";
import { DashesDataContext } from "../../../components/common/DashesDataContext";

// ✅ replace with your actual image path
import netProfitImg from "../../../images/NetProfit.png";

// Only this addition: highlighted prop, default "Income"
const PieChart = ({
  size = 280,
  innerRadius = 0,
  showValues = true,
  currency = "₹",
  animated = true,
  highlighted = "Income", // <-- ADD THIS LINE
}) => {
  const {
    profitLossData,
    loadingStates,
    getTotalByCategory,
    getNetProfitLoss,
  } = useContext(DashesDataContext);

  const [animatedValues, setAnimatedValues] = useState([0, 0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const animRefs = useRef([new Animated.Value(1), new Animated.Value(1)]).current;

  const calculateTotalIncome = () => {
    if (!profitLossData || !Array.isArray(profitLossData)) return 0;
    return profitLossData
      .flat()
      .filter(item => {
        const category = (item?.Category || '').toLowerCase().trim();
        return category === 'income' || category === 'incomes';
      })
      .reduce((sum, item) => sum + (parseFloat(item?.Amount || 0)), 0);
  };

  const calculateTotalExpenses = () => {
    if (!profitLossData || !Array.isArray(profitLossData)) return 0;
    return profitLossData
      .flat()
      .filter(item => {
        const category = (item?.Category || '').toLowerCase().trim();
        return category === 'expenses' || category === 'expense' || category === 'expenditure';
      })
      .reduce((sum, item) => sum + (parseFloat(item?.Amount || 0)), 0);
  };

  const calculateNetProfit = () => {
    const income = calculateTotalIncome();
    const expenses = calculateTotalExpenses();
    return income - expenses;
  };

  const totalIncome = calculateTotalIncome();
  const totalExpenses = calculateTotalExpenses();

  const data = [
    { label: "Income", value: totalIncome, color: "#3B82F6" },
    { label: "Expense", value: totalExpenses, color: "#EF4444" },
  ];

  useEffect(() => {
    if (!animated) {
      setAnimatedValues([totalIncome, totalExpenses]);
      return;
    }

    animRefs.forEach((animValue) => animValue.setValue(0));
    setIsAnimating(true);
    setAnimatedValues([0, 0]);

    const animations = [
      Animated.timing(animRefs[0], {
        toValue: 1,
        duration: 800,
        delay: 0,
        useNativeDriver: false,
      }),
      Animated.timing(animRefs[1], {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: false,
      })
    ];

    Animated.parallel(animations).start(() => {
      setIsAnimating(false);
      setAnimatedValues([totalIncome, totalExpenses]);
    });

    const listeners = animRefs.map((animValue, index) => {
      return animValue.addListener(({ value }) => {
        const smoothProgress = Math.max(0, Math.min(value, 1));
        setAnimatedValues((prev) => {
          const newValues = [...prev];
          newValues[index] = (index === 0 ? totalIncome : totalExpenses) * smoothProgress;
          return newValues;
        });
      });
    });

    return () => {
      listeners.forEach((listener, index) => {
        animRefs[index].removeListener(listener);
      });
    };
  }, [totalIncome, totalExpenses, animated]);

  const formatValue = (value) => {
    if (value >= 10000000)
      return `${currency}${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000)
      return `${currency}${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `${currency}${(value / 1000).toFixed(1)}K`;
    return `${currency}${Math.round(value).toLocaleString()}`;
  };

  const radius = size / 2 - 60;
  const centerX = (size + 120) / 2;
  const centerY = (size + 80) / 2;
  const total = animatedValues.reduce((sum, value) => sum + value, 0);

  if (loadingStates?.profitLoss) {
    return (
      <View style={[
        styles.container,
        { width: size + 120, height: size + 80, marginTop: -50 },
      ]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chart data...</Text>
        </View>
      </View>
    );
  }

  if (total === 0) {
    return (
      <View style={[
        styles.container,
        { width: size + 120, height: size + 80, marginTop: -50 },
      ]}>
        <Svg width={size + 120} height={size + 80}>
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="#f3f4f6"
            opacity="0.3"
          />
        </Svg>
      </View>
    );
  }

  let currentAngle = -90;
  const segments = animatedValues.map((value, index) => {
    const angle = (value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = angle > 180 ? 1 : 0;
    let pathData;
    if (angle >= 360) {
      pathData = `M ${centerX} ${centerY - radius}
                  A ${radius} ${radius} 0 1 1 ${centerX - 0.1} ${
                    centerY - radius
                  }
                  Z`;
    } else {
      pathData = `M ${centerX} ${centerY}
                  L ${x1} ${y1}
                  A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                  Z`;
    }

    const labelAngle = (startAngle + endAngle) / 2;
    let labelRadius = data[index]?.label === "Income" ? radius + 15 : radius + 25;
    if (labelAngle > 90 || labelAngle < -90) {
      labelRadius += 15;
    }

    const labelAngleRad = (labelAngle * Math.PI) / 180;
    const labelX = centerX + labelRadius * Math.cos(labelAngleRad);
    const labelY = centerY + labelRadius * Math.sin(labelAngleRad);

    currentAngle += angle;

    return {
      pathData,
      color: data[index]?.color || "#3B82F6",
      value: data[index]?.value || 0,
      label: data[index]?.label || "",
      labelX,
      labelY,
      index,
    };
  });

  return (
    <View
      style={[
        styles.container,
        { width: size + 120, height: size + 80, marginTop: -50 },
      ]}
    >
      <Svg width={size + 120} height={size + 80}>
        <Defs>
          <RadialGradient id="shine" cx="50%" cy="36%" r="80%">
            <Stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
            <Stop offset="72%" stopColor="#fff" stopOpacity="0.0" />
          </RadialGradient>
        </Defs>

        {segments.map((segment, index) => {
          // Only this change for highlight:
          const isHighlighted = highlighted?.toLowerCase() === segment.label.toLowerCase();
          return (
            <Path
              key={`segment-${index}`}
              d={segment.pathData}
              fill={segment.color}
              stroke={isHighlighted ? "#000" : "white"}
              strokeWidth={isHighlighted ? 4 : 4}
              opacity={isHighlighted ? 1 : 0.9}
            />
          );
        })}

        {innerRadius > 0 && (
          <Circle
            cx={centerX}
            cy={centerY}
            r={innerRadius}
            fill="white"
            stroke="white"
            strokeWidth="2"
          />
        )}

        <Path
          d={`M ${centerX - radius} ${centerY} 
                A ${radius} ${radius} 0 1 1 ${centerX + radius} ${centerY} 
                A ${radius} ${radius} 0 1 1 ${centerX - radius} ${centerY} Z`}
          fill="url(#shine)"
          pointerEvents="none"
        />
      </Svg>

      {showValues &&
        segments.map((segment, index) => (
          <View
            key={`text-${index}`}
            style={[
              styles.labelContainer,
              { left: segment.labelX - 20, top: segment.labelY - 60 },
            ]}
          >
            <Text style={[styles.labelText, { color: "#374151" }]}>
              {segment.label}
            </Text>
            <Text style={[styles.valueText, { color: "#111827" }]}>
              {formatValue(segment.value)}
            </Text>
          </View>
        ))}

      <View style={styles.netProfitBox}>
        <View style={styles.netProfitTextWrap}>
          <Text style={styles.netProfitLabel}>Net Profit</Text>
          <Text 
            style={[
              styles.netProfitValue, 
              { color: calculateNetProfit() >= 0 ? '#4A90E2' : '#EF4444' }
            ]}
          >
            {formatValue(calculateNetProfit())}
          </Text>
        </View>
        <Image
          source={netProfitImg}
          style={styles.netProfitImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    position: "relative",
    top: 50,
  },
  labelContainer: {
    position: "absolute",
    width: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 2,
    fontWeight: "600",
  },
  valueText: { fontSize: 12, textAlign: "center", fontWeight: "bold" },
  netProfitBox: {
    width: 100,
    height: 80,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    top: -50,
  },
  netProfitTextWrap: {},
  netProfitLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginBottom: 5,
    paddingLeft: 10,
  },
  netProfitValue: {
    fontSize: 20,
    fontWeight: "bold",
    paddingLeft: 10,
  },
  netProfitImage: { width: 80, height: 80 },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  noDataContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default PieChart;
