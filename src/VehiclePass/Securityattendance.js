// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   SafeAreaView,
//   ImageBackground,
//   Modal,
//   Image,
//   Platform,
//   KeyboardAvoidingView,
//   TextInput,
//   Animated,
//   Dimensions,
//   useWindowDimensions,
//   BackHandler,
//   RefreshControl,
//   Alert
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { getStoredData } from '../components/common/AsyncStorage';
// import ArrowIcon from '../images/arrowwhite.svg';
// import GlobalStyle from '../components/common/GlobalStyle';
// import Loading from '../components/common/Loading.js';

// // Keep the dialog components the same
// const { width, height } = Dimensions.get('window');

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


// const SecurityAttendance = () => {
//   const navigation = useNavigation();
//   const [employees, setEmployees] = useState([]);
//   const [attendanceData, setAttendanceData] = useState({});
//   const [activeFilter, setActiveFilter] = useState('All');
//   const [companyDetails, setCompanyDetails] = useState(null);
//   const [showConfirmDialog, setShowConfirmDialog] = useState(false);
//   const [showSuccessDialog, setShowSuccessDialog] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [isCheckingIn, setIsCheckingIn] = useState(true);
//   const [searchText, setSearchText] = useState('');
//   const [refreshing, setRefreshing] = useState(false);
//   const [totalCheckin, setTotalPresent] = useState(0);
//   const [totalCheckout, setTotalAbsent] = useState(0);
//   const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
//   // Active shift state
//   const [activeShift, setActiveShift] = useState('Day');
//   const [isLoading, setIsLoading] = useState(false);
//   // Add this to force refresh when attendance is updated
//   const [forceRefresh, setForceRefresh] = useState(0);
    
 
// const onRefresh = async () => {
//   console.log('Pull to refresh triggered');
//   setRefreshing(true);
//   try {
//     await fetchEmployeeData();
//     console.log('Data fetched');
    
//     // Reset scroll position after refresh
//     scrollY.setValue(0);
//     if (flatListRef.current) {
//       flatListRef.current.scrollToOffset({ offset: 0, animated: false });
//     }
//   } catch (error) {
//     console.error('Error on refresh:', error);
//   } finally {
//     setRefreshing(false);
//     console.log('Refresh finished');
//   }
// };
  
//   const scrollY = useRef(new Animated.Value(0)).current;
//   const flatListRef = useRef(null);

//   useEffect(() => {
//     const backAction = () => {
//       navigation.goBack(); // navigate back
//       return true; // prevent default behavior (exit app)
//     };
  
//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       backAction
//     );
  
//     return () => backHandler.remove(); // cleanup on unmount
//   }, []);

  

//   useEffect(() => {
//     fetchCompanyDetails();
//     fetchEmployeeData();
//   }, []);

//   // Refetch data when shift changes
//   useEffect(() => {
//     fetchEmployeeData();
//   }, [activeShift]);

//   // Force re-render when forceRefresh changes
//   useEffect(() => {
//     if (forceRefresh > 0) {
//       fetchEmployeeData();
//     }
//   }, [forceRefresh]);

  

//   const fetchCompanyDetails = async () => {
//     try {
//       const details = await getStoredData('CompanyDetails');
//       if (details && Array.isArray(details) && details.length > 0) {
//         setCompanyDetails(details[0]);
//       }
//     } catch (error) {
//       console.error('Error fetching company details:', error);
//     }
//   };

//   const getCurrentShift = () => {
//     return activeShift;
//   };

  

//   const FilterButton = React.memo(({ title, isActive, onPress }) => (
//     <TouchableOpacity
//       style={[styles.filterButton, isActive && styles.activeFilterButton]}
//       onPress={onPress}>
//       <Text style={[styles.filterButtonText, isActive && styles.activeFilterText]}>
//         {title}
//       </Text>
//     </TouchableOpacity>
//   ));

//   // Shift toggle component
//   const ShiftToggle = React.memo(({ activeShift, onShiftChange }) => (
//     <View style={styles.shiftToggleContainer}>
//       <View style={styles.shiftButtonsContainer}>
//         <TouchableOpacity
//           style={[
//             styles.shiftButton,
//             activeShift === 'Day' && styles.activeShiftButton,
//           ]}
//           onPress={() => {
//             onShiftChange('Day');
//             // Reset animation and scroll position
//             scrollY.setValue(0);
//             if (flatListRef.current) {
//               flatListRef.current.scrollToOffset({ offset: 0, animated: true });
//             }
//           }}>
//           <Text
//             style={[
//               styles.shiftButtonText,
//               activeShift === 'Day' && styles.activeShiftButtonText,
//             ]}>
//             Day
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.shiftButton,
//             activeShift === 'Night' && styles.activeShiftButton,
//           ]}
//           onPress={() => {
//             onShiftChange('Night');
//             // Reset animation and scroll position
//             scrollY.setValue(0);
//             if (flatListRef.current) {
//               flatListRef.current.scrollToOffset({ offset: 0, animated: true });
//             }
//           }}>
//           <Text
//             style={[
//               styles.shiftButtonText,
//               activeShift === 'Night' && styles.activeShiftButtonText,
//             ]}>
//             Night
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   ));

//  const fetchEmployeeData = async () => {
//   try {
//     setIsLoading(true);
    
//     // Get today's date in DD/MM/YYYY format
//     const today = new Date();
//     const todayStr = today.toLocaleDateString('en-GB'); // e.g. "08/04/2025"
    
//     // Don't filter by shift in the API call
//     const apiUrl = `https://demo.sazss.in/Api/EmployeeAttendance?date=${todayStr}`;
    
//     console.log('Fetching employee data from:', apiUrl);
    
//     const response = await fetch(
//       apiUrl,
//       {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: 'Basic ' + btoa('Inventory:SazsApps@123'),
//           Accept: 'application/json',
//         },
//       },
//     );

