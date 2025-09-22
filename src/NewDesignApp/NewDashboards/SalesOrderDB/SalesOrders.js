import React, { useRef, useState, useCallback, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ScrollView,
  TextInput,
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
import NetworkStatusIndicator from '../../NetworkStatusIndicator';
import GlobalStyle from '../../../components/common/GlobalStyle';
import SalesOrderPieChart from './SalesOrderPieChart';
import DateFilter from '../../CommonFiles/DateFilter';
import { DashesDataContext, DASHBOARD_TYPES } from '../../../components/common/DashesDataContext';
const { width, height } = Dimensions.get('window');

// Memoized ProductionCard Component
const ProductionCard = React.memo(({ item, toggleExpand, getStatusColor, selectedFilter }) => {
  const isFreqOrder = selectedFilter === 'Freq Order';
  const isRarelyUsed = selectedFilter === 'Rarely Used';
  const [showMore, setShowMore] = useState(isFreqOrder || isRarelyUsed ? true : false);

  const toggleShowMore = () => {
    setShowMore((prev) => !prev);
  };

  console.log('ProductionCard item:', JSON.stringify(item, null, 2));

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
          <Text style={styles.productionId}>
            {isRarelyUsed ? item.ProductName : item.CustomerName}
          </Text>
          <Text style={styles.timeText}>
            {isRarelyUsed ? '' : item.OrderDate || 'N/A'}
          </Text>
          <FontAwesomeIcon icon={faChevronDown} size={15} color="#000" />
        </View>
      </View>
      {item.isExpanded && (
        <View style={styles.expandedContent}>
          <View style={styles.detailRow}>
            <TouchableOpacity style={styles.detailButton}>
              <Text style={styles.detailLabel}>
                {isRarelyUsed ? 'Product' : 'Product'}
              </Text>
            </TouchableOpacity>
            {isRarelyUsed && (
              <TouchableOpacity style={styles.detailButton}>
                <Text style={styles.detailLabel}>UOM</Text>
              </TouchableOpacity>
            )}
            {isFreqOrder && (
              <TouchableOpacity style={styles.detailButton}>
                <Text style={styles.detailLabel}>PO No</Text>
              </TouchableOpacity>
            )}
            {!isFreqOrder && !isRarelyUsed && (
              <>
                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailLabel}>Order Date</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailLabel}>Delivery Date</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <View style={styles.detailValuesRow}>
            <Text style={styles.detailValue}>{item.ItemName || item.ProductName || 'N/A'}</Text>
            {isRarelyUsed && (
              <Text style={styles.detailValue}>{item.UOMName || 'N/A'}</Text>
            )}
            {isFreqOrder && (
              <Text style={styles.detailValue}>{item.PONo || 'N/A'}</Text>
            )}
            {!isFreqOrder && !isRarelyUsed && (
              <>
                <Text style={styles.detailValue}>{item.OrderDate || 'N/A'}</Text>
                <Text style={styles.detailValue}>
                  {item.DeliveryDate ? new Date(item.DeliveryDate).toLocaleDateString() : 'N/A'}
                </Text>
              </>
            )}
          </View>
          {showMore && (
            <View style={styles.secondDetailRow}>
              <View style={styles.detailRow}>
                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailLabel}>{isRarelyUsed ? 'Net Weight' : 'ReqQty'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.detailButton}>
                  <Text style={styles.detailLabel}>{isRarelyUsed ? 'Net Amount' : 'SupQty'}</Text>
                </TouchableOpacity>
                {!isFreqOrder && !isRarelyUsed && (
                  <TouchableOpacity style={styles.detailButton}>
                    <Text style={styles.detailLabel}>BalQty</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.detailValuesRow}>
                <Text style={styles.detailValue}>
                  {isRarelyUsed ? (item.NetWeight != null ? item.NetWeight.toFixed(2) : 'N/A') : (item.ReqQty != null ? item.ReqQty : 'N/A')}
                </Text>
                <Text style={styles.detailValue}>
                  {isRarelyUsed ? (item.NetAmount != null ? item.NetAmount.toFixed(2) : 'N/A') : (item.SupQty != null ? item.SupQty : 'N/A')}
                </Text>
                {!isFreqOrder && !isRarelyUsed && (
                  <Text style={styles.detailValue}>{item.BalQty != null ? item.BalQty : 'N/A'}</Text>
                )}
              </View>
            </View>
          )}
          {!isFreqOrder && !isRarelyUsed && (
            <TouchableOpacity style={styles.viewMore} onPress={toggleShowMore}>
              <Text style={styles.viewMoreText}>{showMore ? 'View Less' : 'View More'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
});

// Scrollable Filter Component
const ScrollableFilterTabs = React.memo(({ filters, selectedData, onFilterChange }) => {
  const scrollViewRef = useRef(null);
  const tabRefs = useRef({});

  const scrollToCenter = (index) => {
    if (scrollViewRef.current && tabRefs.current[index]) {
      tabRefs.current[index].measure((x, y, tabWidth, tabHeight, pageX, pageY) => {
        const screenWidth = width;
        const scrollX = pageX - screenWidth / 2 + tabWidth / 2;

        scrollViewRef.current.scrollTo({
          x: Math.max(0, scrollX),
          animated: true,
        });
      });
    }
  };

  const handleFilterPress = (filter, index) => {
    onFilterChange(filter);
    setTimeout(() => scrollToCenter(index), 100);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScrollView}
      contentContainerStyle={styles.filterScrollContent}
      decelerationRate={0.998}
      scrollEventThrottle={8}
      bounces={true}
      bouncesZoom={false}
      alwaysBounceHorizontal={false}
      overScrollMode="never"
      removeClippedSubviews={true}
      pagingEnabled={false}
    >
      {filters.map((filter, index) => (
        <TouchableOpacity
          key={filter}
          ref={(ref) => (tabRefs.current[index] = ref)}
          style={[styles.filterButton, selectedData === filter && styles.filterButtonActive]}
          onPress={() => handleFilterPress(filter, index)}
        >
          <Text
            style={[styles.filterText, selectedData === filter && styles.filterTextActive]}
          >
            {filter}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
});

// Memoized ScrollableReports Component
const ScrollableReportsComponent = React.memo(
  ({ onScrollToTop, isExpanded, containerGestureRef, selectedFilter, setSelectedCategory }) => {
    const [scrollViewRef, setScrollViewRef] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedData, setSelectedData] = useState('Request Order');
    const [expandedItemId, setExpandedItemId] = useState(null);

    const { productionData, fetchSingleDashboard, loadingStates } = useContext(DashesDataContext);
    
    useEffect(() => {
      fetchSingleDashboard('production');
    }, []);
    useEffect(() => {
  console.log("Production Data Updated:", JSON.stringify(productionData, null, 2));
}, [productionData]);
    useEffect(() => {
      console.log('Production Data from Context:', JSON.stringify(productionData, null, 2));
      console.log('Production Data Length:', productionData?.length || 0);
    }, [productionData]);

    const filterOptions = ['Request Order', 'Freq Order', 'Rarely Used'];

    const getFilteredData = () => {
      console.log('Filtering data for:', selectedData);
      console.log('Available productionData:', productionData);

      const result = [[], [], [], [], [], [], []];

      if (!productionData || productionData.length === 0) {
        console.log('No production data available');
        return result;
      }

      switch (selectedData) {
        case 'Request Order':
          if (productionData[3] && Array.isArray(productionData[3])) {
            result[3] = productionData[3].map((item) => ({
              id: item.CustomerName + '_' + item.PONo,
              CustomerName: item.CustomerName,
              PONo: item.PONo,
              OrderDate: item.OrderDate,
              ReqQty: parseFloat(item.ReqQty?.toFixed(1) || 0),
              SupQty: parseFloat(item.SupQty?.toFixed(2) || 0),
              BalQty: parseFloat(item.BalQty?.toFixed(2) || 0),
              DeliveryDate: item.DeliveryDate,
              ItemName: item.ItemName,
              isExpanded: false,
            }));
          }
          console.log('Request Order - returning data:', result);
          return result;

        case 'Freq Order':
          if (productionData[3] && Array.isArray(productionData[3])) {
            result[3] = productionData[3].map((item) => ({
              id: item.CustomerName + '_' + item.PONo,
              CustomerName: item.CustomerName,
              PONo: item.PONo,
              OrderDate: item.OrderDate,
              DeliveryDate: item.DeliveryDate,
              ReqQty: parseFloat(item.ReqQty?.toFixed(1) || 0),
              SupQty: parseFloat(item.SupQty?.toFixed(2) || 0),
              BalQty: parseFloat(item.BalQty?.toFixed(2) || 0),
              ItemName: item.ItemName,
              isExpanded: false,
            }));
          }
          console.log('Freq Order - returning data:', result);
          return result;

        case 'Rarely Used':
          if (productionData[6] && Array.isArray(productionData[6])) {
            result[6] = productionData[6].map((item, index) => ({
              id: item.ProductName + '_' + index,
              ProductName: item.ProductName,
              UOMName: item.UOMName,
              NetWeight: parseFloat(item.NetWeight?.toFixed(2) || 0),
              NetAmount: parseFloat(item.NetAmount?.toFixed(2) || 0),
              ItemName: item.ProductName,
              isExpanded: false,
            }));
          }
          console.log('Rarely Used - returning data:', result);
          return result;

        default:
          console.log('Default case - returning empty structure:', result);
          return result;
      }
    };

    const filteredProductionData = getFilteredData();

    const handleScroll = useCallback(
      (event) => {
        const { contentOffset } = event.nativeEvent;
        if (contentOffset.y <= 5 && isExpanded.value) {
          onScrollToTop();
        }
      },
      [isExpanded, onScrollToTop]
    );

    const getStatusColor = useCallback((status) => {
      switch (status) {
        case 'completed':
          return '#3E89EC';
        case 'in-progress':
          return '#3E89EC';
        case 'pending':
          return '#3E89EC';
        default:
          return '#3E89EC';
      }
    }, []);

    const toggleExpand = useCallback((id) => {
      setExpandedItemId((prev) => (prev === id ? null : id));
    }, []);

    const handleFilterChange = useCallback(
      debounce((filter) => {
        console.log('Filter changed to:', filter);
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
              placeholder="Search by customer name or PO number"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.filterContainer}>
            <ScrollableFilterTabs
              filters={filterOptions}
              selectedData={selectedData}
              onFilterChange={handleFilterChange}
            />
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
          decelerationRate="fast"
          overScrollMode="auto"
          scrollIndicatorInsets={{ right: 1 }}
          simultaneousHandlers={containerGestureRef}
        >
          <View style={styles.listContainer}>
            {loadingStates.production ? (
              <Text style={styles.loadingText}>Loading production data...</Text>
            ) : (selectedData === 'Rarely Used' ? filteredProductionData[6] : filteredProductionData[3]).length === 0 ? (
              <Text style={styles.noDataText}>No production data available</Text>
            ) : (
              (selectedData === 'Rarely Used' ? filteredProductionData[6] : filteredProductionData[3])
                .filter((item) => {
                  const searchLower = searchQuery.toLowerCase();
                  const customerName = (item.CustomerName || item.ProductName || '').toLowerCase();
                  const poNo = (item.PONo || '').toLowerCase();
                  return customerName.includes(searchLower) || poNo.includes(searchLower);
                })
                .map((item, index) => (
                  <ProductionCard
                    key={item.id || item.CustomerName + '_' + item.PONo || item.ProductName + '_' + index}
                    item={{
                      ...item,
                      id: item.id || item.CustomerName + '_' + item.PONo || item.ProductName + '_' + index,
                      isExpanded: expandedItemId === (item.id || item.CustomerName + '_' + item.PONo || item.ProductName + '_' + index),
                    }}
                    toggleExpand={toggleExpand}
                    getStatusColor={getStatusColor}
                    selectedFilter={selectedData}
                  />
                ))
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
);

const OrderSales = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [selectedCategory, setSelectedCategory] = useState('Request Order');
  const translateY = useSharedValue(0);
  const isExpanded = useSharedValue(false);
  const chartTransition = useSharedValue(0);

  const { productionData, startDate, endDate, startTime, endTime } = useContext(DashesDataContext);

  // Update chart data when productionData or date/time changes
  const chartData = React.useMemo(() => {
    console.log('Calculating chart data from productionData:', productionData);

    if (!productionData || !productionData[3] || productionData[3].length === 0) {
      return {
        daybook: 0,
        stock: 0,
        cancelledBill: 0,
        anpr: 0,
      };
    }

    const dataArray = productionData[3];
    const totalReqQty = dataArray.reduce((sum, item) => sum + (parseFloat(item.ReqQty) || 0), 0);
    const totalSupQty = dataArray.reduce((sum, item) => sum + (parseFloat(item.SupQty) || 0), 0);
    const totalBalQty = dataArray.reduce((sum, item) => sum + (parseFloat(item.BalQty) || 0), 0);

    const chartData = {
      daybook: totalReqQty,
      stock: totalSupQty,
      cancelledBill: totalBalQty,
      anpr: 0,
    };

    console.log('Calculated chart data:', chartData);
    return chartData;
  }, [productionData, startDate, endDate, startTime, endTime]);

  const containerGestureRef = useRef();

  const COLLAPSED_HEIGHT = height * 0.45;
  const EXPANDED_HEIGHT = height * 0.85;
  const COLLAPSED_TRANSLATE = 0;
  const EXPANDED_TRANSLATE = -height * 0.3;

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
    },
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

  // Sync selectedFilter with DateFilter changes
  const handleDateFilterChange = useCallback((filter) => {
    setSelectedFilter(filter);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
          </TouchableOpacity>
          <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Sales Order</Text>
        </View>
        <DateFilter dashboardType="production" onFilterChange={handleDateFilterChange} />
        <TouchableOpacity style={styles.menuButton}>
          <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
        </TouchableOpacity>
      </View>

      <SalesOrderPieChart
        selectedCategory={selectedCategory}
        data={chartData}
        chartTransition={chartTransition}
        isExpanded={isExpanded}
        productionData={productionData}
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
    paddingVertical: 13,
    bottom: 5,
  },
  filterScrollView: {
    flexGrow: 0,
    paddingHorizontal: 10,
  },
  filterScrollContent: {
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    marginHorizontal: 4,
    minWidth: 80,
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
    transform: [{ scale: 1.05 }],
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  filterTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  rowContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    paddingTop: 10,
    alignSelf: 'center',
    bottom: 130,
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
    paddingBottom: 80,
    flexGrow: 1,
  },
  listContainer: {
    flex: 1,
    minHeight: '100%',
    paddingBottom:100

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
    width: "100%",
    alignSelf: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statusIndicator: {
    width: 6,
    height: 40,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    backgroundColor: '#3E89EC',
    position: 'absolute',
    left: 0,
  },
  cardRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productionId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    left: 10,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#3C840F',
    marginHorizontal: 8,
    right: 15,
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
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#B0B0B0',
    bottom: 15,
    flex: 1,
    marginHorizontal: 2,
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
    bottom: 20,
    right: 10,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    flex: 1,
    left: 5,
  },
  viewMore: {
    alignSelf: 'flex-end',
    paddingVertical: 5,
    paddingHorizontal: 10,
    bottom: 15,
  },
  viewMoreText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default OrderSales;