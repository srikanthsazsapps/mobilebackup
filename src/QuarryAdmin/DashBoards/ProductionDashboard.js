// import React, { useState, useRef, useEffect } from "react";
// import { View, Text, Dimensions, TouchableOpacity, Modal, BackHandler, TouchableWithoutFeedback, RefreshControl, ImageBackground, StyleSheet, ScrollView, Alert } from 'react-native';
// import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
// import GlobalStyle from "../../components/common/GlobalStyle";
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// import { useNavigation } from '@react-navigation/native';
// import Ton from '../../images/Ton.svg';
// import DateFilter from "../DateFilter";
// import Loading from "../../components/common/Loading";
// import NetworkErrorModal from "../NetworkErrorModal";
// import NetInfo from '@react-native-community/netinfo';

// const { width, height } = Dimensions.get('window');

// const DataTables = () => {
//   const [dateTab, setDateTab] = useState('Today');
//   const tabs = ['Yesterday', 'Today', 'Week', 'Month', 'Custom'];
//   const detailsScrollViewRef = useRef(null);
//   const [summaryDropdownOpen, setSummaryDropdownOpen] = useState(false);
//   const [activeTripType, setActiveTripType] = useState('Raw material trip');
//   const [DieselDetails, setDieselDetails] = useState([]);
//   const [ebDetails, setEbDetails] = useState([]);
//   const [showDateFilterModal, setShowDateFilterModal] = useState(false);
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [customFromDate, setCustomFromDate] = useState(null);
//   const [customToDate, setCustomToDate] = useState(null);
//   const [totalNetWeight, setTotalNetWeight] = useState("0.00"); // New state for tracking total net weight
//   const [isConnected, setIsConnected] = useState(true);
//   const [showNetworkError,setshowNetworkError] = useState(false);
  
//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener(state => {
//       setIsConnected(state.isConnected && state.isInternetReachable);
      
//       // If internet is restored, automatically refresh data
//       if (state.isConnected && state.isInternetReachable && error) {
//         onRefresh();
//       }
//     });
    
//     return () => unsubscribe();
//   }, [error]);

//   const [dashboardData, setDashboardData] = useState({
//     transportTrips: [],
//     ebReadings: [],
//     dieselData: [],
//     salesOrders: [],
//     rawMaterial: [],
//     vehicleTrip: [],
//   });

//   const API_URL = 'https://demo.sazss.in/Api/DashesDatas';
//   const AUTH_HEADERS = {
//     'Authorization': 'Basic ' + btoa('Inventory:SazsApps@123'),
//     'Content-Type': 'application/json'
//   };

//   // Calculate total net weight across all data sources
//   const calculateTotalNetWeight = (data) => {
//     let total = 0;
    
//     // Add raw material weight
//     if (data.rawMaterial && data.rawMaterial.length) {
//       total += data.rawMaterial.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0);
//     }
    
//     // Add vehicle trip weight
//     if (data.vehicleTrip && data.vehicleTrip.length) {
//       total += data.vehicleTrip.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0);
//     }
    
//     // Add transport trip weight (in MT)
//     if (data.transportTrips && data.transportTrips.length) {
//       total += data.transportTrips.reduce((sum, item) => sum + (parseFloat(item.TQty) || 0), 0);
//     }
    
//     return total.toFixed(2);
//   };

//   const fetchDashboardData = async (dateFilter, fromDateParam, toDateParam) => {
//     try {
//       setLoading(true);
//       let fromDate, toDate;
//       const currentDate = new Date();

//       switch (dateFilter) {
//         case 'Yesterday':
//           const yesterday = new Date(currentDate);
//           yesterday.setDate(currentDate.getDate() - 1);
//           fromDate = yesterday.toISOString().split('T')[0] + ' 00:00';
//           toDate = yesterday.toISOString().split('T')[0] + ' 23:59';
//           break;
//         case 'Today':
//           fromDate = currentDate.toISOString().split('T')[0] + ' 00:00';
//           toDate = currentDate.toISOString().split('T')[0] + ' 23:59';
//           break;
//         case 'Week':
//           const weekStart = new Date(currentDate);
//           weekStart.setDate(currentDate.getDate() - currentDate.getDay());
//           fromDate = weekStart.toISOString().split('T')[0] + ' 00:00';
//           toDate = currentDate.toISOString().split('T')[0] + ' 23:59';
//           break;
//         case 'Month':
//           const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//           fromDate = monthStart.toISOString().split('T')[0] + ' 00:00';
//           toDate = currentDate.toISOString().split('T')[0] + ' 23:59';
//           break;
//         case 'Custom':
//           fromDate = fromDateParam || (customFromDate ? customFromDate : currentDate.toISOString().split('T')[0] + ' 00:00');
//           toDate = toDateParam || (customToDate ? customToDate : currentDate.toISOString().split('T')[0] + ' 23:59');
//           break;
//         default:
//           fromDate = currentDate.toISOString().split('T')[0] + ' 00:00';
//           toDate = currentDate.toISOString().split('T')[0] + ' 23:59';
//       }

//       const response = await fetch(API_URL, {
//         method: 'POST',
//         headers: AUTH_HEADERS,
//         body: JSON.stringify({
//           DashName: "Production",
//           FromDate: fromDate,
//           ToDate: toDate,
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       const data = await response.json();
//       const dashboardData = {
//         transportTrips: data[0] || [],
//         ebReadings: data[1] || [],
//         dieselData: data[2] || [],
//         salesOrders: data[3] || [],
//         rawMaterial: data[4] || [],
//         vehicleTrip: data[5] || [],
//       };
      
//       setDashboardData(dashboardData);
      
//       // Calculate and set total net weight
//       const totalWeight = calculateTotalNetWeight(dashboardData);
//       setTotalNetWeight(totalWeight);
//       setError(null);
//       setshowNetworkError(false);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       setError('Failed to fetch data. Please try again.');
//       setshowNetworkError(true);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     setLoading(true); // Show loading screen during refresh
//     fetchDashboardData(dateTab, customFromDate, customToDate);
//   };

//   useEffect(() => {
//     // Only open date filter modal automatically when Custom tab is selected
//     if (dateTab === 'Custom') {
//       setShowDateFilterModal(true);
//     } else {
//       fetchDashboardData(dateTab);
//     }
//   }, [dateTab]);

//   // Handle custom date selection from the DateFilter component
//   const handleCustomDateSelect = (fromDate, toDate) => {
//     setCustomFromDate(fromDate);
//     setCustomToDate(toDate);
//     setShowDateFilterModal(false);
//     fetchDashboardData('Custom', fromDate, toDate);
//   };

//   // Handle back button and modal closing
//   useEffect(() => {
//     const handleBackButtonClick = () => {
//       if (showDateFilterModal) {
//         setShowDateFilterModal(false);
//         return true;
//       } else if (navigation.canGoBack()) {
//         navigation.goBack();
//         return true;
//       } else {
//         Alert.alert(
//           'Exit App',
//           'Are you sure you want to exit?',
//           [
//             {
//               text: 'Cancel',
//               onPress: () => null,
//               style: 'cancel',
//             },
//             { text: 'OK', onPress: () => BackHandler.exitApp() },
//           ],
//           { cancelable: false },
//         );
//         return true;
//       }
//     };

//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       handleBackButtonClick,
//     );

//     return () => {
//       backHandler.remove();
//     };
//   }, [navigation, showDateFilterModal]);

//   useEffect(() => {
//     if (dashboardData.dieselData.length > 0) {
//       const formattedData = Object.entries(dashboardData.dieselData[0]).map(([key, value]) => ({
//         Name: key,
//         Values: value
//       }));
//       setDieselDetails(formattedData);
//     }
//   }, [dashboardData.dieselData]);

//   useEffect(() => {
//     if (dashboardData.ebReadings.length > 0) {
//       const formattedData = Object.entries(dashboardData.ebReadings[0]).map(([key, value]) => ({
//         Name: key,
//         Values: value
//       }));
//       setEbDetails(formattedData);
//     }
//   }, [dashboardData.ebReadings]);

