// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { Dropdown } from 'react-native-element-dropdown';

// const DropdownBox = ({
//   style,
//   value = '',
//   label = '',
//   order = '',
//   data = [],
//   placeholder = 'Select an option',
//   showErrorText = false,
//   errorText = `Please select the ${label}`,
//   onChange = () => {},
//   showLabel = true,
// }) => {
//   return (
//     <View key={order ?? value} style={styles.container}>
//       {showLabel && (
//         <Text style={styles.label}>
//           {label}
//         </Text>
//       )}
//       <Dropdown
//         style={[styles.dropdown, style]}
       
//         data={data}
//         labelField="label"
//         valueField="value"
//         placeholder={placeholder}
//         value={value}
//         // onChange={item => onChange(item.value)}
//         onChange={item => onChange(item)}
        
//         containerStyle={styles.dropdownContainer}
//         selectedTextStyle={styles.selectedTextStyle}
//         placeholderStyle={styles.placeholderStyle}
//         activeColor="green"
       
//       />

//       {showErrorText ? (
//         <Text style={styles.errorText}>
//           {errorText}
//         </Text>
//       ) : null}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: '110%', // Make sure the container takes full width
//   },
//   label: {
    
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   dropdown: {
//     borderWidth: 2,
   
//     width: '90%', // Ensure the dropdown is full width
//     borderRadius: 4,
//     paddingHorizontal: 20,
//     paddingVertical: 2,
//   },
//   dropdownContainer: {
//     // borderColor: 'rgb(33,109,206)',
//     borderWidth: 2,
    
//   },
//   selectedTextStyle: {
//     color: '#000',
//     fontWeight: 'bold',
//   },
//   placeholderStyle: {
//     color: '#aaa',
//   },
//   errorText: {
//     color: 'rgb(33,109,206)',
//     fontWeight: 'bold',
//     marginTop: 5,
//   },
// });

// export default DropdownBox;


import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import DropdownBox from './DropdownBox'; // Import the new DropdownBox component

const VehicleEntry = () => {
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    category: null,
    product: '',
    uom: '',
    notes: '',
  });

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [uomOptions, setUomOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const response = await fetch('https://${Webkey}.sazss.in/Api/VehiclePageCombobox', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa('Inventory:SazsApps@123'),
        },
      });

      const data = await response.json();
      console.log("API data:", data);

      setCategoryOptions(
        data[0].map(item => ({ value: item.Id || item.id, label: item.Name || item.name }))
      );

      if (data[1] && data[1].length > 0) {
        setUomOptions(
          data[1].map(item => ({ value: item.Id || item.id, label: item.Column1 || 'Select vehicle number' }))
        );
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      Alert.alert('Error', 'Failed to load dropdown data');
      setLoading(false);
    }
  };

  const fetchProductData = async (categoryId, categoryName) => {
    try {
      const response = await fetch(`https://${Webkey}.sazss.in/Api/VehiclePageCombobox?GatePassFor=${categoryId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa('Inventory:SazsApps@123'),
        },
      });

      const data = await response.json();
      console.log("Product API Data:", data);

      // Determine data source based on category name
      const sourceData = categoryName === 'Raw Material' ? data[2] : data[0];

      setProductOptions(
        sourceData.map(item => ({ value: item.Id || item.id, label: item.Name || item.name }))
      );
    } catch (error) {
      console.error('Error fetching product data:', error);
      Alert.alert('Error', 'Failed to load product data');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const vehicleRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    if (!vehicleRegex.test(formData.vehicleNumber)) {
      newErrors.vehicleNumber = 'Invalid vehicle number format';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      console.log('Form Data:', formData);
      Alert.alert('Success', 'Vehicle entry submitted successfully!');
    }
  };

  const handleCancel = () => {
    setFormData({
      vehicleNumber: '',
      category: null,
      product: '',
      uom: '',
      notes: '',
    });
    setErrors({});
  };

  const renderInputFields = () => {
    if (loading) {
      return <Text>Loading...</Text>;
    }

    return (
      <View style={styles.formSection}>
        <Text style={styles.label}>Category:</Text>
        <DropdownBox
          value={formData.category}
          label="Category"
          data={categoryOptions}
          onChange={item => {
            setFormData(prev => ({
              ...prev,
              category: item.value,
              product: '', // Reset product when category changes
            }));
            setProductOptions([]); // Clear existing product options
            fetchProductData(item.value, item.label); // Pass category name for conditional fetch
          }}
          placeholder="Select Category"
          errorText={errors.category}
          showErrorText={!!errors.category}
        />

        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

        {formData.category && (
          <>
            <Text style={styles.label}>Vehicle Number:</Text>
            <TextInput
              style={[styles.textInput, errors.vehicleNumber && styles.errorBorder]}
              placeholder="Format: MH12AB1234"
              value={formData.vehicleNumber}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, vehicleNumber: text }))} 
              autoCapitalize="characters"
              maxLength={10}
            />
            {errors.vehicleNumber && <Text style={styles.errorText}>{errors.vehicleNumber}</Text>}

            <Text style={styles.label}>Product:</Text>
            <DropdownBox
              value={formData.product}
              label="Product"
              data={productOptions}
              onChange={item => setFormData(prev => ({ ...prev, product: item.value }))}
              placeholder="Select Product"
              errorText={errors.product}
              showErrorText={!!errors.product}
            />
            {errors.product && <Text style={styles.errorText}>{errors.product}</Text>}

            <Text style={styles.label}>UOM:</Text>
            <DropdownBox
              value={formData.uom}
              label="UOM"
              data={uomOptions}
              onChange={item => setFormData(prev => ({ ...prev, uom: item.value }))}
              placeholder="Select UOM"
              errorText={errors.uom}
              showErrorText={!!errors.uom}
            />
            {errors.uom && <Text style={styles.errorText}>{errors.uom}</Text>}
          </>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return <View style={styles.container}>{renderInputFields()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginTop: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorBorder: {
    borderColor: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default VehicleEntry;

