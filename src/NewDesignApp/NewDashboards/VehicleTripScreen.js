// import React, { useState } from "react";
// import { Text, SafeAreaView, View, TouchableOpacity, StyleSheet, TextInput, ScrollView } from "react-native";
// import NetworkStatusIndicator from "../NetworkStatusIndicator";
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
// import GlobalStyle from "../../components/common/GlobalStyle";

// const VehicleTripScreen = ({ navigation }) => {
//     const [selectedFilter, setSelectedFilter] = useState('Today');
//     const [searchQuery, setSearchQuery] = useState('');

//     // Sample vehicle trip data
//     const vehicleData = [
//         {
//             vehicleNo: 'TN96AA1234',
//             trips: 22,
//             metricTon: 2000,
//         },
//         {
//             vehicleNo: 'TN96AA1234',
//             trips: 22,
//             metricTon: 2000,
//         },
//         {
//             vehicleNo: 'TN96AA1234',
//             trips: 22,
//             metricTon: 2000,
//         },
//         {
//             vehicleNo: 'TN45BC5678',
//             trips: 18,
//             metricTon: 1800,
//         },
//         {
//             vehicleNo: 'TN67DE9012',
//             trips: 25,
//             metricTon: 2200,
//         },
//     ];

//     // Filter data based on search query
//     const filteredData = vehicleData.filter(item =>
//         item.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     const PieChartComponent = () => (
//         <View style={styles.chartContainer}>
//             <View style={styles.pieChart}>
//                 {/* Outer ring segments */}
//                 <View style={[styles.pieSegment, styles.segment1]} />
//                 <View style={[styles.pieSegment, styles.segment2]} />
                
//                 {/* Inner circle */}
//                 <View style={styles.innerCircle} />
                
//                 {/* Chart labels */}
//                 <View style={styles.chartLabels}>
//                     <View style={styles.labelItem}>
//                         <View style={[styles.labelDot, { backgroundColor: '#90EE90' }]} />
//                         <Text style={styles.labelText}>Total Trip</Text>
//                     </View>
//                     <Text style={styles.chartValue}>53</Text>
                    
//                     <View style={styles.labelItem}>
//                         <View style={[styles.labelDot, { backgroundColor: '#DDA0DD' }]} />
//                         <Text style={styles.labelText}>Average Trip Weight</Text>
//                     </View>
//                     <Text style={styles.chartValue}>530.45 Ton</Text>
//                 </View>
//             </View>
//         </View>
//     );

//     return (
//         <SafeAreaView style={styles.container}>
//             <NetworkStatusIndicator />
            
//             {/* Header */}
//             <View style={styles.header}>
//                 <View style={styles.leftSection}>
//                     <TouchableOpacity onPress={() => navigation.goBack()}>
//                         <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
//                     </TouchableOpacity>
//                     <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Production</Text>
//                 </View>
//                 <TouchableOpacity style={styles.menuButton}>
//                     <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
//                 </TouchableOpacity>
//             </View>

//             {/* Filter Buttons */}
//             <View style={styles.filterContainer}>
//                 {['Today', 'Yesterday', 'Month', 'Custom'].map((filter) => (
//                     <TouchableOpacity
//                         key={filter}
//                         style={[
//                             styles.filterButton,
//                             selectedFilter === filter && styles.filterButtonActive,
//                         ]}
//                         onPress={() => setSelectedFilter(filter)}
//                     >
//                         <Text
//                             style={[
//                                 styles.filterText,
//                                 selectedFilter === filter && styles.filterTextActive,
//                             ]}
//                         >
//                             {filter}
//                         </Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>

//             {/* Pie Chart */}
//             <PieChartComponent />

//             {/* Vehicle Trip Details Container */}
//             <View style={styles.detailsContainer}>
//                 <View style={styles.dragHandleContainer}>
//                     <View style={styles.dragHandle} />
//                 </View>

//                 <Text style={styles.sectionTitle}>Vehicle Trip Details</Text>

//                 {/* Search Bar */}
//                 <View style={styles.searchContainer}>
//                     <TextInput
//                         style={styles.searchInput}
//                         placeholder="Search by vehicle number"
//                         value={searchQuery}
//                         onChangeText={setSearchQuery}
//                         placeholderTextColor="#999"
//                     />
//                     <TouchableOpacity style={styles.searchButton}>
//                         <FontAwesomeIcon icon={faSearch} size={16} color="white" />
//                     </TouchableOpacity>
//                 </View>

//                 {/* Table Header */}
//                 <View style={styles.tableHeader}>
//                     <Text style={[styles.tableHeaderText, { flex: 2 }]}>Vehicle no</Text>
//                     <Text style={[styles.tableHeaderText, { flex: 1 }]}>Trips</Text>
//                     <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Metric Ton</Text>
//                 </View>

