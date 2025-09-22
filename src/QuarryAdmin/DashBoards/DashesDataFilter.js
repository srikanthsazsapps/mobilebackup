// import React, { useContext, useState, useEffect } from 'react';
// import {
//   View,
//   Dimensions,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native';
// import { Button } from 'react-native-paper';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
// import { DashesDataContext } from '../../components/common/DashesDataContext';

// const { width } = Dimensions.get('window');

// const DashesDateFilter = ({ CloseModel, onDateSelected, initialFromDate, initialToDate }) => {
//   const {
//     startDate,
//     setStartDate,
//     endDate,
//     setEndDate,
//     startTime,
//     setStartTime,
//     endTime,
//     setEndTime,
//   } = useContext(DashesDataContext);

//   const [showPicker, setShowPicker] = useState(false);
//   const [pickerMode, setPickerMode] = useState('date');
//   const [pickerFor, setPickerFor] = useState('');
//   const [tempStartDate, setTempStartDate] = useState(initialFromDate || startDate || new Date());
//   const [tempEndDate, setTempEndDate] = useState(initialToDate || endDate || new Date());
//   const [tempStartTime, setTempStartTime] = useState(() => {
//     const initialTime = new Date();
//     initialTime.setHours(8, 0, 0, 0); // Default to 8:00 AM
//     return initialTime;
//   });
//   const [tempEndTime, setTempEndTime] = useState(() => {
//     const initialTime = new Date();
//     initialTime.setHours(23, 59, 59, 999); // Default to 23:59 PM
//     return initialTime;
//   });

//   // Sync temp times with context if available
//   useEffect(() => {
//     if (startTime && startTime instanceof Date && !isNaN(startTime)) {
//       setTempStartTime(new Date(startTime));
//     }
//     if (endTime && endTime instanceof Date && !isNaN(endTime)) {
//       setTempEndTime(new Date(endTime));
//     }
//   }, [startTime, endTime]);

//   const showDateTimePicker = (mode, field) => {
//     setPickerMode(mode);
//     setPickerFor(field);
//     setShowPicker(true);
//   };

//   const formatDate = date => {
//     return date instanceof Date && !isNaN(date)
//       ? date.toLocaleDateString('en-GB', {
//           day: '2-digit',
//           month: '2-digit',
//           year: 'numeric',
//         })
//       : 'Invalid Date';
//   };

//   const formatTime = now => {
//     if (!(now instanceof Date) || isNaN(now)) return 'Invalid Time';
//     return now.toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const onDateChange = (event, selectedDate) => {
//     setShowPicker(false);
//     if (selectedDate) {
//       if (pickerFor === 'startDate') {
//         setTempStartDate(selectedDate);
//       } else if (pickerFor === 'startTime') {
//         setTempStartTime(selectedDate);
//       } else if (pickerFor === 'endDate') {
//         setTempEndDate(selectedDate);
//       } else if (pickerFor === 'endTime') {
//         setTempEndTime(selectedDate);
//       }
//     }
//   };

//   const combineDateTime = (date, time) => {
//     if (!(date instanceof Date) || isNaN(date) || !(time instanceof Date) || isNaN(time)) {
//       return null;
//     }
//     const combined = new Date(date);
//     combined.setHours(
//       time.getHours(),
//       time.getMinutes(),
//       time.getSeconds(),
//       time.getMilliseconds()
//     );
//     return combined;
//   };

//   const handleCustomDateRefresh = async () => {
//     try {
//       if (!tempStartDate || !tempEndDate || !tempStartTime || !tempEndTime) {
//         alert('Invalid Date or Time: Please select valid dates and times.');
//         return;
//       }

//       // Combine date and time for start and end
//       const startDateTime = combineDateTime(tempStartDate, tempStartTime);
//       const endDateTime = combineDateTime(tempEndDate, tempEndTime);

//       if (!startDateTime || !endDateTime || startDateTime > endDateTime) {
//         alert('Invalid Date Range: Please ensure the end date and time are not before the start date and time.');
//         return;
//       }

//       // Update context states
//       setStartDate(new Date(tempStartDate));
//       setEndDate(new Date(tempEndDate));
//       setStartTime(new Date(tempStartTime));
//       setEndTime(new Date(tempEndTime));

//       // Call onDateSelected with combined date and time
//       await onDateSelected(startDateTime, endDateTime);
//       CloseModel();
//     } catch (error) {
//       console.error('Error refreshing custom date data:', error);
//       alert('Failed to fetch data for the selected date range.');
//     }
//   };

