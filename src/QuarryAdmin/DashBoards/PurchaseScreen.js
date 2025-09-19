// import React, { useContext, useEffect, useState } from 'react';
// import {
//   StyleSheet,
//   View,
//   ScrollView,
//   Text,
//   Dimensions,
//   Modal,
//   BackHandler,
//   ImageBackground,
//   TouchableOpacity,
//   Alert,
//   RefreshControl,
//   SafeAreaView, 
//   TouchableWithoutFeedback
// } from 'react-native';
// import { DataContext } from '../../components/common/DataContext';
// import PurchaseInfo from '../PurchaseInfo';
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// import { useNavigation } from '@react-navigation/native';
// import LinearGradient from 'react-native-linear-gradient';
// import Loading from '../../components/common/Loading';
// import DateFilter from '../DateFilter';
// import NetworkErrorModal from '../NetworkErrorModal';
// import NetInfo from '@react-native-community/netinfo';

// const { width, height } = Dimensions.get('window');

// export const formattedValue = value => {
//   const amount = new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 0,
//   })
//     .format(value)
//     .replace('₹', '₹ ');
//   return amount;
// };

// const PurchseScreen = () => {
//   const { dailyData, SetToday, SetYesterday, SetWeek, SetMonth, loading } = useContext(DataContext);
  
//   // Add proper null checks for dailyData
//   const totalData = dailyData && dailyData[0] && dailyData[0][0] ? dailyData[0][0] : {
//     TotalQty: 0,
//     TotalTrips: 0,
//     AvgQty: 0
//   };
  
//   const newData = dailyData && dailyData[2] ? dailyData[2] : [];
//   const tab1Data = newData.slice(0, -1);

//   const navigation = useNavigation();
//   const [activeTab, setActiveTab] = useState('Today');
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [showDateFilter, setShowDateFilter] = useState(false); 
//   const tabs = ['Yesterday', 'Today', 'Week', 'Month', 'Custom'];
//   const [isConnected, setIsConnected] = useState(true);
//   const [showNetworkModal, setShowNetworkModal] = useState(false);

//   const fetchData = async (fetchFunction) => {
//     try {
//       setError(null);
//       await fetchFunction();
//     } catch (err) {
//       console.error('Error:', err.message);
//       setError(err.message);
//       const networkState = await NetInfo.fetch();
//       if (!networkState.isConnected || !networkState.isInternetReachable) {
//         setShowNetworkModal(true);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchData(SetToday);
    
//     const unsubscribe = NetInfo.addEventListener(state => {
//       const connectionStatus = state.isConnected && state.isInternetReachable;
//       setIsConnected(connectionStatus);
      
//       if (!connectionStatus) {
//         setShowNetworkModal(true);
//       }
//     });
    
//     return () => unsubscribe();
//   }, []);

//   const onRefresh = async () => {
//     const networkState = await NetInfo.fetch();
//     if (!networkState.isConnected || !networkState.isInternetReachable) {
//       setShowNetworkModal(true);
//       return;
//     }
    
//     setRefreshing(true);
//     await fetchData(
//       activeTab === 'Today' ? SetToday :
//       activeTab === 'Yesterday' ? SetYesterday :
//       activeTab === 'Week' ? SetWeek : SetMonth
//     );
//     setRefreshing(false);
//   };

//   const handleTabChange = async (tab) => {
//     const networkState = await NetInfo.fetch();
//     if (!networkState.isConnected || !networkState.isInternetReachable) {
//       setShowNetworkModal(true);
//       return;
//     }
    
//     setActiveTab(tab);

//     if (tab === 'Custom') {
//         setShowDateFilter(true);
//         return;
//     }

//     const tabMapping = {
//         Today: SetToday,
//         Yesterday: SetYesterday,
//         Week: SetWeek,
//         Month: SetMonth
//     };

//     fetchData(tabMapping[tab]);
//   };

