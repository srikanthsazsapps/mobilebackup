// import React, { useState, useContext } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, Modal, Dimensions } from 'react-native';
// import { launchCamera } from 'react-native-image-picker';
// import { PermissionsAndroid } from 'react-native';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
// import { faRedo, faArrowRight } from '@fortawesome/free-solid-svg-icons';
// import GlobalStyle from '../components/common/GlobalStyle';
// import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { DataContext } from '../components/common/DataContext';
// import DashIcon from '../images/Dash.svg';
// import DashFillIcon from '../images/DashFill.svg';
// import SazsIcon from '../images/SazsOutline.svg';
// import SazsFillIcon from '../images/SazsFill.svg';
// import AttendanceHome from './AttendanceHome';
// import WeekLogScreen from './WeekLogScreen';
// import LeaveDashboard from './LeaveDashboard';
// import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

// const Tab = createBottomTabNavigator();
// const { width, height } = Dimensions.get('window');

// const Selfie = ({ navigation, route }) => {
//   const [capturedImage, setCapturedImage] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [toggle, setToggle] = useState(true);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [currentTime, setCurrentTime] = useState('');
//   const [currentTab, setCurrentTab] = useState('AttendanceHome');
//   const profileIcon = require('../images/Completed.png');
//   const { RefreshData } = useContext(DataContext);
//   const mode = route.params?.mode || 'punch-in';
//   const currentTimer = route.params?.currentTimer || 0;

//   const watermarkIcon = require('../images/LogoWaterMark.png');

//   const requestCameraPermission = async () => {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.CAMERA,
//         {
//           title: 'Camera Permission Required',
//           message: 'Camera access is needed for attendance verification',
//           buttonNeutral: 'Ask Me Later',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         },
//       );

//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         const result = await launchCamera({
//           mediaType: 'photo',
//           cameraType: 'front',
//           includeBase64: true,
//           saveToPhotos: false,
//           quality: 0.7,
//         });

//         if (result.didCancel) {
//           Alert.alert('Alert', 'Camera was closed. Try again.', [
//             { text: 'OK', onPress: () => requestCameraPermission() }
//           ]);
//         } else if (result.errorCode) {
//           Alert.alert('Camera Error', result.errorMessage, [
//             { text: 'OK', onPress: () => requestCameraPermission() }
//           ]);
//         } else if (result.assets && result.assets[0]) {
//           setCapturedImage(result.assets[0].uri);
//           setToggle(false);
//         }
//       } else {
//         console.log('Camera permission denied');
//       }
//     } catch (err) {
//       console.warn(err);
//       Alert.alert('Camera Error', 'An unexpected error occurred. Try again.', [
//         { text: 'OK', onPress: () => requestCameraPermission() }
//       ]);
//     }
//   };

//   const handleRetake = () => {
//     setCapturedImage(null);
//     setToggle(true);
//   };

//   const handleModalClose = () => {
//     setIsModalVisible(false);
//     console.log('Captured Image:', capturedImage);
//     console.log('Mode:', mode);
//     const currentTime = new Date().toLocaleString();

//     if (capturedImage) {
//       console.log('Image captured, proceeding with navigation...');
//       console.log('Current Time:', currentTime);

//       if (mode === 'punch-in') {
//         console.log('Navigating to AttendanceHome with punch-in success...');
//         navigation.reset({
//           index: 0,
//           routes: [{
//             name: 'AttendanceHome',
//             params: {
//               punchInSuccess: true,
//               checkInTime: currentTime
//             }
//           }],
//         });
//       } else if (mode === 'punch-out') {
//         console.log('Navigating to AttendanceHome with punch-out success...');
//         navigation.reset({
//           index: 0,
//           routes: [{
//             name: 'AttendanceHome',
//             params: {
//               punchOutSuccess: true,
//               checkInMode: 'check-in',
//               finalTimer: currentTimer,
//               checkInTime: currentTime,
//             },
//           }],
//         });
//       } else {
//         console.error('Invalid mode:', mode);
//       }
//     } else {
//       console.warn('No image captured. Please capture your image first.');
//     }
//   };

//   const handleContinue = () => {
//     setCurrentTime(new Date().toLocaleString());
//     setIsModalVisible(true);
//     setTimeout(() => {
//       handleModalClose();
//     }, 3000);
//   };

