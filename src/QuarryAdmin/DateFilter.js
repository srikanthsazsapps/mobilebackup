import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {DataContext} from '../components/common/DataContext';
import {Button} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCalendar, faClock} from '@fortawesome/free-solid-svg-icons';

const {width, height} = Dimensions.get('window');

const DateFilter = ({CloseModel}) => {
  const {
    dailyData,
    loading,
    RefreshData,
    startDate,
    setStartDate,
    setEndDate,
    endDate,
    setStartTime,
    startTime,
    setEndTime,
    endTime,
  } = useContext(DataContext);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date'); // Date or Time mode
  const [pickerFor, setPickerFor] = useState(''); //

  const showDateTimePicker = (mode, field) => {
    setPickerMode(mode);
    setPickerFor(field);
    setShowPicker(true);
  };

  const formatDate = date => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  const formatRevertTime = now => {
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localTime;
  };
  const formatSetTime = now => {
    const localTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    return localTime;
  };
  const formatTime = now => {
    const localTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

    return localTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onDateChange = (event, selectedDate) => {
    setShowPicker(false); // Hide the picker after selection
    if (selectedDate) {
      if (pickerFor === 'startDate') {
        setStartDate(selectedDate); // Set Start Date
      } else if (pickerFor === 'startTime') {
        setStartTime(formatRevertTime(selectedDate)); // Set Start Time
      } else if (pickerFor === 'endDate') {
        setEndDate(selectedDate); // Set End Date
      } else if (pickerFor === 'endTime') {
        setEndTime(formatRevertTime(selectedDate)); // Set End Time
      }
    }
  };

  const handleCustomDateRefresh = async () => {
    await RefreshData();
    CloseModel(false);
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
          <Text style={styles.datePickerLabel}>{formatDate(startDate)}</Text>
          <TouchableOpacity
            onPress={() => showDateTimePicker('date', 'startDate')}>
            <FontAwesomeIcon
              icon={faCalendar}
              size={24}
              color="rgb(33,109,206)"></FontAwesomeIcon>
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
          <Text style={styles.datePickerLabel}>{formatTime(startTime)}</Text>
          <TouchableOpacity
            onPress={() => showDateTimePicker('time', 'startTime')}>
            <FontAwesomeIcon
              icon={faClock}
              size={24}
              color="rgb(33,109,206)"></FontAwesomeIcon>
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
          <Text style={styles.datePickerLabel}>{formatDate(endDate)}</Text>
          <TouchableOpacity
            onPress={() => showDateTimePicker('date', 'endDate')}>
            <FontAwesomeIcon
              icon={faCalendar}
              size={24}
              color="rgb(33,109,206)"></FontAwesomeIcon>
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
          <Text style={styles.datePickerLabel}>{formatTime(endTime)}</Text>
          <TouchableOpacity
            onPress={() => showDateTimePicker('time', 'endTime')}>
            <FontAwesomeIcon
              icon={faClock}
              size={24}
              color="rgb(33,109,206)"></FontAwesomeIcon>
          </TouchableOpacity>
        </View>
      </View>

      <Button
        mode="contained"
        labelStyle={{fontSize: 15, fontWeight: '700'}}
        onPress={handleCustomDateRefresh}
        style={styles.refreshButton}>
        Refresh
      </Button>
      {showPicker && (
        <DateTimePicker
          value={
            pickerFor === 'startDate'
              ? startDate
              : pickerFor === 'startTime'
              ? formatSetTime(startTime)
              : pickerFor === 'endDate'
              ? endDate
              : formatSetTime(endTime)
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

export default DateFilter;
