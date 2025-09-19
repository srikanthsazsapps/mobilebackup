import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView, SafeAreaView, Animated,
  BackHandler, TouchableOpacity, Dimensions, ImageBackground,
  Pressable, Alert, Modal, Linking, TouchableWithoutFeedback, StatusBar
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import base64 from 'react-native-base64';
import { launchImageLibrary } from 'react-native-image-picker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faClose, faDollarSign, faEye, faEyeSlash, faGlobe,
  faKey, faUser, faUpload, faExclamationTriangle,
  faPhone, faEnvelope, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { getStoredData } from './components/common/AsyncStorage.js';
import InputBox from './components/common/inputBox.jsx';
import Loading from './components/common/Loading.js';
import { DataContext } from './components/common/DataContext.js';
import { LocalDataContext } from './components/common/LocalDataProvider.js';
import RemoteNotification from '../RemoteNotification.js';
import { useNavigation } from '@react-navigation/native';
import GlobalStyle from './components/common/GlobalStyle.js';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');

const Register = () => {
  // State variables
  const [step, setStep] = useState(1);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const { dailyData, setSelectedCompany } = useContext(DataContext);
  const { profileInfo, getprofile } = useContext(LocalDataContext);
  const navigation = useNavigation();

  // Animation references
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);
  
  // Animation constants and interpolations
  const headerMaxHeight = 240;
  const headerMinHeight = 120;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, headerMaxHeight - headerMinHeight],
    outputRange: [headerMaxHeight, headerMinHeight],
    extrapolate: 'clamp',
  });
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [0, 70],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const headerImageScale = scrollY.interpolate({
    inputRange: [0, 70],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [0, 70],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // State for form data
  const [userData, setUserData] = useState({
    GstNo: '', Webkey: '', PassKey: '', Username: '', Password: '',
    EmployeeKey: '', MobileAuthId: '', MobileAppId: '', UserId: '',
    Role: '', MobileNo: '', Designation: '', EmployeeId: '',
    Latitude: '', Longitude: '',
  });
  
  const [profileDetails, setProfileDetails] = useState({
    ProfilePhoto: null,
    CompanyName: null,
  });

  const [errors, setErrors] = useState({
    GstNo: false, Webkey: false, PassKey: false,
    Username: false, Password: false, CompanyName: false, EmployeeKey: false,
  });

  // Handle back button press
  useEffect(() => {
    const handleBackButtonClick = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      } else {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', onPress: () => null, style: 'cancel' },
            { text: 'OK', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false },
        );
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );

    return () => backHandler.remove();
  }, [navigation]);

  // Animation functions
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  const animateToNextStep = nextStep => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    });
  };

  // Helper functions
  const Reset = () => {
    setErrors({
      GstNo: false, Webkey: false, PassKey: false,
      Username: false, Password: false, CompanyName: false,
    });
    setProfileDetails({
      ProfilePhoto: null,
      CompanyName: null,
    });
    setUserData({
      GstNo: '', Webkey: '', PassKey: '', Username: '', Password: '',
      MobileAuthId: '', MobileAppId: '', UserId: '', Role: '',
      MobileNo: '', Designation: '', EmployeeId: '',
      Latitude: '', Longitude: ''
    });
    setStep(1);
  };

  const storeData = async newData => {
    try {
      const existingData = await getStoredData('CompanyDetails');
      const uniqueId = Date.now() + Math.floor(Math.random() * 10000);
      const dataWithId = { ...newData, id: uniqueId };
      
      let updatedData = existingData !== null && existingData.length > 0 
        ? [...existingData, dataWithId] 
        : [dataWithId];
        
      await AsyncStorage.setItem('SelectedCompany', JSON.stringify(uniqueId));
      await AsyncStorage.setItem('CompanyDetails', JSON.stringify(updatedData));
      setSelectedCompany(uniqueId);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  // Form submission handlers
  const handleStep1Submit = async () => {
    setLoginSuccess(true);
    const { Webkey, GstNo, PassKey } = userData;

    try {
      const apiUrl = `https://${Webkey}.sazss.in/Api/SazsApiAuth`;
      const response = await axios.get(apiUrl, {
        headers: { [PassKey]: GstNo },
      });

      if (response.status >= 200 && response.status < 300) {
        setTimeout(() => {
          animateToNextStep(2);
          setLoginSuccess(false);
        }, 2000);
      } else {
        setErrors({ ...errors, GstNo: true });
        setLoginSuccess(false);
      }
    } catch (error) {
      console.error('Error during API call', error);
      setErrors({ ...errors, Webkey: true });
      setLoginSuccess(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!isChecked) {
      setTermsModalVisible(true);
      return;
    }

    setLoginSuccess(true);
    const { Webkey, GstNo, Username, Password, EmployeeKey } = userData;
    const BasicUserKey = Username.length > 0 ? Username : EmployeeKey;
    const authHeader2 = `Basic ${base64.encode(`${BasicUserKey}:${Password}`)}`;
    const MobileAppId = `SAZS-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    try {
      const apiUrl = `https://${Webkey}.sazss.in/Api/SazsAppUserVal`;
      const response = await axios.post(
        apiUrl,
        {
          Username: Username,
          Password: Password,
          MobileAppId: MobileAppId,
          EKey: EmployeeKey
        },
        { headers: { Authorization: authHeader2 } }
      );

      if (response.data.UserId) {
        await AsyncStorage.setItem('userEmployeeKey', EmployeeKey);
        await AsyncStorage.setItem('userEmployeeId', response.data.EId);
        
        const updatedUserData = {
          ...userData,
          UserId: response.data.UserId,
          Role: response.data.Role || '0',
          MobileAuthId: response.data.MobileAuthId,
          MobileAppId: MobileAppId,
          Latitude: response.data.ELatitude,
          EmployeeKey: EmployeeKey,
          Longitude: response.data.ELongitude,
          EmployeeId: response.data.EId,
          Designation: response.data.EDesignation,
          MobileNo: response.data.EMobileNo,
        };
        
        
        setUserData(updatedUserData);
        storeData(updatedUserData);
        console.log(response.data,'hgfhfyjfyhj');
        
        setProfileDetails({
          ...profileDetails,
          CompanyName: response.data.EName
        });
        
        if (profileInfo?.CompanyName) {
          navigation.navigate('DashBoard');
          Reset();
          setLoginSuccess(false);
        } else {
          setTimeout(() => {
            animateToNextStep(3);
            setLoginSuccess(false);
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Error during API call', error);
      setErrors({ ...errors, Username: true, Password: true, EmployeeKey: true });
      setLoginSuccess(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!profileDetails?.CompanyName || profileDetails?.CompanyName.length === 0) {
      setErrors({ ...errors, CompanyName: true });
    } else {
      const existingKey = await getStoredData('PassKey');
      await AsyncStorage.setItem('ProfileInfo', JSON.stringify(profileDetails));
      getprofile();
      Reset();

      navigation.navigate(existingKey !== null ? 'DashBoard' : 'PassKey');
      setLoginSuccess(false);
    }
  };

  // Image related handlers
  const handleProfilePhotoUpload = () => {
    launchImageLibrary({ mediaType: 'photo', includeBase64: false }, response => {
      if (!response.didCancel && !response.error) {
        setProfileDetails({ ...profileDetails, ProfilePhoto: response.assets[0].uri });
      }
    });
  };
  
  const handleClearProfilePhoto = () => {
    setProfileDetails({ ...profileDetails, ProfilePhoto: null });
  };

  // Component rendering functions
  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Register an account for</Text>
      <Text style={styles.stepSubtitle}>Exclusive access</Text>
      <InputBox
        style={styles.inputbox}
        label="Gst No"
        right={<TextInput.Icon icon={() => <FontAwesomeIcon icon={faDollarSign} size={20} color="gray" style={{marginRight: 10}} />} />}
        value={userData.GstNo}
        onChangeText={text => setUserData({ ...userData, GstNo: text })}
        showErrorText={errors.GstNo}
        errorText="Enter valid GstNo"
      />
      <InputBox
        style={styles.inputbox}
        label="First Key"
        value={userData.Webkey}
        onChangeText={text => setUserData({ ...userData, Webkey: text })}
        right={<TextInput.Icon icon={() => <FontAwesomeIcon icon={faKey} size={20} color="gray" style={{marginRight: 10}} />} />}
        showErrorText={errors.Webkey}
        errorText="Enter valid key"
      />
      <InputBox
        style={styles.inputbox}
        label="Second Key"
        value={userData.PassKey}
        onChangeText={text => setUserData({ ...userData, PassKey: text })}
        right={<TextInput.Icon icon={() => <FontAwesomeIcon icon={faGlobe} size={20} color="gray" style={{marginRight: 10}} />} />}
        showErrorText={errors.PassKey}
        errorText="Enter valid Key"
      />
      <Button
        labelStyle={styles.buttonLabel}
        style={styles.loginbutton}
        mode="contained"
        onPress={handleStep1Submit}>
        Next
      </Button>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Enter your account using</Text>
      <Text style={styles.stepSubtitle}>Username or Valid Key</Text>
      <InputBox
        label="Username"
        style={styles.inputbox}
        value={userData.Username}
        onChangeText={text => setUserData({ ...userData, Username: text })}
        right={<TextInput.Icon icon={() => <FontAwesomeIcon icon={faUser} size={22} style={{marginRight: 10}} />} />}
        showErrorText={errors.Username}
        errorText="Enter valid Username"
      />
      <InputBox
        label="Password"
        value={userData.Password}
        onChangeText={text => setUserData({ ...userData, Password: text })}
        right={
          <TextInput.Icon
            icon={() => <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={22} style={{marginRight: 10}} />}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
        style={styles.inputbox}
        secureTextEntry={!showPassword}
        showErrorText={errors.Password}
        errorText="Enter valid Password"
      />
      <InputBox
        label="Employee Mobile Key"
        style={styles.inputbox}
        value={userData.EmployeeKey}
        onChangeText={text => setUserData({ ...userData, EmployeeKey: text })}
        right={<TextInput.Icon icon={() => <FontAwesomeIcon icon={faUser} size={22} style={{marginRight: 10}} />} />}
        showErrorText={errors.EmployeeKey}
        errorText="Enter valid Key"
      />
      <Pressable
        onPress={() => setIsChecked(!isChecked)}
        style={styles.checkboxContainer}>
        <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
          {isChecked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <TouchableOpacity onPress={() => openLink('https://sazsapps.com/')}>
          <Text style={[GlobalStyle.heading8, styles.termsText]}>
            I agree with terms & conditions
          </Text>
        </TouchableOpacity>
      </Pressable>
      <Button
        labelStyle={styles.buttonLabel}
        style={styles.loginbutton}
        mode="contained"
        onPress={handleStep2Submit}>
        {profileInfo?.CompanyName ? 'Register' : 'Next'}
      </Button>
    </>
  );

  const renderStep3 = () => (
    <>
      <TouchableOpacity
        style={styles.uploadBox}
        onPress={handleProfilePhotoUpload}>
        {profileDetails.ProfilePhoto ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: profileDetails.ProfilePhoto }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearProfilePhoto}>
              <FontAwesomeIcon icon={faClose} size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadContent}>
            <FontAwesomeIcon icon={faUpload} size={30} color="rgb(33,109,206)" />
            <Text style={styles.uploadText}>Upload File</Text>
          </View>
        )}
      </TouchableOpacity>

      <InputBox
        label="Enter Full Name"
        value={profileDetails?.CompanyName}
        style={styles.inputbox}
        onChangeText={text => setProfileDetails({ ...profileDetails, CompanyName: text })}
        showErrorText={errors.CompanyName}
        errorText="Enter valid Name"
      />

      <Button
        labelStyle={styles.buttonLabel}
        style={styles.loginbutton}
        mode="contained"
        onPress={handleStep3Submit}>
        Lets Go
      </Button>
    </>
  );

  // Modal components
  const TermsModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={termsModalVisible}
      onRequestClose={() => setTermsModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <FontAwesomeIcon icon={faExclamationTriangle} size={24} color="#FF6B6B" style={styles.modalIcon} />
            <Text style={[GlobalStyle.heading6, styles.modalTitle]}>Terms & Conditions</Text>
          </View>
          <View style={styles.modalBody}>
            <Text style={[GlobalStyle.heading7, styles.modalText]}>
              Please accept the terms and conditions to continue.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setTermsModalVisible(false)}>
            <Text style={styles.modalButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const ContactModal = () => (
    <Modal
      visible={contactModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setContactModalVisible(false)}>
      <TouchableWithoutFeedback onPress={() => setContactModalVisible(false)}>
        <View style={styles.contactModalOverlay}>
          <View style={styles.contactModalContent}>
            <View style={styles.contactDivider} />
            <Text style={[GlobalStyle.heading4, styles.contactModalTitle]}>Contact us</Text>
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => Linking.openURL('tel:+91766628000')}>
              <FontAwesomeIcon icon={faPhone} size={20} color="#3E89EC" style={{ left: 10 }} />
              <Text style={[GlobalStyle.heading6, styles.contactText]}>+91 76666 28000</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => Linking.openURL('mailto:info@sazsapps.com')}>
              <FontAwesomeIcon icon={faEnvelope} size={20} color="#3E89EC" style={{ left: 10 }} />
              <Text style={[GlobalStyle.heading6, styles.contactText]}>info@sazsapps.com</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactOption}
              onPress={() => openLink('https://www.sazsapps.com')}>
              <FontAwesomeIcon icon={faGlobe} size={20} color="#3E89EC" style={{ left: 10 }} />
              <Text style={[GlobalStyle.heading6, styles.contactText]}>www.sazsapps.com</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <RemoteNotification />
        
        {/* Animated Header */}
        <Animated.View style={[styles.header, { height: headerHeight }]}>
          {/* Animated Header Background */}
          <Animated.View 
            style={[styles.headerBackground, {
              opacity: headerBgOpacity,
              transform: [{ scale: headerImageScale }]
            }]}>
            <ImageBackground
              style={styles.headerBgImage}
              resizeMode="contain"
              source={require('../src/images/sazswater.png')}
              imageStyle={styles.imageStyle}
            />
          </Animated.View>

          {/* Header Content */}
          <View style={styles.headerContent}>
            <View style={styles.headerRow}>
              <Text style={[GlobalStyle.H1, styles.headerTitleSmall]}>
                Sazs Apps {"\n"}Private Limited
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Scrollable Content */}
        <Animated.ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewContent}
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >
          <View style={styles.contentContainer}>
            {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
            <Text style={styles.navigationcontact} onPress={() => setContactModalVisible(true)}>
              Contact Us
            </Text>
          </View>

          <View style={styles.bottomContainer}>
            <Text style={styles.bottomText}>SazsApps Private Limited</Text>
            <Text style={styles.bottomText}>App Version 1.0.0</Text>
          </View>
        </Animated.ScrollView>
      </Animated.View>
      {loginSuccess && <Loading />}
      <TermsModal />
      <ContactModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  body: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 30,
  },
  stepTitle: {
    fontSize: 22,
    fontFamily: 'Cabin-Bold',
    color: 'black',
    marginTop: 30,
  },
  stepSubtitle: {
    fontSize: 22,
    fontFamily: 'Cabin-Bold',
    color: 'black',
    marginTop: 4,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3E89EC',
    zIndex: 10,
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContent: {
    paddingTop: 10,
    paddingHorizontal: 20,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  headerTitle: {
    color: 'white',
    marginTop: 40,
    marginLeft: 10,
  },
  headerTitleSmall: {
    color: 'white',
    marginTop: 20,
    marginLeft: 10,
  },
  scrollViewContent: {
    paddingTop: 250,
    paddingBottom: 40,
  },
  inputbox: {
    marginTop: 30,
  },
  loginbutton: {
    marginBottom: 20,
    marginTop: 30,
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#3E89EC',
  },
  buttonLabel: {
    color: 'white',
    fontFamily: 'Cabin-Bold',
    fontSize: 20,
  },
  navigationcontact: {
    color: 'rgb(33,109,206)',
    fontFamily: 'Cabin-Bold',
    textAlign: 'right',
    fontSize: 16,
    marginRight: 5,
  },
  bottomContainer: {
    bottom: 20,
    marginTop: 90,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bottomText: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Cabin-Bold',
  },
  headerBgImage: {
    width: 232,
    marginTop: 35,
    height: 208,
    alignSelf: 'flex-end',
    marginRight: width - 360,
  },
  uploadBox: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    borderStyle: 'dashed',
    backgroundColor: '#edebeb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    marginTop: 20,
    overflow: 'hidden',
  },
  uploadContent: {
    alignItems: 'center',
  },
  uploadText: {
    color: 'rgb(33,109,206)',
    marginTop: 5,
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  clearButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    padding: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: '#FFF',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    color: 'black',
    textDecorationLine: 'underline',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  modalIcon: {
    marginRight: 10,
  },
  modalTitle: {
    color: '#333',
  },
  modalBody: {
    marginBottom: 20,
  },
  modalText: {
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#3E89EC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Cabin-Bold',
  },
  contactModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactModalContent: {
    width: scale(350),
    backgroundColor: '#fff',
    borderTopLeftRadius: scale(45),
    borderTopRightRadius: scale(45),
    padding: moderateScale(20),
    height: verticalScale(330),
    top: scale(200),
    alignItems: 'center',
  },
  contactModalTitle: {
    marginBottom: verticalScale(16),
    right: scale(100),
    marginTop: scale(20),
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f6ef',
    padding: moderateScale(16),
    borderRadius: scale(30),
    width: scale(320),
    marginVertical: verticalScale(5),
  },
  contactText: {
    fontWeight: 'normal',
    left: scale(70),
  },
  contactDivider: {
    width: scale(80),
    height: verticalScale(5),
    backgroundColor: '#e0e0e0',
    borderRadius: scale(2.5),
    marginBottom: verticalScale(10),
  },
});

export default Register;
