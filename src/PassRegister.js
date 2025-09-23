import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
import { Switch } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CodeField, Cursor } from 'react-native-confirmation-code-field';
import Loading from './components/common/Loading';
import LinearGradient from 'react-native-linear-gradient';
import { getStoredData } from './components/common/AsyncStorage';
import GlobalStyle from './components/common/GlobalStyle';



const PassRegister = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [isBioAuthOn, setIsBioAuthOn] = useState(false);
  const [comDetails, setComDetails] = useState([]);
  const [code, setCode] = useState('');
  const [codeC, setCodeC] = useState('');
  const [error, setError] = useState('');

  const codeFieldRef1 = useRef(null);
  const codeFieldRef2 = useRef(null);

  // Check if both codes are filled and match
  const isFormValid = code.length === 4 && codeC.length === 4 && code === codeC;

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    setError(''); // Clear error when user starts typing
    if (newCode.length === 4) {
      codeFieldRef2.current?.focus();
    }
  };

  useEffect(() => {
    const setcom = async () => {
      const companyinfo = await getStoredData("CompanyDetails");
      setComDetails(companyinfo[0]);
    };
    
    setcom();
  }, []);

  const handleCodeCChange = (newCodeC) => {
    setCodeC(newCodeC);
    setError(''); // Clear error when user starts typing
    if (newCodeC.length === 4) {
      if (code !== newCodeC) {
        setError('PIN codes do not match');
      } else {
        setError('');
      }
    }
  };

  const handleLogin = async () => {
    // Additional validation before proceeding
    if (!isFormValid) {
      setError('Please fill both PIN fields and ensure they match');
      return;
    }

    const trimmedCode = code.trim();
    const trimmedCodeC = codeC.trim();

    if (trimmedCode !== trimmedCodeC) {
      setCode('');
      setCodeC('');
      setError('PIN codes do not match');
    } else {
      try {
        await AsyncStorage.setItem('PassKey', JSON.stringify(trimmedCode));
        await AsyncStorage.setItem('BioAuth', JSON.stringify(isBioAuthOn));
        setCode('');
        setCodeC('');
        setError('');
        if (comDetails.Role === "2") {
          navigation.navigate('VehiclePassMain');
        } else if (comDetails.Role === "0" && comDetails.EmployeeId) {
          navigation.navigate('AttendanceMain');
        } else {
          navigation.navigate('AdminMain');
        }
      } catch (error) {
        console.error('error', error);
      }
    }
  };

  const openLink = (url) => {
    // Add your link opening logic here
    console.log('Opening link:', url);
  };

  return (
    <View style={styles.container}>
      {/* Top 50% - Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={require('./images/logoicon.png')} // Replace with your image path
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      
      {/* Bottom 50% - Card Container */}
      <View style={styles.cardContainer}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[GlobalStyle.heading7, styles.label]}>Enter 4 Digit Key</Text>
          <CodeField
            ref={codeFieldRef1}
            value={code}
            onChangeText={handleCodeChange}
            cellCount={4}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}>
                {symbol ? '●' : isFocused ? <Cursor /> : null}
              </Text>
            )}
          />
          <Text style={[GlobalStyle.heading7, styles.label]}>Confirm 4 Digit Key</Text>
          <CodeField
            ref={codeFieldRef2}
            value={codeC}
            onChangeText={handleCodeCChange}
            cellCount={4}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({ index, symbol, isFocused }) => (
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}>
                {symbol ? '●' : isFocused ? <Cursor /> : null}
              </Text>
            )}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.switchContainer}>
            <Text style={[GlobalStyle.heading7, styles.label]}>Enable FingerPrint Lock</Text>
            <Switch
              value={isBioAuthOn}
              color="black"
              onValueChange={(value) => setIsBioAuthOn(value)}
            />
          </View>
          <TouchableOpacity 
            style={[styles.gradientCard, !isFormValid && styles.disabledButton]} 
            onPress={handleLogin}
            disabled={!isFormValid}
          >
            <LinearGradient
              style={styles.gradientBackground}
              colors={isFormValid ? ['#4FAAF3', '#3E89EC'] : ['#CCCCCC', '#AAAAAA']}>
              <Text style={[GlobalStyle.heading5, styles.buttonLabel, !isFormValid && styles.disabledButtonText]}>
                Continue
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={styles.termsContainer}>
            <Text style={styles.agreeText}>
              By proceeding, you agree to SAZS APPS{' '}
            </Text>
            <TouchableOpacity onPress={() => openLink('https://www.sazsapps.com/src/pages/termsofService.html')}>
              <Text style={[GlobalStyle.heading8, styles.termsText]}>
                Terms & Conditions
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {loading && <Loading />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Top 50% - Image Container
  imageContainer: {
    flex: 0.4, // 50% of the screen
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: screenWidth * 0.05,
  },
  
  logoImage: {
    width: screenWidth * 0.6,
    height: screenHeight * 0.3,
    maxWidth: 300,
    maxHeight: 250,
  },
  
  // Bottom 50% - Card Container
  cardContainer: {
    flex: 0.6, // 50% of the screen
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: screenWidth * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'space-between',
    padding:40,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },

  label: {
    color: 'black',
    alignSelf: 'flex-start',
    marginBottom: screenHeight * 0.01,
    fontSize: screenWidth * 0.035,
  },

  codeFieldRoot: {
    marginVertical: screenHeight * 0.015,
    alignSelf: 'center',
    width: '100%',
  },

  cell: {
    width: screenWidth * 0.12,
    height: screenWidth * 0.12,
    lineHeight: screenWidth * 0.115,
    fontSize: screenWidth * 0.05,
    marginRight: screenWidth * 0.04,
    marginVertical: screenHeight * 0.01,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    textAlign: 'center',
    color: 'black',
  },

  focusCell: {
    borderColor: '#4FAAF3',
    backgroundColor: '#ffffff',
  },

  errorText: {
    color: '#e74c3c',
    fontSize: screenWidth * 0.035,
    marginVertical: screenHeight * 0.01,
    textAlign: 'center',
    fontWeight: '500',
  },

  switchContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: screenHeight * 0.02,
    paddingVertical: screenHeight * 0.01,
  },

  gradientCard: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: screenHeight * 0.02,
    shadowColor: '#4FAAF3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  disabledButton: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },

  gradientBackground: {
    paddingVertical: screenHeight * 0.018,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonLabel: {
    color: 'white',
    fontSize: screenWidth * 0.045,
    fontWeight: '600',
  },

  disabledButtonText: {
    color: '#FFFFFF',
    opacity: 0.7,
  },

  termsContainer: {
    alignItems: 'center',
    marginTop: screenHeight * 0.02,
  },

  agreeText: {
    color: '#666',
    fontSize: screenWidth * 0.032,
    textAlign: 'center',
    fontFamily: 'Cabin-Regular',
    lineHeight: screenWidth * 0.045,
  },

  termsText: {
    color: '#4FAAF3',
    textDecorationLine: 'underline',
    fontSize: screenWidth * 0.032,
    fontWeight: '500',
  },
});

export default PassRegister;