//     const data = await response.json();
    
//     // Extract data from response
//     const allAttendanceRecords = data[0] || [];
//     const employeeList = data[2] || [];
    
//     // Filter attendance records for today only (not by shift)
//     const todayAttendance = allAttendanceRecords.filter(
//       (record) => record.Date === todayStr
//     );
    
//     // Map attendance by EmployeeId and Shift
//     const attendanceMap = todayAttendance.reduce((acc, curr) => {
//       if (!acc[curr.EmployeeId]) {
//         acc[curr.EmployeeId] = {};
//       }
      
//       acc[curr.EmployeeId][curr.Shift] = {
//         inTime: curr.InTime || null,
//         outTime: curr.OutTime || null,
//       };
      
//       return acc;
//     }, {});
    
//     // Count employees checked in/out for the current shift
//     const currentShift = getCurrentShift();
//     let checkedIn = 0;
//     let checkedOut = 0;
    
//     employeeList.forEach(employee => {
//       const attendance = attendanceMap[employee.EmployeeId]?.[currentShift];
//       if (attendance) {
//         if (attendance.inTime && !attendance.outTime) {
//           checkedIn++;
//         } else if (attendance.inTime && attendance.outTime) {
//           checkedOut++;
//         }
//       }
//     });
    
//     setTotalPresent(checkedIn);
//     setTotalAbsent(checkedOut);
//     setAttendanceData(attendanceMap);
//     setEmployees(employeeList);
//     setLastRefreshTime(Date.now());
    
//   } catch (error) {
//     console.error('Error fetching employee data:', error);
//     Alert.alert('Error', 'Failed to fetch employee data. Please try again.');
//   } finally {
//     setIsLoading(false);
//   }
// };

// const getAttendanceStatus = useCallback((employeeId) => {
//   const currentShift = getCurrentShift();
//   const attendance = attendanceData[employeeId]?.[currentShift];
  
//   if (!attendance) {
//     return 'check-in';
//   }
  
//   if (attendance.inTime && attendance.outTime) {
//     return 'completed';
//   }
  
//   if (attendance.inTime) {
//     return 'check-out';
//   }
  
//   return 'check-in';
// }, [attendanceData, activeShift]);

//   const showConfirmationDialog = (employee, status) => {
//     console.log('Show confirmation dialog for:', employee.EmployeeName, 'Status:', status);
//     setSelectedEmployee(employee);
//     setIsCheckingIn(status === 'check-in');
//     setShowConfirmDialog(true);
//   };

//   const processAttendance = async (employee, isCheckingIn) => {
//     if (!companyDetails?.EmployeeKey) {
//       Alert.alert('Error', 'Company details not available. Please restart the app.');
//       return;
//     }
    
//     // Get today's date in DD/MM/YYYY format
//     const today = new Date();
//     const todayStr = today.toLocaleDateString('en-GB');
//     const currentTime = today.toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false,
//     });
  
//     const attendancePayload = {
//       Type: isCheckingIn ? 'CheckIn' : 'CheckOut',
//       EmId: employee.EmployeeId,
//       Shift: getCurrentShift(),
//       CreatedBy: '1',
//       Date: todayStr,
//     };
  
//     console.log('Processing attendance:', attendancePayload);
    
//     try {
//       const response = await fetch(
//         'https://demo.sazss.in/Api/EmployeeAttendance',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: 'Basic ' + btoa(`${companyDetails.EmployeeKey}:${' '}`),
//           },
//           body: JSON.stringify(attendancePayload),
//         },
//       );
  
//       if (response.ok) {
//         // Try to get response data
//         let responseData;
//         try {
//           responseData = await response.json();
//           console.log('API Response:', responseData);
//         } catch (error) {
//           console.log('No JSON response or empty response');
//         }
        
//         // Update local attendance data immediately for UI display
//         setAttendanceData(prev => {
//           // Get existing record or create new one
//           const existing = prev[employee.EmployeeId] || {};
          
//           // Create updated record
//           const updated = {
//             ...existing,
//             shift: getCurrentShift(),
//           };
          
//           // Set appropriate time field
//           if (isCheckingIn) {
//             updated.inTime = currentTime;
//           } else {
//             updated.outTime = currentTime;
//           }
          
//           console.log('Updated attendance record:', updated);
          
//           // Return new state
//           return {
//             ...prev,
//             [employee.EmployeeId]: updated
//           };
//         });
        
//         // Update counters
//         if (isCheckingIn) {
//           setTotalPresent(prev => prev + 1);
//         } else {
//           setTotalAbsent(prev => prev + 1);
//           setTotalPresent(prev => Math.max(0, prev - 1));
//         }
  
//         // Show success message
//         setShowSuccessDialog(true);
        
//         // Schedule data refresh and dialog close
//         setTimeout(() => {
//           setShowSuccessDialog(false);
//              // Reset scroll position
//         scrollY.setValue(0);
//         if (flatListRef.current) {
//           flatListRef.current.scrollToOffset({ offset: 0, animated: true });
//         }
//           // Force a re-render by incrementing the forceRefresh counter
//           setForceRefresh(prev => prev + 1);
//         }, 2000);
//       } else {
//         // Handle API error
//         const errorText = await response.text();
//         console.error('API Error:', errorText);
//         Alert.alert('Error', 'Failed to update attendance. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error updating attendance:', error);
//       Alert.alert('Error', 'Network error. Please check your connection and try again.');
//     }
//   };
   
//   const getFilteredEmployees = useCallback(() => {
//     let filtered = employees;
  
//     // First, filter out employees who have completed attendance in another shift
//     const currentShift = getCurrentShift();
//     filtered = filtered.filter((employee) => {
//       // Skip employees who have completed the other shift
//       const otherShift = currentShift === 'Day' ? 'Night' : 'Day';
//       const otherShiftAttendance = attendanceData[employee.EmployeeId]?.[otherShift];
      
