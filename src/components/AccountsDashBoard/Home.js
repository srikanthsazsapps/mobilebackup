import React, {useState, useEffect} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  ImageBackground,
  Image,
  Platform,
  Modal,
  Alert,
} from 'react-native';

import axios from 'axios';
import base64 from 'react-native-base64';
import DateTimePicker from '@react-native-community/datetimepicker';
import PieChart from './Pie';
import {getStoredData} from '../../components/common/AsyncStorage';
import Loading from '../../components/common/Loading.js';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

const Home = () => {
  const navigation = useNavigation();
  const [activeMainTab, setActiveMainTab] = useState('product');
  const [activeSubTab, setActiveSubTab] = useState('value');
  const [sortConfig, setSortConfig] = useState({key: 'qty', direction: 'desc'});
  const [activeTab, setActiveTab] = useState('Today');
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customFromDate, setCustomFromDate] = useState(new Date());
  const [customToDate, setCustomToDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // Dynamic company details state
  const [companyDetails, setCompanyDetails] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);

  // Fetch company details on component mount
  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  // Fetch dashboard data when company details are available
  useEffect(() => {
    if (companyDetails) {
      const today = new Date();
      fetchDashboardData(formatDate(today), formatDate(today));
    }
  }, [companyDetails]);

  const fetchCompanyDetails = async () => {
    try {
      setCompanyLoading(true);

      // Get the selected company ID
      const selectedCompanyId = await getStoredData('SelectedCompany');
      if (!selectedCompanyId) {
        Alert.alert('Error', 'No company selected. Please register first.');
        navigation.navigate('Register');
        return;
      }

      // Get all company details
      const allCompanyDetails = await getStoredData('CompanyDetails');
      if (!allCompanyDetails || !Array.isArray(allCompanyDetails)) {
        Alert.alert(
          'Error',
          'Company details not found. Please register first.',
        );
        navigation.navigate('Register');
        return;
      }

      // Find the selected company
      const selectedCompany = allCompanyDetails.find(
        company => company.id === parseInt(selectedCompanyId),
      );

      if (!selectedCompany) {
        Alert.alert(
          'Error',
          'Selected company not found. Please register first.',
        );
        navigation.navigate('Register');
        return;
      }

      setCompanyDetails(selectedCompany);
    } catch (error) {
      console.error('Error fetching company details:', error);
      Alert.alert(
        'Error',
        'Failed to fetch company details. Please try again.',
      );
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleCustomDateSubmit = () => {
    if (customToDate < customFromDate) {
      Alert.alert('Invalid Date Range', 'End date must be after start date');
      return;
    }
    setCustomModalVisible(false);
    fetchDashboardData(formatDate(customFromDate), formatDate(customToDate));
    setActiveTab('Custom');
  };

  const CustomDateModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={customModalVisible}
      onRequestClose={() => setCustomModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Date Range</Text>

          <View style={styles.datePickerContainer}>
            <Text style={styles.dateLabel}>From Date:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowFromPicker(true)}>
              <Text style={styles.dateButtonText}>
                {customFromDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <Text style={styles.dateLabel}>To Date:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowToPicker(true)}>
              <Text style={styles.dateButtonText}>
                {customToDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          </View>

          {(Platform.OS === 'android' || Platform.OS === 'ios') &&
            showFromPicker && (
              <DateTimePicker
                value={customFromDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowFromPicker(false);
                  if (selectedDate) {
                    setCustomFromDate(selectedDate);
                  }
                }}
              />
            )}

          {(Platform.OS === 'android' || Platform.OS === 'ios') &&
            showToPicker && (
              <DateTimePicker
                value={customToDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowToPicker(false);
                  if (selectedDate) {
                    setCustomToDate(selectedDate);
                  }
                }}
              />
            )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setCustomModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleCustomDateSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const formatDate = date => {
    return date.toISOString().split('T')[0] + ' 08:00';
  };

  const fetchDashboardData = async (fromDate, toDate) => {
    if (!companyDetails) {
      console.log('Company details not available, skipping dashboard fetch');
      return;
    }

    setIsLoading(true);
    const requestBody = {
      DashName: 'Purchase',
      FromDate: fromDate,
      ToDate: toDate,
    };

    try {
      // Construct dynamic API URL using company details
      const {Webkey, Username, Password} = companyDetails;
      const apiUrl = `https://${Webkey}.sazss.in/Api/DashesDatas`;

      console.log('Fetching dashboard data from:', apiUrl);
      console.log('Using company details:', {Webkey, Username});
      console.log('Request body:', requestBody);

      // Create authorization header using username and password from company details
      const credentials = base64.encode(
        `${Username.trim()}:${Password.trim()}`,
      );
      const authHeader = `Basic ${credentials}`;

      console.log('Authorization header created for:', Username);

      const response = await axios.post(apiUrl, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      });

      setDashboardData(response.data);
    } catch (error) {
      console.error('Dashboard API error:', error);

      // More detailed error handling
      if (error.response) {
        console.error(
          'Error response:',
          error.response.status,
          error.response.data,
        );
        Alert.alert(
          'Error',
          `Failed to fetch dashboard data (${error.response.status}): ${
            error.response.data?.message ||
            'Please check your company details and try again.'
          }`,
        );
      } else if (error.request) {
        console.error('Network error:', error.request);
        Alert.alert(
          'Error',
          'Network error. Please check your internet connection and try again.',
        );
      } else {
        console.error('Request setup error:', error.message);
        Alert.alert(
          'Error',
          `Failed to fetch dashboard data: ${error.message}`,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const SetYesterday = () => {
    if (!companyDetails) return;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    fetchDashboardData(formatDate(yesterday), formatDate(today));
  };

  const SetToday = () => {
    if (!companyDetails) return;
    const today = new Date();
    fetchDashboardData(formatDate(today), formatDate(today));
  };

  const SetWeek = () => {
    if (!companyDetails) return;
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    fetchDashboardData(formatDate(weekAgo), formatDate(today));
  };

  const SetMonth = () => {
    if (!companyDetails) return;
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);
    fetchDashboardData(formatDate(monthAgo), formatDate(today));
  };

  const calculateTotalQty = data => {
    return data.reduce((total, item) => total + item.qty, 0);
  };

  const getCurrentData = () => {
    if (
      !dashboardData ||
      !Array.isArray(dashboardData) ||
      dashboardData.length < 6
    ) {
      return [];
    }

    const data =
      activeMainTab === 'product' ? dashboardData[4] : dashboardData[5];

    if (!Array.isArray(data)) {
      return [];
    }

    try {
      switch (activeSubTab) {
        case 'value':
          return [...data].sort(
            (a, b) => (b?.NetAmount || 0) - (a?.NetAmount || 0),
          );
        case 'quantity': // Fixed: changed from 'vendor' to 'quantity'
          return [...data].sort((a, b) => (b?.Qty || 0) - (a?.Qty || 0));
        default:
          return data;
      }
    } catch (error) {
      console.error('Error sorting data:', error);
      return [];
    }
  };

  const calculateTotalNetAmount = data => {
    if (!data || !Array.isArray(data)) return 0;
    return data.reduce((total, item) => total + (item.NetAmount || 0), 0);
  };

  const renderTotalPurchase = () => {
    const currentData = getCurrentData();
    const totalNetAmount = calculateTotalNetAmount(currentData);
    return totalNetAmount.toLocaleString();
  };

  // Function to refresh current date range when tab changes
  const refreshCurrentDateRange = () => {
    switch (activeTab) {
      case 'Today':
        SetToday();
        break;
      case 'YesterDay':
        SetYesterday();
        break;
      case 'Week':
        SetWeek();
        break;
      case 'Month':
        SetMonth();
        break;
      case 'Custom':
        fetchDashboardData(
          formatDate(customFromDate),
          formatDate(customToDate),
        );
        break;
      default:
        SetToday();
    }
  };

  // Function to handle main tab changes
  const handleMainTabChange = newTab => {
    setActiveMainTab(newTab);
    setActiveSubTab('value'); // Reset sub-tab to default

    // Refresh data with current date filter
    if (companyDetails) {
      refreshCurrentDateRange();
    }
  };

  const renderPieChart = data => {
    const totalNetAmount = calculateTotalNetAmount(data);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.subTabsContainer}>
          <SubTabButton
            label="Value"
            active={activeSubTab === 'value'}
            onPress={() => setActiveSubTab('value')}
          />
          <SubTabButton
            label="Quantity"
            active={activeSubTab === 'quantity'}
            onPress={() => setActiveSubTab('quantity')}
          />
        </View>

        {data && data.length > 0 && (
          <PieChart data={data} type={activeSubTab} />
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent1}
          showsVerticalScrollIndicator={false}>
          <View style={styles.totalOverlay3}>
            <Text style={styles.totalLabel3}>Total</Text>
            <Text style={styles.totalValue2}>
              ₹{totalNetAmount.toLocaleString()}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  };
  const MainTabButton = ({label, active, onPress}) => (
    <TouchableOpacity
      style={[styles.mainTabButton, active && styles.activeMainTabButton]}
      onPress={onPress}>
      <Text style={[styles.mainTabText, active && styles.activeMainTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Updated SubTabButton component
  const SubTabButton = ({label, active, onPress}) => (
    <TouchableOpacity
      style={[styles.subTabButton, active && styles.activeSubTabButton]}
      onPress={onPress}>
      <Text style={[styles.subTabText, active && styles.activeSubTabText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Show loading if company details are not loaded yet
  if (companyLoading || !companyDetails) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ImageBackground
          style={styles.headerBackground}
          source={require('../../images/LOGO.png')}
          resizeMode="contain"
          imageStyle={styles.headerImage}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Purchase Summary</Text>
            {/* <Text style={styles.headerSubtitle}>Dashboard</Text>
            {/* Display company name for confirmation */}
            {/* <Text style={styles.companyName}>
              {companyDetails?.CompanyName || 'Company'}
            </Text> */}
          </View>
        </ImageBackground>

        <View style={styles.FiltersBox}>
          <TouchableOpacity
            style={[
              styles.FilterButtons,
              activeTab === 'YesterDay' && styles.activeTab,
            ]}
            onPress={() => {
              setActiveTab('YesterDay');
              SetYesterday();
            }}>
            <Text
              style={
                activeTab === 'YesterDay'
                  ? styles.activeTabText
                  : styles.FilterButtonText
              }>
              YDay
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.FilterButtons,
              activeTab === 'Today' && styles.activeTab,
            ]}
            onPress={() => {
              setActiveTab('Today');
              SetToday();
            }}>
            <Text
              style={
                activeTab === 'Today'
                  ? styles.activeTabText
                  : styles.FilterButtonText
              }>
              2Day
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.FilterButtons,
              activeTab === 'Week' && styles.activeTab,
            ]}
            onPress={() => {
              setActiveTab('Week');
              SetWeek();
            }}>
            <Text
              style={
                activeTab === 'Week'
                  ? styles.activeTabText
                  : styles.FilterButtonText
              }>
              Wk
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.FilterButtons,
              activeTab === 'Month' && styles.activeTab,
            ]}
            onPress={() => {
              setActiveTab('Month');
              SetMonth();
            }}>
            <Text
              style={
                activeTab === 'Month'
                  ? styles.activeTabText
                  : styles.FilterButtonText
              }>
              Mo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.FilterButtons,
              activeTab === 'Custom' && styles.activeTab,
            ]}
            onPress={() => {
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

        <CustomDateModal />
        <View style={styles.subTabContainer1}>
          <View style={styles.totalOverlay1}>
            <Text style={styles.totalLabel1}>Total Purchase: </Text>
            <Text style={styles.totalValue1}>₹{renderTotalPurchase()}</Text>
          </View>
          <View style={styles.icons}>
            <Image
              source={require('../../images/income-icon.png')}
              style={styles.incomeIcon}
            />
          </View>

          {/* Updated Main Tabs Container */}
          <View style={styles.mainTabsContainer}>
            <MainTabButton
              label="Product"
              active={activeMainTab === 'product'}
              onPress={() => handleMainTabChange('product')}
            />
            <MainTabButton
              label="Supplier"
              active={activeMainTab === 'supplier'}
              onPress={() => handleMainTabChange('supplier')}
            />
          </View>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading dashboard data...</Text>
            </View>
          ) : (
            renderPieChart(getCurrentData())
          )}
        </ScrollView>

        {/* Loading overlay for API calls */}
        {isLoading && <Loading />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingBottom: 10,
  },
  headerBackground: {
    height: 211,
    paddingTop: 35,
    backgroundColor: '#3E89EC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollContent1: {
    flexGrow: 1,
    alignItems: 'center',
  },
  headerImage: {
    width: 232,
    marginTop: 0,
    height: 208,
    alignSelf: 'flex-end',
    marginLeft: width - 232,
  },
  header: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.8,
  },

  mainTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    borderRadius: 20,
    padding: 1,
    marginBottom: 5,
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 330, // Adjust width as needed
  },

  // Updated Main Tab Button
  mainTabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },

  activeMainTabButton: {
    backgroundColor: '#4D8FE6',
  },

  mainTabText: {
    fontFamily: 'Cabin-Medium',
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },

  activeMainTabText: {
    color: '#FFF',
  },

  // Updated Sub Tabs Container
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    borderRadius: 20,
    padding: 1,
    marginBottom: 5,
    alignSelf: 'center',
    width: 300, // Adjust width as needed
  },

  // Updated Sub Tab Button
  subTabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },

  activeSubTabButton: {
    backgroundColor: '#4D8FE6',
  },

  subTabText: {
    fontFamily: 'Cabin-Medium',
    color: 'black',
    fontSize: 16,
    fontWeight: '600',
  },

  activeSubTabText: {
    color: '#FFF',
  },
  container: {
    flex: 1,
  },

  subTabContainer1: {
    flexDirection: 'row',
    marginHorizontal: 10,
    backgroundColor: 'white',
    width: '90%',
    height: 150,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    marginTop: -1,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,

    // position: 'absolute',
  },

  totalOverlay1: {
    display: 'flex',
    flexDirection: 'Column',
    position: 'absolute',
    top: '40%',
    left: '10%',
    alignItems: 'left',
    marginTop: -45,
  },

  totalLabel1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
    fontFamily: 'arial',
  },

  totalValue1: {
    fontSize: 18,
    marginTop: 5,
    left: '12%',
    fontWeight: 'bold',
    color: 'green',
  },
  chartContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    width: '90%',
    margin: 5,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },

  FiltersBox: {
    flexDirection: 'row',
    borderRadius: 5,
    justifyContent: 'space-around',
    marginTop: -90,
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
  activeTab: {
    backgroundColor: 'white',
    shadowColor: 'rgb(33,109,206)',
    elevation: 20,
  },

  incomeIcon: {
    width: 74,
    height: 74,
  },
  icons: {
    position: 'absolute',
    paddingLeft: 240,
    paddingBottom: 60,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#216dce',
  },
  datePickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
  },
  dateButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#216dce',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  submitButton: {
    backgroundColor: '#216dce',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  legendContainer: {
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 25,
    alignItems: 'center', // Center all items horizontally
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '90%', // Slightly less than container width
    justifyContent: 'flex-start', // Align items to the start
    paddingHorizontal: 10,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#333',
    flex: 1, // Take up available space
  },
  legendText1: {
    fontSize: 12,
    fontWeight: '600',
    color: '#216dce',
    marginLeft: 4, // Add space between dash and value
  },
  totalOverlay3: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    backgroundColor: '#3E89EC',
    borderRadius: 15,
    alignItems: 'center',
    height: 40,
    width: '90%',
    marginTop: 20,

    // Add this to align items horizontally
    paddingHorizontal: 20,
  },

  totalLabel3: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    paddingLeft: 30,
  },

  totalValue2: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    paddingRight: 30,
  },
  totalOverlay: {
    position: 'absolute',
    top: '3%',
    left: '45%',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
});

export default Home;
