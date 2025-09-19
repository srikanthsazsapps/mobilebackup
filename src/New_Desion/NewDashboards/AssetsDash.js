import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  ImageBackground,
  Keyboard, // <=== import Keyboard API
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import NetworkStatusIndicator from '../NetworkStatusIndicator';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import VehiclePopupCard from './VehiclePopupCard';
import { DashesDataContext } from '../../components/common/DashesDataContext';
import SlideMenuBar from './SlideMenuBar';
import GlobalStyle from '../../components/common/GlobalStyle';
import AssetBarChart from './AssetBarChart';

const highlyUsedStyles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backgroundImage: {
    width: '100%',
    height: 130,
    justifyContent: 'center',
  },
  imageStyle: {
    borderRadius: 12,
  },
  overlay: {
    flex: 1,
    padding: 8,
    justifyContent: 'space-between',
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    marginLeft: 16,
    fontWeight: 'bold',
    color: '#333',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  viewMore: {
    marginRight: 5,
    marginBottom: 15,
    bottom: 5,
    color: '#666',
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#333',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

const HighlyUsedVehicleCard = ({ onViewMore, highlyUsedVehicles, loaderVehicles }) => {
  const { assetData } = useContext(DashesDataContext);

  return (
    <View style={highlyUsedStyles.container}>
      <ImageBackground
        source={require('../../images/rectangle_viewmore.png')}
        style={highlyUsedStyles.backgroundImage}
        imageStyle={highlyUsedStyles.imageStyle}
        resizeMode="stretch"
      >
        <View style={highlyUsedStyles.overlay}>
          <View style={highlyUsedStyles.header}>
            <Text style={[GlobalStyle.heading6, highlyUsedStyles.title]}>Highly Used Vehicle</Text>
            <TouchableOpacity onPress={onViewMore}>
              <Text style={[GlobalStyle.H11, highlyUsedStyles.viewMore]}>View More &gt;</Text>
            </TouchableOpacity>
          </View>
          <View style={highlyUsedStyles.statsContainer}>
            <View style={highlyUsedStyles.statItem}>
              <View style={highlyUsedStyles.statButton}>
                <Text style={[GlobalStyle.H12, highlyUsedStyles.statLabel]}>Trip Wise Details</Text>
              </View>
              <Text style={[GlobalStyle.heading4, highlyUsedStyles.statNumber]}>
                {highlyUsedVehicles.length}
              </Text>
            </View>
            <View style={highlyUsedStyles.statItem}>
              <View style={highlyUsedStyles.statButton}>
                <Text style={[GlobalStyle.H12, highlyUsedStyles.statLabel]}>Hours Wise Details</Text>
              </View>
              <Text style={[GlobalStyle.heading4, highlyUsedStyles.statNumber]}>
                {loaderVehicles.length}
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const VehicleDetailsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [openPopupType, setOpenPopupType] = useState(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const inputRef = useRef(null);

  const {
    assetData,
    loadingStates,
    fetchSingleDashboard,
  } = useContext(DashesDataContext);

  useEffect(() => {
    translateY.setValue(0);
    return () => {
      translateY.setValue(0);
    };
  }, [translateY]);

  useEffect(() => {
    if (!assetData.length && !loadingStates.asset) {
      fetchSingleDashboard('asset');
    }
  }, []);

  // Animate UP when keyboard appears (e.g., search input focused)
  useEffect(() => {
    const onShow = Keyboard.addListener('keyboardDidShow', () => {
      Animated.spring(translateY, {
        toValue: -200,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    });
    return () => onShow.remove();
  }, [translateY]);

  const getChartBarColors = (label) => {
    const colorMap = {
      'Highly Used': { top: '#c39a50dc', bottom: '#2196F3' },
      'FC Ending': { top: '#c85b72ad', bottom: '#2196F3' },
      'Permit': { top: '#bcb3759d', bottom: '#2196F3' },
      'Tax': { top: '#aa8dcbae', bottom: '#2196F3' },
      'Insurance': { top: '#69c090b1', bottom: '#2196F3' },
      'Loader Data': { top: '#d7ccc8', bottom: '#795548' },
    };
    return colorMap[label] || { top: 'rgba(110,163,224,0.8)', bottom: '#2196F3' };
  };

  const processAssetData = () => {
    if (!Array.isArray(assetData) || assetData.length === 0) {
      return {
        inTransitVehicles: [],
        idleVehicles: [],
        workshopVehicles: [],
        fcEndingVehicles: [],
        permitVehicles: [],
        taxVehicles: [],
        insuranceVehicles: [],
        loaderVehicles: [],
      };
    }
    let inTransitArray = [];
    let idleArray = [];
    let workshopArray = [];
    let documentsArray = [];
    let loaderArray = [];
    if (assetData.length > 1 && Array.isArray(assetData[1])) {
      inTransitArray = assetData[1] || [];
      idleArray = assetData[2] || [];
      workshopArray = assetData[3] || [];
      documentsArray = assetData[4] || [];
      loaderArray = assetData[5] || [];
    } else {
      const flatData = Array.isArray(assetData[0]) ? assetData.flat() : assetData;
      inTransitArray = flatData.filter((item) => {
        const status = (item?.TransStatus || item?.Category || '').toLowerCase();
        return status.includes('transit') || status === 'in transit';
      });
      idleArray = flatData.filter((item) => {
        const status = (item?.TransStatus || item?.Category || '').toLowerCase();
        return status.includes('idle') || status.includes('completed') || item?.IdleDate;
      });
      workshopArray = flatData.filter((item) => {
        const status = (item?.TransStatus || item?.Category || '').toLowerCase();
        return status.includes('workshop') || status === 'workshop';
      });
      documentsArray = flatData.filter(
        (item) => item?.FCDate || item?.PermitDate || item.TaxDate || item?.InsuranceDate
      );
      loaderArray = flatData.filter((item) => item?.Loader && item?.VechNumber);
    }
    const vehicleMap = new Map();
    inTransitArray.forEach((item, index) => {
      const num = item?.VechNumber || item?.VechileNumber || item?.VehicleNumber || 'N/A';
      if (!vehicleMap.has(num)) {
        vehicleMap.set(num, {
          id: item?.id || item?.sno || index + 1,
          number: num,
          status: 'In Transit',
          color: '#4CAF50',
          qty: item?.Qty || 0,
          totalAmount: item?.TotalAmount || 0,
          tripCount: item?.TripCount || 1,
          runningHours: item?.TotalHours || item?.Totalhours || 0,
        });
      } else {
        const existing = vehicleMap.get(num);
        existing.qty += item?.Qty || 0;
        existing.totalKM = (parseFloat(existing.totalKM || 0) + parseFloat(item?.TotalKM || 0)).toString();
        existing.totalAmount += item?.TotalAmount || 0;
        existing.tripCount += item?.TripCount || 1;
        existing.runningHours += item?.TotalHours || item?.Totalhours || 0;
      }
    });
    const inTransitVehicles = Array.from(vehicleMap.values());
    const idleVehicles = idleArray.map((item, index) => ({
      id: item?.id || item?.sno || index + 1,
      number: item?.VechNumber || item?.VechileNumber || item?.VehicleNumber || 'N/A',
      status: 'Idle Vehicle',
      color: '#FF5722',
      idleDate: item?.IdleDate || '',
    }));
    const workshopVehicles = workshopArray.map((item, index) => ({
      id: item?.id || item?.sno || index + 1,
      number: item?.VechileNumber || item?.VechNumber || item?.VehicleNumber || 'N/A',
      status: 'In Workshop',
      color: '#FFC107',
      workshopDate: item?.WorkshopDate || '',
    }));
    const fcEndingVehicles = [];
    const permitVehicles = [];
    const taxVehicles = [];
    const insuranceVehicles = [];
    documentsArray.forEach((item, index) => {
      const vehicleNumber = item?.VechileNumber || item?.VechNumber || item?.VehicleNumber || 'N/A';
      if (item?.FCDate) {
        fcEndingVehicles.push({
          id: item?.id || item?.sno || index + 1,
          number: vehicleNumber,
          status: 'FC Ending',
          color: '#9C27B0',
          fcDate: item.FCDate,
        });
      }
      if (item?.PermitDate) {
        permitVehicles.push({
          id: item?.id || item?.sno || index + 1,
          number: vehicleNumber,
          status: 'Permit',
          color: '#FF9800',
          permitDate: item.PermitDate,
        });
      }
      if (item?.TaxDate) {
        taxVehicles.push({
          id: item?.id || item?.sno || index + 1,
          number: vehicleNumber,
          status: 'Tax',
          color: '#F44336',
          taxDate: item.TaxDate,
        });
      }
      if (item?.InsuranceDate) {
        insuranceVehicles.push({
          id: item?.id || item?.sno || index + 1,
          number: vehicleNumber,
          status: 'Insurance',
          color: '#2196F3',
          insuranceDate: item.InsuranceDate,
        });
      }
    });
    const loaderVehicles = loaderArray.map((item, index) => ({
      id: item?.id || index + 1,
      number: item?.VechNumber || 'N/A',
      loader: item?.Loader,
      loadedBy: item?.LoadedBy,
      noOfLoads: item?.NoofLoads || 0,
      mt: item?.MT || 0,
      diesel: item?.Diesel || 0,
      totalHours: item?.TotalHours || 0,
      status: 'Loader Data',
      color: '#795548',
    }));
    return {
      inTransitVehicles,
      idleVehicles,
      workshopVehicles,
      fcEndingVehicles,
      permitVehicles,
      taxVehicles,
      insuranceVehicles,
      loaderVehicles,
    };
  };

  const {
    inTransitVehicles,
    idleVehicles,
    workshopVehicles,
    fcEndingVehicles,
    permitVehicles,
    taxVehicles,
    insuranceVehicles,
    loaderVehicles,
  } = processAssetData();

  const getHighlyUsedVehicles = () => inTransitVehicles.filter((v) => v.tripCount > 1);
  const highlyUsedVehicles = getHighlyUsedVehicles();
  const getAllVehicles = () => [
    ...inTransitVehicles,
    ...idleVehicles,
    ...workshopVehicles,
    ...fcEndingVehicles,
    ...permitVehicles,
    ...taxVehicles,
    ...insuranceVehicles,
  ];
  const getFilteredVehicles = () => {
    let vehicles = [];
    switch (selectedFilter) {
      case 'All':
        vehicles = getAllVehicles();
        break;
      case 'In Transit':
        vehicles = inTransitVehicles;
        break;
      case 'Idle Vehicle':
        vehicles = idleVehicles;
        break;
      case 'In Workshop':
        vehicles = workshopVehicles;
        break;
      default:
        vehicles = getAllVehicles();
    }
    return vehicles.filter((vehicle) =>
      vehicle.number.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getStatusCounts = () => {
    const today = new Date();
    const countExpired = (vehicles, dateField) =>
      vehicles.filter((v) => v[dateField] && new Date(v[dateField]) < today).length;
    return {
      'FC Ending': Math.max(0, fcEndingVehicles.length - countExpired(fcEndingVehicles, 'fcDate')),
      Permit: Math.max(0, permitVehicles.length - countExpired(permitVehicles, 'permitDate')),
      Tax: Math.max(0, taxVehicles.length - countExpired(taxVehicles, 'taxDate')),
      Insurance: Math.max(0, insuranceVehicles.length - countExpired(insuranceVehicles, 'insuranceDate')),
    };
  };

  const onPanGestureEvent = (event) => {
    translateY.setValue(event.nativeEvent.translationY);
  };

  const onPanHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY: gestureTranslationY, velocityY } = event.nativeEvent;
      let toValue = 0;
      const currentPosition = translateY._value || 0;
      if (currentPosition < 0) {
        toValue = gestureTranslationY > -50 || velocityY > 200 ? 0 : -200;
      } else {
        toValue = gestureTranslationY < -50 || velocityY < -300 ? -250 : 0;
      }
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  // Animate up when search is clicked
  const handleSearch = () => {
    Animated.spring(translateY, {
      toValue: -250,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    // Optional: focus the input (if you want to always show keyboard)
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleViewMore = () => setOpenPopupType('Highly Used');
  const statusCounts = getStatusCounts();
  const maxValue = Math.max(...Object.values(statusCounts));
  const chartOpacity = translateY.interpolate({
    inputRange: [-200, -100, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />

      <VehiclePopupCard
        visible={!!openPopupType}
        activeTab={openPopupType || ''}
        onClose={() => setOpenPopupType(null)}
        vehicleData={{
          'Highly Used': highlyUsedVehicles,
          'FC Ending': fcEndingVehicles,
          'Permit': permitVehicles,
          'Tax': taxVehicles,
          'Insurance': insuranceVehicles,
          'Loader Data': loaderVehicles,
        }}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.leftsection}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
          </TouchableOpacity>
          <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Asset</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuVisible(true)}>
          <Text style={styles.menuText}>Menu</Text>
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <View style={styles.bodyContainer}>
        {/* CHART */}
        <View style={styles.chartWrapper}>
          <View style={styles.chartContainer}>
            {Object.entries(statusCounts).map(([label, count]) => {
              const minBarHeight = 50, maxBarHeight = 125;
              const barHeight = maxValue > 0 ? minBarHeight + (count / maxValue) * (maxBarHeight - minBarHeight) : minBarHeight;
              const barColors = getChartBarColors(label);
              return (
                <TouchableOpacity
                  key={label}
                  activeOpacity={0.7}
                  onPress={() => setOpenPopupType(label)}
                  style={styles.chartItem}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Text style={[GlobalStyle.heading8, styles.chartValue]}>{count}</Text>
                  <View style={[styles.chartBar, { height: barHeight }]}>
                    <View style={[styles.chartBarTop, { flex: 0.3, backgroundColor: barColors.top }]} />
                    <View style={[styles.chartBarBottom, { flex: 0.7, backgroundColor: barColors.bottom }]} />
                  </View>
                  <Text style={[GlobalStyle.H14, styles.chartLabel]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.chartLineContainer}>
            <View style={[styles.connectingLine, { pointerEvents: 'none' }]} />
            <View style={[styles.dotRow, { pointerEvents: 'none' }]}>
              {Object.keys(statusCounts).map((_, index) => (
                <View key={index} style={styles.dot} />
              ))}
            </View>
          </View>
          {/* Highly Used Vehicle Card */}
          <HighlyUsedVehicleCard
            onViewMore={handleViewMore}
            highlyUsedVehicles={highlyUsedVehicles}
            loaderVehicles={loaderVehicles}
          />
        </View>

        {/* AssetBarChart displayed when dragged up */}
        <Animated.View
          style={{
            opacity: chartOpacity,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: chartOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [-1, 1],
            }),
          }}
        >
          <AssetBarChart
            statusCounts={statusCounts}
            highlyUsedVehiclesLength={highlyUsedVehicles.length}
            loaderVehiclesLength={loaderVehicles.length}
          />
        </Animated.View>

        {/* VEHICLE DETAILS */}
        <Animated.View style={[styles.vehicleWrapper, { transform: [{ translateY }] }]}>
          <PanGestureHandler 
            onGestureEvent={onPanGestureEvent} 
            onHandlerStateChange={onPanHandlerStateChange}
            hitSlop={{ top: 20, bottom: 20, left: 0, right: 0 }}
          >
            <Animated.View style={styles.dragBarContainer}>
              <View style={styles.dragHandle} />
            </Animated.View>
          </PanGestureHandler>
          <Text style={[GlobalStyle.heading6, styles.sectionTitle]}>Vehicle & Machinery</Text>
          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              ref={inputRef}
              style={[GlobalStyle.H12, styles.searchInput]}
              placeholder="Search by vehicle number"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
              onTouchStart={(e) => e.stopPropagation()}
              onStartShouldSetResponder={() => true}
              onResponderTerminationRequest={() => false}
              // The panel will auto-expand when keyboard appears
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <FontAwesomeIcon icon={faSearch} size={15} color="white" />
            </TouchableOpacity>
          </View>
          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
            contentContainerStyle={styles.filterContainer}
          >
            {['All', 'In Transit', 'Idle Vehicle', 'In Workshop'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterButton, selectedFilter === filter && styles.activeFilterButton]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[GlobalStyle.H11, styles.filterText, selectedFilter === filter && styles.activeFilterText]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Vehicle List */}
          <ScrollView 
            contentContainerStyle={styles.vehicleDetailsSection} 
            showsVerticalScrollIndicator={false}
            onTouchStart={(e) => e.stopPropagation()}
            onStartShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          >
            {loadingStates.asset ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading vehicles...</Text>
              </View>
            ) : (
              <View style={styles.vehicleList}>
                {getFilteredVehicles().map((vehicle) => (
                  <TouchableOpacity 
                    key={`${vehicle.status}-${vehicle.id}`} 
                    style={styles.vehicleItem}
                    onTouchStart={(e) => e.stopPropagation()}
                  >
                    <View style={styles.vehicleInfo}>
                      <Text style={[GlobalStyle.H5, styles.vehicleNumber]}>{vehicle.number}</Text>
                      <Text style={styles.vehicleStatus}>{vehicle.status}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {getFilteredVehicles().length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      {searchText ? 'No vehicles found matching your search' : 'No vehicles available'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
      <SlideMenuBar isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    flexDirection: 'row',alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15, marginTop: 30,
  },
  leftsection: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { marginLeft: 20 },
  menuButton: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  menuText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  bodyContainer: { flex: 1 },
  chartWrapper: { paddingVertical: 20, backgroundColor: '#F5F6FA', minHeight: 200 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingHorizontal: 20, zIndex: 1 },
  chartLineContainer: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center', zIndex: 2 },
  connectingLine: { height: 2, bottom:193, width: '80%', backgroundColor: '#666', opacity: 1 },
  dotRow: { position: 'absolute', bottom:190, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2196F3', opacity: 1 },
  chartItem: { alignItems: 'center', flex: 1, padding: 10 },
  chartBar: { width: 35, borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  chartBarTop: {},
  chartBarBottom: {},
  chartLabel: { textAlign: 'center', width: 85, paddingTop: 20 },
  chartValue: { marginBottom: 6 },
  vehicleWrapper: { backgroundColor: '#fff', padding: 10, borderTopLeftRadius: 40, borderTopRightRadius: 40, elevation: 5, top: -20 },
  dragBarContainer: { paddingVertical: 16, paddingHorizontal: 4, alignItems: 'center' },
  dragHandle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, marginBottom: 12 },
  vehicleDetailsSection: { padding: 16, paddingBottom: 500 },
  sectionTitle: { marginBottom: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 100, marginBottom: 16, paddingHorizontal: 12 },
  searchInput: { flex: 1, paddingVertical: 12 },
  searchButton: { backgroundColor: '#2196F3', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  filterScrollView: { marginBottom: 0 },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 4, gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f8f8f8', borderWidth: 1, borderColor: '#e0e0e0', height: 35, marginBottom: 40 },
  activeFilterButton: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  filterText: {},
  activeFilterText: { color: '#fff' },
  vehicleList: { gap: 8 },
  vehicleItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  vehicleInfo: { flex: 1 },
  vehicleNumber: { marginBottom: 2 },
  vehicleStatus: { fontSize: 13, color: '#666' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  loadingText: { fontSize: 16, color: '#666' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center' },
});

export default VehicleDetailsScreen;