//   const calculateSummaryMetrics = () => {
//     switch (activeTripType) {
//       case 'Raw material trip':
//         const totalRawMaterialTrips = dashboardData.rawMaterial.reduce((sum, item) => sum + (parseInt(item.TotalTrip) || 0), 0);
//         const totalRawMaterialWeight = dashboardData.rawMaterial.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0);
//         return {
//           firstLabel: 'Total Trips',
//           firstValue: totalRawMaterialTrips,
//           secondLabel: 'Total Weight',
//           secondValue: totalRawMaterialWeight.toFixed(2) + ' Ton'
//         };

//       case 'Vehicle trip':
//         const totalVehicleTrips = dashboardData.vehicleTrip.reduce((sum, item) => sum + (parseInt(item.TotalTrip) || 0), 0);
//         const totalVehicleWeight = dashboardData.vehicleTrip.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0);
//         return {
//           firstLabel: 'Total Trips',
//           firstValue: totalVehicleTrips,
//           secondLabel: 'Total Weight',
//           secondValue: totalVehicleWeight.toFixed(2) + ' Ton'
//         };

//       case 'Transport trip':
//         const totalTransportTrips = dashboardData.transportTrips.reduce((sum, item) => sum + (parseInt(item.NoLoad) || 0), 0);
//         const totalTransportMT = dashboardData.transportTrips.reduce((sum, item) => sum + (parseFloat(item.TQty) || 0), 0);
//         return {
//           firstLabel: 'Total Trips',
//           firstValue: totalTransportTrips,
//           secondLabel: 'Total MT',
//           secondValue: totalTransportMT.toFixed(2)
//         };

//       case 'Sales order':
//         const totalBalQty = dashboardData.salesOrders.reduce((sum, item) => sum + (parseFloat(item.BalQty) || 0), 0);
//         const totalSupQty = dashboardData.salesOrders.reduce((sum, item) => sum + (parseFloat(item.SupQty) || 0), 0);
//         return {
//           firstLabel: 'Total Bal Qty',
//           firstValue: totalBalQty.toFixed(2) + ' Ton',
//           secondLabel: 'Total Sup Qty',
//           secondValue: totalSupQty.toFixed(2) + ' Ton'
//         };

//       case 'Diesel availability':
//         const dieselData = dashboardData.dieselData.length > 0 ? dashboardData.dieselData[0] : {};
//         return {
//           firstLabel: 'Closing Stock',
//           firstValue: (dieselData.ClosingStock || 0) + ' L',
//           secondLabel: 'Stock Value',
//           secondValue: '₹' + (dieselData.ClosingStockValue || 0)
//         };

//       case 'EB hours reading':
//         const ebDataArray = dashboardData.ebReadings.length > 0 ? dashboardData.ebReadings[0] : {};
//         const totalSrartReading = dashboardData.ebReadings.reduce((sum, item) => sum + (parseFloat(item.StartingReading) || 0), 0);
//         const totalEndReading = dashboardData.ebReadings.reduce((sum, item) => sum + (parseFloat(item.ClosingReading) || 0), 0);
//         return {
//           firstLabel: 'StartingReading',
//           firstValue:totalSrartReading,
//           secondLabel: 'ClosingReading',
//           secondValue: totalEndReading,
//         };

//       default:
//         return {
//           firstLabel: 'Total Trips',
//           firstValue: '0',
//           secondLabel: 'Total Weight',
//           secondValue: '0.00 Ton'
//         };
//     }
//   };

//   const summaryOptions = [
//     { label: '🚛 Raw Material Trip', value: 'Raw material trip' },
//     { label: '🚗 Vehicle Trip', value: 'Vehicle trip' },
//     { label: '🚌 Transport Trip', value: 'Transport trip' },
//     { label: '📋 Sales Order', value: 'Sales order' },
//     { label: '⛽ Diesel Availability', value: 'Diesel availability' },
//     { label: '⚡ EB Hours Reading', value: 'EB hours reading' }
//   ];

//   const getActiveLabel = () => {
//     const selectedOption = summaryOptions.find(option => option.value === activeTripType);
//     return selectedOption ? selectedOption.label : activeTripType;
//   };

//   const renderIcon = (name, size, color) => {
//     const iconMap = {
//       'chevron-up': '▲',
//       'chevron-down': '▼',
//     };
//     return <Text style={{ fontSize: size, color: color }}>{iconMap[name] || '•'}</Text>;
//   };

//   const toggleSummaryDropdown = () => {
//     setSummaryDropdownOpen(!summaryDropdownOpen);
//   };

//   const selectSummaryOption = (option) => {
//     setActiveTripType(option);
//     setSummaryDropdownOpen(false);
//   };

//   const renderRawMaterialDetails = () => {
//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Product</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Detail</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>Trips</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'right' }]}>Weight</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {dashboardData.rawMaterial.length > 0 ? (
//             dashboardData.rawMaterial.map((item, index) => (
//               <View key={index}>
//                 <View style={styles.tableRow}>
//                   <Text style={[styles.tableCell, styles.IndexColumn, { flex: 0.5 }]}>{index + 1}</Text>
//                   <Text style={[styles.tableCell, { flex: 2, fontWeight: '500' }]}>{item.ItemName}</Text>
//                   <Text style={[styles.tableCell, { flex: 2.5 }]}>{item.Details}</Text>
//                   <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'center' }]}>{item.TotalTrip}</Text>
//                   <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>{item.NW} Ton</Text>
//                 </View>
//                 <View style={styles.rowSeparator} />
//               </View>
//             ))
//           ) : (
//             <Text style={styles.noDataText}>No Raw Material Data Available</Text>
//           )}
//       </ScrollView>
//       </View>
//     );
//   };

//   const renderTransportTripDetails = () => {
//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Transport</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Trips</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>MT</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {dashboardData.transportTrips.length > 0 ? (dashboardData.transportTrips.map((item, index) => (
//             <View key={item.id}>
//               <View style={styles.tableRow}>
//                 <Text style={[styles.tableCell, styles.IndexColumn, { flex: 0.5 }]}>{index + 1}</Text>
//                 <Text style={[styles.tableCell, { flex: 2.5, fontWeight: '500' }]}>{item.TransportName}</Text>
//                 <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.NoLoad}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.1, textAlign: 'center' }]}>{item.TQty}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>₹{item.TransportCharges}</Text>
//               </View>
//               <View style={styles.rowSeparator} />
//             </View>
//           ))
//           ) : (
//             <Text style={styles.noDataText}>No Transport Trip Data Available</Text>
//           )}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderVehicleTripDetails = () => {
//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Vehicle</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Detail</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Trips</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Weight</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {dashboardData.vehicleTrip.length > 0 ? (dashboardData.vehicleTrip.map((item, index) => (
//             <View key={index}>
//               <View style={styles.tableRow}>
//                 <Text style={[styles.tableCell, styles.IndexColumn, { flex: 0.5 }]}>{index + 1}</Text>
//                 <Text style={[styles.tableCell, { flex: 2.1, fontWeight: '500' }]}>{item.VechNumber}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.1 }]}>{item.Details}</Text>
//                 <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.TotalTrip}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.1, textAlign: 'right' }]}>{item.NW} Ton</Text>
//               </View>
//               <View style={styles.rowSeparator} />
//             </View>
//           ))
//           ) : (
//             <Text style={styles.noDataText}>No Vehicle Trip Data Available</Text>
//           )}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderSalesDetails = () => {
//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Order no</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>ReqQty</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>SupQty</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'right' }]}>BalQty</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {dashboardData.salesOrders.length > 0 ? (dashboardData.salesOrders.map((item, index) => (
//             <View key={index}>
//               <View style={styles.tableRow}>
//                 <Text style={[styles.tableCell, styles.IndexColumn, { flex: 0.5 }]}>{index + 1}</Text>
//                 <Text style={[styles.tableCell, { flex: 2, fontWeight: '500' }]}>{item.PONo}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'center' }]}>{item.ReqQty} Ton</Text>
//                 <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'center' }]}>{item.SupQty} Ton</Text>
//                 <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>{item.BalQty} Ton</Text>
//               </View>
//               <View style={styles.rowSeparator} />
//             </View>
//           ))
//           ) : (
//             <Text style={styles.noDataText}>No Sales Order Data Available</Text>
//           )}
//           </ScrollView>
//       </View>
//     );
//   };

