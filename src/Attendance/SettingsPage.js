import React, { useState, useEffect } from 'react';
import { Text, TouchableWithoutFeedback, KeyboardAvoidingView, Dimensions, StyleSheet, TouchableOpacity, TextInput, Modal, Linking, ScrollView, ImageBackground, View, Image, Alert, Platform, PermissionsAndroid, BackHandler, Keyboard, } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEllipsis,faUser, faPhone, faEnvelope, faGlobe, faEyeSlash, faEye, faAddressBook, faPencil, faFingerprint, } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalStyle from '../components/common/GlobalStyle';
import { useNavigation } from '@react-navigation/native';
import { Switch } from 'react-native-paper';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Orientation from 'react-native-orientation-locker';
import LottieView from 'lottie-react-native';

const SettingsPage = (route) => {
  const { width, height } = Dimensions.get('window');
  const watermarkIcon = require('../images/LogoWaterMark.png');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisiblePin, setModalVisiblePin] = useState(false);
  const [namePopVisible, setNamePopVisible] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [storedPin, setStoredPin] = useState('');
  const navigation = useNavigation();
  const [currentTab, setCurrentTab] = useState('AttendanceHome');
  const [isBioAuthOn, setIsBioAuthOn] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [oldPinError, setOldPinError] = useState('');
  const [newPinError, setNewPinError] = useState('');

  useEffect(() => {
    Orientation.lockToPortrait();
    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  useEffect(() => {
    if (modalVisiblePin) {
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setShowOldPin(false);
      setShowNewPin(false);
      setShowConfirmPin(false);
      setOldPinError('');
      setNewPinError('');
    }
  }, [modalVisiblePin]);

  useEffect(() => {
    if (successModalVisible) {
      const timer = setTimeout(() => {
        setSuccessModalVisible(false);
        setModalVisiblePin(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [successModalVisible]);

  const closeModalPin = () => {
    setModalVisiblePin(false);
  };

  const [profileInfo, setProfileInfo] = useState({
    ProfilePhoto: null,
    CompanyName: '',
  });
  const [employeeDetails, setEmployeeDetails] = useState({
    employeeKey: '',
    employeeId: '',
    mobileNo: '',
    designation: '',
    name: '',
    companyName: '',
  });

  useEffect(() => {
    const backAction = () => {
      navigation.navigate('AttendanceHome');
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const storedBioAuth = await AsyncStorage.getItem('BioAuth');
        setIsBioAuthOn(storedBioAuth ? JSON.parse(storedBioAuth) : false);
        const passKey = await AsyncStorage.getItem('PassKey');
        setStoredPin(passKey || '');
        console.log('Stored PIN retrieved:', passKey ? 'PIN exists' : 'No PIN found');

        const storedCompanyDetails = await AsyncStorage.getItem('CompanyDetails');
        const parsedDetails = storedCompanyDetails ? JSON.parse(storedCompanyDetails) : [];
        const storedProfile = await AsyncStorage.getItem('ProfileInfo');
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          setProfileInfo(parsedProfile);
        }
        if (parsedDetails.length === 1) {
          updateEmployeeDetails(parsedDetails[0]);
        } else if (parsedDetails.length > 1) {
          const lastCompany = parsedDetails[parsedDetails.length - 1];
          if (lastCompany) {
            updateEmployeeDetails(lastCompany);
          }
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);
  const updateEmployeeDetails = (company) => {
    setEmployeeDetails({
      employeeKey: company.EmployeeKey || '',
      employeeId: company.EmployeeId || '',
      mobileNo: company.MobileNo || '',
      designation: company.Designation || '',
      name: company.EName || company.Username || 'No Name',
      companyName: company.CompanyName || company.EName || 'No Company',
    });
  };

  const handleProfilePhotoUpload = () => {
    Alert.alert(
      'Upload Photo',
      'Choose photo upload method',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const requestAndroidCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "This app needs access to your camera to take profile photos",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const openCamera = async () => {
    if (Platform.OS === 'android') {
      const hasCameraPermission = await requestAndroidCameraPermission();
      if (!hasCameraPermission) {
        Alert.alert(
          'Permission Denied',
          'Camera permission is required to take photos',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
      includeBase64: false,
    };
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        console.log('Camera Error:', response.errorCode, response.errorMessage);
        Alert.alert('Error', 'Failed to open camera. Please try again.');
      } else if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        setProfileInfo({ ...profileInfo, ProfilePhoto: source.uri });
        saveProfilePhoto(source.uri);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled gallery');
      } else if (response.errorMessage) {
        console.log('Gallery Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        setProfileInfo({ ...profileInfo, ProfilePhoto: source.uri });
      }
    });
  };

  const saveProfilePhoto = async (photoUri) => {
    try {
      const updatedInfo = { ...profileInfo, ProfilePhoto: photoUri };
      await AsyncStorage.setItem('ProfileInfo', JSON.stringify(updatedInfo));
    } catch (error) {
      console.error('Error saving profile photo:', error);
    }
  };

  const handleCompanyNameChange = async (newName) => {
    try {
      const updatedInfo = { ...profileInfo, CompanyName: newName };
      setProfileInfo(updatedInfo);
      await AsyncStorage.setItem('ProfileInfo', JSON.stringify(updatedInfo));
      setNamePopVisible(false);
    } catch (error) {
      console.error('Error saving company name:', error);
    }
  };

  const handleBioSettings = async (value) => {
    try {
      await AsyncStorage.setItem('BioAuth', JSON.stringify(value));
      setIsBioAuthOn(value);
    } catch (error) {
      console.error('Error saving biometric settings:', error);
    }
  };

  const handleConfirm = async () => {
    // First, validate inputs
    console.log('PIN Change Request - Validation starting');

    // Reset error states
    setOldPinError('');
    setNewPinError('');

    // Check for empty fields
    if (!oldPin || !newPin || !confirmPin) {
      if (!oldPin) setOldPinError('Please enter your old PIN');
      if (!newPin || !confirmPin) setNewPinError('Please fill all PIN fields');
      return;
    }

    const storedPin = await AsyncStorage.getItem('PassKey');
    const parsedStoredPin = JSON.parse(storedPin);

    if (oldPin.trim() !== parsedStoredPin.trim()) {
      setOldPinError('Wrong PIN');
      return;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      setNewPinError('PINs don\'t match');
      return;
    }

    try {
      Keyboard.dismiss();

      await AsyncStorage.setItem('PassKey', JSON.stringify(newPin.trim()));
      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
        setModalVisiblePin(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving new PIN:', error);
      setNewPinError('Failed to save your new PIN');
    }
  };

  const openLink = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ImageBackground
        source={watermarkIcon}
        resizeMode="contain"
        imageStyle={styles.imageStyle}
        style={styles.headerBackground}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[GlobalStyle.heading1, styles.headerText]}>Profile</Text>
          </View>
        </View>
      </ImageBackground>

      <TouchableOpacity onPress={handleProfilePhotoUpload}>
        <View style={styles.profileImageContainer}>
          {profileInfo.ProfilePhoto ? (
            <Image
              source={{ uri: profileInfo.ProfilePhoto }}
              style={styles.profileImage}
            />
          ) : (
            <Image
              source={require('../images/add-user.png')}
              style={styles.profileImage}
            />
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.editIcon}
        onPress={() => setNamePopVisible(true)}
      >
        <FontAwesomeIcon icon={faPencil} size={18} color="#3E89EC" />
      </TouchableOpacity>

      <Text style={[GlobalStyle.heading4, styles.name]}>
        {profileInfo.CompanyName || employeeDetails.name}
      </Text>

      <Modal
        visible={namePopVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNamePopVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setNamePopVisible(false)}>
          <View style={styles.modal}>
            <View style={styles.modalContents}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.inputEdit, isFocused && styles.inputFocused]}
                  value={profileInfo.CompanyName}
                  onChangeText={(text) => setProfileInfo({ ...profileInfo, CompanyName: text })}
                  placeholder="Enter name"
                  placeholderTextColor="#888"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleCompanyNameChange(profileInfo.CompanyName)}
              >
                <Text style={[GlobalStyle.heading7, styles.saveButtonText]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.infoRow}>
        <View style={styles.infoBox}>
          <Text style={[GlobalStyle.Body, styles.label]}>EMPID</Text>
          <Text style={[GlobalStyle.H7, styles.value]}>{employeeDetails.employeeId}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={[GlobalStyle.Body, styles.label]}>Phone</Text>
          <Text style={[GlobalStyle.H7, styles.value]}>{employeeDetails.mobileNo}</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={[GlobalStyle.Body, styles.label]}>Role</Text>
          <Text style={[GlobalStyle.H7, styles.value]}>{employeeDetails.designation}</Text>
        </View>
      </View>

      {/* Biometric Settings Section */}
      <View style={styles.settingsSection}>
        <View style={styles.settingRow}>
          <FontAwesomeIcon icon={faFingerprint} size={25} color="#3E89EC" style={{ left: 10 }} />
          <Text style={[GlobalStyle.heading6, styles.settingLabel]}>Bio Metric</Text>
          <Switch
            value={isBioAuthOn}
            onValueChange={handleBioSettings}
          />
        </View>
      </View>

      {/* Change PIN Section */}
      <View style={styles.settingsSection}>
        <View style={styles.settingRow}>
          <FontAwesomeIcon icon={faEllipsis} size={25} color="#3E89EC" style={{ left: 10 }} />
          <Text style={[GlobalStyle.heading6, styles.settingLabel]}>Change PIN</Text>
          <Switch value={modalVisiblePin} onValueChange={() => setModalVisiblePin(true)} />
        </View>
      </View>

      {/* Contact Section */}
      <View style={styles.settingsSection}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.settingRow}>
          <FontAwesomeIcon icon={faAddressBook} size={25} color="#3E89EC" style={{ left: 10 }} />
          <Text style={[GlobalStyle.heading6, styles.ContactLabel]}>Contact</Text>
        </TouchableOpacity>
      </View>

      {/* PIN Change Modal */}
      <Modal
        visible={modalVisiblePin}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModalPin}
      >
        <TouchableWithoutFeedback onPress={closeModalPin}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlays}
          >
            <View style={styles.modalContainer}>
              <View style={styles.divider} />
              <Text style={[GlobalStyle.heading6, styles.modalText]}>Enter Old PIN</Text>
              <TextInput
                style={[styles.input, oldPinError ? styles.inputError : null]}
                value={oldPin}
                onChangeText={(text) => {
                  setOldPin(text);
                  setOldPinError('');
                }}
                secureTextEntry={!showOldPin}
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowOldPin(!showOldPin)}>
                <FontAwesomeIcon icon={showOldPin ? faEye : faEyeSlash} size={20} />
              </TouchableOpacity>
              {oldPinError ? <Text style={[GlobalStyle.heading8, styles.errorText]}>{oldPinError}</Text> : null}

              <Text style={[GlobalStyle.heading6, styles.modalText]}>Enter New PIN</Text>
              <TextInput
                style={[GlobalStyle.heading8, styles.input, newPinError ? styles.inputError : null]}
                value={newPin}
                onChangeText={(text) => {
                  setNewPin(text);
                  setNewPinError('');
                }}
                secureTextEntry={!showNewPin}
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowNewPin(!showNewPin)}>
                <FontAwesomeIcon icon={showNewPin ? faEye : faEyeSlash} size={20} />
              </TouchableOpacity>

              <Text style={[GlobalStyle.heading6, styles.modalTitle1]}>Re-Enter New PIN</Text>
              <TextInput
                style={[GlobalStyle.heading8, styles.input, newPinError ? styles.inputError : null]}
                value={confirmPin}
                onChangeText={(text) => {
                  setConfirmPin(text);
                  setNewPinError('');
                }}
                secureTextEntry={!showConfirmPin}
                keyboardType="numeric"
                maxLength={6}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPin(!showConfirmPin)}>
                <FontAwesomeIcon icon={showConfirmPin ? faEye : faEyeSlash} size={20} />
              </TouchableOpacity>
              {newPinError ? <Text style={[GlobalStyle.heading8, styles.errorText]}>{newPinError}</Text> : null}

              <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
                <Text style={[GlobalStyle.heading6, styles.confirmButtonText]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={successModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => {
          setSuccessModalVisible(false);
          setModalVisiblePin(false);
        }}>
          <View style={styles.successOverlay}>
            <View style={styles.successmodalContent}>
              <Text style={[GlobalStyle.heading6, styles.modalsText]}>Your PIN has been changed successfully!</Text>
              <LottieView style={styles.successlocationImage} source={require('../images/Animation3.json')} autoPlay={true} loop={true} />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Contact Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.divider} />
              <Text style={[GlobalStyle.heading4, styles.modalTitle]}>Contact us</Text>
              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => Linking.openURL('tel:+91766628000')}
              >
                <FontAwesomeIcon icon={faPhone} size={20} color="#3E89EC" style={{ left: 10 }} />
                <Text style={[GlobalStyle.heading6, styles.contactText]}>+91 76666 28000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => Linking.openURL('mailto:info@sazsapps.com')}
              >
                <FontAwesomeIcon icon={faEnvelope} size={20} color="#3E89EC" style={{ left: 10 }} />
                <Text style={[GlobalStyle.heading6, styles.contactText]}>info@sazsapps.com</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => openLink('https://www.sazsapps.com')}
              >
                <FontAwesomeIcon icon={faGlobe} size={20} color="#3E89EC" style={{ left: 10 }} />
                <Text style={[GlobalStyle.heading6, styles.contactText]}>www.sazsapps.com</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <View style={styles.footer}>
        <Text style={[GlobalStyle.H7, styles.footerText]}>Sazs Apps Private Limited</Text>
        <Text style={[GlobalStyle.heading8, styles.footerSubText]}>AppVersion 1.0</Text>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F3ED',
  },
  imageStyle: {
    width: scale(200),
    marginTop: verticalScale(17),
    height: verticalScale(170),
    alignSelf: 'flex-end',
    marginVertical: verticalScale(20),
    marginLeft: scale(150),
  },
  header: {
    paddingVertical: hp('5%'),
    flexDirection: 'row',
    bottom: verticalScale(3),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    marginLeft: scale(12),
    bottom: scale(22),
  },

  headerBackground: {
    height: verticalScale(180),
    backgroundColor: '#3E89EC',
    paddingTop: verticalScale(25),
    paddingHorizontal: scale(20),
  },
  profileImage: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    borderWidth: scale(3),
    borderColor: 'white',
    left: scale(120),
    right: scale(130),
    alignItems: 'center',
    bottom: verticalScale(50),
  },
  editIcon: {
    position: 'absolute',
    top: verticalScale(230),
    left: '50%',
    transform: [{ translateX: -scale(10) }],
    backgroundColor: '#fff',
    borderRadius: scale(15),
    padding: moderateScale(4),
    elevation: 5,
  },
  name: {
    bottom: verticalScale(40),
    alignSelf: 'center',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    bottom: verticalScale(30),
    justifyContent: 'space-around',
    width: scale(310),
    backgroundColor: 'white',
    borderRadius: scale(20),
    padding: moderateScale(20),
    left: scale(20),
  },
  infoBox: {
    paddingHorizontal: scale(10),
    right: scale(10),
    alignItems: 'center',
  },
  label: {
    color: 'black',
    fontWeight: '500',
  },
  value: {
    fontWeight: 'Cabin-Bold',
  },

  settingsSection: {
    marginTop: verticalScale(10),
    paddingHorizontal: scale(15),
    backgroundColor: 'white',
    borderRadius: scale(28),
    width: scale(310),
    left: scale(20),
    bottom: scale(22),
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  settingLabel: {
    left: scale(8),
  },
  ContactLabel: {
    right: scale(120),
  },
  footer: {
    alignItems: 'center',
    marginTop: verticalScale(3),
  },

  footerSubText: {
    color: '#888',
    marginTop: verticalScale(8)
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: scale(350),
    backgroundColor: '#fff',
    borderTopLeftRadius: scale(45),
    borderTopRightRadius: scale(45),
    padding: moderateScale(20),
    height: verticalScale(330),
    top: scale(200),
    alignItems: 'center',
  },
  modalTitle: {
    marginBottom: verticalScale(16),
    right: scale(100),
    marginTop: scale(20),
  },
  divider: {
    width: scale(120),
    height: verticalScale(3),
    backgroundColor: '#696969',
    marginBottom: verticalScale(16),
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
  icon: {
    fontSize: 20,
    marginRight: scale(10),
  },
  contactText: {
    fontWeight: 'normal',
    left: scale(70),
  },
  //pin
  modalOverlays: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: scale(45),
    borderTopRightRadius: scale(45),
    padding: moderateScale(20),
    alignItems: 'center',
  },
  input: {
    width: scale(310),
    backgroundColor: '#F6F3ED',
    borderRadius: scale(28),
    padding: moderateScale(9),
    marginBottom: scale(-24),
    paddingHorizontal: moderateScale(25),
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'gray',
    color: 'black'
  },

  confirmButton: {
    backgroundColor: '#3E89EC',
    padding: moderateScale(8),
    borderRadius: scale(12),
    alignItems: 'center',
    marginTop: scale(20),
    width: scale(220),
    height: verticalScale(40),
  },
  modalTitle1: {
    fontWeight: 'normal',
    marginBottom: scale(12),
    right: scale(78),
    marginTop: scale(12),
    color: 'black',
  },
  modalText: {
    fontWeight: 'normal',
    marginBottom: verticalScale(12),
    right: scale(90),
    marginTop: scale(12),
    color: 'black',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    justifyContent: 'center',
    alignItems: 'center',
    left: 15,
    top: 3,
  },

  eyeButton: {
    bottom: scale(12),
    left: scale(20),
    marginLeft: scale(200),
    bottom: scale(8),
  },
  tabStyle: {
    backgroundColor: '#3E89EC',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    borderTopEndRadius: scale(30),
    borderTopStartRadius: scale(30),
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 10,
    height: verticalScale(45),
    top: verticalScale(40),
  },

  modal: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  modalContents: {
    backgroundColor: '#fff',
    padding: 40,
    alignItems: 'center',
    width: '90%',
    height: 180,
    borderRadius: 20,
  },
  modalTitles: {
    fontWeight: 'bold',
    marginBottom: 16,
    right: 80,
    marginTop: 20,
    color: 'black',
  },
  inputContainer: {
    width: 310,
    position: 'relative',
  },
  inputEdit: {
    width: '100%',
    fontSize: 16,
    color: 'black',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
  },

  confirmButton: {
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
    width: 100,
    height: 48,
    backgroundColor: '#3E89EC',
    marginTop: hp('2%'),
    backgroundColor: '#4A90E2',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('2%'),
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    justifyContent: 'center',
    alignItems: 'center',
    left: 5,
    top: 4,
  },

  successOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  successmodalContent: {
    backgroundColor: 'white',
    padding: scale(20),
    borderTopLeftRadius: moderateScale(40),
    borderTopRightRadius: moderateScale(40),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
    paddingHorizontal: scale(20),
    height: 'auto',
    minHeight: verticalScale(300),
    maxHeight: '70%',
  },

  modalsTitle: {
    marginTop: verticalScale(20),
  },
  modalsText: {
    textAlign: 'center',
    marginTop: verticalScale(30),
    color: 'green',
  },
  modalsErrorText: {
    textAlign: 'center',
    marginTop: verticalScale(30),
    color: 'red',
  },
  locationImage: {
    width: 130,
    height: 130,
    marginTop: 30,
    alignSelf: 'center',
  },
  successlocationImage: {
    width: 160,
    height: 160,
    marginTop: 35,
    left: 3,
    alignSelf: 'center',
  },

  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'left',
    width: '100%',
    marginLeft: scale(30)
  },

});
export default SettingsPage;