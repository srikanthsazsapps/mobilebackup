import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ImageBackground, TouchableOpacity, ScrollView, Image, TextInput, Keyboard, Dimensions } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedGestureHandler, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faSearch, faClock, faMoneyBill, faCreditCard, faTruck, faBox, faFilter } from '@fortawesome/free-solid-svg-icons';
import GlobalStyle from '../../../components/common/GlobalStyle';
import { useNavigation } from '@react-navigation/native';
import { SalesDataContext } from '../../../QuarryAdmin/DashBoards/SalesDataContext';
import TopCards from './TopCards';
import DateFilter from './DateFilter';

const SalesReport = () => {
  const { salesSummary, products, additionalData, error } = useContext(SalesDataContext);
  const translateY = useSharedValue(0);
  const topCardsOpacity = useSharedValue(1);
  const expandedOpacity = useSharedValue(0);
  const [activeTab, setActiveTab] = useState('cashSales');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const navigation = useNavigation();
  const inputRef = useRef(null);

  const screenHeight = Dimensions.get('window').height;
  const screenWidth = Dimensions.get('window').width;

  // Track whether search is active to prevent keyboard animation override
  const isSearchActive = useRef(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      if (!isSearchActive.current) {
        translateY.value = withSpring(-e.endCoordinates.height - 50, {
          damping: 15,
          stiffness: 100,
        });
        topCardsOpacity.value = withSpring(0, { damping: 15, stiffness: 100 });
        expandedOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
      }
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      isSearchActive.current = false;
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      topCardsOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
      expandedOpacity.value = withSpring(0, { damping: 15, stiffness: 100 });
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [translateY, topCardsOpacity, expandedOpacity]);

  const handleSearch = () => {
    isSearchActive.current = true;
    translateY.value = withSpring(-keyboardHeight - 50 || -250, {
      damping: 15,
      stiffness: 100,
    });
    topCardsOpacity.value = withSpring(0, { damping: 15, stiffness: 100 });
    expandedOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  console.log('SalesReport - Additional Data:', JSON.stringify(additionalData, null, 2));
  console.log('SalesReport - Products Data:', JSON.stringify(products, null, 2));

  const cashSalesData = salesSummary
    ? [
        { id: 1, method: 'Cash Sales', transactions: salesSummary.TotalCashCount || 0, amount: parseFloat(salesSummary.TotalCashSales) || 0 },
        { id: 2, method: 'Credit Sales', transactions: salesSummary.TotalCreditCount || 0, amount: parseFloat(salesSummary.TotalCreditSales) || 0 },
      ]
    : [];

  const productData = products.map((product, index) => {
    const trips = product.Trips !== undefined ? parseInt(product.Trips, 10) : 0;
    console.log(`Product Mapping - ${product.ProductName || 'Unknown'}: Trips=${product.Trips}, Parsed Trips=${trips}`);
    return {
      id: product.id || index + 1,
      name: product.ProductName || 'Unknown Product',
      time: product.Time || 'N/A',
      tons: product.TotalNetWeight !== undefined ? parseFloat(product.TotalNetWeight) || 0 : 0,
      trips: trips,
      amount: parseFloat(product.TotalNetAmount) || 0,
    };
  });

  const filteredProductData = productData.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const WeightIcon = () => (
    <Image source={require('../../../images/weight.png')} style={styles.imageIcon} resizeMode="contain" />
  );

  const TruckIcon = () => (
    <Image source={require('../../../images/trip.png')} style={styles.imageIcon} resizeMode="contain" />
  );

  const SearchIcon = () => (
    <FontAwesomeIcon icon={faSearch} size={20} color="#ffffffff" />
  );

  const ClockIcon = () => (
    <FontAwesomeIcon icon={faClock} size={20} color="#666" />
  );

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (event, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      const newTranslateY = context.startY + event.translationY;
      if (!keyboardHeight && newTranslateY <= 0 && newTranslateY >= -200) {
        translateY.value = newTranslateY;
        topCardsOpacity.value = interpolate(newTranslateY, [0, -110], [1, 0], 'clamp');
        expandedOpacity.value = interpolate(newTranslateY, [0, -110], [0, 1], 'clamp');
      }
    },
    onEnd: (event) => {
      const velocity = event.velocityY;
      if (!keyboardHeight) {
        if (translateY.value > -50) {
          translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
          topCardsOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
          expandedOpacity.value = withSpring(0, { damping: 15, stiffness: 100 });
        } else if (translateY.value <= -50 && translateY.value > -100) {
          if (velocity > 500) {
            translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
            topCardsOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
            expandedOpacity.value = withSpring(0, { damping: 15, stiffness: 100 });
          } else {
            translateY.value = withSpring(-130, { damping: 15, stiffness: 100 });
            topCardsOpacity.value = withSpring(0, { damping: 15, stiffness: 100 });
            expandedOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
          }
        } else {
          translateY.value = withSpring(-130, { damping: 15, stiffness: 100 });
          topCardsOpacity.value = withSpring(0, { damping: 15, stiffness: 100 });
          expandedOpacity.value = withSpring(1, { damping: 15, stiffness: 100 });
        }
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const topCardsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: topCardsOpacity.value,
  }));

  const expandedAnimatedStyle = useAnimatedStyle(() => ({
    opacity: expandedOpacity.value,
  }));

  const renderCashSalesDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Cash Sales Detail</Text>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 500 }} nestedScrollEnabled={true}>
        {additionalData.length > 0 ? (
          additionalData.map((item) => (
            <View key={`additional-${item.id}`} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <Text style={styles.paymentMethod}>{item.Head}</Text>
              </View>
              <View style={styles.paymentDetails}>
                <View style={styles.iconTextContainer}>
                  <WeightIcon />
                  <Text style={styles.detailText}>No. of Times {item.Cnt}</Text>
                </View>
                <Text style={styles.amount}>{item.Val}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>No additional data available</Text>
        )}
      </ScrollView>
    </View>
  );

  const renderProductDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.sectionTitle}>Product Details</Text>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            ref={inputRef}
            style={[GlobalStyle.H12, styles.searchInput]}
            placeholder="Search by product name"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onTouchStart={(e) => e.stopPropagation()}
            onStartShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <FontAwesomeIcon icon={faSearch} size={15} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 500 }} nestedScrollEnabled={true}>
        {filteredProductData.length > 0 ? (
          filteredProductData.map((product, index) => {
            console.log(`Rendering Product - ${product.name}: Trips=${product.trips}`);
            return (
              <View key={`product-${product.id}-${index}`} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
                </View>
                <View style={styles.productDetails}>
                  <View style={styles.iconTextContainer}>
                    <WeightIcon />
                    <Text style={styles.productDetail}>
                      TON {product.tons !== undefined ? product.tons.toFixed(2) : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.iconTextContainer}>
                    <TruckIcon />
                    <Text style={styles.productDetail}>
                      Trip {product.trips !== undefined ? product.trips : 'N/A'}
                    </Text>
                  </View>
                  <Text style={styles.productAmount}>₹{product.amount.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noDataText}>No products found</Text>
        )}
      </ScrollView>
    </View>
  );

  const renderExpandedCards = () => {
    const metricsDataExpanded = salesSummary
      ? [
          { id: 1, value: parseFloat(salesSummary.TotalCashSales)?.toLocaleString('en-IN') || '0', label: 'Cash Sales', image: require('../../../images/cashsales.png') },
          { id: 2, value: parseFloat(salesSummary.TotalCreditSales)?.toLocaleString('en-IN') || '0', label: 'Credit Sales', image: require('../../../images/creditsales.png') },
          { id: 3, value: salesSummary.TotalTrips?.toLocaleString('en-IN') || '0', label: 'Total Trip', image: require('../../../images/totaltrip.png') },
          { id: 4, value: parseFloat(salesSummary.TotalMT)?.toLocaleString('en-IN') || '0', label: 'Total Metric TON', image: require('../../../images/metricton.png') },
        ]
      : [
          { id: 1, value: '0', label: 'Cash Sales', image: require('../../../images/cashsales.png') },
          { id: 2, value: '0', label: 'Credit Sales', image: require('../../../images/creditsales.png') },
          { id: 3, value: '0', label: 'Total Trip', image: require('../../../images/totaltrip.png') },
          { id: 4, value: '0', label: 'Total Metric TON', image: require('../../../images/metricton.png') },
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
                        <Image
                          source={metric.image}
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            zIndex: 1,
                            left: 50,
                            opacity: 0.9,
                            top: 10,
                            resizeMode: 'contain',
                          }}
                        />
                        <View style={{ zIndex: 2 }}>
                          <Text style={styles.metricLabel}>{metric.label}</Text>
                          <Text style={styles.metricValue}>{metric.value}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {index < 1 && <View style={styles.metricDivider} />}
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.metricsCardContainer, { marginTop: 0 }]}>
            <View style={styles.metricsRow}>
              {metricsDataExpanded.slice(2, 4).map((metric, index) => (
                <View key={metric.id} style={styles.metricItem}>
                  <View style={styles.metricsCard}>
                    <View style={styles.metricCardContent}>
                      <View style={styles.metricContent}>
                        <Image
                          source={metric.image}
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            zIndex: 1,
                            top: 10,
                            opacity: 0.9,
                            resizeMode: 'contain',
                            left: 50,
                          }}
                        />
                        <View style={{ zIndex: 2 }}>
                          <Text style={styles.metricLabel}>{metric.label}</Text>
                          <Text style={styles.metricValue}>{metric.value}</Text>
                        </View>
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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noDataText}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <ImageBackground
          // source={require('../../../images/22.png')}
          style={[styles.backgroundImage, { width: screenWidth, height: screenHeight }]}
          resizeMode="cover"
          imageStyle={styles.backgroundImageStyle}
        />
      </View>

      <SafeAreaView style={styles.safeAreaContent}>
        <View style={styles.header}>
          <View style={styles.leftsection}>
            <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
            </TouchableOpacity>
            <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Sales Report</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <DateFilter dashboardType="Sales" onFilterChange={(filter) => setSelectedTimeFilter(filter)} />
            <TouchableOpacity style={styles.menuButton} onPress={() => {}}>
              <Text style={styles.menuText}>Menu</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Animated.View style={[styles.topCardsContainer, topCardsAnimatedStyle]}>
          <TopCards />
        </Animated.View>

        <Animated.View style={[styles.topCardsContainer, expandedAnimatedStyle]}>
          {renderExpandedCards()}
        </Animated.View>

        <Animated.View style={[styles.vehicleWrapper, animatedStyle, keyboardHeight > 0 && styles.keyboardActiveWrapper]}>
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
              <Text style={[styles.tabText, activeTab === 'cashSales' && styles.activeTabText]}>Cash sales</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'product' && styles.activeTab]}
              onPress={() => setActiveTab('product')}
            >
              <Text style={[styles.tabText, activeTab === 'product' && styles.activeTabText]}>Product</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contentContainer}>
            {activeTab === 'cashSales' ? renderCashSalesDetails() : renderProductDetails()}
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    bottom: 60,
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  backgroundImageStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  safeAreaContent: {
    flex: 1,
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
  leftsection: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { marginLeft: 20, fontFamily: 'PlusJakartaSans' },
  menuButton: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginLeft: 10 },
  menuText: { color: '#fff', fontSize: 12, fontWeight: '500', fontFamily: 'PlusJakartaSans' },
  topCardsContainer: { position: 'absolute', top: 120, left: 0, right: 0, zIndex: 3 },
  vehicleWrapper: {
    backgroundColor: '#fff',
    padding: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 460,
    height: '100%',
    zIndex: 5,
  },
  keyboardActiveWrapper: {
    // Additional styles when keyboard is active if needed
  },
  dragBarContainer: { paddingVertical: 16, paddingHorizontal: 4, alignItems: 'center', minHeight: 50, backgroundColor: 'transparent' },
  dragHandle: { width: 40, height: 4, backgroundColor: '#999', borderRadius: 2, marginBottom: 12 },
  tabContainer: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20, backgroundColor: '#f5f5f5', borderRadius: 25, padding: 4 },
  tabButton: { flex: 1, paddingVertical: 12, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  activeTab: { backgroundColor: '#4A90E2' },
  tabText: { fontSize: 16, fontWeight: '500', color: '#666', fontFamily: 'PlusJakartaSans' },
  activeTabText: { color: '#fff', fontFamily: 'PlusJakartaSans' },
  contentContainer: { flex: 1, paddingHorizontal: 16 },
  detailsContainer: { flex: 1 },
  scrollContent: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#333', fontFamily: 'PlusJakartaSans' },
  imageIcon: { width: 12, height: 12, marginRight: 6 },
  iconTextContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  paymentCard: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#4A90E2' },
  paymentHeader: { marginBottom: 8 },
  paymentMethod: { fontSize: 16, fontWeight: '600', color: '#333', fontFamily: 'PlusJakartaSans' },
  paymentDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailText: { fontSize: 14, color: '#666', fontFamily: 'PlusJakartaSans' },
  amount: { fontSize: 16, fontWeight: 'bold', color: '#333', fontFamily: 'PlusJakartaSans' },
  searchContainer: { backgroundColor: '#f5f5f5', borderRadius: 25, padding: 5, marginBottom: 20 },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  searchInput: { fontSize: 14, color: '#333', flex: 1, paddingHorizontal: 15, paddingVertical: 8, fontFamily: 'PlusJakartaSans' },
  searchButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#468ee1ff', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#289bffff', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  productCard: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#4A90E2' },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  productName: { fontSize: 16, fontWeight: '600', color: '#333', fontFamily: 'PlusJakartaSans' },
  timeContainer: { flexDirection: 'row', alignItems: 'center' },
  productTime: { fontSize: 12, color: '#999', marginRight: 6, fontFamily: 'PlusJakartaSans' },
  clockIconWrapper: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  productDetails: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productDetail: { fontSize: 12, color: '#666', fontFamily: 'PlusJakartaSans' },
  productAmount: { fontSize: 14, fontWeight: 'bold', color: '#333', fontFamily: 'PlusJakartaSans' },
  expandedContainer: { flex: 1 },
  expandedScrollContainer: { flex: 1, height: '100%' },
  metricsCardContainer: { paddingHorizontal: 16, marginBottom: 20 },
  metricsCard: { backgroundColor: '#fff', borderRadius: 16, flex: 1, marginHorizontal: 4, top: 20, bottom: 0, height: 80 },
  metricCardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, height: '100%' },
  metricsRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  metricItem: { flex: 1, position: 'relative' },
  metricContent: { alignItems: 'flex-start', flex: 1, position: 'relative' },
  metricLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: -4, zIndex: 2, fontFamily: 'PlusJakartaSans' },
  metricValue: { fontSize: 16, fontWeight: 'bold', color: '#333', zIndex: 2, fontFamily: 'PlusJakartaSans' },
  metricDivider: { position: 'absolute', right: 0, width: 1, height: '60%', top: '20%', zIndex: 1 },
  noDataText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20, fontFamily: 'PlusJakartaSans' },
});

export default SalesReport;