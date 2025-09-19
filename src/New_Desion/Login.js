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
  faPhone, faEnvelope, faArrowLeft,
  faSmile
} from '@fortawesome/free-solid-svg-icons';
import { getStoredData } from '../components/common/AsyncStorage.js';
import InputBox from '../components/common/inputBox.jsx';
import Loading from '../components/common/Loading.js';
import { DataContext } from '../components/common/DataContext.js';
import { LocalDataContext } from '../components/common/LocalDataProvider.js';
import RemoteNotification from '../../RemoteNotification.js';
import { useNavigation } from '@react-navigation/native';
import GlobalStyle from '../components/common/GlobalStyle.js';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const { width, height } = Dimensions.get('window');

const Login = () => {
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
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
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
      <Text style={styles.stepTitle}>Login to your account</Text>
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
      <Text style={styles.stepTitle}>Enter your Username or Valid Key</Text>
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
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: '#696969' }} />
        <Text style={[GlobalStyle.H12, { marginHorizontal: 10, color: '#000' }]}>or login with</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: '#696969' }} />
      </View>
      
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
        {profileInfo?.CompanyName ? 'Login' : 'Next'}
      </Button>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Upload Profile and Name</Text>
      <TouchableOpacity
        style={[
          styles.uploadBox,
          profileDetails.ProfilePhoto && styles.uploadBoxWithImage
        ]}
        onPress={handleProfilePhotoUpload}>
        {profileDetails.ProfilePhoto ? (
          <View style={styles.profileImageContainer}>
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
            <Image 
              source={require('../images/faces.png')} 
              style={{width: 80, height: 80, }}
            />
            {/* Plus symbol overlay */}
            <View style={styles.plusSymbol}>
              <Text style={styles.plusText}>+</Text>
            </View>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2d2d2d" />
      <RemoteNotification />

      {/* Top 50% - Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../images/logoicon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      {/* Bottom 50% - Content Container */}
      <View style={styles.contentContainer}>
        <Animated.View style={[{ opacity: fadeAnim }, styles.formContainer]}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
          </ScrollView>

          {/* Terms and Conditions at bottom */}
          <View style={styles.termsContainer}>
            <Text style={styles.agreeText}>
              By proceeding, you agree to SAZS APPS{' '}
            </Text>
            <TouchableOpacity onPress={() => openLink('https://www.sazsapps.com/src/pages/termsofService.html')}>
              <Text style={[GlobalStyle.heading8, styles.linkText]}>
                Terms & Conditions
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {loginSuccess && <Loading />}
      <TermsModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  // Top 50% - Image Container
  imageContainer: {
    flex: 0.4, // 50% of the screen
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width * 0.05,
  },

  logoImage: {
    width: Math.min(width * 0.7, height * 0.3),
    height: Math.min(width * 0.35, height * 0.15),
  },

  // Bottom 50% - Content Container
  contentContainer: {
    flex: 0.6, // 50% of the screen
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    justifyContent: 'space-between',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  stepTitle: {
    fontSize: 22,
    fontFamily: 'Cabin-Bold',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
  },

  inputbox: {
    marginTop: 20,
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

  uploadBox: {
    width: '45%',
    height: 140,
    borderRadius: 200,
    borderStyle: 'dashed',
    backgroundColor: '#edebeb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    marginTop: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    position: 'relative',
  },

  // New style for when image is uploaded
  uploadBoxWithImage: {
    borderColor: '#4CAF50', // Green color when image is uploaded
    borderStyle: 'solid',
    borderWidth: 3,
  },

  uploadContent: {
    alignItems: 'center',
    position: 'relative',
  },

  // Plus symbol styles
  plusSymbol: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#3E89EC',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },

  plusText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },

  // Profile image container (different from top imageContainer)
  profileImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
    overflow: 'hidden',
  },

  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
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

  // Terms and Conditions at bottom
  termsContainer: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 10,
  },

  agreeText: {
    color: 'gray',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Cabin-Regular',
  },

  linkText: {
    color: 'rgb(33,109,206)',
    fontWeight: 'bold',
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
});

export default Login;