//       // If the employee has completed the other shift (has both inTime and outTime), don't show them
//       if (otherShiftAttendance && otherShiftAttendance.inTime && otherShiftAttendance.outTime) {
//         return false;
//       }
      
//       return true;
//     });
  
//     // Then filter by active status tab
//     if (activeFilter !== 'All') {
//       filtered = filtered.filter((employee) => {
//         const status = getAttendanceStatus(employee.EmployeeId);
//         if (activeFilter === 'Check-in') return status === 'check-in';
//         if (activeFilter === 'Check-out') return status === 'check-out';
//         if (activeFilter === 'Completed') return status === 'completed';
//         return true;
//       });
//     }
  
//     // Filter by search text (name)
//     if (searchText.trim()) {
//       filtered = filtered.filter((employee) =>
//         employee.EmployeeName.toLowerCase().includes(searchText.toLowerCase()),
//       );
//     }
  
//     return filtered.length > 0 ? filtered : [];
//   }, [employees, activeFilter, searchText, attendanceData, getAttendanceStatus, getCurrentShift]);

//   const renderEmployeeItem = useCallback(({ item: employee }) => {
//     const status = getAttendanceStatus(employee.EmployeeId);

//     return (
//       <View style={styles.employeeItem} key={`${employee.EmployeeId}-${status}-${forceRefresh}`}>
//         <View style={styles.employeeInfo}>
//           <Text style={styles.employeeName}>{employee.EmployeeName}</Text>
//           <Text style={styles.employeeId}>{employee.EmployeeId}</Text>
//         </View>
//         {status === 'completed' ? (
//           <View style={styles.completedContainer}>
//             <Text style={styles.completedText}>Completed</Text>
//           </View>
//         ) : (
//           <TouchableOpacity
//             style={[
//               styles.actionButton,
//               status === 'check-in' ? styles.checkInButton : styles.checkOutButton,
//             ]}
//             onPress={() => showConfirmationDialog(employee, status)}>
//             <Text style={styles.actionButtonText}>
//               {status === 'check-in' ? 'Check - in' : 'Check - out'}
//             </Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   }, [getAttendanceStatus, forceRefresh]);
   
 
  
//   const FilterHeader = React.memo(() => (
//     <View style={styles.filterContainer}>
//       {['All', 'Check-in', 'Check-out', 'Completed'].map((filter) => (
//         <FilterButton
//           key={filter}
//           title={filter}
//           isActive={activeFilter === filter}
//           onPress={() => {
//             setActiveFilter(filter);
//             // Reset scroll position when filter changes
//             scrollY.setValue(0);
//             if (flatListRef.current) {
//               flatListRef.current.scrollToOffset({ offset: 0, animated: true });
//             }
//           }}
//         />
//       ))}
//     </View>
//   ));


//   const AttendanceConfirmationDialog = React.memo(({
//     isVisible,
//     onClose,
//     onConfirm,
//     isCheckIn = true,
//     selectedEmployee,
//   }) => {
   
//     // Add animation for bottom modal
//     const [slideAnim] = useState(new Animated.Value(0));
    
//     useEffect(() => {
//       if (isVisible) {
//         Animated.spring(slideAnim, {
//           toValue: 1,
//           tension: 50,
//           friction: 7,
//           useNativeDriver: true,
//         }).start();
//       } else {
//         Animated.timing(slideAnim, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }).start();
//       }
//     }, [isVisible, slideAnim]);
    
//     const translateY = slideAnim.interpolate({
//       inputRange: [0, 1],
//       outputRange: [300, 0],
//     });
  
//     return (
//       <Modal transparent visible={isVisible} animationType="none">
//         <View style={styles.modalOverlay}>
//           <Animated.View 
//             style={[
//               styles.dialogContainer, 
//               { 
//                 transform: [{ translateY }],
//                 position: 'absolute',
//                 bottom: 0,
//                 width: '100%',
//                 borderTopLeftRadius: 20,
//                 borderTopRightRadius: 20,
//                 borderBottomLeftRadius: 0,
//                 borderBottomRightRadius: 0,
//               }
//             ]}
//           >
//             <Text style={styles.dialogTitle}>
//               {isCheckIn ? 'Are you sure to check in?' : "The employee shift doesn't end"}
//             </Text>
//             <Text style={styles.etext}>{selectedEmployee?.EmployeeName ?? 'Employee'}</Text>
//             <View style={styles.illustrationContainer}>
//               <Image
//                 source={require('../images/Thinkingimage.png')}
//                 style={styles.questionIllustration}
//               />
//             </View>
//             {!isCheckIn && <Text style={styles.subText}>Please confirm to checkout</Text>}
//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={[styles.button, styles.noButton]}
//                 onPress={onClose}>
//                 <Text style={styles.noButtonText}>No</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.button, styles.yesButton]}
//                 onPress={onConfirm}>
//                 <Text style={styles.yesButtonText}>Yes</Text>
//               </TouchableOpacity>
//             </View>
//           </Animated.View>
//         </View>
//       </Modal>
//     );
//   });
  
//   const AttendanceSuccessDialog = React.memo(({
//     isVisible,
//     employeeName,
//     employeeId,
//     isCheckIn = true,
//     onClose,
//   }) => {
//     // Add animation for bottom modal
//     const [slideAnim] = useState(new Animated.Value(0));
    
//     useEffect(() => {
//       if (isVisible) {
//         Animated.spring(slideAnim, {
//           toValue: 1,
//           tension: 50,
//           friction: 7,
//           useNativeDriver: true,
//         }).start();
//       } else {
//         Animated.timing(slideAnim, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }).start();
//       }
//     }, [isVisible, slideAnim]);
    
