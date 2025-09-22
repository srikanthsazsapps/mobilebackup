import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import NetworkStatusIndicator from '../NetworkStatusIndicator';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import VehiclePopupCard from './VehiclePopupCard';
import { DashesDataContext } from '../../components/common/DashesDataContext';

const VehicleDetailsScreen = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [openPopupType, setOpenPopupType] = useState(null);
  const translateY = new Animated.Value(0);
  const navigation = useNavigation();

  const {
    assetData,
    loadingStates,
    fetchSingleDashboard,
  } = useContext(DashesDataContext);

  // Load asset data when component mounts
  useEffect(() => {
    if (!assetData.length && !loadingStates.asset) {
      fetchSingleDashboard('asset');
    }
  }, []);

  // Process asset data based on the API structure you provided
  const processAssetData = () => {
    if (!Array.isArray(assetData) || assetData.length === 0) {
      return {
        inTransitVehicles: [],
        idleVehicles: [],
        workshopVehicles: [],
        fcEndingVehicles: [],
        permitVehicles: [],
        taxVehicles: [],
        insuranceVehicles: []
      };
    }

    // Debug: Log the actual data structure
    console.log('Asset Data Structure:', JSON.stringify(assetData, null, 2));
    console.log('Asset Data Length:', assetData.length);

    // Check if assetData is nested arrays or flat array
    let inTransitArray = [];
    let idleArray = [];
    let workshopArray = [];
    let documentsArray = [];

    // Handle different data structures
    if (assetData.length > 1 && Array.isArray(assetData[1])) {
      // Nested array structure: [[], inTransit[], idle[], workshop[], documents[]]
      inTransitArray = assetData[1] || [];
      idleArray = assetData[2] || [];
      workshopArray = assetData[3] || [];
      documentsArray = assetData[4] || [];
    } else {
      // Flat array structure - filter by Category or TransStatus
      const flatData = Array.isArray(assetData[0]) ? assetData.flat() : assetData;
      
      inTransitArray = flatData.filter(item => {
        const status = (item?.TransStatus || item?.Category || '').toLowerCase();
        return status.includes('transit') || status === 'in transit';
      });
      
      idleArray = flatData.filter(item => {
        const status = (item?.TransStatus || item?.Category || '').toLowerCase();
        return status.includes('idle') || status.includes('completed') || item?.IdleDate;
      });
      
      workshopArray = flatData.filter(item => {
        const status = (item?.TransStatus || item?.Category || '').toLowerCase();
        return status.includes('workshop') || status === 'workshop';
      });
      
      documentsArray = flatData.filter(item => {
        return item?.FCDate || item?.PermitDate || item?.TaxDate || item?.InsuranceDate;
      });
    }

    console.log('Processed Arrays:', {
      inTransit: inTransitArray.length,
      idle: idleArray.length,
      workshop: workshopArray.length,
      documents: documentsArray.length
    });

    // Aggregate In Transit vehicles by vehicle number
    const vehicleMap = new Map();
    inTransitArray.forEach((item, index) => {
      const num = item?.VechNumber || item?.VechileNumber || item?.VehicleNumber || 'N/A';
      if (!vehicleMap.has(num)) {
        vehicleMap.set(num, {
          id: item?.id || item?.sno || index + 1,
          number: num,
          status: 'In Transit',
          color: '#4CAF50',
          driver: item?.Driver || 'N/A',
          product: item?.Product || 'N/A',
          qty: item?.Qty || 0,
          tripDate: item?.TripDate || '',
          deliveryTo: item?.DeliveryTo || 'N/A',
          totalKM: item?.TotalKM || '0',
          totalAmount: item?.TotalAmount || 0,
          tripCount: item?.TripCount || 1
        });
      } else {
        const existing = vehicleMap.get(num);
        existing.qty += item?.Qty || 0;
        existing.totalKM = (parseFloat(existing.totalKM) + parseFloat(item?.TotalKM || 0)).toString();
        existing.totalAmount += item?.TotalAmount || 0;
        existing.tripCount += item?.TripCount || 1;
        // Update to latest trip details
        if (item?.TripDate && (!existing.tripDate || new Date(item.TripDate) > new Date(existing.tripDate))) {
          existing.tripDate = item.TripDate;
          existing.driver = item?.Driver || existing.driver;
          existing.product = item?.Product || existing.product;
          existing.deliveryTo = item?.DeliveryTo || existing.deliveryTo;
        }
      }
    });
    const inTransitVehicles = Array.from(vehicleMap.values());

    // Process Idle vehicles (3rd array or filtered data)
    const idleVehicles = Array.isArray(idleArray) ? idleArray.map((item, index) => ({
      id: item?.id || item?.sno || index + 1,
      number: item?.VechNumber || item?.VechileNumber || item?.VehicleNumber || 'N/A',
      status: 'Idle Vehicle',
      color: '#FF5722',
      idleDate: item?.IdleDate || ''
    })) : [];

    // Process Workshop vehicles (4th array or filtered data)
    const workshopVehicles = Array.isArray(workshopArray) ? workshopArray.map((item, index) => ({
      id: item?.id || item?.sno || index + 1,
      number: item?.VechileNumber || item?.VechNumber || item?.VehicleNumber || 'N/A',
      status: 'In Workshop',
      color: '#FFC107',
      workshopDate: item?.WorkshopDate || ''
    })) : [];

    // Process document expiry vehicles (5th array or filtered data)
    const fcEndingVehicles = [];
    const permitVehicles = [];
    const taxVehicles = [];
    const insuranceVehicles = [];

    if (Array.isArray(documentsArray)) {
      documentsArray.forEach((item, index) => {
        const vehicleNumber = item?.VechileNumber || item?.VechNumber || item?.VehicleNumber || 'N/A';
        
        if (item?.FCDate) {
          fcEndingVehicles.push({
            id: item?.id || item?.sno || index + 1,
            number: vehicleNumber,
            status: 'FC Ending',
            color: '#9C27B0',
            fcDate: item.FCDate
          });
        }
        
        if (item?.PermitDate) {
          permitVehicles.push({
            id: item?.id || item?.sno || index + 1,
            number: vehicleNumber,
            status: 'Permit',
            color: '#FF9800',
            permitDate: item.PermitDate
          });
        }
        
        if (item?.TaxDate) {
          taxVehicles.push({
            id: item?.id || item?.sno || index + 1,
            number: vehicleNumber,
            status: 'Tax',
            color: '#F44336',
            taxDate: item.TaxDate
          });
        }
        
        if (item?.InsuranceDate) {
          insuranceVehicles.push({
            id: item?.id || item?.sno || index + 1,
            number: vehicleNumber,
            status: 'Insurance',
            color: '#2196F3',
            insuranceDate: item.InsuranceDate
          });
        }
      });
    }

    return {
      inTransitVehicles,
      idleVehicles,
      workshopVehicles,
      fcEndingVehicles,
      permitVehicles,
      taxVehicles,
      insuranceVehicles
    };
  };

  const {
    inTransitVehicles,
    idleVehicles,
    workshopVehicles,
    fcEndingVehicles,
    permitVehicles,
    taxVehicles,
    insuranceVehicles
  } = processAssetData();

  // Get highly used vehicles (vehicles with more than 1 trip count)
  const getHighlyUsedVehicles = () => {
    return inTransitVehicles.filter(vehicle => vehicle.tripCount > 1);
  };

  const highlyUsedVehicles = getHighlyUsedVehicles();

  // Get all vehicles for "All" filter
  const getAllVehicles = () => {
    return [
      ...inTransitVehicles,
      ...idleVehicles,
      ...workshopVehicles,
      ...fcEndingVehicles,
      ...permitVehicles,
      ...taxVehicles,
      ...insuranceVehicles
    ];
  };

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

    // Apply search filter
    return vehicles.filter(vehicle => 
      vehicle.number.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  const getStatusCounts = () => {
    return {
      'Highly used vehicle': highlyUsedVehicles.length,
      'FC Ending': fcEndingVehicles.length,
      'Permit': permitVehicles.length,
      'Tax': taxVehicles.length,
      'Insurance': insuranceVehicles.length,
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
        if (gestureTranslationY > -50 || velocityY > 200) {
          toValue = 0;
        } else {
          toValue = -150;
        }
      } else {
        if (gestureTranslationY < -50 || velocityY < -300) {
          toValue = -250;
        } else {
          toValue = 0;
        }
      }
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  const statusCounts = getStatusCounts();
  const maxValue = Math.max(...Object.values(statusCounts));

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />

      <VehiclePopupCard
        visible={!!openPopupType}
        activeTab={openPopupType || ''}
        onClose={() => setOpenPopupType(null)}
        vehicleData={{
          'Highly used vehicle': highlyUsedVehicles,
          'FC Ending': fcEndingVehicles,
          'Permit': permitVehicles,
          'Tax': taxVehicles,
          'Insurance': insuranceVehicles,
        }}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.leftsection}>
          <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Asset</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuText}>Menu</Text>
        </TouchableOpacity>
      </View>

      {/* BODY */}
      <View style={styles.bodyContainer}>
        {/* CHART */}
        <View style={styles.chartWrapper}>
          <View style={styles.chartContainer}>
            {Object.entries(statusCounts).map(([label, count]) => {
              const minBarHeight = 50;
              const maxBarHeight = 150;
              const barHeight = maxValue > 0 
                ? minBarHeight + (count / maxValue) * (maxBarHeight - minBarHeight)
                : minBarHeight;
              return (
                <TouchableOpacity
                  key={label}
                  activeOpacity={0.7}
                  onPress={() => setOpenPopupType(label)}
                  style={styles.chartItem}
                >
                  <Text style={styles.chartValue}>{count}</Text>
                  <View style={[styles.chartBar, { height: barHeight }]}>
                    <View style={[styles.chartBarTop, { flex: 0.3 }]} />
                    <View style={[styles.chartBarBottom, { flex: 0.7 }]} />
                  </View>
                  <Text style={styles.chartLabel}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {/* Center Line & Dots */}
          <View style={styles.chartLineContainer}>
            <View style={styles.connectingLine} />
            <View style={styles.dotRow}>
              {Object.keys(statusCounts).map((_, index) => (
                <View key={index} style={styles.dot} />
              ))}
            </View>
          </View>
        </View>

        {/* VEHICLE DETAILS */}
        <Animated.View style={[styles.vehicleWrapper, { transform: [{ translateY: translateY }] }]}>
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanHandlerStateChange}
          >
            <View style={styles.dragBarContainer}>
              <View style={styles.dragHandle} />
              <Text style={styles.sectionTitle}>Vehicle Details</Text>
            </View>
          </PanGestureHandler>

          {/* Search */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by vehicle number"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity style={styles.searchButton}>
              <FontAwesomeIcon icon={faSearch} size={15} color="white" />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView} contentContainerStyle={styles.filterContainer}>
            {['All', 'In Transit', 'Idle Vehicle', 'In Workshop'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterButton, selectedFilter === filter && styles.activeFilterButton]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterText, selectedFilter === filter && styles.activeFilterText]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Vehicle List */}
          <ScrollView contentContainerStyle={styles.vehicleDetailsSection} showsVerticalScrollIndicator={false}>
            {loadingStates.asset ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading vehicles...</Text>
              </View>
            ) : (
              <View style={styles.vehicleList}>
                {getFilteredVehicles().map((vehicle) => (
                  <TouchableOpacity key={`${vehicle.status}-${vehicle.id}`} style={styles.vehicleItem}>
                    <View style={[styles.vehicleIcon, { backgroundColor: vehicle.color }]}>
                      <Text style={styles.vehicleIconText}>🚛</Text>
                    </View>
                    <View style={styles.vehicleInfo}>
                      <Text style={styles.vehicleNumber}>{vehicle.number}</Text>
                      <Text style={styles.vehicleStatus}>{vehicle.status}</Text>
                      {vehicle.driver && vehicle.driver !== 'N/A' && (
                        <Text style={styles.vehicleDetail}>Driver: {vehicle.driver}</Text>
                      )}
                      {vehicle.product && vehicle.product !== 'N/A' && (
                        <Text style={styles.vehicleDetail}>Product: {vehicle.product}</Text>
                      )}
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
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15, marginTop: 30 },
  leftsection: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginLeft: 20 },
  menuButton: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  menuText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  bodyContainer: { flex: 1 },
  chartWrapper: { paddingVertical: 20, backgroundColor: '#F5F6FA' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', paddingHorizontal: 20 },
  chartLineContainer: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' },
  connectingLine: { height: 2, width: '80%', backgroundColor: '#666' },
  dotRow: { position: 'absolute', top: -3, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2196F3' },
  chartItem: { alignItems: 'center', flex: 1 },
  chartBar: { width: 35, borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  chartBarTop: { backgroundColor: 'rgba(110, 163, 224, 0.8)' },
  chartBarBottom: { backgroundColor: '#2196F3' },
  chartLabel: { fontSize: 10, color: '#666', textAlign: 'center', width: 60, paddingTop: 20 },
  chartValue: { fontSize: 14, fontWeight: '700', color: '#070707ff', marginBottom: 6 },
  vehicleWrapper: { backgroundColor: '#fff', padding: 10, borderTopLeftRadius: 40, borderTopRightRadius: 40, elevation: 5, top: 0 },
  dragBarContainer: { paddingVertical: 16, paddingHorizontal: 4, alignItems: 'center' },
  dragHandle: { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, marginBottom: 12 },
  vehicleDetailsSection: { padding: 16, paddingBottom: 500 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 100, marginBottom: 16, paddingHorizontal: 12 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#000' },
  searchButton: { backgroundColor: '#2196F3', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  filterScrollView: { marginBottom: 0 },
  filterContainer: { flexDirection: 'row', paddingHorizontal: 4, gap: 8 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f8f8f8', borderWidth: 1, borderColor: '#e0e0e0', height: 35, marginBottom: 40 },
  activeFilterButton: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  filterText: { fontSize: 12, color: '#666', fontWeight: '500' },
  activeFilterText: { color: '#fff' },
  vehicleList: { gap: 8 },
  vehicleItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  vehicleIcon: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  vehicleIconText: { fontSize: 16 },
  vehicleInfo: { flex: 1 },
  vehicleNumber: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 2 },
  vehicleStatus: { fontSize: 12, color: '#666' },
});

export default VehicleDetailsScreen;