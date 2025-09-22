// import React, { useState } from "react";
// import { Text, SafeAreaView, View, TouchableOpacity, StyleSheet, Animated } from "react-native";
// import NetworkStatusIndicator from "../NetworkStatusIndicator";
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faArrowLeft, faPlus, faArrowUp, faArrowDown, faSort, faSortAlphaDown, faSortNumericDown, faSortNumericUp, faTimes } from '@fortawesome/free-solid-svg-icons';
// import GlobalStyle from "../../components/common/GlobalStyle";
// import ProductionPieChart from "../PieChartDesign/ProductionPieChart";

// const ProductionDashBoard = ({ navigation }) => {
//     const [selectedFilter, setSelectedFilter] = useState('Today');
//     const [isFabExpanded, setIsFabExpanded] = useState(false);
//     const [fadeAnim] = useState(new Animated.Value(0));

//     const Data = [
//         {
//             title: 'EB Reading',
//             value: '320 Unit',
//             icon: '⛽',
//             bgcolor: '#F7F7F7',
//         },
//         {
//             title: 'Diesel Usage',
//             value: '100 Liter',
//             icon: '⛽',
//             bgcolor: '#F7F7F7',
//         },
//         {
//             title: 'Total Net Weight',
//             value: '200 TON',
//             icon: '⛽',
//             bgcolor: '#F7F7F7',
//         },
//         {
//             title: 'Transport Amount',
//             value: '32000',
//             icon: '⛽',
//             bgcolor: '#F7F7F7',
//         },
//     ];

//     const fabMenuItems = [
//         { id: 1, title: 'EB Reading', icon: '📊', screen: 'EBReadingScreen'},
//         { id: 2, title: 'Vehicle Trip', icon: '🚛', screen: 'VehicleTripScreen'},
//         { id: 3, title: 'Diesel availability', icon: '⛽', screen: 'DieselAvailabilityScreen'},
//         { id: 4, title: 'Sales Order', icon: '📋', screen: 'SalesOrderScreen'},
//         { id: 5, title: 'Transport Trip', icon: '🚚', screen: 'TransportTripScreen'},
//         { id: 6, title: 'Raw Material', icon: '📦', screen: 'RawMaterialScreen'},
//     ];

//     const toggleFab = () => {
//         setIsFabExpanded(!isFabExpanded);
        
//         Animated.timing(fadeAnim, {
//             toValue: isFabExpanded ? 0 : 1,
//             duration: 300,
//             useNativeDriver: true,
//         }).start();
//     };

//     const handleMenuItemPress = (item) => {
//         console.log('Selected:', item.title);
        
//         // Navigate to the appropriate screen based on the selected item
//         if (item.screen && navigation) {
//             navigation.navigate(item.screen);
//         }
        
//         // Close the FAB menu
//         setIsFabExpanded(false);
//         Animated.timing(fadeAnim, {
//             toValue: 0,
//             duration: 300,
//             useNativeDriver: true,
//         }).start();
//     };

//     return (
//         <SafeAreaView style={styles.container}>
//             <NetworkStatusIndicator />
//             <View style={styles.header}>
//                 <View style={styles.leftSection}>
//                     <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
//                         <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
//                     </TouchableOpacity>
//                     <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Production</Text>
//                 </View>
//                 <TouchableOpacity
//                     style={styles.menuButton}
//                     onPress={() => setIsMenuVisible(true)}
//                 >
//                     <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
//                 </TouchableOpacity>
//             </View>
//             <View style={styles.content}>
//                 {/* Filter Buttons */}
//                 <View style={styles.filterContainer}>
//                     {['Today', 'Yesterday', 'Month', 'Custom'].map((filter) => (
//                         <TouchableOpacity
//                             key={filter}
//                             style={[
//                                 styles.filterButton,
//                                 selectedFilter === filter && styles.filterButtonActive,
//                             ]}
//                             onPress={() => setSelectedFilter(filter)}
//                         >
//                             <Text
//                                 style={[
//                                     styles.filterText,
//                                     selectedFilter === filter && styles.filterTextActive,
//                                 ]}
//                             >
//                                 {filter}
//                             </Text>
//                         </TouchableOpacity>
//                     ))}
//                 </View>
//             </View>
//             <ProductionPieChart />
//             <View style={styles.DataContainer}>
//                 <View style={styles.dragHandleContainer}>
//                     <View style={styles.dragHandle} />
//                     <View style={styles.usageSection}>
//                         <Text style={styles.sectionTitle}>Usage Details</Text>
                        
//                         <View style={styles.usageGrid}>
//                             {Data.map((item, index) => (
//                                 <View key={index} style={[styles.usageCard, { backgroundColor: item.bgcolor }]}>
//                                     <Text style={styles.usageTitle}>{item.title}</Text>
//                                     <View style={styles.usageValueContainer}>
//                                         <Text style={styles.usageValue}>{item.value}</Text>
//                                         {item.icon && <Text style={styles.usageIcon}>{item.icon}</Text>}
//                                     </View>
//                                 </View>
//                             ))}
//                         </View>
//                     </View>
//                 </View>
//             </View>

