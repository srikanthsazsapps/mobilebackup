import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Modal,
  Dimensions,
  BackHandler,
  Alert,
  StyleSheet,
  ScrollView,
  Animated,
  RefreshControl,
  TouchableWithoutFeedback,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { globalStyles } from '../../../Styles/globalStyles';
import GlobalStyle from '../../components/common/GlobalStyle';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import DashesDateFilter from '../../QuarryAdmin/DashBoards/DashesDataFilter';
import Loading from '../common/Loading';
import { DashesDataContext } from '../common/DashesDataContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import NetworkErrorModal from '../../QuarryAdmin/NetworkErrorModal';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');

const ProfitLossDashboard = () => {
  const transformAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [pieData, setPieData] = useState([]);
  const [dateTab, setDateTab] = useState('Today');
  const tabs = ['Yesterday', 'Today', 'Week', 'Month', 'Custom'];
  const [activeTab, setActiveTab] = useState('Income');
  const [listPositions, setListPositions] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef(null);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Context data
  const {
    profitLossData,
    loadingStates,
    fetchSingleDashboard,
    fetchAllDashboards,
    fetchCustomDashboard,
    setTodayRange,
    setYesterdayRange,
    setWeekRange,
    setMonthRange,
    startDate,
    endDate,
    startTime,
    endTime,
  } = useContext(DashesDataContext);

  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const getFilteredData = () => {
    if (!profitLossData || profitLossData.length === 0) return [];
    const flattenedData = profitLossData.flat();

    if (activeTab === 'Income') {
      return flattenedData.filter(item => item.Category === 'Income');
    } else {
      return flattenedData.filter(item => item.Category === 'Expenses');
    }
  };

  const getCurrentTabData = () => {
    return getFilteredData();
  };

  const getTotalByCategory = (category) => {
    if (!profitLossData || profitLossData.length === 0) return 0;

    return profitLossData
      .flat()
      .filter(item => item.Category === category)
      .reduce((sum, item) => sum + (parseFloat(item.Amount) || 0), 0);
  };

  const getNetProfitLoss = () => {
    const income = getTotalByCategory('Income');
    const expenses = getTotalByCategory('Expenses');
    return income - expenses;
  };

  const totalIncome = getTotalByCategory('Income');
  const totalExpense = getTotalByCategory('Expenses');
  const netProfit = getNetProfitLoss();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
      if (state.isConnected && state.isInternetReachable && showNetworkError) {
        onRefresh();
      }
    });

    return () => unsubscribe();
  }, [showNetworkError]);

  useEffect(() => {
    const currentData = getCurrentTabData();

    if (currentData && currentData.length > 0) {
      const formattedData = currentData.map((item, index) => {
        const amount = parseFloat(item.Amount) || 0;
        const colors = [
          '#FF6B6B',
          '#4ECDC4',
          '#45B7D1',
          '#FDCB6E',
          '#6C5CE7',
          '#FF8A5B',
          '#2ECC71',
          '#3498DB',
          '#9B59B6',
        ];

        return {
          key: `slice-${index}`,
          value: Math.abs(amount),
          color: colors[index % colors.length],
          account: item.Account,
        };
      }).filter(slice => slice.value > 0);

      setPieData(formattedData);
      setFilteredPosts(currentData);
    } else {
      setPieData([]);
      setFilteredPosts([]);
    }
  }, [profitLossData, activeTab]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
    scrollY.setValue(0);
    setListPositions([]);
  }, [activeTab, dateTab]);

  useEffect(() => {
    if (isFocused) {
      setTodayRange();
    }
  }, [isFocused]);

  const handleDateTabChange = async (tab) => {
    if (tab === dateTab && tab !== 'Custom') return;

    if (tab === 'Custom') {
      setShowDateFilterModal(true);
      setDateTab(tab);
      return;
    }

    setDateTab(tab);
    setShowDateFilterModal(false);

    try {
      switch (tab) {
        case 'Today':
          await setTodayRange();
          break;
        case 'Yesterday':
          await setYesterdayRange();
          break;
        case 'Week':
          await setWeekRange();
          break;
        case 'Month':
          await setMonthRange();
          break;
        default:
          await fetchSingleDashboard('profitLoss');
      }
    } catch (error) {
      console.error('Error fetching data for date tab:', error);
      setShowNetworkError(true);
    }
  };

  const handleCustomDateSelect = async (fromDate, toDate) => {
    try {
      const fromDateObj = typeof fromDate === 'string' ? new Date(fromDate) : fromDate;
      const toDateObj = typeof toDate === 'string' ? new Date(toDate) : toDate;

      if (isNaN(fromDateObj) || isNaN(toDateObj)) {
        throw new Error('Invalid date format');
      }
      if (fromDateObj > toDateObj) {
        Alert.alert('Invalid Date Range', 'The end date cannot be before the start date.');
        return;
      }

      setShowDateFilterModal(false);
      await fetchCustomDashboard('profitLoss', fromDateObj, toDateObj);
    } catch (error) {
      console.error('ProfitLossDashboard: Error setting custom dates:', error);
      setShowNetworkError(true);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setListPositions([]);
    scrollY.setValue(0);

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }

    setShowNetworkError(false);

    try {
      switch (dateTab) {
        case 'Today':
          await setTodayRange();
          break;
        case 'Yesterday':
          await setYesterdayRange();
          break;
        case 'Week':
          await setWeekRange();
          break;
        case 'Month':
          await setMonthRange();
          break;
        case 'Custom':
          await fetchCustomDashboard('profitLoss', startDate, endDate);
          break;
        default:
          await fetchSingleDashboard('profitLoss');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      setShowNetworkError(true);
    } finally {
      setRefreshing(false);
    }
  };

  const total = pieData.reduce((sum, slice) => sum + slice.value, 0);
  const radius = width * 0.3;
  let startAngle = 0;
  const donutHoleRadius = 100;

  const lineOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const lineHeight = scrollY.interpolate({
    inputRange: [0, 400],
    outputRange: [0, 20],
    extrapolate: 'clamp',
  });

  const transformAnimation = scrollY.interpolate({
    inputRange: [0, 10],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);
  const segmentWidth = (value) => (value / totalValue) * (width - 40);

  const renderCustomDateRange = () => {
    if (dateTab !== 'Custom') return null;

    return (
      <Modal
        visible={showDateFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowDateFilterModal(false);
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowDateFilterModal(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View>
                <DashesDateFilter
                  CloseModel={() => setShowDateFilterModal(false)}
                  onDateSelected={handleCustomDateSelect}
                  initialFromDate={startDate}
                  initialToDate={endDate}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  useEffect(() => {
    const backAction = () => {
      if (showDateFilterModal) {
        setShowDateFilterModal(false);
        return true;
      }

      if (isFocused) {
        navigation.goBack();
        return true;
      }

      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: false }
      );
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [isFocused, showDateFilterModal]);

  if (loadingStates.profitLoss && !refreshing) {
    return <Loading />;
  }

  if (showNetworkError && !refreshing) {
    return (
      <NetworkErrorModal
        visible={showNetworkError}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <View style={styles.Container}>
      {renderCustomDateRange()}
      {refreshing && (
        <View style={styles.refreshLoadingContainer}>
          <Loading />
        </View>
      )}

      <View style={styles.header}>
        <ImageBackground
          source={require('../../images/LogoWaterMark.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesomeIcon
              icon={faArrowLeft}
              size={22}
              color="white"
              style={{ top: 11, right: 12 }}
            />
          </TouchableOpacity>
          <Text style={[GlobalStyle.H3, styles.headerText]}>Profit and Loss</Text>
        </View>

        <View style={styles.daycontainer}>
          {tabs.map((tab, index) => (
            <React.Fragment key={tab}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  dateTab === tab && styles.dateTab,
                  index === 0 && styles.firstTab,
                  index === tabs.length - 1 && styles.lastTab,
                ]}
                onPress={() => handleDateTabChange(tab)}
                disabled={refreshing || loadingStates.profitLoss}
              >
                <Text
                  style={[
                    styles.tabText,
                    GlobalStyle.H12,
                    dateTab === tab && styles.activeTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
              {index < tabs.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>
      </View>

      <View style={styles.profitCard}>
        <View style={styles.netProfitRow}>
          <Text style={[GlobalStyle.H5]}>Net Profit</Text>
          <Text
            style={[
              GlobalStyle.heading5,
              styles.netProfitAmount,
              { color: netProfit >= 0 ? '#7AB134' : '#C16161' },
            ]}
          >
            ₹ {netProfit.toLocaleString('en-IN')}
          </Text>
          <Image
            source={require('../../images/income.png')}
            style={styles.netProfitImage}
          />
        </View>

        <View style={styles.switchContainer}>
          <TouchableOpacity
            style={[
              styles.switchButton,
              activeTab === 'Income' && styles.activeSwitchButton,
            ]}
            onPress={() => {
              if (!refreshing && !loadingStates.profitLoss) {
                setActiveTab('Income');
              }
            }}
            disabled={refreshing || loadingStates.profitLoss}
          >
            <Text
              style={[
                styles.switchButtonText,
                activeTab === 'Income' && styles.activeSwitchButtonText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.switchButton,
              activeTab === 'Expense' && styles.activeSwitchButton,
            ]}
            onPress={() => {
              if (!refreshing && !loadingStates.profitLoss) {
                setActiveTab('Expense');
              }
            }}
            disabled={refreshing || loadingStates.profitLoss}
          >
            <Text
              style={[
                styles.switchButtonText,
                activeTab === 'Expense' && styles.activeSwitchButtonText,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, bottom: 50 }}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            right: 16,
            flexDirection: 'row',
            opacity: lineOpacity,
            height: lineHeight,
            zIndex: 10,
            opacity: 1,
            backgroundColor: '#E5E5E5',
            overflow: 'hidden',
          }}
        >
          {pieData.map((item, index) => {
            const segmentWidthValue = segmentWidth(item.value);
            return (
              <View
                key={index}
                style={{
                  backgroundColor: item.color,
                  width: segmentWidthValue,
                  height: '100%',
                }}
              />
            );
          })}
        </Animated.View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[styles.chartContainer, { marginTop: -3 }]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={1}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={onRefresh}
              colors={['#3E89EC']}
              tintColor={'#3E89EC'}
              progressBackgroundColor={'#FFFFFF'}
            />
          }
          scrollEnabled={!refreshing && !loadingStates.profitLoss}
        >
          {pieData.length > 0 && (
            <>
              <Svg
                width={width * 0.75}
                height={width * 0.45}
                viewBox={`0 0 ${width * 0.75} ${width * 0.75}`}
              >
                <G x={width * 0.375} y={width * 0.375}>
                  {pieData.map((slice) => {
                    const sliceAngle = (slice.value / total) * 360;
                    const endAngle = startAngle + sliceAngle - 2;
                    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

                    const x1 = radius * Math.cos((Math.PI * startAngle) / 180);
                    const y1 = radius * Math.sin((Math.PI * startAngle) / 180);
                    const x2 = radius * Math.cos((Math.PI * endAngle) / 180);
                    const y2 = radius * Math.sin((Math.PI * endAngle) / 180);
                    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L 0 0`;
                    startAngle = endAngle + 2;
                    return <Path key={slice.key} d={pathData} fill={slice.color} />;
                  })}
                  <Circle cx="0" cy="0" r={donutHoleRadius} fill="white" />
                </G>
              </Svg>

              <Animated.View
                style={[
                  styles.pieChartLabelContainer,
                  {
                    top: radius - 5,
                    left: width * 0.375 - 20,
                    marginTop: -40,
                    right: 130,
                    opacity: transformAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0],
                    }),
                  },
                ]}
              >
                <Text style={[GlobalStyle.heading8, styles.circleText]}>
                  {activeTab === 'Income' ? 'Total Income' : 'Total Expense'}
                </Text>
                <Text style={styles.pieChartValueText}>
                  ₹{total.toLocaleString('en-IN', {
                    // minimumFractionDigits: 2,
                    // maximumFractionDigits: 2,
                  })}
                </Text>
              </Animated.View>
            </>
          )}

          {filteredPosts.length > 0 ? (
            filteredPosts.map((item, index) => (
              <View
                key={index}
                onLayout={(event) => {
                  if (!refreshing) {
                    const { y } = event.nativeEvent.layout;
                    setListPositions((prev) => {
                      const newPositions = [...prev];
                      newPositions[index] = y;
                      return newPositions;
                    });
                  }
                }}
                style={styles.listItemContainer}
              >
                <Animated.View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    opacity: listPositions[index] !== undefined && !refreshing
                      ? scrollY.interpolate({
                          inputRange: [
                            listPositions[index] - 50,
                            listPositions[index] + 70,
                          ],
                          outputRange: [1, 0],
                          extrapolate: 'clamp',
                        })
                      : 1,
                  }}
                >
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      backgroundColor: pieData[index]?.color || '#FF6B6B',
                      marginHorizontal: -10,
                      marginLeft: -45,
                      marginRight: 30,
                      borderRadius: 15,
                    }}
                  />
                  <Text
                    style={[
                      GlobalStyle.heading8,
                      { flex: 1, fontWeight: 'Cabin-Bold', marginLeft: -20 },
                    ]}
                  >
                    {item.Account}
                  </Text>

                  <Text
                    style={[
                      GlobalStyle.heading8,
                      {
                        flex: 1,
                        fontWeight: 'Cabin-Bold',
                        textAlign: 'right',
                        flexWrap: 'wrap',
                        width: '100%',
                        marginRight: -62,
                      },
                    ]}
                  >
                    ₹{parseFloat(item.Amount).toLocaleString('en-IN')}
                  </Text>
                </Animated.View>
              </View>
            ))
          ) : (
            <View style={styles.listItemContainer}>
              <Text style={styles.noDataText}>
                No {activeTab.toLowerCase()} data available for the selected period
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      <Animated.View
        style={[
          styles.bottomContainer,
          {
            opacity: transformAnimation,
            duration: 100,
            bottom: 5,
          },
        ]}
      >
        <Text style={globalStyles.buttonLargeText}>Net Profit</Text>
        <Text
          style={[
            styles.bottomText,
            {
              color: netProfit >= 0 ? '#fff' : '#fff',
            },
          ]}
        >
          ₹ {netProfit.toLocaleString('en-IN')}
        </Text>
      </Animated.View>
    </View>
  );
};


const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  refreshLoadingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1000, 
  },
  header: {
    width: '100%',
    height: 231,
    backgroundColor: '#3E89EC',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    position: 'relative',
  },
  headerImage: {
    position: 'absolute',
    width: 232,
    marginTop: 33,
    height: 208,
    alignSelf: 'flex-end',
    marginLeft: width - 232,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 35,
    marginLeft: 35,
    paddingTop: 40,
  },
  headerText: {
    color: '#FFFFFF',
    marginLeft: scale(1),
    top: verticalScale(10),
  },
  daycontainer: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    borderRadius: scale(5),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    top: scale(13),
    height: scale(30),
    marginVertical: verticalScale(2),
    width: scale(320),
    justifyContent: 'center',
    alignSelf: 'center',
    top: 23,
  },
  tab: {
    flex: 1,
    paddingVertical: scale(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTab: {
    backgroundColor: '#FFFFFF',
  },
  firstTab: {
    borderTopLeftRadius: scale(1),
    borderBottomLeftRadius: scale(1),
  },
  lastTab: {
    borderTopRightRadius: scale(1),
    borderBottomRightRadius: scale(1),
  },
  tabText: {
    color: '#FFFFFF',
  },
  activeTabText: {
    color: '#3E89EC',
  },
  divider: {
    width: scale(1),
    backgroundColor: '#FFFFFF',
    height: '100%',
  },
  circleText: {
    textAlign: 'center',
    alignSelf: 'center',
    // left: 10,
    bottom: 8,
  },
  profitCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 25,
    padding: 20,
    borderRadius: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    bottom: 80,
  },
  netProfitRow: {
    marginBottom: 5,
  },
  netProfitAmount: {
    color: '#7AB134',
    marginTop: 5,
  },
  netProfitImage: {
    position: 'absolute',
    top: 0,
    right: 5,
    width: 90,
    height: 90,
    marginTop: -20,
    resizeMode: 'contain',
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    borderRadius: 20,
    padding: 1,
    marginBottom: 5,
    alignSelf: 'center',
  },
  switchButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeSwitchButton: {
    backgroundColor: '#4D8FE6',
  },
  switchButtonText: {
    fontFamily: 'Cabin-Medium',
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  activeSwitchButtonText: {
    color: '#FFF',
  },
  chartContainer: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: width * 0.9,
    height: 'auto',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: 30,
    paddingTop: -10,
    marginBottom: -20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  pieChartLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: -20,
  },
  pieChartValueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3E89EC',
    marginTop: -5,
    textAlign: 'center',
    alignSelf: 'center',
    // left: 10,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: -10,
    justifyContent: 'space-between',
    padding: 50,
    marginTop: -55,
  },
  colorIndicator: {
    width: 10,
    height: 10,
    backgroundColor: 'red',
    marginHorizontal: -10,
    marginLeft: -45,
    marginRight: 30,
    borderRadius: 15,
  },
  accountText: {
    flex: 1,
    fontWeight: 'bold',
    marginLeft: -20,
  },
  amountText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'right',
    flexWrap: 'wrap',
    width: '100%',
    marginRight: -62,
  },
  bottomContainer: {
    backgroundColor: '#3A81F1',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 8,
    width: '91%',
    borderRadius: 15,
    marginLeft: 19,
    overflow: 'hidden',
  },
  bottomText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3E89EC',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});

export default ProfitLossDashboard;