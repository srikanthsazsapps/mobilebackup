import React, {useContext, useEffect, useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Alert,
  BackHandler,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
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
import DashboardMain from '../New_Desion/DashboardMain';

const {width} = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const AdminMain = ({navigation}) => {
  const {RefreshData} = useContext(DataContext);
  const [currentTab, setCurrentTab] = useState('Home');

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
          navigation.navigate('Home');
          return true;

        case 'Home':
          Alert.alert(
            'Exit App',
            'Are you sure you want to exit?',
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => null,
              },
              {
                text: 'Exit',
                onPress: () => BackHandler.exitApp(),
              },
            ],
            {cancelable: true},
          );
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
            } else if (route.name === 'Dash') {
              return focused ? (
                <DashFillIcon width={30} height={30} fill="white" />
              ) : (
                <DashIcon width={22} height={22} fill="white" />
              );
            } else if (route.name === 'Settings') {
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
          name="Dash"
          component={Dash}
          listeners={{
            tabPress: () => handleTabPress('Dash'),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          listeners={{
            tabPress: () => handleTabPress('Settings'),
          }}
        />
      </Tab.Navigator>
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
});

export default AdminMain;
