import React, { useState, useEffect, useContext } from "react";
import { View, Text, Dimensions, Image, TouchableOpacity, Modal, BackHandler, TouchableWithoutFeedback, RefreshControl, ImageBackground, StyleSheet, ScrollView, Alert } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import GlobalStyle from "../../components/common/GlobalStyle";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import Loading from "../../components/common/Loading";
import NetworkErrorModal from "../NetworkErrorModal";
import DashesDateFilter from "./DashesDataFilter";
import TonIcon from '../../images/TonIcon.svg';
import RawMaterialIcon from '../../images/RawMaterialIcon.svg';
import VehicleIcon from '../../images/VehicleIcon.svg';
import TransportIcon from '../../images/TransportIcon.svg';
import ProductIcon from '../../images/ProductIcon.svg';
import WeightIcon from '../../images/WeightIcon.svg';
import VehicleIconCircle from '../../images/VehicleIconCircle.svg';
import SalesOrderIcon from '../../images/SalesOrderIcon.svg';
import DieselIcon from '../../images/DieselIcon.svg';
import EbReadingIcon from '../../images/EbReadingIcon.svg';
// import JcbIcon from '../../images/JcbIcon';
import RupeesIcon from '../../images/RupeesIcon.svg';
import TonBlueIcon from '../../images/TonBlueIcon.svg';
import SupQty from '../../images/SupQty.svg';
import BalQty from '../../images/BalQty.svg';
import ReqQty from '../../images/ReqQty.svg';
import OrderNo from '../../images/OrderNo.svg';
import DieselMetric from '../../images/DieselMetric.svg';
import EbStart from '../../images/EbStart.svg';
import EbStop from '../../images/EbStop.svg';
import EbTime from '../../images/EbTime.svg';
import EbUnits from '../../images/EbUnits.svg';
import TripIcon from '../../images/TripIcon.svg';
import { DashesDataContext } from "../../components/common/DashesDataContext";
const { width } = Dimensions.get('window');