//     const translateY = slideAnim.interpolate({
//       inputRange: [0, 1],
//       outputRange: [300, 0],
//     });
  
//     return (
//       <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
//         <View style={styles.modalOverlay}>
//           <Animated.View 
//             style={[
//               styles.dialogContainer, 
//               { 
//                 transform: [{ translateY }],
//                 position: 'absolute',
//                 bottom: 0,
//                 width: '100%',
//                 borderTopLeftRadius: 20,
//                 borderTopRightRadius: 20,
//                 borderBottomLeftRadius: 0,
//                 borderBottomRightRadius: 0,
//               }
//             ]}
//           >
//             <View style={styles.employeeInfo}>
//               <Text style={styles.employeeBadge}>{employeeName}</Text>
              
//             </View>
//             <Text style={styles.successTitle}>
//               {isCheckIn ? 'Checked in successfully' : 'Checked out successfully'}
//             </Text>
//             <View style={styles.successIconContainer}>
//               <View style={styles.successIcon}>
//                 <Text style={styles.checkmark}>✓</Text>
//               </View>
//             </View>
//           </Animated.View>
//         </View>
//       </Modal>
//     );
//   });
  

//   // Handle scroll events
//   const handleScroll = Animated.event(
//     [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//     { useNativeDriver: false }
//   );
 
//   const headerHeight = scrollY.interpolate({
//     inputRange: [0, 108],
//     outputRange: [240, 100],
//     extrapolate: 'clamp',
//   });
  
//   const contentOpacity = scrollY.interpolate({
//     inputRange: [0, 50],
//     outputRange: [2, 0],
//     extrapolate: 'clamp',
//   });
  
//   const headerImageOpacity = scrollY.interpolate({
//     inputRange: [0, 70],
//     outputRange: [1, 0],
//     extrapolate: 'clamp',
//   });

//   const headerImageScale = scrollY.interpolate({
//     inputRange: [0, 70],
//     outputRange: [1, 0.5],
//     extrapolate: 'clamp',
//   });
//   const searchContainerTop = scrollY.interpolate({
//     inputRange: [0, 108],
//     outputRange: [240, 100],
//     extrapolate: 'clamp',
//   });
//   return (
//     <SafeAreaView style={styles.container}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={{ flex: 1 }}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
//         <View style={styles.mainContainer}>
//           {/* Animated Header */}
//           <Animated.View style={[styles.header, { height: headerHeight }]}>
//             <Animated.View style={[
//               styles.headerBackground, 
//               { 
//                 opacity: headerImageOpacity,
//                 transform: [{ scale: headerImageScale }]
//               }
//             ]}>
//               <ImageBackground
//                 source={require('../images/LogoWaterMark.png')}
//                 style={styles.headerImage}
//                 resizeMode="contain"
//                 imageStyle={{
//                   width: 232,
//                   height: 210,
//                   top: 30,
//                   alignSelf: 'flex-end',
//                   marginLeft: width - 415,
//                 }}
//               />
//               <Animated.View style={{opacity: contentOpacity}}>
//                 <View style={[styles.statsContainer]}>
//                   <StatCard label="Check-In" value={totalCheckin} />
//                   <StatCard label="Check-Out" value={totalCheckout} />
//                 </View>
//               </Animated.View>
//             </Animated.View>

//             <View style={styles.headerContent}>
//               <TouchableOpacity
//                 onPress={() => navigation.goBack()}
//                 style={styles.backButtonContainer}
//               >
//                 <ArrowIcon />
//               </TouchableOpacity>

//               <Text style={styles.headerTitle}>
//                 Attendance
//               </Text>
//             </View>
//           </Animated.View>
          
                
//           {/* Animated Search Input */}
//           <Animated.View style={[styles.searchContainer, { top: searchContainerTop }]}>
            
//             <Text style={styles.sectionTitle}>Employee Details</Text>
            
//             {/* Shift Toggle */}
//             <ShiftToggle 
//               activeShift={activeShift} 
//               onShiftChange={(shift) => {
//                 setActiveShift(shift);
//                 // Data will be refreshed via useEffect
//               }} 
//             />
            
//             <TextInput
//               style={styles.searchInput}
//               placeholder="Choose employee name"
//               placeholderTextColor="#999"
//               value={searchText}
//               onChangeText={(text) => {
//                 setSearchText(text);
//                 // Reset scroll position when search text changes
//                 scrollY.setValue(0);
//                 if (flatListRef.current) {
//                   flatListRef.current.scrollToOffset({ offset: 0, animated: true });
//                 }
//               }}
//             />

//             <FilterHeader />
//           </Animated.View>
          
        
          
//           {/* FlatList with scroll animation */}
//           <Animated.FlatList
//             ref={flatListRef}
//             key={`${activeShift}-${lastRefreshTime}-${forceRefresh}`} // Added forceRefresh to force re-render
//             data={getFilteredEmployees()}
//             renderItem={renderEmployeeItem}
//             keyExtractor={(item) => `${item.EmployeeId}-${forceRefresh}`} // Added forceRefresh to keyExtractor
//             contentContainerStyle={[
//               styles.listContent,
//               { minHeight: height } // ensures scrollable area
//             ]}
//             keyboardShouldPersistTaps="handled"
//             initialNumToRender={20}
//             maxToRenderPerBatch={20}
//             windowSize={21}
//             removeClippedSubviews={true}
//             onScroll={handleScroll}
//             scrollEventThrottle={16}
//             showsVerticalScrollIndicator={true}
//             refreshControl={
//               <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//             }
//             ListEmptyComponent={() => (
//               <View style={styles.emptyListContainer}>
//                 <Text style={styles.emptyListText}>
//                   {isLoading ? 'Loading...' : 'No employees found for this shift'}
//                 </Text>
//               </View>
              
//             )}
//           />
          
//         </View>
//           {/* Loading indicator */}
//           {isLoading && <Loading />}
//       </KeyboardAvoidingView>
      
