// import React, {useState, useEffect, useRef} from 'react';
// import {
//   Animated,
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   Modal,
//   RefreshControl,
//   useWindowDimensions,
//   Image,
//   SafeAreaView,
//   Dimensions,
//   type,
// } from 'react-native';
// import LottieView from 'lottie-react-native';
// import {useNavigation} from '@react-navigation/native';
// import {encode as base64Encode} from 'base-64';
// import GlobalStyle from '../components/common/GlobalStyle';
// import Loading from '../components/common/Loading.js';
// const {width} = Dimensions.get('window');

// // HeaderSection Component
// const HeaderSection = ({scrollY, totalPresent, totalAbsent}) => {
//   const {width} = useWindowDimensions();

//   // Animated values

//   const imageOpacity = scrollY.interpolate({
//     inputRange: [0, 50], // Smaller range to hide faster
//     outputRange: [2, 0],
//     extrapolate: 'clamp',
//   });

//   const contentOpacity = scrollY.interpolate({
//     inputRange: [0, 50],
//     outputRange: [2, 0],
//     extrapolate: 'clamp',
//   });

//   const translateY = scrollY.interpolate({
//     inputRange: [0, 200],
//     outputRange: [0, -140],
//     extrapolate: 'clamp',
//   });

//   return (
//     <View>
//       <Text style={styles.staticSecurityText}>Attendence</Text>
//       <Animated.View
//         style={[GlobalStyle.headerImage, {transform: [{translateY}]}]}>
//         <Animated.Image
//           style={{
//             width: 232,
//             height: 210,
//             position: 'absolute',
//             top: 34,
//             right: 0,
//             opacity: imageOpacity,
//           }}
//           resizeMode="contain"
//           source={require('../images/LOGO.png')}
//         />

//         <Animated.View style={{opacity: contentOpacity}}>
//           <View style={[styles.statsContainer, {padding: width * 0.04}]}>
//             <StatCard label="Total Presents" value={totalPresent} />
//             <StatCard label="Total Absents" value={totalAbsent} />
//           </View>
//         </Animated.View>
//       </Animated.View>
//     </View>
//   );
// };


// // StatCard Component
// const StatCard = ({label, value}) => {
//   const {width} = useWindowDimensions();

//   return (
//     <View
//       style={[styles.statCard, GlobalStyle.starcard, {padding: width * 0.03}]}>
//       <Text style={GlobalStyle.heading6}>{label}</Text>
//       <Text style={[GlobalStyle.heading4, {fontSize: width * 0.045}]}>
//         {value}
//       </Text>
//     </View>
//   );
// };

// // EmployeeDetails Component
// const EmployeeDetails = () => {
//   const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
//   const scrollViewRef = useRef(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({title: '', message: ''});
//   const [employeesData, setEmployeesData] = useState([]);
//   const [breakTimeData, setBreakTimeData] = useState([]);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const navigation = useNavigation();
//   const [totalPresent, setTotalPresent] = useState(0);
//   const [totalAbsent, setTotalAbsent] = useState(0);

//   // Animated scroll value
//   const scrollY = useRef(new Animated.Value(0)).current;