//   const handleBackPress = () => {
//     navigation.navigate('AttendanceMain');
//   };
//   const handleTabPress = (routeName) => {
//     setCurrentTab(routeName);
//     navigation.navigate(routeName);
//   };
//   return (
//     <View style={GlobalStyle.container}>
//       <ImageBackground
//         source={watermarkIcon}
//         resizeMode="contain"
//         imageStyle={styles.imageStyle}

//         style={styles.headerBackground}>
//         {/* style={GlobalStyle.headerImage}> */}
//         <View style={styles.header}>
//           <View style={styles.headerContent}>
//             <TouchableOpacity onPress={handleBackPress}>
//               <FontAwesomeIcon icon={faArrowLeft} size={22} color="white" style={{ bottom: 51, left: 5 }} />
//             </TouchableOpacity>
//             <Text style={StyleSheet.compose(GlobalStyle.heading1, styles.headerText)}>
//               {mode === 'punch-in' ? 'Check In Verification' : 'Punch Out Verification'}
//             </Text>
//           </View>
//         </View>

//       </ImageBackground>

//       <Text style={StyleSheet.compose(GlobalStyle.heading5, styles.instructionText)}>
//         {capturedImage ? "Verification Image Captured" : 'Show your face for verification'}
//       </Text>

//       <View style={styles.contentContainer}>
//         {capturedImage ? (
//           <View style={styles.imagePreviewContainer}>
//             <Image
//               source={{ uri: capturedImage }}
//               style={styles.previewImage}
//             />
//           </View>
//         ) : (
//           <View style={styles.placeholderContainer}>
//             <View style={styles.faceContainer}>
//               <View style={styles.cornerTopLeft} />
//               <View style={styles.cornerTopRight} />
//               <View style={styles.cornerBottomLeft} />
//               <View style={styles.cornerBottomRight} />
//             </View>
//           </View>
//         )}
//       </View>

//       <View style={styles.buttonContainer}>
//         {capturedImage ? (
//           <View style={styles.actionButtons}>
//             <TouchableOpacity
//               style={[styles.button, styles.retakeButton]}
//               onPress={handleRetake}
//             >
//               <View style={styles.buttonContentRetake}>
//                 <FontAwesomeIcon icon={faRedo} size={20} color="#3E89EC" style={{ top: 18 }} />
//                 <Text style={StyleSheet.compose(GlobalStyle.H6, styles.buttonTextRetake)}>Retake</Text>
//               </View>
//             </TouchableOpacity>
//             <TouchableOpacity
//               disabled={toggle}
//               onPress={handleContinue}
//               activeOpacity={0.8}
//               style={[
//                 styles.button,
//                 { backgroundColor: '#3E89EC' }
//               ]}
//             >
//               <View style={styles.buttonContent}>
//                 <FontAwesomeIcon icon={faArrowRight} size={20} color="white" style={{ top: 18 }} />
//                 <Text style={StyleSheet.compose(GlobalStyle.H6, styles.buttonText)}>Continue</Text>
//               </View>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <TouchableOpacity
//             style={StyleSheet.compose(GlobalStyle.registerbutton, styles.captureButton)}
//             onPress={requestCameraPermission}
//           >
//             <Text style={StyleSheet.compose(GlobalStyle.H6, styles.captureButtonText)}>Capture Image</Text>
//           </TouchableOpacity>
//         )}

