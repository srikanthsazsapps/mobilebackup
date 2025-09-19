import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faUser,
  faBell,
  faCog,
  faHeart,
  faComment,
  faInfoCircle,
  faAngleRight,
  faCartShopping,
  faChartLine,
  faChartPie,
  faTruckMoving,
  faBoxesPacking,
  faInfo
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';

const ButtonList = () => {
  const navigation = useNavigation();
  const buttons = [
    { text: 'Accounts', icon: faComment,nav :"AccountScreen" },
     { text: 'Asset', icon: faTruckMoving ,nav :"AssetDashboard"},
    { text: 'Profit & Loss', icon: faChartPie ,nav :"ProfitLossDashboard" },
    // { text: 'Production', icon: faBoxesPacking,nav :"ProductionDashboard" },
     { text: 'Sales', icon: faTruckMoving ,nav :"SalesScreen"},
    //  { text: 'TrendAnalysis', icon: faInfoCircle ,nav :"TrendAnalysis"},
  ];

  return (
    <View style={styles.container}>
      {buttons.map((button, index) => (
        <TouchableOpacity key={index} style={styles.button} onPress={()=>navigation.navigate(button.nav)}>
          <LinearGradient
            colors={['#ffffff', '#ffffff']} // Gradient color #d0d0d0
            style={styles.gradient}>
            <View style={styles.leftContent}>
              <FontAwesomeIcon icon={button.icon} size={20} color="#3E89EC" style={styles.icon} />
              <Text style={styles.buttonText}>{button.text}</Text>
            </View>
            <FontAwesomeIcon icon={faAngleRight} size={18} color="black" style={styles.arrowIcon} />
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    width: '100%',
    bottom: 50,
  },
  button: {
    marginBottom: 10,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    justifyContent: 'space-between', // Ensures proper spacing between left and right
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 15, // Space between icon and text
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontFamily: 'Cabin-Bold',
    textAlign: 'left', // Align text to the left
  },
  arrowIcon: {
    marginLeft: 15,
  },
});

export default ButtonList;
