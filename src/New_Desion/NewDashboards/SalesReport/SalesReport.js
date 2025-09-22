
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ImageBackground, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  runOnJS 
} from 'react-native-reanimated';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {faArrowLeft, faSearch, faClock, faMoneyBill, faCreditCard, faTruck, faBox } from '@fortawesome/free-solid-svg-icons';
import GlobalStyle from '../../../components/common/GlobalStyle';
import { useNavigation } from '@react-navigation/native';

// Import the TopCards component
import TopCards from './TopCards';

const SalesReport = () => {
  const translateY = useSharedValue(0);
  const topCardsOpacity = useSharedValue(1);
  const expandedOpacity = useSharedValue(0);
  const [activeTab, setActiveTab] = useState('cashSales');
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const navigation = useNavigation();

  // Data arrays for mapping
  const cashSalesData = [
    { id: 1, method: 'Google Pay', transactions: 200, amount: 200000 },
    { id: 2, method: 'HDFC Bank', transactions: 100, amount: 100000 },
    { id: 3, method: 'IDBI Bank', transactions: 75, amount: 75000 },
    { id: 4, method: 'Google Pay', transactions: 200, amount: 200000 },
    { id: 5, method: 'HDFC Bank', transactions: 100, amount: 100000 },
    { id: 6, method: 'IDBI Bank', transactions: 75, amount: 75000 },
    { id: 7, method: 'Google Pay', transactions: 200, amount: 200000 },
    { id: 8, method: 'HDFC Bank', transactions: 100, amount: 100000 },
    { id: 9, method: 'IDBI Bank', transactions: 75, amount: 75000 },
  ];

  const productData = [
    { 
      id: 1, 
      name: 'M.Sand', 
      time: '08.40.A.M', 
      tons: 200, 
      trips: 20, 
      amount: 200000
    },
    { 
      id: 2, 
      name: 'P.Sand', 
      time: '10.20.A.M', 
      tons: 300, 
      trips: 10, 
      amount: 122476
    },
    { 
      id: 3, 
      name: '20 MM', 
      time: '02.33.P.M', 
      tons: 400, 
      trips: 18, 
      amount: 440789
    },
     { 
      id: 4, 
      name: '20 MM', 
      time: '02.33.P.M', 
      tons: 400, 
      trips: 18, 
      amount: 440789
    },
     { 
      id: 5, 
      name: '20 MM', 
      time: '02.33.P.M', 
      tons: 400, 
      trips: 18, 
      amount: 440789
    },
     { 
      id: 6, 
      name: '20 MM', 
      time: '02.33.P.M', 
      tons: 400, 
      trips: 18, 
      amount: 440789
    },
     { 
      id: 7, 
      name: '20 MM', 
      time: '02.33.P.M', 
      tons: 400, 
      trips: 18, 
      amount: 440789
    },
     { 
      id: 8, 
      name: '20 MM', 
      time: '02.33.P.M', 
      tons: 400, 
      trips: 18, 
      amount: 440789
    },
     { 
      id: 9, 
      name: '20 MM', 
      time: '02.33.P.M', 
      tons: 400, 
      trips: 18, 
      amount: 440789
    },
     { 
      id: 10, 
      name: '20 MM', 
      time: '02.33.P.M', 
      tons: 400, 
      trips: 18, 
      amount: 440789
    },
    { 
      id: 11, 
      name: 'M.Sand', 
      time: '08.40.A.M', 
      tons: 200, 
      trips: 20, 
      amount: 200000
    },
    { 
      id: 12, 
      name: 'P.Sand', 
      time: '10.20.A.M', 
      tons: 300, 
      trips: 10, 
      amount: 122476
    }
  ];

  // Icon components
  const WeightIcon = () => (
    <Image 
      source={require('../../../images/weight.png')} 
      style={styles.imageIcon} 
      resizeMode="contain"
    />
  );

  const TruckIcon = () => (
    <Image 
      source={require('../../../images/trip.png')} 
      style={styles.imageIcon} 
      resizeMode="contain"
    />
  );

  const SearchIcon = () => (
    <FontAwesomeIcon 
      icon={faSearch} 
      size={20} 
      color="#ffffffff" 
    />
  );

  const ClockIcon = () => (
    <FontAwesomeIcon 
      icon={faClock} 
      size={20} 
      color="#666" 
    />
  );

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (event, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      const newTranslateY = context.startY + event.translationY;
      
      if (newTranslateY <= 0 && newTranslateY >= -200) {
        translateY.value = newTranslateY;
        
        // Animate TopCards opacity based on sheet position
        topCardsOpacity.value = interpolate(newTranslateY, [0, -110], [1, 0], 'clamp');
        expandedOpacity.value = interpolate(newTranslateY, [0, -110], [0, 1], 'clamp');
      }
    },
    onEnd: (event) => {
      const velocity = event.velocityY;
      
      if (translateY.value > -50) {
        // Collapse - fade in TopCards
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 100
        });
        topCardsOpacity.value = withSpring(1, {
          damping: 15,
          stiffness: 100
        });
        expandedOpacity.value = withSpring(0, {
          damping: 15,
          stiffness: 100
        });
      } else if (translateY.value <= -50 && translateY.value > -100) {
        if (velocity > 500) {
          // Collapse - fade in TopCards
          translateY.value = withSpring(0, {
            damping: 15,
            stiffness: 100
          });
          topCardsOpacity.value = withSpring(1, {
            damping: 15,
            stiffness: 100
          });
          expandedOpacity.value = withSpring(0, {
            damping: 15,
            stiffness: 100
          });
        } else {
          // Expand - fade out TopCards
          translateY.value = withSpring(-130, {
            damping: 15,
            stiffness: 100
          });
          topCardsOpacity.value = withSpring(0, {
            damping: 15,
            stiffness: 100
          });
          expandedOpacity.value = withSpring(1, {
            damping: 15,
            stiffness: 100
          });
        }
      } else {
        // Expand - fade out TopCards
        translateY.value = withSpring(-130, {
          damping: 15,
          stiffness: 100
        });
        topCardsOpacity.value = withSpring(0, {
          damping: 15,
          stiffness: 100
        });
        expandedOpacity.value = withSpring(1, {
          damping: 15,
          stiffness: 100
        });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const topCardsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: topCardsOpacity.value,
    };
  });

  const expandedAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: expandedOpacity.value,
    };
  });

  const renderCashSalesDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Cash Sales Detail</Text>
      
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 500 }}
        nestedScrollEnabled={true}
      >
        {cashSalesData.map((payment) => (
          <View key={`cash-${payment.id}`} style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentMethod}>{payment.method}</Text>
            </View>
            <View style={styles.paymentDetails}>
              <View style={styles.iconTextContainer}>
                <WeightIcon />
                <Text style={styles.detailText}>No. of Times {payment.transactions}</Text>
              </View>
              <Text style={styles.amount}>₹{payment.amount.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderProductDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Product Details</Text>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchPlaceholder}>Search by product name</Text>
          <View style={styles.searchIconWrapper}>
            <SearchIcon />
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 500 }}
        nestedScrollEnabled={true}
      >
        {productData.map((product, index) => (
          <View key={`product-${product.id}-${index}`} style={styles.productCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.timeContainer}>
                <Text style={styles.productTime}>{product.time}</Text>
                <View style={styles.clockIconWrapper}>
                  <ClockIcon />
                </View>
              </View>
            </View>
            <View style={styles.productDetails}>
              <View style={styles.iconTextContainer}>
                <WeightIcon />
                <Text style={styles.productDetail}>TON {product.tons}</Text>
              </View>
              <View style={styles.iconTextContainer}>
                <TruckIcon />
                <Text style={styles.productDetail}>Trip {product.trips}</Text>
              </View>
              <Text style={styles.productAmount}>₹{product.amount.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderExpandedCards = () => {
    const metricsDataExpanded = [
      {
        id: 1,
        value: '2,00,000',
        label: 'Cash Sales',
        icon: faMoneyBill
      },
      {
        id: 2,
        value: '1,04,000',
        label: 'Credit Sales',
        icon: faCreditCard
      },
      {
        id: 3,
        value: '40',
        label: 'Total Trip',
        icon: faTruck
      },
      {
        id: 4,
        value: '400',
        label: 'Total Metric TON',
        icon: faBox
      }
    ];

    return (
      <View style={styles.expandedContainer}>
        <ScrollView style={styles.expandedScrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.metricsCardContainer}>
            <View style={styles.metricsRow}>
              {metricsDataExpanded.slice(0, 2).map((metric, index) => (
                <View key={metric.id} style={styles.metricItem}>
                  <View style={styles.metricsCard}>
                    <View style={styles.metricCardContent}>
                      <View style={styles.metricContent}>
                        <Text style={styles.metricLabel}>{metric.label}</Text>
                        <Text style={styles.metricValue}>{metric.value}</Text>
                      </View>
                      <View style={styles.metricIconContainer}>
                        <FontAwesomeIcon
                          icon={metric.icon}
                          size={20}
                          color="#4A90E2"
                        />
                      </View>
                    </View>
                  </View>
                  {index < 1 && <View style={styles.metricDivider} />}
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.metricsCardContainer, { marginTop: 0, }]}>
            <View style={styles.metricsRow}>
              {metricsDataExpanded.slice(2, 4).map((metric, index) => (
                <View key={metric.id} style={styles.metricItem}>
                  <View style={styles.metricsCard}>
                    <View style={styles.metricCardContent}>
                      <View style={styles.metricContent}>
                        <Text style={styles.metricLabel}>{metric.label}</Text>
                        <Text style={styles.metricValue}>{metric.value}</Text>
                      </View>
                      <View style={styles.metricIconContainer}>
                        <FontAwesomeIcon
                          icon={metric.icon}
                          size={20}
                          color="#4A90E2"
                        />
                      </View>
                    </View>
                  </View>
                  {index < 1 && <View style={styles.metricDivider} />}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground 
        source={require('../../../images/22.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <View style={styles.leftsection}>
            <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
            </TouchableOpacity>
            <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Sales Report</Text>
          </View>
          <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuVisible(true)}>
            <Text style={styles.menuText}>Menu</Text>
          </TouchableOpacity>
        </View>
        
        {/* Collapsed TopCards - Clean fade only */}
        <Animated.View style={[styles.topCardsContainer, topCardsAnimatedStyle]}>
          <TopCards />
        </Animated.View>

        {/* Expanded four cards - Clean fade in */}
        <Animated.View style={[styles.topCardsContainer, expandedAnimatedStyle]}>
          {renderExpandedCards()}
        </Animated.View>
        
        <Animated.View style={[styles.vehicleWrapper, animatedStyle]}>
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <Animated.View style={styles.dragBarContainer}>
              <View style={styles.dragHandle} />
            </Animated.View>
          </PanGestureHandler>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'cashSales' && styles.activeTab]}
              onPress={() => setActiveTab('cashSales')}
            >
              <Text style={[styles.tabText, activeTab === 'cashSales' && styles.activeTabText]}>
                Cash sales
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'product' && styles.activeTab]}
              onPress={() => setActiveTab('product')}
            >
              <Text style={[styles.tabText, activeTab === 'product' && styles.activeTabText]}>
                Product
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentContainer}>
            {activeTab === 'cashSales' ? renderCashSalesDetails() : renderProductDetails()}
          </View>
        </Animated.View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    bottom: 60
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 15, 
    marginTop: 30,
    paddingTop: 60,
    zIndex: 10,
  },
  leftsection: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  headerTitle: { 
    marginLeft: 20 
  },
  menuButton: { 
    backgroundColor: '#333', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 16 
  },
  menuText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '500' 
  },
  // TopCards container - Clean fade only
  topCardsContainer: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    zIndex: 3,
    // No elevation here to prevent shadow issues during fade
  },
  vehicleWrapper: { 
    backgroundColor: '#fff', 
    padding: 10, 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    elevation: 5, 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 470,
    height: '100%',
    zIndex: 5,
  },
  dragBarContainer: { 
    paddingVertical: 16, 
    paddingHorizontal: 4, 
    alignItems: 'center',
    minHeight: 50,
    backgroundColor: 'transparent',
  },
  dragHandle: { 
    width: 40, 
    height: 4, 
    backgroundColor: '#999', 
    borderRadius: 2, 
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    
  },
  detailsContainer: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  imageIcon: {
    width: 12,
    height: 12,
    marginRight: 6,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  paymentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  paymentHeader: {
    marginBottom: 8,
  },
  paymentMethod: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    padding: 12,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  searchIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#468ee1ff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#289bffff',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  productCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productTime: {
    fontSize: 12,
    color: '#999',
    marginRight: 6,
  },
  clockIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDetail: {
    fontSize: 12,
    color: '#666',
  },
  productAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  // Copied styles for expanded cards (metrics)
  expandedContainer: {
    flex: 1,
  },
  expandedScrollContainer: {
    flex: 1,
    height: '100%',
  },
  metricsCardContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  metricsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
    top:20,
    bottom: 0, // Adjusted for expanded view (no overlap needed)
  },
  metricCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    height: '100%',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  metricItem: {
    flex: 1,
    position: 'relative',
  },
  metricContent: {
    alignItems: 'flex-start',
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: -4,
    zIndex: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  metricIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 24,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  metricDivider: {
    position: 'absolute',
    right: 0,
    width: 1,
    height: '60%',
    top: '20%',
    zIndex: 1,
  },
});

export default SalesReport;