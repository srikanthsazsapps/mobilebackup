import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TextInput
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { debounce } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import NetworkStatusIndicator from '../../NetworkStatusIndicator';
import GlobalStyle from '../../../components/common/GlobalStyle';
import SalesPieChart from './SalesPieChart';

const { width, height,height: screenHeight } = Dimensions.get('window');

// Define EnhancedDataCard as a standalone component
const EnhancedDataCard = ({ item }) => {
  console.log('Rendering EnhancedDataCard for item:', item); // Debug log
  return (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        <View style={styles.productInfo}>
          <View style={styles.amountContainer}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <Text style={styles.amount}>{item.amount}</Text>
          </View>
          <View style={styles.line} />
          <View style={styles.productDetails}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Trip</Text>
              <Text style={styles.detailValue}>: {item.trip}</Text>
            </View>
            <View style={styles.detailItems}>
              <Text style={styles.detailLabelTon}>Ton</Text>
              <Text style={styles.detailValueTon}>: {item.ton}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const ScrollableReportsComponent = React.memo(({ 
  onScrollToTop,
  isExpanded,
  containerGestureRef,
  selectedFilter,
  setSelectedCategory
}) => {
  const [scrollViewRef, setScrollViewRef] = React.useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedData, setSelectedData] = useState('Daybook');
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [selectedTab, setSelectedTab] = useState("Customer Wise");
  const [activeTab, setActiveTab] = useState('Customer Wise');

  const incomeData = [
    { 
      id: 1, 
      name: "M.Sand", 
      amount: "2,00,000", 
      avatar: "M",
      trip: "20",
      ton: "300",
      time: "09:10 AM"
    },
    { 
      id: 2, 
      name: "P.Sand", 
      amount: "1,50,000", 
      avatar: "P",
      trip: "15",
      ton: "225",
      time: "12:45 PM"
    },
    { 
      id: 3, 
      name: "Cement", 
      amount: "3,00,000", 
      avatar: "C",
      trip: "25",
      ton: "500",
      time: "02:30 PM"
    },
    { 
      id: 4, 
      name: "Cement", 
      amount: "3,00,000", 
      avatar: "C",
      trip: "25",
      ton: "500",
      time: "02:30 PM"
    },
    { 
      id: 5, 
      name: "Cement", 
      amount: "3,00,000", 
      avatar: "C",
      trip: "25",
      ton: "500",
      time: "02:30 PM"
    },
    { 
      id: 6, 
      name: "Cement", 
      amount: "3,00,000", 
      avatar: "C",
      trip: "25",
      ton: "500",
      time: "02:30 PM"
    },
    { 
      id: 7, 
      name: "Cement", 
      amount: "3,00,000", 
      avatar: "C",
      trip: "25",
      ton: "500",
      time: "02:30 PM"
    },
    { 
      id: 8, 
      name: "Cement", 
      amount: "3,00,000", 
      avatar: "C",
      trip: "25",
      ton: "500",
      time: "02:30 PM"
    },
  ];

  const expenseData = [
    { 
      id: 1, 
      name: "Fuel Cost", 
      amount: "50,000", 
      avatar: "F",
      trip: "30",
      ton: "0",
      time: "08:05 AM"
    },
    { 
      id: 2, 
      name: "Maintenance", 
      amount: "25,000", 
      avatar: "M",
      trip: "0",
      ton: "0",
      time: "10:02 AM"
    },
  ];

  const dataToShow = selectedTab === "Customer Wise" ? incomeData : expenseData;
  console.log('dataToShow:', dataToShow); // Debug log to verify data

  const handleScroll = useCallback((event) => {
    const { contentOffset } = event.nativeEvent;
    if (contentOffset.y <= 5 && isExpanded.value) {
      onScrollToTop();
    }
  }, [isExpanded, onScrollToTop]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#FF9800';
      case 'pending':
        return '#2196F3';
      default:
        return '#757575';
    }
  }, []);

  const toggleExpand = useCallback((id) => {
    setExpandedItemId((prev) => (prev === id ? null : id));
  }, []);

  const handleFilterChange = useCallback(
    debounce((filter) => {
      setSelectedData(filter);
      setSelectedCategory(filter);
    }, 200),
    [setSelectedCategory]
  );

  return (
    <View style={styles.scrollableReportsContainer}>
      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[
            styles.switchButton,
            activeTab === 'Customer Wise' && styles.activeSwitchButton,
          ]}
          onPress={() => setActiveTab('Customer Wise')}
        >
          <Text
            style={[
              styles.switchButtonText,
              activeTab === 'Customer Wise' && styles.activeSwitchButtonText,
            ]}
          >
            Customer Wise
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.switchButton,
            activeTab === 'Product Wise' && styles.activeSwitchButton,
          ]}
          onPress={() => setActiveTab('Product Wise')}
        >
          <Text
            style={[
              styles.switchButtonText,
              activeTab === 'Product Wise' && styles.activeSwitchButtonText,
            ]}
          >
            Product Wise
          </Text>
        </TouchableOpacity>
      </View>
            <Text style={styles.switchText}>{activeTab === 'Customer Wise' ? 'Customer wise details' : 'Product wise details'}</Text>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <FontAwesomeIcon icon={faSearch} size={16} color="#ccc" style={styles.searchIcon} />
        </View>
        <View style={styles.scrollableContainer}>
          <ScrollView 
            style={styles.dataScrollView}
            showsVerticalScrollIndicator={true} // Show scroll indicator for debugging
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ref={scrollViewRef}
          >
            {dataToShow.length > 0 ? (
              dataToShow.map((item) => (
                <EnhancedDataCard key={item.id} item={item} />
              ))
            ) : (
              <Text style={styles.noDataText}>No data available</Text> // Fallback UI
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
});

