import React, {useEffect} from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Alert,
  BackHandler,
} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faGear,
  faTruckArrowRight,
  faReceipt,
} from '@fortawesome/free-solid-svg-icons';


import Home from './AccountsDashBoard/Home';
import SettingsScreen from './DashBoard/SettingsScreen';
import {AnimatedTabBarNavigator} from 'react-native-animated-nav-tab-bar';
import { useNavigation } from '@react-navigation/native';

import Report from './AccountsDashBoard/Report';

const {width} = Dimensions.get('window');

const Tab = AnimatedTabBarNavigator();

const TrendAnalysis = () => {
   const navigation = useNavigation();
 useEffect(() => {
  const handleBackButtonClick = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return true;
    } else {
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'OK', onPress: () => BackHandler.exitApp() },
        ],
        { cancelable: false },
      );
      return true;
    }
  };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        tabBarOptions={{
          activeTintColor: 'white',
          inactiveTintColor: 'rgb(33,109,206)',
          activeBackgroundColor: 'rgb(33,109,206)',
          tabStyle: styles.tabStyle,
        }}
        appearance={{
          shadow: true,
          // floating: true,
          whenActiveShow: 'both',
        }}
        style={styles.tabNavigator}>
        <Tab.Screen
          name="Home"
          options={{
            tabBarIcon: ({focused, color}) => (
              <FontAwesomeIcon icon={faReceipt} size={22} color={color} />
            ),
          }}>
          {() => <Home />}
        </Tab.Screen>
        <Tab.Screen
          name="Report"
          options={{
            tabBarIcon: ({focused, color}) => (
              <FontAwesomeIcon
                icon={faTruckArrowRight}
                size={22}
                color={color}
              />
            ),
          }}>
          {() => <Report />}
        </Tab.Screen>
        

        <Tab.Screen
          name="Settings"
          options={{
            tabBarIcon: ({focused, color}) => (
              <FontAwesomeIcon icon={faGear} size={22} color={color} />
            ),
          }}>
          {() => <SettingsScreen />}
        </Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(33,109,206)',
  },
  header: {
    height: 70,
    marginTop: 5,
    marginHorizontal: 30,
    borderRadius: 50,
    backgroundColor: 'rgb(33,109,206)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerrr: {
    height: 150,
    marginTop: 5,
    marginHorizontal: 30,
    backgroundColor: 'rgb(33,109,206)',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.4,
    height: 55,
    resizeMode: 'contain',
  },
  tabNavigator: {
    flex: 1,
  },
  tabStyle: {
    borderRadius: 20,
    height: 60,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
  },
});

export default TrendAnalysis;