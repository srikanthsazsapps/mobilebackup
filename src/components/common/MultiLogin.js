import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  BackHandler, TouchableOpacity, Alert, Animated
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import base64 from 'react-native-base64';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faUser, faKey, faEye, faEyeSlash, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import { getStoredData } from './AsyncStorage.js';
import InputBox from './inputBox.jsx';
import Loading from './Loading.js';
import AppHeader from '../AppHeader.js';
import GlobalStyle from './GlobalStyle.js';

const MultiLogin = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState(route.params?.loginType);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    employeeKey: ''
  });

  const [errors, setErrors] = useState({
    username: false,
    password: false,
    employeeKey: false
  });

  const [companyInfo, setCompanyInfo] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const getCompanyInfo = async () => {
      const info = await getStoredData('CompanyDetails');
      if (info && info.length > 0) {
        setCompanyInfo(info[0]);
      } else {
        // If no company info, redirect to register
        navigation.navigate('Register');
      }
    };
    getCompanyInfo();
  }, []);

  useEffect(() => {
    const handleBackButtonClick = () => {
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );

    return () => backHandler.remove();
  }, [navigation]);

  const getLoginTypeConfig = () => {
    const configs = {
      owner: {
        title: 'Owner Dashboard Login',
        subtitle: 'Enter your admin credentials',
        fields: ['username', 'password'],
        dashboardRoute: 'AdminMain'
      },
      self_attendance: {
        title: 'Self Attendance Login',
        subtitle: 'Enter your employee key',
        fields: ['employeeKey'],
        dashboardRoute: 'AttendanceMain'
      },
      security_attendance: {
        title: 'Security Attendance Login',
        subtitle: 'Enter your security credentials',
        fields: ['username', 'password', 'employeeKey'],
        dashboardRoute: 'VehiclePassMain'
      }
    };
    return configs[loginType] || configs.owner;
  };

  const validateForm = () => {
    const config = getLoginTypeConfig();
    const newErrors = {};
    let isValid = true;

    config.fields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = true;
        isValid = false;
      } else {
        newErrors[field] = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm() || !companyInfo) return;

    setLoading(true);
    const config = getLoginTypeConfig();

    try {
      let apiResponse = null;
      const { Webkey, GstNo } = companyInfo;
      const MobileAppId = `SAZS-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

      if (loginType === 'self_attendance') {
        // Self attendance only needs employee key validation
        const authHeader = `Basic ${base64.encode(`${formData.employeeKey}:${formData.employeeKey}`)}`;
        const apiUrl = `https://${Webkey}.sazss.in/Api/SazsAppUserVal`;
        
        apiResponse = await axios.post(
          apiUrl,
          {
            Username: '',
            Password: '',
            MobileAppId: MobileAppId,
            EKey: formData.employeeKey
          },
          { headers: { Authorization: authHeader } }
        );
      } else {
        // Owner and Security need username/password validation
        const BasicUserKey = formData.username;
        const authHeader = `Basic ${base64.encode(`${BasicUserKey}:${formData.password}`)}`;
        const apiUrl = `https://${Webkey}.sazss.in/Api/SazsAppUserVal`;
        
        apiResponse = await axios.post(
          apiUrl,
          {
            Username: formData.username,
            Password: formData.password,
            MobileAppId: MobileAppId,
            EKey: formData.employeeKey || ''
          },
          { headers: { Authorization: authHeader } }
        );
      }

      if (apiResponse.data.UserId) {
        // Store current login data
        const loginData = {
          ...companyInfo,
          loginType,
          UserId: apiResponse.data.UserId,
          Role: apiResponse.data.Role || '0',
          MobileAuthId: apiResponse.data.MobileAuthId,
          MobileAppId: MobileAppId,
          EmployeeId: apiResponse.data.EId,
          Designation: apiResponse.data.EDesignation,
          MobileNo: apiResponse.data.EMobileNo,
          EName: apiResponse.data.EName,
          Latitude: apiResponse.data.ELatitude,
          Longitude: apiResponse.data.ELongitude,
          username: formData.username,
          employeeKey: formData.employeeKey
        };

        await AsyncStorage.setItem('CurrentUserData', JSON.stringify(loginData));
        await AsyncStorage.setItem('CurrentUserType', loginType);

        // Check if passcode exists
        const existingPasscode = await getStoredData('PassKey');
        
        if (existingPasscode) {
          // Navigate directly to dashboard
          navigation.navigate(config.dashboardRoute);
        } else {
          // Navigate to passcode setup
          navigation.navigate('PassRegister', { 
            dashboardRoute: config.dashboardRoute,
            isFirstTime: true 
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'Invalid credentials. Please try again.');
      setErrors({
        username: true,
        password: true,
        employeeKey: true
      });
    } finally {
      setLoading(false);
    }
  };

  const config = getLoginTypeConfig();

  const renderFormFields = () => {
    return (
      <>
        {config.fields.includes('username') && (
          <InputBox
            label="Username"
            style={styles.inputBox}
            value={formData.username}
            onChangeText={text => setFormData({ ...formData, username: text })}
            right={<TextInput.Icon icon={() => <FontAwesomeIcon icon={faUser} size={20} color="gray" style={{ marginRight: 10 }} />} />}
            showErrorText={errors.username}
            errorText="Enter valid username"
          />
        )}

        {config.fields.includes('password') && (
          <InputBox
            label="Password"
            style={styles.inputBox}
            value={formData.password}
            onChangeText={text => setFormData({ ...formData, password: text })}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={() => <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={20} color="gray" style={{ marginRight: 10 }} />}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            showErrorText={errors.password}
            errorText="Enter valid password"
          />
        )}

        {config.fields.includes('employeeKey') && (
          <InputBox
            label="Employee Key"
            style={styles.inputBox}
            value={formData.employeeKey}
            onChangeText={text => setFormData({ ...formData, employeeKey: text })}
            right={<TextInput.Icon icon={() => <FontAwesomeIcon icon={faKey} size={20} color="gray" style={{ marginRight: 10 }} />} />}
            showErrorText={errors.employeeKey}
            errorText="Enter valid employee key"
          />
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AppHeader line1={'Sazs Apps'} line2={'Private Limited'} />
          
          <View style={styles.content}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="#3E89EC" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>{config.subtitle}</Text>

            {renderFormFields()}

            <Button
              mode="contained"
              style={styles.loginButton}
              labelStyle={styles.buttonLabel}
              onPress={handleLogin}>
              Login
            </Button>
          </View>
        </ScrollView>
      </Animated.View>
      {loading && <Loading />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 8,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#3E89EC',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputBox: {
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#3E89EC',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 20,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MultiLogin;