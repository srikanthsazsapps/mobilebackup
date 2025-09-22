import React from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, Image } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faArrowUp, faArrowDown, faSort, faSortAlphaDown, faSortNumericDown, faSortNumericUp } from '@fortawesome/free-solid-svg-icons';
import NetworkStatusIndicator from "./NetworkStatusIndicator";
import GlobalStyle from "../components/common/GlobalStyle";
import LinearGradient from "react-native-linear-gradient";
import ProfitCards from "./ProfitCard";
const VehicleReport = () => {
  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
          </TouchableOpacity>
          <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Profit&Loss</Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setIsMenuVisible(true)}
        >
          <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.welcomeText}>Welcome Back</Text>
      <Text style={styles.greetingText}>Here's your financial overview for today</Text>
      <Text style={styles.overviewText}>Financial Overview</Text>
      <ProfitCards/>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#333333',
    marginLeft: 10,
  },
  menuButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  menuText: {
    color: '#fff',
    fontSize: 14,
  },
  welcomeText: {
    color: '#3E89EC',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  greetingText: {
    color: '#000',
    fontSize: 14,
    textAlign: 'center'
  },
  overviewText: {
    color: '#000',
    fontSize: 18,
    textAlign: 'left',
    marginLeft: 20,
    marginTop: 20
  },
  Container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  Card: {
    width: 300,
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tracker:{
    fontSize: 25,
    right:120,
    backgroundColor:'#fff',
    borderRadius:1,
    bottom:40
  }
});

export default VehicleReport;