//   const renderDieselAvailability = () => {
//     // Implementation based on the second code but following the first code's structure
//     const dieselData = dashboardData.dieselData.length > 0 ? dashboardData.dieselData[0] : {};
    
//     // Define the labels we want to show and their display names
//     const dieselFields = [
//       { key: 'OpeningStock', label: 'Opening Stock (Liters)' },
//       { key: 'OpeningStockValue', label: 'Opening Stock Value (₹)' },
//       { key: 'Purchase', label: 'Purchased (Liters)' },
//       { key: 'PurchaseValue', label: 'Purchase Value (₹)' },
//       { key: 'Utilized', label: 'Utilized (Liters)' },
//       { key: 'UtilizedValue', label: 'Utilized Value (₹)' },
//       { key: 'ClosingStock', label: 'Closing Stock (Liters)' },
//       { key: 'ClosingStockValue', label: 'Closing Stock Value (₹)' }
//     ];

//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Diesel Metric</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Value</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {dieselFields.map((field, index) => (
//             <View key={index}>
//               <View style={styles.tableRow}>
//                 <Text style={[styles.tableCell, { flex: 2 }]}>{field.label}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>
//                   {dieselData[field.key] || 0}
//                 </Text>
//               </View>
//               <View style={styles.rowSeparator} />
//             </View>
//           ))}
//           {Object.keys(dieselData).length === 0 && (
//             <Text style={styles.noDataText}>No Diesel Data Available</Text>
//           )}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderEBHoursReading = () => {
//     // Use the full array instead of just the first item
//     const ebDataArray = dashboardData.ebReadings || [];
    
//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Time</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'center' }]}>Start</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'center' }]}>End</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Units</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {ebDataArray.length > 0 ? (
//             ebDataArray.map((item, index) => (
//               <View key={index}>
//                 <View style={styles.tableRow}>
//                   <Text style={[styles.tableCell, styles.IndexColumn, { flex: 0.5 }]}>{index + 1}</Text>
//                   <Text style={[styles.tableCell, { flex: 2, fontWeight: '500' }]}>
//                     {new Date(item.ReadingToDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
//                   </Text>
//                   <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center' }]}>
//                     {item.StartingReading.toFixed(2)}
//                   </Text>
//                   <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center' }]}>
//                     {item.ClosingReading.toFixed(2)}
//                   </Text>
//                   <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>
//                     {item.RunningUnit.toFixed(2)}
//                   </Text>
//                 </View>
//                 <View style={styles.rowSeparator} />
//               </View>
//             ))
//           ) : (
//             <Text style={styles.noDataText}>No EB Reading Data Available</Text>
//           )}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderSelectedContent = () => {
//     switch (activeTripType) {
//       case 'Raw material trip':
//         return renderRawMaterialDetails();
//       case 'Vehicle trip':
//         return renderVehicleTripDetails();
//       case 'Transport trip':
//         return renderTransportTripDetails();
//       case 'Sales order':
//         return renderSalesDetails();
//       case 'Diesel availability':
//         return renderDieselAvailability();
//       case 'EB hours reading':
//         return renderEBHoursReading();
//       default:
//         return renderRawMaterialDetails();
//     }
//   };

//   const renderSummaryCard = () => {
//     const { firstLabel, firstValue, secondLabel, secondValue } = calculateSummaryMetrics();

//     return (
//       <View style={styles.card}>
//         <View style={styles.tripSummaryContainer}>
//           <View style={styles.tripSummaryItem}>
//             <Text style={[GlobalStyle.heading7,styles.tripSummaryLabel]}>{firstLabel}</Text>
//             <Text style={[GlobalStyle.heading6,styles.tripSummaryValue]}>{firstValue}</Text>
//           </View>
//           <View style={styles.tripSummaryDivider} />
//           <View style={styles.tripSummaryItem}>
//             <Text style={[GlobalStyle.heading7,styles.tripSummaryLabel]}>{secondLabel}</Text>
//             <Text style={[GlobalStyle.heading6,styles.tripSummaryValue]}>{secondValue}</Text>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   useEffect(() => {
//         if (error && !loading) {
//           setshowNetworkError(true);
//         } else {
//           setshowNetworkError(false);
//         }
//       });

//   if (loading) {
//     return <Loading />;
//   }

//   if (error && !refreshing) {
//     return (
//       <NetworkErrorModal 
//         visible={showNetworkError} 
//         onRefresh={onRefresh} 
//       />
//     );
//   }

 
//   return (
//     <View style={styles.container}>
//       <ImageBackground
//         source={require('../../images/LogoWaterMark.png')}
//         resizeMode="contain"
//         imageStyle={styles.imageStyle}
//         style={styles.headerBackground}
//       >
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={{ flexGrow: 1 }} 
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//         >
//           <View style={styles.header}>
//             <View style={styles.headerContent}>
//               <TouchableOpacity onPress={() => navigation.goBack()}>
//                 <FontAwesomeIcon icon={faArrowLeft} size={22} color="white" style={{ top: 11 }} />
//               </TouchableOpacity>
//               <Text style={[GlobalStyle.heading3, styles.headerText]}>
//                 Production
//               </Text>
//             </View>
//           </View>
          
//           {/* Tab navigation */}
//           <View style={styles.daycontainer}>
//             {tabs.map((tab, index) => (
//               <React.Fragment key={tab}>
//                 <TouchableOpacity
//                   style={[
//                     styles.tab,
//                     dateTab === tab && styles.dateTab,
//                     index === 0 && styles.firstTab,
//                     index === tabs.length - 1 && styles.lastTab,
//                   ]}
//                   onPress={() => setDateTab(tab)}
//                 >
//                   <Text
//                     style={[
//                       styles.tabText,
//                       dateTab === tab && styles.activeTabText,
//                     ]}
//                   >
//                     {tab}
//                   </Text>
//                 </TouchableOpacity>
//                 {index < tabs.length - 1 && <View style={styles.divider} />}
//               </React.Fragment>
//             ))}
//           </View>
//         </ScrollView>
//       </ImageBackground>

//       {/* Main content area */}
//       <View style={styles.contentContainer}>
//         {/* Top card with total net weight */}
//         <View style={styles.profitCard}>
//           <View style={styles.netProfitRow}>
//             <Text style={[GlobalStyle.heading4, styles.netProfitLabel]}>Total net weight</Text>
//             <Text style={[GlobalStyle.heading6, styles.netProfitAmount]}>{totalNetWeight} Ton</Text>
//           </View>

//           {/* Dropdown Container */}
//           <View style={styles.summaryContainer}>
//             <TouchableOpacity
//               style={styles.summaryButton}
//               onPress={toggleSummaryDropdown}
//             >
//               <Text style={styles.summaryButtonText}>{getActiveLabel()}</Text>
//               {renderIcon(summaryDropdownOpen ? "chevron-up" : "chevron-down", 20, "#3182CE")}
//             </TouchableOpacity>

//             {summaryDropdownOpen && (
//               <View style={styles.dropdownContainer}>
//                 {summaryOptions.map((option, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     style={styles.dropdownItem}
//                     onPress={() => selectSummaryOption(option.value)}
//                   >
//                     <Text style={[
//                       styles.dropdownItemText,
//                       activeTripType === option.value && styles.activeDropdownItemText
//                     ]}>
//                       {option.label}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             )}
//           </View>
//         </View>

//         {renderSummaryCard()}