//         <Tab.Navigator
//           screenOptions={({ route }) => ({
//             tabBarIcon: ({ focused }) => {
//               if (route.name === 'AttendanceHome') {
//                 return focused ? (
//                   <SazsFillIcon width={35} height={35} fill="white" />
//                 ) : (
//                   <SazsIcon width={25} height={25} fill="white" />
//                 );
//               } else if (route.name === 'WeekLogScreen') {
//                 return focused ? (
//                   <DashFillIcon width={30} height={30} fill="white" />
//                 ) : (
//                   <DashIcon width={22} height={22} fill="white" />
//                 );
//               } else if (route.name === 'LeaveDashboard') {
//                 return focused ? (
//                   <DashFillIcon width={30} height={30} fill="white" />
//                 ) : (
//                   <DashIcon width={22} height={22} fill="white" />
//                 );
//               }
//             },
//             tabBarActiveTintColor: 'white',
//             tabBarInactiveTintColor: 'white',
//             tabBarStyle: styles.tabStyle,
//             tabBarShowLabel: false,
//             headerShown: false,
//           })}
//         >
//           <Tab.Screen
//             name="AttendanceHome"
//             component={AttendanceHome}
//             listeners={{
//               tabPress: () => handleTabPress('AttendanceHome'),
//             }}
//           />
//           <Tab.Screen
//             name="WeekLogScreen"
//             component={WeekLogScreen}
//             listeners={{
//               tabPress: () => handleTabPress('WeekLogScreen'),
//             }}
//           />
//           <Tab.Screen
//             name="LeaveDashboard"
//             component={LeaveDashboard}
//             listeners={{
//               tabPress: () => handleTabPress('LeaveDashboard'),
//             }}
//           />
//         </Tab.Navigator>
//         <Modal
//           animationType="fade"
//           transparent={true}
//           visible={isModalVisible}
//           onRequestClose={handleModalClose}
//         >
//           <View style={styles.centeredView}>
//             <View style={styles.modalView}>
//               {/* <View style={styles.divider} /> */}
//               <Text style={StyleSheet.compose(GlobalStyle.heading3, styles.modalTitle)}>
//                 {mode === 'punch-in' ? 'Check-In Successfully' : 'Check-Out Successfully'}
//               </Text>
//               <Text style={StyleSheet.compose(GlobalStyle.Body, styles.modalText)}>
//                 Time: {currentTime}
//               </Text>
//               <Image
//                 source={profileIcon}
//                 resizeMode="contain"
//                 style={styles.profileImage}
//               />
//             </View>
//           </View>
//         </Modal>


//       </View>

//       {/* <Modal
//         transparent={true}
//         animationType="slide"
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <Text style={styles.modalText}>Face ID updated successfully</Text>
//             <Text style={styles.emoji}>👍</Text>
//             <TouchableOpacity
//               onPress={() => setModalVisible(false)}
//               style={styles.closeButton}
//             >
//               <Text style={styles.closeButtonText}>OK</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal> */}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // container: {
//   //   flex: 1,
//   //   // backgroundColor: '#F6F3ED',
//   // }
//   watermarkIcon: {
//     backgroundColor: '#3E89EC',
//   },
//   header: {
//     paddingVertical: verticalScale(35),
//     flexDirection: 'row',
//     top: scale(45),
//   },
//   headerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//     marginLeft: scale(10),
//     bottom: scale(56),
//   },

