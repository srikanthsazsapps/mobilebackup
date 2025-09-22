import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
  Image
} from 'react-native';
import { X, FileText, CreditCard, Shield, Car, AlertTriangle, Truck } from 'lucide-react-native';
import GlobalStyle from '../../components/common/GlobalStyle';

// Import your "No Data" image here (update path as needed)
import NoDataImage from '../../images/NoResult.png';

const { width, height } = Dimensions.get('window');

const daysBetween = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  const ms = 1000 * 60 * 60 * 24;
  return Math.ceil((date2 - date1) / ms);
};

const today = new Date();

const PERIODS = [
  { key: 'total', label: 'Total' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' }
];

const FIELD_MAP = {
  'FC Ending': 'fcDate',
  'Permit': 'permitDate',
  'Tax': 'taxDate',
  'Insurance': 'insuranceDate',
};

const filterByPeriod = (items, field, period) => {
  if (!Array.isArray(items)) return [];
  switch (period) {
    case 'week':
      return items.filter(
        it =>
          it[field] &&
          daysBetween(today, new Date(it[field])) <= 7 &&
          daysBetween(today, new Date(it[field])) >= 0
      );
    case 'month':
      return items.filter(
        it =>
          it[field] &&
          daysBetween(today, new Date(it[field])) <= 31 &&
          daysBetween(today, new Date(it[field])) >= 0
      );
    case 'year':
      return items.filter(
        it =>
          it[field] &&
          daysBetween(today, new Date(it[field])) <= 366 &&
          daysBetween(today, new Date(it[field])) >= 0
      );
    default:
      return items;
  }
};

const ExpiryCard = ({ item, fieldName }) => {
  if (!item[fieldName]) return null;
  const daysLeft = daysBetween(today, new Date(item[fieldName]));
  let barColor = '#C16161';
  if (daysLeft > 30) barColor = '#7AB134';
  else if (daysLeft <= 30 && daysLeft >= 8) barColor = '#FFDB44';

  return (
    <View style={styles.fcVehicleCard}>
      <View style={[styles.fcHighlightBar, { backgroundColor: barColor }]} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[GlobalStyle.H7, styles.fcVehicleNumber]}>{item.number}</Text>
          <Text style={[GlobalStyle.H77, styles.fcDaysLeft]}>
            {daysLeft < 0 ? 'Expired' : `${daysLeft} Days Left`}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
          <Text style={[GlobalStyle.H88, styles.fcLabel]}>
            Expiring on
            <Text style={[GlobalStyle.H88, styles.fcValue]}> {String(item[fieldName]).split('T')[0]}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const LoaderDataCard = ({ item }) => {
  return (
    <View style={styles.fcVehicleCard}>
      <View style={[styles.fcHighlightBar, { backgroundColor: '#795548' }]} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[GlobalStyle.H7, styles.fcVehicleNumber]}>{item.number}</Text>
          <Text style={[GlobalStyle.H77, styles.fcDaysLeft]}>{item.loader}</Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={[GlobalStyle.H88, styles.fcLabel]}>
            Loaded By: <Text style={[GlobalStyle.H88, styles.fcValue]}>{item.loadedBy || 'N/A'}</Text>
          </Text>
        </View>
        <View style={styles.statsRow}>
          <Text style={[GlobalStyle.H88, styles.fcLabel]}>
            Total Hours: <Text style={[GlobalStyle.H88, styles.fcValue]}>{item.totalHours || 0}</Text>
          </Text>
          <Text style={[GlobalStyle.H88, styles.fcLabel]}>
            Diesel: <Text style={[GlobalStyle.H88, styles.fcValue]}>{item.diesel || 0} L</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

const VehiclePopupCard = ({
  visible,
  activeTab: initialTab = 'Highly Used',
  onClose,
  vehicleData = {}
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [subTab, setSubTab] = useState('Highly Used');
  const [loading, setLoading] = useState(false);
  const [showAmountFilterDropdown, setShowAmountFilterDropdown] = useState(false);
  const [filterType, setFilterType] = useState('trip-desc'); // 'trip' or 'trip-desc' for trips, 'hours' or 'hours-desc' for hours
  const blinkAnim = useRef(new Animated.Value(1)).current;

  const [fcFilter, setFCFilter] = useState('total');
  const [permitFilter, setPermitFilter] = useState('total');
  const [taxFilter, setTaxFilter] = useState('total');
  const [insFilter, setInsFilter] = useState('total');

  useEffect(() => {
    if (visible) setActiveTab(initialTab);
  }, [visible, initialTab]);

  useEffect(() => {
    if (activeTab === 'Highly Used') {
      setLoading(true);
      setTimeout(() => setLoading(false), 800);
    }
  }, [activeTab, subTab]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 500, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const tabs = [
    { id: 'Highly Used', label: 'Highly Used', color: '#3E89EC', icon: Car },
    { id: 'FC Ending', label: 'FC Ending', color: '#3E89EC', icon: AlertTriangle },
    { id: 'Permit', label: 'Permit', color: '#3E89EC', icon: FileText },
    { id: 'Tax', label: 'Tax', color: '#3E89EC', icon: CreditCard },
    { id: 'Insurance', label: 'Insurance', color: '#3E89EC', icon: Shield }
  ];

  const subTabs = [
    { id: 'Highly Used', label: 'Trip Wise Detail', icon: Car },
    { id: 'Loader Data', label: 'Hours Wise Detail', icon: Truck }
  ];

  // Filter functions
  const sortByTripCount = (data, order) => {
    return [...data].sort((a, b) => {
      const aTrips = a.tripCount || 0;
      const bTrips = b.tripCount || 0;
      return order === 'lowToHigh' ? aTrips - bTrips : bTrips - aTrips;
    });
  };

  const sortByHours = (data, order) => {
    return [...data].sort((a, b) => {
      const aHours = a.totalHours || 0;
      const bHours = b.totalHours || 0;
      return order === 'lowToHigh' ? aHours - bHours : bHours - aHours;
    });
  };

  const getSortedTripData = () => {
    const data = vehicleData['Highly Used'] || [];
    let sortedData = [...data];
    
    if (filterType === 'trip') {
      sortedData = sortByTripCount(sortedData, 'lowToHigh');
    } else if (filterType === 'trip-desc') {
      sortedData = sortByTripCount(sortedData, 'highToLow');
    } else {
      // Default sorting - high to low
      sortedData = sortByTripCount(sortedData, 'highToLow');
    }
    
    return sortedData;
  };

  const getSortedHoursData = () => {
    const data = vehicleData['Loader Data'] || [];
    let sortedData = [...data];
    
    if (filterType === 'hours') {
      sortedData = sortByHours(sortedData, 'lowToHigh');
    } else if (filterType === 'hours-desc') {
      sortedData = sortByHours(sortedData, 'highToLow');
    } else {
      // Default sorting - high to low
      sortedData = sortByHours(sortedData, 'highToLow');
    }
    
    return sortedData;
  };

  const renderTripFilterDropdown = () => {
    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[styles.dropdownItem, { borderTopWidth: 0 }]}
          onPress={() => {
            setFilterType('trip');
            setShowAmountFilterDropdown(false);
          }}
        >
          <Text style={styles.dropdownText}>Low to High</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dropdownItem, { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }]}
          onPress={() => {
            setFilterType('trip-desc');
            setShowAmountFilterDropdown(false);
          }}
        >
          <Text style={styles.dropdownText}>High to Low</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHoursFilterDropdown = () => {
    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={[styles.dropdownItem, { borderTopWidth: 0 }]}
          onPress={() => {
            setFilterType('hours');
            setShowAmountFilterDropdown(false);
          }}
        >
          <Text style={styles.dropdownText}>Low to High</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dropdownItem, { borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }]}
          onPress={() => {
            setFilterType('hours-desc');
            setShowAmountFilterDropdown(false);
          }}
        >
          <Text style={styles.dropdownText}>High to Low</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render functions for Highly Used tab
  const renderHighlyUsedVehicle = () => {
    const sortedData = getSortedTripData();
    return (
      <View>
        {sortedData.map((item, index) => (
          <View key={item.number || index} style={styles.vehicleCard}>
            <View style={styles.cardRow}>
              <View style={styles.verticalBar} />
              <View style={{ flex: 1 }}>
                <Text style={[GlobalStyle.H7, styles.vehicleNumber]}>
                  {item.number || `Vehicle ${index + 1}`}
                </Text>
                <View style={styles.statsRow}>
                  <Text style={[GlobalStyle.H88, styles.fcLabel]}>
                    Trips: <Text style={[GlobalStyle.H88, styles.fcValue]}>{item.tripCount || 0}</Text>
                  </Text>
                  <Text style={[GlobalStyle.H88, styles.fcLabel]}>
                    Amount: <Text style={[GlobalStyle.H88, styles.fcValue]}>{(item.totalAmount || 0).toLocaleString()}</Text>
                  </Text>
                </View>
                {item.driverName && (
                  <View style={styles.statsRow}>
                    <Text style={[GlobalStyle.H88, styles.fcLabel]}>
                      Driver: <Text style={[GlobalStyle.H88, styles.fcValue]}>{item.driverName}</Text>
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderLoaderDataTab = () => {
    const sortedData = getSortedHoursData();
    return (
      <View>
        {sortedData.map((item, index) => (
          <LoaderDataCard key={item.number || index} item={item} />
        ))}
      </View>
    );
  };

  const renderExpiryTab = (data, fieldName, period, setPeriod) => {
    const filtered = filterByPeriod(data, fieldName, period);
    return (
      <View>
        <View style={{ marginBottom: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={[styles.chip, period === p.key && styles.chipActive, { marginRight: 8, marginBottom: 8 }]}
            >
              <Text style={[GlobalStyle.H88, styles.chipText, period === p.key && styles.chipTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {filtered.length > 0 ? (
          filtered.map((item, idx) => (
            <ExpiryCard key={item.number + idx} item={item} fieldName={fieldName} />
          ))
        ) : (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Image source={NoDataImage} style={{ width: 120, height: 120, marginBottom: 16, resizeMode: 'contain' }} />
            <Text style={{ color: '#888' }}>No vehicles</Text>
          </View>
        )}
      </View>
    );
  };

  const getTabContent = () => {
    const data = vehicleData[activeTab] || [];
    if (loading && activeTab === 'Highly Used') {
      return <ActivityIndicator size="large" color="#3E89EC" style={{ marginTop: 20 }} />;
    }
    if (activeTab === 'Highly Used') {
      return (
        <View>
          <View style={styles.subTabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {subTabs.map(subTabItem => {
                const isActive = subTab === subTabItem.id;
                const IconComponent = subTabItem.icon;
                return (
                  <TouchableOpacity
                    key={subTabItem.id}
                    onPress={() => setSubTab(subTabItem.id)}
                    style={[styles.subTabBtn, isActive ? styles.chipActive : styles.chip]}
                  >
                    <IconComponent size={14} color={isActive ? '#fff' : '#333'} />
                    <Text style={[GlobalStyle.H88, styles.chipText, isActive ? styles.chipTextActive : {}]}>
                      {subTabItem.label}
                    </Text>
                    {isActive && (
                      <TouchableOpacity
                        onPress={() => setShowAmountFilterDropdown(true)}
                        style={styles.filterIconButton}
                      >
                        <Image 
                          source={require('../../images/Sorting.png')} 
                          style={styles.filterImage}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            {/* Filter Dropdown */}
            {showAmountFilterDropdown && (
              <TouchableWithoutFeedback onPress={() => setShowAmountFilterDropdown(false)}>
                <View style={styles.dropdownOverlay}>
                  {subTab === 'Highly Used' ? renderTripFilterDropdown() : renderHoursFilterDropdown()}
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
          
          {subTab === 'Highly Used' && (data.length > 0 ? renderHighlyUsedVehicle() : (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Image source={NoDataImage} style={{ width: 120, height: 120, marginBottom: 16, resizeMode: 'contain' }} />
              <Text style={{ color: '#888', textAlign: 'center' }}>No data available</Text>
            </View>
          ))}
          {subTab === 'Loader Data' && (vehicleData['Loader Data']?.length > 0 ? renderLoaderDataTab() : (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Image source={NoDataImage} style={{ width: 120, height: 120, marginBottom: 16, resizeMode: 'contain' }} />
              <Text style={{ color: '#888', textAlign: 'center' }}>No loader data available</Text>
            </View>
          ))}
        </View>
      );
    }
    if (activeTab === 'FC Ending') return renderExpiryTab(data, 'fcDate', fcFilter, setFCFilter);
    if (activeTab === 'Permit') return renderExpiryTab(data, 'permitDate', permitFilter, setPermitFilter);
    if (activeTab === 'Tax') return renderExpiryTab(data, 'taxDate', taxFilter, setTaxFilter);
    if (activeTab === 'Insurance') return renderExpiryTab(data, 'insuranceDate', insFilter, setInsFilter);
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Image source={NoDataImage} style={{ width: 120, height: 120, marginBottom: 16, resizeMode: 'contain' }} />
        <Text style={{ color: '#888', textAlign: 'center' }}>No data available</Text>
      </View>
    );
  }; 

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.popup}>
              {/* Close */}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <X size={20} color="#666" />
              </TouchableOpacity>

              {/* Header */}
              <View style={styles.header}>
                <Text style={[GlobalStyle.H5, styles.headerTitle]}>Vehicle</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                  {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    const IconComponent = tab.icon;
                    return (
                      <TouchableOpacity
                        key={tab.id}
                        onPress={() => setActiveTab(tab.id)}
                        style={[styles.tabBtn, isActive ? { backgroundColor: tab.color } : { backgroundColor: '#ccc' }]}
                      >
                        <IconComponent size={14} color={isActive ? '#fff' : '#333'} />
                        <Text style={[GlobalStyle.H2, styles.tabText, isActive ? { color: '#fff' } : { color: '#333' }]}>
                          {tab.label}
                        </Text>
                        {tab.id === 'FC Ending' && !isActive && (
                          <Animated.View
                            style={{
                              width: 8, height: 8, borderRadius: 4,
                              backgroundColor: 'red', marginLeft: 5, opacity: blinkAnim
                            }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
              >
                {getTabContent()}
              </ScrollView>

              {/* Bottom Bar */}
              {activeTab === 'Highly Used' && subTab === 'Highly Used' && vehicleData['Highly Used']?.length > 0 && (
                <View style={styles.totalAmountBar}>
                  <Text style={[GlobalStyle.H15, styles.totalLabel]}>Total Income</Text>
                  <Text style={[GlobalStyle.H15, styles.totalValue]}>
                    {vehicleData['Highly Used']
                      .reduce((sum, v) => sum + (v.totalAmount || 0), 0)
                      .toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  // popup: { backgroundColor: '#fff', borderRadius: 24, width: width - 32, maxHeight: height * 0.65, overflow: 'hidden' },
    popup: { backgroundColor: '#fff', borderRadius: 24, width: width - 32, height: "70%", overflow: 'hidden' },

  closeBtn: { position: 'absolute', top: 14, right: 14, zIndex: 10, padding: 6, backgroundColor: '#f8f8f8', borderRadius: 20 },
  header: { backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, marginRight: 8 },
  subTabBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 14, 
    marginRight: 8,
    position: 'relative',
    
  },
  tabText: { marginLeft: 6 },
  content: { padding: 20 },
  subTabContainer: {
    position: 'relative',
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    minHeight: 64,
    justifyContent: 'center'
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  verticalBar: { width: 5, height: '90%', backgroundColor: '#FFA726', borderTopLeftRadius: 16, borderBottomLeftRadius: 16, marginRight: 10 },
  vehicleNumber: { marginBottom: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fcVehicleCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 16, marginBottom: 18, minHeight: 70, padding: 14, alignItems: 'center' },
  fcHighlightBar: { width: 6, height: '80%', borderRadius: 4, marginRight: 12 },
  fcVehicleNumber: { fontWeight: '600' },
  fcDaysLeft: { fontWeight: '600' },
  fcLabel: { color: '#666' },
  fcValue: { fontWeight: '600', color: '#333' },
  chip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#F1F5F9', marginRight: 10, borderWidth: 1, borderColor: '#ececec' },
  chipActive: { backgroundColor: '#3E89EC', borderColor: '#3E89EC' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  totalAmountBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: '#227DDF',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 20
  },
  totalLabel: { color: '#fff', fontWeight: '600' },
  totalValue: { color: '#fff', fontWeight: '600' },
  headerTitle: { fontWeight: 'bold', marginBottom: 12 },
  // Filter Dropdown Styles
  filterIconButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 50,
    width: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginLeft: 8
  },
  filterImage: {
    width: 13,
    height: 13,
    tintColor: '#fff',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 40,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 120
  },
  dropdownContainer: {
    borderRadius: 12,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  }
});

export default VehiclePopupCard;