import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  View,
  Dimensions,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  RefreshControl,
  BackHandler,
  Alert,
  Animated,
  TextInput, 
  ScrollView,
} from 'react-native';
import CompanyList from '../components/Picker';
import { DataContext } from '../components/common/DataContext';
import { Modal } from 'react-native-paper';
import DateFilter from './DateFilter';
import { LocalDataContext } from '../components/common/LocalDataProvider';
import Loading from '../components/common/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faBell, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import LinearGradient from 'react-native-linear-gradient';
import { Card } from 'react-native-paper';
import ButtonList from './navbuttons';
import TopDrawer from './NotificationDrawer';

const { width, height } = Dimensions.get('window');

const Dash = ({ navigation }) => {
  const {
    dailyData,
    loading,
    RefreshData,
    SetToday,
    SetYesterday,
    SetWeek,
    SetMonth,
  } = useContext(DataContext);
  const { profileInfo } = useContext(LocalDataContext);
  const [activeTab, setActiveTab] = useState('Today');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const scrollViewRef = useRef(null);
  
  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const searchInputRef = useRef(null);
  
  // Define header animation constants
  const headerMaxHeight = 241;
  const headerMinHeight = 100;
  
  // Header height animation
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
  
  const headerImageOpacity = isSearchActive 
    ? 0 
    : scrollY.interpolate({
        inputRange: [0, 70],
        outputRange: [1, 0],
        extrapolate: 'clamp',
      });
  
  // GradientCard opacity animation - fade out when scrolling
  const gradientCardOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  
  // Search box position animation
  const searchBoxTop = scrollY.interpolate({
    inputRange: [0, headerMaxHeight - headerMinHeight],
    outputRange: [headerMaxHeight - 20, headerMinHeight - 20],
    extrapolate: 'clamp',
  });

  const FormatNumber = (value) => {
    const formattedValue = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    })
      .format(value)
      .replace('₹', '₹ ');
    return formattedValue;
  };

