// import React, { useState, useEffect, useContext ,useRef} from 'react';
// import {
//   Text,
//   View,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   TextInput,
//   Modal,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   ImageBackground,
//   Image,
//   Animated
// } from 'react-native';
// import LottieView from 'lottie-react-native';
// import { Dimensions } from 'react-native';
// import { VehicleDataContext } from './VehicleDataContext';
// import GlobalStyle from '../components/common/GlobalStyle';
// import { LocationVerifier } from './LocationVerifier';
// import { useNavigation } from '@react-navigation/native';
// import { getStoredData } from '../components/common/AsyncStorage';
// import Loading from '../components/common/Loading.js';

// // Import ScaledSheet, scale, verticalScale, and moderateScale from react-native-size-matters
// import { ScaledSheet, scale, verticalScale, moderateScale } from 'react-native-size-matters';

// const { width, height } = Dimensions.get('window');
// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // Remove the custom responsive function since we'll use react-native-size-matters instead
// // const scale = SCREEN_WIDTH / 375;
// // const responsive = (size) => {
// //   const newSize = size * scale;
// //   return Math.round(newSize);
// // };

// const CustomAlertModal = React.memo(({visible, title, message, onClose, type}) => {
  
//   const slideAnim = useRef(new Animated.Value(300)).current; // Starts off-screen
//   const fadeAnim = useRef(new Animated.Value(0)).current; // Starts invisible

//   // Add error condition check
//   const isError = title === 'Error' || type === 'Error';
 
//   // Determine which animation to use based on the error condition
//   const animationSource = isError
//     ? require('../images/WrongLocation.json')
//     : require('../images/Animation3.json');
 
//   console.log('Alert title:', title);
//   console.log('Alert type:', type);
//   console.log('Is Error?', isError);
//   console.log('Animation source selected:', animationSource);

//   useEffect(() => {
//     if (visible) {
//       Animated.parallel([
//         Animated.spring(slideAnim, {
//           toValue: 0,
//           tension: 50,
//           friction: 7,
//           useNativeDriver: true,
//         }),
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     } else {
//       Animated.parallel([
//         Animated.timing(slideAnim, {
//           toValue: 300,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//         Animated.timing(fadeAnim, {
//           toValue: 0,
//           duration: 200,
//           useNativeDriver: true,
//         }),
//       ]).start();
//     }
//   }, [visible]);

//   return (
//     <Modal transparent visible={visible} animationType="none">
//       <Animated.View
//         style={[
//           styles.modalOverlay1,
//           {opacity: fadeAnim}, // Apply fade effect
//         ]}>
//         <Animated.View
//           style={[
//             styles.alertContainer,
//             {transform: [{translateY: slideAnim}]}, // Slide effect
//           ]}>
//           <Text style={styles.alertTitle}>{title}</Text>
//           <Text style={styles.alertMessage}>{message}</Text>

//           <View style={styles.animationContainer}>
//             <LottieView
//               style={styles.WelcomeAnime}
//               source={animationSource}
//               autoPlay
//               loop={false}
//               onAnimationFinish={onClose}
//             />
//           </View>
//         </Animated.View>
//       </Animated.View>
//     </Modal>
//   );
// });


// const CategoryTabs = ({ categories, selectedCategory, onSelectCategory }) => {
//   return (
//     <View style={styles.tabContainer}>
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={styles.tabScrollContent}>
//         {categories.map(category => (
//           <TouchableOpacity
//             key={category.Id}
//             style={[
//               styles.tab,
//               selectedCategory === category.Id && styles.selectedTab,
//             ]}
//             onPress={() => onSelectCategory(category.Id, category.Name)}>
//             <Text
//               style={[
//                 styles.tabText,
//                 selectedCategory === category.Id && styles.selectedTabText,
//               ]}>
//               {category.Name}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>
//     </View>
//   );
// };

// const CustomPicker = ({
//   value,
//   options,
//   onValueChange,
//   placeholder,
//   error,
//   icon,
// }) => {
//   const [modalVisible, setModalVisible] = useState(false);
//   const selectedOption = options?.find(opt => opt.Id === value);

//   // Handle case where options is undefined or empty
//   const safeOptions = options || [];

//   return (
//     <>
//       <TouchableOpacity
//         onPress={() => setModalVisible(true)}
//         style={[
//           styles.pickerButton,
//           error && styles.errorBorder,
//           value && styles.selectedPickerButton,
//         ]}>
//         <View style={styles.pickerButtonContent}>
//           {icon && <View style={styles.iconContainer}>{icon}</View>}
//           <Text
//             style={
//               selectedOption ? styles.selectedText : styles.placeholderText
//             }
//             numberOfLines={1}>
//             {selectedOption ? selectedOption.Name : placeholder}
//           </Text>
//         </View>
//       </TouchableOpacity>

//       <Modal
//         visible={modalVisible}
//         transparent={true}
//         animationType="slide"
//         onRequestClose={() => setModalVisible(false)}>
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setModalVisible(false)}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>{placeholder}</Text>
//               <TouchableOpacity
//                 onPress={() => setModalVisible(false)}
//                 style={styles.closeButton}>
//                 <Text style={styles.closeButtonText}>✕</Text>
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.modalScrollView}>
//               {safeOptions.length > 0 ? (
//                 safeOptions.map((option, index) => (
//                   <TouchableOpacity
//                     key={`${option.Id}-${index}`}
//                     style={[
//                       styles.optionItem,
//                       value === option.Id && styles.selectedOption,
//                     ]}
//                     onPress={() => {
//                       onValueChange(option.Id);
//                       setModalVisible(false);
//                     }}>
//                     <Text
//                       style={[
//                         styles.optionText,
//                         value === option.Id && styles.selectedOptionText,
//                       ]}>
//                       {option.Name}
//                     </Text>
//                     {value === option.Id && (
//                       <Text style={styles.checkmark}>✓</Text>
//                     )}
//                   </TouchableOpacity>
//                 ))
//               ) : (
//                 <View style={styles.noDataContainer}>
//                   <Text style={styles.noDataText}>No options available</Text>
//                 </View>
//               )}
//             </ScrollView>
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </>
//   );
// };