//             {/* FAB Menu Items */}
//             {isFabExpanded && (
//                 <Animated.View 
//                     style={[
//                         styles.fabMenuContainer,
//                         {
//                             opacity: fadeAnim,
//                             transform: [{
//                                 translateY: fadeAnim.interpolate({
//                                     inputRange: [0, 1],
//                                     outputRange: [20, 0]
//                                 })
//                             }]
//                         }
//                     ]}
//                 >
//                     {fabMenuItems.map((item, index) => (
//                         <TouchableOpacity
//                             key={item.id}
//                             style={[styles.fabMenuItem]}
//                             onPress={() => handleMenuItemPress(item)}
//                             activeOpacity={0.8}
//                         >
//                             <View style={styles.fabMenuItemContent}>
//                                 <Text style={styles.fabMenuIcon}>{item.icon}</Text>
//                                 <Text style={styles.fabMenuText}>{item.title}</Text>
//                             </View>
//                         </TouchableOpacity>
//                     ))}
//                 </Animated.View>
//             )}

//             {/* Overlay */}
//             {isFabExpanded && (
//                 <TouchableOpacity
//                     style={styles.overlay}
//                     onPress={toggleFab}
//                     activeOpacity={1}
//                 />
//             )}

//             {/* FAB Button */}
//             <TouchableOpacity 
//                 style={[styles.fab, isFabExpanded && styles.fabExpanded]} 
//                 onPress={toggleFab}
//             >
//                 <FontAwesomeIcon 
//                     icon={isFabExpanded ? faTimes : faPlus} 
//                     size={24} 
//                     color="white" 
//                 />
//             </TouchableOpacity>
//         </SafeAreaView>
//     )
// }

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
//     content: {},
//     filterContainer: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         paddingHorizontal: 10,
//         paddingVertical: 13,
//         gap: 6,
//         bottom: 5,
//     },
//     filterButton: {
//         paddingHorizontal: 10,
//         paddingVertical: 5,
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
//     DataContainer: {
//         flex: 1,
//         backgroundColor: '#fff',
//         borderTopLeftRadius: 20,
//         borderTopRightRadius: 20,
//         bottom:80,
//     },
//     dragHandleContainer: {
//         width: '100%',
//         alignItems: 'center',
//         paddingVertical: 12,
//         zIndex: 1000,
//     },
//     dragHandle: {
//         width: 40,
//         height: 5,
//         backgroundColor: '#ccc',
//         borderRadius: 3,
//         marginBottom: 4,
//     },
//     sectionTitle: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: '#333333',
//         top: 10,
//         marginHorizontal: 20
//     },
//     usageGrid: {
//         flexDirection: 'row',
//         flexWrap: 'wrap',
//         justifyContent: 'space-between',
//         marginHorizontal: 15,
//         top: 20
//     },
//     usageCard: {
//         width: '48%',
//         height: 105,
//         padding: 15,
//         borderRadius: 15,
//         borderColor: '#000',
//         borderWidth: 0.5,
//         marginBottom: 12,
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 1,
//         },
//         shadowOpacity: 0.05,
//         shadowRadius: 2,
//         elevation: 2,
//     },
//     usageTitle: {
//         fontSize: 12,
//         color: '#000',
//         top: 8,
//         fontWeight: '500',
//     },
//     usageValueContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 20,
//         right: 6,
//         top: 10
//     },
//     usageIcon: {
//         fontSize: 40,
//     },
//     usageValue: {
//         fontSize: 18,
//         fontWeight: '700',
//         color: '#333333',
//     },
//     fab: {
//         position: 'absolute',
//         bottom: 30,
//         right: 20,
//         width: 56,
//         height: 56,
//         borderRadius: 28,
//         backgroundColor: '#4A90E2',
//         alignItems: 'center',
//         justifyContent: 'center',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 4,
//         },
//         shadowOpacity: 0.3,
//         shadowRadius: 5,
//         elevation: 8,
//         zIndex: 1001,
//     },
//     fabExpanded: {
//         backgroundColor: '#3E89EC',
//     },
//     overlay: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         backgroundColor: 'rgba(0, 0, 0, 0.3)',
//         zIndex: 999,
//     },
//     fabMenuContainer: {
//         position: 'absolute',
//         bottom: 90,
//         right: 20,
//         zIndex: 1000,
//     },
//     fabMenuItem: {
//         marginBottom: 6,
//         borderRadius: 25,
//         borderColor:'#000',
//         borderWidth:1,
//         backgroundColor:'#fff',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.2,
//         shadowRadius: 4,
//         elevation: 5,
//     },
//     fabMenuItemContent: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingHorizontal: 14,
//         paddingVertical: 5,
//         minWidth: 150,
//     },
//     fabMenuIcon: {
//         fontSize: 20,
//         marginRight: 12,
//     },
//     fabMenuText: {
//         color: '#3E89EC',
//         fontSize: 14,
//         fontWeight: '600',
//     },
// });

// export default ProductionDashBoard;