//   return (
//     <View style={styles.customModalContent}>
//       <Text style={styles.datePickerLabel}>From Date:</Text>
//       <View
//         style={{
//           height: 50,
//           width: width * 0.8,
//           flexDirection: 'row',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//         }}>
//         <View
//           style={{
//             height: 50,
//             width: width * 0.45,
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-around',
//           }}>
//           <Text style={styles.datePickerLabel}>{formatDate(tempStartDate)}</Text>
//           <TouchableOpacity
//             onPress={() => showDateTimePicker('date', 'startDate')}>
//             <FontAwesomeIcon
//               icon={faCalendar}
//               size={24}
//               color="rgb(33,109,206)"
//             />
//           </TouchableOpacity>
//         </View>
//         <View
//           style={{
//             height: 50,
//             width: width * 0.25,
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//           }}>
//           <Text style={styles.datePickerLabel}>{formatTime(tempStartTime)}</Text>
//           <TouchableOpacity
//             onPress={() => showDateTimePicker('time', 'startTime')}>
//             <FontAwesomeIcon
//               icon={faClock}
//               size={24}
//               color="rgb(33,109,206)"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//       <Text style={styles.datePickerLabel}>To Date:</Text>
//       <View
//         style={{
//           height: 50,
//           width: width * 0.8,
//           flexDirection: 'row',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//         }}>
//         <View
//           style={{
//             height: 50,
//             width: width * 0.45,
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-around',
//           }}>
//           <Text style={styles.datePickerLabel}>{formatDate(tempEndDate)}</Text>
//           <TouchableOpacity
//             onPress={() => showDateTimePicker('date', 'endDate')}>
//             <FontAwesomeIcon
//               icon={faCalendar}
//               size={24}
//               color="rgb(33,109,206)"
//             />
//           </TouchableOpacity>
//         </View>
//         <View
//           style={{
//             height: 50,
//             width: width * 0.25,
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//           }}>
//           <Text style={styles.datePickerLabel}>{formatTime(tempEndTime)}</Text>
//           <TouchableOpacity
//             onPress={() => showDateTimePicker('time', 'endTime')}>
//             <FontAwesomeIcon
//               icon={faClock}
//               size={24}
//               color="rgb(33,109,206)"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//       <Button
//         mode="contained"
//         labelStyle={{ fontSize: 15, fontWeight: '700' }}
//         onPress={handleCustomDateRefresh}
//         style={styles.refreshButton}
//       >
//         Refresh
//       </Button>
//       {showPicker && (
//         <DateTimePicker
//           value={
//             pickerFor === 'startDate'
//               ? tempStartDate
//               : pickerFor === 'startTime'
//               ? tempStartTime
//               : pickerFor === 'endDate'
//               ? tempEndDate
//               : tempEndTime
//           }
//           mode={pickerMode}
//           display="default"
//           onChange={onDateChange}
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   customModalContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     alignItems: 'flex-start',
//     marginHorizontal: 20,
//     marginTop: 50,
//   },
//   datePickerLabel: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 10,
//     color: 'black',
//     marginBottom: 5,
//   },
//   refreshButton: {
//     marginTop: 20,
//     backgroundColor: 'rgb(33,109,206)',
//     alignSelf: 'center',
//   },
// });

// export default DashesDateFilter;

import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendar, faClock } from '@fortawesome/free-solid-svg-icons';
import { DashesDataContext } from '../../components/common/DashesDataContext';

const { width } = Dimensions.get('window');

