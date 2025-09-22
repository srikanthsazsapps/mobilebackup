import React, { useState, useEffect, useContext, useCallback } from "react";
import { Text, SafeAreaView, View, TouchableOpacity, StyleSheet, TextInput, ScrollView } from "react-native";
import NetworkStatusIndicator from "../../NetworkStatusIndicator";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import GlobalStyle from "../../../components/common/GlobalStyle";
import PieChart from "./PieChart";
import FloatingActionButton from "./FloatingActionButton";
import { DashesDataContext } from "../../../components/common/DashesDataContext";

const VehicleTripScreen = ({ navigation, route }) => {
  const { productionData, fetchSingleDashboard } = useContext(DashesDataContext);
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentData, setCurrentData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [sectionTitle, setSectionTitle] = useState('Vehicle Trip Details');

  const { dataType = 'vehicleTrip', title = 'Vehicle Trip' } = route?.params || {};

  // Function to aggregate data based on key field
  const aggregateData = (data, keyField, aggregateFields) => {
    if (!data || !Array.isArray(data)) return [];
    
    const grouped = {};
    
    data.forEach(item => {
      const key = item[keyField];
      if (!key) return;
      
      if (!grouped[key]) {
        // Initialize with the first occurrence
        grouped[key] = { ...item };
        // Convert aggregate fields to numbers
        aggregateFields.forEach(field => {
          grouped[key][field] = parseFloat(item[field]) || 0;
        });
      } else {
        // Aggregate the numeric fields
        aggregateFields.forEach(field => {
          grouped[key][field] += parseFloat(item[field]) || 0;
        });
      }
    });
    
    return Object.values(grouped);
  };

  // Data templates for table structure with aggregation config
  const dataTemplates = {
    vehicleTrip: {
      title: 'Vehicle Trip Details',
      headers: [
        { key: 'VechNumber', title: 'Vehicle No', flex: 2 },
        { key: 'Details', title: 'Details', flex: 2 },
        { key: 'TotalTrip', title: 'Trips', flex: 1 },
        { key: 'NW', title: 'Net Weight', flex: 1.5 },
      ],
      dataKey: 5,
      groupByField: 'VechNumber',
      aggregateFields: ['TotalTrip', 'NW']
    },
    ebReading: {
      title: 'EB Reading Details',
      headers: [
        { key: 'ReadingToDate', title: 'Date', flex: 1.5 },
        { key: 'StartingReading', title: 'Start', flex: 1 },
        { key: 'ClosingReading', title: 'End', flex: 1 },
        { key: 'RunningUnit', title: 'Run', flex: 1 }
      ],
      dataKey: 1,
      groupByField: 'ReadingToDate',
      aggregateFields: ['StartingReading', 'ClosingReading', 'RunningUnit']
    },
    diesel: {
      title: 'Diesel Availability Details',
      headers: [
        { key: 'OpeningStock', title: 'Opening Stock', flex: 1.2 },
        { key: 'Purchase', title: 'Purchase', flex: 1 },
        { key: 'PurchaseValue', title: 'Purchase Amount', flex: 1.3 },
        { key: 'ClosingStock', title: 'Closing Stock', flex: 1.2 }
      ],
      dataKey: 2,
      groupByField: 'Date',
      aggregateFields: ['OpeningStock', 'Purchase', 'PurchaseValue', 'ClosingStock']
    },
    transportTrip: {
      title: 'Transport Trip Details',
      headers: [
        { key: 'TransportName', title: 'Transport Name', flex: 2 },
        { key: 'NoLoad', title: 'Trips', flex: 1 },
        { key: 'TQty', title: 'Net Wght', flex: 1 },
        { key: 'TransportCharges', title: 'Amount', flex: 1 }
      ],
      dataKey: 0,
      groupByField: 'TransportName',
      aggregateFields: ['NoLoad', 'TQty', 'TransportCharges']
    },
    salesOrder: {
      title: 'Sales Order Details',
      headers: [
        { key: 'CustomerName', title: 'Name', flex: 1.5 },
        { key: 'ReqQty', title: 'Req', flex: 1 },
        { key: 'SupQty', title: 'Sup', flex: 1 },
        { key: 'BalQty', title: 'Bal', flex: 1 }
      ],
      dataKey: 3,
      groupByField: 'CustomerName',
      aggregateFields: ['ReqQty', 'SupQty', 'BalQty']
    },
    rawMaterial: {
      title: 'Raw Material Details',
      headers: [
        { key: 'ItemName', title: 'Material', flex: 1 },
        { key: 'Details', title: 'Details', flex: 1 },
        { key: 'TotalTrip', title: 'Trips', flex: 1 },
        { key: 'NW', title: 'Net Weight', flex: 1 },
      ],
      dataKey: 4,
      groupByField: 'ItemName',
      aggregateFields: ['TotalTrip', 'NW']
    }
  };

  // Memoize fetchData to prevent recreation
  const fetchData = useCallback(async () => {
    console.log('VehicleTripScreen: Fetching data for dataType:', dataType, 'filter:', selectedFilter);
    try {
      if (!productionData || !productionData.length) {
        if (selectedFilter === 'Today') {
          await fetchSingleDashboard('production');
        } else if (selectedFilter === 'Yesterday') {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          await fetchSingleDashboard('production', yesterday, new Date());
        } else if (selectedFilter === 'Month') {
          const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
          await fetchSingleDashboard('production', startOfMonth, endOfMonth);
        }
        console.log('VehicleTripScreen: Fetched productionData:', productionData);
      } else {
        console.log('VehicleTripScreen: Skipping fetch, using existing productionData:', productionData);
      }
    } catch (error) {
      console.error('VehicleTripScreen: Error fetching data:', error);
    }
  }, [dataType, selectedFilter, fetchSingleDashboard, productionData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const template = dataTemplates[dataType] || dataTemplates.vehicleTrip;
    setSectionTitle(template.title);
    setTableHeaders(template.headers);
    
    const rawData = productionData[template.dataKey] || [];
    
    // Aggregate the data based on the template configuration
    const aggregatedData = aggregateData(rawData, template.groupByField, template.aggregateFields);
    
    setCurrentData(aggregatedData);
    console.log('VehicleTripScreen: Raw data for', dataType, ':', rawData);
    console.log('VehicleTripScreen: Aggregated data for', dataType, ':', aggregatedData);
  }, [dataType, productionData]);

  // Filter data based on search query
  const filteredData = currentData.filter(item => {
    const searchString = Object.values(item).join(' ').toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  const renderTableRow = (item, index) => (
    <View key={index} style={styles.tableRow}>
      {tableHeaders.map((header, headerIndex) => (
        <Text 
          key={headerIndex}
          style={[styles.tableRowText, { flex: header.flex }]}
        >
          {item[header.key] || 'N/A'}
        </Text>
      ))}
    </View>
  );

  // Handle back navigation
  const handleBackPress = () => {
    console.log('VehicleTripScreen: Back arrow pressed, navigating to ProductionDashBoard');
    if (navigation) {
      navigation.navigate('ProductionDashBoard');
    } else {
      console.error('VehicleTripScreen: Navigation prop is undefined');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={handleBackPress}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
          </TouchableOpacity>
          <Text style={[GlobalStyle.heading1, styles.headerTitle]}>{title}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.filterContainer}>
        {['Today', 'Yesterday', 'Month', 'Custom'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <PieChart dataType={dataType} />
      
      <View style={styles.detailsContainer}>
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={`Search by ${title.toLowerCase().includes('vehicle') ? 'vehicle number' : 'item name'}`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.searchButton}>
            <FontAwesomeIcon icon={faSearch} size={16} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.tableHeader}>
          {tableHeaders.map((header, index) => (
            <Text 
              key={index}
              style={[styles.tableHeaderText, { flex: header.flex }]}
            >
              {header.title}
            </Text>
          ))}
        </View>
        <ScrollView style={styles.tableScrollView} showsVerticalScrollIndicator={false}>
          {filteredData.map((item, index) => renderTableRow(item, index))}
        </ScrollView>
      </View>

      {/* Enhanced FAB Component */}
      <FloatingActionButton 
        navigation={navigation} 
        currentScreen="VehicleTripScreen" 
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 10,
  },
  menuButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  menuText: {
    color: '#fff',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 13,
    gap: 6,
    bottom: 5,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 20,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 0.3,
    borderRadius: 20,
    paddingHorizontal: 15,
    width: 320,
    height: 40,
    marginHorizontal: 20,
    margin: 10,
    bottom: 10
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    bottom: 20,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  tableScrollView: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    marginHorizontal: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#F5F6FA',
    borderRadius: 10,
    marginBottom: 6,
  },
  tableRowText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default VehicleTripScreen;