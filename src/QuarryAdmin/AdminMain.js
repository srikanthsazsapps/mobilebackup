import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Alert,
  BackHandler,Modal,View,Text,TouchableOpacity
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import DashboardMain from '../NewDesignApp/DashboardMain';
import SettingsScreen from '../components/DashBoard/SettingsScreen';
import Dash from './NavDash';
import {DataContext} from '../components/common/DataContext';
import DashIcon from '../images/dashicon.svg';
import DashFillIcon from '../images/dashicon.svg';
import GearIcon from '../images/Gear.svg';
import GearFillIcon from '../images/GearFill.svg';
import SazsIcon from '../images/SazsOutline.svg';
import SazsFillIcon from '../images/SazsFill.svg';
import Person from '../images/Person.svg';
import PersonFill from '../images/PersonFill.svg';

import ExitAppIcon from '../images/exit app.svg';
import AttendanceReport from '../NewDesignApp/AttendanceReport';
import VehicleReport from '../NewDesignApp/VehicleReport';
import AccountDashBoard from '../NewDesignApp/NewDashboards/AccountDashBoard';
import AttendanceMain from '../Attendance/AttendanceMain';
const {width} = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const AdminMain = ({navigation}) => {
  const {RefreshData} = useContext(DataContext);
  const [currentTab, setCurrentTab] = useState('Home');
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    RefreshData();
  }, []);

  useEffect(() => {
    const handleBackButtonClick = () => {
      switch (currentTab) {
        case 'Settings':
          setCurrentTab('Dash');
          navigation.navigate('Dash');
          return true;

        case 'Dash':
          setCurrentTab('Home');
          navigation.navigate('DashboardMain');
          return true;

        case 'Home':
          setShowExitModal(true);
          return true;

        default:
          return false;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );

    return () => backHandler.remove();
  }, [currentTab, navigation]);

  const handleTabPress = routeName => {
    setCurrentTab(routeName);
  };

  const handleExit = () => {
    setShowExitModal(false);
    BackHandler.exitApp();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            if (route.name === 'Home') {
              return focused ? (
                <SazsFillIcon width={35} height={35} fill="white" />
              ) : (
                <SazsIcon width={25} height={25} fill="white" />
              );
            } else if (route.name === 'AttendanceReport') {
              return focused ? (
                <DashFillIcon width={30} height={30} fill="white" />
              ) : (
                <DashIcon width={22} height={22} fill="white" />
              );
            }else if (route.name === 'VehicleReport') {
              return focused ? (
                <DashFillIcon width={30} height={30} fill="white" />
              ) : (
                <DashIcon width={22} height={22} fill="white" />
              );
            } else if (route.name === 'Profile') {
              return focused ? (
                <PersonFill width={30} height={30} fill="white" />
              ) : (
                <Person width={22} height={22} fill="white" />
              );
            }
          },
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'white',
          tabBarStyle: styles.tabStyle,
          tabBarShowLabel: false,
          headerShown: false, // Optional: hides the header bar
        })}>
        <Tab.Screen
          name="Home"
          component={DashboardMain}
          listeners={{
            tabPress: () => handleTabPress('Home'),
          }}
        />
        <Tab.Screen
          name="AttendanceReport"
          component={AttendanceReport}
          listeners={{
            tabPress: () => handleTabPress('AttendanceReport'),
          }}
        />
        <Tab.Screen
          name="VehicleReport"
          component={VehicleReport}
          listeners={{
            tabPress: () => handleTabPress('VehicleReport'),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={SettingsScreen}
          listeners={{
            tabPress: () => handleTabPress('Profile'),
          }}
        />
      </Tab.Navigator>
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Exit App</Text>
            <Text style={styles.modalText}>Are you sure you want to exit?</Text>

            <ExitAppIcon width={150} height={150} style={{ marginBottom: 20 }} />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowExitModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.exitButton]}
                onPress={handleExit}>
                <Text style={styles.exitText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabStyle: {
    backgroundColor: '#3E89EC',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    borderTopEndRadius: 30,
    borderTopStartRadius: 30,
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
    height: 55,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Cabin-Bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    fontFamily: 'Cabin-Bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ddd',
  },
  exitButton: {
    backgroundColor: '#ff4d4d',
  },
  cancelText: {
    color: '#333',
    fontFamily: 'Cabin-Bold',
  },
  exitText: {
    color: 'white',
    fontFamily: 'Cabin-Bold',
  },
});

export default AdminMain;
