import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  BackHandler,
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import VehicleReport from './VechileReport';
import VechileEntry from './VechileEntry';
import EmployeeDetails from './EmployeeDetails';

import SazsIcon from '../images/SazsOutline.svg';
import SazsFillIcon from '../images/SazsFill.svg';
import Securityreportol from '../images/Securityreportol.svg';
import Securityreportfl from '../images/Securityreportfl.svg';
import Profile from '../images/Person.svg';
import Profile1 from '../images/PersonFill.svg';
import ExitAppIcon from '../images/exit app.svg';

const {width} = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const VehiclePassMain = ({navigation}) => {
  const [currentTab, setCurrentTab] = useState('VehicleHome');
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const handleBackButtonClick = () => {
      switch (currentTab) {
        case 'Settings':
          setCurrentTab('VehicleIn');
          navigation.navigate('VehicleIn');
          return true;

        case 'VehicleIn':
          setCurrentTab('VehicleHome');
          navigation.navigate('VehicleHome');
          return true;

        case 'VehicleHome':
          setShowExitModal(true); // Show custom modal
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

  const handleExit = () => {
    setShowExitModal(false);
    BackHandler.exitApp();
  };

  const handleTabPress = routeName => {
    setCurrentTab(routeName);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused}) => {
            if (route.name === 'VehicleHome') {
              return focused ? (
                <SazsFillIcon width={35} height={35} fill="white" />
              ) : (
                <SazsIcon width={25} height={25} fill="white" />
              );
            } else if (route.name === 'VehicleIn') {
              return focused ? (
                <Securityreportfl width={35} height={35} />
              ) : (
                <Securityreportol width={25} height={25} />
              );
            } else if (route.name === 'Settings') {
              return focused ? (
                <Profile1 width={30} height={30} fill="white" />
              ) : (
                <Profile width={22} height={22} fill="white" />
              );
            }
          },
          tabBarActiveTintColor: 'white',
          tabBarInactiveTintColor: 'white',
          tabBarStyle: styles.tabStyle,
          tabBarShowLabel: false,
          headerShown: false,
        })}>
        <Tab.Screen
          name="VehicleHome"
          component={VechileEntry}
          listeners={{
            tabPress: () => handleTabPress('VehicleHome'),
          }}
        />
        <Tab.Screen
          name="VehicleIn"
          component={VehicleReport}
          listeners={{
            tabPress: () => handleTabPress('VehicleIn'),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={EmployeeDetails}
          listeners={{
            tabPress: () => handleTabPress('Settings'),
          }}
        />
      </Tab.Navigator>

      {/* Custom Exit Modal */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Exit App</Text>
            <Text style={styles.modalText}>Are you sure you want to exit?</Text>

            <ExitAppIcon width={150} height={150} style={{marginBottom: 20}} />

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

export default VehiclePassMain;