const DataTables = () => {
  const [dateTab, setDateTab] = useState('Today');
  const [summaryDropdownOpen, setSummaryDropdownOpen] = useState(false);
  const [activeTripType, setActiveTripType] = useState('Raw material trip');
  const [showDateFilterModal, setShowDateFilterModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalNetWeight, setTotalNetWeight] = useState("0.00");
  const [transportTripTotalAmount, setTransportTripTotalAmount] = useState("0.00");
  const [vehicleTripTotalAmount, setVehicleTripTotalAmount] = useState("0.00");
  const [isConnected, setIsConnected] = useState(true);
  const [showNetworkError, setShowNetworkError] = useState(false);
  const [customFromDate, setCustomFromDate] = useState(null);
  const [customToDate, setCustomToDate] = useState(null);
  const navigation = useNavigation();

  const {
    productionData,
    loadingStates,
    setTodayRange,
    setYesterdayRange,
    setWeekRange,
    setMonthRange,
    fetchCustomDashboard,
    refreshDashboardData,
  } = useContext(DashesDataContext);

  const tabs = ['Yesterday', 'Today', 'Week', 'Month', 'Custom'];
  const summaryOptions = [
    { icon: <RawMaterialIcon width={25} height={25} />, label: 'Raw Material Trip', value: 'Raw material trip' },
    { icon: <VehicleIcon width={25} height={25} />, label: 'Vehicle Trip', value: 'Vehicle trip' },
    { icon: <TransportIcon width={25} height={25} />, label: 'Transport Trip', value: 'Transport trip' },
    { icon: <SalesOrderIcon width={25} height={25} />, label: 'Sales Order', value: 'Sales order' },
    { icon: <DieselIcon width={25} height={25} />, label: 'Diesel Availability', value: 'Diesel availability' },
    { icon: <EbReadingIcon width={25} height={25} />, label: 'EB Hours Reading', value: 'EB hours reading' },
  ];

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
      if (state.isConnected && state.isInternetReachable && showNetworkError) onRefresh();
    });
    handleDateTabChange('Today');
    return () => unsubscribe();
  }, [showNetworkError]);

  useEffect(() => {
    const handleBackButton = () => {
      if (showDateFilterModal) {
        setShowDateFilterModal(false);
        if (dateTab === 'Custom' && !customFromDate) {
          setDateTab('Today');
          handleDateTabChange('Today');
        }
        return true;
      }
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      Alert.alert('Exit App', 'Are you sure you want to exit?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => BackHandler.exitApp() },
      ], { cancelable: false });
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => backHandler.remove();
  }, [showDateFilterModal, dateTab, customFromDate]);

  const parseProductionData = () => productionData?.length >= 6 ? {
    transportTrips: productionData[0] || [],
    ebReadings: productionData[1] || [],
    dieselData: productionData[2] || [],
    salesOrders: productionData[3] || [],
    rawMaterial: productionData[4] || [],
    vehicleTrip: productionData[5] || [],
  } : { transportTrips: [], ebReadings: [], dieselData: [], salesOrders: [], rawMaterial: [], vehicleTrip: [] };

  const dashboardData = parseProductionData();

  const calculateTotals = () => {
    const total = (dashboardData.rawMaterial.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0) +
      dashboardData.vehicleTrip.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0) +
      dashboardData.transportTrips.reduce((sum, item) => sum + (parseFloat(item.TQty) || 0), 0)).toFixed(2);
    const transportAmount = dashboardData.transportTrips.reduce((sum, item) => sum + (parseFloat(item.TransportCharges) || 0), 0).toFixed(2);
    const vehicleAmount = dashboardData.vehicleTrip.reduce((sum, item) => sum + (parseFloat(item.TransportCharges) || 0), 0).toFixed(2);
    setTotalNetWeight(total);
    setTransportTripTotalAmount(transportAmount);
    setVehicleTripTotalAmount(vehicleAmount);
  };

  useEffect(() => calculateTotals(), [productionData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDashboardData();
      setShowNetworkError(false);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setShowNetworkError(true);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDateTabChange = async (tab) => {
    setDateTab(tab);
    setCustomFromDate(null);
    setCustomToDate(null);
    try {
      const ranges = {
        Yesterday: setYesterdayRange,
        Today: setTodayRange,
        Week: setWeekRange,
        Month: setMonthRange,
      };
      if (tab === 'Custom') setShowDateFilterModal(true);
      else await ranges[tab]?.('production');
    } catch (error) {
      console.error('Error changing date tab:', error);
      setShowNetworkError(true);
    }
  };

  const handleCustomDateSelect = async (fromDate, toDate) => {
    try {
      const fromDateObj = typeof fromDate === 'string' ? new Date(fromDate) : fromDate;
      const toDateObj = typeof toDate === 'string' ? new Date(toDate) : toDate;
      if (isNaN(fromDateObj) || isNaN(toDateObj)) throw new Error('Invalid date format');
      if (fromDateObj > toDateObj) {
        Alert.alert('Invalid Date Range', 'End date cannot be before start date.');
        return;
      }
      setCustomFromDate(fromDateObj);
      setCustomToDate(toDateObj);
      setShowDateFilterModal(false);
      await fetchCustomDashboard('production', fromDateObj, toDateObj);
    } catch (error) {
      console.error('Error setting custom dates:', error);
      setShowNetworkError(true);
    }
  };

  const getSummaryMetrics = () => {
    switch (activeTripType) {
      case 'Raw material trip':
        return {
          firstLabel: 'Total Trips', firstValue: dashboardData.rawMaterial.reduce((sum, item) => sum + (parseInt(item.TotalTrip) || 0), 0),
          secondLabel: 'Total Weight', secondValue: dashboardData.rawMaterial.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0).toFixed(2) + ' Ton'
        };
      case 'Vehicle trip':
        return {
          firstLabel: 'Total Trips', firstValue: dashboardData.vehicleTrip.reduce((sum, item) => sum + (parseInt(item.TotalTrip) || 0), 0),
          secondLabel: 'Total Weight', secondValue: dashboardData.vehicleTrip.reduce((sum, item) => sum + (parseFloat(item.NW) || 0), 0).toFixed(2) + ' Ton'
        };
      case 'Transport trip':
        return {
          firstLabel: 'Total Trips', firstValue: dashboardData.transportTrips.reduce((sum, item) => sum + (parseInt(item.NoLoad) || 0), 0),
          secondLabel: 'Total MT', secondValue: dashboardData.transportTrips.reduce((sum, item) => sum + (parseFloat(item.TQty) || 0), 0).toFixed(2)
        };
      case 'Sales order':
        return {
          firstLabel: 'Total Bal Qty', firstValue: dashboardData.salesOrders.reduce((sum, item) => sum + (parseFloat(item.BalQty) || 0), 0).toFixed(2) + ' Ton',
          secondLabel: 'Total Sup Qty', secondValue: dashboardData.salesOrders.reduce((sum, item) => sum + (parseFloat(item.SupQty) || 0), 0).toFixed(2) + ' Ton'
        };
      case 'Diesel availability':
        const dieselData = dashboardData.dieselData[0] || {};
        return {
          firstLabel: 'Closing Stock', firstValue: (dieselData.ClosingStock || 0) + ' L',
          secondLabel: 'Stock Value', secondValue: '₹' + (dieselData.ClosingStockValue || 0)
        };
      case 'EB hours reading':
        return {
          firstLabel: 'Starting Reading', firstValue: dashboardData.ebReadings.reduce((sum, item) => sum + (parseFloat(item.StartingReading) || 0), 0).toFixed(2),
          secondLabel: 'Closing Reading', secondValue: dashboardData.ebReadings.reduce((sum, item) => sum + (parseFloat(item.ClosingReading) || 0), 0).toFixed(2)
        };
      default:
        return { firstLabel: 'Total Trips', firstValue: '0', secondLabel: 'Total Weight', secondValue: '0.00 Ton' };
    }
  };

  const getNetProfit = () => ({
    label: ['Transport trip', 'Vehicle trip'].includes(activeTripType) ? 'Transport Amount' : 'Total Net Weight',
    amount: activeTripType === 'Transport trip' ? `₹${transportTripTotalAmount}` :
      activeTripType === 'Vehicle trip' ? `₹${vehicleTripTotalAmount}` : `${totalNetWeight} Ton`,
    icon: ['Transport trip', 'Vehicle trip'].includes(activeTripType) ? <RupeesIcon width={80} height={80} /> : <TonIcon width={80} height={80} />
  });

  const getActiveOption = () => summaryOptions.find(option => option.value === activeTripType) || summaryOptions[0];

  const getTabLabel = (tab) => tab === 'Custom' && customFromDate && customToDate ? `Custom: ${customFromDate.toLocaleDateString()} - ${customToDate.toLocaleDateString()}` : tab;

  const renderTable = ({ headers, data, renderRow, noDataText, noDataImage }) => (
    <View style={s.tableCard}>
      <View style={s.tableHeaderRow}>
        {headers.map((header, i) => (
          <View key={i} style={[s.tableHeaderCell, header.style || {}]}>
            {header.icon}
            <Text style={[GlobalStyle.H13, { marginLeft: header.icon ? 2 : 0 }]}>{header.label}</Text>
          </View>
        ))}
      </View>
      <ScrollView style={[s.tableBody, { maxHeight: 400 }]} showsVerticalScrollIndicator nestedScrollEnabled contentContainerStyle={{ paddingBottom: 30 }}>
        {data.length > 0 ? data.map(renderRow) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 2, top: 30 }}>
            {noDataImage && <Image source={require('../../images/NoResult.png')} style={{ width: 100, height: 100 }} resizeMode="contain" />}
            <Text style={s.noDataText}>{noDataText}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderRow = (item, index, config) => (
    <View key={item.id || index} style={s.rowCard}>
      <View style={s.rowLeft}><WeightIcon width={30} height={30} /></View>
      <View style={s.rowCenter}>
        <Text style={[s.productName, { flex: 1, left: 10 }]}>{config.name(item)}</Text>
        {config.subText && <Text style={[s.productSubText, { flex: 1, left: 10 }]}>{config.subText(item)}</Text>}
      </View>
      {config.fields.map((field, i) => (
        <Text key={i} style={[s[field.style], { flex: 1, textAlign: 'right', marginRight: field.margin }]}>{field.value(item)}</Text>
      ))}
    </View>
  );

  const tableConfigs = {
    'Raw material trip': {
      headers: [
        { style: { flex: 0 }, label: '' },
        { style: { flex: 2, flexDirection: 'row', alignItems: 'center' }, icon: <ProductIcon width={20} height={20} />, label: 'Product' },
        { style: { flex: 0, flexDirection: 'row', alignItems: 'center', right: 10 }, icon: <WeightIcon width={20} height={20} />, label: 'Trip' },
        { style: { flex: 1, flexDirection: 'row', alignItems: 'center' }, icon: <WeightIcon width={20} height={20} />, label: 'Weight' }
      ],
      data: dashboardData.rawMaterial,
      renderRow: (item, index) => renderRow(item, index, {
        name: item => item.ItemName,
        subText: item => item.Details,
        fields: [
          { style: 'rowTon', margin: 40, value: item => item.TotalTrip },
          { style: 'rowWeight', margin: 30, value: item => item.NW }
        ]
      }),
      noDataText: 'No Raw Material Data Available'
    },
    'Vehicle trip': {
      headers: [
        { style: { flex: 0 }, label: '' },
        { style: { flex: 2, flexDirection: 'row', alignItems: 'center' }, icon: <VehicleIconCircle width={20} height={20} />, label: 'Vehicle' },
        { style: { flex: 1, flexDirection: 'row', alignItems: 'center', right: 10 }, icon: <TonBlueIcon width={20} height={20} />, label: 'Trip' },
        { style: { flex: 1, flexDirection: 'row', alignItems: 'center' }, icon: <WeightIcon width={20} height={20} />, label: 'Weight' }
      ],
      data: dashboardData.vehicleTrip,
      renderRow: (item, index) => renderRow(item, index, {
        name: item => item.VechNumber,
        subText: item => item.Details,
        fields: [
          { style: 'rowTon', margin: 40, value: item => item.TotalTrip },
          { style: 'rowWeight', margin: 30, value: item => item.NW }
        ]
      }),
      noDataText: 'No Vehicle Trip Data Available'
    },
    'Transport trip': {
      headers: [
        { style: { flex: 0 }, label: '' },
        { style: { flex: 2, flexDirection: 'row', alignItems: 'center' }, icon: <VehicleIconCircle width={20} height={20} />, label: 'Transport' },
        { style: { flex: 1, flexDirection: 'row', alignItems: 'center', right: 10 }, icon: <TripIcon width={30} height={30} />, label: 'Trip' },
        { style: { flex: 1, flexDirection: 'row', alignItems: 'center', right: 10 }, icon: <WeightIcon width={20} height={20} />, label: 'MT' }
      ],
      data: dashboardData.transportTrips,
      renderRow: (item, index) => renderRow(item, index, {
        name: item => item.TransportName,
        fields: [
          { style: 'rowTon', margin: 40, value: item => item.NoLoad },
          { style: 'rowTon', margin: 40, value: item => item.TQty }
        ]
      }),
      noDataText: 'No Transport Trip Data Available'
    },
    'Sales order': {
      headers: [
        { style: { flex: 0 }, label: '' },
        { style: { flex: 1.5, flexDirection: 'row', alignItems: 'center', right: -10 }, icon: <OrderNo width={15} height={15} style={{ width: 40, height: 40, resizeMode: 'contain' }} />, label: 'Order No' },
        { style: { flex: 1, flexDirection: 'row', alignItems: 'center', left: 8 }, icon: <ReqQty width={15} height={15} style={{ width: 40, height: 40, resizeMode: 'contain' }} />, label: 'ReqQty' },
        { style: { flex: 1, flexDirection: 'row', alignItems: 'center', left: 20 }, icon: <SupQty width={15} height={15} style={{ width: 40, height: 40, resizeMode: 'contain' }} />, label: 'SupQty' },
        { style: { flex: 1.5, flexDirection: 'row', alignItems: 'center', left: 15 }, icon: <BalQty width={15} height={15} style={{ width: 40, height: 40, resizeMode: 'contain' }} />, label: 'BalQty' }
      ],
      data: dashboardData.salesOrders,
      renderRow: (item, index) => renderRow(item, index, {
        name: item => item.PONo,
        fields: [
          { style: 'rowTon', margin: 40, value: item => item.ReqQty },
          { style: 'rowTon', margin: 40, value: item => item.SupQty },
          { style: 'rowWeight', margin: 30, value: item => item.BalQty }
        ]
      }),
      noDataText: 'No Sales Order Data Available',
      noDataImage: true
    },
    'Diesel availability': {
      headers: [
        { style: { flex: 0 }, label: '' },
        { style: { flex: 2, flexDirection: 'row', alignItems: 'center' }, icon: <DieselMetric width={20} height={20} />, label: 'Diesel Metric' },
        { style: { flex: 1.5, flexDirection: 'row', alignItems: 'center' }, icon: <WeightIcon width={20} height={20} />, label: 'Value' }
      ],
      data: (dashboardData.dieselData[0] ? [
        { key: 'OpeningStock', label: 'Opening Stock', unit: 'L', value: dashboardData.dieselData[0].OpeningStock || 0 },
        { key: 'OpeningStockValue', label: 'Opening Value', unit: '₹', value: dashboardData.dieselData[0].OpeningStockValue || 0 },
        { key: 'Purchase', label: 'Purchase', unit: 'L', value: dashboardData.dieselData[0].Purchase || 0 },
        { key: 'PurchaseValue', label: 'Purchase Value', unit: '₹', value: dashboardData.dieselData[0].PurchaseValue || 0 },
        { key: 'Utilized', label: 'Utilized', unit: 'L', value: dashboardData.dieselData[0].Utilized || 0 },
        { key: 'UtilizedValue', label: 'Utilized Value', unit: '₹', value: dashboardData.dieselData[0].UtilizedValue || 0 },
        { key: 'ClosingStock', label: 'Closing Stock', unit: 'L', value: dashboardData.dieselData[0].ClosingStock || 0 },
        { key: 'ClosingStockValue', label: 'Closing Value', unit: '₹', value: dashboardData.dieselData[0].ClosingStockValue || 0 }
      ] : []),
      renderRow: (item, index) => renderRow(item, index, {
        name: item => item.label,
        fields: [{ style: 'rowWeight', margin: 30, value: item => `${item.unit}${item.value}` }]
      }),
      noDataText: 'No Diesel Data Available'
    },
    'EB hours reading': {
      headers: [
        { style: { flex: 0 }, label: '' },
        { style: { flex: 2.5, flexDirection: 'row', alignItems: 'center' }, icon: <EbTime width={20} height={20} />, label: 'Time' },
        { style: { flex: 0, flexDirection: 'row', alignItems: 'center', right: 30 }, icon: <EbStart width={20} height={20} />, label: 'Start' },
        { style: { flex: 1, flexDirection: 'row', alignItems: 'center', right: 20 }, icon: <EbStop width={20} height={20} />, label: 'End' },
        { style: { flex: 1, flexDirection: 'row', alignItems: 'center', right: 10 }, icon: <EbUnits width={20} height={20} />, label: 'Units' }
      ],
      data: dashboardData.ebReadings,
      renderRow: (item, index) => renderRow(item, index, {
        name: item => new Date(item.ReadingToDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fields: [
          { style: 'rowTon', margin: 25, value: item => item.StartingReading },
          { style: 'rowTon', margin: 25, value: item => item.ClosingReading },
          { style: 'rowWeight', margin: 10, value: item => item.RunningUnit }
        ]
      }),
      noDataText: 'No EB Reading Data Available'
    }
  };

  if (loadingStates.production || loadingStates.all) return <Loading />;
  if (showNetworkError && !refreshing) return <NetworkErrorModal visible={showNetworkError} onRefresh={onRefresh} />;

  const { firstLabel, firstValue, secondLabel, secondValue } = getSummaryMetrics();
  const { label, amount, icon } = getNetProfit();
  const { icon: activeIcon, label: activeLabel } = getActiveOption();

  return (
    <View style={s.container}>
      <ImageBackground source={require('../../images/LogoWaterMark.png')} resizeMode="contain" imageStyle={s.imageStyle} style={s.headerBackground}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faArrowLeft} size={22} color="white" style={{ top: 11 }} />
          </TouchableOpacity>
          <Text style={[GlobalStyle.heading3, s.headerText]}>Production</Text>
        </View>
        <View style={s.daycontainer}>
          {tabs.map((tab, i) => (
            <React.Fragment key={tab}>
              <TouchableOpacity
                style={[s.tab, dateTab === tab && s.dateTab, i === 0 && s.firstTab, i === tabs.length - 1 && s.lastTab]}
                onPress={() => handleDateTabChange(tab)}
              >
                <Text style={[GlobalStyle.H11,s.tabText, dateTab === tab && s.activeTabText]}>{getTabLabel(tab)}</Text>
              </TouchableOpacity>
              {i < tabs.length - 1 && <View style={s.divider} />}
            </React.Fragment>
          ))}
        </View>
      </ImageBackground>
      <View style={s.contentContainer}>
        <View style={s.profitCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={[GlobalStyle.heading4, s.netProfitLabel]}>{label}</Text>
              <Text style={[GlobalStyle.heading6, s.netProfitAmount]}>{amount}</Text>
            </View>
            <View style={[s.NetImage, { right: 10, flexShrink: 0 }]}>{icon}</View>
          </View>
        </View>
        <View style={s.summaryContainer}>
          <TouchableOpacity style={s.summaryButton} onPress={() => setSummaryDropdownOpen(!summaryDropdownOpen)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {activeIcon}
              <Text style={[s.summaryButtonText, { marginLeft: 8 }]}>{activeLabel}</Text>
            </View>
            <Text style={{ fontSize: 20, color: '#3182CE' }}>{summaryDropdownOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {summaryDropdownOpen && (
            <View style={s.dropdownContainer}>
              {summaryOptions.map((option, i) => (
                <TouchableOpacity key={i} style={s.dropdownItem} onPress={() => { setActiveTripType(option.value); setSummaryDropdownOpen(false); }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {option.icon && <View style={{ marginRight: 8 }}>{option.icon}</View>}
                    <Text style={[s.dropdownItemText, activeTripType === option.value && s.activeDropdownItemText]}>{option.label}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        <View style={s.card}>
          <View style={s.tripSummaryContainer}>
            <View style={s.tripSummaryItem}>
              <Text style={[GlobalStyle.heading7, s.tripSummaryLabel]}>{firstLabel}</Text>
              <Text style={[GlobalStyle.heading6, s.tripSummaryValue]}>{firstValue}</Text>
            </View>
            <View style={s.tripSummaryDivider} />
            <View style={s.tripSummaryItem}>
              <Text style={[GlobalStyle.heading7, s.tripSummaryLabel]}>{secondLabel}</Text>
              <Text style={[GlobalStyle.heading6, s.tripSummaryValue]}>{secondValue}</Text>
            </View>
          </View>
        </View>
        <View style={s.tableContainer}>{renderTable(tableConfigs[activeTripType] || tableConfigs['Raw material trip'])}</View>
      </View>
      <Modal animationType="fade" transparent visible={showDateFilterModal} onRequestClose={() => { setShowDateFilterModal(false); if (dateTab === 'Custom' && !customFromDate) { setDateTab('Today'); handleDateTabChange('Today'); } }}>
        <TouchableWithoutFeedback onPress={() => { setShowDateFilterModal(false); if (dateTab === 'Custom' && !customFromDate) { setDateTab('Today'); handleDateTabChange('Today'); } }}>
          <View style={s.modalBackground}>
            <TouchableWithoutFeedback>
              <DashesDateFilter CloseModel={() => setShowDateFilterModal(false)} onDateSelected={handleCustomDateSelect} initialFromDate={customFromDate} initialToDate={customToDate} />
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};




const s = StyleSheet.create({
  noDataText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    textAlign: 'center',
  },
  // Add this to your styles object
  tableCard: {
    // backgroundColor: 'white',
    borderRadius: 12,
    margin: 10,
    bottom: 60,
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    // backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginTop: 10,
    paddingHorizontal: 10,
  },

  tableHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  tableBody: {
    paddingVertical: 4,
  },

  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 1, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  // rowLeft: {
  //     width: 40,
  //     justifyContent: 'center',
  //     alignItems: 'center',
  // },
  rowLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F6F3ED',
    justifyContent: 'center',
    alignItems: 'center',
    // marginRight: 12,
  },

  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  rowCenter: {
    flex: 2,
    justifyContent: 'center',
    marginLeft: 10,
  },

  productName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#000',
  },

  productSubText: {
    fontSize: 12,
    color: '#999',
  },

  rowTon: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    color: '#000',
  },

  rowWeight: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '500',
    color: '#000',
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
    marginVertical: verticalScale(0),
    width: scale(310),
    justifyContent: 'center',
    alignSelf: 'center',
    // top: 13,
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
    // fontSize: 15,
    // fontFamily: 'Cabin-Medium'
  },
  activeTabText: {
    color: '#000',
    // fontSize: 15,
  },
  divider: {
    width: scale(1),
    backgroundColor: '#FFFFFF',
    height: '100%',
  },


  container: {
    flex: 1,
    backgroundColor: '#F6F3ED',
  },

  detailsContainer: {
    width: '100%',
    height: scale(400),
    marginBottom: verticalScale(20),
  },
  detailsScrollView: {
    flex: 1,
    paddingBottom: verticalScale(20),
  },
  imageStyle: {
    wwidth: 232,
    marginTop: 33,
    height: 208,
    alignSelf: 'flex-end',
    marginLeft: width - 232,
  },
  header: {
    paddingVertical: scale(10),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    bottom: verticalScale(3),
    marginTop: verticalScale(2),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    right: scale(150),
    top: verticalScale(10),
  },
  headerBackground: {
    height: verticalScale(180),
    backgroundColor: '#3E89EC',
    paddingTop: verticalScale(25),
    paddingHorizontal: scale(20),
  },


  card: {
    backgroundColor: 'white',
    borderRadius: 26,
    marginBottom: 15,
    padding: 15,
    width: scale(335),
    height: scale(69),
    left: scale(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    bottom: scale(45),
    zIndex: 1,
  },
  tripSummaryDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
    marginBottom: scale(10)
  },
  tripSummaryLabel: {
    color: '#666',
    bottom: 6,
  },
  tripSummaryValue: {
    bottom: 5,
  },

  profitCard: {
    backgroundColor: '#FFF',
    padding: moderateScale(15),
    width: scale(340),
    height: scale(100),
    borderRadius: scale(26),
    left: scale(5),
    zIndex: 10,
    bottom: verticalScale(50),
  },
  netProfitRow: {
    marginBottom: verticalScale(10),
    marginHorizontal: verticalScale(20),
  },
  netProfitLabel: {
    marginBottom: verticalScale(10),
  },
  netProfitAmount: {
    color: '#63BE5A',
    bottom: verticalScale(10),
  },
  NetImage: {
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
  },
  tripSummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',  // This makes sure items are centered horizontally
  },
  tripSummaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // This centers both texts vertically inside
  },
  tripSummaryDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
    marginBottom: scale(25),
  },
  tripSummaryLabel: {
    color: '#666',
    textAlign: 'center',  // Ensures text alignment is centered
    bottom: 0,            // Remove manual position tweaking
  },
  tripSummaryValue: {
    textAlign: 'center',
    bottom: 0,            // Remove manual position tweaking
  },

  summaryContainer: {
    zIndex: 100,
    bottom: scale(50),
    marginHorizontal: 10,
  },
  summaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    bottom: scale(1),
  },
  summaryButtonText: {
    color: '#3182CE',
    fontWeight: '500',
  },

  dropdownContainer: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderRadius: 8,
  },

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  dropdownItemText: {
    color: '#333',
  },
  activeDropdownItemText: {
    color: '#3182CE',
    fontWeight: 'bold',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});

export default DataTables;
