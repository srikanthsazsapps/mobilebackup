import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Platform,
  Keyboard,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import AttendanceHome from './AttendanceHome';
import WeekLogScreen from './WeekLogScreen';
import SettingsPage from './SettingsPage';
import LeaveDashboard from './LeaveDashboard';
import { DataContext } from '../components/common/DataContext';
import DashIcon from '../images/Dash.svg';
import DashFillIcon from '../images/DashFill.svg';
import GearIcon from '../images/Gear.svg';
import GearFillIcon from '../images/GearFill.svg';
import SazsIcon from '../images/SazsOutline.svg';
import SazsFillIcon from '../images/SazsFill.svg';
import Calendarcheck from '../images/Calendarcheck.svg';
import Calendarcheckfill from '../images/Calendarcheckfill.svg';
import Person from '../images/Person.svg';
import PersonFill from '../images/PersonFill.svg';
import HomeIcon from '../images/HomeIcon.svg';
const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation, opacity }) => {
  return (
    <Animated.View style={[styles.tabStyle, { opacity }]}> 
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let icon;
        if (route.name === 'AttendanceHome') {
          icon = isFocused ? (
            <SazsFillIcon width={35} height={35} fill="white" />
          ) : (
            <SazsIcon width={25} height={25} fill="white" />
          );
        } else if (route.name === 'WeekLogScreen') {
          icon = isFocused ? (
            <Calendarcheckfill width={30} height={30} fill="white" />
          ) : (
            <Calendarcheck width={22} height={22} fill="white" />
          );
        } else if (route.name === 'LeaveDashboard') {
          icon = isFocused ? (
            <DashFillIcon width={30} height={30} fill="white" />
          ) : (
            <DashIcon width={22} height={22} fill="white" />
          );
        } else if (route.name === 'Settings') {
          icon = isFocused ? (
            <PersonFill width={30} height={30} fill="white" />
          ) : (
            <Person width={22} height={22} fill="white" />
          );
        }

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={styles.tabButton}
          >
            {icon}
          </TouchableOpacity>
        );
      })}
    </Animated.View>
  );
};

const AttendanceMain = () => {
  const { RefreshData } = useContext(DataContext);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    RefreshData();

    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 0, 
          useNativeDriver: true,
        }).start();
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200, 
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        tabBar={(props) => (
          <CustomTabBar {...props} opacity={opacity} />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="AttendanceHome" component={AttendanceHome} />
        <Tab.Screen name="WeekLogScreen" component={WeekLogScreen} />
        <Tab.Screen name="LeaveDashboard" component={LeaveDashboard} />
        <Tab.Screen name="Settings" component={SettingsPage} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabStyle: {
    flexDirection: 'row',
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AttendanceMain;