//   // Fetch employee data
//   const fetchEmployeeData = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const credentials = base64Encode('Inventory:SazsApps@123');
//       const response = await fetch(
//         'https://demo.sazss.in/Api/EmployeeAttendance',
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Basic ${credentials}`,
//             Accept: 'application/json',
//           },
//         },
//       );
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`API Error: ${response.status} - ${errorText}`);
//       }

//       const data = await response.json();
//       // Handle the API response properly - ensure we're working with arrays
//       const employeeArray = Array.isArray(data[0]) ? data[0] : [];
//       const breakTimeArray = Array.isArray(data[1]) ? data[1] : [];
//       const totalEmployees = Array.isArray(data[2]) ? data[2] : [];

//       // Get current date in DD/MM/YYYY format
//       const today = new Date();
//       const day = String(today.getDate()).padStart(2, '0');
//       const month = String(today.getMonth() + 1).padStart(2, '0');
//       const year = today.getFullYear();
//       const currentDate = `${day}/${month}/${year}`;

//       console.log('Current date:', currentDate);

//       // Use the current date from the response if available
//       // Otherwise, fall back to using today's date
//       let todayEmployeeArray = employeeArray.filter(
//         employee => employee.Date === currentDate,
//       );

//       // If no entries for today, take the most recent date's data
//       if (todayEmployeeArray.length === 0) {
//         // Get all unique dates in the response
//         const uniqueDates = [...new Set(employeeArray.map(emp => emp.Date))];
//         // Sort dates in descending order (most recent first)
//         uniqueDates.sort((a, b) => {
//           const [dayA, monthA, yearA] = a.split('/').map(Number);
//           const [dayB, monthB, yearB] = b.split('/').map(Number);

//           // Compare years, then months, then days
//           if (yearA !== yearB) return yearB - yearA;
//           if (monthA !== monthB) return monthB - monthA;
//           return dayB - dayA;
//         });

//         // Use the most recent date
//         // if (uniqueDates.length > 0) {
//         //   const mostRecentDate = uniqueDates[0];
//         //   console.log('No data for today, using most recent date:', mostRecentDate);
//         //   todayEmployeeArray = employeeArray.filter(employee =>
//         //     employee.Date === mostRecentDate
//         //   );
//         // }
//       }

//       console.log('Today employee array length:', todayEmployeeArray.length);

//       // Filter break time data to match the employee IDs we have
//       const relevantEmployeeIds = new Set(
//         todayEmployeeArray.map(emp => emp.EmployeeId),
//       );
//       const todayBreakTimeArray = breakTimeArray.filter(breakEntry =>
//         relevantEmployeeIds.has(breakEntry.EmployeeId),
//       );

//       // Create a Map for unique employees based on the most recent time record
//       // FIX: Make sure we're correctly storing unique employees by ID
//       const uniqueEmployees = new Map();
//       todayEmployeeArray.forEach(employee => {
//         const currentEntry = uniqueEmployees.get(employee.EmployeeId);
//         if (
//           !currentEntry ||
//           new Date(
//             `${employee.Date.split('/').reverse().join('-')} ${
//               employee.InTime
//             }`,
//           ) >
//             new Date(
//               `${currentEntry.Date.split('/').reverse().join('-')} ${
//                 currentEntry.InTime
//               }`,
//             )
//         ) {
//           uniqueEmployees.set(employee.EmployeeId, employee);
//         }
//       });

//       console.log('Unique employees count:', uniqueEmployees.size);

//       const presentCount = uniqueEmployees.size;
//       const totalCount = totalEmployees.length;
//       const absentCount = Math.max(0, totalCount - presentCount);

//       setTotalPresent(presentCount);
//       setTotalAbsent(absentCount);
//       setBreakTimeData(todayBreakTimeArray);

//       // Create a Map for break time data
//       const breakTimeMap = new Map();
//       todayBreakTimeArray.forEach(breakEntry => {
//         breakTimeMap.set(breakEntry.EmployeeId, {
//           breakIn: breakEntry.BreakIn
//             ? new Date(breakEntry.BreakIn).toLocaleTimeString()
//             : null,
//           breakOut: breakEntry.BreakOut
//             ? new Date(breakEntry.BreakOut).toLocaleTimeString()
//             : null,
//           breakHours: breakEntry.BreakHours,
//         });
//       });

//       // Transform data for UI display
//       // FIX: Make sure we're getting ALL unique employees from the Map
//       const transformedData = Array.from(uniqueEmployees.values()).map(
//         employee => {
//           const breakData = breakTimeMap.get(employee.EmployeeId) || {
//             breakIn: null,
//             breakOut: null,
//             breakHours: 0,
//           };
//           return {
//             name: employee.EmployeeName,
//             id: employee.EmployeeId,
//             phone: employee.MobileNo,
//             shift: employee.Shift,
//             // FIX: Always include a default photo, since the original code uses a require statement
//             // which won't work with dynamic paths
//             photo: require('../images/2.jpg'),
//             status: employee.OutTime ? 'checked-out' : 'checked-in',
//             time: employee.OutTime || employee.InTime,
//             inTime: employee.InTime,
//             outTime: employee.OutTime,
//             date: employee.Date,
//             breakIn: breakData.breakIn,
//             breakOut: breakData.breakOut,
//             breakHours: breakData.breakHours,
//           };
//         },
//       );

//       // Sort by date/time if needed
//       transformedData.sort((a, b) => {
//         // Convert DD/MM/YYYY format to YYYY-MM-DD for proper date comparison
//         const dateA = a.date.split('/').reverse().join('-');
//         const dateB = b.date.split('/').reverse().join('-');

//         const dateTimeA = new Date(`${dateA} ${a.time}`);
//         const dateTimeB = new Date(`${dateB} ${b.time}`);
//         return dateTimeB - dateTimeA;
//       });

//       console.log('Final transformed data length:', transformedData.length);

//       // FIX: Debug by logging employee names to check if all are included
//       transformedData.forEach((emp, index) => {
//         console.log(`Employee ${index + 1}: ${emp.name} (${emp.shift} shift)`);
//       });

//       setEmployeesData(transformedData);
//       setIsLoading(false);
//     } catch (error) {
//       console.error('Error in fetchEmployeeData:', error);
//       setError(error.message);
//       setIsLoading(false);
//       setAlertConfig({
//         title: 'Error',
//         message: `Failed to fetch employee data: ${error.message}`,
//       });
//       setAlertVisible(true);
//     }
//   };

//   useEffect(() => {
//     fetchEmployeeData();
//   }, []);

//   const onRefresh = React.useCallback(() => {
//     setRefreshing(true);
//     fetchEmployeeData().finally(() => setRefreshing(false));
//   }, []);

//   const handleCardExpand = (employeeId, index) => {
//     const newExpandedId = expandedEmployeeId === employeeId ? null : employeeId;
//     setExpandedEmployeeId(newExpandedId);

//     if (newExpandedId !== null) {
//       setTimeout(() => {
//         if (scrollViewRef.current) {
//           scrollViewRef.current.scrollTo({
//             y: index * 100,
//             animated: true,
//           });
//         }
//       }, 100);
//     }
//   };

//   const handleAlertClose = () => {
//     setAlertVisible(false);
//   };

//   const listTranslateY = scrollY.interpolate({
//     inputRange: [0, 240],
//     outputRange: [0, -140], // Reduced movement to keep content visible
//     extrapolate: 'clamp',
//   });
//   return (
//     <View style={styles.container}>
//       <SafeAreaView
//         style={[styles.safeArea, {flex: 1}]}
//         edges={['left', 'right', 'bottom']}>
//            <HeaderSection
//             scrollY={scrollY}
//             totalPresent={totalPresent}
//             totalAbsent={totalAbsent}
//             // Add zIndex to keep header on top
//           />
//         {/* Main ScrollView that wraps the entire content */}
       
         
//           {/* Animated Header */}
//           <Animated.View 
//             style={{
//               transform: [{translateY: listTranslateY}],
//               zIndex: 1, // Lower zIndex than header
//               // paddingTop: 10, // Add padding to avoid initial overlap with header
//             }}>
//             <Text style={styles.headerText}>Employee Details</Text>
//             <Animated.ScrollView
//           ref={scrollViewRef}
//           showsVerticalScrollIndicator={true}
//           onScroll={Animated.event(
//             [{nativeEvent: {contentOffset: {y: scrollY}}}],
//             {useNativeDriver: true},
//           )}
//           scrollEventThrottle={16}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               colors={['#0078D7']}
//               progressBackgroundColor="#FFFFFF"
//             />
//           }
//           contentContainerStyle={{
//             paddingTop: 20, // Add some padding to ensure content starts below header
//             paddingBottom: 200, // Add padding at the bottom to prevent cutoff
//           }}
//         >
//             {/* Employee cards container */}
//             <View style={{paddingHorizontal: 10}}>
//               {employeesData.map((employee, index) => (
//                 <EmployeeCard
//                   key={employee.id}
//                   employee={employee}
//                   breakTimeData={breakTimeData}
//                   index={index}
//                   isExpanded={expandedEmployeeId === employee.id}
//                   onExpand={() => handleCardExpand(employee.id, index)}
//                 />
//               ))}
//             </View>
//             </Animated.ScrollView>
//           </Animated.View>
        
//       </SafeAreaView>
// {isLoading && <Loading />}
//       <AlertModal
//         visible={alertVisible}
//         onClose={handleAlertClose}
//         title={alertConfig.title}
//         message={alertConfig.message}
//       />
      
//     </View>
//   );
// };

// // EmployeeCard Component
// const EmployeeCard = ({
//   employee,
//   breakTimeData,
//   index,
//   isExpanded,
//   onExpand,
// }) => {
//   const timeFormat = {
//     inTime: employee.inTime
//       ? new Date(`2024-01-01 ${employee.inTime}`).toLocaleTimeString([], {
//           hour: '2-digit',
//           minute: '2-digit',
//           hour12: true,
//         })
//       : '-',
//     outTime: employee.outTime
//       ? new Date(`2024-01-01 ${employee.outTime}`).toLocaleTimeString([], {
//           hour: '2-digit',
//           minute: '2-digit',
//           hour12: true,
//         })
//       : '-',
//   };

//   const getStatus = () => {
//     const activeBreak = breakTimeData?.find(
//       breakItem =>
//         breakItem.EmployeeId === employee.id &&
//         breakItem.BreakIn &&
//         !breakItem.BreakOut,
//     );

//     if (activeBreak) {
//       return {
//         icon: require('../images/break.png'),
//         text: 'In Break',
//         color: '#FFA500',
//         textColor: '#000000',
//       };
//     } else if (employee.outTime) {
//       return {
//         icon: require('../images/Completed.png'),
//         text: 'Completed',
//         color: '#cefad0',
//         textColor: '#000000',
//       };
//     } else if (employee.inTime) {
//       return {
//         icon: require('../images/working.png'),
//         text: 'Working',
//         color: '#82caff',
//         textColor: '#000000',
//       };
//     }
//     return null;
//   };

//   const status = getStatus();

//   return (
//     <View style={styles.detailsContainer1}>
//       <TouchableOpacity
//         onPress={onExpand}
//         style={[styles.detailsContainer, index > 0 && styles.marginTop]}>
//         <View style={styles.photoContainer}>
//           <Image
//             source={employee.photo}
//             style={styles.profilePhoto}
//             resizeMode="cover"
//           />
//         </View>

//         <View
//           style={[
//             styles.detailItem,
//             {marginLeft: 65, marginBottom: 20, marginTop: -80},
//           ]}>
//           <View
//             style={{
//               paddingHorizontal: 10,
//               paddingVertical: 5,
//               borderRadius: 20,
//               alignSelf: 'flex-start',
//             }}>
//             <Text
//               style={[
//                 styles.value,
//                 {
//                   fontSize: 16,
//                   fontWeight: '500',
//                   color: '#000000',
//                   fontFamily: 'Cabin-Bold',
//                 },
//               ]}>
//               {employee.name}
//             </Text>
//           </View>

//           {status && (
//             <View style={styles.statusContainer}>
//               <Image
//                 source={status.icon}
//                 style={styles.statusIcon}
//                 resizeMode="contain"
//               />
//               <View
//                 style={[styles.statusBadge, {backgroundColor: status.color}]}>
//                 <Text style={[styles.statusText, {color: status.textColor}]}>
//                   {status.text}
//                 </Text>
//               </View>
//             </View>
//           )}
//         </View>
//         <View style={styles.shiftContainer}>
//           <Text style={styles.shiftText}>{employee.shift}</Text>
//         </View>

//         <View style={styles.timeContainer}>
//           <View style={styles.timeRow}>
//             <Image
//               source={require('../images/intime.png')}
//               style={styles.icon}
//               resizeMode="contain"
//             />
//             <Text style={styles.timeValue}>{timeFormat.inTime}</Text>
//           </View>
//           <View style={styles.timeRow}>
//             <Image
//               source={require('../images/outtime.png')}
//               style={styles.icon}
//               resizeMode="contain"
//             />
//             <Text style={styles.timeValue}>{timeFormat.outTime}</Text>
//           </View>
//         </View>

//         <BreakTimeDetails
//           employeeId={employee.id}
//           breakData={breakTimeData}
//           isVisible={isExpanded}
//         />
//       </TouchableOpacity>
//     </View>
//   );
// };

// // BreakTimeDetails Component
// const BreakTimeDetails = ({employeeId, breakData, isVisible}) => {
//   const [breaks, setBreaks] = useState([]);

//   useEffect(() => {
//     const employeeBreaks = breakData.filter(
//       item => item.EmployeeId === employeeId,
//     );
//     setBreaks(employeeBreaks);
//   }, [employeeId, breakData]);

//   const calculateTimeDifference = (breakIn, breakOut) => {
//     if (!breakIn || !breakOut) return '-';

//     const start = new Date(breakIn);
//     const end = new Date(breakOut);
//     const diffInMinutes = Math.round((end - start) / (1000 * 60));

//     const hours = Math.floor(diffInMinutes / 60);
//     const minutes = diffInMinutes % 60;

//     if (hours > 0) {
//       return `${hours}h ${minutes}m`;
//     }
//     return `${minutes}m`;
//   };

//   if (!breaks || breaks.length === 0 || !isVisible) return null;

//   return (
//     <View style={styles.breakContainer}>
//       {breaks.map((breakItem, index) => (
//         <View key={index}>
//           <View style={styles.breakNumberContainer}>
//             <Text style={styles.breakHeading}>Break {index + 1}</Text>
//           </View>
//           <View style={styles.breakTimeContainer}>
//             <View style={styles.timeRow}>
//               <Text style={styles.timeValue}>
//                 {breakItem.BreakIn
//                   ? new Date(breakItem.BreakIn).toLocaleTimeString([], {
//                       hour: '2-digit',
//                       minute: '2-digit',
//                       hour12: true,
//                     })
//                   : '-'}
//               </Text>
//               <View style={styles.dividerContainer}>
//                 <View style={styles.timeDifferenceContainer}>
//                   <Text style={styles.timeDifferenceText}>
//                     {calculateTimeDifference(
//                       breakItem.BreakIn,
//                       breakItem.BreakOut,
//                     )}
//                   </Text>
//                 </View>
//                 <View style={styles.timeDivider} />
//               </View>
//               <Text style={styles.timeValue}>
//                 {breakItem.BreakOut
//                   ? new Date(breakItem.BreakOut).toLocaleTimeString([], {
//                       hour: '2-digit',
//                       minute: '2-digit',
//                       hour12: true,
//                     })
//                   : '-'}
//               </Text>
//             </View>
//           </View>
//         </View>
//       ))}
//     </View>
//   );
// };

// // AlertModal Component
// const AlertModal = React.memo(({visible, onClose, title, message}) => {
//   const slideAnim = useRef(new Animated.Value(300)).current; // Starts off-screen
//   const fadeAnim = useRef(new Animated.Value(0)).current; // Starts invisible

//   const isError = title === 'Error' || type === 'Error';

//   // Determine which animation to use based on the error condition
//   const animationSource = isError
//     ? require('../images/wrongx.json')
//     : require('../images/Animation3.json');

//   useEffect(() => {
//     if (visible) {
//       Animated.parallel([
//         Animated.spring(slideAnim, {
//           toValue: 0,
//           tension: 50,
//           friction: 7,
//           useNativeDriver: true,
//         }),
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     } else {
//       Animated.parallel([
//         Animated.timing(slideAnim, {
//           toValue: 300,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }
//   }, [visible]);

//   return (
//     <Modal transparent visible={visible} animationType="none">
//       <Animated.View
//         style={[
//           styles.modalOverlay1,
//           {opacity: fadeAnim}, // Apply fade effect
//         ]}>
//         <Animated.View
//           style={[
//             styles.alertContainer,
//             {transform: [{translateY: slideAnim}]}, // Slide effect
//           ]}>
//           <Text style={styles.alertTitle}>{title}</Text>
//           <Text style={styles.alertMessage}>{message}</Text>

//           <View style={styles.animationContainer}>
//             <LottieView
//               style={styles.WelcomeAnime}
//               source={animationSource}
//               autoPlay
//               loop={false}
//               onAnimationFinish={onClose}
//             />
//           </View>
//         </Animated.View>
//       </Animated.View>
//     </Modal>
//   );
// });




import React, {useState, useEffect, useRef} from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  RefreshControl,
  useWindowDimensions,
  Image,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {useNavigation} from '@react-navigation/native';
import { getStoredData } from '../components/common/AsyncStorage';
import GlobalStyle from '../components/common/GlobalStyle';
import Loading from '../components/common/Loading.js';
const {width} = Dimensions.get('window');

// HeaderSection Component
const HeaderSection = ({scrollY, totalPresent, totalAbsent}) => {
  const {width} = useWindowDimensions();

  // Animated values
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 50], // Smaller range to hide faster
    outputRange: [2, 0],
    extrapolate: 'clamp',
  });

  const contentOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [2, 0],
    extrapolate: 'clamp',
  });

  const translateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -140],
    extrapolate: 'clamp',
  });

  return (
    <View>
      <Text style={styles.staticSecurityText}>Attendence</Text>
      <Animated.View
        style={[GlobalStyle.headerImage, {transform: [{translateY}]}]}>
        <Animated.Image
          style={{
            width: 232,
            height: 210,
            position: 'absolute',
            top: 34,
            right: 0,
            opacity: imageOpacity,
          }}
          resizeMode="contain"
          source={require('../images/LOGO.png')}
        />

        <Animated.View style={{opacity: contentOpacity}}>
          <View style={[styles.statsContainer, {padding: width * 0.04}]}>
            <StatCard label="Total Presents" value={totalPresent} />
            <StatCard label="Total Absents" value={totalAbsent} />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

// StatCard Component
const StatCard = ({label, value}) => {
  const {width} = useWindowDimensions();

  return (
    <View
      style={[styles.statCard, GlobalStyle.starcard, {padding: width * 0.03}]}>
      <Text style={GlobalStyle.heading6}>{label}</Text>
      <Text style={[GlobalStyle.heading4, {fontSize: width * 0.045}]}>
        {value}
      </Text>
    </View>
  );
};

// EmployeeDetails Component
const EmployeeDetails = () => {
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
  const scrollViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({title: '', message: ''});
  const [employeesData, setEmployeesData] = useState([]);
  const [breakTimeData, setBreakTimeData] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [companyDetails, setCompanyDetails] = useState(null);

  // Animated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;

  // Fetch company details first
  const fetchCompanyDetails = async () => {
    try {
      // Get the selected company ID
      const selectedCompanyId = await getStoredData('SelectedCompany');
      if (!selectedCompanyId) {
        Alert.alert('Error', 'No company selected. Please register first.');
        navigation.navigate('Register');
        return;
      }

      // Get all company details
      const allCompanyDetails = await getStoredData('CompanyDetails');
      if (!allCompanyDetails || !Array.isArray(allCompanyDetails)) {
        Alert.alert('Error', 'Company details not found. Please register first.');
        navigation.navigate('Register');
        return;
      }

      // Find the selected company
      const selectedCompany = allCompanyDetails.find(
        company => company.id === parseInt(selectedCompanyId)
      );

      if (!selectedCompany) {
        Alert.alert('Error', 'Selected company not found. Please register first.');
        navigation.navigate('Register');
        return;
      }

      console.log('Selected company details:', selectedCompany);
      setCompanyDetails(selectedCompany);
    } catch (error) {
      console.error('Error fetching company details:', error);
      Alert.alert('Error', 'Failed to fetch company details. Please try again.');
    }
  };

  // Fetch employee data
  const fetchEmployeeData = async () => {
    if (!companyDetails) {
      console.log('Company details not available, skipping fetch');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Construct dynamic API URL using company details
      const apiUrl = `https://${companyDetails.Webkey}.sazss.in/Api/EmployeeAttendance`;
      
      // Create authorization header using username and password
      const username = companyDetails.Username;
      const password = companyDetails.Password;
      const credentials = btoa(`${username}:${password}`);

      console.log('Fetching employee data from:', apiUrl);
      console.log('Using credentials for:', username);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response received:', data);

      // Handle the API response properly - ensure we're working with arrays
      const employeeArray = Array.isArray(data[0]) ? data[0] : [];
      const breakTimeArray = Array.isArray(data[1]) ? data[1] : [];
      const totalEmployees = Array.isArray(data[2]) ? data[2] : [];

      // Get current date in DD/MM/YYYY format
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const currentDate = `${day}/${month}/${year}`;

      console.log('Current date:', currentDate);

      // Use the current date from the response if available
      // Otherwise, fall back to using today's date
      let todayEmployeeArray = employeeArray.filter(
        employee => employee.Date === currentDate,
      );

      // If no entries for today, take the most recent date's data
      if (todayEmployeeArray.length === 0) {
        // Get all unique dates in the response
        const uniqueDates = [...new Set(employeeArray.map(emp => emp.Date))];
        // Sort dates in descending order (most recent first)
        uniqueDates.sort((a, b) => {
          const [dayA, monthA, yearA] = a.split('/').map(Number);
          const [dayB, monthB, yearB] = b.split('/').map(Number);

          // Compare years, then months, then days
          if (yearA !== yearB) return yearB - yearA;
          if (monthA !== monthB) return monthB - monthA;
          return dayB - dayA;
        });

        // Use the most recent date
        // if (uniqueDates.length > 0) {
        //   const mostRecentDate = uniqueDates[0];
        //   console.log('No data for today, using most recent date:', mostRecentDate);
        //   todayEmployeeArray = employeeArray.filter(employee =>
        //     employee.Date === mostRecentDate
        //   );
        // }
      }

      console.log('Today employee array length:', todayEmployeeArray.length);

      // Filter break time data to match the employee IDs we have
      const relevantEmployeeIds = new Set(
        todayEmployeeArray.map(emp => emp.EmployeeId),
      );
      const todayBreakTimeArray = breakTimeArray.filter(breakEntry =>
        relevantEmployeeIds.has(breakEntry.EmployeeId),
      );

      // Create a Map for unique employees based on the most recent time record
      // FIX: Make sure we're correctly storing unique employees by ID
      const uniqueEmployees = new Map();
      todayEmployeeArray.forEach(employee => {
        const currentEntry = uniqueEmployees.get(employee.EmployeeId);
        if (
          !currentEntry ||
          new Date(
            `${employee.Date.split('/').reverse().join('-')} ${
              employee.InTime
            }`,
          ) >
            new Date(
              `${currentEntry.Date.split('/').reverse().join('-')} ${
                currentEntry.InTime
              }`,
            )
        ) {
          uniqueEmployees.set(employee.EmployeeId, employee);
        }
      });

      console.log('Unique employees count:', uniqueEmployees.size);

      const presentCount = uniqueEmployees.size;
      const totalCount = totalEmployees.length;
      const absentCount = Math.max(0, totalCount - presentCount);

      setTotalPresent(presentCount);
      setTotalAbsent(absentCount);
      setBreakTimeData(todayBreakTimeArray);

      // Create a Map for break time data
      const breakTimeMap = new Map();
      todayBreakTimeArray.forEach(breakEntry => {
        breakTimeMap.set(breakEntry.EmployeeId, {
          breakIn: breakEntry.BreakIn
            ? new Date(breakEntry.BreakIn).toLocaleTimeString()
            : null,
          breakOut: breakEntry.BreakOut
            ? new Date(breakEntry.BreakOut).toLocaleTimeString()
            : null,
          breakHours: breakEntry.BreakHours,
        });
      });

      // Transform data for UI display
      // FIX: Make sure we're getting ALL unique employees from the Map
      const transformedData = Array.from(uniqueEmployees.values()).map(
        employee => {
          const breakData = breakTimeMap.get(employee.EmployeeId) || {
            breakIn: null,
            breakOut: null,
            breakHours: 0,
          };
          return {
            name: employee.EmployeeName,
            id: employee.EmployeeId,
            phone: employee.MobileNo,
            shift: employee.Shift,
            // FIX: Always include a default photo, since the original code uses a require statement
            // which won't work with dynamic paths
            photo: require('../images/2.jpg'),
            status: employee.OutTime ? 'checked-out' : 'checked-in',
            time: employee.OutTime || employee.InTime,
            inTime: employee.InTime,
            outTime: employee.OutTime,
            date: employee.Date,
            breakIn: breakData.breakIn,
            breakOut: breakData.breakOut,
            breakHours: breakData.breakHours,
          };
        },
      );

      // Sort by date/time if needed
      transformedData.sort((a, b) => {
        // Convert DD/MM/YYYY format to YYYY-MM-DD for proper date comparison
        const dateA = a.date.split('/').reverse().join('-');
        const dateB = b.date.split('/').reverse().join('-');

        const dateTimeA = new Date(`${dateA} ${a.time}`);
        const dateTimeB = new Date(`${dateB} ${b.time}`);
        return dateTimeB - dateTimeA;
      });

      console.log('Final transformed data length:', transformedData.length);

      // FIX: Debug by logging employee names to check if all are included
      transformedData.forEach((emp, index) => {
        console.log(`Employee ${index + 1}: ${emp.name} (${emp.shift} shift)`);
      });

      setEmployeesData(transformedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error in fetchEmployeeData:', error);
      setError(error.message);
      setIsLoading(false);
      setAlertConfig({
        title: 'Error',
        message: `Failed to fetch employee data: ${error.message}`,
      });
      setAlertVisible(true);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  // Fetch employee data when company details are available
  useEffect(() => {
    if (companyDetails) {
      fetchEmployeeData();
    }
  }, [companyDetails]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (companyDetails) {
      fetchEmployeeData().finally(() => setRefreshing(false));
    } else {
      fetchCompanyDetails().finally(() => setRefreshing(false));
    }
  }, [companyDetails]);

  const handleCardExpand = (employeeId, index) => {
    const newExpandedId = expandedEmployeeId === employeeId ? null : employeeId;
    setExpandedEmployeeId(newExpandedId);

    if (newExpandedId !== null) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            y: index * 100,
            animated: true,
          });
        }
      }, 100);
    }
  };

  const handleAlertClose = () => {
    setAlertVisible(false);
  };

  const listTranslateY = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, -140], // Reduced movement to keep content visible
    extrapolate: 'clamp',
  });

  // Show loading if company details are not loaded yet
  if (!companyDetails) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, {flex: 1}]} edges={['left', 'right', 'bottom']}>
          <Loading />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView
        style={[styles.safeArea, {flex: 1}]}
        edges={['left', 'right', 'bottom']}>
           <HeaderSection
            scrollY={scrollY}
            totalPresent={totalPresent}
            totalAbsent={totalAbsent}
            // Add zIndex to keep header on top
          />
        {/* Main ScrollView that wraps the entire content */}
       
         
          {/* Animated Header */}
          <Animated.View 
            style={{
              transform: [{translateY: listTranslateY}],
              zIndex: 1, // Lower zIndex than header
              // paddingTop: 10, // Add padding to avoid initial overlap with header
            }}>
            <Text style={styles.headerText}>Employee Details</Text>
            <Animated.ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={true}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: true},
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0078D7']}
              progressBackgroundColor="#FFFFFF"
            />
          }
          contentContainerStyle={{
            paddingTop: 20, // Add some padding to ensure content starts below header
            paddingBottom: 200, // Add padding at the bottom to prevent cutoff
          }}
        >
            {/* Employee cards container */}
            <View style={{paddingHorizontal: 10}}>
              {employeesData.length > 0 ? (
                employeesData.map((employee, index) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    breakTimeData={breakTimeData}
                    index={index}
                    isExpanded={expandedEmployeeId === employee.id}
                    onExpand={() => handleCardExpand(employee.id, index)}
                  />
                ))
              ) : (
                !isLoading && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No employee data available</Text>
                  </View>
                )
              )}
            </View>
            </Animated.ScrollView>
          </Animated.View>
        
      </SafeAreaView>
{isLoading && <Loading />}
      <AlertModal
        visible={alertVisible}
        onClose={handleAlertClose}
        title={alertConfig.title}
        message={alertConfig.message}
      />
      
    </View>
  );
};