// const VehicleEntry = () => {
//   const [formData, setFormData] = useState({
//     vehicleNumber: '',
//     category: null,
//     product: '',
//     uom: '',
//     notes: '',
//   });

//   const [categoryOptions, setCategoryOptions] = useState([]);
//   const [productOptions, setProductOptions] = useState([]);
//   const [vehicleOptions, setVehicleOptions] = useState([]);
//   const [uomOptions, setUomOptions] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);
//   const locationVerifierRef = React.useRef(null);
//   const [isLocationVerifierInitialized, setIsLocationVerifierInitialized] = useState(false);
//   const navigation = useNavigation();
//   const [alertInfo, setAlertInfo] = useState({
//     visible: false,
//     title: '',
//     message: '',
//   });
//   const {
//     vehicleData,
//     fetchVehicleData,
//     handleConfirmVehicleOut,
//     handleVehicleOut,
//     setSelectedPassNo,
//     selectedPassNo,
//   } = useContext(VehicleDataContext);

//   useEffect(() => {
//     fetchDropdownData();
//   }, []);

//   const fetchDropdownData = async () => {
//     try {
//       const response = await fetch(
//         'https://demo.sazss.in/Api/VehiclePageCombobox',
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: 'Basic ' + btoa('Inventory:SazsApps@123'),
//           },
//         },
//       );

//       const data = await response.json();
//       console.log('API data:', data);

//       const validCategories = data[0]
//         .filter(item => item.Id && item.Name && item.Name.trim() !== '')
//         .map(item => ({
//           Id: item.Id || item.id,
//           Name: item.Name || item.name,
//         }));

//       setCategoryOptions(validCategories);
//       // Set UOM options
//       setUomOptions(
//         data[1].map(item => ({
//           Id: item.Id || item.id,
//           Name: item.Column1 || item.Name || 'Select UOM',
//         })),
//       );

//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching dropdown data:', error);
//       Alert.alert('Error', 'Failed to load dropdown data');
//       setLoading(false);
//     }
//   };

//   const fetchProductData = async (categoryId, categoryName) => {
//     try {
//       const response = await fetch(
//         `https://demo.sazss.in/Api/VehiclePageCombobox?GatePassFor=${categoryId}`,
//         {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: 'Basic ' + btoa('Inventory:SazsApps@123'),
//           },
//         },
//       );

//       const data = await response.json();
//       console.log('Product API Data:', data);

//       // Reset options before setting new ones
//       setProductOptions([]);
//       setVehicleOptions([]);

//       // Dynamic handling based on category names
//       switch (categoryName) {
//         case 'Raw Material':
//           setProductOptions(
//             data[2].map(item => ({
//               Id: item.Id || item.id,
//               Name: item.Name || item.name,
//             })),
//           );
//           setVehicleOptions(
//             data[0].map(item => ({
//               Id: item.Id || item.id,
//               Name: item.Name || item.name,
//             })),
//           );
//           break;
//         case 'Sale':
//           setProductOptions(
//             data[0].map(item => ({
//               Id: item.Id || item.id,
//               Name: item.Name || item.name,
//             })),
//           );
//           setVehicleOptions([]);
//           break;
//         case 'Visitors':
//           // For visitors, clear product and vehicle options
//           setProductOptions([]);
//           setVehicleOptions([]);
//           break;
//         default:
//           // For other categories, you might want to set some default behavior
//           setProductOptions([]);
//           setVehicleOptions([]);
//       }
//     } catch (error) {
//       console.error('Error fetching product data:', error);
//       Alert.alert('Error', 'Failed to load product data');
//     }
//   };

//   const validateForm = () => {
//     const newErrors = {};
//     const { category, vehicleNumber, product, uom, notes } = formData;
//   const categoryName = categoryOptions.find(opt => opt.Id === category)?.Name;

//     // Validate category
//     if (!category) {
//       newErrors.category = 'Please select a category';
//     }
  
//     // Always validate vehicle number
//     if (!vehicleNumber || vehicleNumber.trim() === '') {
//       newErrors.vehicleNumber = 'Please enter a vehicle number';
//     }
  
//     // Validate based on category
//     if (categoryName === 'Visitors' || category === 'E-GP03') {
//       // For Visitors category, validate notes
//       if (!notes || notes.trim() === '') {
//         newErrors.notes = 'Please enter purpose of visit';
//       }
//     } else {
//       // For other categories (Raw Material, Sale, etc.), validate product and UOM
//       if (!product || product === '') {
//         newErrors.product = 'Please select a product';
//       }
  