//         {summaryDropdownOpen && <View style={styles.dropdownBuffer} />}

//         <View style={styles.tableContainer}>
//           {renderSelectedContent()}
//         </View>
//       </View>

//       {/* DateFilter Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={showDateFilterModal}
//         onRequestClose={() => {
//           setShowDateFilterModal(false);
//           // If user closes modal without selecting dates, reset to Today
//           if (dateTab === 'Custom' && !customFromDate) {
//             setDateTab('Today');
//           }
//         }}
//       >
//         <TouchableWithoutFeedback 
//           onPress={() => {
//             setShowDateFilterModal(false);
//             // If user closes modal without selecting dates, reset to Today
//             if (dateTab === 'Custom' && !customFromDate) {
//               setDateTab('Today');
//             }
//           }}
//         >
//           <View style={styles.modalBackground}>
//             <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
//               <View>
//                 <DateFilter 
//                   CloseModel={() => setShowDateFilterModal(false)} 
//                   onDateSelected={handleCustomDateSelect}
//                 />
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   tableCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: scale(16),
//     overflow: 'hidden',
//     marginBottom: verticalScale(13),
//     elevation: 2,
//     flexGrow: 1, 
//     minHeight: verticalScale(400), 
//     marginTop: verticalScale(60), 
//     width: '95%',
//     alignSelf: 'center',
//     paddingHorizontal: scale(0),
//     marginTop:verticalScale(-30),
//   },

//   tableHeaderRow: {
//     flexDirection: 'row',
//     paddingHorizontal: scale(16),
//     paddingVertical: verticalScale(12),
//     backgroundColor: '#F8F9FA',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   tableHeaderCell: {
//     fontSize: scale(14),
//     color: '#3E89EC',
//     fontWeight: '600',
//   },
//   tableBody: {
//     flex:1,
//     marginBottom:verticalScale(50)
//   },
//   tableRow: {
//     flexDirection: 'row',
//     paddingHorizontal: scale(16),
//     paddingVertical: verticalScale(12),
//   },
//   evenRow: {
//     backgroundColor: '#F6F8FA',
//   },
//   tableCell: {
//     fontSize: scale(14),
//     color: '#1F2937',
//   },
//   rowSeparator: {
//     height: 1,
//     backgroundColor: '#E5E7EB',
//     marginHorizontal: scale(16),
//   },
//   indexColumn: {
//     width: scale(24),
//     height: scale(24),
//     borderRadius: scale(12),
//     backgroundColor: '#F6F3ED',
//     textAlign: 'center',
//     lineHeight: scale(24),
//   },

//   daycontainer: {
//     flexDirection: 'row',
//     backgroundColor: '#4A90E2',
//     borderRadius: scale(5),
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#FFFFFF',
//     top: scale(13),
//     height: scale(30),
//     marginVertical: verticalScale(2),
//     width: scale(310),
//     justifyContent: 'center',
//     alignSelf: 'center',
//     top: 13,
//   },