// EmployeeCard Component
const EmployeeCard = ({
  employee,
  breakTimeData,
  index,
  isExpanded,
  onExpand,
}) => {
  const timeFormat = {
    inTime: employee.inTime
      ? new Date(`2024-01-01 ${employee.inTime}`).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : '-',
    outTime: employee.outTime
      ? new Date(`2024-01-01 ${employee.outTime}`).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : '-',
  };

  const getStatus = () => {
    const activeBreak = breakTimeData?.find(
      breakItem =>
        breakItem.EmployeeId === employee.id &&
        breakItem.BreakIn &&
        !breakItem.BreakOut,
    );

    if (activeBreak) {
      return {
        icon: require('../images/break.png'),
        text: 'In Break',
        color: '#FFA500',
        textColor: '#000000',
      };
    } else if (employee.outTime) {
      return {
        icon: require('../images/Completed.png'),
        text: 'Completed',
        color: '#cefad0',
        textColor: '#000000',
      };
    } else if (employee.inTime) {
      return {
        icon: require('../images/working.png'),
        text: 'Working',
        color: '#82caff',
        textColor: '#000000',
      };
    }
    return null;
  };

  const status = getStatus();

  return (
    <View style={styles.detailsContainer1}>
      <TouchableOpacity
        onPress={onExpand}
        style={[styles.detailsContainer, index > 0 && styles.marginTop]}>
        <View style={styles.photoContainer}>
          <Image
            source={employee.photo}
            style={styles.profilePhoto}
            resizeMode="cover"
          />
        </View>

        <View
          style={[
            styles.detailItem,
            {marginLeft: 65, marginBottom: 20, marginTop: -80},
          ]}>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              alignSelf: 'flex-start',
            }}>
            <Text
              style={[
                styles.value,
                {
                  fontSize: 16,
                  fontWeight: '500',
                  color: '#000000',
                  fontFamily: 'Cabin-Bold',
                },
              ]}>
              {employee.name}
            </Text>
          </View>

          {status && (
            <View style={styles.statusContainer}>
              <Image
                source={status.icon}
                style={styles.statusIcon}
                resizeMode="contain"
              />
              <View
                style={[styles.statusBadge, {backgroundColor: status.color}]}>
                <Text style={[styles.statusText, {color: status.textColor}]}>
                  {status.text}
                </Text>
              </View>
            </View>
          )}
        </View>
        <View style={styles.shiftContainer}>
          <Text style={styles.shiftText}>{employee.shift}</Text>
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeRow}>
            <Image
              source={require('../images/intime.png')}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.timeValue}>{timeFormat.inTime}</Text>
          </View>
          <View style={styles.timeRow}>
            <Image
              source={require('../images/outtime.png')}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={styles.timeValue}>{timeFormat.outTime}</Text>
          </View>
        </View>

        <BreakTimeDetails
          employeeId={employee.id}
          breakData={breakTimeData}
          isVisible={isExpanded}
        />
      </TouchableOpacity>
    </View>
  );
};