//       if (!uom || uom === '') {
//         newErrors.uom = 'Please select a UOM';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }
//     const payload = {
//       GatePassFor: formData.category,
//       VehicleNumber: formData.vehicleNumber,
//       // Only include Product and UOM if not Visitors
//       ...(formData.category !== 'Visitors' && {
//         Product: formData.product,
//         UOM: formData.uom,
//       }),
//       CreatedBy: '1',
//       Notes: formData.notes,
//     };
//     try {
//       const response = await fetch(
//         'https://demo.sazss.in/Api/SecurityGatePass',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: 'Basic ' + btoa('Inventory:SazsApps@123'),
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       if (response.ok) {
//         setAlertInfo({
//           visible: true,
//           title: 'Success',
//           message: 'Vehicle entry submitted successfully!',
//           type : 'Success',
//         });
//         fetchVehicleData();
//       } else {
//         setAlertInfo({
//           visible: true,
//           title: 'Error',
//           message: 'Failed to submit vehicle entry.',
//           type : 'Error',
//         });
//       }
//     } catch (error) {
//       setAlertInfo({
//         visible: true,
//         title: 'Error',
//         message: 'An error occurred during submission.',
//         type : 'Error',
//       });
//     }
//   };

//   const handleCancel = () => {
//     setFormData({
//       vehicleNumber: '',
//       category: null,
//       categoryName: '',
//       product: '',
//       uom: '',
//       notes: '',
//     });
//     setErrors({});
//   };

//   const handleCategorySelect = (categoryId, categoryName) => {
//     console.log('Selected category ID:', categoryId);
//     setFormData({
//       vehicleNumber: '',
//       category: categoryId,
//       categoryName,
//       product: '',
//       uom: '',
      
//     });
//     setErrors({});
//     setProductOptions([]);
//     setVehicleOptions([]);
//     if (categoryName !== 'Visitors') {
//       fetchProductData(categoryId, categoryName);
//       console.log('categoryName', categoryName);
//     }
//   };

//   const handleFieldChange = (field, value) => {
//     setFormData(prev => ({ ...prev, [field]: value }));
//     setErrors(prev => ({ ...prev, [field]: undefined }));
//   };

//   const initializeLocationVerifier = React.useCallback(async () => {
//     try {
//       const companyInfo = await getStoredData("CompanyDetails");
//       if (companyInfo && companyInfo[0]) {
//         locationVerifierRef.current = new LocationVerifier(navigation);
//         locationVerifierRef.current.setOfficeLocation(
//           parseFloat(companyInfo[0].Latitude),
//           parseFloat(companyInfo[0].Longitude)
//         );
//         setIsLocationVerifierInitialized(true);
//       }
//     } catch (error) {
//       console.error('Error initializing location:', error);
//       setAlertInfo({
//         visible: true,
//         title: 'Error',
//         type: 'Error',
//         message: 'Failed to initialize location services'
//       });
//     }
//   }, [navigation]);

//   // Add focus listener to reinitialize location verifier when screen comes into focus
//   React.useEffect(() => {
//     const unsubscribe = navigation.addListener('focus', () => {
//       if (!isLocationVerifierInitialized) {
//         initializeLocationVerifier();
//       }
//     });

//     // Initialize on first mount
//     if (!isLocationVerifierInitialized) {
//       initializeLocationVerifier();
//     }

//     return unsubscribe;
//   }, [navigation, isLocationVerifierInitialized, initializeLocationVerifier]);
//   const handleNav = () => {
//   // Your location verification logic here...

//   // Then navigate
//   navigation.navigate('Securityattendance');
// };
//   const handleLocationVerification = () => {
//     if (!locationVerifierRef.current) {
//       console.error('Location verifier not initialized');
//       return;
//     }

//     locationVerifierRef.current.verifyLocation({
//       onStart: () => {
//         setIsLoading(true);
//       },
//       onSuccess: (result) => {
//         setIsLoading(false);
//         if (!result.success) {
//           setAlertInfo({
//             visible: true,
//             title: result.title,
//             message: result.message,
//             type: 'Error',
//           });
//         }
//       },
//       onComplete: (result) => {
//         setIsLoading(false);
//         if (!result.success) {
//           setAlertInfo({
//             visible: true,
//             title: result.title,
//             message: result.message,
//             type: 'Error',
//           });
//         }
//       }
//     });
//   };

//   // Clean up location verifier on unmount
//   React.useEffect(() => {
//     return () => {
//       locationVerifierRef.current = null;
//       setIsLocationVerifierInitialized(false);
//     };
//   }, []);

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={GlobalStyle.container}>
       
//           <ImageBackground
//           style={GlobalStyle.headerImage}
//           resizeMode="contain"
//           imageStyle={{
//             width: 232,
//             marginTop: 0,
//             height: 210,
//             top: 34,
//             alignSelf: 'flex-end',
//             marginLeft: width - 232,
//           }}
//             source={require('../images/LOGO.png')}>
            
//               <Text style={GlobalStyle.heading1}>Incoming</Text>
//               <Text style={GlobalStyle.heading1}>Vehicle Entry</Text>
            
//           </ImageBackground>
          

          
//             <View style={styles.formContainer}>
//               <View style={styles.formSection}>
//               <Text style={styles.label}>Pass Information</Text>
             
//                 <CategoryTabs
//                   categories={categoryOptions}
//                   selectedCategory={formData.category}
//                   onSelectCategory={handleCategorySelect}
//                 />
                
//                 {errors.category && (
//                   <Text style={styles.errorText}>{errors.category}</Text>
//                 )}
//  {/* <ScrollView
//           contentContainerStyle={styles.scrollContent}
//           showsVerticalScrollIndicator={false}> */}
//                 {formData.category && (
//                   <>
//                   <Text style={styles.label}>Vehicle Number</Text>
//                     {formData.category === 'Raw material' ? (
//                       <CustomPicker
//                         value={formData.vehicleNumber}
//                         options={vehicleOptions}
//                         onValueChange={itemValue =>
//                           handleFieldChange('vehicleNumber', itemValue)
//                         }
//                         placeholder="Select Vehicle Number"
//                         error={errors.vehicleNumber}
//                       />
//                     ) : (
//                       <View style={styles.inputWrapper}>
//                         <TextInput
//                           style={[
//                             styles.textInput,
//                             errors.vehicleNumber && styles.errorBorder,
//                           ]}
//                           placeholder="Enter Vehicle Number"
//                           placeholderTextColor="#999"
//                           value={formData.vehicleNumber}
//                           onChangeText={text =>
//                             handleFieldChange('vehicleNumber', text.toUpperCase())
//                           }
//                           autoCapitalize="characters"
//                           maxLength={10}
//                         />
//                       </View>
//                     )}
//                     {errors.vehicleNumber && (
//                       <Text style={styles.errorText}>
//                         {errors.vehicleNumber}
//                       </Text>
//                     )}
//                     {formData.category === 'E-GP03' && (
                      
//                       <View style={styles.inputWrapper}>
//                         <TextInput
//                           style={[
//                             styles.textInput,
//                             errors.notes && styles.errorBorder,
//                           ]}
//                           placeholder="Purpose of Visit"
//                           placeholderTextColor="#999"
//                           value={formData.notes}
//                           onChangeText={text =>
//                             handleFieldChange('notes', text)
//                           }
//                           autoCapitalize="sentences"
//                           maxLength={200}
//                         />
//                       </View>
//                     )}

//                     {errors.vehicleNumber && (
//                       <Text style={styles.errorText}>
//                         {errors.notes}
//                       </Text>
//                     )}

//                     {/* Only render Product and UOM for non-Visitors categories */}
//                     {formData.category !== 'E-GP03' && (
//                       <>
//                       <Text style={styles.label}>Product</Text>
//                         <CustomPicker
//                           value={formData.product}
//                           options={productOptions}
//                           onValueChange={itemValue =>
//                             handleFieldChange('product', itemValue)
//                           }
//                           placeholder="Select Product"
//                           error={errors.product}
//                         />
//                          {errors.product && (
//                     <Text style={styles.errorText}>{errors.product}</Text>
//                   )}
//                   <Text style={styles.label}>UOM</Text>
//                         <CustomPicker
//                           value={formData.uom}
//                           options={uomOptions}
//                           onValueChange={itemValue =>
//                             handleFieldChange('uom', itemValue)
//                           }
//                           placeholder="Select Unit Of Measurement"
//                           error={errors.uom}
//                         />
//                         {errors.uom && (
//                     <Text style={styles.errorText}>{errors.uom}</Text>
//                   )}
//                       </>
//                     )}

//                     <View style={styles.buttonContainer}>
//                       <TouchableOpacity
//                         onPress={handleCancel}
//                         style={styles.cancelButton}
//                         activeOpacity={0.8}>
//                         <Text style={styles.cbuttonText}>Cancel</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity
//                         onPress={handleSubmit}
//                         style={styles.submitButton}
//                         activeOpacity={0.8}>
//                         <Text style={styles.buttonText}>Submit</Text>
//                       </TouchableOpacity>
//                       <CustomAlertModal
//                         visible={alertInfo.visible}
//                         title={alertInfo.title}
//                         message={alertInfo.message}
//                         onClose={() => {
//                           setAlertInfo({ ...alertInfo, visible: false });
//                           setFormData({});
//                         }}
//                         onConfirm={
//                           alertInfo.title === 'Success'
//                             ? handleCancel
//                             : undefined
//                         }
//                         type={alertInfo.type}
//                       />
//                     </View>
//                   </>
//                 )}
//                  {/* </ScrollView> */}
//               </View>
//             </View>
          
         

//       {/* Update the CustomAlertModal to handle navigation */}
      

       
//         <TouchableOpacity
//         style={{
//           position: 'absolute',
//           bottom: verticalScale(5),
//           right: scale(20),
//           backgroundColor: '#FFFFFF',
//           borderRadius: scale(30),
//           padding: scale(10),
//           elevation: 5,
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 0.3,
//           shadowRadius: 4,
//         }}
//         // onPress={handleLocationVerification}
//         onPress={handleNav}
//       >
//         <Image
//           source={require('../images/face-scan.png')}
//           style={{
//             width: scale(40),
//             height: scale(40),
//             resizeMode: 'contain',
//           }}
//         />
//       </TouchableOpacity>
//       </KeyboardAvoidingView>
//       <CustomAlertModal
//         visible={alertInfo.visible}
//         title={alertInfo.title}
//         message={alertInfo.message}
//         type={alertInfo.type}
//         onClose={() => {
//           setAlertInfo({ ...alertInfo, visible: false });
//         }}
//         />
//         {isLoading && <Loading text="Verifying location..." />}
//     </SafeAreaView>
//   );
// };









import React, { useState, useEffect, useContext ,useRef} from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Image,
  Animated
} from 'react-native';
import LottieView from 'lottie-react-native';
import { Dimensions } from 'react-native';
import { VehicleDataContext } from './VehicleDataContext';
import GlobalStyle from '../components/common/GlobalStyle';
import { LocationVerifier } from './LocationVerifier';
import { useNavigation } from '@react-navigation/native';
import { getStoredData } from '../components/common/AsyncStorage';
import Loading from '../components/common/Loading.js';
import { DataContext } from '../components/common/DataContext.js'; // Import DataContext