//   headerBackground: {
//     height: verticalScale(180),
//     backgroundColor: '#3E89EC',
//     paddingTop: verticalScale(25),
//     paddingHorizontal: scale(20),
//   },
//   imageStyle: {
//     width: scale(200),
//     marginTop: verticalScale(15),
//     height: verticalScale(170),
//     alignSelf: 'flex-end',
//     marginVertical: verticalScale(20),
//     marginLeft: scale(150),
//   },
//   instructionText: {
//     marginTop: verticalScale(20),
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   contentContainer: {
//     flex: 1,
//     bottom: verticalScale(38),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   imagePreviewContainer: {
//     width: scale(300),
//     height: verticalScale(290),
//     backgroundColor: '#F3F3F3',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: moderateScale(12),
//     overflow: 'hidden',
//   },
//   previewImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'contain',
//   },
//   placeholderContainer: {
//     width: scale(280),
//     height: verticalScale(280),
//     backgroundColor: '#E1E1E1',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: moderateScale(12),
//   },
//   faceContainer: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//     position: 'relative',
//   },
//   cornerTopLeft: {
//     position: 'absolute',
//     top: verticalScale(35),
//     left: scale(23),
//     width: scale(26),
//     height: verticalScale(22),
//     borderLeftWidth: 2,
//     borderTopWidth: 2,
//     borderColor: '#666666',
//     borderRadius: moderateScale(4),
//   },
//   cornerTopRight: {
//     position: 'absolute',
//     top: verticalScale(35),
//     right: scale(23),
//     width: scale(26),
//     height: verticalScale(22),
//     borderRightWidth: 2,
//     borderTopWidth: 2,
//     borderColor: '#666666',
//     borderRadius: moderateScale(4),
//   },
//   cornerBottomLeft: {
//     position: 'absolute',
//     bottom: verticalScale(44),
//     left: scale(23),
//     width: scale(26),
//     height: verticalScale(22),
//     borderLeftWidth: 2,
//     borderBottomWidth: 2,
//     borderColor: '#666666',
//     borderRadius: moderateScale(4),
//   },
//   cornerBottomRight: {
//     position: 'absolute',
//     bottom: verticalScale(44),
//     right: scale(23),
//     width: scale(26),
//     height: verticalScale(22),
//     borderRightWidth: 2,
//     borderBottomWidth: 2,
//     borderColor: '#666666',
//     borderRadius: moderateScale(4),
//   },
//   buttonContainer: {
//     width: scale(300),
//     alignSelf: 'center',
//     marginBottom: verticalScale(15),
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   button: {
//     borderRadius: moderateScale(8),
//     borderColor: '#ccc',
//     borderWidth: 1,
//     elevation: 5,
//     bottom: verticalScale(60),
//   },
//   buttonContentRetake: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: moderateScale(10),
//     height: verticalScale(40),
//     width: scale(140),
//     bottom: verticalScale(17),
//   },
//   buttonContent: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: moderateScale(10),
//     height: verticalScale(40),
//     width: scale(140),
//     bottom: verticalScale(17),
    
//   },
//   captureButtonText: {
//     fontWeight: 'bold',
//     marginLeft: scale(8),
//   },
//   buttonTextRetake: {
//     color: '#3E89EC',
//     fontWeight: 'bold',
//     marginLeft: scale(6),
//     fontFamily: 'Cabin-Regular',
//     top: scale(15),
//     paddingVertical: scale(5),
//     marginTop: verticalScale(3),
//   },
//   buttonText: {
//     fontWeight: 'bold',
//     marginLeft: scale(6),
//     fontFamily: 'Cabin-Regular',
//     top: scale(15),
//     paddingVertical: scale(5),
//     marginTop: verticalScale(3),
//   },
//   retakeButton: {
//     backgroundColor: 'white',
//     borderColor: '#ccc',
//     borderWidth: 1,
//     elevation: 5,
//   },
//   captureButton: {
//     backgroundColor: '#4A90E2',
//     padding: verticalScale(9),
//     borderRadius: moderateScale(8),
//     alignItems: 'center',
//     justifyContent: 'center',
//     left: scale(15),
//     bottom: verticalScale(60),
//   },
//   modalOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     width: scale(300),
//     backgroundColor: 'white',
//     padding: scale(19),
//     borderRadius: moderateScale(12),
//     alignItems: 'center',
//   },
//   modalText: {
//     color: 'black',
//     fontSize: wp('4%'),
//     textAlign: 'center',
//   },
//   emoji: {
//     fontSize: wp('12%'),
//     marginVertical: verticalScale(15),
//   },
//   closeButton: {
//     marginTop: hp('2%'),
//     backgroundColor: '#4A90E2',
//     paddingHorizontal: wp('5%'),
//     paddingVertical: hp('1.5%'),
//     borderRadius: wp('2%'),
//   },
//   closeButtonText: {
//     color: '#FFFFFF',
//     fontWeight: 'bold',
//   },

//   // image: {
//   //   width: 100,
//   //   height: 200,
//   //   marginTop: 10,
//   //   alignSelf: 'center',
//   //   left: -40,
//   // },

//   centeredView: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)'
//   },
//   modalView: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: moderateScale(60),
//     borderTopRightRadius: moderateScale(60),
//     padding: scale(40),
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//     width: '100%',
//     bottom: verticalScale(-36),
//     top: verticalScale(218),
//     height: verticalScale(290),
//   },
//   divider: {
//     width: scale(115),
//     height: verticalScale(5),
//     backgroundColor: '#696969',
//     marginBottom: verticalScale(15),
//   },
//   modalTitle: {
//     fontWeight: 'bold',
//     marginBottom: verticalScale(15),
//     color: '#7AB134'
//   },
//   modalText: {
//     fontSize: 16,
//     marginBottom: verticalScale(15),
//     textAlign: 'center'
//   },
//   profileImage: {
//     width: scale(75),
//     height: scale(75),
//     marginTop: verticalScale(7),
//   },

//   tabStyle: {
//     backgroundColor: '#3E89EC',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 10,
//     },
//     borderTopEndRadius: scale(30),
//     borderTopStartRadius: scale(30),
//     shadowOpacity: 0.25,
//     shadowRadius: 5,
//     elevation: 10,
//     height: verticalScale(45),
//     width: scale(350),
//     left:scale(-25),
//     bottom: verticalScale(30),
//   },
// });

// export default Selfie;