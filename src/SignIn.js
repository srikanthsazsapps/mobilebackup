import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Dimensions,
} from 'react-native';
import {Button} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './components/common/Loading';
import TouchID from 'react-native-touch-id';
import {CodeField, Cursor} from 'react-native-confirmation-code-field';
import {getStoredData} from './components/common/AsyncStorage';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faFingerprint} from '@fortawesome/free-solid-svg-icons';
import AppHeader from './components/AppHeader';
import {ScrollView} from 'react-native-gesture-handler';

const {width, height} = Dimensions.get('window');

const SignIn = ({navigation}) => {
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState('');
  const [codeC, setCodeC] = useState('');
  const [error, setError] = useState('');
  const [mainDash,setMainDash]=useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const localData = await getStoredData('CompanyDetails');
        const selectedData = await getStoredData('SelectedCompany');
        const BioAuth = await getStoredData('BioAuth');
        const PassKey = await getStoredData('PassKey');
        setKey(PassKey);
      
        if (!localData || (localData.length === 0) | !PassKey) {
          AsyncStorage.clear();
          navigation.navigate('AccountSelector');
        } else {
          setLoading(false);
          if (BioAuth) {
            handleBiometric();
          }
        }
        
        if(localData){
          console.log(localData,'1232');
          
          if(localData[0].Role == "2"){
            setMainDash("VehiclePassMain");
          }else if(localData[0].Role == "0" && localData[0].EmployeeId.length > 0){
            setMainDash("AttendanceMain");
          }else{
            setMainDash("AdminMain");         
          }
        }
      } catch (error) {
        console.error('Error fetching stored data: ', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleBackButtonClick = () => {
      if (navigation.canGoBack()) {
        BackHandler.exitApp();
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );

    return () => {
      backHandler.remove();
    };
  }, [navigation]);

  const optionalConfigObject = {
    title: 'Authentication Required',
    imageColor: '#e00606',
    imageErrorColor: '#ff0000',
    sensorDescription: 'Touch sensor',
    sensorErrorDescription: 'Failed',
    cancelText: 'Cancel',
    fallbackLabel: 'Show Passcode',
    unifiedErrors: false,
    passcodeFallback: false,
  };

  const handleCodeCChange = newCode => {
    setCodeC(newCode);
    setError('');
    if (newCode.length === 4) {
      handleSignIn(newCode);
    }
  };

  const handleBiometric = async () => {
    try {
      const biometryType = await TouchID.isSupported(optionalConfigObject);
      const result = await TouchID.authenticate('Authenticate with Touch ID');
      navigation.navigate(mainDash);
    } catch (error) {
      console.log('Authentication failed:', error);
    }
  };

  const handleSignIn = newCode => {
    setLoading(true);
    const trimmedCodeC = newCode;
    const trimmedKey = key;

    setTimeout(() => {
      if (Number(trimmedCodeC) === Number(trimmedKey)) {
        setError('');
        navigation.navigate(mainDash);
        setLoading(false);
      } else {
        setCodeC('');
        setError('Verification failed. Please try again.');
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.ScrollView}>
        <AppHeader line1={'Sazs Apps'} line2={'Private Limited'} />
        <View style={styles.content}>
          <Text style={styles.label}>Enter App Passcode</Text>
          <CodeField
            value={codeC}
            onChangeText={handleCodeCChange}
            cellCount={4}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({index, symbol, isFocused}) => (
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}>
                {symbol ? '●' : isFocused ? <Cursor /> : null}
              </Text>
            )}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={styles.fingerprintText}>Login With FingerPrint</Text>

          <TouchableOpacity
            style={styles.fingerprintButton}
            onPress={handleBiometric}>
            <FontAwesomeIcon icon={faFingerprint} size={40} color="#3E89EC" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.bottomContainer}>
        <Text style={styles.bottomText}>SazsApps Private Limited</Text>
        <Text style={styles.bottomText}>App Version 1.0.0</Text>
      </View>
      {loading && <Loading />}
    </View>
  );
};
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ScrollView: {
    height: height - 80,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    color: 'black',
    fontFamily: 'Cabin-Bold',
    alignSelf: 'flex-start',
    fontSize: 18,
  },
  codeFieldRoot: {
    marginLeft: 10,
    marginVertical: 20,
  },
  cell: {
    width: 50,
    height: 40,
    lineHeight: 37,
    fontSize: 24,
    marginRight: 20,
    marginVertical: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderBottomColor: 'black',
    textAlign: 'center',
    color: 'black',
  },
  focusCell: {
    borderColor: 'blue',
  },
  fingerprintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    // backgroundColor: '#FFC107',
    borderRadius: 10,
  },
  fingerprintText: {
    fontFamily: 'Cabin-Bold',
    color: '#3E89EC',
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginVertical: 10,
  },
  bottomContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  bottomText: {
    fontSize: 14,
    color: 'gray',
    fontFamily: 'Cabin-Bold',
  },
});

export default SignIn;
