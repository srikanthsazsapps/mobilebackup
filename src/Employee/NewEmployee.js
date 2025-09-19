import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Modal, 
  ImageBackground, 
  Text, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  Image, 
  Dimensions, 
  FlatList 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const EmployeeRegistration = () => {
  const navigation = useNavigation();

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const response = await fetch('https://${Webkey}.sazss.in/Api/EmployeeAttendance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('Inventory:SazsApps@123'),
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      const employeeArray = Array.isArray(data[0]) ? data[0] : [];

      const employeesList = employeeArray.map((employee, index) => ({
        ...employee,
        uniqueId: `${employee.EmployeeId}_${index}`,
        profilePhoto: employee.ProfilePhoto || require('../images/2.jpg')
      }));

      setEmployees(employeesList);
      setFilteredEmployees(employeesList);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      Alert.alert('Error', 'Failed to fetch employee data');
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = employees.filter(employee => 
      employee.EmployeeName.toLowerCase().includes(text.toLowerCase()) ||
      employee.EmployeeId.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setSearchQuery(employee.EmployeeName);
    setIsModalVisible(false);
  };

  const handleUpload = (employee) => {
    navigation.navigate('FaceIdcam', { employeeData: employee });
    setIsModalVisible(false);
  };

  const renderEmployeeItem = ({ item: employee }) => (
    <TouchableOpacity 
      style={styles.employeeItem}
      onPress={() => handleEmployeeSelect(employee)}
    >
      <Image 
        source={employee.profilePhoto}
        style={styles.profilePhoto}
        defaultSource={require('../images/2.jpg')}
      />
      <View style={styles.employeeInfoContainer}>
        <Text style={styles.employeeName} numberOfLines={1}>
          {employee.EmployeeName}
        </Text>
        <Text style={styles.employeeId} numberOfLines={1}>
          {employee.EmployeeId}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={() => handleUpload(employee)}
      >
        <Text style={styles.uploadButtonText}>Upload</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ImageBackground
          source={require('../images/LogoWaterMark.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerText}>Sazs Apps</Text>
          <Text style={styles.headerText}>Private Limited</Text>
        </View>
      </View>
      
      <Text style={styles.sectionTitle}>Employee Registration</Text>

      <TouchableOpacity 
        style={styles.searchContainer}
        onPress={() => setIsModalVisible(true)}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Search Employee"
          placeholderTextColor="#888"
          value={searchQuery}
          editable={false}
        />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.searchInputModal}
              placeholder="Search Employee"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus={true}
            />

            <FlatList
              data={filteredEmployees}
              renderItem={renderEmployeeItem}
              keyExtractor={(item) => item.uniqueId}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>No employees found</Text>
                </View>
              }
            />

            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    width: '100%',
    height: 231,
    backgroundColor: '#3E89EC',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
  },
  headerImage: {
    position: 'absolute',
    right: 0,
    top: 0,
    left: 65,
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flexDirection: 'column',
    marginTop: 100,
    marginLeft: 25,
    zIndex: 10,
  },
  headerText: {
    fontSize: 33,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#000000',
    marginTop: 20,
  },
  searchContainer: {
    marginHorizontal: 15,
    marginTop: 10,
  },
  searchInput: {
    fontSize: 16,
    color: 'black',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    paddingHorizontal: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.7,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
  },
  searchInputModal: {
    fontSize: 16,
    color: 'black',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  employeeInfoContainer: {
    flex: 1,
    marginLeft: 10,
    overflow: 'hidden',
  },
  employeeName: {
    fontSize: 16,
    color: 'black',
    fontWeight: '600',
  },
  employeeId: {
    fontSize: 12,
    color: '#888',
  },
  uploadButton: {
    backgroundColor: '#3E89EC',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyListContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyListText: {
    color: '#888',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#3E89EC',
    borderRadius: 30,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EmployeeRegistration;