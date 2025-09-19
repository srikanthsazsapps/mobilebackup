import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faSort, faSortUp, faSortDown, faRefresh } from '@fortawesome/free-solid-svg-icons';
import GlobalStyle from "../../components/common/GlobalStyle";
import { scale, verticalScale } from 'react-native-size-matters';
import { DashesDataContext } from '../../components/common/DashesDataContext';
import Loading from '../../components/common/Loading';
import DashesDateFilter from './DashesDataFilter';

// Function to convert string to camelCase
const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return "";
      return index === 0 ? match.toUpperCase() : match.toUpperCase();
    });
};

// Function to format number to Indian format (e.g., 10,00,000)
const formatIndianNumber = (num) => {
  if (isNaN(num)) return '0';
  const numStr = Math.abs(num).toFixed(0); // Remove decimal places
  let lastThree = numStr.slice(-3);
  const otherNumbers = numStr.slice(0, -3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedNumber = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `${num < 0 ? '-' : ''}${formattedNumber}`;
};

const { width } = Dimensions.get('window');

const AccountsScreen = ({ navigation }) => {
  const {
    accountsData,
    loadingStates,
    fetchSingleDashboard,
    fetchCustomDashboard,
    selectedCompany,
    startDate,
    endDate,
    setTodayRange,
    setYesterdayRange,
    setWeekRange,
    setMonthRange
  } = useContext(DashesDataContext);

  const [dateTab, setDateTab] = useState('Today');
  const [activeTab, setActiveTab] = useState('Receivables');
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState('alphabetical');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (startDate && endDate) {
      fetchSingleDashboard('accounts');
    }
  }, [selectedCompany, startDate, endDate]);

  const startSpinAnimation = () => {
    spinAnim.setValue(0);
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopSpinAnimation = () => {
    spinAnim.stopAnimation();
    spinAnim.setValue(0);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchSingleDashboard('accounts');
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onManualRefresh = async () => {
    if (isManualRefreshing || refreshing) return;
    
    try {
      setIsManualRefreshing(true);
      startSpinAnimation();
      await fetchSingleDashboard('accounts');
    } catch (error) {
      console.error('Error manually refreshing data:', error);
    } finally {
      setIsManualRefreshing(false);
      stopSpinAnimation();
    }
  };

  const getAccountData = () => {
    if (!accountsData || accountsData.length === 0) {
      return { receivablesArray: [], payablesArray: [] };
    }
    
    let receivablesArray = [];
    let payablesArray = [];
    
    if (Array.isArray(accountsData)) {
      if (accountsData[0] && Array.isArray(accountsData[0])) {
        receivablesArray = accountsData[0] || [];
        payablesArray = accountsData[1] || [];
      } else {
        receivablesArray = accountsData;
        payablesArray = accountsData;
      }
    }
    
    return { receivablesArray, payablesArray };
  };

  const { receivablesArray, payablesArray } = getAccountData();

  const receivablesData = receivablesArray
    .filter(item => {
      const amount = parseFloat(item.Balance || 0);
      return item && 
             item.Na && 
             item.Na.trim() !== '' && 
             amount !== 0;
    })
    .map((item, index) => {
      const parsedAmount = parseFloat(item.Balance || 0);
      return {
        id: index + 1,
        name: toCamelCase(item.Na.toString().trim()),
        amount: parsedAmount,
        Na: item.Na,
        Balance: formatIndianNumber(parsedAmount)
      };
    });

  const payablesData = payablesArray
    .filter(item => {
      const amount = parseFloat(item.Balance || 0);
      return item && 
             item.Na && 
             item.Na.trim() !== '' && 
             amount !== 0;
    })
    .map((item, index) => {
      const parsedAmount = parseFloat(item.Balance || 0);
      return {
        id: index + 1,
        name: toCamelCase(item.Na.toString().trim()),
        amount: parsedAmount,
        Na: item.Na,
        Balance: formatIndianNumber(parsedAmount)
      };
    });

  const sortData = (data) => {
    const sortedData = [...data];
    
    switch (sortOrder) {
      case 'highToLow':
        return sortedData.sort((a, b) => {
          const amountA = typeof a.amount === 'number' ? a.amount : parseFloat(a.amount || 0);
          const amountB = typeof b.amount === 'number' ? b.amount : parseFloat(b.amount || 0);
          return amountB - amountA;
        });
      case 'lowToHigh':
        return sortedData.sort((a, b) => {
          const amountA = typeof a.amount === 'number' ? a.amount : parseFloat(a.amount || 0);
          const amountB = typeof b.amount === 'number' ? b.amount : parseFloat(b.amount || 0);
          return amountA - amountB;
        });
      case 'alphabetical':
      default:
        return sortedData.sort((a, b) => a.Na.localeCompare(b.Na));
    }
  };

  const sortedReceivablesData = sortData(receivablesData);
  const sortedPayablesData = sortData(payablesData);
  const currentData = activeTab === 'Receivables' ? sortedReceivablesData : sortedPayablesData;

  const receivablesTotal = receivablesData
    .filter((item) => {
      const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || 0);
      return amount > 0; // Only include positive values
    })
    .reduce((sum, item) => {
      const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || 0);
      return sum + amount;
    }, 0);
  
  const payablesTotal = payablesData.reduce((sum, item) => {
    const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || 0);
    return sum + amount;
  }, 0);

  const getDateRangeDescription = () => {
    switch (dateTab) {
      case 'Today':
        return '';
      case 'Yesterday':
        return '';
      case 'Week':
        return '';
      case 'Month':
        return '';
      case '':
        return '';
      default:
        return '';
    }
  };

  const handleSortPress = () => {
    if (sortOrder === 'alphabetical') {
      setSortOrder('highToLow');
    } else if (sortOrder === 'highToLow') {
      setSortOrder('lowToHigh');
    } else {
      setSortOrder('alphabetical');
    }
  };

  const getSortIcon = () => {
    switch (sortOrder) {
      case 'highToLow':
        return faSort;
      case 'lowToHigh':
        return faSort;
      case 'alphabetical':
      default:
        return faSort;
    }
  };

  const getSortButtonText = () => {
    switch (sortOrder) {
      case 'highToLow':
        return 'High to Low';
      case 'lowToHigh':
        return 'Low to High';
      case 'alphabetical':
      default:
        return 'A-Z';
    }
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab || refreshing || isManualRefreshing) return;

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(tab);
      setSortOrder('alphabetical');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleDateTabPress = async (tab) => {
    if (refreshing || isManualRefreshing) return;
    
    setDateTab(tab);
    
    try {
      if (tab === 'Custom') {
        setShowDateFilterModal(true);
      } else {
        setRefreshing(true);
        if (tab === 'Today') {
          await setTodayRange('accounts');
        } else if (tab === 'Yesterday') {
          await setYesterdayRange('accounts');
        } else if (tab === 'Week') {
          await setWeekRange('accounts');
        } else if (tab === 'Month') {
          await setMonthRange('accounts');
        }
      }
    } catch (error) {
      console.error('Error updating date range:', error);
    } finally {
      if (tab !== 'Custom') {
        setRefreshing(false);
      }
    }
  };

  const handleCustomDateSelect = async (startDateTime, endDateTime) => {
    try {
      setRefreshing(true);
      await fetchCustomDashboard('accounts', startDateTime, endDateTime);
    } catch (error) {
      console.error('Error fetching custom date data:', error);
    } finally {
      setRefreshing(false);
      setShowDateFilterModal(false);
    }
  };

  const tabs = ['Yesterday', 'Today', 'Week', 'Month', 'Custom'];

  if (loadingStates.accounts) {
    return <Loading />;
  }

  if (isManualRefreshing) {
    return (
      <View style={styles.Container}>
        <Loading />
      </View>
    );
  }

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.Container}>
      <Modal
        visible={showDateFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDateFilterModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDateFilterModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.glassModalContent}>
                <DashesDateFilter
                  CloseModel={() => setShowDateFilterModal(false)}
                  onDateSelected={handleCustomDateSelect}
                  initialFromDate={startDate}
                  initialToDate={endDate}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <View // Fixed from View to ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3E89EC']}
            tintColor="#3E89EC"
            title="Refreshing accounts data..."
            titleColor="#3E89EC"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ImageBackground
            source={require('../../images/LogoWaterMark.png')}
            style={styles.headerImage}
            resizeMode="contain"
          />
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <FontAwesomeIcon
                icon={faArrowLeft}
                size={22}
                color="white"
                style={{ top: 11, right: 12 }}
              />
            </TouchableOpacity>
            <Text style={[GlobalStyle.H3, styles.headerText]}>Accounts</Text>
          </View>
          <View style={styles.daycontainer}>
            {tabs.map((tab, index) => (
              <React.Fragment key={tab}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    dateTab === tab && styles.dateTab,
                    index === 0 && styles.firstTab,
                    index === tabs.length - 1 && styles.lastTab,
                  ]}
                  onPress={() => handleDateTabPress(tab)}
                  disabled={refreshing || isManualRefreshing}
                >
                  <Text
                    style={[
                      styles.tabText,
                      GlobalStyle.H12,
                      dateTab === tab && styles.activeTabText,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
                {index < tabs.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>
        <View style={styles.profitCard}>
          <View style={styles.netProfitRow}>
            <Text style={[GlobalStyle.H5]}>{getDateRangeDescription()} {activeTab}</Text>
            <Text
              style={[
                GlobalStyle.heading5,
                styles.netProfitAmount,
                (activeTab === 'Receivables' ? receivablesTotal : payablesTotal) < 0 && styles.negativeAmount
              ]}
            >
              ₹ {formatIndianNumber(activeTab === 'Receivables' ? receivablesTotal : payablesTotal)}
            </Text>
            <Image
              source={
                activeTab === 'Receivables'
                  ? require('../../images/receivables.png')
                  : require('../../images/payables.png')
              }
              style={styles.netProfitImage}
            />
          </View>
          <View style={styles.switchContainer}>
            <TouchableOpacity
              style={[
                styles.switchButton,
                activeTab === 'Receivables' && styles.activeSwitchButton
              ]}
              onPress={() => handleTabChange('Receivables')}
              disabled={refreshing || isManualRefreshing}
            >
              <Text
                style={[
                  styles.switchButtonText,
                  activeTab === 'Receivables' && styles.activeSwitchButtonText
                ]}
              >
                Receivables
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.switchButton,
                activeTab === 'Payables' && styles.activeSwitchButton
              ]}
              onPress={() => handleTabChange('Payables')}
              disabled={refreshing || isManualRefreshing}
            >
              <Text
                style={[
                  styles.switchButtonText,
                  activeTab === 'Payables' && styles.activeSwitchButtonText
                ]}
              >
                Payables
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Animated.View style={[styles.tableContainer, { opacity: fadeAnim, bottom: 80, paddingBottom: 90 }]}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableheaderText, GlobalStyle.H7, { flex: 0.3, color: '#444' }]}>S.no</Text>
            <Text style={[GlobalStyle.H7, styles.tableheaderText, { flex: 0 }]}>Name</Text>
            <View style={styles.amountHeaderContainer}>
              <Text style={[GlobalStyle.H7, styles.tableheaderText, { flex: 0.5 }]}>Amount</Text>
              <TouchableOpacity 
                style={styles.sortButton}
                onPress={handleSortPress}
                disabled={refreshing || isManualRefreshing}
              >
                <FontAwesomeIcon
                  icon={getSortIcon()}
                  size={16}
                  color="#4D8FE6"
                  style={styles.sortIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={{ maxHeight: 375 }} nestedScrollEnabled={true}>
            {refreshing && (
              <View style={styles.refreshingOverlay}>
                <ActivityIndicator size="large" color="#3E89EC" />
              </View>
            )}
            {currentData.length > 0 ? (
              currentData.map((item, index) => {
                const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.Balance || 0);
                const isNegative = amount < 0;
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 0 ? styles.rowOdd : styles.rowEven,
                      refreshing && styles.refreshingRow
                    ]}
                  >
                    <Text style={[GlobalStyle.H7, styles.cellText, { flex: 0.4 }]}>{item.id}</Text>
                    <Text style={[GlobalStyle.H8, styles.cellText, { flex: 0.8 }]}>{item.name}</Text>
                    <Text
                      style={[
                        GlobalStyle.H8,
                        styles.cellText,
                        styles.amountText,
                        { flex: 0.7 },
                        isNegative && styles.negativeAmount
                      ]}
                    >
                      ₹{item.Balance}
                    </Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.noDataContainer}>
                <Image
                  source={require('../../images/NoResult.png')}
                  style={styles.noDataImage}
                  resizeMode="contain"
                />
                <Text style={[styles.noDataText, GlobalStyle.H13]}>No Data Available</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    width: '100%',
    height: 231,
    backgroundColor: '#3E89EC',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    position: 'relative',
  },
  headerImage: {
    position: 'absolute',
    width: 232,
    marginTop: 33,
    height: 208,
    alignSelf: 'flex-end',
    marginLeft: width - 232,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 35,
    marginLeft: 35,
    paddingTop: 40,
  },
  headerText: {
    color: '#FFFFFF',
    marginLeft: scale(1),
    top: verticalScale(10),
  },
  daycontainer: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    borderRadius: scale(5),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    top: scale(13),
    height: scale(30),
    marginVertical: verticalScale(2),
    width: scale(320),
    justifyContent: 'center',
    alignSelf: 'center',
    top: 23,
  },
  tab: {
    flex: 1,
    paddingVertical: scale(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateTab: {
    backgroundColor: '#FFFFFF',
  },
  firstTab: {
    borderTopLeftRadius: scale(1),
    borderBottomLeftRadius: scale(1),
  },
  lastTab: {
    borderTopRightRadius: scale(1),
    borderBottomRightRadius: scale(1),
  },
  tabText: {
    color: '#FFFFFF',
  },
  activeTabText: {
    color: '#3E89EC',
  },
  divider: {
    width: scale(1),
    backgroundColor: '#FFFFFF',
    height: '100%',
  },
  profitCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 25,
    padding: 20,
    borderRadius: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    bottom: 80,
  },
  netProfitRow: {
    marginBottom: 5,
  },
  netProfitAmount: {
    color: '#7AB134',
    marginTop: 5,
  },
  netProfitImage: {
    position: 'absolute',
    top: 0,
    right: 5,
    width: 90,
    height: 90,
    marginTop: -20,
    resizeMode: 'contain',
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    borderRadius: 20,
    padding: 1,
    alignSelf: 'center',
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
    fontFamily: 'Cabin-Medium',
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },
  activeSwitchButtonText: {
    color: '#FFF',
  },
  tableContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.99)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  tableheaderText: {
    color: '#444',
    marginTop: 8,
  },
  amountHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.8,
    justifyContent: 'flex-end',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    top: 5,
    borderColor: '#4D8FE6',
  },
  sortIcon: {
    right: 10,
  },
  sortButtonText: {
    fontSize: 10,
    color: '#4D8FE6',
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 2,
    borderRadius: 20,
  },
  rowOdd: {
    backgroundColor: '#F6F3ED',
    marginHorizontal: 2,
  },
  rowEven: {
    backgroundColor: '#F6F3ED',
    marginHorizontal: 2,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  cellText: {
    color: '#333',
  },
  amountText: {
    textAlign: 'right',
  },
  negativeAmount: {
    color: 'black',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  refreshingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshingText: {
    marginTop: verticalScale(10),
    color: '#3E89EC',
    fontSize: scale(14),
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
    textAlign: 'center',
    left: 15,
  },
});

export default AccountsScreen;