import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  BackHandler,
  StyleSheet,
  Image,
  Modal,
  ImageBackground,
  TextInput,
  Dimensions,
  Animated,
  ScrollView,
  Alert,
  AppState,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { DataContext } from '../components/common/DataContext';
import BackgroundTimer from 'react-native-background-timer';
import LocationVerificationModal from './LocationVerificationModal';
import LottieView from 'lottie-react-native';
import Orientation from 'react-native-orientation-locker';
import GlobalStyle from '../components/common/GlobalStyle';

const { width, height } = Dimensions.get('window');

const getGreetingMessage = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 5 && currentHour < 12) return 'Good Morning';
  if (currentHour >= 12 && currentHour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const determineShift = () => {
  const currentHour = new Date().getHours();
  return currentHour >= 18 || currentHour < 6 ? 'Night' : 'Day';
};

const getCurrentShiftText = () => {
  const currentHour = new Date().getHours();
  if (currentHour >= 6 && currentHour < 18) {
    return { shiftText: 'Day shift 8 AM to 8 PM' };
  } else {
    return { shiftText: 'Night shift 8 PM to 8 AM' };
  }
};

const isEarlyCheckout = (checkInTimestamp, shift) => {
  const now = new Date();
  const checkInTime = new Date(checkInTimestamp);
  const shiftDuration = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
  const expectedCheckoutTime = new Date(checkInTime.getTime() + shiftDuration);
  
  if (shift === 'Day') {
    expectedCheckoutTime.setHours(20, 0, 0, 0); // 8 PM
  } else {
    expectedCheckoutTime.setHours(8, 0, 0, 0); // 8 AM next day
    if (now > expectedCheckoutTime) expectedCheckoutTime.setDate(expectedCheckoutTime.getDate() + 1);
  }
  
  return now < expectedCheckoutTime;
};

// Utility function to get date string in YYYY-MM-DD format
const getDateString = (date) => {
  return date.toISOString().split('T')[0];
};

const AttendanceHome = ({ route }) => {
  const { processAttendanceAction, loading, setLoading } = useContext(DataContext);
  const [inputBgColor, setInputBgColor] = useState('gray');
  const [checkedIn, setCheckedIn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [checkInTimestamp, setCheckInTimestamp] = useState(null);
  const [isBreak, setIsBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(0);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeKey, setEmployeeKey] = useState('');
  const [checkInShift, setCheckInShift] = useState('');
  const [showEarlyCheckoutNotes, setShowEarlyCheckoutNotes] = useState(false);
  const [earlyCheckoutNotes, setEarlyCheckoutNotes] = useState('');
  const [isCheckOutEnabled, setIsCheckOutEnabled] = useState(true);
  const [isBreakEnabled, setIsBreakEnabled] = useState(true);
  const [isBreakOutEnabled, setIsBreakOutEnabled] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationVerificationVisible, setLocationVerificationVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [isCheckInEnabled, setIsCheckInEnabled] = useState(true); // New state for check-in button
  const [lastCheckInDate, setLastCheckInDate] = useState(null); // Track last check-in date
  const currentHour = new Date().getHours();
  const isDaytime = currentHour >= 6 && currentHour < 18;
  const imageSource = isDaytime ? require('../images/MorningSun.png') : require('../images/Evening.png');
  const imageStyle = isDaytime ? styles.mrngPhoto : styles.eveningPhoto;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const navigation = useNavigation();
  const backgroundTimerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const watermarkIcon = require('../images/LogoWaterMark.png');
  const { shiftText } = getCurrentShiftText();
  const createdBy = '1';

  // Lock to portrait orientation
  useEffect(() => {
    Orientation.lockToPortrait();
    return () => Orientation.unlockAllOrientations();
  }, []);

  // Handle back button press
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: true }
        );
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }, [])
  );

  // Animate modal slide-in
  useEffect(() => {
    if (locationVerificationVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [locationVerificationVisible]);

  // Format time for display and API
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      secs: String(secs).padStart(2, '0'),
    };
  };

  // Handle app state changes for background timing
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (checkedIn && !isBreak) {
        if (appStateRef.current.match(/active|inactive/) && nextAppState === 'background') {
          const now = Date.now();
          await AsyncStorage.setItem('lastActiveTime', now.toString());
        }
        if (appStateRef.current === 'background' && nextAppState === 'active') {
          const lastActiveTimeStr = await AsyncStorage.getItem('lastActiveTime');
          if (lastActiveTimeStr) {
            const lastActive = parseInt(lastActiveTimeStr);
            const now = Date.now();
            const missedSeconds = Math.floor((now - lastActive) / 1000);
            setElapsedTime((prev) => {
              const newTime = prev + missedSeconds;
              AsyncStorage.setItem('elapsedTime', newTime.toString());
              return newTime;
            });
          }
        }
      }
      appStateRef.current = nextAppState;
    });
    return () => subscription.remove();
  }, [checkedIn, isBreak]);

  // Start background timer
  const startTimer = () => {
    if (!backgroundTimerRef.current) {
      setLastActiveTime(Date.now());
      backgroundTimerRef.current = BackgroundTimer.setInterval(async () => {
        const now = Date.now();
        setElapsedTime((prev) => {
          const newTime = prev + 1;
          AsyncStorage.setItem('elapsedTime', newTime.toString());
          AsyncStorage.setItem('lastActiveTime', now.toString());
          return newTime;
        });
      }, 1000);
    }
  };

  // Stop background timer
  const stopTimer = () => {
    if (backgroundTimerRef.current) {
      BackgroundTimer.clearInterval(backgroundTimerRef.current);
      backgroundTimerRef.current = null;
    }
  };

  // Load user data and restore state
  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedEmployeeKey = await AsyncStorage.getItem('userEmployeeKey');
        const storedEmployeeId = await AsyncStorage.getItem('userEmployeeId');
        const companyDetailsString = await AsyncStorage.getItem('CompanyDetails');
        const storedLastCheckInDate = await AsyncStorage.getItem('lastCheckInDate');
        if (companyDetailsString) {
          const companyDetails = JSON.parse(companyDetailsString);
          const currentCompany = companyDetails[companyDetails.length - 1];
          setEmployeeKey(currentCompany?.EmployeeKey || storedEmployeeKey);
          setEmployeeId(currentCompany?.EmployeeId || storedEmployeeId);
        }
        if (storedLastCheckInDate) {
          setLastCheckInDate(storedLastCheckInDate);
          const today = getDateString(new Date());
          setIsCheckInEnabled(storedLastCheckInDate !== today);
        } else {
          setIsCheckInEnabled(true);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
      }
    };
    getUserData();
    restoreState();
  }, []);

  // Check if check-in should be enabled based on date
  useEffect(() => {
    const checkCheckInStatus = async () => {
      const today = getDateString(new Date());
      const storedLastCheckInDate = await AsyncStorage.getItem('lastCheckInDate');
      setIsCheckInEnabled(!storedLastCheckInDate || storedLastCheckInDate !== today);
      setLastCheckInDate(storedLastCheckInDate);
    };
    checkCheckInStatus();
    // Run every minute to check if the day has changed
    const interval = BackgroundTimer.setInterval(checkCheckInStatus, 60000);
    return () => BackgroundTimer.clearInterval(interval);
  }, []);

  // Handle location verification result
  const handleLocationVerified = async (result) => {
    if (result.success) {
      setLocationVerificationVisible(false);
      switch (currentAction) {
        case 'checkIn':
          await processCheckIn(result.location);
          break;
        case 'checkOut':
          await handleCheckOutAPI(result.location);
          break;
        case 'checkOutWithNotes':
          await handleCheckOutAPI(result.location, earlyCheckoutNotes);
          setEarlyCheckoutNotes('');
          break;
        case 'breakIn':
          await processBreakIn(result.location);
          break;
        case 'breakOut':
          await processBreakOut(result.location);
          break;
      }
    } else {
      setErrorMessage(result.message || 'You are not in the office location');
      setErrorModalVisible(true);
      setLocationVerificationVisible(false);
      setCurrentAction(null);
    }
  };

  // Close location verification modal
  const handleLocationVerificationClose = () => {
    setLocationVerificationVisible(false);
    setCurrentAction(null);
  };

  // Trigger location verification
  const verifyLocationAndProceed = (actionType) => {
    if (locationVerificationVisible) return;
    if (actionType === 'checkIn' && !isCheckInEnabled) {
      setErrorMessage('You have already checked in today. Check-in is available again at midnight.');
      setErrorModalVisible(true);
      return;
    }
    setCurrentAction(actionType);
    setLocationVerificationVisible(true);
  };

  // Process Check-In
  const processCheckIn = async (location) => {
    if (!employeeId) {
      Alert.alert('Error', 'Unable to check in: Employee ID is missing');
      return;
    }
    try {
      setLoading(true);
      const currentShift = determineShift();
      const currentTime = new Date().getTime();
      const today = getDateString(new Date());
      const checkInRequestBody = {
        Type: 'CheckIn',
        EmId: employeeId,
        Shift: currentShift,
        CreatedBy: createdBy,
        ElapsedTime: '00:00:00',
        Latitude: String(location.latitude),
        Longitude: String(location.longitude),
      };
      const response = await processAttendanceAction(checkInRequestBody);
      if (response && (response.success || response.includes('SuccesFully'))) {
        const updates = {
          checkedIn: true,
          checkInTimestamp: currentTime,
          checkInShift: currentShift,
          elapsedTime: 0,
          isBreakEnabled: true,
          isCheckOutEnabled: true,
        };
        await AsyncStorage.multiSet([
          ['checkInTimestamp', currentTime.toString()],
          ['isCheckedIn', 'true'],
          ['checkInData', JSON.stringify({ shift: currentShift, timestamp: new Date().toISOString() })],
          ['lastCheckInDate', today],
        ]);
        setCheckedIn(updates.checkedIn);
        setCheckInTimestamp(updates.checkInTimestamp);
        setCheckInShift(updates.checkInShift);
        setElapsedTime(updates.elapsedTime);
        setIsBreakEnabled(updates.isBreakEnabled);
        setIsCheckOutEnabled(updates.isCheckOutEnabled);
        setIsCheckInEnabled(false);
        setLastCheckInDate(today);
        startTimer();
        setSuccessMessage('Check-in Successfully');
        setSuccessModalVisible(true);
        setTimeout(() => setSuccessModalVisible(false), 3000);
      } else {
        throw new Error('Check-in failed');
      }
    } catch (error) {
      setErrorMessage(`Check-in failed: ${error.message}`);
      setErrorModalVisible(true);
      console.log('Error Modal Triggered:', error.message);
    }
  };

  // Process Break-In
  const processBreakIn = async (location) => {
    if (!employeeId) {
      Alert.alert('Error', 'Unable to break in: Employee ID is missing');
      return;
    }
    try {
      setLoading(true);
      const { hours, minutes, secs } = formatTime(elapsedTime);
      const currentTime = new Date().getTime();
      const breakInRequestBody = {
        Type: 'BreakIn',
        EmId: employeeId,
        Shift: checkInShift || determineShift(),
        CreatedBy: createdBy,
        ElapsedTime: `${hours}:${minutes}:${secs}`,
        Latitude: String(location.latitude),
        Longitude: String(location.longitude),
      };
      const response = await processAttendanceAction(breakInRequestBody);
      if (response && (response.success || response.includes('SuccesFully'))) {
        setIsBreak(true);
        setBreakStartTime(currentTime);
        stopTimer();
        setIsBreakOutEnabled(true);
        setIsBreakEnabled(false);
        setIsCheckOutEnabled(false);
        await AsyncStorage.multiSet([
          ['breakStartTime', currentTime.toString()],
          ['isBreak', 'true'],
          ['breakInData', JSON.stringify({ timestamp: new Date().toISOString(), elapsedTime })],
          ['isBreakEnabled', 'false'],
          ['isBreakOutEnabled', 'true'],
          ['isCheckOutEnabled', 'false'],
        ]);
        setSuccessMessage('Break-in Successfully');
        setSuccessModalVisible(true);
        setTimeout(() => setSuccessModalVisible(false), 3000);
      } else {
        throw new Error('Break-in failed');
      }
    } catch (error) {
      setErrorMessage(`Break-in failed: ${error.message}`);
      setErrorModalVisible(true);
      console.log('Error Modal Triggered:', error.message);
    }
  };

  // Process Break-Out
  const processBreakOut = async (location) => {
    if (!employeeId) {
      Alert.alert('Error', 'Unable to break out: Employee ID is missing');
      return;
    }
    try {
      setLoading(true);
      const { hours, minutes, secs } = formatTime(elapsedTime);
      const currentTime = new Date().getTime();
      const breakDuration = Math.floor((currentTime - breakStartTime) / 1000);
      const breakOutRequestBody = {
        Type: 'BreakOut',
        EmId: employeeId,
        Shift: checkInShift || determineShift(),
        CreatedBy: createdBy,
        ElapsedTime: `${hours}:${minutes}:${secs}`,
        BreakDuration: breakDuration,
        Latitude: String(location.latitude),
        Longitude: String(location.longitude),
      };
      const response = await processAttendanceAction(breakOutRequestBody);
      if (response && (response.success || response.includes('SuccesFully'))) {
        setBreakTime((prev) => prev + breakDuration);
        setIsBreak(false);
        setBreakStartTime(null);
        setIsBreakOutEnabled(false);
        setIsBreakEnabled(true);
        setIsCheckOutEnabled(true);
        await AsyncStorage.multiRemove(['breakStartTime', 'isBreak', 'breakInData']);
        await AsyncStorage.multiSet([
          ['breakTime', (breakTime + breakDuration).toString()],
          ['isBreakEnabled', 'true'],
          ['isBreakOutEnabled', 'false'],
          ['isCheckOutEnabled', 'true'],
        ]);
        startTimer();
        setSuccessMessage('Break-out Successfully');
        setSuccessModalVisible(true);
        setTimeout(() => setSuccessModalVisible(false), 3000);
      } else {
        throw new Error('Break-out failed');
      }
    } catch (error) {
      setErrorMessage(`Break-out failed: ${error.message}`);
      setErrorModalVisible(true);
      console.log('Error Modal Triggered:', error.message);
    }
  };

  // Process Check-Out
  const handleCheckOutAPI = async (location, earlyCheckoutNotesParam = '') => {
    if (!employeeId) {
      Alert.alert('Error', 'Unable to check out: Employee ID is missing');
      return;
    }
    try {
      setLoading(true);
      const { hours, minutes, secs } = formatTime(elapsedTime);
      let storedShift = checkInShift;
      try {
        const checkInData = await AsyncStorage.getItem('checkInData');
        if (checkInData) {
          const parsedData = JSON.parse(checkInData);
          storedShift = parsedData.shift;
        }
      } catch (error) {
        console.error('Error retrieving check-in data:', error);
      }
      if (!storedShift) storedShift = determineShift();
      
      if (checkInTimestamp && isEarlyCheckout(checkInTimestamp, storedShift) && !earlyCheckoutNotesParam) {
        setLoading(false);
        setShowEarlyCheckoutNotes(true);
        console.log('Early Checkout Modal Triggered');
        return;
      }

      const checkOutRequestBody = {
        Type: 'CheckOut',
        EmId: employeeId,
        Shift: storedShift,
        CreatedBy: createdBy,
        ElapsedTime: `${hours}:${minutes}:${secs}`,
        EarlyCheckoutNotes: earlyCheckoutNotesParam || earlyCheckoutNotes || '',
        Latitude: String(location.latitude),
        Longitude: String(location.longitude),
      };
      
      const response = await processAttendanceAction(checkOutRequestBody);
      if (response && (response.success || response.includes('SuccesFully'))) {
        await AsyncStorage.multiRemove([
          'checkInTimestamp',
          'elapsedTime',
          'isCheckedIn',
          'checkInShift',
          'checkInData',
          'breakTime',
          'backgroundStartTime',
        ]);
        stopTimer();
        setCheckedIn(false);
        setElapsedTime(0);
        setCheckInTimestamp(null);
        setBreakTime(0);
        setIsBreak(false);
        setIsCheckedOut(true);
        setIsBreakEnabled(false);
        setIsBreakOutEnabled(false);
        setIsCheckOutEnabled(false);
        setSuccessMessage('Check-out Successfully');
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigation.navigate('AttendanceHome', { mode: 'punch-out' });
        }, 3000);
      } else {
        throw new Error('Check-out failed');
      }
    } catch (error) {
      setErrorMessage(`Check-out failed: ${error.message}`);
      setErrorModalVisible(true);
      console.log('Error Modal Triggered:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle early checkout modal submit
  const handleModalSubmit = async () => {
    if (!earlyCheckoutNotes.trim()) {
      setErrorMessage('Notes are required.');
      return;
    }
    
    setShowEarlyCheckoutNotes(false);
    setErrorMessage('');
    
    try {
      setCurrentAction('checkOutWithNotes');
      setLocationVerificationVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Check-out failed: ' + (error.message || 'Unknown error'));
    }
  };

  // Initialize greeting and date
  useEffect(() => {
    setGreeting(getGreetingMessage());
    setCurrentDate(
      new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    );
  }, []);

  // Update progress animation
  useEffect(() => {
    const progress = Math.min(elapsedTime / (8 * 60 * 60), 1);
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 60000,
      useNativeDriver: false,
    }).start();
  }, [elapsedTime]);

  // Restore elapsed time
  useEffect(() => {
    const restoreElapsedTime = async () => {
      const savedElapsedTime = await AsyncStorage.getItem('elapsedTime');
      if (savedElapsedTime) setElapsedTime(Number(savedElapsedTime));
    };
    restoreElapsedTime();
  }, []);

  // Handle route params for punch-in/out
  useEffect(() => {
    if (route.params?.punchInSuccess) {
      const checkInTime = new Date().getTime();
      const today = getDateString(new Date());
      setCheckedIn(true);
      setCheckInTimestamp(checkInTime);
      setElapsedTime(0);
      setLastCheckInDate(today);
      setIsCheckInEnabled(false);
      AsyncStorage.setItem('checkInTimestamp', checkInTime.toString());
      AsyncStorage.setItem('lastCheckInDate', today);
      startTimer();
    }
    if (route.params?.punchOutSuccess) {
      setCheckedIn(false);
      stopTimer();
      setElapsedTime(0);
      setCheckInTimestamp(null);
      AsyncStorage.removeItem('checkInTimestamp');
    }
  }, [route.params?.punchInSuccess, route.params?.punchOutSuccess]);

  // Restore state from AsyncStorage
  const restoreState = async () => {
    try {
      const storedCheckInTime = await AsyncStorage.getItem('checkInTimestamp');
      const storedIsCheckedIn = await AsyncStorage.getItem('isCheckedIn');
      const storedLastActiveTime = await AsyncStorage.getItem('lastActiveTime');
      const storedElapsedTime = await AsyncStorage.getItem('elapsedTime');
      const storedBreakTime = await AsyncStorage.getItem('breakTime');
      const storedIsBreak = await AsyncStorage.getItem('isBreak');
      const storedBreakStartTime = await AsyncStorage.getItem('breakStartTime');
      const storedLastCheckInDate = await AsyncStorage.getItem('lastCheckInDate');
      if (storedCheckInTime && storedIsCheckedIn === 'true') {
        const checkInTime = parseInt(storedCheckInTime);
        let currentElapsedTime = parseInt(storedElapsedTime || '0');
        if (storedLastActiveTime && storedIsBreak !== 'true') {
          const lastActive = parseInt(storedLastActiveTime);
          const now = Date.now();
          const missedSeconds = Math.floor((now - lastActive) / 1000);
          currentElapsedTime += missedSeconds;
        }
        setCheckedIn(true);
        setCheckInTimestamp(checkInTime);
        setElapsedTime(currentElapsedTime);
        setLastActiveTime(Date.now());
        setBreakTime(parseInt(storedBreakTime || '0'));
        setLastCheckInDate(storedLastCheckInDate);
        setIsCheckInEnabled(storedLastCheckInDate !== getDateString(new Date()));
        await AsyncStorage.setItem('elapsedTime', currentElapsedTime.toString());
        await AsyncStorage.setItem('lastActiveTime', Date.now().toString());
        if (storedIsBreak === 'true' && storedBreakStartTime) {
          setIsBreak(true);
          setBreakStartTime(parseInt(storedBreakStartTime));
          setIsBreakOutEnabled(true);
          setIsBreakEnabled(false);
          setIsCheckOutEnabled(false);
        } else {
          setIsBreak(false);
          setIsBreakOutEnabled(false);
          setIsBreakEnabled(true);
          setIsCheckOutEnabled(true);
          startTimer();
        }
      } else {
        setIsCheckInEnabled(storedLastCheckInDate !== getDateString(new Date()));
        setLastCheckInDate(storedLastCheckInDate);
      }
    } catch (error) {
      console.error('Restore state error:', error);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (backgroundTimerRef.current) {
        BackgroundTimer.clearInterval(backgroundTimerRef.current);
      }
    };
  }, []);

  const { hours, minutes, secs } = formatTime(elapsedTime);

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={watermarkIcon}
        resizeMode="contain"
        imageStyle={styles.imageStyle}
        style={[GlobalStyle.header, styles.headerBackground]}
        pointerEvents="none"
      >
        <View style={styles.header}>
          <Text style={[GlobalStyle.heading1, styles.headerText]}>Home</Text>
        </View>
        <LinearGradient colors={['#ffffff', '#e0e0e0']} style={styles.gradientCard}>
          <ImageBackground resizeMode="cover" imageStyle={[imageStyle, styles.mrngPhoto]} source={imageSource}>
            <View>
              <Text style={[GlobalStyle.heading4, styles.cardTitle]}>{greeting},</Text>
              <Text style={[GlobalStyle.heading6, styles.cardSubtitle]}>{currentDate}</Text>
            </View>
          </ImageBackground>
        </LinearGradient>
      </ImageBackground>
      <View style={styles.timerCard}>
        <Text style={[GlobalStyle.heading5, styles.cardTitleText]}>Log your attendance</Text>
        <View style={styles.timerContainer}>
          <View style={styles.timeWrapper}>
            <View style={styles.timeSection}>
              <Text style={[GlobalStyle.heading3, styles.timeText]}>{hours}</Text>
            </View>
            <Text style={[GlobalStyle.Body, styles.timeLabel]}>Hours</Text>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.timeWrapper}>
            <View style={styles.timeSection}>
              <Text style={[GlobalStyle.heading3, styles.timeText]}>{minutes}</Text>
            </View>
            <Text style={[GlobalStyle.Body, styles.timeLabel]}>Minutes</Text>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.timeWrapper}>
            <View style={styles.timeSection}>
              <Text style={[GlobalStyle.heading3, styles.timeText]}>{secs}</Text>
            </View>
            <Text style={[GlobalStyle.Body, styles.timeLabel]}>Seconds</Text>
          </View>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground} />
          <Animated.View
            style={[
              styles.progressForeground,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.greenDot,
              {
                position: 'absolute',
                left: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={[GlobalStyle.Body, styles.text]}>{shiftText}</Text>
        {checkedIn ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.checkOutButton, { backgroundColor: '#C16161' }, !isCheckOutEnabled && styles.disabledButton]}
              onPress={() => verifyLocationAndProceed('checkOut')}
              disabled={!isCheckOutEnabled}
            >
              <Text
                style={[GlobalStyle.H6, styles.CheckText, !isCheckOutEnabled && styles.disabledButtonText]}
              >
                Check - Out
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.breakButton,
                isBreakEnabled ? { backgroundColor: '#7AB314' } : { backgroundColor: '#3E89EC' },
                !isBreakEnabled && !isBreakOutEnabled && styles.disabledButton,
              ]}
              onPress={isBreakEnabled ? () => verifyLocationAndProceed('breakIn') : () => verifyLocationAndProceed('breakOut')}
              disabled={!isBreakEnabled && !isBreakOutEnabled}
            >
              <Text style={[GlobalStyle.H6, styles.CheckText]}>
                {isBreakEnabled ? 'Break In' : 'Break Out'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.checkInButton, { backgroundColor: '#7AB134' }, !isCheckInEnabled && styles.disabledButton]}
            onPress={() => verifyLocationAndProceed('checkIn')}
            disabled={!isCheckInEnabled}
          >
            <Text style={[GlobalStyle.H6, styles.CheckText, !isCheckInEnabled && styles.disabledButtonText]}>
              Check In
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <Modal transparent visible={showEarlyCheckoutNotes} animationType="slide" onRequestClose={() => setShowEarlyCheckoutNotes(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[GlobalStyle.heading5, styles.modalTitle]}>
              You are checking out before your shift ending
            </Text>
            <Text style={[GlobalStyle.Body, styles.modalLabel]}>Please leave your notes:</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: inputBgColor }]}
              multiline
              onFocus={() => setInputBgColor('white')}
              onBlur={() => setInputBgColor('rgba(128, 128, 128, 0.3)')}
              value={earlyCheckoutNotes}
              onChangeText={(text) => {
                setEarlyCheckoutNotes(text);
                setErrorMessage('');
              }}
              maxLength={100}
            />
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
            <Text style={[GlobalStyle.Body, styles.charCount]}>Maximum 100 Characters</Text>
            <TouchableOpacity style={[GlobalStyle.registerbutton, styles.modalButton]} onPress={handleModalSubmit}>
              <Text style={[GlobalStyle.heading3, styles.modalButtonText]}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal transparent visible={errorModalVisible} animationType="fade" onRequestClose={() => setErrorModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setErrorModalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={[GlobalStyle.heading6, styles.errorText]}>{errorMessage}</Text>
              <LottieView
                style={styles.locationImage}
                source={require('../images/WrongLocation.json')}
                autoPlay
                loop
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <LocationVerificationModal
        visible={locationVerificationVisible}
        onClose={handleLocationVerificationClose}
        onLocationVerified={handleLocationVerified}
        actionType={currentAction}
      />
      <Modal transparent visible={successModalVisible} animationType="fade" onRequestClose={() => setSuccessModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setSuccessModalVisible(false)}>
          <View style={styles.overlay}>
            <View style={styles.modalContainer}>
              <Text style={[GlobalStyle.heading3, styles.successText]}>{successMessage}</Text>
              <LottieView
                style={styles.successlocationImage}
                source={require('../images/Animation3.json')}
                autoPlay
                loop
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingTop: verticalScale(25),
    paddingHorizontal: scale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: verticalScale(7),
  },
  headerText: {
    marginLeft: scale(12),
    top: scale(2),
    color: 'white',
  },
  gradientCard: {
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(15),
    marginTop: verticalScale(20),
    height: verticalScale(80),
    width: scale(300),
    left: scale(4),
    justifyContent: 'center',
    bottom: scale(8),
  },
  mrngPhoto: {
    width: '50%',
    height: 80,
    marginLeft: width - 270,
    left: 50,
    top: -8,
  },
  cardSubtitle: {
    fontWeight: '400',
    marginTop: verticalScale(2),
  },
  timerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    width: scale(310),
    left: scale(1),
    padding: scale(20),
    marginHorizontal: scale(20),
    marginVertical: verticalScale(35),
    alignItems: 'center',
  },
  cardTitle: {
    marginBottom: verticalScale(4),
  },
  cardTitleText: {
    marginBottom: verticalScale(15),
    left: scale(-52),
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: verticalScale(15),
    left: scale(3),
  },
  timeWrapper: {
    alignItems: 'center',
  },
  timeSection: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(64, 61, 129, 0.2)',
    padding: scale(12),
    borderRadius: moderateScale(12),
    width: scale(70),
    height: scale(70),
    marginHorizontal: scale(8),
  },
  timeLabel: {
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  colon: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#050505',
    marginHorizontal: scale(2),
    marginTop: verticalScale(-20),
  },
  progressContainer: {
    width: scale(250),
    height: 1,
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(15),
  },
  progressBackground: {
    width: '100%',
    height: verticalScale(4),
    backgroundColor: 'white',
    position: 'absolute',
    display: 'none',
  },
  progressForeground: {
    height: '100%',
    backgroundColor: '#7AB134',
    position: 'absolute',
  },
  greenDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(6),
    backgroundColor: '#7AB134',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: scale(20),
  },
  checkInButton: {
    padding: scale(0),
    borderRadius: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(8),
    height: scale(40),
    width: scale(125),
  },
  checkOutButton: {
    padding: scale(0),
    borderRadius: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(8),
    height: scale(40),
    width: scale(125),
  },
  breakButton: {
    padding: scale(0),
    borderRadius: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(8),
    height: scale(40),
    width: scale(125),
  },
  disabledButton: {
    backgroundColor: '#dcdcdc',
  },
  disabledButtonText: {
    color: '#a9a9a9',
    textAlign: 'center',
    fontStyle: 'cabin',
  },
  CheckText: {
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: scale(20),
    borderTopLeftRadius: moderateScale(40),
    borderTopRightRadius: moderateScale(40),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
    paddingHorizontal: scale(10),
    height: 'auto',
    minHeight: verticalScale(300),
    maxHeight: '70%',
  },
  divider: {
    width: scale(115),
    height: verticalScale(4),
    backgroundColor: '#696969',
    left: scale(110),
    marginBottom: scale(8),
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: verticalScale(25),
    left: 0,
    marginTop: scale(40),
  },
  modalLabel: {
    alignSelf: 'flex-start',
    marginBottom: scale(16),
    fontWeight: 'normal',
    color: '#000',
    left: scale(8),
    marginTop: scale(5),
  },
  modalInput: {
    width: '100%',
    height: scale(130),
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: moderateScale(20),
    padding: scale(20),
    textAlignVertical: 'top',
    backgroundColor: 'gray',
    fontSize: moderateScale(16),
    marginTop: scale(5),
    color: 'black',
  },
  charCount: {
    alignSelf: 'flex-start',
    marginTop: scale(16),
    left: scale(8),
  },
  modalButton: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(8),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(10),
    alignSelf: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  text: {
    fontWeight: 'normal',
    bottom: scale(8),
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    elevation: 5,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 300,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
  },
  successText: {
    textAlign: 'center',
    marginTop: 20,
  },
  locationImage: {
    width: 130,
    height: 130,
    marginTop: 30,
  },
  successlocationImage: {
    width: 160,
    height: 160,
    marginTop: 30,
  },
});

export default AttendanceHome;