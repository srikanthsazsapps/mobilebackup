// DateFilter.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';

const DateFilter = ({ CloseModel, onDateSelected }) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleConfirm = () => {
    onDateSelected(startDate, endDate);
    CloseModel();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Start Date</Text>
      <DatePicker
        date={startDate}
        onDateChange={setStartDate}
        mode="date"
        maximumDate={new Date()}
      />
      <Text style={styles.label}>Select End Date</Text>
      <DatePicker
        date={endDate}
        onDateChange={setEndDate}
        mode="date"
        maximumDate={new Date()}
        minimumDate={startDate}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Apply</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={CloseModel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#3E89EC',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DateFilter;
