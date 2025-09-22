import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  BackHandler,
  Alert,
} from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faUser, faUserShield, faUserTie } from '@fortawesome/free-solid-svg-icons';
import AppHeader from '../AppHeader';
import { getStoredData } from './AsyncStorage';
import GlobalStyle from './GlobalStyle';
const LoginTypeSelection = ({ navigation, route }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [currentUserType, setCurrentUserType] = useState(null);
  const isFromSwitchAccount = route?.params?.fromSwitchAccount || false;

  useEffect(() => {
    const getCurrentUserType = async () => {
      const storedUserType = await getStoredData('CurrentUserType');
      setCurrentUserType(storedUserType);
    };
    getCurrentUserType();
  }, []);

  useEffect(() => {
    const handleBackButtonClick = () => {
      if (isFromSwitchAccount) {
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
  }, [isFromSwitchAccount]);

  const loginTypes = [
    {
      id: 'owner',
      title: 'Owner Dashboard',
      subtitle: 'Access admin features and settings',
      icon: faUserTie,
      color: '#4FAAF3',
      fields: ['Username', 'Password']
    },
    {
      id: 'self_attendance',
      title: 'Self Attendance',
      subtitle: 'Mark your own attendance',
      icon: faUser,
      color: '#28A745',
      fields: ['Employee Key']
    },
    {
      id: 'security_attendance',
      title: 'Security Attendance',
      subtitle: 'Security personnel access',
      icon: faUserShield,
      color: '#FFC107',
      fields: ['Username', 'Password', 'Employee Key']
    }
  ];

  const handleContinue = async (navigation) => {
    if (!selectedType) return;

    await AsyncStorage.setItem('SelectedLoginType', selectedType);

    // Check if switching to same account type and passcode exists
    if (isFromSwitchAccount && selectedType === currentUserType) {
      const passcode = await getStoredData('PassKey');
      if (passcode) {
        navigation.navigate('SignIn');
        return;
      }
    }

    // Navigate to multi login form
    navigation.navigate('MultiLogin', { loginType: selectedType });
  };

  const renderLoginTypeCard = (type) => (
    <TouchableOpacity
      key={type.id}
      style={[
        styles.typeCard,
        selectedType === type.id && styles.selectedCard,
        { borderColor: selectedType === type.id ? type.color : '#ddd' }
      ]}
      onPress={() => setSelectedType(type.id)}>
      
      <View style={[styles.iconContainer, { backgroundColor: type.color }]}>
        <FontAwesomeIcon icon={type.icon} size={24} color="white" />
      </View>
      
      <View style={styles.typeInfo}>
        <Text style={styles.typeTitle}>{type.title}</Text>
        <Text style={styles.typeSubtitle}>{type.subtitle}</Text>
        <Text style={styles.fieldsText}>
          Required: {type.fields.join(', ')}
        </Text>
      </View>
      
      <View style={[
        styles.radioButton,
        selectedType === type.id && styles.radioButtonSelected
      ]}>
        {selectedType === type.id && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppHeader line1={'Sazs Apps'} line2={'Private Limited'} />
        
        <View style={styles.content}>
          <Text style={styles.title}>
            {isFromSwitchAccount ? 'Switch Account' : 'Select Login Type'}
          </Text>
          <Text style={styles.subtitle}>
            Choose how you want to access the application
          </Text>

          <View style={styles.typesContainer}>
            {loginTypes.map(renderLoginTypeCard)}
          </View>

          <Button
  mode="contained"
  style={[styles.continueButton, !selectedType && styles.disabledButton]}
  labelStyle={styles.buttonLabel}
  onPress={() => handleContinue(navigation)}
  disabled={!selectedType}>
  Continue
</Button>


          {isFromSwitchAccount && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  typesContainer: {
    marginBottom: 30,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedCard: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  typeSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  fieldsText: {
    fontSize: 12,
    color: '#999',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#3E89EC',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3E89EC',
  },
  continueButton: {
    backgroundColor: '#3E89EC',
    borderRadius: 8,
    paddingVertical: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
});

export default LoginTypeSelection;