// import React, {useState} from 'react';
// import {
//   StyleSheet,
//   View,
//   ImageBackground,
//   Text,
//   TextInput,
//   TouchableOpacity,
// } from 'react-native';

// import { useNavigation } from '@react-navigation/native';


// const HeaderDesign = () => {

//   const [inputValue, setInputValue] = useState('');
//   const navigation = useNavigation();

//   const handleSubmit = () => {
//     navigation.navigate('FaceIdcam');
//   };

//   return (
//     <View style={styles.Container}>
//       <View style={styles.header}>
//         <ImageBackground
//           source={require('../images/LogoWaterMark.png')}
//           style={styles.headerImage}
//           resizeMode="contain"
//         />
//         <View style={styles.headerContent}>
//           <Text style={styles.headerText}>Sazs Apps</Text>
//           <Text style={styles.headerText}>Private Limited</Text>
//         </View>
//       </View>

//       <Text style={styles.BodyText1}>Employee Details</Text>
//       <Text style={styles.BodyText1}>Name</Text>

//       <View style={styles.NameContainer}>
//       <TextInput
//           style={[styles.input,{width: '100%', marginLeft: 0}]}
//           value={inputValue}
//           onChangeText={setInputValue}
//           placeholder="Enter Employee Name"
//           placeholderTextColor="#666"
//         />
//       </View>
//       <View style={styles.Body2}>
//         <Text style={styles.BodyText1}>Emp Id</Text>
//         <Text style={[styles.BodyText1, {paddingLeft: 100}]}>
//           Mobile number
//         </Text>
//       </View>
//       <View style={styles.Body2}>
//         <TextInput
//           style={styles.input}
//           value={inputValue}
//           onChangeText={setInputValue}
//           placeholder="Enter Emp Id"
//           placeholderTextColor="#666"
//         />
//         <TextInput
//           style={[styles.input, {marginLeft: 30}]}
//           value={inputValue}
//           onChangeText={setInputValue}
//           placeholder="Enter number"
//           placeholderTextColor="#666"
//         />
//       </View>
//       <View style={styles.Body2}>
//         <Text style={styles.BodyText1}>Designation</Text>
//       </View>
//       <View style={styles.Body2}>
//         <TextInput
//           style={styles.input}
//           value={inputValue}
//           onChangeText={setInputValue}
//           placeholder="Enter Designation"
//           placeholderTextColor="#666"
//         />
//       </View>

//       <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
//         <Text style={styles.submitButtonText}>Upload your face</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   Container: {
//     flex: 1,
//     backgroundColor: 'transparent',
//   },
//   header: {
//     width: '100%',
//     height: 231,
//     backgroundColor: '#3E89EC',
//     justifyContent: 'flex-start',
//     alignItems: 'flex-start',
//     position: 'relative',
//   },
//   headerImage: {
//     position: 'absolute',
//     right: 0,
//     top: 0,
//     left: 65,
//     width: '100%',
//     height: '100%',
//   },
//   headerContent: {
//     flexDirection: 'column',
//     marginTop: 100,
//     marginLeft: 25,
//   },
//   headerText: {
//     fontSize: 33,
//     fontWeight: 'bold',

//     color: 'white',
//   },

//   BodyText1: {
//     fontSize: 23,
//     fontWeight: 'bold',
//     marginLeft: 15,
//     color: '#000000',
//     marginTop: 20,
//   },
//   NameContainer: {
//     marginHorizontal: 15,
//     marginTop: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 30,
//     backgroundColor: '#fff',
//   },

//   Body2: {
//     marginTop: 10,
//     flexDirection: 'row',
//   },
//   input: {
//     height: 50,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     fontSize: 16,
//     backgroundColor: '#fff',
//     marginLeft: 15,
//     width: 170,
//   },
//   submitButton: {
//     backgroundColor: '#3E89EC',
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 20,
//     marginHorizontal: 15,
//     marginTop: 60,
//     alignItems: 'center',
//   },
//   submitButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
// });

// export default HeaderDesign;







