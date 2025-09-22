import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
  BackHandler,
  ImageBackground,
  SafeAreaView,
  Alert,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { SalesDataContext } from './SalesDataContext';
import InfoCard from '../InfoCard';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import LinearGradient from 'react-native-linear-gradient';
import Loading from '../../components/common/Loading';
import DateFilter from '../DateFilter';
import NetInfo from '@react-native-community/netinfo';

const { width } = Dimensions.get('window');

export const formattedValue = value => {
  const amount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  })
    .format(value)
    .replace('₹', '₹ ');
  return amount;
};

const SalesScreen = () => {
  const { dailyData, SetToday, SetYesterday, SetWeek, SetMonth, loading } = useContext(SalesDataContext);
  const [activeFilter, setActiveFilter] = useState('Today');
  const [activeTab, setActiveTab] = useState('tab1');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const navigation = useNavigation();
  const totalData = dailyData && dailyData.length > 0 ? dailyData[1][0] : {};
  const tab1Data = dailyData && dailyData.length > 0 ? dailyData[3] : [];
  const tab2Data = dailyData && dailyData.length > 0 ? dailyData[4] : [];

  const fetchData = async fetchFunction => {
    try {
      setError(null);
      await fetchFunction();
    } catch (err) {
      console.error('Error:', err.message);
      setError(err.message);
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        setShowNetworkModal(true);
      }
    }
  };

  useEffect(() => {
    fetchData(SetToday);
    const unsubscribe = NetInfo.addEventListener(state => {
      const connectionStatus = state.isConnected && state.isInternetReachable;
      setIsConnected(connectionStatus);
      if (!connectionStatus) setShowNetworkModal(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleBackButtonClick = () => {
      if (showDateFilter) {
        setShowDateFilter(false);
        return true;
      } else if (showNetworkModal) {
        setShowNetworkModal(false);
        return true;
      } else if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      } else {
        Alert.alert('Exit App', 'Are you sure you want to exit?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => backHandler.remove();
  }, [navigation, showDateFilter, showNetworkModal]);

  const onRefresh = async () => {
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      setShowNetworkModal(true);
      return;
    }
    setRefreshing(true);
    await fetchData(
      activeFilter === 'Today' ? SetToday :
      activeFilter === 'Yesterday' ? SetYesterday :
      activeFilter === 'Week' ? SetWeek : SetMonth
    );
    setRefreshing(false);
  };

  const handleFilterChange = async filter => {
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      setShowNetworkModal(true);
      return;
    }
    setActiveFilter(filter);
    setRefreshing(true);
    await fetchData(
      filter === 'Today' ? SetToday :
      filter === 'Yesterday' ? SetYesterday :
      filter === 'Week' ? SetWeek :
      filter === 'Month' ? SetMonth : null
    );
    setRefreshing(false);
  };

  if (loading && !refreshing) return <Loading />;

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        style={styles.headerBackground}
        resizeMode="contain"
        imageStyle={styles.imageStyle}
        source={require('../../images/sazswater.png')}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesomeIcon size={20} color="white" icon={faArrowLeft} style={{top:12,left:10}}/>
          </TouchableOpacity>
          <Text style={styles.headerText}>Sales</Text>
        </View>

        <View style={styles.FiltersBox}>
          {['Yesterday', 'Today', 'Week', 'Month', 'Custom'].map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.FilterButtons,
                activeFilter === filter && styles.activeTab,
                filter === 'Yesterday' && { borderLeftWidth: 0 },
              ]}
              onPress={() =>
                filter === 'Custom' ? (setActiveFilter('Custom'), setShowDateFilter(true)) : handleFilterChange(filter)
              }>
              <Text
                style={activeFilter === filter ? styles.activeTabText : styles.FilterButtonText}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <LinearGradient colors={['#ffffff', '#ffffff']} style={styles.gradientCard}>
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Total Amount</Text>
              <View style={styles.amountRow}>
                <Text style={[styles.valueText, { color: 'green' }]}>{formattedValue(totalData.TotalSales)}</Text>
                <Image
                  source={require('../../images/ssimg.png')}
                  style={styles.icon}
                />
              </View>
              <View style={styles.subDataRow}>
                <Text style={styles.subText}>
                  <Text style={styles.subLabel}>Trips: </Text>
                  {totalData.TotalTrips}
                </Text>
                <Text style={styles.subText1}>
                  <Text style={styles.subLabel}>MT: </Text>
                  {totalData.TotalMT}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.fixedTabsContainer}>
            <View style={styles.switchingTabs}>
              {['tab1', 'tab2'].map(tab => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tabItem, activeTab === tab && styles.activeTab]}
                  onPress={() => setActiveTab(tab)}>
                  <LinearGradient
                    colors={activeTab === tab ? ['#4FAAF3', '#3E89EC'] : ['#ffffff', '#ffffff']}
                    style={styles.tabItemBackground}>
                    <Text
                      style={{
                        color: activeTab === tab ? 'white' : 'black',
                        fontSize: 14,
                        fontFamily: 'Cabin-Bold',
                      }}>
                      {tab === 'tab1' ? 'Customer Wise' : 'Product Wise'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>

      <ScrollView
        style={styles.scrollableContent}
        contentContainerStyle={styles.scrollableContentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.cardsContainer}>
          {activeTab === 'tab1' &&
            tab1Data.map(item => (
              <InfoCard
                key={item.CustomerName}
                title={item.CustomerName}
                amount={item.TotalNetAmount}
                weight={item.TotalNetWeight}
                trips={item.Trips}
              />
            ))}
          {activeTab === 'tab2' &&
            tab2Data.map(item => (
              <InfoCard
                key={item.ProductName}
                title={item.ProductName}
                amount={item.TotalNetAmount}
                weight={item.TotalNetWeight}
                trips={item.Trips}
              />
            ))}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showDateFilter}
        onRequestClose={() => setShowDateFilter(false)}>
        <TouchableWithoutFeedback onPress={() => setShowDateFilter(false)}>
          <View style={styles.modalBackground}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View>
                <DateFilter CloseModel={setShowDateFilter} />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3ED',
  },
  headerBackground: {
    height: 300, // Increased slightly to accommodate larger filter buttons
    backgroundColor: '#3E89EC',
    paddingTop: 35,
    paddingHorizontal: 20,
  },
  imageStyle: {
    width: 232,
    marginTop: 33,
    height: 208,
    alignSelf: 'flex-end',
    marginLeft: width - 232,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    marginLeft: 20,
    color: 'white',
    fontFamily: 'Cabin-Bold',
    top:10
  },
    FiltersBox: {
    flexDirection: 'row',
    borderRadius: 5,
    justifyContent: 'space-around',
    marginTop: 23,
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
  gradientCard: {
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 10,
    height:160
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
    bottom:8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 70,
    height: 70,
    marginLeft: 100,
    bottom:20,
  },
  title: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Cabin-Bold',
    top:10
  },
  valueText: {
    fontSize: 20,
    fontFamily: 'Cabin-Bold',
    marginVertical: 5,
    bottom:8
  },
  subDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  subText: {
    color: 'black',
    fontSize: 14,
    fontFamily: 'Cabin-Bold',
    bottom:15
  },
  subText1: {
    color: 'black',
    fontSize: 14,
    fontFamily: 'Cabin-Bold',
    bottom:15,
    right:20
  },
  subLabel: {
    fontFamily: 'Cabin-Bold',
    fontSize: 14,
  },
  fixedTabsContainer: {
    paddingHorizontal: 5,
    bottom:26,
  },
  switchingTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    borderRadius: 10,
  },
  tabItemBackground: {
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: 'rgb(33,109,206)',
    elevation: 10,
  },
  scrollableContent: {
    flex: 1,
    backgroundColor: '#F6F3ED',
  },
  scrollableContentContainer: {
    paddingBottom: 20,
  },
  cardsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SalesScreen;