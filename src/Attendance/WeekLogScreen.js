import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator, BackHandler,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import GlobalStyle from '../components/common/GlobalStyle';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Orientation from 'react-native-orientation-locker';
import NetworkErrorModal from '../QuarryAdmin/NetworkErrorModal';
import NetInfo from '@react-native-community/netinfo';

const WeekLogScreen = () => {
  const [activeTab, setActiveTab] = useState('Week');
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeksData, setWeeksData] = useState([]);
  const watermarkIcon = require('../images/LogoWaterMark.png');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [isConnected, setIsConnected] = useState(true);
  const [showNetworkError, setShowNetworkError] = useState(false);


  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAttendanceData().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    Orientation.lockToPortrait();
    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('AttendanceHome');
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation]);

  const checkNetworkAndFetchData = () => {
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
      
      if (state.isConnected && state.isInternetReachable) {
        setShowNetworkError(false);
        fetchAttendanceData().finally(() => setRefreshing(false));
      } else {
        setShowNetworkError(true);
        setRefreshing(false);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
      
      // If internet is restored, hide network error and fetch data
      if (state.isConnected && state.isInternetReachable && showNetworkError) {
        setShowNetworkError(false);
        fetchAttendanceData();
      } else if (!state.isConnected || !state.isInternetReachable) {
        setShowNetworkError(true);
      }
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    checkNetworkAndFetchData();
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const employeeId = await AsyncStorage.getItem('userEmployeeId');
      if (!employeeId) {
        initializeEmptyData();
        setLoading(false);
        return;
      }

      const response = await axios.get(`https://demo.sazss.in/Api/EmployeeAttendance?EmployeeId=${employeeId}`);
      if (!response.data || !Array.isArray(response.data[1]) || response.data[1].length === 0) {
        initializeEmptyData();
        setLoading(false);
        return;
      }
      const processedData = processAttendanceData(response.data[1]);
      setAttendanceData(processedData);
      const weekDataArray = organizeIntoWeeks(processedData);
      setWeeksData(weekDataArray);
      const currentWeek = weekDataArray.findIndex(week =>
        moment(week[0].date, 'DD-MM-YY').isSame(moment(), 'week')
      );
      setCurrentWeekIndex(currentWeek !== -1 ? currentWeek : weekDataArray.length - 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      initializeEmptyData();
      setLoading(false);
    }
  };

  const initializeEmptyData = () => {
    const today = moment();
    const startOfWeek = moment(today).startOf('isoWeek');
    const emptyWeekData = Array.from({ length: 7 }, (_, index) => {
      const currentDate = moment(startOfWeek).add(index, 'days');
      return {
        date: currentDate.format('DD-MM-YY'),
        hours: '0',
        status: 'absent',
        inTime: '--:--',
        outTime: '--:--',
        shift: '--',
        breakHours: '0'
      };
    });
    setAttendanceData(emptyWeekData);
    setWeeksData([emptyWeekData]);
    setCurrentWeekIndex(0);
  };

  const processAttendanceData = (data) => {
    return data.map(item => {
      const date = moment(item.AtDate, 'DD/MM/YYYY');
      const hoursWorked = item.HoursWorked || 0;
      return {
        date: date.format('DD-MM-YY'),
        hours: hoursWorked.toString(),
        status: item.Status.toLowerCase(),
        inTime: item.InTime,
        outTime: item.OutTime,
        shift: item.Shift,
        breakHours: item.BreakHours,
      };
    }).sort((a, b) => moment(a.date, 'DD-MM-YY').valueOf() - moment(b.date, 'DD-MM-YY').valueOf());
  };

  const organizeIntoWeeks = (data) => {
    const weeks = [];
    let currentWeek = [];

    data.forEach((item, index) => {
      const date = moment(item.date, 'DD-MM-YY');
      const startOfWeek = date.startOf('isoWeek');

      if (currentWeek.length === 0 || moment(currentWeek[0].date, 'DD-MM-YY').isoWeek() === startOfWeek.isoWeek()) {
        currentWeek.push(item);
      } else {
        weeks.push([...currentWeek]);
        currentWeek = [item];
      }

      if (index === data.length - 1 && currentWeek.length > 0) {
        weeks.push([...currentWeek]);
      }
    });

    if (weeks.length === 0) {
      return [];
    }

    return weeks;
  };

  const generateFullWeekDates = (weekData) => {
    if (!weekData || weekData.length === 0) {
      const today = moment();
      const startOfWeek = moment(today).startOf('isoWeek');
      return Array.from({ length: 7 }, (_, index) => {
        const currentDate = moment(startOfWeek).add(index, 'days');
        return {
          date: currentDate.format('DD-MM-YY'),
          hours: '0',
          status: 'absent',
          inTime: '--:--',
          outTime: '--:--',
          shift: '--',
          breakHours: '0'
        };
      });
    }
    const firstDate = moment(weekData[0].date, 'DD-MM-YY');
    const startOfWeek = moment(firstDate).startOf('isoWeek');
    const fullWeek = Array.from({ length: 7 }, (_, index) => {
      const currentDate = moment(startOfWeek).add(index, 'days');
      const matchingData = weekData.find(item =>
        moment(item.date, 'DD-MM-YY').isSame(currentDate, 'day')
      );
      return matchingData || {
        date: currentDate.format('DD-MM-YY'),
        hours: '0',
        status: 'absent',
        inTime: '--:--',
        outTime: '--:--',
        shift: '--',
        breakHours: '0'
      };
    });

    return fullWeek;
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const goToPreviousWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const goToNextWeek = () => {
    if (currentWeekIndex < weeksData.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  const getColourByStatus = (status) => {
    switch (status.toLowerCase()) {
      case 'absent':
        return '#A52A2A';
      case 'present':
        return '#8FBC8F';
      case 'holiday':
        return '#FFD700';
      default:
        return '#CCCCCC';
    }
  };

  const getDashBar = (hours, status) => {
    const numHours = parseFloat(hours);

    switch (status.toLowerCase()) {
      case 'absent':
        return <View style={styles.absentBar} />;
      case 'holiday':
        return <View style={styles.holidayBar} />;
      case 'present':
        return (
          <View style={styles.presentBar}>
            {Array.from({ length: Math.floor(numHours) }).map((_, i) => (
              <View key={i} style={styles.dashedDash} />
            ))}
          </View>
        );
      default:
        return <View style={styles.absentBar} />;
    }
  };

  const getMarkedDates = () => {
    const markedDates = {};
    attendanceData.forEach(item => {
      const date = moment(item.date, 'DD-MM-YY').format('YYYY-MM-DD');
      markedDates[date] = {
        selected: true,
        selectedColor: getColourByStatus(item.status),
        selectedTextColor: 'white',
      };
    });
    return markedDates;
  };

  useEffect(() => {
    if (weeksData[currentWeekIndex]) {
      const weekTotal = weeksData[currentWeekIndex]
        .filter(item => item.status.toLowerCase() === 'present')
        .reduce((total, item) => total + parseFloat(item.hours || 0), 0);
      setTotalHours(Math.round(weekTotal * 100) / 100);
    } else {
      setTotalHours(0);
    }
  }, [currentWeekIndex, weeksData]);

  // if (showNetworkError && !refreshing) {
  //   return (
  //     <NetworkErrorModal 
  //       visible={showNetworkError} 
  //       // onRefresh={onRefresh} 
  //     />
  //   );
  // }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3E89EC" />
        {/* <Text style={styles.loadingText}>Loading attendance data...</Text> */}
      </View>
    );
  }

  const currentWeekData = weeksData[currentWeekIndex] ?
    generateFullWeekDates(weeksData[currentWeekIndex]) :
    generateFullWeekDates([]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3E89EC']}
            tintColor="#3E89EC"
          />
        }
      >
        <ImageBackground
          source={watermarkIcon}
          resizeMode="contain"
          imageStyle={styles.imageStyle}
          style={styles.headerBackground}
        >
          <View style={styles.header}>
            <Text style={[GlobalStyle.heading1, styles.title]}>Attendance Log</Text>
          </View>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: '#FFD700' }]} />
              <Text style={[GlobalStyle.heading6, styles.legendText]}>Holiday</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: '#A52A2A' }]} />
              <Text style={[GlobalStyle.heading6, styles.legendText]}>Absent</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: '#8FBC8F' }]} />
              <Text style={[GlobalStyle.heading6, styles.legendText]}>Present</Text>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity onPress={() => handleTabPress('Week')}>
              <Text style={[
                GlobalStyle.heading6,
                styles.tabContainerText,
                activeTab === 'Week' && styles.activeTab,
                { fontWeight: activeTab === 'Week' ? 'bold' : 'normal' }
              ]}>
                Week
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleTabPress('Month')}>
              <Text style={[
                GlobalStyle.heading6,
                styles.tabContainerText,
                activeTab === 'Month' && styles.activeTab,
                { fontWeight: activeTab === 'Month' ? 'bold' : 'normal' }
              ]}>
                Month
              </Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {activeTab === 'Week' && (
          <View style={styles.dateContainer}>
            <TouchableOpacity onPress={goToPreviousWeek}>
              <FontAwesomeIcon
                icon={faChevronLeft}
                size={18}
                color="white"
                style={{ left: 8 }}
              />
            </TouchableOpacity>

            <Text style={[GlobalStyle.heading6, styles.dateText]}>
              {moment(currentWeekData[0].date, 'DD-MM-YY').format('DD-MM-YYYY')}
              <Text style={{ fontWeight: 'bold', marginHorizontal: 5 }}>    To    </Text>
              {moment(currentWeekData[6].date, 'DD-MM-YY').format('DD-MM-YYYY')}
            </Text>

            <TouchableOpacity onPress={goToNextWeek}>
              <FontAwesomeIcon
                icon={faChevronRight}
                size={18}
                color="white"
                style={{ right: 8 }}
              />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.chartContainer}>
          {activeTab === 'Week' ? (
            currentWeekData.map((item, index) => (
              <View key={index} style={styles.dayRow}>
                <View style={styles.dayTextContainer}>
                  <Text style={styles.dayText}>
                    {moment(item.date, 'DD-MM-YY').format('ddd')} [{moment(item.date, 'DD-MM-YY').format('DD')}]
                  </Text>
                </View>
                <View style={styles.barContainer}>
                  {getDashBar(item.hours, item.status)}
                </View>
                <View style={styles.hoursContainer}>
                  <Text style={[GlobalStyle.Body, styles.hoursText]}>
                    {item.hours}:00 Hrs
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Calendar
              markedDates={getMarkedDates()}
              style={styles.calendar}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Text style={[GlobalStyle.heading6, styles.footerText]}>Total Working Hours</Text>
          <Text style={[GlobalStyle.heading6, styles.footerText]}>{totalHours} Hours</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollViewContainer: {
    marginBottom: scale(25),
  },
  imageStyle: {
    width: scale(200),
    marginTop: verticalScale(17),
    height: verticalScale(170),
    alignSelf: 'flex-end',
    marginVertical: verticalScale(20),
    marginLeft: scale(150),

  },
  headerBackground: {
    height: verticalScale(180),
    backgroundColor: '#3E89EC',
    paddingTop: verticalScale(40),
    paddingHorizontal: scale(20),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(16),
  },
  title: {
    marginLeft: scale(12),
    color: 'white',
    bottom: scale(6),
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    bottom: scale(5),
    left: scale(5),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBox: {
    width: scale(8),
    height: verticalScale(8),
    marginRight: scale(12),
  },
  legendText: {
    color: 'white',
  },

  //tab Container
  tabContainer: {
    flexDirection: 'row',
    paddingVertical: moderateScale(8),
    alignItems: 'center',
    marginTop: scale(8),
  },
  tabContainerText: {
    // fontFamily:'Cabin'
    color: 'white',
    marginHorizontal: scale(10),
  },
  activeTab: {
    borderBottomWidth: scale(2),
    borderBottomColor: 'white',
  },

  //date Container
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: moderateScale(12),
    backgroundColor: '#3E89EC',
    borderRadius: scale(8),
    marginTop: scale(10),
    height: scale(45),
    width: scale(310),
    left: scale(20),
  },
  dateText: {
    color: 'white',
    marginHorizontal: scale(20),
    fontSize: 16,
    bottom: scale(1),
    textAlign: 'center',
  },

  //chart Container
  chartContainer: {
    marginVertical: verticalScale(32),
    paddingVertical: moderateScale(12),
    paddingHorizontal: scale(12),
    backgroundColor: '#ffffff',
    borderRadius: scale(12),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    width: scale(320),
    left: scale(15),
    bottom: scale(15),
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: scale(5),
    // paddingVertical: scale(3),
    backgroundColor: '#f0f0f0',
    borderRadius: scale(4),
  },
  dayTextContainer: {
    flex: 1.2,
    alignItems: 'flex-start',
    paddingHorizontal: scale(3),
  },
  hoursContainer: {
    flex: 1,
    alignItems: 'flex-end',
    paddingHorizontal: scale(4),
  },
  dayText: {
    fontSize: 16,
    color: 'black',
  },
  hoursText:
  {
    fontSize: 16,
    color: 'black',
  },
  barContainer: {
    flex: 3,
    justifyContent: 'flex-start',
    paddingHorizontal: scale(8),
  },
  absentBar: {
    height: verticalScale(3),
    width: scale(160),
    backgroundColor: '#A52A2A',
    borderRadius: scale(8),
    marginVertical: scale(8),
  },
  holidayBar: {
    height: verticalScale(6),
    width: scale(160),
    backgroundColor: '#FFD700',
    borderRadius: scale(8),
    marginVertical: scale(8),
  },
  presentBar: {
    height: verticalScale(6),
    width: scale(160),
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashedDash: {
    height: verticalScale(4),
    width: scale(10),
    backgroundColor: '#8FBC8F',
    marginRight: scale(4),
    borderRadius: scale(8),
  },
  //footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(28),
    paddingVertical: verticalScale(20),
    bottom: verticalScale(55),
  },
  footerText: {
    // color: 'black',
    // fontWeight: 'bold',
  },
});

export default WeekLogScreen;