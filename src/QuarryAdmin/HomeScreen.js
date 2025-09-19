import React, { useContext, useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ImageBackground,
  Animated,
  TextInput,
  BackHandler,
  Modal as RNModal,
  TouchableWithoutFeedback,Image,
} from 'react-native';
import CompanyList from '../components/Picker';
import { DataContext } from '../components/common/DataContext';
import { Modal } from 'react-native-paper';
import DateFilter from './DateFilter';
import { LocalDataContext } from '../components/common/LocalDataProvider';
import Loading from '../components/common/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBell, faGlobe, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import LinearGradient from 'react-native-linear-gradient';
import MenuGrid from './HomeShortcuts';
import TopDrawer from './NotificationDrawer';
import GlobalStyle from '../components/common/GlobalStyle';
import NetworkErrorModal from '../QuarryAdmin/NetworkErrorModal';
import NetInfo from '@react-native-community/netinfo';
const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const { dailyData, loading, RefreshData, userMenus } = useContext(DataContext);
  const { profileInfo } = useContext(LocalDataContext);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showNetworkError, setshowNetworkError] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const currentHour = new Date().getHours();
  const isDaytime = currentHour >= 6 && currentHour < 18;
  const imageSource = isDaytime ? require('../images/MorningSun.png') : require('../images/Evening.png');
  const imageStyle = isDaytime ? styles.mrngPhoto : styles.eveningPhoto;
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  
  // Define header animation constants
  const headerMaxHeight = 241;
  const headerMinHeight = 95;
  
  // Header height animation - immediately collapse to min height when search is active
  const headerHeight = isSearchActive 
    ? headerMinHeight 
    : scrollY.interpolate({
        inputRange: [0, headerMaxHeight - headerMinHeight],
        outputRange: [headerMaxHeight, headerMinHeight],
        extrapolate: 'clamp',
      });
  
  // Header image scale and opacity animations
  const headerImageScale = scrollY.interpolate({
    inputRange: [0, 70],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });
  
  // Header image opacity - force to 0 when search is active
  const headerImageOpacity = isSearchActive 
    ? 0 
    : scrollY.interpolate({
        inputRange: [0, 70],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });
  
  // Search box position animation - keep it anchored to the header's bottom
  const searchBoxTop = scrollY.interpolate({
    inputRange: [0, headerMaxHeight - headerMinHeight],
    outputRange: [headerMaxHeight - 20, headerMinHeight - 20],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const networkConnected = state.isConnected && state.isInternetReachable;
      setIsConnected(networkConnected);
      
      // If internet is restored, automatically refresh data
      if (networkConnected && (showNetworkError || error)) {
        setshowNetworkError(false);
        onRefresh();
      } else if (!networkConnected) {
        setshowNetworkError(true);
      }
    });
    
    return () => unsubscribe();
  }, [error, showNetworkError]);
    
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }));
  }, []);

  // Reset screen to initial state
  const resetToInitialState = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    scrollY.setValue(0);
    setHasScrolled(false);
    setIsSearchActive(false);
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    return true;
  }, [scrollY]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await RefreshData();
      setshowNetworkError(false);
      setError(null);

    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(error);
      setshowNetworkError(true);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBranchIconPress = () => {
    setModalVisible(true);
    if (isSearchActive) {
      setSearchQuery('');
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
      setIsSearchActive(false);
    }
  };

  const handleBranchSelect = () => {
    setModalVisible(false);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleSearchFocus = () => {
    if (!modalVisible) {
      setIsSearchActive(true);
      // No need to set scrollY value since we're directly controlling headerHeight now
      setHasScrolled(true);
    }
  };

  const handleSearchBlur = () => {
    if (!searchQuery) {
      setIsSearchActive(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    setIsSearchActive(false);
  };

  const handleNotificationPress = (event) => {
    event.stopPropagation();
    setDrawerVisible(true);
  };

  const handleDrawerClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setDrawerVisible(false);
  };

  const getGreetingMessage = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      return 'Good Morning';
    } else if (currentHour >= 12 && currentHour < 18) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  useEffect(() => {
    setGreeting(getGreetingMessage());
    setCurrentDate(new Date().toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }));
  }, []);

  useEffect(() => {
    if (modalVisible && isSearchActive) {
      setIsSearchActive(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  }, [modalVisible]);

  const handleBackPress = useCallback(() => {
    if (modalVisible) {
      setModalVisible(false);
      return true;
    }
    
    if (customModalVisible) {
      setCustomModalVisible(false);
      return true;
    }
    
    if (drawerVisible) {
      setDrawerVisible(false);
      return true;
    }
    
    if (isSearchActive || hasScrolled) {
      resetToInitialState();
      return true;
    }
    
    return false;
  }, [modalVisible, customModalVisible, drawerVisible, isSearchActive, hasScrolled, resetToInitialState]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    
    return () => backHandler.remove();
  }, [handleBackPress]);

  if (loading || (!dailyData && dailyData?.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
    );
  }
  
  // Handle scroll events with improved throttling
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false,
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        if (offsetY > 10 && !hasScrolled) {
          setHasScrolled(true);
        }
      }
    }
  );

  // Adjust padding when search is active
  const contentPaddingTop = isSearchActive 
    ? headerMinHeight + 60 
    : headerMaxHeight + 60;

  return (
    <>
      <Animated.View
        style={[
          styles.mainHeader,
          {
            height: headerHeight,
            backgroundColor: '#3E89EC',
            zIndex: 10,
            opacity: drawerVisible ? 0 : 1,
            pointerEvents: drawerVisible ? 'none' : 'auto',
          }
        ]}
      >
        {/* Animated Header Background - Only visible when search is not active */}
        {!isSearchActive && (
          <Animated.View style={[
            styles.headerBackground,
            {
              opacity: headerImageOpacity,
              transform: [{ scale: headerImageScale }]
            }
          ]}>
            <ImageBackground
              style={styles.headerBgImage}
              resizeMode="contain"
              source={require('../images/sazswater.png')}
              imageStyle={styles.imageStyle}
            />
          </Animated.View>
        )}

        {/* Header Content */}
        <View style={styles.headerContent}>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>Home</Text>
            <View style={styles.iconContainer}>
              {/* <TouchableOpacity
                onPress={handleNotificationPress}
                style={{ marginRight: 18 }}
                activeOpacity={0.7}>
                <FontAwesomeIcon icon={faBell} size={20} color="#FFFFFF" />
              </TouchableOpacity> */}
              <TouchableOpacity
                onPress={handleBranchIconPress}
                style={{ marginRight: 10 }}
                activeOpacity={0.7}>
                <FontAwesomeIcon icon={faGlobe} size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {!isSearchActive && (
            <Animated.View 
              style={[
                styles.greetingCardContainer,
                { opacity: headerImageOpacity }
              ]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={['#ffffff', '#e0e0e0']}
                style={styles.gradientCard}>
                <ImageBackground
                  resizeMode="cover"
                  imageStyle={[imageStyle, styles.mrngPhoto]}
                  source={imageSource}>
                  <View>
                    <Text style={StyleSheet.compose(GlobalStyle.heading4, styles.cardTitle)}>
                      {greeting},</Text>
                    <Text style={StyleSheet.compose(GlobalStyle.heading4, styles.cardTitle)}>
                      {profileInfo.CompanyName}</Text>
                    <Text style={StyleSheet.compose(GlobalStyle.heading6, styles.cardSubtitle)}>
                      {currentDate}</Text>
                  </View>
                </ImageBackground>
              </LinearGradient>
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {/* Animated Search Bar - Now attached to the header and moves with it */}
      {!drawerVisible && (
        <Animated.View 
          style={[
            styles.searchContainer,
            {
              top: isSearchActive ? headerMinHeight - 20 : searchBoxTop,
              zIndex: 15, // Increased zIndex to ensure it stays above content
              opacity: drawerVisible ? 0 : 1,
            }
          ]}
          pointerEvents="box-none"
        >
          <TouchableWithoutFeedback>
            <View style={[
              styles.searchBox,
              modalVisible && styles.disabledSearchBox
            ]}>
              <FontAwesomeIcon 
                icon={faSearch} 
                size={18} 
                color={modalVisible ? "#999" : "#2563EB"}
                style={styles.searchIcon}
              />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                editable={!modalVisible}
                selectTextOnFocus={!modalVisible}
              />
              {searchQuery && !modalVisible ? (
                <TouchableOpacity onPress={clearSearch}>
                  <FontAwesomeIcon icon={faTimes} size={16} color="#999" />
                </TouchableOpacity>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      )}

      {/* Content ScrollView */}
      <Animated.ScrollView
        ref={scrollViewRef}
        style={[
          styles.scrollViewContent,
          {
            zIndex: 2,
            opacity: drawerVisible ? 0.3 : 1,
            pointerEvents: drawerVisible || modalVisible ? 'none' : 'auto',
          }
        ]}
        contentContainerStyle={{ 
          paddingTop: contentPaddingTop,
          paddingBottom: 20,
        }}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3E89EC']} 
            tintColor={'#3E89EC'}
          />
        }
      >
        {/* Create a spacer when search is active to prevent content from being hidden */}
        {isSearchActive && <View style={{ height: 10 }} />}
        
        <View style={styles.menuGridContainer}>
          <MenuGrid menuData={userMenus} searchQuery={modalVisible ? '' : searchQuery} />
        </View>
        {dailyData && dailyData.length > 0 ? null : (
  <View style={styles.noDataContainer}>
    <Image
      source={require('../images/NoResult.png')}
      style={styles.noDataImage}
      resizeMode="contain"
    />
    <Text style={styles.noDataText}>No Data Available</Text>
  </View>
)}

      </Animated.ScrollView>

      {/* Company Selection Modal */}
      <RNModal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleModalClose}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={handleModalClose}
        >
          <View 
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <CompanyList onSelect={handleBranchSelect} />
          </View>
        </TouchableOpacity>
      </RNModal>

      {/* Date Filter Modal */}
      <Modal
        visible={customModalVisible}
        onDismiss={() => setCustomModalVisible(false)}>
        <DateFilter CloseModel={setCustomModalVisible} />
      </Modal>

      {/* Notification Drawer */}
      <TopDrawer
        isVisible={drawerVisible}
        onClose={handleDrawerClose}
        style={{ zIndex: 20 }}
      />

      {/* Network Error Modal */}
      <NetworkErrorModal 
        visible={!isConnected || showNetworkError} 
        onRefresh={onRefresh} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  mainHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerBgImage: {
    width: 232,
    marginTop: 33,
    height: 208,
    alignSelf: 'flex-end',
    marginRight: width -230,
  },
  headerContent: {
    paddingTop: 35,
    paddingHorizontal: 20,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  headerText: {
    fontSize: 22,
    color: 'white',
    fontFamily: 'Cabin-Bold',
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingCardContainer: {
    marginTop: 30,
    marginBottom: 10,
  },
  searchContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 15,
    height: 40,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
    paddingHorizontal: 15,
    height: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop:30,
  },
  disabledSearchBox: {
    backgroundColor: '#f0f0f0',
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'black',
    paddingHorizontal: 5,
    paddingVertical: 8,
    textAlignVertical: 'center',
    includeFontPadding: false, 
    top:10,
  },
  imageStyle: {
    width: 232,
    height: 208,
    alignSelf: 'flex-end',
    marginLeft: width - 232,
  },
  mrngPhoto: {
    width: '60%',
    height: 90,
    marginLeft: width - 270,
    left: 25,
    top: 12,
  },
  eveningPhoto: {
    width: '50%',
    height: 80,
    marginLeft: width - 270,
    left: 50,
    top: -8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: 'black'
  },
  gradientCard: {
    borderRadius: 15,
    paddingHorizontal: 20,
    height: 120,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    color: 'black',
    marginBottom: 5,
    fontFamily: 'Cabin-Bold',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'black',
    fontFamily: 'Cabin-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollViewContent: {
    flex: 1,
  },
  menuGridContainer: {
    zIndex: 3,
    elevation: 1,
    bottom: 30,
  },
  noDataContainer: {
    alignItems: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
  
  noDataImage: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  
  noDataText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
  },
  
});

export default HomeScreen;