//   useEffect(() => {
//     const handleBackButtonClick = () => {
//       if (showDateFilter) {
//         setShowDateFilter(false);
//         return true;
//       } else if (showNetworkModal) {
//         setShowNetworkModal(false);
//         return true;
//       } else if (navigation.canGoBack()) {
//         navigation.goBack();
//         return true;
//       } else {
//         Alert.alert(
//           'Exit App',
//           'Are you sure you want to exit?',
//           [
//             { text: 'Cancel', onPress: () => null, style: 'cancel' },
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

//     return () => backHandler.remove();
//   }, [navigation, showDateFilter, showNetworkModal]);

//   if ((loading && !refreshing) || !dailyData) {
//     return <Loading />;
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <ImageBackground
//           style={styles.headerBackground}
//           resizeMode="contain"
//           imageStyle={styles.imageStyle}
//           source={require('../../images/sazswater.png')}>
//           <View style={styles.headerRow}>
//             <TouchableOpacity onPress={() => navigation.goBack()}>
//               <FontAwesomeIcon size={20} color="white" icon={faArrowLeft} />
//             </TouchableOpacity>
//             <Text style={styles.headerText}>Purchase</Text>
//           </View>

//           <View style={styles.daycontainer}>
//             {tabs.map((tab, index) => (
//               <React.Fragment key={tab}>
//                 <TouchableOpacity
//                   style={[
//                     styles.tabButton,
//                     activeTab === tab && styles.activeDateTab,
//                     index === 0 && styles.firstTab,
//                     index === tabs.length - 1 && styles.lastTab,
//                   ]}
//                   onPress={() => handleTabChange(tab)}
//                 >
//                   <Text
//                     style={[
//                       styles.tabButtonText,
//                       activeTab === tab && styles.activeTabButtonText,
//                     ]}
//                   >
//                     {tab}
//                   </Text>
//                 </TouchableOpacity>
//                 {index < tabs.length - 1 && <View style={styles.divider} />}
//               </React.Fragment>
//             ))}
//           </View>

//           <LinearGradient colors={['#ffffff', '#e0e0e0']} style={styles.gradientCard}>
//             <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around' }}>
//               <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-around' }}>
//                 <Text style={styles.title}>Total Qty</Text>
//                 <Text style={[styles.text1, { color: 'green' }]}>
//                   {totalData.TotalQty || '0'} - Ton
//                 </Text>
//               </View>
//               <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'space-around' }}>
//                 <Text style={styles.text1}>
//                   <Text style={styles.CardValue}>Trips: </Text>
//                   {totalData.TotalTrips || 0}
//                 </Text>
//                 <Text style={styles.text1}>
//                   <Text style={styles.CardValue}>Avg Qty: </Text>
//                   {totalData.AvgQty ? Number(totalData.AvgQty).toFixed(2) : 0}
//                 </Text>
//               </View>
//             </View>
//           </LinearGradient>
//         </ImageBackground>

//         <View style={styles.contentContainer}>
//           <LinearGradient colors={['#4FAAF3', '#3E89EC']} style={styles.summaryTab}>
//             <Text style={styles.tabText}>Supplier Summary</Text>
//           </LinearGradient>
//           <View style={styles.tabIndicator} />

//           <ScrollView
//             style={styles.cardsScrollContainer}
//             contentContainerStyle={styles.cardsContentContainer}
//             nestedScrollEnabled={true}
//             showsVerticalScrollIndicator={true}
//           >
//             {tab1Data.map((item, index) => (
//               <PurchaseInfo
//                 key={index}
//                 title={item.Supplier}
//                 weight={item.TotalQty}
//                 trips={item.TotalTrips}
//               />
//             ))}
//           </ScrollView>
//         </View>
//       </ScrollView>