// Import ScaledSheet, scale, verticalScale, and moderateScale from react-native-size-matters
import { ScaledSheet, scale, verticalScale, moderateScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CustomAlertModal = React.memo(({visible, title, message, onClose, type}) => {
  
  const slideAnim = useRef(new Animated.Value(300)).current; // Starts off-screen
  const fadeAnim = useRef(new Animated.Value(0)).current; // Starts invisible

  // Add error condition check
  const isError = title === 'Error' || type === 'Error';
 
  // Determine which animation to use based on the error condition
  const animationSource = isError
    ? require('../images/WrongLocation.json')
    : require('../images/Animation3.json');
 
  console.log('Alert title:', title);
  console.log('Alert type:', type);
  console.log('Is Error?', isError);
  console.log('Animation source selected:', animationSource);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        style={[
          styles.modalOverlay1,
          {opacity: fadeAnim}, // Apply fade effect
        ]}>
        <Animated.View
          style={[
            styles.alertContainer,
            {transform: [{translateY: slideAnim}]}, // Slide effect
          ]}>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>

          <View style={styles.animationContainer}>
            <LottieView
              style={styles.WelcomeAnime}
              source={animationSource}
              autoPlay
              loop={false}
              onAnimationFinish={onClose}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});

const CategoryTabs = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.tabContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContent}>
        {categories.map(category => (
          <TouchableOpacity
            key={category.Id}
            style={[
              styles.tab,
              selectedCategory === category.Id && styles.selectedTab,
            ]}
            onPress={() => onSelectCategory(category.Id, category.Name)}>
            <Text
              style={[
                styles.tabText,
                selectedCategory === category.Id && styles.selectedTabText,
              ]}>
              {category.Name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const CustomPicker = ({
  value,
  options,
  onValueChange,
  placeholder,
  error,
  icon,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedOption = options?.find(opt => opt.Id === value);

  // Handle case where options is undefined or empty
  const safeOptions = options || [];

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={[
          styles.pickerButton,
          error && styles.errorBorder,
          value && styles.selectedPickerButton,
        ]}>
        <View style={styles.pickerButtonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={
              selectedOption ? styles.selectedText : styles.placeholderText
            }
            numberOfLines={1}>
            {selectedOption ? selectedOption.Name : placeholder}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {safeOptions.length > 0 ? (
                safeOptions.map((option, index) => (
                  <TouchableOpacity
                    key={`${option.Id}-${index}`}
                    style={[
                      styles.optionItem,
                      value === option.Id && styles.selectedOption,
                    ]}
                    onPress={() => {
                      onValueChange(option.Id);
                      setModalVisible(false);
                    }}>
                    <Text
                      style={[
                        styles.optionText,
                        value === option.Id && styles.selectedOptionText,
                      ]}>
                      {option.Name}
                    </Text>
                    {value === option.Id && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No options available</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const VehicleEntry = () => {
  // Add DataContext to get webkey and other company details
  const { dailyData, selectedCompany } = useContext(DataContext);
  
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    category: null,
    product: '',
    uom: '',
    notes: '',
  });

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [vehicleOptions, setVehicleOptions] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const locationVerifierRef = React.useRef(null);
  const [isLocationVerifierInitialized, setIsLocationVerifierInitialized] = useState(false);
  const navigation = useNavigation();
  const [alertInfo, setAlertInfo] = useState({
    visible: false,
    title: '',
    message: '',
  });
  
  // State to store company details for API calls
  const [companyDetails, setCompanyDetails] = useState(null);

  
  const {
    vehicleData,
    fetchVehicleData,
    handleConfirmVehicleOut,
    handleVehicleOut,
    setSelectedPassNo,
    selectedPassNo,
  } = useContext(VehicleDataContext);

  // Load company details on component mount
  useEffect(() => {
    loadCompanyDetails();
  }, [selectedCompany]);

  useEffect(() => {
    if (companyDetails) {
      fetchDropdownData();
    }
  }, [companyDetails]);

  const loadCompanyDetails = async () => {
    try {
      const storedCompanies = await getStoredData('CompanyDetails');
      const selectedCompanyId = selectedCompany || await getStoredData('SelectedCompany');
      
      if (storedCompanies && selectedCompanyId) {
        const company = storedCompanies.find(c => c.id == selectedCompanyId);
        if (company) {
          setCompanyDetails(company);
          console.log('Loaded company details:', company);
        }
      }
    } catch (error) {
      console.error('Error loading company details:', error);
      setAlertInfo({
        visible: true,
        title: 'Error',
        message: 'Failed to load company details',
        type: 'Error',
      });
    }
  };

  const fetchDropdownData = async () => {
    if (!companyDetails) {
      console.error('Company details not available for API call');
      return;
    }
  const username = companyDetails.Username;
const password = companyDetails.Password;
const credentials = btoa(`${username}:${password}`);
    try {
      // Construct dynamic API URL using webkey from company details
      const apiUrl = `https://${companyDetails.Webkey}.sazss.in/Api/VehiclePageCombobox`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
           'Authorization': `Basic ${credentials}`, // Basic Auth header
         
          
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API data:', data);
      console.log('API data type:', typeof data);
      console.log('API data structure:', JSON.stringify(data, null, 2));

      // Validate response structure
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Invalid API response structure');
      }

      // Check if data[0] exists and is an array
      if (!data[0] || !Array.isArray(data[0])) {
        console.error('data[0] is not an array:', data[0]);
        throw new Error('Categories data is not available');
      }

      const validCategories = data[0]
        .filter(item => item && item.Id && item.Name && item.Name.trim() !== '')
        .map(item => ({
          Id: item.Id || item.id,
          Name: item.Name || item.name,
        }));

      setCategoryOptions(validCategories);

      // Set UOM options - check if data[1] exists
      if (data[1] && Array.isArray(data[1])) {
        setUomOptions(
          data[1].map(item => ({
            Id: item.Id || item.id,
            Name: item.Column1 || item.Name || 'Select UOM',
          })),
        );
      } else {
        console.warn('UOM data not available in API response');
        setUomOptions([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      setAlertInfo({
        visible: true,
        title: 'Error',
        message: `Failed to load dropdown data: ${error.message}`,
        type: 'Error',
      });
      setLoading(false);
    }
  };

  const fetchProductData = async (categoryId, categoryName) => {
    if (!companyDetails) {
      console.error('Company details not available for API call');
      return;
    }
     const username = companyDetails.Username;
const password = companyDetails.Password;
const credentials = btoa(`${username}:${password}`);

    try {
      // Construct dynamic API URL using webkey from company details
      const apiUrl = `https://${companyDetails.Webkey}.sazss.in/Api/VehiclePageCombobox?GatePassFor=${categoryId}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
     headers: {
          'Content-Type': 'application/json',
           'Authorization': `Basic ${credentials}`, // Basic Auth header
         
          
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Product API Data:', data);
      console.log('Product API Data structure:', JSON.stringify(data, null, 2));

      // Reset options before setting new ones
      setProductOptions([]);
      setVehicleOptions([]);

      // Validate response structure
      if (!data || !Array.isArray(data)) {
        console.warn('Invalid product data structure');
        return;
      }

      // Dynamic handling based on category names
      switch (categoryName) {
        case 'Raw Material':
          // Check if data[2] exists for products
          if (data[2] && Array.isArray(data[2])) {
            setProductOptions(
              data[2].map(item => ({
                Id: item.Id || item.id,
                Name: item.Name || item.name,
              })),
            );
          }
          // Check if data[0] exists for vehicles
          if (data[0] && Array.isArray(data[0])) {
            setVehicleOptions(
              data[0].map(item => ({
                Id: item.Id || item.id,
                Name: item.Name || item.name,
              })),
            );
          }
          break;
        case 'Sale':
          // Check if data[0] exists for products
          if (data[0] && Array.isArray(data[0])) {
            setProductOptions(
              data[0].map(item => ({
                Id: item.Id || item.id,
                Name: item.Name || item.name,
              })),
            );
          }
          setVehicleOptions([]);
          break;
        case 'Visitors':
          // For visitors, clear product and vehicle options
          setProductOptions([]);
          setVehicleOptions([]);
          break;
        default:
          // For other categories, check if data exists
          if (data[0] && Array.isArray(data[0])) {
            setProductOptions(
              data[0].map(item => ({
                Id: item.Id || item.id,
                Name: item.Name || item.name,
              })),
            );
          }
          setVehicleOptions([]);
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      setAlertInfo({
        visible: true,
        title: 'Error',
        message: `Failed to load product data: ${error.message}`,
        type: 'Error',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { category, vehicleNumber, product, uom, notes } = formData;
    const categoryName = categoryOptions.find(opt => opt.Id === category)?.Name;

    // Validate category
    if (!category) {
      newErrors.category = 'Please select a category';
    }
  
    // Always validate vehicle number
    if (!vehicleNumber || vehicleNumber.trim() === '') {
      newErrors.vehicleNumber = 'Please enter a vehicle number';
    }
  
    // Validate based on category
    if (categoryName === 'Visitors' || category === 'E-GP03') {
      // For Visitors category, validate notes
      if (!notes || notes.trim() === '') {
        newErrors.notes = 'Please enter purpose of visit';
      }
    } else {
      // For other categories (Raw Material, Sale, etc.), validate product and UOM
      if (!product || product === '') {
        newErrors.product = 'Please select a product';
      }
  
      if (!uom || uom === '') {
        newErrors.uom = 'Please select a UOM';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!companyDetails) {
      setAlertInfo({
        visible: true,
        title: 'Error',
        message: 'Company details not available',
        type: 'Error',
      });
      return;
    }

    const payload = {
      GatePassFor: formData.category,
      VehicleNumber: formData.vehicleNumber,
      // Only include Product and UOM if not Visitors
      ...(formData.category !== 'Visitors' && {
        Product: formData.product,
        UOM: formData.uom,
      }),
      CreatedBy: companyDetails.UserId || '1', // Use UserId from company details
      Notes: formData.notes,
    };
     const username = companyDetails.Username;
const password = companyDetails.Password;
const credentials = btoa(`${username}:${password}`);
    try {
      // Construct dynamic API URL using webkey from company details
      const apiUrl = `https://${companyDetails.Webkey}.sazss.in/Api/SecurityGatePass`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
       headers: {
          'Content-Type': 'application/json',
           'Authorization': `Basic ${credentials}`, // Basic Auth header
         
          
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setAlertInfo({
          visible: true,
          title: 'Success',
          message: 'Vehicle entry submitted successfully!',
          type: 'Success',
        });
        fetchVehicleData();
      } else {
        setAlertInfo({
          visible: true,
          title: 'Error',
          message: 'Failed to submit vehicle entry.',
          type: 'Error',
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setAlertInfo({
        visible: true,
        title: 'Error',
        message: 'An error occurred during submission.',
        type: 'Error',
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      vehicleNumber: '',
      category: null,
      categoryName: '',
      product: '',
      uom: '',
      notes: '',
    });
    setErrors({});
  };

  const handleCategorySelect = (categoryId, categoryName) => {
    console.log('Selected category ID:', categoryId);
    setFormData({
      vehicleNumber: '',
      category: categoryId,
      categoryName,
      product: '',
      uom: '',
      
    });
    setErrors({});
    setProductOptions([]);
    setVehicleOptions([]);
    if (categoryName !== 'Visitors') {
      fetchProductData(categoryId, categoryName);
      console.log('categoryName', categoryName);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const initializeLocationVerifier = React.useCallback(async () => {
    try {
      const companyInfo = await getStoredData("CompanyDetails");
      if (companyInfo && companyInfo[0]) {
        locationVerifierRef.current = new LocationVerifier(navigation);
        locationVerifierRef.current.setOfficeLocation(
          parseFloat(companyInfo[0].Latitude),
          parseFloat(companyInfo[0].Longitude)
        );
        setIsLocationVerifierInitialized(true);
      }
    } catch (error) {
      console.error('Error initializing location:', error);
      setAlertInfo({
        visible: true,
        title: 'Error',
        type: 'Error',
        message: 'Failed to initialize location services'
      });
    }
  }, [navigation]);

  // Add focus listener to reinitialize location verifier when screen comes into focus
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!isLocationVerifierInitialized) {
        initializeLocationVerifier();
      }
    });

    // Initialize on first mount
    if (!isLocationVerifierInitialized) {
      initializeLocationVerifier();
    }

    return unsubscribe;
  }, [navigation, isLocationVerifierInitialized, initializeLocationVerifier]);

  const handleNav = () => {
    // Your location verification logic here...
    // Then navigate
    navigation.navigate('Securityattendance');
  };

  const handleLocationVerification = () => {
    if (!locationVerifierRef.current) {
      console.error('Location verifier not initialized');
      return;
    }

    locationVerifierRef.current.verifyLocation({
      onStart: () => {
        setIsLoading(true);
      },
      onSuccess: (result) => {
        setIsLoading(false);
        if (!result.success) {
          setAlertInfo({
            visible: true,
            title: result.title,
            message: result.message,
            type: 'Error',
          });
        }
      },
      onComplete: (result) => {
        setIsLoading(false);
        if (!result.success) {
          setAlertInfo({
            visible: true,
            title: result.title,
            message: result.message,
            type: 'Error',
          });
        }
      }
    });
  };

  // Clean up location verifier on unmount
  React.useEffect(() => {
    return () => {
      locationVerifierRef.current = null;
      setIsLocationVerifierInitialized(false);
    };
  }, []);

  // Show loading while company details are being loaded
  if (!companyDetails) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Loading text="Loading company details..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GlobalStyle.container}>
       
          <ImageBackground
          style={GlobalStyle.headerImage}
          resizeMode="contain"
          imageStyle={{
            width: 232,
            marginTop: 0,
            height: 210,
            top: 34,
            alignSelf: 'flex-end',
            marginLeft: width - 232,
          }}
            source={require('../images/LOGO.png')}>
            
              <Text style={GlobalStyle.heading1}>Incoming</Text>
              <Text style={GlobalStyle.heading1}>Vehicle Entry</Text>
            
          </ImageBackground>
          

          
            <View style={styles.formContainer}>
              <View style={styles.formSection}>
              <Text style={styles.label}>Pass Information</Text>
             
                <CategoryTabs
                  categories={categoryOptions}
                  selectedCategory={formData.category}
                  onSelectCategory={handleCategorySelect}
                />
                
                {errors.category && (
                  <Text style={styles.errorText}>{errors.category}</Text>
                )}

                {formData.category && (
                  <>
                  <Text style={styles.label}>Vehicle Number</Text>
                    {formData.category === 'Raw material' ? (
                      <CustomPicker
                        value={formData.vehicleNumber}
                        options={vehicleOptions}
                        onValueChange={itemValue =>
                          handleFieldChange('vehicleNumber', itemValue)
                        }
                        placeholder="Select Vehicle Number"
                        error={errors.vehicleNumber}
                      />
                    ) : (
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={[
                            styles.textInput,
                            errors.vehicleNumber && styles.errorBorder,
                          ]}
                          placeholder="Enter Vehicle Number"
                          placeholderTextColor="#999"
                          value={formData.vehicleNumber}
                          onChangeText={text =>
                            handleFieldChange('vehicleNumber', text.toUpperCase())
                          }
                          autoCapitalize="characters"
                          maxLength={10}
                        />
                      </View>
                    )}
                    {errors.vehicleNumber && (
                      <Text style={styles.errorText}>
                        {errors.vehicleNumber}
                      </Text>
                    )}
                    {formData.category === 'E-GP03' && (
                      
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={[
                            styles.textInput,
                            errors.notes && styles.errorBorder,
                          ]}
                          placeholder="Purpose of Visit"
                          placeholderTextColor="#999"
                          value={formData.notes}
                          onChangeText={text =>
                            handleFieldChange('notes', text)
                          }
                          autoCapitalize="sentences"
                          maxLength={200}
                        />
                      </View>
                    )}

                    {errors.notes && (
                      <Text style={styles.errorText}>
                        {errors.notes}
                      </Text>
                    )}

                    {/* Only render Product and UOM for non-Visitors categories */}
                    {formData.category !== 'E-GP03' && (
                      <>
                      <Text style={styles.label}>Product</Text>
                        <CustomPicker
                          value={formData.product}
                          options={productOptions}
                          onValueChange={itemValue =>
                            handleFieldChange('product', itemValue)
                          }
                          placeholder="Select Product"
                          error={errors.product}
                        />
                         {errors.product && (
                    <Text style={styles.errorText}>{errors.product}</Text>
                  )}
                  <Text style={styles.label}>UOM</Text>
                        <CustomPicker
                          value={formData.uom}
                          options={uomOptions}
                          onValueChange={itemValue =>
                            handleFieldChange('uom', itemValue)
                          }
                          placeholder="Select Unit Of Measurement"
                          error={errors.uom}
                        />
                        {errors.uom && (
                    <Text style={styles.errorText}>{errors.uom}</Text>
                  )}
                      </>
                    )}

                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        onPress={handleCancel}
                        style={styles.cancelButton}
                        activeOpacity={0.8}>
                        <Text style={styles.cbuttonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleSubmit}
                        style={styles.submitButton}
                        activeOpacity={0.8}>
                        <Text style={styles.buttonText}>Submit</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>

        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: verticalScale(5),
            right: scale(20),
            backgroundColor: '#FFFFFF',
            borderRadius: scale(30),
            padding: scale(10),
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
          onPress={handleNav}
        >
          <Image
            source={require('../images/face-scan.png')}
            style={{
              width: scale(40),
              height: scale(40),
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
      
      <CustomAlertModal
        visible={alertInfo.visible}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
        onClose={() => {
          setAlertInfo({ ...alertInfo, visible: false });
        }}
      />
      {isLoading && <Loading text="Verifying location..." />}
    </SafeAreaView>
  );
};




// Update StyleSheet to ScaledSheet and modify style values
const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: '20@vs',
  },
  formContainer: {
    flex: 1,
    padding: '16@s',
  },
  formSection: {
    marginBottom: '20@vs',
  },
  label: {
    fontSize: '16@s',
    color: '#333',
    marginBottom: '5@vs',
    fontFamily: 'Cabin-Bold',
  },
  inputWrapper: {
    marginBottom: '15@vs',
  },
  textInput: {
    height: '50@vs',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: '10@s',
    paddingHorizontal: '15@s',
    fontSize: '16@s',
    backgroundColor: '#f9f9f9',
    color:'black',
    fontFamily: 'Cabin-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '20@vs',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: '15@s',
    borderRadius: '10@s',
    flex: 1,
    marginLeft: '8@s',
    alignItems: 'center',
  },
  modalOverlay1: {
    flex: 1,
    justifyContent: 'flex-end', // Align modal at the bottom
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dimmed background
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    padding: '15@s',
    borderRadius: '10@s',
    flex: 1,
    marginRight: '8@s',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: '16@s',
    fontFamily: 'Cabin-Bold',
  },
  cbuttonText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: '16@s',
    fontFamily: 'Cabin-Bold',
  },
  errorText: {
    color: 'red',
    fontSize: '14@s',
    marginBottom: '10@vs',
    marginTop: '-5@vs',
    fontFamily: 'Cabin-Medium',
  },
  tabContainer: {
    marginBottom: '15@vs',
  },
  tabScrollContent: {
    paddingVertical: '5@vs',
    paddingHorizontal: '5@s',
  },
  tab: {
    paddingHorizontal: '15@s',
    paddingVertical: '10@vs',
    borderRadius: '20@s',
    marginRight: '10@s',
    backgroundColor: '#f0f0f0',
  },
  selectedTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    fontSize: '14@s',
    color: '#333',
    fontFamily: 'Cabin-Bold',
  },
  selectedTabText: {
    color: '#FFF',
    
    fontFamily: 'Cabin-Bold',
  },
  pickerButton: {
    height: '50@vs',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: '10@s',
    paddingHorizontal: '15@s',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: '15@vs',
  },
  selectedPickerButton: {
    borderColor: '#007bff',
  },
  pickerButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: '16@s',
    fontFamily: 'Cabin-Regular',
  },
  selectedText: {
    color: '#333',
    fontSize: '16@s',
    fontFamily: 'Cabin-Bold',
  },
  errorBorder: {
    borderColor: 'red',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: width * 1,
    maxHeight: height * 0.8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: width * 0.05,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '15@s',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
eButton: {
    padding: '5@s',
  },
  closeButtonText: {
    fontSize: '22@s',
    color: '#999',
    fontFamily: 'Cabin-Bold',
  },
  modalScrollView: {
    padding: '15@s',
  },
  optionItem: {
    paddingVertical: '15@vs',
    paddingHorizontal: '15@s',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    backgroundColor: '#f0f8ff',
    fontFamily: 'Cabin-Bold',
  },
  optionText: {
    fontSize: '16@s',
    color: '#333',
    flex: 1,
    fontFamily: 'Cabin-Regular',
  },
  selectedOptionText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  checkmark: {
    color: '#007bff',
    fontSize: '20@s',
    fontWeight: 'bold',
  },
  noDataContainer: {
    padding: '20@s',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: '16@s',
    color: '#999',
    fontFamily: 'Cabin-Bold',
  },
 
  alertOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    width: '100%',
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  alertTitle: {
    fontSize: 20,

    color: '#333',
    fontFamily: 'Cabin-Medium',
  },

  alertMessage: {
    fontSize: 15,

    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Cabin-Regular',
  },

  animationContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    
  },

  WelcomeAnime: {
    width: 250,
    height: 250,
    margin: 'auto',
  },

  iconContainer: {
    marginRight: '10@s',
  },
});

export default VehicleEntry;