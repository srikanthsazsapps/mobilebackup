import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ImageBackground } from 'react-native';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft, faLessThan } from "@fortawesome/free-solid-svg-icons";
import GlobalStyle from "../../../components/common/GlobalStyle";
import NetworkStatusIndicator from '../../NetworkStatusIndicator';
import DateFilter from '../../CommonFiles/DateFilter';

// Import your background image
import backgroundImage from '../../../images/logoSazs.png';

const { width } = Dimensions.get('window');

const PayablesDetails = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
          </TouchableOpacity>
          <Text style={[styles.headerTitle]}>Accounts</Text>
        </View>
        <DateFilter />
        <TouchableOpacity style={styles.menuButton}>
          <Text style={[styles.menuText]}>Menu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.Container}>
        {/* Main Summary Card */}
        <View style={styles.Card}>
          {/* Background Image at Bottom-Right */}
          <ImageBackground
            source={backgroundImage} // Reference the imported image
            style={styles.backgroundImage}
            resizeMode="contain" // Adjust as needed (contain, cover, stretch)
          />

          {/* Header with back arrow and title */}
          <View style={styles.LeftCard}>
            <View style={styles.rowText}>
              <FontAwesomeIcon style={styles.IconImage} size={15} icon={faLessThan} color="white" />
              <Text style={styles.CustText}>Cathrin Summary</Text>
            </View>
          </View>
          
          {/* Financial Details Section */}
          <View style={styles.contentContainer}>
            <View style={styles.financialRow}>
              {/* Left Column */}
              <View style={styles.column}>
                <View style={styles.dataItem}>
                  <Text style={styles.labelText}>Purchase</Text>
                  <Text style={styles.valueText}>4,000,000</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.labelText}>Spare cost</Text>
                  <Text style={styles.valueText}>4,000,000</Text>
                </View>
              </View>
              
              {/* Right Column */}
              <View style={styles.column}>
                <View style={styles.dataItem}>
                  <Text style={styles.labelText}>Payments</Text>
                  <Text style={styles.valueText}>4,000,000</Text>
                </View>
                <View style={styles.dataItem}>
                  <Text style={styles.labelText}>Service Cost</Text>
                  <Text style={styles.valueText}>4,000,000</Text>
                </View>
              </View>
            </View>
            
            {/* Outstanding Balance */}
            <View style={styles.outstandingSection}>
              <Text style={styles.outstandingLabel}>Outstanding Balance</Text>
              <Text style={styles.outstandingAmount}>4,000,000</Text>
            </View>
          </View>
        </View>
        
        {/* Product Summary Card */}
        <View style={styles.ProductCard}>
          <Text style={styles.productTitle}>Product Summary</Text>
          <View style={styles.productRow}>
            <View style={styles.productItem}>
              <Text style={styles.productLabel}>No. of Purchased{'\n'}Product</Text>
            </View>
            <View style={styles.productValueContainer}>
              <Text style={styles.productValue}>10</Text>
            </View>
          </View>
        </View>
      </View>
     
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 10,
    fontFamily: 'PlusJakartaSans-SemiBold',
color:'#000',
fontSize:20
  },
  menuButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  menuText: {
    color: '#fff',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize:12
  },
  Container: {
    flex: 1,
    alignItems: 'center', 
    padding: 6,
    gap: 20,
  },
  Card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative', 
  },
  backgroundImage: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 208,
    height: 179, 
    opacity: 0.6, 
  },
  LeftCard: {
    width: '85%',
    height: 40,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    marginTop: 20,
    top: 20,
  },
  rowText: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 15,
  },
  IconImage: {
    marginRight: 15,
    left: 15,
  },
  CustText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  contentContainer: {
    padding: 25,
    paddingTop: 30,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  column: {
    flex: 1,
    gap: 25,
    top: 20,
  },
  dataItem: {
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    color: '#848484',
    marginBottom: 5,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  valueText: {
    fontSize: 18,
    color: '#333333',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  outstandingSection: {
    marginTop: 20,
    paddingTop: 20,
  },
  outstandingLabel: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
    bottom: 10,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  outstandingAmount: {
    fontSize: 20,
    color: '#FF9696',
    bottom: 15,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  ProductCard: {
    backgroundColor: '#F8F8F8',
    width: '100%',
    borderRadius: 20,
    padding: 25,
    borderColor: '#D0D0D0',
    borderWidth: 1,
  },
  productTitle: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 25,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productItem: {
    flex: 1,
  },
  productLabel: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  productValueContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  productValue: {
    fontSize: 32,
    color: '#333333',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
});

export default PayablesDetails;