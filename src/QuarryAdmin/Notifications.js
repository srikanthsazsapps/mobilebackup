import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {Button} from 'react-native-paper';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faArrowAltCircleLeft,
  faArrowCircleRight,
  faArrowLeft,
  faBackward,
} from '@fortawesome/free-solid-svg-icons';
import GlobalStyle from '../components/common/GlobalStyle';
const initialNotifications = [
  {
    id: '1',
    vehicle: 'TN 05 MC 2003',
    status: 'Vehicle not billed',
    time: '10.34 A.M',
    image: 'https://example.com/truck1.png',
  },
  {
    id: '2',
    vehicle: 'TN 72 JB 4442',
    status: 'Vehicle not billed',
    time: '12.12 P.M',
    image: 'https://example.com/truck2.png',
  },
  {
    id: '3',
    vehicle: 'TN 07 AB 2024',
    status: 'Vehicle not billed',
    time: '10.34 A.M',
    image: 'https://example.com/truck1.png',
  },
  {
    id: '4',
    vehicle: 'TN 20 AB 2074',
    status: 'Vehicle not billed',
    time: '10.34 A.M',
    image: 'https://example.com/truck1.png',
  },
  {
    id: '5',
    vehicle: 'TN 10 AB 2074',
    status: 'Vehicle not billed',
    time: '10.34 A.M',
    image: 'https://example.com/truck1.png',
  },
  {
    id: '6',
    vehicle: 'TN 13 AB 3403',
    status: 'Vehicle not billed',
    time: '10.34 A.M',
    image: 'https://example.com/truck1.png',
  },
  {
    id: '7',
    vehicle: 'TN 12 AB 2894',
    status: 'Vehicle not billed',
    time: '10.34 A.M',
    image: 'https://example.com/truck1.png',
  },

  {
    id: '8',
    vehicle: 'TN 34 AB 0922',
    status: 'Vehicle not billed',
    time: '10.34 A.M',
    image: 'https://example.com/truck1.png',
  },

  {
    id: '9',
    vehicle: 'TN 12 AB 9088',
    status: 'Vehicle not billed',
    time: '10.34 A.M',
    image: 'https://example.com/truck1.png',
  },

  {
    id: '10',
    vehicle: 'TN 11 AB 2788',
    status: 'Vehicle not billed',
    time: '10.34 A.M',
    image: 'https://example.com/truck1.png',
  },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const deleteNotification = id => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(item => item.id !== id),
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          onPress: () => setNotifications([]),
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const renderItem = ({item}) => (
    <View style={styles.notificationItem}>
      <Image source={require('../images/bluelogo.png')} style={styles.image} />
      <View style={styles.notificationText}>
        <Text style={[GlobalStyle.heading7,styles.vehicleText]}>{item.vehicle}</Text>
        <Text style={[GlobalStyle.heading8,styles.statusText]}>{item.status}</Text>
      </View>
      <Text style={[GlobalStyle.heading7,styles.timeText]}>
        02-04-2025{'\n'}
        {'\n'}
        {item.time}
      </Text>
    </View>
  );

  const renderHiddenItem = () => <View style={styles.rowBack}></View>;

  return (
    <SafeAreaView style={styles.container}>
      {notifications.length > 0 ? (
        <>
          <SwipeListView
            data={notifications}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem} // Hidden content for swipe actions
            keyExtractor={item => item.id}
            leftOpenValue={-100}
            rightOpenValue={-100} 
            onRowOpen={(rowKey, rowMap) => {
              deleteNotification(rowKey);
              if (rowMap[rowKey]) rowMap[rowKey].closeRow(); // Close the row after deletion
            }}
          />
          {notifications.length > 0 && (
            <TouchableOpacity
              onPress={handleClearAll}
              style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgb(33,109,206)',
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  clearButton: {
    backgroundColor: 'transparent',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    top: 15,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 25,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  vehicleText: {
    // fontSize: 16,
    // color:'black',
    // fontWeight: 'bold',
  },
  statusText: {
    // fontSize: 14,
    color: 'gray',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'gray',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: 'gray',
  },
  floatingBackButton: {
    position: 'absolute',
    bottom: 20, // Distance from the bottom
    alignSelf: 'flex-end',
    right: 10,
    backgroundColor: 'rgb(33,109,206)',
    borderRadius: 30, // Circular shape
    height: 50, // Height of the button
    justifyContent: 'center', // Center the text/icon inside
    elevation: 5, // Shadow for a floating effect
  },
  backButtonText: {
    color: 'white',
    marginLeft: 5,
  },
});

export default Notifications;