//       {/* Dialogs */}
//       <AttendanceConfirmationDialog
//         isVisible={showConfirmDialog}
//         onClose={() => setShowConfirmDialog(false)}
//         onConfirm={() => {
//           setShowConfirmDialog(false);
//           processAttendance(selectedEmployee, isCheckingIn);
//         }}
//         isCheckIn={isCheckingIn}
//         selectedEmployee={selectedEmployee}
//       />

//       <AttendanceSuccessDialog
//         isVisible={showSuccessDialog}
//         employeeName={selectedEmployee?.EmployeeName || ''}
//         employeeId={selectedEmployee?.EmployeeId || ''}
//         isCheckIn={isCheckingIn}
//         onClose={() => setShowSuccessDialog(false)}
//       />
//     </SafeAreaView>
//   );
// };





import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Modal,
  Image,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  Animated,
  Dimensions,
  useWindowDimensions,
  BackHandler,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getStoredData } from '../components/common/AsyncStorage';
import ArrowIcon from '../images/arrowwhite.svg';
import GlobalStyle from '../components/common/GlobalStyle';
import Loading from '../components/common/Loading.js';
import base64 from 'react-native-base64'; // Add this import for base64 encoding

// Keep the dialog components the same
const { width, height } = Dimensions.get('window');

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

