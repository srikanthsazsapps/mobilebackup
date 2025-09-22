import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, ImageBackground } from 'react-native';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import GlobalStyle from "../../../components/common/GlobalStyle";
import NetworkStatusIndicator from '../../NetworkStatusIndicator';
import DateFilter from '../../CommonFiles/DateFilter';

const { width } = Dimensions.get('window');

const AccountDetails = ({ navigation }) => {
  // Account data matching the image format
  const accountData = [
    { label: 'Opening Balance', amount: '2,00,890.89', isDebit: false },
    { label: 'Total Sales', amount: '2,00,890.89', isDebit: false },
    { label: 'Debit Note', amount: '2,00,890.89', isDebit: true },
    { label: 'Receipts', amount: '2,00,890.89', isDebit: false },
    { label: 'Credit Note', amount: '2,00,890.89', isDebit: true },
  ];

  const closingBalance = '2,00,890.89';
  const ageWiseData = [
    { label: '0–30', amount: '9,97,476.00', percentage: 0.2 },
    { label: '30–60', amount: '25,53,239.00', percentage: 0.3 },
    { label: '60–90', amount: '25,53,239.00', percentage: 0.6 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />

      {/* Header - Fixed outside ScrollView */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" style={{top:12}} />
          </TouchableOpacity>
          <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Accounts</Text>
        </View>
        <View style={styles.dateFilterWrapper}>
          <DateFilter />
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Account Details Card */}
        <ImageBackground
          source={require('../../../images/ReceiptsWLogo.png')}
          style={styles.backgroundImage}
          imageStyle={styles.imageStyle}
          resizeMode="stretch"
        >
          <View style={styles.overlay}>
            {/* Header */}
            <View style={styles.overlayHeader}>
              <Text style={styles.title}>Mariappan Private Limited</Text>
            </View>

            {/* Account Details Rows */}
            <View style={styles.accountContainer}>
              {/* Header Row */}
              <View style={styles.headerRow}>
                <Text style={styles.headerText}>Description</Text>
                <Text style={styles.headerText}>Amount</Text>
              </View>

              {/* Account Data Rows */}
              {accountData.map((item, index) => (
                <View key={index} style={styles.dataRow}>
                  <Text style={styles.descriptionText}>{item.label}</Text>
                  <View style={styles.amountContainer}>
                    {item.isDebit && <Text style={styles.debitSymbol}>(-)</Text>}
                    <Text style={styles.amountText}>{item.amount}</Text>
                  </View>
                </View>
              ))}

              {/* Closing Balance Row */}
              <View style={styles.closingRow}>
                <Text style={styles.closingLabel}>Closing Balance</Text>
                <Text style={styles.closingAmount}>₹{closingBalance}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Age Wise Summary Card */}
        <View style={styles.ageWiseCard}>
          <Text style={styles.ageText}>Age Wise Summary</Text>
          <View style={styles.line} />
          
          {/* Credit Days Limit */}
          <View style={styles.creditDaysContainer}>
            <Text style={styles.creditDaysText}>Credit Days Limit</Text>
            <Text style={styles.creditDaysValue}>30 days</Text>
          </View>

          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            {ageWiseData.map((item, index) => (
              <View key={index} style={styles.progressRow}>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { flex: item.percentage }]}>
                    <View style={styles.labelBadge}>
                      <Text style={styles.progressLabelText}>{item.label}</Text>
                    </View>
                  </View>
                  {/* Amount inside right side */}
                  <View style={styles.amountContainerInside}>
                    <Text style={styles.progressAmountInside}>{item.amount}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Cards Row */}
        <View style={styles.cardsRow}>
          {/* Left Small Card */}
          <View style={styles.smallCard}>
            <Text style={styles.cardTitle}>Total Bills</Text>
            <Text style={styles.cardValue}>100</Text>
          </View>

          {/* Right Medium Card */}
          <View style={styles.mediumCard}>
            <Text style={styles.cardTitle}>Highly Purchased Product</Text>
            <View style={styles.productRow}>
              <Text style={styles.productTag}>M.Sand</Text>
              <Text style={styles.productTag}>20 TON</Text>
              <Text style={styles.productTag}>P.Sand</Text>
              <Text style={styles.productTag}>20 TON</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
    padding: 10
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F5F6FA',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 10,
    top: 10
  },
  dateFilterWrapper: {
    top: 10
  },
  menuButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    top: 10
  },
  menuText: {
    color: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  backgroundImage: {
    width: '100%',
    minHeight: 300, // Reduced from 400 to 300
    marginTop: 20, // Reduced from 30 to 20 for tighter spacing
  },
  imageStyle: {
    // borderRadius: 12,
  },
  overlay: {
    flex: 1,
    padding: 12, // Reduced from 16 to 12
    borderRadius: 12,
  },
  overlayHeader: {
    marginBottom: 12, // Reduced from 20 to 12
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#333',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontSize: 18, // Reduced from 20 to 18
  },
  accountContainer: {
    padding: 12, // Reduced from 16 to 12
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8, // Reduced from 10 to 8
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 4, // Reduced from 5 to 4
  },
  headerText: {
    color: '#666',
    fontSize: 13, // Reduced from 14 to 13
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8, // Reduced from 10 to 8
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
  },
  descriptionText: {
    color: '#333',
    flex: 1,
    fontSize: 11, // Reduced from 12 to 11
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  debitSymbol: {
    color: '#666',
    fontSize: 10, // Reduced from 11 to 10
    marginRight: 2,
  },
  amountText: {
    color: '#333',
    textAlign: 'right',
    fontSize: 11, // Reduced from 12 to 11
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  closingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingVertical: 8, // Reduced from 12 to 8
    // borderTopWidth: 2,
    // borderTopColor: '#ccc',
    // marginTop: 8, // Reduced from 10 to 8
    // borderRadius: 8,
    // paddingHorizontal: 8, // Reduced from 12 to 8
  },
  closingLabel: {
    color: '#333',
    fontSize: 13, // Reduced from 14 to 13
    fontFamily: 'PlusJakartaSans-SemiBold',
    left:5,
    top:8
  },
  closingAmount: {
    color: '#4A90E2',
    fontSize: 13, // Reduced from 14 to 13
    fontFamily: 'PlusJakartaSans-SemiBold',
    top:8
  },
  ageWiseCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  ageText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'PlusJakartaSans-SemiBold',
    textAlign: 'left',
    marginBottom: 10,
  },
  line: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 15,
  },
  creditDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  creditDaysText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  creditDaysValue: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 26,
    backgroundColor: '#e6f0ff',
    borderTopLeftRadius: 11,
    borderBottomLeftRadius: 11,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    backgroundColor: '#3E89EC',
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  labelBadge: {
    backgroundColor: "#7EB5FE",
    borderWidth: 1,
    borderColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    height: 25,
    right:8,
    justifyContent: 'center',
  },
  progressLabelText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10,
    color: "#fff",
  },
  amountContainerInside: {
    position: "absolute",
    right: 8,
    top: 0,
    height: '100%',
    justifyContent: "center",
    alignItems: "flex-end",
  },
  progressAmountInside: {
    fontSize: 12,
    fontFamily: "PlusJakartaSans-SemiBold",
    fontWeight: "600",
    color: "#000",
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  smallCard: {
    width: 100,
    height: 110,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediumCard: {
    flex: 1,
    height: 110,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'flex-start',
  },
  cardTitle: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'PlusJakartaSans-SemiBold',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#000',
  },
  productRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  productTag: {
    backgroundColor: '#E6F0FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#333',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
});

export default AccountDetails;