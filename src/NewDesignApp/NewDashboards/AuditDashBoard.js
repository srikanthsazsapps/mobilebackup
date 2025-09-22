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
import { faArrowLeft, faSearch, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import NetworkStatusIndicator from '../NetworkStatusIndicator'; // Adjust path as needed
import GlobalStyle from '../../components/common/GlobalStyle'; // Adjust path as needed
import AuditPieChart from '../PieChartDesign/AuditPieChart'; // Adjust path as needed

const { width, height } = Dimensions.get('window');

// Memoized ProductionCard Component
const ProductionCard = React.memo(({ item, toggleExpand, getStatusColor }) => {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore((prev) => !prev);
  };

  return (
    <TouchableOpacity style={styles.productionCard} onPress={() => toggleExpand(item.id)}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        />
        <View style={styles.cardRow}>
          <Text style={styles.productionId}>{item.id}</Text>
          <Text style={styles.timeText}>{item.time}</Text>
          <FontAwesomeIcon icon={faChevronDown} size={15} color="#000" />
        </View>
      </View>
      {item.isExpanded && item.details && (
        <View style={styles.expandedContent}>
          <View style={styles.detailRow}>
            <TouchableOpacity style={styles.detailButton}>
              <Text style={styles.detailLabel}>Vehicle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailButton}>
              <Text style={styles.detailLabel}>Deliver to</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailButton}>
              <Text style={styles.detailLabel}>Product</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailValuesRow}>
            <Text style={styles.detailValue}>{item.details.vehicle}</Text>
            <Text style={styles.detailValue}>{item.details.deliverTo}</Text>
            <Text style={styles.detailValue}>{item.details.product || 'N/A'}</Text>
          </View>
          {showMore && item.details && (
            <View style={styles.secondDetailRow}>
              <View style={styles.detailRow}>
                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailLabel}>Customer</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailLabel}>Order Date</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailLabel}>Quantity</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.detailValuesRow}>
                <Text style={styles.detailValue}>{item.details.custName || 'N/A'}</Text>
                <Text style={styles.detailValue}>{item.details.orderDate || 'N/A'}</Text>
                <Text style={styles.detailValue}>{item.details.quantity || 'N/A'}</Text>
              </View>
            </View>
          )}
          <TouchableOpacity style={styles.viewMore} onPress={toggleShowMore}>
            <Text style={styles.viewMoreText}>{showMore ? 'View Less' : 'View More'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
});

// Memoized ScrollableReports Component
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

  const productionData = [
    { 
      id: 'BR/123/321', 
      status: 'completed', 
      time: 'edited 2 minutes ago', 
      details: { 
        vehicle: 'TN08BJ200', 
        deliverTo: 'AKR', 
        product: 'Concrete', 
        custName: 'John Doe', 
        orderDate: '2025-08-25', 
        quantity: '100 units' 
      }
    },
    { 
      id: 'PR/002/2024', 
      status: 'in-progress', 
      time: '15 minutes ago', 
      details: { 
        vehicle: 'TN09CK300', 
        deliverTo: 'BLR', 
        product: 'Cement', 
        custName: 'Ramesh Kumar', 
        orderDate: '2025-08-24', 
        quantity: '50 units' 
      }
    },
  ];

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
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <FontAwesomeIcon icon={faSearch} size={16} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by production ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.filterContainer}>
          {['Daybook', 'Stock', 'Cancelled Bill', 'ANPR'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedData === filter && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedData === filter && styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    
      <ScrollView 
        ref={(ref) => setScrollViewRef(ref)}
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={true}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast" // Adjusted for smoother scrolling
        overScrollMode="auto"
        scrollIndicatorInsets={{ right: 1 }}
        simultaneousHandlers={containerGestureRef}
      >
        <View style={styles.listContainer}>
          {productionData
            .filter(item => item.id.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item) => (
              <ProductionCard 
                key={item.id} 
                item={{ ...item, isExpanded: expandedItemId === item.id }}
                toggleExpand={toggleExpand}
                getStatusColor={getStatusColor}
              />
            ))}
        </View>
      </ScrollView>
    </View>
  );
});

const AuditDashBoard = ({ navigation }) => {
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

  const COLLAPSED_HEIGHT = height * 0.5;
  const EXPANDED_HEIGHT = height * 0.95;
  const COLLAPSED_TRANSLATE = 0;
  const EXPANDED_TRANSLATE = -height * 0.23;

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
          <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Production</Text>
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
      
      <AuditPieChart
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
    bottom: 30,
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
    backgroundColor: '#F5F6FA',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  listContainer: {
    flex: 1,
  },
  productionCard: {
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 2,
    top: 5,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  statusIndicator: {
    width: 6,
    height: 40,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#4285F4',
    position: 'absolute',
    left: 0,
  },
  cardRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
  },
  productionId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    left: 10
  },
  timeText: {
    fontSize: 12,
    color: "#3C840F",
    marginHorizontal: 8,
    left: 15 
  },
  expandedContent: {
    padding: 16,
    backgroundColor: '#F5F6FA',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  secondDetailRow: {
    marginTop: 10,
    marginBottom: 8,
  },
  detailButton: {
    backgroundColor: '#EDF5FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#B0B0B0',
    bottom:15
  },
  detailLabel: {
    fontSize: 12,
    color: '#000',
    fontWeight: '500',
    textAlign: 'center',
  },
  detailValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    bottom:20,
    right:10
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    flex: 1,
    left:5
  },
  viewMore: {
    alignSelf: 'flex-end',
    paddingVertical: 5,
    paddingHorizontal: 10,
    bottom:15
  },
  viewMoreText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AuditDashBoard;