const SecurityAttendance = () => {
  const navigation = useNavigation();
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [activeFilter, setActiveFilter] = useState('All');
  const [companyDetails, setCompanyDetails] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [totalCheckin, setTotalPresent] = useState(0);
  const [totalCheckout, setTotalAbsent] = useState(0);
  const [lastRefreshTime, setLastRefreshTime] = useState(Date.now());
  // Active shift state
  const [activeShift, setActiveShift] = useState('Day');
  const [isLoading, setIsLoading] = useState(false);
  // Add this to force refresh when attendance is updated
  const [forceRefresh, setForceRefresh] = useState(0);
    
  // const onRefresh = async () => {
  //   console.log('Pull to refresh triggered');
  //   setRefreshing(true);
  //   try {
  //     await fetchEmployeeData();
  //     console.log('Data fetched');
      
  //     // Reset scroll position after refresh
  //     scrollY.setValue(0);
  //     if (flatListRef.current) {
  //       flatListRef.current.scrollToOffset({ offset: 0, animated: false });
  //     }
  //   } catch (error) {
  //     console.error('Error on refresh:', error);
  //   } finally {
  //     setRefreshing(false);
  //     console.log('Refresh finished');
  //   }
  // };
    
  const onRefresh = async () => {
    console.log('Pull to refresh triggered');
    setRefreshing(true);
    try {
      await fetchEmployeeData();
      console.log('Data fetched');
      
      // Reset scroll position after refresh
      scrollY.setValue(0);
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: false });
      }
    } catch (error) {
      console.error('Error on refresh:', error);
    } finally {
      setRefreshing(false);
      console.log('Refresh finished');
    }
  };
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      navigation.goBack(); // navigate back
      return true; // prevent default behavior (exit app)
    };
  
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
  
    return () => backHandler.remove(); // cleanup on unmount
  }, []);

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  // Fetch employee data when company details are available
  useEffect(() => {
    if (companyDetails) {
      fetchEmployeeData();
    }
  }, [companyDetails]);

  // Refetch data when shift changes (only if company details are available)
  useEffect(() => {
    if (companyDetails) {
      fetchEmployeeData();
    }
  }, [activeShift]);

  // Force re-render when forceRefresh changes
  useEffect(() => {
    if (forceRefresh > 0 && companyDetails) {
      fetchEmployeeData();
    }
  }, [forceRefresh]);

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

  const getCurrentShift = () => {
    return activeShift;
  };

  const FilterButton = React.memo(({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.activeFilterButton]}
      onPress={onPress}>
      <Text style={[styles.filterButtonText, isActive && styles.activeFilterText]}>
        {title}
      </Text>
    </TouchableOpacity>
  ));

  // Shift toggle component
  const ShiftToggle = React.memo(({ activeShift, onShiftChange }) => (
    <View style={styles.shiftToggleContainer}>
      <View style={styles.shiftButtonsContainer}>
        <TouchableOpacity
          style={[
            styles.shiftButton,
            activeShift === 'Day' && styles.activeShiftButton,
          ]}
          onPress={() => {
            onShiftChange('Day');
            // Reset animation and scroll position
            scrollY.setValue(0);
            if (flatListRef.current) {
              flatListRef.current.scrollToOffset({ offset: 0, animated: true });
            }
          }}>
          <Text
            style={[
              styles.shiftButtonText,
              activeShift === 'Day' && styles.activeShiftButtonText,
            ]}>
            Day
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.shiftButton,
            activeShift === 'Night' && styles.activeShiftButton,
          ]}
          onPress={() => {
            onShiftChange('Night');
            // Reset animation and scroll position
            scrollY.setValue(0);
            if (flatListRef.current) {
              flatListRef.current.scrollToOffset({ offset: 0, animated: true });
            }
          }}>
          <Text
            style={[
              styles.shiftButtonText,
              activeShift === 'Night' && styles.activeShiftButtonText,
            ]}>
            Night
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  ));

  const fetchEmployeeData = async () => {
    if (!companyDetails) {
      console.log('Company details not available, skipping fetch');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get today's date in DD/MM/YYYY format
      const today = new Date();
      const todayStr = today.toLocaleDateString('en-GB'); // e.g. "08/04/2025"
      
      // Construct dynamic API URL using company details
      const { Webkey, GstNo, PassKey } = companyDetails;
      const apiUrl = `https://${Webkey}.sazss.in/Api/EmployeeAttendance?date=${todayStr}`;
      
      console.log('Fetching employee data from:', apiUrl);
      console.log('Using company details:', { Webkey, GstNo, PassKey });
      
      // Create authorization header similar to Register component
      const authHeaders = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        [PassKey]: GstNo, // Using PassKey as header key and GstNo as value
      };

      console.log('Request headers:', authHeaders);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Extract data from response
      const allAttendanceRecords = data[0] || [];
      const employeeList = data[2] || [];
      
      // Filter attendance records for today only (not by shift)
      const todayAttendance = allAttendanceRecords.filter(
        (record) => record.Date === todayStr
      );
      
      // Map attendance by EmployeeId and Shift
      const attendanceMap = todayAttendance.reduce((acc, curr) => {
        if (!acc[curr.EmployeeId]) {
          acc[curr.EmployeeId] = {};
        }
        
        acc[curr.EmployeeId][curr.Shift] = {
          inTime: curr.InTime || null,
          outTime: curr.OutTime || null,
        };
        
        return acc;
      }, {});
      
      // Count employees checked in/out for the current shift
      const currentShift = getCurrentShift();
      let checkedIn = 0;
      let checkedOut = 0;
      
      employeeList.forEach(employee => {
        const attendance = attendanceMap[employee.EmployeeId]?.[currentShift];
        if (attendance) {
          if (attendance.inTime && !attendance.outTime) {
            checkedIn++;
          } else if (attendance.inTime && attendance.outTime) {
            checkedOut++;
          }
        }
      });
      
      setTotalPresent(checkedIn);
      setTotalAbsent(checkedOut);
      setAttendanceData(attendanceMap);
      setEmployees(employeeList);
      setLastRefreshTime(Date.now());
      
    } catch (error) {
      console.error('Error fetching employee data:', error);
      Alert.alert(
        'Error', 
        `Failed to fetch employee data: ${error.message}\nPlease check your company details and try again.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceStatus = useCallback((employeeId) => {
    const currentShift = getCurrentShift();
    const attendance = attendanceData[employeeId]?.[currentShift];
    
    if (!attendance) {
      return 'check-in';
    }
    
    if (attendance.inTime && attendance.outTime) {
      return 'completed';
    }
    
    if (attendance.inTime) {
      return 'check-out';
    }
    
    return 'check-in';
  }, [attendanceData, activeShift]);

  const showConfirmationDialog = (employee, status) => {
    console.log('Show confirmation dialog for:', employee.EmployeeName, 'Status:', status);
    setSelectedEmployee(employee);
    setIsCheckingIn(status === 'check-in');
    setShowConfirmDialog(true);
  };

  const processAttendance = async (employee, isCheckingIn) => {
    if (!companyDetails) {
      Alert.alert('Error', 'Company details not available. Please restart the app.');
      return;
    }
    
    // Get today's date in DD/MM/YYYY format
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-GB');
    const currentTime = today.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  
    const attendancePayload = {
      Type: isCheckingIn ? 'CheckIn' : 'CheckOut',
      EmId: employee.EmployeeId,
      Shift: getCurrentShift(),
      CreatedBy: '1',
      Date: todayStr,
    };
  
    console.log('Processing attendance:', attendancePayload);
    
    try {
      // Construct dynamic API URL using company details
      const apiUrl = `https://${companyDetails.Webkey}.sazss.in/Api/EmployeeAttendance`;
      
      // Create authorization header using username and password
      const username = companyDetails.Username;
      const password = companyDetails.Password;
      const credentials = btoa(`${username}:${password}`);
      
      console.log('POST API URL:', apiUrl);
      console.log('Authorization header created for:', username);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`,
        },
        body: JSON.stringify(attendancePayload),
      });
  
      if (response.ok) {
        // Try to get response data
        let responseData;
        try {
          responseData = await response.json();
          console.log('API Response:', responseData);
        } catch (error) {
          console.log('No JSON response or empty response');
        }
        
        // Update local attendance data immediately for UI display
        setAttendanceData(prev => {
          // Get existing record or create new one
          const existing = prev[employee.EmployeeId] || {};
          
          // Create updated record
          const updated = {
            ...existing,
            [getCurrentShift()]: {
              ...existing[getCurrentShift()],
              [isCheckingIn ? 'inTime' : 'outTime']: currentTime,
            }
          };
          
          console.log('Updated attendance record:', updated);
          
          // Return new state
          return {
            ...prev,
            [employee.EmployeeId]: updated
          };
        });
        
        // Update counters
        if (isCheckingIn) {
          setTotalPresent(prev => prev + 1);
        } else {
          setTotalAbsent(prev => prev + 1);
          setTotalPresent(prev => Math.max(0, prev - 1));
        }
  
        // Show success message
        setShowSuccessDialog(true);
        
        // Schedule data refresh and dialog close
        setTimeout(() => {
          setShowSuccessDialog(false);
          // Reset scroll position
          scrollY.setValue(0);
          if (flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 0, animated: true });
          }
          // Force a re-render by incrementing the forceRefresh counter
          setForceRefresh(prev => prev + 1);
        }, 2000);
      } else {
        // Handle API error
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        Alert.alert(
          'Error', 
          `Failed to update attendance (${response.status}): ${errorText || 'Please try again.'}`
        );
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      Alert.alert('Error', `Network error: ${error.message}\nPlease check your connection and try again.`);
    }
  };
   
  const getFilteredEmployees = useCallback(() => {
    let filtered = employees;
  
    // First, filter out employees who have completed attendance in another shift
    const currentShift = getCurrentShift();
    filtered = filtered.filter((employee) => {
      // Skip employees who have completed the other shift
      const otherShift = currentShift === 'Day' ? 'Night' : 'Day';
      const otherShiftAttendance = attendanceData[employee.EmployeeId]?.[otherShift];
      
      // If the employee has completed the other shift (has both inTime and outTime), don't show them
      if (otherShiftAttendance && otherShiftAttendance.inTime && otherShiftAttendance.outTime) {
        return false;
      }
      
      return true;
    });
  
    // Then filter by active status tab
    if (activeFilter !== 'All') {
      filtered = filtered.filter((employee) => {
        const status = getAttendanceStatus(employee.EmployeeId);
        if (activeFilter === 'Check-in') return status === 'check-in';
        if (activeFilter === 'Check-out') return status === 'check-out';
        if (activeFilter === 'Completed') return status === 'completed';
        return true;
      });
    }
  
    // Filter by search text (name)
    if (searchText.trim()) {
      filtered = filtered.filter((employee) =>
        employee.EmployeeName.toLowerCase().includes(searchText.toLowerCase()),
      );
    }
  
    return filtered.length > 0 ? filtered : [];
  }, [employees, activeFilter, searchText, attendanceData, getAttendanceStatus, getCurrentShift]);

  const renderEmployeeItem = useCallback(({ item: employee }) => {
    const status = getAttendanceStatus(employee.EmployeeId);

    return (
      <View style={styles.employeeItem} key={`${employee.EmployeeId}-${status}-${forceRefresh}`}>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>{employee.EmployeeName}</Text>
          <Text style={styles.employeeId}>{employee.EmployeeId}</Text>
        </View>
        {status === 'completed' ? (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>Completed</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.actionButton,
              status === 'check-in' ? styles.checkInButton : styles.checkOutButton,
            ]}
            onPress={() => showConfirmationDialog(employee, status)}>
            <Text style={styles.actionButtonText}>
              {status === 'check-in' ? 'Check - in' : 'Check - out'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [getAttendanceStatus, forceRefresh]);
   
  const FilterHeader = React.memo(() => (
    <View style={styles.filterContainer}>
      {['All', 'Check-in', 'Check-out', 'Completed'].map((filter) => (
        <FilterButton
          key={filter}
          title={filter}
          isActive={activeFilter === filter}
          onPress={() => {
            setActiveFilter(filter);
            // Reset scroll position when filter changes
            scrollY.setValue(0);
            if (flatListRef.current) {
              flatListRef.current.scrollToOffset({ offset: 0, animated: true });
            }
          }}
        />
      ))}
    </View>
  ));

  const AttendanceConfirmationDialog = React.memo(({
    isVisible,
    onClose,
    onConfirm,
    isCheckIn = true,
    selectedEmployee,
  }) => {
   
    // Add animation for bottom modal
    const [slideAnim] = useState(new Animated.Value(0));
    
    useEffect(() => {
      if (isVisible) {
        Animated.spring(slideAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }, [isVisible, slideAnim]);
    
    const translateY = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    });
  
    return (
      <Modal transparent visible={isVisible} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.dialogContainer, 
              { 
                transform: [{ translateY }],
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            ]}
          >
            <Text style={styles.dialogTitle}>
              {isCheckIn ? 'Are you sure to check in?' : "The employee shift doesn't end"}
            </Text>
            <Text style={styles.etext}>{selectedEmployee?.EmployeeName ?? 'Employee'}</Text>
            <View style={styles.illustrationContainer}>
              <Image
                source={require('../images/Thinkingimage.png')}
                style={styles.questionIllustration}
              />
            </View>
            {!isCheckIn && <Text style={styles.subText}>Please confirm to checkout</Text>}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={onClose}>
                <Text style={styles.noButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={onConfirm}>
                <Text style={styles.yesButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  });
  
  const AttendanceSuccessDialog = React.memo(({
    isVisible,
    employeeName,
    employeeId,
    isCheckIn = true,
    onClose,
  }) => {
    // Add animation for bottom modal
    const [slideAnim] = useState(new Animated.Value(0));
    
    useEffect(() => {
      if (isVisible) {
        Animated.spring(slideAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }, [isVisible, slideAnim]);
    
    const translateY = slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [300, 0],
    });
  
    return (
      <Modal transparent visible={isVisible} animationType="none" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.dialogContainer, 
              { 
                transform: [{ translateY }],
                position: 'absolute',
                bottom: 0,
                width: '100%',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            ]}
          >
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeBadge}>{employeeName}</Text>
              
            </View>
            <Text style={styles.successTitle}>
              {isCheckIn ? 'Checked in successfully' : 'Checked out successfully'}
            </Text>
            <View style={styles.successIconContainer}>
              <View style={styles.successIcon}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  });
  
  // Handle scroll events
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );
 
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 108],
    outputRange: [240, 100],
    extrapolate: 'clamp',
  });
  
  const contentOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [2, 0],
    extrapolate: 'clamp',
  });
  
  const headerImageOpacity = scrollY.interpolate({
    inputRange: [0, 70],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerImageScale = scrollY.interpolate({
    inputRange: [0, 70],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });
  
  const searchContainerTop = scrollY.interpolate({
    inputRange: [0, 108],
    outputRange: [240, 100],
    extrapolate: 'clamp',
  });

  // Show loading if company details are not loaded yet
  if (!companyDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <View style={styles.mainContainer}>
          {/* Animated Header */}
          <Animated.View style={[styles.header, { height: headerHeight }]}>
            <Animated.View style={[
              styles.headerBackground, 
              { 
                opacity: headerImageOpacity,
                transform: [{ scale: headerImageScale }]
              }
            ]}>
              <ImageBackground
                source={require('../images/LogoWaterMark.png')}
                style={styles.headerImage}
                resizeMode="contain"
                imageStyle={{
                  width: 232,
                  height: 210,
                  top: 30,
                  alignSelf: 'flex-end',
                  marginLeft: width - 415,
                }}
              />
              <Animated.View style={{opacity: contentOpacity}}>
                <View style={[styles.statsContainer]}>
                  <StatCard label="Check-In" value={totalCheckin} />
                  <StatCard label="Check-Out" value={totalCheckout} />
                </View>
              </Animated.View>
            </Animated.View>

            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButtonContainer}
              >
                <ArrowIcon />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>
                Attendance
              </Text>
            </View>
          </Animated.View>
          
          {/* Animated Search Input */}
          <Animated.View style={[styles.searchContainer, { top: searchContainerTop }]}>
            
            <Text style={styles.sectionTitle}>Employee Details</Text>
            
            {/* Shift Toggle */}
            <ShiftToggle 
              activeShift={activeShift} 
              onShiftChange={(shift) => {
                setActiveShift(shift);
                // Data will be refreshed via useEffect
              }} 
            />
            
            <TextInput
              style={styles.searchInput}
              placeholder="Choose employee name"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                // Reset scroll position when search text changes
                scrollY.setValue(0);
                if (flatListRef.current) {
                  flatListRef.current.scrollToOffset({ offset: 0, animated: true });
                }
              }}
            />

            <FilterHeader />
          </Animated.View>
          
          {/* FlatList with scroll animation */}
          <Animated.FlatList
            ref={flatListRef}
            key={`${activeShift}-${lastRefreshTime}-${forceRefresh}`} // Added forceRefresh to force re-render
            data={getFilteredEmployees()}
            renderItem={renderEmployeeItem}
            keyExtractor={(item) => `${item.EmployeeId}-${forceRefresh}`} // Added forceRefresh to keyExtractor
            contentContainerStyle={[
              styles.listContent,
              { minHeight: height } // ensures scrollable area
            ]}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={21}
            removeClippedSubviews={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyListContainer}>
                <Text style={styles.emptyListText}>
                  {isLoading ? 'Loading...' : 'No employees found for this shift'}
                </Text>
              </View>
            )}
          />
        </View>
        
        {/* Loading indicator */}
        {isLoading && <Loading />}
      </KeyboardAvoidingView>
      
      {/* Dialogs */}
      <AttendanceConfirmationDialog
        isVisible={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => {
          setShowConfirmDialog(false);
          processAttendance(selectedEmployee, isCheckingIn);
        }}
        isCheckIn={isCheckingIn}
        selectedEmployee={selectedEmployee}
      />

      <AttendanceSuccessDialog
        isVisible={showSuccessDialog}
        employeeName={selectedEmployee?.EmployeeName || ''}
        employeeId={selectedEmployee?.EmployeeId || ''}
        isCheckIn={isCheckingIn}
        onClose={() => setShowSuccessDialog(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  shiftToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  
  shiftToggleLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2c3e50',
  },
  
  shiftButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: '100%', // Makes the container occupy full width
  },
  
  shiftButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginRight: 4,
    flex: 1, // Ensures each button is evenly distributed across the container
  },
  
  activeShiftButton: {
    backgroundColor: '#3E89EC',
    flex: 1, // Makes the active button expand to fill the container
    borderRadius: 20,
  },
  
  shiftButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6c757d',
    textAlign: 'center', // Centers the text
    fontFamily: 'Cabin-Bold',
  },
  
  activeShiftButtonText: {
    color: '#fff',
    fontFamily: 'Cabin-Bold',
  },
  
  
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#3E89EC',
    zIndex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 180,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    marginTop: 15, 
  },
  headerImage: {
    width: 232,
    height: 210,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width * -0.2,
    marginLeft: width * -0.4,
    marginRight: width * 0.05,
  },
  backButtonContainer: {
    color: 'white',
    top: 36,
    left: 12,
   
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Cabin-Bold',
    color: '#FFFFFF',
    marginLeft: 25,
    marginTop: 25,
  },
  // UPDATED: Fixed list content styling
  listContent: {
    paddingTop: 480, // Increased to account for header + search container
    paddingHorizontal: 15,
    paddingBottom: 20,
    
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    marginTop: 5,
    color: 'black',
    fontFamily: 'Cabin-Bold',
  },
  etext:{
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Cabin-Bold',
   
  },
  searchContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 15,
    zIndex: 100,
    backgroundColor: '#F5F5F5',
    paddingVertical: 5,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 12,
    fontSize: 16,
    color: 'black',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontFamily: 'Cabin-Regular',
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 5,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeFilterButton: {
    backgroundColor: '#3E89EC',
    borderColor: '#3E89EC',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Cabin-Regular',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '500',
  },
  employeeItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Cabin-Bold',
  },
  employeeId: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Cabin-Regular',
  },
  backButton: {
    fontSize: 40,
    color: 'white',
    marginTop: -20,
    marginLeft: 0,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: '#3E89EC',
  },
  checkOutButton: {
    backgroundColor: '#C16161',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Cabin-Bold',
  },
  completedContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Cabin-Bold',
  },
  // Empty list
  emptyListContainer: {
    height: Dimensions.get('window').height - 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    fontFamily: 'Cabin-Regular',
    color: '#666',
    fontSize: 16,
  },
  // Modal and Dialog Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    height: '40%',
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Cabin-Bold',
  },
  illustrationContainer: {
    marginVertical: 10,
  },
  questionIllustration: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Cabin-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
    paddingHorizontal: 30,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  noButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  yesButton: {
    backgroundColor: '#3E89EC',
  },
  noButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cabin-Bold',
  },
  yesButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cabin-Bold',
  },
  // Success Dialog Styles
  employeeBadge: {
    fontSize: 30,
    color: '#333',
    fontFamily: 'Cabin-Bold',
    marginTop: 80,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center', 
    fontFamily: 'Cabin-Bold',
  },
  successIconContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statCard: {
    backgroundColor: '#ffffff',
    flex: 1,
    marginHorizontal: width * 0.02,
    borderRadius: 8,
    padding: width * 0.03,
    alignItems: 'center',
  },
});

export default SecurityAttendance;