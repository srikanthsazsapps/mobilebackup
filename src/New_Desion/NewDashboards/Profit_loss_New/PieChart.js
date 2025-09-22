import React, { useEffect, useRef, useState, useContext } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { DashesDataContext } from "../../../components/common/DashesDataContext";

const UpArrowIcon = ({ color = '#10B981', size = 12 }) => (
  <View style={{ 
    width: 0, 
    height: 0, 
    borderLeftWidth: size / 2, 
    borderRightWidth: size / 2, 
    borderBottomWidth: size, 
    borderBottomColor: color, 
    borderLeftColor: 'transparent', 
    borderRightColor: 'transparent', 
    marginBottom: 2 
  }} />
);

const DownArrowIcon = ({ color = '#EF4444', size = 12 }) => (
  <View style={{ 
    width: 0, 
    height: 0, 
    borderLeftWidth: size / 2, 
    borderRightWidth: size / 2, 
    borderTopWidth: size, 
    borderTopColor: color,
    borderLeftColor: 'transparent', 
    borderRightColor: 'transparent', 
    marginTop: 2 
  }} />
);

const PieChart = ({
  size = 280,
  showValues = true,
  currency = "₹",
  animated = true,
  highlighted = "Income",
  selectedTimeFilter, // Added prop
}) => {
  const {
    profitLossData,
    previousProfitLossData,
    loadingStates,
    previousPeriodLoading,
    setPreviousTodayRange,
    setPreviousYesterdayRange,
    setPreviousWeekRange,
    setPreviousMonthRange,
  } = useContext(DashesDataContext);

  const [animatedValues, setAnimatedValues] = useState([0, 0]);
  const animRefs = useRef([new Animated.Value(0), new Animated.Value(0)]).current;

  const DEFAULT_INCOME = 0;
  const DEFAULT_EXPENSES = 0;

  const calculateTotalIncome = () => {
    if (!profitLossData || !Array.isArray(profitLossData)) return DEFAULT_INCOME;
    return profitLossData
      .flat()
      .filter(item => {
        const category = (item?.Category || '').toLowerCase().trim();
        return category === 'income' || category === 'incomes';
      })
      .reduce((sum, item) => sum + (parseFloat(item?.Amount || 0)), 0) || DEFAULT_INCOME;
  };

  const calculateTotalExpenses = () => {
    if (!profitLossData || !Array.isArray(profitLossData)) return DEFAULT_EXPENSES;
    return profitLossData
      .flat()
      .filter(item => {
        const category = (item?.Category || '').toLowerCase().trim();
        return category === 'expenses' || category === 'expense' || category === 'expenditure';
      })
      .reduce((sum, item) => sum + (parseFloat(item?.Amount || 0)), 0) || DEFAULT_EXPENSES;
  };

  const calculatePreviousTotalIncome = () => {
    if (!previousProfitLossData || !Array.isArray(previousProfitLossData)) return DEFAULT_INCOME;
    return previousProfitLossData
      .flat()
      .filter(item => {
        const category = (item?.Category || '').toLowerCase().trim();
        return category === 'income' || category === 'incomes';
      })
      .reduce((sum, item) => sum + (parseFloat(item?.Amount || 0)), 0) || DEFAULT_INCOME;
  };

  const calculatePreviousTotalExpenses = () => {
    if (!previousProfitLossData || !Array.isArray(previousProfitLossData)) return DEFAULT_EXPENSES;
    return previousProfitLossData
      .flat()
      .filter(item => {
        const category = (item?.Category || '').toLowerCase().trim();
        return category === 'expenses' || category === 'expense' || category === 'expenditure';
      })
      .reduce((sum, item) => sum + (parseFloat(item?.Amount || 0)), 0) || DEFAULT_EXPENSES;
  };

  const totalIncome = calculateTotalIncome();
  const totalExpenses = calculateTotalExpenses();
  const previousTotalIncome = calculatePreviousTotalIncome();
  const previousTotalExpenses = calculatePreviousTotalExpenses();

  console.log('PieChart: Current profitLossData:', JSON.stringify(profitLossData, null, 2));
  console.log('PieChart: Previous profitLossData:', JSON.stringify(previousProfitLossData, null, 2));
  console.log('PieChart: Current totals - Income:', totalIncome, 'Expenses:', totalExpenses);
  console.log('PieChart: Previous totals - Income:', previousTotalIncome, 'Expenses:', previousTotalExpenses);

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = ((current - previous) / previous) * 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(change / 100).replace(/^-/, change < 0 ? "-" : "+");
  };

  const incomePercentageChange = calculatePercentageChange(totalIncome, previousTotalIncome);
  const expensePercentageChange = calculatePercentageChange(totalExpenses, previousTotalExpenses);

  useEffect(() => {
    const fetchPreviousData = async () => {
      try {
        console.log('PieChart: Fetching previous period data for:', selectedTimeFilter);
        switch (selectedTimeFilter) {
          case "Today":
            await setPreviousTodayRange('profitLoss');
            break;
          case "Yesterday":
            await setPreviousYesterdayRange('profitLoss');
            break;
          case "Week":
            await setPreviousWeekRange('profitLoss');
            break;
          case "Month":
            await setPreviousMonthRange('profitLoss');
            break;
          case "Custom":
            // Do nothing here, as it's handled in DateFilter
            break;
          default:
            await setPreviousTodayRange('profitLoss');
        }
      } catch (error) {
        console.error('PieChart: Error fetching previous period data:', error);
      }
    };

    fetchPreviousData();
  }, [selectedTimeFilter]);

  useEffect(() => {
    if (!animated) {
      setAnimatedValues([totalIncome, totalExpenses]);
      return;
    }

    animRefs[0].setValue(0);
    animRefs[1].setValue(0);
    setAnimatedValues([0, 0]);

    const animations = [
      Animated.timing(animRefs[0], {
        toValue: totalIncome,
        duration: 1500,
        delay: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animRefs[1], {
        toValue: totalExpenses,
        duration: 1500,
        delay: 500,
        useNativeDriver: false,
      })
    ];

    Animated.parallel(animations).start();

    const listenerIncome = animRefs[0].addListener(({ value }) => {
      setAnimatedValues(prev => [Math.max(0, value), prev[1]]);
    });
    const listenerExpenses = animRefs[1].addListener(({ value }) => {
      setAnimatedValues(prev => [prev[0], Math.max(0, value)]);
    });

    return () => {
      animRefs[0].removeListener(listenerIncome);
      animRefs[1].removeListener(listenerExpenses);
    };
  }, [totalIncome, totalExpenses, animated]);

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return `${currency}0`;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('₹', currency);
  };

  if (loadingStates?.profitLoss || previousPeriodLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const MAX_BAR_VISUAL_HEIGHT = 140;
  const MIN_BAR_HEIGHT = 50;
  const overallMaxValue = Math.max(animatedValues[0], animatedValues[1], 1);

  const incomeHeight = Math.max((animatedValues[0] / overallMaxValue) * MAX_BAR_VISUAL_HEIGHT, MIN_BAR_HEIGHT);
  const expenseHeight = Math.max((animatedValues[1] / overallMaxValue) * MAX_BAR_VISUAL_HEIGHT, MIN_BAR_HEIGHT);

  const incomeIsUp = totalIncome >= previousTotalIncome;
  const expenseIsUp = totalExpenses >= previousTotalExpenses;

  console.log('Income comparison - Current:', totalIncome, 'Previous:', previousTotalIncome, 'Is Up:', incomeIsUp);
  console.log('Expense comparison - Current:', totalExpenses, 'Previous:', previousTotalExpenses, 'Is Up:', expenseIsUp);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.topValues}>
          <View style={styles.valueItem}>
            <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
            <Text style={[styles.valueText, { color: '#3B82F6' }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          <View style={styles.valueItem}>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.valueText, { color: '#EF4444' }]}>
              {formatCurrency(totalExpenses)}
            </Text>
          </View>
        </View>
        <View style={styles.chartContainer}>
          <View style={styles.chartWithStats}>
            <View style={styles.leftStats}>
              <View style={styles.percentageContainer}>
                <Text style={[styles.percentage, { color: incomeIsUp ? '#10B981' : '#EF4444' }]}>
                  {incomePercentageChange}
                </Text>
                {incomeIsUp ? (
                  <UpArrowIcon color="#10B981" />
                ) : (
                  <DownArrowIcon color="#EF4444" />
                )}
              </View>
              <View style={styles.changeContainer}>
                <Text style={styles.changeAmount}>
                  {formatCurrency(totalIncome - previousTotalIncome)}
                </Text>
                <Text style={styles.changeLabel}>
                  {/* Previous comparison data can go here */}
                </Text>
              </View>
            </View>
            <View style={styles.barsRow}>
              <View style={styles.barContainer}>
                <View style={[
                  styles.bar,
                  {
                    height: incomeHeight,
                    backgroundColor: '#3B82F6',
                  }
                ]}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.1)']}
                    locations={[0, 0.5, 1]}
                    style={styles.barShine}
                  />
                </View>
              </View>
              <View style={styles.barContainer}>
                <View style={[
                  styles.bar,
                  {
                    height: expenseHeight,
                    backgroundColor: '#EF4444',
                  }
                ]}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.1)']}
                    locations={[0, 0.5, 1]}
                    style={styles.barShine}
                  />
                </View>
              </View>
            </View>
            <View style={styles.rightStats}>
              <View style={styles.percentageContainer}>
                <Text style={[styles.percentage, { color: expenseIsUp ? '#10B981' : '#EF4444' }]}>
                  {expensePercentageChange}
                </Text>
                {expenseIsUp ? (
                  <UpArrowIcon color="#10B981" />
                ) : (
                  <DownArrowIcon color="#EF4444" />
                )}
              </View>
              <View style={styles.changeContainer}>
                <Text style={styles.changeAmount}>
                  {formatCurrency(totalExpenses - previousTotalExpenses)}
                </Text>
                <Text style={styles.changeLabel}>
                  {/* Previous comparison data can go here */}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Income</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Expense</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 10,
    width: 350,
    height: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  topValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 40,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  chartWithStats: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    height: 140,
  },
  leftStats: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flex: 1,
    paddingRight: 10,
    height: '100%',
  },
  rightStats: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
    paddingLeft: 10,
    height: '100%',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: '100%',
    gap: 20,
    flex: 1,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: 40,
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  barShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 10,
  },
  percentage: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 4,
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  changeContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  changeAmount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  changeLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '400',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
    marginBottom: 10,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  legendDot: {
    width: 16,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'PlusJakartaSans-SemiBold',
 
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default PieChart;