const DashesDateFilter = ({ CloseModel, onDateSelected, setIsLoading, initialFromDate, initialToDate }) => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
  } = useContext(DashesDataContext);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [pickerFor, setPickerFor] = useState('');
  const [tempStartDate, setTempStartDate] = useState(initialFromDate || startDate || new Date());
  const [tempEndDate, setTempEndDate] = useState(initialToDate || endDate || new Date());
  const [tempStartTime, setTempStartTime] = useState(() => {
    const initialTime = new Date();
    initialTime.setHours(8, 0, 0, 0); // Default to 8:00 AM
    return initialTime;
  });
  const [tempEndTime, setTempEndTime] = useState(() => {
    const initialTime = new Date();
    initialTime.setHours(23, 59, 59, 999); // Default to 23:59 PM
    return initialTime;
  });

  // Sync temp times with context if available
  useEffect(() => {
    if (startTime && startTime instanceof Date && !isNaN(startTime)) {
      setTempStartTime(new Date(startTime));
    }
    if (endTime && endTime instanceof Date && !isNaN(endTime)) {
      setTempEndTime(new Date(endTime));
    }
  }, [startTime, endTime]);

  const showDateTimePicker = (mode, field) => {
    setPickerMode(mode);
    setPickerFor(field);
    setShowPicker(true);
  };

  const formatDate = date => {
    return date instanceof Date && !isNaN(date)
      ? date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : 'Invalid Date';
  };

  const formatTime = now => {
    if (!(now instanceof Date) || isNaN(now)) return 'Invalid Time';
    return now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onDateChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      if (pickerFor === 'startDate') {
        setTempStartDate(selectedDate);
      } else if (pickerFor === 'startTime') {
        setTempStartTime(selectedDate);
      } else if (pickerFor === 'endDate') {
        setTempEndDate(selectedDate);
      } else if (pickerFor === 'endTime') {
        setTempEndTime(selectedDate);
      }
    }
  };

  const combineDateTime = (date, time) => {
    if (!(date instanceof Date) || isNaN(date) || !(time instanceof Date) || isNaN(time)) {
      return null;
    }
    const combined = new Date(date);
    combined.setHours(
      time.getHours(),
      time.getMinutes(),
      time.getSeconds(),
      time.getMilliseconds()
    );
    return combined;
  };

  const handleCustomDateRefresh = async () => {
    if (!setIsLoading) {
      console.error('setIsLoading is not provided');
      return;
    }

    setIsLoading(true); // Start loading in AuditDashboard
    try {
      if (!tempStartDate || !tempEndDate || !tempStartTime || !tempEndTime) {
        alert('Invalid Date or Time: Please select valid dates and times.');
        setIsLoading(false); // Stop loading on invalid input
        return;
      }

      const startDateTime = combineDateTime(tempStartDate, tempStartTime);
      const endDateTime = combineDateTime(tempEndDate, tempEndTime);

      if (!startDateTime || !endDateTime || startDateTime > endDateTime) {
        alert('Invalid Date Range: Please ensure the end date and time are not before the start date and time.');
        setIsLoading(false); // Stop loading on invalid range
        return;
      }

      // Trigger data fetch and close modal via parent callback
      onDateSelected(startDateTime, endDateTime);
      CloseModel(); // Close the modal immediately
    } catch (error) {
      console.error('Error refreshing custom date data:', error);
      alert('Failed to fetch data for the selected date range.');
      setIsLoading(false); // Stop loading on error
    }
  };

  return (
    <View style={styles.customModalContent}>
      <Text style={styles.datePickerLabel}>From Date:</Text>
      <View
        style={{
          height: 50,
          width: width * 0.8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            height: 50,
            width: width * 0.45,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}>
          <Text style={styles.datePickerLabel}>{formatDate(tempStartDate)}</Text>
          <TouchableOpacity
            onPress={() => showDateTimePicker('date', 'startDate')}>
            <FontAwesomeIcon
              icon={faCalendar}
              size={24}
              color="rgb(33,109,206)"
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: 50,
            width: width * 0.25,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={styles.datePickerLabel}>{formatTime(tempStartTime)}</Text>
          <TouchableOpacity
            onPress={() => showDateTimePicker('time', 'startTime')}>
            <FontAwesomeIcon
              icon={faClock}
              size={24}
              color="rgb(33,109,206)"
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.datePickerLabel}>To Date:</Text>
      <View
        style={{
          height: 50,
          width: width * 0.8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            height: 50,
            width: width * 0.45,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
          }}>
          <Text style={styles.datePickerLabel}>{formatDate(tempEndDate)}</Text>
          <TouchableOpacity
            onPress={() => showDateTimePicker('date', 'endDate')}>
            <FontAwesomeIcon
              icon={faCalendar}
              size={24}
              color="rgb(33,109,206)"
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            height: 50,
            width: width * 0.25,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={styles.datePickerLabel}>{formatTime(tempEndTime)}</Text>
          <TouchableOpacity
            onPress={() => showDateTimePicker('time', 'endTime')}>
            <FontAwesomeIcon
              icon={faClock}
              size={24}
              color="rgb(33,109,206)"
            />
          </TouchableOpacity>
        </View>
      </View>
      <Button
        mode="contained"
        labelStyle={{ fontSize: 15, fontWeight: '700' }}
        onPress={handleCustomDateRefresh}
        style={styles.refreshButton}
      >
        Refresh
      </Button>
      {showPicker && (
        <DateTimePicker
          value={
            pickerFor === 'startDate'
              ? tempStartDate
              : pickerFor === 'startTime'
              ? tempStartTime
              : pickerFor === 'endDate'
              ? tempEndDate
              : tempEndTime
          }
          mode={pickerMode}
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  customModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginTop: 50,
  },
  datePickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'black',
    marginBottom: 5,
  },
  refreshButton: {
    marginTop: 20,
    backgroundColor: 'rgb(33,109,206)',
    alignSelf: 'center',
  },
});

export default DashesDateFilter;