//   tab: {
//     flex: 1,
//     paddingVertical: scale(2),
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   dateTab: {
//     backgroundColor: '#FFFFFF',
//   },
//   firstTab: {
//     borderTopLeftRadius: scale(1),
//     borderBottomLeftRadius: scale(1),
//   },
//   lastTab: {
//     borderTopRightRadius: scale(1),
//     borderBottomRightRadius: scale(1),
//   },
//   tabText: {
//     color: '#FFFFFF',
//     fontSize: 15,
//     fontFamily: 'Cabin-Medium'
//   },
//   activeTabText: {
//     color: '#3E89EC',
//     fontSize: 15,
//   },
//   divider: {
//     width: scale(1),
//     backgroundColor: '#FFFFFF',
//     height: '100%',
//   },


//   container: {
//     flex: 1,
//     backgroundColor: '#F6F3ED',
//   },

//   detailsContainer: {
//     width: '100%',
//     height: scale(400),
//     marginBottom: verticalScale(20),
//   },
//   detailsScrollView: {
//     flex: 1,
//     paddingBottom: verticalScale(20),
//   },
//   imageStyle: {
//     wwidth: 232,
//     marginTop: 33,
//     height: 208,
//     alignSelf: 'flex-end',
//     marginLeft: width - 232,
//   },
//   header: {
//     paddingVertical: scale(10),
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     bottom: verticalScale(3),
//     marginTop: verticalScale(2),
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//     marginLeft: scale(10),
//     top: verticalScale(10),
//   },
//   headerBackground: {
//     height: verticalScale(180),
//     backgroundColor: '#3E89EC',
//     paddingTop: verticalScale(25),
//     paddingHorizontal: scale(20),
//   },


//   card: {
//     backgroundColor: 'white',
//     borderRadius: 26,
//     marginBottom: 15,
//     padding: 15,
//     width: scale(320),
//     height: scale(69),
//     left: scale(15),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     bottom: scale(30),
//     zIndex: 1,
//   },
 
//   tripSummaryItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   tripSummaryDivider: {
//     width: 1,
//     height: '80%',
//     backgroundColor: '#E0E0E0',
//     marginBottom: scale(10)
//   },
//   tripSummaryLabel: {
//     color: '#666',
//     bottom: 6,
//   },
//   tripSummaryValue: {
//     bottom: 5,
//   },

//   profitCard: {
//     backgroundColor: '#FFF',
//     padding: moderateScale(15),
//     width: scale(340),
//     height: scale(120),
//     borderRadius: scale(26),
//     left: scale(5),
//     zIndex: 10, 
//     bottom: verticalScale(40),
//   },
//   netProfitRow: {
//     marginBottom: verticalScale(10),
//     marginHorizontal: verticalScale(20),
//   },
//   netProfitLabel: {
//     marginBottom: verticalScale(10),
//   },
//   netProfitAmount: {
//     color: '#63BE5A',
//     bottom: verticalScale(8),
//   },

//   tripSummaryContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   tripSummaryItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   tripSummaryDivider: {
//     width: 1,
//     height: '80%',
//     backgroundColor: '#E0E0E0',
//     marginBottom: scale(10)
//   },
//   tripSummaryLabel: {
//     color: '#666',
//     bottom: 6,
//   },
//   tripSummaryValue: {
//     bottom: 5,
//   },
//   summaryContainer: {
//     zIndex: 100,
//   },
//   summaryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#EBF5FF',
//     borderRadius: 25,
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     bottom: scale(20),
//   },
//   summaryButtonText: {
//     color: '#3182CE',
//     fontWeight: '500',
//   },

//   dropdownContainer: {
//     position: 'absolute',
//     top: '100%',
//     left: 0,
//     right: 0,
//     backgroundColor: 'white',
//     elevation: 5, 
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     borderRadius: 8,
//   },
  
//   dropdownItem: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 5,
//   },
//   dropdownItemText: {
//     color: '#333',
//   },
//   activeDropdownItemText: {
//     color: '#3182CE',
//     fontWeight: 'bold',
//   },
//   modalBackground:{
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',  
//     alignItems: 'center',      
//     zIndex: 999,
//   },
// });

// export default DataTables;







// import React, { useState, useRef, useEffect } from "react";
// import { View,DataFilter, Text, Dimensions, TouchableOpacity, Modal, BackHandler, TouchableWithoutFeedback, RefreshControl, ImageBackground, StyleSheet, ScrollView, Alert } from 'react-native';
// import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
// import GlobalStyle from "../../components/common/GlobalStyle";
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// import { useNavigation } from '@react-navigation/native';
// import Ton from '../../images/Ton.svg';
// import DashesDateFilter from "./DashesDataFilter";
// import Loading from "../../components/common/Loading";
// import NetworkErrorModal from "../NetworkErrorModal";
// import NetInfo from '@react-native-community/netinfo';

// import DateFilter from "../DateFilter";

// import { DashesDataContext } from "../../components/common/DashesDataContext";
// const { width, height } = Dimensions.get('window');

// const DataTables = () => {
//   const [dateTab, setDateTab] = useState('Today');
//   const tabs = ['Yesterday', 'Today', 'Week', 'Month', 'Custom'];
//   const detailsScrollViewRef = useRef(null);
//   const [summaryDropdownOpen, setSummaryDropdownOpen] = useState(false);
//   const [activeTripType, setActiveTripType] = useState('Raw material trip');
//   const [DieselDetails, setDieselDetails] = useState([]);
//   const [ebDetails, setEbDetails] = useState([]);
//   const [showDateFilterModal, setShowDateFilterModal] = useState(false);
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState(null);
//   const [customFromDate, setCustomFromDate] = useState(null);
//   const [customToDate, setCustomToDate] = useState(null);

//   const [totalNetWeight, setTotalNetWeight] = useState("0.00"); // New state for tracking total net weight
//   const [isConnected, setIsConnected] = useState(true);
//   const [showNetworkError,setshowNetworkError] = useState(false);
  


//   // Get context data
//   const {
//     productionData,
//     loadingStates,
//     selectedCompany,
//     startDate,
//     endDate,
//     startTime,
//     endTime,
//     setStartDate,
//     setEndDate,
//     setStartTime,
//     setEndTime,
//     fetchSingleDashboard,
//     fetchAllDashboards,
//     fetchCustomDashboard,
//     refreshDashboardData,
//     setTodayRange,
//     setYesterdayRange,
//     setWeekRange,
//     setMonthRange,
//     DASHBOARD_TYPES,
//   } = useContext(DashesDataContext);


//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener(state => {
//       setIsConnected(state.isConnected && state.isInternetReachable);
      
//       // If internet is restored, automatically refresh data
//       if (state.isConnected && state.isInternetReachable && error) {
//         onRefresh();
//       }
//     });
    
//     return () => unsubscribe();
//   }, [error]);

//   const [dashboardData, setDashboardData] = useState({
//     transportTrips: [],
//     ebReadings: [],
//     dieselData: [],
//     salesOrders: [],
//     rawMaterial: [],
//     vehicleTrip: [],
//   });

//   const API_URL = 'https://demo.sazss.in/Api/DashesDatas';
//   const AUTH_HEADERS = {
//     'Authorization': 'Basic ' + btoa('Inventory:SazsApps@123'),
//     'Content-Type': 'application/json'
//   };

//   // Calculate total net weight across all data sources
//   const calculateTotalNetWeight = (data) => {
//     let total = 0;
    
//     // Add raw material weight
//     if (data.rawMaterial && data.rawMaterial.length) {
//       total += data.rawMaterial.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0);
//     }
    
//     // Add vehicle trip weight
//     if (data.vehicleTrip && data.vehicleTrip.length) {
//       total += data.vehicleTrip.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0);
//     }
    
//     // Add transport trip weight (in MT)
//     if (data.transportTrips && data.transportTrips.length) {
//       total += data.transportTrips.reduce((sum, item) => sum + (parseFloat(item.TQty) || 0), 0);
//     }
    
//     return total.toFixed(2);
//   };

//   const fetchDashboardData = async (dateFilter, fromDateParam, toDateParam) => {
//     try {
//       setLoading(true);
//       let fromDate, toDate;
//       const currentDate = new Date();

//       switch (dateFilter) {
//         case 'Yesterday':
//           const yesterday = new Date(currentDate);
//           yesterday.setDate(currentDate.getDate() - 1);
//           fromDate = yesterday.toISOString().split('T')[0] + ' 00:00';
//           toDate = yesterday.toISOString().split('T')[0] + ' 23:59';
//           break;
//         case 'Today':
//           fromDate = currentDate.toISOString().split('T')[0] + ' 00:00';
//           toDate = currentDate.toISOString().split('T')[0] + ' 23:59';
//           break;
//         case 'Week':
//           const weekStart = new Date(currentDate);
//           weekStart.setDate(currentDate.getDate() - currentDate.getDay());
//           fromDate = weekStart.toISOString().split('T')[0] + ' 00:00';
//           toDate = currentDate.toISOString().split('T')[0] + ' 23:59';
//           break;
//         case 'Month':
//           const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//           fromDate = monthStart.toISOString().split('T')[0] + ' 00:00';
//           toDate = currentDate.toISOString().split('T')[0] + ' 23:59';
//           break;
//         case 'Custom':
//           fromDate = fromDateParam || (customFromDate ? customFromDate : currentDate.toISOString().split('T')[0] + ' 00:00');
//           toDate = toDateParam || (customToDate ? customToDate : currentDate.toISOString().split('T')[0] + ' 23:59');
//           break;
//         default:
//           fromDate = currentDate.toISOString().split('T')[0] + ' 00:00';
//           toDate = currentDate.toISOString().split('T')[0] + ' 23:59';
//       }

//       const response = await fetch(API_URL, {
//         method: 'POST',
//         headers: AUTH_HEADERS,
//         body: JSON.stringify({
//           DashName: "Production",
//           FromDate: fromDate,
//           ToDate: toDate,
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       const data = await response.json();
//       const dashboardData = {
//         transportTrips: data[0] || [],
//         ebReadings: data[1] || [],
//         dieselData: data[2] || [],
//         salesOrders: data[3] || [],
//         rawMaterial: data[4] || [],
//         vehicleTrip: data[5] || [],
//       };
      
//       setDashboardData(dashboardData);
      
//       // Calculate and set total net weight
//       const totalWeight = calculateTotalNetWeight(dashboardData);
//       setTotalNetWeight(totalWeight);
//       setError(null);
//       setshowNetworkError(false);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       setError('Failed to fetch data. Please try again.');
//       setshowNetworkError(true);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     setLoading(true); // Show loading screen during refresh
//     fetchDashboardData(dateTab, customFromDate, customToDate);
//   };


//   useEffect(() => {
//   // Only open date filter modal automatically when Custom tab is selected
//   if (dateTab === 'Custom') {
//     setShowDateFilterModal(true);
//   } else {
//     fetchDashboardData(dateTab);
//   }
// }, [dateTab]);

// // Handle custom date selection
// const handleCustomDateSelect = async (fromDate, toDate) => {
//   try {
//     // Convert date strings to Date objects if needed
//     const fromDateObj = typeof fromDate === 'string' ? new Date(fromDate) : fromDate;
//     const toDateObj = typeof toDate === 'string' ? new Date(toDate) : toDate;
//     if (isNaN(fromDateObj) || isNaN(toDateObj)) {
//       throw new Error('Invalid date format');
//     }
//     if (fromDateObj > toDateObj) {
//       Alert.alert('Invalid Date Range', 'The end date cannot be before the start date.');
//       return;
//     }
//     setCustomFromDate(fromDateObj);
//     setCustomToDate(toDateObj);
//     setShowDateFilterModal(false);
//     // Fetch data with custom dates
//     await fetchCustomDashboard('production', fromDateObj, toDateObj);
//   } catch (error) {
//     console.error('DataTables: Error setting custom dates:', error);
//     setShowNetworkError(true);
//   }
// };

// // Handle custom date selection from the DateFilter component
// const handleCustomDateSelect = (fromDate, toDate) => {
//   setCustomFromDate(fromDate);
//   setCustomToDate(toDate);
//   setShowDateFilterModal(false);
//   fetchDashboardData('Custom', fromDate, toDate);
// };

// // Handle back button and modal closing
// useEffect(() => {
//   const handleBackButtonClick = () => {
//     if (showDateFilterModal) {
//       setShowDateFilterModal(false);
//       return true;
//     } else if (navigation.canGoBack()) {
//       navigation.goBack();
//       return true;
//     } else {
//       Alert.alert(
//         'Exit App',
//         'Are you sure you want to exit?',
//         [
//           {
//             text: 'Cancel',
//             onPress: () => null,
//             style: 'cancel',
//           },
//           { text: 'OK', onPress: () => BackHandler.exitApp() },
//         ],
//         { cancelable: false },
//       );
//       return true;
//     }
//   };

//   const backHandler = BackHandler.addEventListener(
//     'hardwareBackPress',
//     handleBackButtonClick,
//   );

//   return () => {
//     backHandler.remove();
//   };
// }, [navigation, showDateFilterModal]);

// useEffect(() => {
//   if (dashboardData.dieselData.length > 0) {
//     const formattedData = Object.entries(dashboardData.dieselData[0]).map(([key, value]) => ({
//       Name: key,
//       Values: value
//     }));
//     setDieselDetails(formattedData);
//   }
// }, [dashboardData.dieselData]);

//   useEffect(() => {
//     if (dashboardData.ebReadings.length > 0) {
//       const formattedData = Object.entries(dashboardData.ebReadings[0]).map(([key, value]) => ({
//         Name: key,
//         Values: value
//       }));
//       setEbDetails(formattedData);
//     }
//   }, [dashboardData.ebReadings]);

//   const calculateSummaryMetrics = () => {
//     switch (activeTripType) {
//       case 'Raw material trip':
//         const totalRawMaterialTrips = dashboardData.rawMaterial.reduce((sum, item) => sum + (parseInt(item.TotalTrip) || 0), 0);
//         const totalRawMaterialWeight = dashboardData.rawMaterial.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0);
//         return {
//           firstLabel: 'Total Trips',
//           firstValue: totalRawMaterialTrips,
//           secondLabel: 'Total Weight',
//           secondValue: totalRawMaterialWeight.toFixed(2) + ' Ton'
//         };

//       case 'Vehicle trip':
//         const totalVehicleTrips = dashboardData.vehicleTrip.reduce((sum, item) => sum + (parseInt(item.TotalTrip) || 0), 0);
//         const totalVehicleWeight = dashboardData.vehicleTrip.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0);
//         return {
//           firstLabel: 'Total Trips',
//           firstValue: totalVehicleTrips,
//           secondLabel: 'Total Weight',
//           secondValue: totalVehicleWeight.toFixed(2) + ' Ton'
//         };

//       case 'Transport trip':
//         const totalTransportTrips = dashboardData.transportTrips.reduce((sum, item) => sum + (parseInt(item.NoLoad) || 0), 0);
//         const totalTransportMT = dashboardData.transportTrips.reduce((sum, item) => sum + (parseFloat(item.TQty) || 0), 0);
//         return {
//           firstLabel: 'Total Trips',
//           firstValue: totalTransportTrips,
//           secondLabel: 'Total MT',
//           secondValue: totalTransportMT.toFixed(2)
//         };

//       case 'Sales order':
//         const totalBalQty = dashboardData.salesOrders.reduce((sum, item) => sum + (parseFloat(item.BalQty) || 0), 0);
//         const totalSupQty = dashboardData.salesOrders.reduce((sum, item) => sum + (parseFloat(item.SupQty) || 0), 0);
//         return {
//           firstLabel: 'Total Bal Qty',
//           firstValue: totalBalQty.toFixed(2) + ' Ton',
//           secondLabel: 'Total Sup Qty',
//           secondValue: totalSupQty.toFixed(2) + ' Ton'
//         };

//       case 'Diesel availability':
//         const dieselData = dashboardData.dieselData.length > 0 ? dashboardData.dieselData[0] : {};
//         return {
//           firstLabel: 'Closing Stock',
//           firstValue: (dieselData.ClosingStock || 0) + ' L',
//           secondLabel: 'Stock Value',
//           secondValue: '₹' + (dieselData.ClosingStockValue || 0)
//         };

//       case 'EB hours reading':
//         const ebDataArray = dashboardData.ebReadings.length > 0 ? dashboardData.ebReadings[0] : {};
//         const totalSrartReading = dashboardData.ebReadings.reduce((sum, item) => sum + (parseFloat(item.StartingReading) || 0), 0);
//         const totalEndReading = dashboardData.ebReadings.reduce((sum, item) => sum + (parseFloat(item.ClosingReading) || 0), 0);
//         return {
//           firstLabel: 'StartingReading',
//           firstValue:totalSrartReading,
//           secondLabel: 'ClosingReading',
//           secondValue: totalEndReading,
//         };

//       default:
//         return {
//           firstLabel: 'Total Trips',
//           firstValue: '0',
//           secondLabel: 'Total Weight',
//           secondValue: '0.00 Ton'
//         };
//     }
//   };

//   const summaryOptions = [
//     { label: '🚛 Raw Material Trip', value: 'Raw material trip' },
//     { label: '🚗 Vehicle Trip', value: 'Vehicle trip' },
//     { label: '🚌 Transport Trip', value: 'Transport trip' },
//     { label: '📋 Sales Order', value: 'Sales order' },
//     { label: '⛽ Diesel Availability', value: 'Diesel availability' },
//     { label: '⚡ EB Hours Reading', value: 'EB hours reading' }
//   ];

//   const getActiveLabel = () => {
//     const selectedOption = summaryOptions.find(option => option.value === activeTripType);
//     return selectedOption ? selectedOption.label : activeTripType;
//   };

//   const renderIcon = (name, size, color) => {
//     const iconMap = {
//       'chevron-up': '▲',
//       'chevron-down': '▼',
//     };
//     return <Text style={{ fontSize: size, color: color }}>{iconMap[name] || '•'}</Text>;
//   };

//   const toggleSummaryDropdown = () => {
//     setSummaryDropdownOpen(!summaryDropdownOpen);
//   };

//   const selectSummaryOption = (option) => {
//     setActiveTripType(option);
//     setSummaryDropdownOpen(false);
//   };

//   const renderRawMaterialDetails = () => {
//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Product</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Detail</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>Trips</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'right' }]}>Weight</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {dashboardData.rawMaterial.length > 0 ? (
//             dashboardData.rawMaterial.map((item, index) => (
//               <View key={index}>
//                 <View style={styles.tableRow}>
//                   <Text style={[styles.tableCell, styles.IndexColumn, { flex: 0.5 }]}>{index + 1}</Text>
//                   <Text style={[styles.tableCell, { flex: 2, fontWeight: '500' }]}>{item.ItemName}</Text>
//                   <Text style={[styles.tableCell, { flex: 2.5 }]}>{item.Details}</Text>
//                   <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'center' }]}>{item.TotalTrip}</Text>
//                   <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>{item.NW} Ton</Text>
//                 </View>
//                 <View style={styles.rowSeparator} />
//               </View>
//             ))
//           ) : (
//             <Text style={styles.noDataText}>No Raw Material Data Available</Text>
//           )}
//       </ScrollView>
//       </View>
//     );
//   };

//   const renderTransportTripDetails = () => {
//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Transport</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Trips</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>MT</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {dashboardData.transportTrips.length > 0 ? (dashboardData.transportTrips.map((item, index) => (
//             <View key={item.id}>
//               <View style={styles.tableRow}>
//                 <Text style={[styles.tableCell, styles.IndexColumn, { flex: 0.5 }]}>{index + 1}</Text>
//                 <Text style={[styles.tableCell, { flex: 2.5, fontWeight: '500' }]}>{item.TransportName}</Text>
//                 <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.NoLoad}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.1, textAlign: 'center' }]}>{item.TQty}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>₹{item.TransportCharges}</Text>
//               </View>
//               <View style={styles.rowSeparator} />
//             </View>
//           ))
//           ) : (
//             <Text style={styles.noDataText}>No Transport Trip Data Available</Text>
//           )}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderVehicleTripDetails = () => {
//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Vehicle</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2 }]}>Detail</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'center' }]}>Trips</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Weight</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {dashboardData.vehicleTrip.length > 0 ? (dashboardData.vehicleTrip.map((item, index) => (
//             <View key={index}>
//               <View style={styles.tableRow}>
//                 <Text style={[styles.tableCell, styles.IndexColumn, { flex: 0.5 }]}>{index + 1}</Text>
//                 <Text style={[styles.tableCell, { flex: 2.1, fontWeight: '500' }]}>{item.VechNumber}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.1 }]}>{item.Details}</Text>
//                 <Text style={[styles.tableCell, { flex: 1, textAlign: 'center' }]}>{item.TotalTrip}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.1, textAlign: 'right' }]}>{item.NW} Ton</Text>
//               </View>
//               <View style={styles.rowSeparator} />
//             </View>
//           ))
//           ) : (
//             <Text style={styles.noDataText}>No Vehicle Trip Data Available</Text>
//           )}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderSalesDetails = () => {
//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Order no</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>ReqQty</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'center' }]}>SupQty</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: 'right' }]}>BalQty</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {dashboardData.salesOrders.length > 0 ? (dashboardData.salesOrders.map((item, index) => (
//             <View key={index}>
//               <View style={styles.tableRow}>
//                 <Text style={[styles.tableCell, styles.IndexColumn, { flex: 0.5 }]}>{index + 1}</Text>
//                 <Text style={[styles.tableCell, { flex: 2, fontWeight: '500' }]}>{item.PONo}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'center' }]}>{item.ReqQty} Ton</Text>
//                 <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'center' }]}>{item.SupQty} Ton</Text>
//                 <Text style={[styles.tableCell, { flex: 1.2, textAlign: 'right' }]}>{item.BalQty} Ton</Text>
//               </View>
//               <View style={styles.rowSeparator} />
//             </View>
//           ))
//           ) : (
//             <Text style={styles.noDataText}>No Sales Order Data Available</Text>
//           )}
//           </ScrollView>
//       </View>
//     );
//   };

//   const renderDieselAvailability = () => {
//     // Implementation based on the second code but following the first code's structure
//     const dieselData = dashboardData.dieselData.length > 0 ? dashboardData.dieselData[0] : {};
    
//     // Define the labels we want to show and their display names
//     const dieselFields = [
//       { key: 'OpeningStock', label: 'Opening Stock (Liters)' },
//       { key: 'OpeningStockValue', label: 'Opening Stock Value (₹)' },
//       { key: 'Purchase', label: 'Purchased (Liters)' },
//       { key: 'PurchaseValue', label: 'Purchase Value (₹)' },
//       { key: 'Utilized', label: 'Utilized (Liters)' },
//       { key: 'UtilizedValue', label: 'Utilized Value (₹)' },
//       { key: 'ClosingStock', label: 'Closing Stock (Liters)' },
//       { key: 'ClosingStockValue', label: 'Closing Stock Value (₹)' }
//     ];

//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Diesel Metric</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Value</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {dieselFields.map((field, index) => (
//             <View key={index}>
//               <View style={styles.tableRow}>
//                 <Text style={[styles.tableCell, { flex: 2 }]}>{field.label}</Text>
//                 <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>
//                   {dieselData[field.key] || 0}
//                 </Text>
//               </View>
//               <View style={styles.rowSeparator} />
//             </View>
//           ))}
//           {Object.keys(dieselData).length === 0 && (
//             <Text style={styles.noDataText}>No Diesel Data Available</Text>
//           )}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderEBHoursReading = () => {
//     // Use the full array instead of just the first item
//     const ebDataArray = dashboardData.ebReadings || [];
    
//     return (
//       <View style={styles.tableCard}>
//         <View style={styles.tableHeaderRow}>
//           <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}></Text>
//           <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Time</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'center' }]}>Start</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'center' }]}>End</Text>
//           <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: 'right' }]}>Units</Text>
//         </View>
//         <ScrollView style={styles.tableBody}>
//           {ebDataArray.length > 0 ? (
//             ebDataArray.map((item, index) => (
//               <View key={index}>
//                 <View style={styles.tableRow}>
//                   <Text style={[styles.tableCell, styles.IndexColumn, { flex: 0.5 }]}>{index + 1}</Text>
//                   <Text style={[styles.tableCell, { flex: 2, fontWeight: '500' }]}>
//                     {new Date(item.ReadingToDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
//                   </Text>
//                   <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center' }]}>
//                     {item.StartingReading.toFixed(2)}
//                   </Text>
//                   <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'center' }]}>
//                     {item.ClosingReading.toFixed(2)}
//                   </Text>
//                   <Text style={[styles.tableCell, { flex: 1.5, textAlign: 'right' }]}>
//                     {item.RunningUnit.toFixed(2)}
//                   </Text>
//                 </View>
//                 <View style={styles.rowSeparator} />
//               </View>
//             ))
//           ) : (
//             <Text style={styles.noDataText}>No EB Reading Data Available</Text>
//           )}
//         </ScrollView>
//       </View>
//     );
//   };

//   const renderSelectedContent = () => {
//     switch (activeTripType) {
//       case 'Raw material trip':
//         return renderRawMaterialDetails();
//       case 'Vehicle trip':
//         return renderVehicleTripDetails();
//       case 'Transport trip':
//         return renderTransportTripDetails();
//       case 'Sales order':
//         return renderSalesDetails();
//       case 'Diesel availability':
//         return renderDieselAvailability();
//       case 'EB hours reading':
//         return renderEBHoursReading();
//       default:
//         return renderRawMaterialDetails();
//     }
//   };

//   const renderSummaryCard = () => {
//     const { firstLabel, firstValue, secondLabel, secondValue } = calculateSummaryMetrics();

//     return (
//       <View style={styles.card}>
//         <View style={styles.tripSummaryContainer}>
//           <View style={styles.tripSummaryItem}>
//             <Text style={[GlobalStyle.heading7,styles.tripSummaryLabel]}>{firstLabel}</Text>
//             <Text style={[GlobalStyle.heading6,styles.tripSummaryValue]}>{firstValue}</Text>
//           </View>
//           <View style={styles.tripSummaryDivider} />
//           <View style={styles.tripSummaryItem}>
//             <Text style={[GlobalStyle.heading7,styles.tripSummaryLabel]}>{secondLabel}</Text>
//             <Text style={[GlobalStyle.heading6,styles.tripSummaryValue]}>{secondValue}</Text>
//           </View>
//         </View>
//       </View>
//     );
//   };

//   useEffect(() => {
//         if (error && !loading) {
//           setshowNetworkError(true);
//         } else {
//           setshowNetworkError(false);
//         }
//       });

//   if (loading) {
//     return <Loading />;
//   }

//   if (error && !refreshing) {
//     return (
//       <NetworkErrorModal 
//         visible={showNetworkError} 
//         onRefresh={onRefresh} 
//       />
//     );
//   }

 
//   return (
//     <View style={styles.container}>
//       <ImageBackground
//         source={require('../../images/LogoWaterMark.png')}
//         resizeMode="contain"
//         imageStyle={styles.imageStyle}
//         style={styles.headerBackground}
//       >
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={{ flexGrow: 1 }} 
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//           }
//         >
//           <View style={styles.header}>
//             <View style={styles.headerContent}>
//               <TouchableOpacity onPress={() => navigation.goBack()}>
//                 <FontAwesomeIcon icon={faArrowLeft} size={22} color="white" style={{ top: 11 }} />
//               </TouchableOpacity>
//               <Text style={[GlobalStyle.heading3, styles.headerText]}>
//                 Production
//               </Text>
//             </View>
//           </View>
          
//           {/* Tab navigation */}
//           <View style={styles.daycontainer}>
//             {tabs.map((tab, index) => (
//               <React.Fragment key={tab}>
//                 <TouchableOpacity
//                   style={[
//                     styles.tab,
//                     dateTab === tab && styles.dateTab,
//                     index === 0 && styles.firstTab,
//                     index === tabs.length - 1 && styles.lastTab,
//                   ]}
//                   onPress={() => setDateTab(tab)}
//                 >
//                   <Text
//                     style={[
//                       styles.tabText,GlobalStyle.H12,
//                       dateTab === tab && styles.activeTabText,
//                     ]}
//                   >
//                     {tab}
//                   </Text>
//                 </TouchableOpacity>
//                 {index < tabs.length - 1 && <View style={styles.divider} />}
//               </React.Fragment>
//             ))}
//           </View>
//         </ScrollView>
//       </ImageBackground>

//       {/* Main content area */}
//       <View style={styles.contentContainer}>
//         {/* Top card with total net weight */}
//         <View style={styles.profitCard}>
//           <View style={styles.netProfitRow}>
//             <Text style={[GlobalStyle.heading4, styles.netProfitLabel]}>Total net weight</Text>
//             {/* <Text style={[GlobalStyle.heading6, styles.netProfitAmount]}>{totalNetWeight} Ton</Text> */}
//           </View>

//           {/* Dropdown Container */}
//           <View style={styles.summaryContainer}>
//             <TouchableOpacity
//               style={styles.summaryButton}
//               onPress={toggleSummaryDropdown}
//             >
//               <Text style={styles.summaryButtonText}>{getActiveLabel()}</Text>
//               {renderIcon(summaryDropdownOpen ? "chevron-up" : "chevron-down", 20, "#3182CE")}
//             </TouchableOpacity>

//             {summaryDropdownOpen && (
//               <View style={styles.dropdownContainer}>
//                 {summaryOptions.map((option, index) => (
//                   <TouchableOpacity
//                     key={index}
//                     style={styles.dropdownItem}
//                     onPress={() => selectSummaryOption(option.value)}
//                   >
//                     <Text style={[
//                       styles.dropdownItemText,
//                       activeTripType === option.value && styles.activeDropdownItemText
//                     ]}>
//                       {option.label}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             )}
//           </View>
//         </View>

//         {renderSummaryCard()}

//         {summaryDropdownOpen && <View style={styles.dropdownBuffer} />}

//         <View style={styles.tableContainer}>
//           {renderSelectedContent()}
//         </View>
//       </View>

//       {/* DateFilter Modal */}
//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={showDateFilterModal}
//         onRequestClose={() => {
//           setShowDateFilterModal(false);
//           // If user closes modal without selecting dates, reset to Today
//           if (dateTab === 'Custom' && !customFromDate) {
//             setDateTab('Today');
//           }
//         }}
//       >
//         <TouchableWithoutFeedback 
//           onPress={() => {
//             setShowDateFilterModal(false);
//             // If user closes modal without selecting dates, reset to Today
//             if (dateTab === 'Custom' && !customFromDate) {
//               setDateTab('Today');
//             }
//           }}
//         >
//           <View style={styles.modalBackground}>
//             <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
//               <View>
//                 <DateFilter
//                   CloseModel={() => setShowDateFilterModal(false)}
//                   onDateSelected={handleCustomDateSelect}
//                 />
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   tableCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: scale(16),
//     overflow: 'hidden',
//     marginBottom: verticalScale(13),
//     elevation: 2,
//     flexGrow: 1, 
//     minHeight: verticalScale(400), 
//     marginTop: verticalScale(60), 
//     width: '95%',
//     alignSelf: 'center',
//     paddingHorizontal: scale(0),
//     marginTop:verticalScale(-30),
//   },

//   tableHeaderRow: {
//     flexDirection: 'row',
//     paddingHorizontal: scale(16),
//     paddingVertical: verticalScale(12),
//     backgroundColor: '#F8F9FA',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   tableHeaderCell: {
//     fontSize: scale(14),
//     color: '#3E89EC',
//     fontWeight: '600',
//   },
//   tableBody: {
//     flex:1,
//     marginBottom:verticalScale(50)
//   },
//   tableRow: {
//     flexDirection: 'row',
//     paddingHorizontal: scale(16),
//     paddingVertical: verticalScale(12),
//   },
//   tableCell: {
//     fontSize: scale(14),
//     color: '#1F2937',
//   },
//   rowSeparator: {
//     height: 1,
//     backgroundColor: '#E5E7EB',
//     marginHorizontal: scale(16),
//   },
//   daycontainer: {
//     flexDirection: 'row',
//     backgroundColor: '#4A90E2',
//     borderRadius: scale(5),
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#FFFFFF',
//     top: scale(13),
//     height: scale(30),
//     marginVertical: verticalScale(2),
//     width: scale(310),
//     justifyContent: 'center',
//     alignSelf: 'center',
//     top: 13,
//   },

//   tab: {
//     flex: 1,
//     paddingVertical: scale(2),
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   dateTab: {
//     backgroundColor: '#FFFFFF',
//   },
//   firstTab: {
//     borderTopLeftRadius: scale(1),
//     borderBottomLeftRadius: scale(1),
//   },
//   lastTab: {
//     borderTopRightRadius: scale(1),
//     borderBottomRightRadius: scale(1),
//   },
//   tabText: {
//     // color: '#FFFFFF',
//     // fontSize: 15,
//     // fontFamily: 'Cabin-Medium'
//   },
//   activeTabText: {
//     color: '#3E89EC',
//     fontSize: 15,
//   },
//   divider: {
//     width: scale(1),
//     backgroundColor: '#FFFFFF',
//     height: '100%',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#F6F3ED',
//   },
//   imageStyle: {
//     wwidth: 232,
//     marginTop: 33,
//     height: 208,
//     alignSelf: 'flex-end',
//     marginLeft: width - 232,
//   },
//   header: {
//     paddingVertical: scale(10),
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     bottom: verticalScale(3),
//     marginTop: verticalScale(2),
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//     marginLeft: scale(10),
//     top: verticalScale(10),
//   },
//   headerBackground: {
//     height: verticalScale(180),
//     backgroundColor: '#3E89EC',
//     paddingTop: verticalScale(25),
//     paddingHorizontal: scale(20),
//   },
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 26,
//     marginBottom: 15,
//     padding: 15,
//     width: scale(320),
//     height: scale(69),
//     left: scale(15),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//     bottom: scale(30),
//     zIndex: 1,
//   },
 
//   tripSummaryItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   tripSummaryDivider: {
//     width: 1,
//     height: '80%',
//     backgroundColor: '#E0E0E0',
//     marginBottom: scale(10)
//   },
//   tripSummaryLabel: {
//     color: '#666',
//     bottom: 6,
//   },
//   tripSummaryValue: {
//     bottom: 5,
//   },
//   profitCard: {
//     backgroundColor: '#FFF',
//     padding: moderateScale(15),
//     width: scale(340),
//     height: scale(120),
//     borderRadius: scale(26),
//     left: scale(5),
//     zIndex: 10, 
//     bottom: verticalScale(40),
//   },
//   netProfitRow: {
//     marginBottom: verticalScale(10),
//     marginHorizontal: verticalScale(20),
//   },
//   netProfitLabel: {
//     marginBottom: verticalScale(10),
//   },
//   tripSummaryContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   tripSummaryItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   tripSummaryDivider: {
//     width: 1,
//     height: '80%',
//     backgroundColor: '#E0E0E0',
//     marginBottom: scale(10)
//   },
//   tripSummaryLabel: {
//     color: '#666',
//     bottom: 6,
//   },
//   tripSummaryValue: {
//     bottom: 5,
//   },
//   summaryContainer: {
//     zIndex: 100,
//   },
//   summaryButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#EBF5FF',
//     borderRadius: 25,
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     bottom: scale(10),
//   },
//   summaryButtonText: {
//     color: '#3182CE',
//     fontWeight: '500',
//   },
//   dropdownContainer: {
//     position: 'absolute',
//     top: '100%',
//     left: 0,
//     right: 0,
//     backgroundColor: 'white',
//     elevation: 5, 
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     borderRadius: 8,
//   },
//   dropdownItem: {
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderRadius: 5,
//   },
//   dropdownItemText: {
//     color: '#333',
//   },
//   activeDropdownItemText: {
//     color: '#3182CE',
//     fontWeight: 'bold',
//   },
//   modalBackground:{
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',  
//     alignItems: 'center',      
//     zIndex: 999,
//   },
// });

// export default DataTables;