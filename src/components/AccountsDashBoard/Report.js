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
  Modal,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {LineChart} from 'react-native-chart-kit';
import {getStoredData} from '../../components/common/AsyncStorage';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import base64 from 'react-native-base64';

const {width, height} = Dimensions.get('window');

const Report = () => {
  const navigation = useNavigation();
  // Tab states
  const [activeMainTab, setActiveMainTab] = useState('trendAnalysis');
  const [activeFilterTab, setActiveFilterTab] = useState('Month');
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customToDate, setCustomToDate] = useState(new Date());
  const [customFromDate, setCustomFromDate] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [activeTab, setActiveTab] = useState('Today');
  const [activeStockTab, setActiveStockTab] = useState('stock');

  // Dynamic company details state
  const [companyDetails, setCompanyDetails] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Purchase data - will be updated from API
  const [totalPurchase, setTotalPurchase] = useState('0');
  const [purchasedAmount, setPurchasedAmount] = useState('0');
  const [issuedAmount, setIssuedAmount] = useState('0');
  const [chartAmount, setChartAmount] = useState('0');

  // Chart data - will be updated from API
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        data: [0],
        color: (opacity = 1) => `rgba(71, 61, 139, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  });

  // Product depth data
  const [selectedProduct, setSelectedProduct] = useState('Select Product');
  const [productList, setProductList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Stock data
  const [stockData, setStockData] = useState([]);
  const [vehicleData, setVehicleData] = useState([]);

  // Helper function to format date - MOVED UP so it can be used in state initialization
  const formatDate = date => {
    return date.toISOString().split('T')[0] + ' 08:00';
  };

  // 1. Add state to track current date range - INITIALIZE WITH TODAY'S DATE
  const [currentDateRange, setCurrentDateRange] = useState(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0] + ' 08:00';
    return {
      fromDate: formattedToday,
      toDate: formattedToday,
    };
  });

  // Fetch company details on component mount
  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  // Fetch dashboard data when company details are available - SIMPLIFIED
  useEffect(() => {
    if (companyDetails && !dashboardData) {
      // Use the already initialized currentDateRange
      fetchDashboardData(currentDateRange.fromDate, currentDateRange.toDate);
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

  const formatNumber = num => {
    if (!num) return '0';
    return parseFloat(num).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const processApiData = data => {
    if (!data || !Array.isArray(data) || data.length < 14) {
      console.log('Invalid API data structure');
      return;
    }

    // Process data[2] for purchased amount
    if (data[2] && Array.isArray(data[2]) && data[2].length > 0) {
      const totalPurchased = data[2].reduce((sum, item) => {
        return sum + (parseFloat(item.NetAmount) || 0);
      }, 0);
      setPurchasedAmount(formatNumber(totalPurchased));
      setTotalPurchase(formatNumber(totalPurchased));
    }

    // Process data[12] for issued amount
    if (data[12] && Array.isArray(data[12]) && data[12].length > 0) {
      const totalIssued = data[12].reduce((sum, item) => {
        return sum + (parseFloat(item.NetAmount) || 0);
      }, 0);
      setIssuedAmount(formatNumber(totalIssued));
    }

    // Process data[6] for trend analysis chart - UPDATED LOGIC
    if (data[6] && Array.isArray(data[6]) && data[6].length > 0) {
      processChartData(data[6]);
    } else {
      console.log('No chart data found in data[6]');
      // Set default chart data if no data available
      setChartData({
        labels: ['No Data'],
        datasets: [
          {
            data: [0],
            color: (opacity = 1) => `rgba(71, 61, 139, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      });
      // Set chart amount to 0 if no chart data (NOT purchased amount)
      setChartAmount('0');
    }

    // Process data[8] for product depth
    if (data[8] && Array.isArray(data[8]) && data[8].length > 0) {
      // Use 'Product' field instead of 'ProductName'
      const products = [...new Set(data[8].map(item => item.Product))].filter(
        Boolean,
      );
      setProductList(products);
      if (products.length > 0) {
        setSelectedProduct(products[0]);
        updateSuppliers(data[8], products[0]);
      }
    } else {
      console.log('No product data found in data[8]');
      setProductList([]);
      setSuppliers([]);
    }

    // Process data[12] for stock data (highly used stock)
    if (data[12] && Array.isArray(data[12]) && data[12].length > 0) {
      const processedStock = data[12]
        .map((item, index) => ({
          id: index + 1,
          name: item.ProductName || 'Unknown',
          amount: `₹ ${formatNumber(item.NetAmount)}`,
          quantity: `${item.IssuedQty || 0} ${item.UOMName || ''}`,
        }))
        .sort(
          (a, b) =>
            (parseFloat(b.quantity) || 0) - (parseFloat(a.quantity) || 0),
        ); // Sort by quantity descending
      setStockData(processedStock);
    }

    // Process data[13] for vehicle data (highly used vehicle)
    if (data[13] && Array.isArray(data[13]) && data[13].length > 0) {
      const processedVehicles = data[13]
        .map((item, index) => ({
          id: index + 1,
          name: item.Regnumber || 'Unknown',
          amount: `₹ ${formatNumber(item.NetAmount)}`,
          trips: Math.round(item.IssuedQty || 0),
        }))
        .sort((a, b) => b.trips - a.trips); // Sort by trips descending
      setVehicleData(processedVehicles);
    }
  };

  const processChartData = data6 => {
    console.log('Processing chart data:', data6);

    if (!data6 || !Array.isArray(data6) || data6.length === 0) {
      console.log('No chart data available');
      setChartData({
        labels: ['No Data'],
        datasets: [
          {
            data: [0],
            color: (opacity = 1) => `rgba(71, 61, 139, ${opacity})`,
            strokeWidth: 2,
          },
        ],
      });
      // Set chart amount to 0 if no chart data (NOT purchased amount)
      setChartAmount('0');
      return;
    }

    // Sort data by year and month
    const sortedData = data6.sort((a, b) => {
      if (a.Year !== b.Year) {
        return a.Year - b.Year;
      }
      return a.Month - b.Month;
    });

    // Convert month numbers to month names
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Process the data for chart
    const labels = sortedData.map(item => {
      const monthName = monthNames[item.Month - 1] || 'Unknown';
      const yearShort = item.Year.toString().slice(-2); // Get last 2 digits of year
      return `${monthName} ${yearShort}`;
    });

    // Use BillCount for Y-axis values instead of NetAmount
    const values = sortedData.map(item => item.BillCount || 0);

    // Calculate total NetAmount for display above the chart
    const totalNetAmount = sortedData.reduce((sum, item) => {
      return sum + (parseFloat(item.NetAmount) || 0);
    }, 0);

    console.log('Chart labels:', labels);
    console.log('Chart values (BillCount):', values);
    console.log('Total NetAmount:', totalNetAmount);

    // Update chart data with BillCount values
    setChartData({
      labels: labels,
      datasets: [
        {
          data: values,
          color: (opacity = 1) => `rgba(71, 61, 139, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    });

    // Update the amount display with total NetAmount from data[6]
    setChartAmount(formatNumber(totalNetAmount));
  };

  const updateSuppliers = (dataList, productName) => {
    // Filter by 'Product' field instead of 'ProductName'
    const filtered = dataList.filter(item => item.Product === productName);
    const mapped = filtered.map(item => ({
      // Use 'Supplier' instead of 'Name'
      name: item.Supplier || 'N/A',
      // Use 'UOMName' field
      uom: item.UOMName || 'N/A',
      // Use 'Taxable' instead of 'NetAmount' for the amount
      amount: `₹ ${formatNumber(item.Taxable || 0)}`,
    }));
    setSuppliers(mapped);
  };

  const clearAllData = () => {
    setTotalPurchase('0');
    setPurchasedAmount('0');
    setIssuedAmount('0');
    setChartData({
      labels: [],
      datasets: [
        {
          data: [0],
          color: (opacity = 1) => `rgba(71, 61, 139, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    });
    setSelectedProduct('Select Product');
    setProductList([]);
    setSuppliers([]);
    setStockData([]);
    setVehicleData([]);
  };

  const fetchDashboardData = async (fromDate, toDate) => {
    if (!companyDetails) {
      console.log('Company details not available, skipping dashboard fetch');
      return;
    }

    // Validate dates before making API call
    if (!fromDate || !toDate) {
      console.log('Invalid dates provided:', { fromDate, toDate });
      return;
    }

    // Store current date range
    setCurrentDateRange({fromDate, toDate});

    // Clear data before fetching new data
    clearAllData();

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

      console.log('Company dates coming in:', companyDetails);
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

      // Check if we have valid array data structure
      const hasValidArrayData = response.data && Array.isArray(response.data);

      if (hasValidArrayData) {
        setDashboardData(response.data);
        processApiData(response.data);
        console.log('Data processed successfully');
      } else {
        // No array data - show error
        console.log('No valid array data received from API');
        Alert.alert(
          'Error',
          'Invalid data format received from server. Please try again.',
        );
      }
    } catch (error) {
      console.error('Dashboard API error:', error);

      // Only show error if we don't have valid array data
      let hasValidArrayData = false;

      // Check if error response has valid array data
      if (error.response && error.response.data) {
        if (Array.isArray(error.response.data)) {
          hasValidArrayData = true;
          console.log('Valid array data found in error response');
          setDashboardData(error.response.data);
          processApiData(error.response.data);
        }
      }

      // Only show error alert if no valid array data was found
      if (!hasValidArrayData) {
        if (error.response) {
          console.error(
            'Error response:',
            error.response.status,
            error.response.data,
          );
          Alert.alert(
            'Error',
            `Failed to fetch data (${error.response.status}). Please check your connection and try again.`,
          );
        } else if (error.request) {
          console.error('Network error:', error.request);
          Alert.alert(
            'Network Error',
            'Please check your internet connection and try again.',
          );
        } else {
          console.error('Request setup error:', error.message);
          Alert.alert('Error', `Request failed: ${error.message}`);
        }
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
    const fromDate = formatDate(yesterday);
    const toDate = formatDate(today);
    fetchDashboardData(fromDate, toDate);
  };

  const SetToday = () => {
    if (!companyDetails) return;
    const today = new Date();
    const formattedToday = formatDate(today);
    fetchDashboardData(formattedToday, formattedToday);
  };

  const SetWeek = () => {
    if (!companyDetails) return;
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const fromDate = formatDate(weekAgo);
    const toDate = formatDate(today);
    fetchDashboardData(fromDate, toDate);
  };

  const SetMonth = () => {
    if (!companyDetails) return;
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setDate(today.getDate() - 30);
    const fromDate = formatDate(monthAgo);
    const toDate = formatDate(today);
    fetchDashboardData(fromDate, toDate);
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

  const handleCustomDateSubmit = () => {
    if (customToDate < customFromDate) {
      Alert.alert('Invalid Date Range', 'End date must be after start date');
      return;
    }
    setCustomModalVisible(false);
    setActiveFilterTab('Custom');
    const fromDate = formatDate(customFromDate);
    const toDate = formatDate(customToDate);
    fetchDashboardData(fromDate, toDate);
  };

  const toggleDropdown = () => {
    setDropdownVisible(prev => !prev);
  };

  const selectProduct = product => {
    setSelectedProduct(product);
    setDropdownVisible(false);
    if (dashboardData && dashboardData[8]) {
      updateSuppliers(dashboardData[8], product);
    }
  };

  const MainTabButton = ({label, value, onPress}) => (
    <TouchableOpacity
      style={[
        styles.mainTabButton,
        activeMainTab === value && styles.activeMainTabButton,
      ]}
      onPress={() => {
        // Clear data when switching tabs
        clearAllData();
        setActiveMainTab(value);

        // Refetch data with current date range if available
        if (currentDateRange.fromDate && currentDateRange.toDate) {
          fetchDashboardData(
            currentDateRange.fromDate,
            currentDateRange.toDate,
          );
        }

        onPress();
      }}>
      <Text
        style={[
          styles.mainTabText,
          activeMainTab === value && styles.activeMainTabText,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Updated renderTrendAnalysis function
  const renderTrendAnalysis = () => {
    return (
      <>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartLabel}>Amount</Text>
              <Text style={styles.chartAmount}>₹ {chartAmount}</Text>
            </View>
          </View>

          {/* Line Chart */}
          <LineChart
            data={chartData}
            width={width * 0.9}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0, // No decimal places for bill count
              color: (opacity = 1) => `rgba(71, 61, 139, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#473D8B',
              },
              propsForBackgroundLines: {
                strokeDasharray: '',
                stroke: '#e3e3e3',
                strokeWidth: 1,
              },
              fillShadowGradient: 'rgba(71, 61, 139, 0.2)',
              fillShadowGradientOpacity: 0.3,
            }}
            bezier
            style={styles.chart}
            withDots={true}
            withInnerLines={true}
            withOuterLines={true}
            withVerticalLines={false}
            withHorizontalLines={true}
          />
        </View>
      </>
    );
  };

  const renderProductDepth = () => {
    return (
      <>
        <View style={{flex: 1}}>
          <View style={{zIndex: 10}}>
            {/* Dropdown Select UI */}
            <View style={styles.productCard}>
              <View style={styles.productRow}>
                <View style={styles.productSelectContainer}>
                  <Text style={styles.productLabel}>Product</Text>
                  <View style={{position: 'relative'}}>
                    <TouchableOpacity
                      style={styles.productSelect}
                      onPress={toggleDropdown}>
                      <Text style={styles.productSelectText}>
                        {selectedProduct}
                      </Text>
                      <Text style={styles.dropdownIcon}>▼</Text>
                    </TouchableOpacity>

                    {dropdownVisible && (
                      <View style={styles.dropdown}>
                        <ScrollView 
      style={styles.dropdownScroll}
      nestedScrollEnabled={true} // Important for nested scrolling
      keyboardShouldPersistTaps="handled" // Better touch handling
    >
                          {productList.map((product, index) => (
                            <TouchableOpacity
                              key={index}
                              style={styles.dropdownItem}
                              onPress={() => selectProduct(product)}>
                              <Text style={styles.dropdownItemText}>
                                {product}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={{zIndex: 1}}>
            {/* Supplier Report Section */}
            <View style={styles.supplierTableCard}>
              <View style={styles.supplierTableHeader}>
                <Text style={styles.supplierColumnHeader}>Supplier</Text>
                <Text style={styles.uomColumnHeader}>UOM</Text>
                <Text style={styles.amountColumnHeader}>Amount</Text>
              </View>

              {suppliers.map((supplier, index) => (
                <View key={index} style={styles.supplierRow}>
                  <View style={styles.supplierIndexContainer}>
                    <Text style={styles.supplierIndex}>{index + 1}.</Text>
                  </View>
                  <Text style={styles.supplierName}>{supplier.name}</Text>
                  <Text style={styles.supplierUOM}>{supplier.uom}</Text>
                  <Text style={styles.supplierAmount}>{supplier.amount}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </>
    );
  };

  const renderStock = () => {
    return (
      <View style={styles.stockContainer}>
        {/* Stock Tabs */}
        <View style={styles.stockTabsContainer}>
          <TouchableOpacity
            style={[
              styles.stockTabButton,
              activeStockTab === 'stock' && styles.activeStockTabButton,
            ]}
            onPress={() => setActiveStockTab('stock')}>
            <Text
              style={[
                styles.stockTabText,
                activeStockTab === 'stock' && styles.activeStockTabText,
              ]}>
              Highly used stock
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.stockTabButton,
              activeStockTab === 'vehicle' && styles.activeStockTabButton,
            ]}
            onPress={() => setActiveStockTab('vehicle')}>
            <Text
              style={[
                styles.stockTabText,
                activeStockTab === 'vehicle' && styles.activeStockTabText,
              ]}>
              Highly used vehicle
            </Text>
          </TouchableOpacity>
        </View>

        {/* Table Header */}
        <View style={styles.stockTableHeader}>
          <Text style={styles.stockIndexHeader}></Text>
          <Text style={styles.stockNameHeader}>
            {activeStockTab === 'vehicle' ? 'Vehicle' : 'Item'}
          </Text>
          <Text style={styles.stockAmountHeader}>Amount</Text>
          <Text style={styles.stockQuantityHeader}>
            {activeStockTab === 'vehicle' ? 'Trip' : 'Quantity'}
          </Text>
        </View>

        {/* Table Content */}
        <ScrollView style={styles.stockTableContent}>
          {activeStockTab === 'vehicle'
            ? vehicleData.map(item => (
                <View key={item.id} style={styles.stockTableRow}>
                  <Text style={styles.stockIndexCell}>{item.id}</Text>
                  <Text style={styles.stockNameCell}>{item.name}</Text>
                  <Text style={styles.stockAmountCell}>{item.amount}</Text>
                  <Text style={styles.stockQuantityCell}>{item.trips}</Text>
                </View>
              ))
            : stockData.map(item => (
                <View key={item.id} style={styles.stockTableRow}>
                  <Text style={styles.stockIndexCell}>{item.id}</Text>
                  <Text style={styles.stockNameCell}>{item.name}</Text>
                  <Text style={styles.stockAmountCell}>{item.amount}</Text>
                  <Text style={styles.stockQuantityCell}>{item.quantity}</Text>
                </View>
              ))}
        </ScrollView>
      </View>
    );
  };

  if (companyLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <Text>Loading company details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ImageBackground
          style={styles.headerBackground}
          source={require('../../images/LOGO.png')}
          resizeMode="contain"
          imageStyle={styles.headerImage}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Purchase</Text>
          </View>

          {/* Top Filter Tabs */}
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
        </ImageBackground>

        {/* Combined Total Purchase Card with Main Tabs */}
        <View style={styles.totalPurchaseCard}>
          {/* Purchase Info Section */}
          <View style={styles.purchaseInfoSection}>
            <View style={styles.purchaseTextContainer}>
              <Text style={styles.totalPurchaseLabel}>Total Purchase</Text>
              <Text style={styles.totalPurchaseValue}>₹ {totalPurchase}</Text>
            </View>
            <Image
              source={require('../../images/income-icon.png')}
              style={styles.purchaseIcon}
            />
          </View>

          {/* Main Tab Buttons Inside Card */}
          <View style={styles.integratedTabsContainer}>
            <MainTabButton
              label="Trend Analysis"
              value="trendAnalysis"
              onPress={() => setActiveMainTab('trendAnalysis')}
            />
            <MainTabButton
              label="Product Depth"
              value="productDepth"
              onPress={() => setActiveMainTab('productDepth')}
            />
            <MainTabButton
              label="Stock"
              value="stock"
              onPress={() => setActiveMainTab('stock')}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Purchase and Issued Statistics */}
          <View style={styles.statsCard}>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>Purchased</Text>
              <View style={styles.statValueContainer}>
                <View style={styles.orangeIcon} />
                <Text style={styles.statValue}>₹ {purchasedAmount}</Text>
              </View>
            </View>
            <View style={styles.statColumn}>
              <Text style={styles.statLabel}>Issued</Text>
              <View style={styles.statValueContainer}>
                <View style={styles.greenIcon} />
                <Text style={styles.statValue}>₹ {issuedAmount}</Text>
              </View>
            </View>
          </View>

          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text>Loading data...</Text>
            </View>
          )}

          {/* Conditional rendering based on active tab */}
          {activeMainTab === 'trendAnalysis' && renderTrendAnalysis()}
          {activeMainTab === 'productDepth' && renderProductDepth()}
          {activeMainTab === 'stock' && renderStock()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  chartSubLabel: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  chartSubLabel: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#4184EC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F6F0',
  },
  headerBackground: {
    height: 211,
    paddingTop: 35,
    backgroundColor: '#3E89EC',
  },
  headerImage: {
    width: 232,
    marginTop: 0,
    height: 258,
    alignSelf: 'flex-end',
    marginLeft: width - 232,
  },
  header: {
    padding: 10,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },

  FiltersBox: {
    flexDirection: 'row',
    borderRadius: 5,
    justifyContent: 'space-around',
    marginTop: 34,
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
  totalPurchaseCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: -40,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  purchaseInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  purchaseTextContainer: {
    flex: 1,
  },
  totalPurchaseLabel: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },

  totalPurchaseValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4CAF50',
  },

  purchaseIcon: {
    width: 60,
    height: 60,
  },

  integratedTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    borderRadius: 20,

    alignSelf: 'center',
    width: '100%',
  },

  mainTabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 18,
    marginHorizontal: 1,
  },

  activeMainTabButton: {
    backgroundColor: '#4D8FE6',
  },

  mainTabText: {
    fontFamily: 'Cabin-Medium',
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  activeMainTabText: {
    // color: 'white',
    color: '#FFF',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  statColumn: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orangeIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFA500',
    marginRight: 8,
  },
  greenIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartLabel: {
    fontSize: 16,
    color: '#333',
  },
  chartAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  yearsContainer: {
    alignItems: 'flex-end',
  },
  yearsLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  yearsInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearsInput: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginRight: 10,
  },
  yearsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeButton: {
    backgroundColor: '#FFD6D6',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
  },
  changeButtonText: {
    color: '#FF4D4F',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 10,
    alignSelf: 'center',
  },
  // Product Depth specific styles
  productCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'visible', // This is important
    zIndex: 10,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productSelectContainer: {
    flex: 1,
    marginRight: 35,
    paddingLeft: 18,
  },
  productLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  productSelect: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    minHeight: 45,
  },

  productSelectText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },

  dropdownIcon: {
    fontSize: 12,
    color: '#666',
  },
  yearSelectContainer: {
    flex: 1,
    marginLeft: 10,
  },
  yearLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  yearSelectWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearSelect: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 10,
  },
  yearSelectText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  yearInfoButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E6E6E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  supplierTableCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  supplierTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 10,
    marginBottom: 10,
  },
  supplierColumnHeader: {
    flex: 2,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  uomColumnHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  amountColumnHeader: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  supplierIndexContainer: {
    width: 30,
  },
  supplierIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  supplierName: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  supplierUOM: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  supplierAmount: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginHorizontal: 2,
  },
  selectedMonthButton: {
    backgroundColor: '#4184EC',
  },
  monthButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedMonthText: {
    color: 'white',
    fontWeight: 'bold',
  },
  nextButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  nextButtonText: {
    color: '#666',
  },
  // Stock tab styles
  stockCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  stockTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  stockEmptyText: {
    fontSize: 16,
    color: '#666',
  },
  // Modal styles
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
    color: '#4184EC',
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
    color: '#4184EC',
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
    backgroundColor: '#4184EC',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  stockContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  stockTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5',
    borderRadius: 20,
    marginBottom: 5,
    alignSelf: 'center',
    width: 310,
  },
  stockTabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeStockTabButton: {
    // backgroundColor: '#4184EC',
    backgroundColor: '#4D8FE6',
  },
  stockTabText: {
    // fontWeight: '500',
    // fontSize: 12,
    // color: '#666',
    fontFamily: 'Cabin-Medium',
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
  },
  activeStockTabText: {
    // color: 'white',
    // fontWeight: 'bold',
    color: '#FFF',
  },
  infoButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  infoButtonText: {
    color: '#666',
    fontSize: 16,
  },
  stockTableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stockIndexHeader: {
    width: 30,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  stockNameHeader: {
    flex: 2,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  stockAmountHeader: {
    flex: 2,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  stockQuantityHeader: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  stockTableContent: {
    maxHeight: 400,
  },
  stockTableRow: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  stockIndexCell: {
    width: 30,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  stockNameCell: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  stockAmountCell: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  stockQuantityCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 40,
    width: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    maxHeight: 150,
    zIndex: 10, // Bring it to front
    elevation: 10, // Also helps on Android
  },

  dropdownScroll: {
    paddingVertical: 5,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Report;
