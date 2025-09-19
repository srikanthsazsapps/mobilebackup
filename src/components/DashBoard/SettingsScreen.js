import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
  Linking, 
} from 'react-native';
import { Button, Modal, Text } from 'react-native-paper';
import React, { useEffect, useState, useContext } from 'react';
import { getStoredData } from '../common/AsyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import {
  faArrowLeft,
  faCaretDown,
  faCaretUp,
  faCodeBranch,
  faEllipsis,
  faFingerprint,
  faPhone,
  faTrash,
  faPencil
} from '@fortawesome/free-solid-svg-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { LocalDataContext } from '../common/LocalDataProvider';
import InputBox from '../common/inputBox';
import { DataContext } from '../common/DataContext';
import LinearGradient from 'react-native-linear-gradient';
import EditIcon from '../../images/pencil.svg';
import PlusIcon from '../../images/plus.svg';
import PinChangeModal from './PinChangeModal';
import SwitchContainer from './SettingsCards';
import { Switch } from 'react-native-paper';
import ProfileEdit from '../../images/profile.svg';

const { width, height } = Dimensions.get('window');

const SettingsScreen = ({ navigation }) => {
  const [isBioAuthOn, setIsBioAuthOn] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pin, setPin] = useState('');
  const [comList, setComList] = useState([]);
  const [brachesVisible, setBrachesVisible] = useState(false);
  const [namePopVisible, setNamePopVisible] = useState(false);
  const { selectedCompany, setSelectedCompany, RefreshData } =
    useContext(DataContext);

  const {
    profileInfo,
    ChangeCompanyName,
    ChangeCompanyLogo,
    handleProfilePhotoUpload,
    handleClearProfilePhoto,
    setProfileInfo,
  } = useContext(LocalDataContext);

  const handleEdit = () => {
    handleProfilePhotoUpload();
  };

  const handlePinChange = async (newPin) => {
    setPin(newPin);
    await AsyncStorage.setItem('PassKey', JSON.stringify(newPin));
  };

  useEffect(() => {
    const fetchData = async () => {
      const BioAuth = await getStoredData('BioAuth');
      const PassKey = await getStoredData('PassKey');
      const localComList = await getStoredData('CompanyDetails');
      setComList(localComList);
      setPin(PassKey);
      setIsBioAuthOn(BioAuth);
    };
    fetchData();
  }, []);

  const handleBioSettings = async (value) => {
    setIsBioAuthOn(value);
    AsyncStorage.setItem('BioAuth', JSON.stringify(value));
  };

  const handleClear = () => {
    Alert.alert(
      'Delete Profile Picture',
      'Are you sure you want to DELETE?',
      [
        { text: 'Cancel', onPress: () => null, style: 'cancel' },
        { text: 'OK', onPress: () => handleClearProfilePhoto() },
      ],
      { cancelable: false },
    );
  };

  const handleDeleteCompany = (id) => {
    Alert.alert(
      'Delete Branch',
      'Are you sure you want to DELETE?',
      [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            const updatedList = comList.filter((val) => val.id !== id);
            setComList(updatedList);
            await AsyncStorage.setItem(
              'CompanyDetails',
              JSON.stringify(updatedList),
            );
            if (selectedCompany === id) {
              setSelectedCompany(0);
              RefreshData();
            }
            if (updatedList.length === 0) {
              navigation.navigate('Register');
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

  const handleSupportCall = () => {
    const phoneNumber = '7666628000'; 

    Alert.alert(
      'Call Support',
      `Do you want to call ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${phoneNumber}`) },
      ],
      { cancelable: true },
    );
  };

  return (
    <>
      <ScrollView style={styles.ScrollView}>
        <ImageBackground
          style={styles.headerBackground}
          resizeMode="contain"
          imageStyle={styles.imageStyle}
          source={require('../../images/sazswater.png')}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <FontAwesomeIcon size={20} color="white" icon={faArrowLeft} />
            </TouchableOpacity>
            <Text style={styles.headerText}>Settings</Text>
          </View>
          <View style={{ marginTop: 10, flex: 1, flexDirection: 'row' }}>
            <View>
              <TouchableOpacity onPress={handleEdit}>
                <View
                  style={{
                    borderColor: 'white',
                    borderStyle: 'dashed',
                    borderWidth: 1,
                    backgroundColor: '#F6F3ED',
                    width: 140,
                    height: 140,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 100,
                  }}>
                  {profileInfo?.ProfilePhoto ? (
                    <Image
                      source={{ uri: profileInfo.ProfilePhoto }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <ProfileEdit width={100} height={100} fill="black" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flex: 1,
                marginTop: 10,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
                marginLeft: 25,
                justifyContent: 'flex-start',
              }}>
              <Text
                style={{
                  fontSize: 25,
                  color: 'white',
                  fontFamily: 'Cabin-Bold',
                }}>
                {profileInfo?.CompanyName || ''}
              </Text>
              <TouchableOpacity
                style={styles.EditIcon}
                onPress={() => setNamePopVisible(true)}>
                          <FontAwesomeIcon icon={faPencil} size={18} color="#3E89EC"  />
                  
                {/* <EditIcon width={15} height={15} style={styles.pencilIcon}fill="white" /> */}
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        <SwitchContainer
          onPress={() => setBrachesVisible(!brachesVisible)}
          icon={
            <FontAwesomeIcon icon={faCodeBranch} color="#3E89EC" size={18} />
          }
          title={'Branches'}
          actionicon={
            brachesVisible ? (
              <FontAwesomeIcon icon={faCaretUp} color="#3E89EC" size={18} />
            ) : (
              <FontAwesomeIcon icon={faCaretDown} color="#3E89EC" size={18} />
            )
          }>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <PlusIcon width={20} height={20} fill="#3E89EC" />
          </TouchableOpacity>
        </SwitchContainer>
        {brachesVisible &&
          comList.map((company, index) => (
            <LinearGradient
              key={index}
              colors={['#3E89EC', '#5FA9FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientCard}>
              <View style={styles.companyItem}>
                <Text style={styles.companyIndex}>{index + 1}.</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.companyName}>
                    {company.Webkey || 'No Name'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={{ marginRight: 10 }}
                  onPress={() => handleDeleteCompany(company.id)}>
                  <FontAwesomeIcon icon={faTrash} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          ))}

        <SwitchContainer
          title={'FingerPrint Lock'}
          icon={
            <FontAwesomeIcon icon={faFingerprint} color="#3E89EC" size={20} />
          }>
          <Switch
            style={{ marginLeft: 20 }}
            value={isBioAuthOn}
            color="#3E89EC"
            onValueChange={(value) => handleBioSettings(!isBioAuthOn)}
          />
        </SwitchContainer>
        <SwitchContainer
          title={'Pin'}
          icon={
            <FontAwesomeIcon icon={faEllipsis} color="#3E89EC" size={20} />
          }>
          <TouchableOpacity onPress={() => setVisible(true)}>
            <EditIcon width={18} height={18} fill="#3E89EC" />
          </TouchableOpacity>
        </SwitchContainer>
        <SwitchContainer
          title={'Support'}
          icon={
            <FontAwesomeIcon icon={faPhone} color="#3E89EC" size={18} />
          }
          onPress={handleSupportCall}
        />
      </ScrollView>

      <Modal
        visible={namePopVisible}
        onDismiss={() => setNamePopVisible(false)}
        dismissableBackButton={true}
        contentContainerStyle={{
          height: 200,
          backgroundColor: 'white',
          padding: 20,
          marginHorizontal: 10,
          borderRadius: 30,
        }}>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <InputBox
            label="Company Name"
            value={profileInfo?.CompanyName}
            onChangeText={(text) =>
              setProfileInfo({ ...profileInfo, CompanyName: text })
            }
          />
          <Button
            onPress={() => {
              ChangeCompanyName(profileInfo.CompanyName);
              setNamePopVisible(false);
            }}
            mode="contained"
            labelStyle={styles.buttonLabel}
            style={[
              styles.loginbutton,
              { width: 100, alignSelf: 'center', marginTop: 30 },
            ]}>
            Save
          </Button>
        </View>
      </Modal>

      <PinChangeModal
        visible={visible}
        onClose={() => setVisible(false)}
        currentPin={pin}
        onPinChange={handlePinChange}
      />
      <View style={styles.bottomContainer}>
        <Text style={styles.bottomText}>SazsApps Private Limited</Text>
        <Text style={styles.bottomText}>App Version 1.0.0</Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  ScrollView: {
    backgroundColor: '#F6F3ED',
  },
  headerBackground: {
    height: 241,
    backgroundColor: '#3E89EC',
    paddingTop: 35,
    paddingHorizontal: 20,
  },
  imageStyle: {
    width: 232,
    marginTop: 33,
    height: 208,
    alignSelf: 'flex-end',
    marginLeft: width - 232,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
  },
  headerText: {
    fontSize: 22,
    marginLeft: 20,
    color: 'white',
    fontFamily: 'Cabin-Bold',
  },
  loginbutton: {
    marginBottom: 20,
    marginTop: 20,
    borderRadius: 30,
    backgroundColor: '#3E89EC',
  },
  buttonLabel: {
    color: 'white',
    fontSize: 18,
  },
  containerStyle: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 30,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  iconBackground: {
    marginHorizontal: 10,
  },
  gradientCard: {
    marginBottom: 10,
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  companyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyIndex: {
    fontSize: 16,
    marginHorizontal: 10,
    fontFamily: 'Cabin-Bold',
    color: 'white',
  },
  companyName: {
    fontSize: 16,
    color: 'white',
  },
  input: {
    marginVertical: 10,
  },
  profileImage: {
    width: 140,
    borderRadius: 100,
    height: 140,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  bottomText: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Cabin-Bold',
  },
  EditIcon: {
    position: 'absolute',
    top: '110%', 
    right: '140%',
    transform: [
      { translateX: -scale(20) }, 
      { translateY: verticalScale(-20) } 
    ],
    backgroundColor: '#fff',
    borderRadius: moderateScale(15),
    padding: moderateScale(4),
    elevation: 5,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
  
});

export default SettingsScreen;