//                 {/* Table Data */}
//                 <ScrollView style={styles.tableScrollView} showsVerticalScrollIndicator={false}>
//                     {filteredData.map((item, index) => (
//                         <View key={index} style={styles.tableRow}>
//                             <Text style={[styles.tableRowText, { flex: 2 }]}>{item.vehicleNo}</Text>
//                             <Text style={[styles.tableRowText, { flex: 1 }]}>{item.trips}</Text>
//                             <Text style={[styles.tableRowText, { flex: 1.5 }]}>{item.metricTon}</Text>
//                         </View>
//                     ))}
//                 </ScrollView>
//             </View>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#FAFAF5',
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         paddingHorizontal: 20,
//         paddingVertical: 15,
//         marginTop: 20,
//     },
//     leftSection: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     headerTitle: {
//         marginLeft: 10,
//     },
//     menuButton: {
//         backgroundColor: '#333333',
//         paddingHorizontal: 15,
//         paddingVertical: 6,
//         borderRadius: 20,
//     },
//     menuText: {
//         color: '#fff',
//     },
//     filterContainer: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         paddingHorizontal: 10,
//         paddingVertical: 13,
//         gap: 6,
//     },
//     filterButton: {
//         paddingHorizontal: 16,
//         paddingVertical: 8,
//         borderRadius: 20,
//         backgroundColor: '#fff',
//         borderColor: '#ccc',
//         borderWidth: 1,
//     },
//     filterButtonActive: {
//         backgroundColor: '#4A90E2',
//     },
//     filterText: {
//         fontSize: 14,
//         color: '#666',
//         fontWeight: '500',
//     },
//     filterTextActive: {
//         color: '#ffffff',
//     },
//     chartContainer: {
//         alignItems: 'center',
//         paddingVertical: 20,
//         paddingBottom: 30,
//     },
//     pieChart: {
//         width: 200,
//         height: 200,
//         alignItems: 'center',
//         justifyContent: 'center',
//         position: 'relative',
//     },
//     pieSegment: {
//         position: 'absolute',
//         width: 200,
//         height: 200,
//         borderRadius: 100,
//         borderWidth: 30,
//     },
//     segment1: {
//         borderColor: 'transparent',
//         borderTopColor: '#90EE90',
//         borderRightColor: '#90EE90',
//         transform: [{ rotate: '0deg' }],
//     },
//     segment2: {
//         borderColor: 'transparent',
//         borderBottomColor: '#DDA0DD',
//         borderLeftColor: '#DDA0DD',
//         transform: [{ rotate: '0deg' }],
//     },
//     innerCircle: {
//         width: 140,
//         height: 140,
//         borderRadius: 70,
//         backgroundColor: '#FAFAF5',
//         position: 'absolute',
//     },
//     chartLabels: {
//         position: 'absolute',
//         right: -120,
//         top: 20,
//     },
//     labelItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 5,
//     },
//     labelDot: {
//         width: 12,
//         height: 12,
//         borderRadius: 6,
//         marginRight: 8,
//     },
//     labelText: {
//         fontSize: 12,
//         color: '#666',
//     },
//     chartValue: {
//         fontSize: 24,
//         fontWeight: 'bold',
//         color: '#333',
//         marginBottom: 15,
//         marginLeft: 20,
//     },
//     detailsContainer: {
//         flex: 1,
//         backgroundColor: '#fff',
//         borderTopLeftRadius: 20,
//         borderTopRightRadius: 20,
//         paddingTop: 5,
//     },
//     dragHandleContainer: {
//         width: '100%',
//         alignItems: 'center',
//         paddingVertical: 12,
//     },
//     dragHandle: {
//         width: 40,
//         height: 5,
//         backgroundColor: '#ccc',
//         borderRadius: 3,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: '#333333',
//         marginHorizontal: 20,
//         marginBottom: 15,
//     },
//     searchContainer: {
//         flexDirection: 'row',
//         marginHorizontal: 20,
//         marginBottom: 20,
//         alignItems: 'center',
//     },
//     searchInput: {
//         flex: 1,
//         height: 45,
//         backgroundColor: '#f5f5f5',
//         borderRadius: 25,
//         paddingHorizontal: 20,
//         fontSize: 14,
//         color: '#333',
//     },
//     searchButton: {
//         width: 45,
//         height: 45,
//         backgroundColor: '#4A90E2',
//         borderRadius: 25,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginLeft: 10,
//     },
//     tableHeader: {
//         flexDirection: 'row',
//         backgroundColor: '#f8f9fa',
//         paddingVertical: 12,
//         paddingHorizontal: 20,
//         borderBottomWidth: 1,
//         borderBottomColor: '#e0e0e0',
//     },
//     tableHeaderText: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#333',
//         textAlign: 'center',
//     },
//     tableScrollView: {
//         flex: 1,
//     },
//     tableRow: {
//         flexDirection: 'row',
//         paddingVertical: 15,
//         paddingHorizontal: 20,
//         borderBottomWidth: 1,
//         borderBottomColor: '#f0f0f0',
//         backgroundColor: '#fff',
//     },
//     tableRowText: {
//         fontSize: 14,
//         color: '#333',
//         textAlign: 'center',
//     },
// });

// export default VehicleTripScreen;