// BreakTimeDetails Component
const BreakTimeDetails = ({employeeId, breakData, isVisible}) => {
  const [breaks, setBreaks] = useState([]);

  useEffect(() => {
    const employeeBreaks = breakData.filter(
      item => item.EmployeeId === employeeId,
    );
    setBreaks(employeeBreaks);
  }, [employeeId, breakData]);

  const calculateTimeDifference = (breakIn, breakOut) => {
    if (!breakIn || !breakOut) return '-';

    const start = new Date(breakIn);
    const end = new Date(breakOut);
    const diffInMinutes = Math.round((end - start) / (1000 * 60));

    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!breaks || breaks.length === 0 || !isVisible) return null;

  return (
    <View style={styles.breakContainer}>
      {breaks.map((breakItem, index) => (
        <View key={index}>
          <View style={styles.breakNumberContainer}>
            <Text style={styles.breakHeading}>Break {index + 1}</Text>
          </View>
          <View style={styles.breakTimeContainer}>
            <View style={styles.timeRow}>
              <Text style={styles.timeValue}>
                {breakItem.BreakIn
                  ? new Date(breakItem.BreakIn).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })
                  : '-'}
              </Text>
              <View style={styles.dividerContainer}>
                <View style={styles.timeDifferenceContainer}>
                  <Text style={styles.timeDifferenceText}>
                    {calculateTimeDifference(
                      breakItem.BreakIn,
                      breakItem.BreakOut,
                    )}
                  </Text>
                </View>
                <View style={styles.timeDivider} />
              </View>
              <Text style={styles.timeValue}>
                {breakItem.BreakOut
                  ? new Date(breakItem.BreakOut).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })
                  : '-'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

// AlertModal Component
const AlertModal = React.memo(({visible, onClose, title, message}) => {
  const slideAnim = useRef(new Animated.Value(300)).current; // Starts off-screen
  const fadeAnim = useRef(new Animated.Value(0)).current; // Starts invisible

  const isError = title === 'Error';

  // Determine which animation to use based on the error condition
  const animationSource = isError
    ? require('../images/wrongx.json')
    : require('../images/Animation3.json');

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={[
          styles.modalOverlay1,
          {opacity: fadeAnim}, // Apply fade effect
        ]}>
        <Animated.View
          style={[
            styles.alertContainer,
            {transform: [{translateY: slideAnim}]}, // Slide effect
          ]}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>

          <View style={styles.animationContainer}>
            <LottieView
              style={styles.WelcomeAnime}
              source={animationSource}
              autoPlay
              loop={false}
              onAnimationFinish={onClose}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});
const styles = StyleSheet.create({
  staticSecurityText: {
    fontSize: 28,
    fontFamily: 'Cabin-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 10,

    padding: 10,

    position: 'absolute', // Keeps it fixed
    top: 30, // Adjust to match design

    left: '15%',
    transform: [{translateX: -50}], // Centers it
    zIndex: 10, // Ensures it stays above
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F3EC',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width * 0.2,
  },
  statCard: {
    backgroundColor: '#ffffff',
    flex: 1,
    marginHorizontal: width * 0.02,
    borderRadius: 8,
    padding: width * 0.03,
    alignItems: 'center',
  },

  photoContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },

  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: 'Cabin-Bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#82caff',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  shiftContainer: {
    marginTop: 8,
  },
  shiftText: {
    fontSize: 14,
    color: '#666',
  },
  timeContainer: {
    marginTop: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  timeValue: {
    fontSize: 14,
    color: '#000',
  },
  breakContainer: {
    marginTop: 16,
  },
  breakNumberContainer: {
    marginBottom: 8,
  },
  breakHeading: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  breakTimeContainer: {
    marginTop: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  timeDifferenceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  timeDifferenceText: {
    fontSize: 12,
    color: '#666',
  },
  timeDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#ccc',
    marginHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
  alertOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  alertHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    marginBottom: 10,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  animationContainer: {
    width: 100,
    height: 100,
  },
  welcomeAnimation: {
    width: '100%',
    height: '100%',
  },

  // Missing styles from Style 1
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3E89EC', // Adjust to match your blue header color
    zIndex: 100,
    elevation: 5, // For Android
    shadowColor: '#000', // For iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  header: {
    padding: width * 0.04,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerButton: {
    backgroundColor: '#0b1133',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    marginRight: 20,
    alignSelf: 'flex-end',
  },
  headerButton1: {
    backgroundColor: '#0b1133',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    marginRight: 20,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Cabin-Bold',
  },
  buttonText12: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Cabin-Bold',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 20,
    color: '#000000',
    fontFamily: 'Cabin-Bold',
  },

  infoContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'Cabin-Bold',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Cabin-Bold',
  },
  breakHeader: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Cabin-Bold',
  },
  expandIndicator: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
  },
  expandText: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Cabin-Bold',
  },

  detailsContainer1: {flex: 1},
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flex: 1,
  },
  marginTop: {
    marginTop: 12,
  },
  photoContainer: {
    marginBottom: 15,
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Cabin-Bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusIcon: {
    width: 16,
    height: 16,
    marginRight: 3,
  },
  statusBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Cabin-Bold',
  },
  shiftContainer: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginLeft: 70,
    marginTop: -15,
    marginBottom: 10,
  },
  shiftText: {
    fontSize: 12,
    color: '#666666',
    fontFamily: 'Cabin-Bold',
  },
  timeContainer: {
    marginTop: -5,
    marginLeft: 65,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  timeValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginRight: 5,
    fontFamily: 'Cabin-Bold',
  },
  breakContainer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginLeft: 65,
  },
  breakNumberContainer: {
    backgroundColor: '#cefad0',
    padding: 8,
    borderRadius: 8,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  breakHeading: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Cabin-Bold',
  },
  dividerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDifferenceContainer: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDifferenceText: {
    fontSize: 8,
    color: '#666666',
    fontFamily: 'Cabin-Bold',
  },
  timeDivider: {
    width: 110,
    height: 2,
    backgroundColor: '#4CAF50',
    marginHorizontal: 10,
    marginBottom: 15,
  },

  modalOverlay1: {
    flex: 1,
    justifyContent: 'flex-end', // Align modal at the bottom
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dimmed background
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  alertContainer: {
    width: '100%',
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 20,

    color: '#333',
    fontFamily: 'Cabin-Medium',
  },
  alertMessage: {
    fontSize: 15,

    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Cabin-Regular',
  },
  alertButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  alertConfirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  alertConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cabin-Medium',
  },
  alertCloseButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  alertCloseText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cabin-Bold',
  },
  alertOkButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 8,
    fontFamily: 'Cabin-Bold',
    marginTop: 120,
  },
  alertOkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cabin-Bold',
  },
  animationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  WelcomeAnime: {
    width: 250,
    height: 250,
    margin: 'auto',
  },
});

export default EmployeeDetails;