const OverallSummary =
  dailyData && dailyData?.length > 0
    ? [
        {
          ...dailyData[1][0],
          TotalMTandTrips:
            (dailyData[1][0].TotalMT || 0).toString() +
            ' - ' +
            (dailyData[1][0].TotalTrips || 0).toString(),
          TotalPurchase:
            (dailyData[0][0].TotalQty || 0).toString() +
            ' - ' +
            (dailyData[0][0].TotalTrips || 0).toString(),
          // Updated to use TotalCashCount instead of TotalTrips
          TotalCashSalesWithTrips:
            (dailyData[1][0].TotalCashSales || 0).toString() +
            ' - ' +
            (dailyData[1][0].TotalCashCount || 0).toString(),
          // Updated to use TotalCreditCount instead of TotalTrips  
          TotalCreditSalesWithTrips:
            (dailyData[1][0].TotalCreditSales || 0).toString() +
            ' - ' +
            (dailyData[1][0].TotalCreditCount || 0).toString(),
        },
      ]
    : [];


  const updatedData = OverallSummary.map(
    ({ TotalMT, TotalSales, TotalTrips, ...rest }) => rest,
  );

  const fetchData = async (fetchFunction) => {
    try {
      setError(null);
      await fetchFunction();
    } catch (err) {
      console.error('Error:', err.message);
      setError(err.message);
    }
  };

  const handleSearchFocus = () => {
    if (!modalVisible) {
      setIsSearchActive(true);
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

  const resetToInitialState = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    scrollY.setValue(0);
    setIsSearchActive(false);
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    return true;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData(
        activeTab === 'Today' ? SetToday :
        activeTab === 'YesterDay' ? SetYesterday :
        activeTab === 'Week' ? SetWeek : SetMonth
      );
      setError(null);
      resetToInitialState();
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setRefreshing(true);
    fetchData(
      tab === 'Today' ? SetToday :
      tab === 'YesterDay' ? SetYesterday :
      tab === 'Week' ? SetWeek :
      tab === 'Month' ? SetMonth : null
    ).finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchData(SetToday);
  }, []);

  useEffect(() => {
    const handleBackButtonClick = () => {
      if (modalVisible) {
        setModalVisible(false);
        return true;
      } else if (customModalVisible) {
        setCustomModalVisible(false);
        return true;
      } else if (drawerVisible) {
        setDrawerVisible(false);
        return true;
      } else if (isSearchActive) {
        resetToInitialState();
        return true;
      } else if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      } else {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            { text: 'OK', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false },
        );
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );

    return () => backHandler.remove();
  }, [navigation, modalVisible, customModalVisible, drawerVisible, isSearchActive]);

  // Handle scroll events
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Adjust content padding when search is active
  const contentPaddingTop = isSearchActive 
    ? headerMinHeight + 60 
    : headerMaxHeight + 60;

  if ((loading && !refreshing) || refreshing) {
    return <Loading />;
  }

  if (error) {
    return (
      <View style={styles.fullPageContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRefresh}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.mainHeader,
          {
            height: headerHeight,
            zIndex: 10,
            opacity: drawerVisible ? 0 : 1,
            pointerEvents: drawerVisible ? 'none' : 'auto',
          }
        ]}
      >
        {/* Animated Header Background */}
        {!isSearchActive && (
          <Animated.View style={[
            styles.headerBackground,
            {
              opacity: headerImageOpacity,
              transform: [{ scale: headerImageScale }]
            }
          ]}>
            <ImageBackground
              style={styles.headerBackground}
              resizeMode="contain"
              imageStyle={styles.imageStyle}
              source={require('../images/sazswater.png')}>
            </ImageBackground>
          </Animated.View>
        )}

        {/* Header Content */}
        <View style={styles.headerContent}>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>Dashboard</Text>

            <View style={styles.iconContainer}>
              <View style={styles.bellIcon}>
                {/* <TouchableOpacity
                  onPress={() => setDrawerVisible(true)}
                  style={{ marginRight: 10 }}>
                  <FontAwesomeIcon icon={faBell} size={20} color="white" />
                </TouchableOpacity> */}
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={{ marginRight: 5 }}>
                <FontAwesomeIcon icon={faUser} size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Tabs - Only visible when not searching */}
          {!isSearchActive && (
            <Animated.View
              style={[
                styles.filtersContainer,
                { opacity: headerImageOpacity }
              ]}
            >
              <View style={styles.FiltersBox}>
                <TouchableOpacity
                  style={[
                    styles.FilterButtons,
                    activeTab === 'YesterDay' && styles.activeTab,
                  ]}
                  onPress={() => handleTabChange('YesterDay')}>
                  <Text
                    style={
                      activeTab === 'YesterDay'
                        ? styles.activeTabText
                        : styles.FilterButtonText
                    }>
                    Yesterday
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.FilterButtons,
                    activeTab === 'Today' && styles.activeTab,
                  ]}
                  onPress={() => handleTabChange('Today')}>
                  <Text
                    style={
                      activeTab === 'Today'
                        ? styles.activeTabText
                        : styles.FilterButtonText
                    }>
                    Today
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.FilterButtons,
                    activeTab === 'Week' && styles.activeTab,
                  ]}
                  onPress={() => handleTabChange('Week')}>
                  <Text
                    style={
                      activeTab === 'Week'
                        ? styles.activeTabText
                        : styles.FilterButtonText
                    }>
                    Week
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.FilterButtons,
                    activeTab === 'Month' && styles.activeTab,
                  ]}
                  onPress={() => handleTabChange('Month')}>
                  <Text
                    style={
                      activeTab === 'Month'
                        ? styles.activeTabText
                        : styles.FilterButtonText
                    }>
                    Month
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.FilterButtons,
                    activeTab === 'Custom' && styles.activeTab,
                  ]}
                  onPress={() => {
                    setActiveTab('Custom');
                    setCustomModalVisible(true);
                  }}>
                  <Text
                    style={
                      activeTab === 'Custom'
                        ? styles.activeTabText
                        : styles.FilterButtonText
                    }>
                    Custom
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* Summary Cards - Only visible when not searching */}
         {!isSearchActive && (
  <Animated.View
    style={[
      styles.cardContainer,
      { opacity: headerImageOpacity }
    ]}
  >
    <LinearGradient
      colors={['#ffffff', '#e0e0e0']}
      style={styles.gradientcard}>
      <Card.Content>
        <Text style={styles.cardTitle}>
          {updatedData[0]?.TotalCashSalesWithTrips
            ? FormatNumber(updatedData[0].TotalCashSalesWithTrips.split(' - ')[0]) + 
              ' - ' + 
              updatedData[0].TotalCashSalesWithTrips.split(' - ')[1] + ''
            : '₹ 0 - 0'}
        </Text>
        <Text style={styles.cardSubtitle}>Cash Sales</Text>
      </Card.Content>
    </LinearGradient>

    <LinearGradient
      colors={['#ffffff', '#e0e0e0']}
      style={styles.gradientcard}>
      <Card.Content>
        <Text style={styles.cardTitle}>
          {updatedData[0]?.TotalCreditSalesWithTrips
            ? FormatNumber(updatedData[0].TotalCreditSalesWithTrips.split(' - ')[0]) + 
              ' - ' + 
              updatedData[0].TotalCreditSalesWithTrips.split(' - ')[1] + ''
            : '₹ 0 - 0 '}
        </Text>
        <Text style={styles.cardSubtitle}>Credit Sales</Text>
      </Card.Content>
    </LinearGradient>
  </Animated.View>
)}
        </View>
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={{ 
          paddingTop: contentPaddingTop,
          paddingBottom: 20
        }}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {/* gradientCard section - visible by default, fades out on scroll */}
        <Animated.View 
          style={[
            styles.cardContainer, 
            { paddingHorizontal: 20, opacity: gradientCardOpacity }
          ]}
        >
          <LinearGradient
            colors={['#4FAAF3', '#3E89EC']}
            style={styles.gradientCard}>
            <Card.Content>
              <Text style={styles.cardTitle2}>
                {updatedData[0]?.TotalMTandTrips || 0}
              </Text>
              <Text style={styles.cardSubtitle2}> MT</Text>
            </Card.Content>
          </LinearGradient>

          <LinearGradient
            colors={['#4FAAF3', '#3E89EC']}
            style={styles.gradientCard}>
            <Card.Content>
              <Text style={styles.cardTitle2}>
                {updatedData[0]?.TotalPurchase || 0}
              </Text>
              <Text style={styles.cardSubtitle2}>Total Purchase</Text>
            </Card.Content>
          </LinearGradient>
        </Animated.View>

        {/* Dashboard List Section */}
        <View style={styles.dashboardListContainer}>
          <Text style={styles.navTitle}>Dashboards List</Text>
          <ButtonList searchQuery={searchQuery} />
        </View>
      </Animated.ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        dismissable={true}
        onDismiss={() => setModalVisible(false)}
        style={{ backgroundColor: 'transparent' }}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          <CompanyList onSelect={() => setModalVisible(false)} />
        </View>
      </Modal>

      <Modal
        visible={customModalVisible}
        onDismiss={() => setCustomModalVisible(false)}>
        <DateFilter CloseModel={setCustomModalVisible} />
      </Modal>

      <TopDrawer
        isVisible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3ED',
  },
  scrollView: {
    flex: 1,
  },
  mainHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3E89EC',
    zIndex: 10,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: 241,
  },
  imageStyle: {
    width: 232,
    marginTop: 33,
    height: 208,
    alignSelf: 'flex-end',
    marginLeft: width - 232,
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
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtersContainer: {
    marginTop: 20,
  },
  FiltersBox: {
    flexDirection: 'row',
    borderRadius: 5,
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
    borderColor: 'white',
    borderWidth: 1,
    alignItems: 'center',
  },
  FilterButtons: {
    width: '20%',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderColor: 'white',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: 'rgb(33,109,206)',
    elevation: 20,
  },
  FilterButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  activeTabText: {
    color: 'black',
    fontSize: 12,
    fontWeight: '700',
  },
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  gradientCard: {
    width: '48%',
    borderRadius: 10,
    padding: 5,
    height: 90,
    bottom:65,
    left:1,
    justifyContent: 'center',
  },
  gradientcard: {
    width: '48%',
    borderRadius: 10,
    padding: 5,
    height: 90,
    bottom:10,
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
  cardTitle2: {
    fontSize: 18,
    color: 'white',
    marginBottom: 5,
    fontFamily: 'Cabin-Bold',
  },
  cardSubtitle2: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Cabin-Bold',
  },
  dashboardListContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom:100,
  },
  navTitle: {
    fontSize: 18,
    color: 'black',
    bottom: 60,
    fontFamily: 'Cabin-Bold',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: '10%',
  },
  fullPageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F3ED',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#3E89EC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  bellIcon: {
    marginRight: 10,
  },
});

export default Dash;