const SalesMain = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [selectedCategory, setSelectedCategory] = useState('Daybook');
  const translateY = useSharedValue(0);
  const isExpanded = useSharedValue(false);
  const chartTransition = useSharedValue(0);

  const chartData = {
    daybook: 30,
    stock: 25,
    cancelledBill: 20,
    anpr: 25,
  };

  const containerGestureRef = useRef();

  const COLLAPSED_HEIGHT = height * 0.7;
  const EXPANDED_HEIGHT = height * 0.95;
  const COLLAPSED_TRANSLATE = 0;
  const EXPANDED_TRANSLATE = -height * 0.15;

  const animatedStyle = useAnimatedStyle(() => {
    const progress = Math.abs(translateY.value) / Math.abs(EXPANDED_TRANSLATE);
    const currentHeight = COLLAPSED_HEIGHT + (EXPANDED_HEIGHT - COLLAPSED_HEIGHT) * progress;

    return {
      transform: [{ translateY: translateY.value }],
      height: currentHeight,
    };
  });

  const containerGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
      ctx.startTime = Date.now();
    },
    onActive: (event, ctx) => {
      const isVerticalGesture = Math.abs(event.translationY) > Math.abs(event.translationX) * 1.5;
      const isSignificantMovement = Math.abs(event.translationY) > 15;
      
      if (isVerticalGesture && isSignificantMovement) {
        const newTranslateY = ctx.startY + event.translationY;
        if (newTranslateY <= COLLAPSED_TRANSLATE && newTranslateY >= EXPANDED_TRANSLATE) {
          translateY.value = newTranslateY;
        }
      }
    },
    onEnd: (event, ctx) => {
      const isVerticalGesture = Math.abs(event.translationY) > Math.abs(event.translationX) * 1.5;
      const isSignificantMovement = Math.abs(event.translationY) > 30;
      const isFastGesture = Math.abs(event.velocityY) > 600;
      
      if ((isVerticalGesture && isSignificantMovement) || isFastGesture) {
        const velocityThreshold = -600;
        const positionThreshold = EXPANDED_TRANSLATE / 1.8;

        const shouldExpand = event.velocityY < velocityThreshold || translateY.value < positionThreshold;

        if (shouldExpand) {
          translateY.value = withSpring(EXPANDED_TRANSLATE, {
            damping: 25,
            stiffness: 120,
            mass: 0.8,
            overshootClamping: true,
          });
          isExpanded.value = true;
          chartTransition.value = withSpring(1, {
            damping: 25,
            stiffness: 120,
            mass: 0.8,
            overshootClamping: true,
          });
        } else {
          translateY.value = withSpring(COLLAPSED_TRANSLATE, {
            damping: 25,
            stiffness: 120,
            mass: 0.8,
            overshootClamping: true,
          });
          isExpanded.value = false;
          chartTransition.value = withSpring(0, {
            damping: 25,
            stiffness: 120,
            mass: 0.8,
            overshootClamping: true,
          });
        }
      }
    }
  });

  const collapseContainer = useCallback(() => {
    translateY.value = withSpring(COLLAPSED_TRANSLATE, {
      damping: 25,
      stiffness: 120,
      mass: 0.8,
      overshootClamping: true,
    });
    isExpanded.value = false;
    chartTransition.value = withSpring(0, {
      damping: 25,
      stiffness: 120,
      mass: 0.8,
      overshootClamping: true,
    });
  }, [translateY, isExpanded, chartTransition]);

  const handleScrollToTop = useCallback(() => {
    collapseContainer();
  }, [collapseContainer]);

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
          </TouchableOpacity>
          <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Sales</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.filterContainer}>
          {['Today', 'Yesterday', 'Month', 'Custom'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <SalesPieChart
        selectedCategory={selectedCategory}
        data={chartData}
        chartTransition={chartTransition}
        isExpanded={isExpanded}
        productData={[
          {
            id: '1',
            name: 'EB Reading',
            amount: '800000',
            avatar: 'EB',
            trip: '5',
            ton: '100',
          },
          {
            id: '2',
            name: 'Diesel',
            amount: '200000',
            avatar: 'D',
            trip: '3',
            ton: '50',
          }
        ]}
      />

      <PanGestureHandler 
        ref={containerGestureRef}
        onGestureEvent={containerGestureHandler}
        simultaneousHandlers={[]}
        shouldCancelWhenOutside={false}
        activeOffsetY={[-15, 15]}
        failOffsetX={[-50, 50]}
      >
        <Animated.View style={[styles.rowContainer, animatedStyle]}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          <ScrollableReportsComponent
            onScrollToTop={handleScrollToTop}
            isExpanded={isExpanded}
            containerGestureRef={containerGestureRef}
            selectedFilter={selectedFilter}
            setSelectedCategory={setSelectedCategory}
          />
        </Animated.View>
      </PanGestureHandler>
    </SafeAreaView>
  );
};

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
  },
  content: {},
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 13,
    gap: 6,
    bottom: 5,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  rowContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    bottom: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    paddingTop: 10,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    zIndex: 1000,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    marginBottom: 4,
  },
  scrollableReportsContainer: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    height: 40,
    marginBottom: 10, // Adjusted spacing
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F6FA',
    borderRadius: 25,
    padding: 1,
    marginBottom: 5,
    alignSelf: 'center',
    width: 250,
    height: 40,
  },
  switchButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeSwitchButton: {
    backgroundColor: '#4D8FE6',
  },
  switchButtonText: {
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
  },
  activeSwitchButtonText: {
    color: '#FFF',
  },
  switchText: {
    fontSize: 15,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    left:30,
    top:10
  },
  scrollableContainer: {
    flex: 1,
    minHeight: 100, // Ensure ScrollView has minimum height
  },
  dataScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1, // Ensure content takes full space
  },
  productCard: {
     backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginHorizontal: 20,
    width:310,
    right:15
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#3E89EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: 'row',
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 2,
  },
  detailLabelTon: {
    fontSize: 14,
    color: '#666',
    marginRight: 2,
    left:13
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  detailValueTon: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    left:15
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rupeeSymbol: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: 'bold',
    marginRight: 2,
    left:25,
    bottom:4
  },
  amount: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: 'bold',
    textAlign:'right',
    left:25,
    bottom:4
  },
  line: {
    width: '100%',
    height: 0.3,
    backgroundColor: '#ccc',
    borderRadius: 2,
    marginVertical: 8,
    bottom:5,
    textAlign:'center',
    right:10
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
});

export default SalesMain;