//       <Modal
//         animationType="fade"
//         transparent={true}
//         visible={showDateFilter}
//         onRequestClose={() => setShowDateFilter(false)}
//       >
//         <TouchableWithoutFeedback onPress={() => setShowDateFilter(false)}>
//           <View style={styles.modalOverlay}>
//             <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
//               <View>
//                 <DateFilter CloseModel={setShowDateFilter} />
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
      
//       <NetworkErrorModal 
//         visible={showNetworkModal} 
//         onRefresh={() => {
//           setShowNetworkModal(false);
//           onRefresh();
//         }} 
//       />
//     </SafeAreaView>
//   );
// };



// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F6F3ED',
//   },
//   headerBackground: {
//     height: 241,
//     backgroundColor: '#3E89EC',
//     paddingTop: 35,
//     paddingHorizontal: 20,
//   },
//   imageStyle: {
//     width: 232,
//     marginTop: 33,
//     height: 208,
//     alignSelf: 'flex-end',
//     marginLeft: width - 232,
//   },
//   headerRow: {
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   headerText: {
//     fontSize: 22,
//     marginLeft: 10,
//     color: 'white',
//     fontFamily: 'Cabin-Bold',
//   },
//   contentContainer: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 15,
//     backgroundColor: '#F6F3ED',
//     paddingBottom: 20,
//   },
//   summaryTab: {
//     paddingVertical: 10,
//     borderRadius: 15,
//     alignItems: 'center',
//     marginBottom: 10,
//     backgroundColor: '#3E89EC',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   tabText: {
//     color: 'white',
//     fontSize: 14,
//     fontFamily: 'Cabin-Bold',
//   },
//   // Modified card container styles for scrolling
//   cardsScrollContainer: {
//     flex: 1,
//     maxHeight: height * 0.6, 
//     padding:5,
//   },
//   cardsContentContainer: {
//     // paddingBottom: 20,
//   },
//   text1: {
//     color: 'black',
//     fontSize: 18,
//     fontFamily: 'Cabin-Bold',
//   },
//   CardValue: {
//     fontFamily: 'Cabin-Bold',
//     fontSize: 16,
//   },
//   title: {
//     fontSize: 18,
//     color: 'black',
//     fontFamily: 'Cabin-Bold',
//   },
//   gradientCard: {
//     width: '100%',
//     borderRadius: 10,
//     padding: 20,
//     marginTop: 5, 
//     height: 90,
//     justifyContent: 'center',
//   },
//   // These are no longer needed as they're replaced by the card-specific scroll container
//   scrollableContainer: {
//     flex: 1,
//     padding: 2,
//   },
//   scrollableContentContainer: {
//     flexGrow: 1,
//   },
  
//   // Date Filter Tab Styles
//   daycontainer: {
//     flexDirection: 'row',
//     backgroundColor: '#4A90E2',
//     borderRadius: 5,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#FFFFFF',
//     height: 30,
//     marginVertical: 10,
//     width: '100%',
//     justifyContent: 'center',
//     alignSelf: 'center',
//     marginTop: 20,
//   },
//   tabButton: {
//     flex: 1,
//     paddingVertical: 2,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   activeDateTab: {
//     backgroundColor: '#FFFFFF',
//   },
//   firstTab: {
//     borderTopLeftRadius: 1,
//     borderBottomLeftRadius: 1,
//   },
//   lastTab: {
//     borderTopRightRadius: 1,
//     borderBottomRightRadius: 1,
//   },
//   tabButtonText: {
//     color: '#FFFFFF',
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   activeTabButtonText: {
//     color: '#3E89EC',
//   },
//   divider: {
//     width: 1,
//     backgroundColor: '#FFFFFF',
//     height: '100%',
//   },
//   modalOverlay: {
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
//   // Error handling styles
//   fullPageContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F6F3ED',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 16,
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: '#3E89EC',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 5,
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 16,
//   },
//   tabIndicator: {
//     height: 2,
//     backgroundColor: '#F6F3ED',
//   },
// });

// export default PurchseScreen;