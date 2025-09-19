import React, {useState, useEffect, useContext, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  useWindowDimensions,
  KeyboardAvoidingView,
  Animated,
} from 'react-native';
import {SwipeListView} from 'react-native-swipe-list-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Dimensions} from 'react-native';
import LottieView from 'lottie-react-native';
import {VehicleDataContext} from './VehicleDataContext';
import {useNavigation} from '@react-navigation/native';
import GlobalStyle from '../components/common/GlobalStyle';
import Loading from '../components/common/Loading.js';
import NetworkErrorModal from '../QuarryAdmin/NetworkErrorModal';

const {width, height} = Dimensions.get('window');

// Separate regular components from animated ones
const StatCard = ({label, value}) => {
  const {width} = useWindowDimensions();

  return (
    <View
      style={[styles.statCard, GlobalStyle.starcard, {padding: width * 0.03}]}>
      <Text style={GlobalStyle.heading6}>{label}</Text>
      <Text style={[GlobalStyle.heading4, {fontSize: width * 0.045}]}>
        {value}
      </Text>
    </View>
  );
};

const HeaderSection = ({vehicleData, handleAttendance, scrollY}) => {
  const {width} = useWindowDimensions();

  // Calculate animated values

  const translateY = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, -140],
    extrapolate: 'clamp',
  });

  const contentOpacity = scrollY.interpolate({
    inputRange: [0, 90],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 90], // Smaller range to hide faster
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Use simpler structure with fewer nested animated components

  return (
    <View>
      <Text style={styles.staticSecurityText}>Security</Text>
      <Animated.View
        style={[GlobalStyle.headerImage, {transform: [{translateY}]}]}>
        <Animated.Image
          style={{
            width: 232,
            height: 208,
            position: 'absolute',
            top: 35,
            right: 0,
            elevation: 5,
            zindex: 100,
            opacity: imageOpacity, // Use the dedicated animation value
          }}
          resizeMode="contain"
          source={require('../images/LOGO.png')}
        />

        {/* Use the style prop correctly */}
        <Animated.View style={{opacity: contentOpacity}}>
          <View style={[styles.statsContainer, {padding: width * 0.04}]}>
            <StatCard
              label="Vehicles In"
              value={vehicleData.inVehicles.length}
            />
            <StatCard
              label="ALL Vehicles"
              value={vehicleData.outVehicles.length}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const VehicleReport = () => {
   // Add styles for the top loading indicator
   const topLoadingStyle = {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
    zIndex: 1000,
  };
  
  // Add a style for the loading overlay that's more transparent
  const loadingOverlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // More transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensure it appears on top of everything
  };
  const [activeTab, setActiveTab] = useState('in');
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTriggered, setRefreshTriggered] = useState(false);
  const {width, height} = useWindowDimensions();
  // Create animated scroll value
  const scrollY = useRef(new Animated.Value(0)).current;

  const {
    vehicleData,
    fetchVehicleData,
    handleConfirmVehicleOut,
    handleVehicleOut,
    setSelectedPassNo,
    selectedPassNo,
    loading,
    setLoading,
    setRefreshing,
    refreshing,
    setVehicleData,
    vehicleOutData,
    setVehicleOutData,
    setShowDetailsModal,
    showDetailsModal,
    handleUndoVehicleOut,
    setAlertInfo,
    alertInfo,
    errorState,
    setErrorState,
    networkError,
        setNetworkError,
        retryConnection,
  } = useContext(VehicleDataContext);

  

  const displayData =
    activeTab === 'in' ? vehicleData.inVehicles : vehicleData.outVehicles;

  // Add effect to detect when the entire app needs refreshing
  useEffect(() => {
    // Refresh when coming back to this screen from another screen
    const unsubscribe = navigation.addListener('focus', () => {
      if (refreshTriggered) {
        onRefresh();
        setRefreshTriggered(false);
      }
    });

    return unsubscribe;
  }, [navigation, refreshTriggered]);

  // Initial data loading
  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await fetchVehicleData();
      } catch (error) {
        console.error('Loading error:', error);
        // Check if it's a network error
        if (error.message && (
            error.message.includes('network') || 
            error.message.includes('connection') || 
            error.message.includes('offline') ||
            error.message === 'Network request failed'
          )) {
            setAlertInfo({...alertInfo, visible: false});
          setNetworkError(true);
        } else {
          // For other types of errors, use the CustomAlertModal
          setNetworkError(false);
          setAlertInfo({
            visible: true,
            title: 'Error',
            message: 'Failed to load vehicle data. Please try again.',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  const onRefresh = async () => {
    setRefreshing(true);
    setIsLoading(true); // Show the main loading indicator during refresh
    
    try {
      // Fetch all data needed for the entire page
      await fetchVehicleData();
      
      // If you have other data to fetch for the page, add it here
      // For example:
      // await fetchOtherData();
      // await fetchAdditionalStats();
      
      // Reset any state that needs refreshing
      setActiveTab('in'); // Reset to default tab if needed
    } catch (error) {
      console.error('Refresh error:', error);
      // Check if it's a network error
      if (error.message && (
          error.message.includes('network') || 
          error.message.includes('connection') || 
          error.message.includes('offline') ||
          error.message === 'Network request failed'
        )) {
          setAlertInfo({...alertInfo, visible: false});
        setNetworkError(true);
      } else {
        // For other types of errors, use the CustomAlertModal
        setNetworkError(false);
        setAlertInfo({
          visible: true,
          title: 'Error',
          message: 'Failed to refresh data. Please try again.',
        });
      }
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  };
  // Define the handlePullToRefresh function properly
  const handlePullToRefresh = () => {
    setRefreshTriggered(true);
    onRefresh();
  };
  const handleAttendance = () => {
    navigation.navigate('EmployeeDetails');
  };

  // Set up animated scroll event
  const handleScroll = Animated.event(
    [{nativeEvent: {contentOffset: {y: scrollY}}}],
    {useNativeDriver: false},
  );

  const listTranslateY = scrollY.interpolate({
    inputRange: [0, 240],
    outputRange: [0, -140], // Move the list up but slightly less than tabs
    extrapolate: 'clamp',
  });

  const handleRetryConnection = () => {
    retryConnection(); // Use the function from context
    setNetworkError(false);
  };

  return (
    <View style={styles.mainContainer}>
      <SafeAreaView
        style={[styles.safeArea, {marginTop: 0}]}
        edges={['left', 'right', 'bottom']}>

{(isLoading && refreshing) && (
        <View style={loadingOverlayStyle}>
          <Loading />
        </View>
      )} 
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={GlobalStyle.container}>
          {/* Header Section with scroll animation */}
          <HeaderSection
            vehicleData={vehicleData}
            handleAttendance={handleAttendance}
            scrollY={scrollY}
          />
          <Animated.View style={{transform: [{translateY: listTranslateY}]}}>
            {/* Static Filter Tabs */}
            <View style={styles.tabContainer}>
              <TabButton
                label="In Vehicles"
                active={activeTab === 'in'}
                onPress={() => setActiveTab('in')}
              />
              <TabButton
                label="All Vehicles"
                active={activeTab === 'all'}
                onPress={() => setActiveTab('all')}
              />
            </View>

            {/* SwipeListView with onScroll handler */}
            <SwipeListView
              data={displayData}
              renderItem={({item}) => (
                <VehicleCard item={item} activeTab={activeTab} />
              )}
              renderHiddenItem={({item}) => (
                <View style={styles.rowBack}>
                  {activeTab === 'in' ? (
                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        {backgroundColor: '#FF5252'},
                      ]}
                      onPress={() => handleVehicleOut(item.PassNo)}>
                      <Text style={styles.deleteText}>Vehicle Out</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.deleteButton,
                        {backgroundColor: '#4CAF50'},
                      ]}
                      onPress={() => handleUndoVehicleOut(item.PassNo)}>
                      <Text style={styles.deleteText}>Undo</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              keyExtractor={(item, index) => item.PassNo || `item-${index}`}
              ListFooterComponent={<View style={{height: 30}} />}
              rightOpenValue={-95}
              disableRightSwipe
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handlePullToRefresh} // Use our new function here
                  colors={['#216dce']} // Android
                  tintColor="#216dce" // iOS
                  title="Refreshing..." // iOS
                  titleColor="#216dce" // iOS
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>No vehicles found</Text>
                </View>
              }
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
          </Animated.View>
        </KeyboardAvoidingView>

        <CustomAlertModal
          visible={alertInfo.visible}
          title={alertInfo.title}
          message={alertInfo.message}
          onClose={() => setAlertInfo({...alertInfo, visible: false})}
        />
         <NetworkErrorModal 
          visible={networkError}
          onRetry={handleRetryConnection}
          onClose={() => setNetworkError(false)}
        />
        <VehicleDetailsModal
          visible={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          data={vehicleOutData}
          passNo={selectedPassNo}
          onVehicleOut={handleConfirmVehicleOut}
        />
      </SafeAreaView>
    </View>
  );
};

const TabButton = ({label, active, onPress}) => (
  <TouchableOpacity
    style={[styles.tab, active && styles.activeTab]}
    onPress={onPress}>
    <Text style={[styles.tabText, active && styles.activeTabText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const VehicleDetailRow = ({label, value}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailText}>{value}</Text>
  </View>
);

const VehicleCard = ({item, activeTab}) => (
  <View style={styles.vehicleCard}>
    <View style={styles.vehicleHeader}>
      <Text style={styles.vehicleNumber}>{item.VechNumber || 'Unknown'}</Text>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              activeTab === 'in'
                ? '#4CAF50'
                : item.Status === 'In'
                ? '#4CAF50'
                : '#FF9800',
          },
        ]}>
        <Text style={styles.statusText}>
          {activeTab === 'in' ? 'In' : item.Status}
        </Text>
      </View>
    </View>

    <View style={styles.vehicleDetails}>
      <VehicleDetailRow label="Pass No:" value={item.PassNo} />
      <VehicleDetailRow label="Gate Pass For:" value={item.GatePassFor} />
      {item.RawMaterial && (
        <VehicleDetailRow label="Raw Material:" value={item.RawMaterial} />
      )}
    </View>
  </View>
);

const CustomAlertModal = React.memo(({visible, title, message, onClose}) => {
  const slideAnim = useRef(new Animated.Value(300)).current; // Starts off-screen
  const fadeAnim = useRef(new Animated.Value(0)).current; // Starts invisible

  const isError = title === 'Error';
 
  // Determine which animation to use based on the error condition
  const animationSource = visible 
  ? (isError
    ? require('../images/wrongx.json')
    : require('../images/Animation3.json'))
  : null;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={[
          styles.modalOverlay1,
          {opacity: fadeAnim}, // Apply fade effect
        ]}>
        <Animated.View
          style={[
            styles.alertContainer,
            {transform: [{translateY: slideAnim}]}, // Slide effect
          ]}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>

          <View style={styles.animationContainer}>
            <LottieView
              style={styles.WelcomeAnime}
              source={animationSource}
              autoPlay
              loop={false}
              onAnimationFinish={onClose}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});

const VehicleDetailsModal = ({
  visible,
  onClose,
  data,
  passNo,
  onVehicleOut,
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Vehicle Out Details</Text>
        {data ? (
          <View style={styles.detailsContainer}>
            <VehicleDetailRow label="Check-In:" value={data.Column1} />
            <VehicleDetailRow label="Enum Name:" value={data.Enumname} />
            <VehicleDetailRow label="Check-Out:" value={data.Column2} />
            <VehicleDetailRow label="Count Out:" value={data.CountOut} />
            <VehicleDetailRow label="Pass No:" value={passNo} />
            <VehicleDetailRow
              label="Invoice:"
              value={data.Column3.replace(/<[^>]+>/g, '')}
            />
          </View>
        ) : (
          <ActivityIndicator size="large" color="#216dce" />
        )}

        <TouchableOpacity style={styles.closeButton} onPress={onVehicleOut}>
          <Text style={styles.buttonText}>Vehicle Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// Main Component
const styles = StyleSheet.create({
  // Main containers
  body: {flex: 1},
  staticSecurityText: {
    fontSize: 28,
    fontFamily: 'Cabin-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 10,

    padding: 10,

    position: 'absolute', // Keeps it fixed
    top: 30, // Adjust to match design

    left: '15%',
    transform: [{translateX: -50}], // Centers it
    zIndex: 10, // Ensures it stays above
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F6F3EC',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F3EC',
  },

  // Header styles
  header: {
    padding: width * 0.04,
  },
  headertext: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
    marginLeft: 10,
  },

  // Stats related
  
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: width * 0.2,
  },
  statCard: {
    backgroundColor: '#ffffff',
    flex: 1,
    marginHorizontal: width * 0.02,
    borderRadius: 8,
    padding: width * 0.03,
    alignItems: 'center',
  },
  statLabel: {
    color: '#333333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statValue: {
    color: '#216dce',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Attendance
  attendanceButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: width * 0.03,
    borderRadius: 20,
    marginLeft: width * 0.59,
    marginRight: width * 0.02,
    marginTop: width * -0.09,
    alignSelf: 'flex-start',
    elevation: 3,
  },
  attendanceButtonText: {
    fontSize: width * 0.04,
    color: '#000000',
    fontWeight: '600',
  },
  attendanceIcon: {
    width: width * 0.05,
    height: width * 0.05,
    marginRight: width * 0.02,
  },

  // Vehicle related
  vehicleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: width * 0.04,
    marginBottom: height * 0.01,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  vehicleNumber: {
    fontSize: width * 0.04,

    color: '#333333',
    fontFamily: 'Cabin-Bold',
  },
  vehicleDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
    fontFamily: 'Cabin-Bold',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginBottom: height * 0.01,
    paddingHorizontal: width * 0.02,
  },
  tab: {
    flex: 1,
    padding: width * 0.03,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: width * 0.01,
    marginTop: height * 0.01,
    fontFamily: 'Cabin-Bold',
  },
  activeTab: {
    backgroundColor: '#3E89EC',
    fontFamily: 'Cabin-Bold',
  },
  tabText: {
    color: '#333333',

    fontFamily: 'Cabin-Bold',
  },
  activeTabText: {
    color: '#ffffff',
    fontFamily: 'Cabin-Bold',
  },

  // Status styles
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
    fontFamily: 'Cabin-Bold',
  },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontFamily: 'Cabin-Bold',
  },
  detailLabel: {
    color: '#555555',
    fontSize: 14,
    fontFamily: 'Cabin-Regular',
  },
  detailText: {
    color: '#333333',

    fontSize: 14,
    fontFamily: 'Cabin-Bold',
  },
  detailsContainer: {
    width: '100%',
    marginVertical: 10,
  },

  // Content
  content: {
    flex: 1,
    padding: 10,
  },

  // Delete functionality
  deleteButton: {
    width: width * 0.25,
    height: height * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginTop: 4,
  },
  deleteText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontFamily: 'Cabin-Bold',
  },
  rowBack: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingRight: 0,
  },
   animationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'white',
    fontFamily: 'Cabin-Bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay1: {
    flex: 1,
    justifyContent: 'flex-end', // Align modal at the bottom
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dimmed background
  },
  modalContent: {
    width: width * 0.8,
    maxHeight: height * 0.8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: width * 0.05,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },

  // Form elements
  dropdown: {
    width: '100%',
    marginVertical: 10,
    borderColor: '#cccccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF5252',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontFamily: 'Cabin-Bold',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#216dce',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },

  // Alert styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  alertContainer: {
    width: '100%',
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 20,

    color: '#333',
    fontFamily: 'Cabin-Medium',
  },
  alertMessage: {
    fontSize: 15,

    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Cabin-Regular',
  },
  alertButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  alertConfirmButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  alertConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cabin-Medium',
  },
  alertCloseButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  alertCloseText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cabin-Bold',
  },
  alertOkButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 100,
    borderRadius: 8,
    fontFamily: 'Cabin-Bold',
    marginTop: 120,
  },
  alertOkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Cabin-Bold',
  },

  // Animation
  WelcomeAnime: {
    width: 250,
    height: 250,
    margin: 'auto',
  },
  animationcontainer: {
    width: '70%',
    height: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  loadingOverlayStyle : {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // More transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensure it appears on top of everything
  },

  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  
  emptyListText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    fontFamily: 'Cabin-Bold',
  },
});

export default VehicleReport;