import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const HeaderDesign = () => {
  const navigation = useNavigation();
  
  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    mobile: '',
    designation: '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    empId: '',
    mobile: '',
    designation: '',
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      empId: '',
      mobile: '',
      designation: '',
    };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    // Validate employee ID
    if (!formData.empId.trim()) {
      newErrors.empId = 'Employee ID is required';
      isValid = false;
    }

    // Validate mobile number
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Enter valid 10-digit number';
      isValid = false;
    }

    // Validate designation
    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      navigation.navigate('FaceVerification');
    } else {
      Alert.alert('Error', 'Please fill all required fields correctly');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <View style={styles.Container}>
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

      <Text style={styles.BodyText1}>Employee Details</Text>
      <Text style={styles.BodyText1}>Name</Text>

      <View style={styles.NameContainer}>
        <TextInput
          style={[styles.input, { width: '100%', marginLeft: 0, color: 'black' }]}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          placeholder="Enter Employee Name"
          placeholderTextColor="#666"
        />
      </View>
      {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

      <View style={styles.Body2}>
        <Text style={styles.BodyText1}>Emp Id</Text>
        <Text style={[styles.BodyText1, { paddingLeft: 100 }]}>
          Mobile number
        </Text>
      </View>
      <View style={styles.Body2}>
        <View style={{ flex: 1 }}>
          <TextInput
            style={[styles.input,{ color: 'black'}]}
            value={formData.empId}
            onChangeText={(value) => handleInputChange('empId', value)}
            placeholder="Enter Emp Id"
            placeholderTextColor="#666"
          />
          {errors.empId ? <Text style={styles.errorText}>{errors.empId}</Text> : null}
        </View>
        <View style={{ flex: 1 }}>
          <TextInput
            style={[styles.input, { marginLeft: 30, color: 'black' }]}
            value={formData.mobile}
            onChangeText={(value) => handleInputChange('mobile', value)}
            placeholder="Enter number"
            placeholderTextColor="#666"
            keyboardType="numeric"
            maxLength={10}
          />
          {errors.mobile ? <Text style={styles.errorText}>{errors.mobile}</Text> : null}
        </View>
      </View>

      <View style={styles.Body2}>
        <Text style={styles.BodyText1}>Designation</Text>
      </View>
      <View style={styles.Body2}>
        <TextInput
          style={[styles.input,{ color: 'black'}]}
          value={formData.designation}
          onChangeText={(value) => handleInputChange('designation', value)}
          placeholder="Enter Designation"
          placeholderTextColor="#666"
        />
      </View>
      {errors.designation ? <Text style={styles.errorText}>{errors.designation}</Text> : null}

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Upload your face</Text>
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    width: '100%',
    height: 231,
    backgroundColor: '#3E89EC',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    position: 'relative',
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
  },
  headerText: {
    fontSize: 33,
    fontWeight: 'bold',

    color: 'white',
  },

  BodyText1: {
    fontSize: 23,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#000000',
    marginTop: 20,
  },
  NameContainer: {
    marginHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    backgroundColor: '#fff',
  },

  Body2: {
    marginTop: 10,
    flexDirection: 'row',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginLeft: 15,
    width: 170,
  
  },
  submitButton: {
    backgroundColor: '#3E89EC',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginHorizontal: 15,
    marginTop: 60,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginLeft: 20,
    marginTop: 5,
  },
  Container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    width: '100%',
    height: 231,
    backgroundColor: '#3E89EC',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    position: 'relative',
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
  },
  headerText: {
    fontSize: 33,
    fontWeight: 'bold',
    color: 'white',
  },
  BodyText1: {
    fontSize: 23,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#000000',
    marginTop: 20,
  },
  NameContainer: {
    marginHorizontal: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  Body2: {
    marginTop: 10,
    flexDirection: 'row',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginLeft: 15,
    width: 170,
  },
  submitButton: {
    backgroundColor: '#3E89EC',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginHorizontal: 15,
    marginTop: 60,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HeaderDesign;
