import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, Modal, Dimensions } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { launchCamera } from 'react-native-image-picker';
import GetLocation from 'react-native-get-location';
import { PermissionsAndroid } from 'react-native';

const { width, height } = Dimensions.get('window');

const AttendanceCamera = ({ navigation, route }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [toggle, setToggle] = useState(true);
  
  const mode = route.params?.mode || 'punch-in';
  
  const currentTimer = route.params?.currentTimer || 0;

  const watermarkIcon = require('../images/LogoWaterMark.png');

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission Required',
          message: 'Camera access is needed for attendance verification',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        const result = await launchCamera({
          mediaType: 'photo',
          cameraType: 'front',
          includeBase64: true,
          saveToPhotos: false,
          quality: 0.7,
        });
        
        if (result.didCancel) {
          console.log('User cancelled camera');
        } else if (result.errorCode) {
          console.log('Camera Error:', result.errorMessage);
        } else if (result.assets && result.assets[0]) {
          setCapturedImage(result.assets[0].uri);
          setToggle(false);
        }
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const checkPermissionOFGps = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'Location access is needed for attendance verification',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        
        // Call getCurrentLocation if needed
        getCurrentLocation(); // Assuming this fetches the location
  
        // Now proceed with navigation logic
        if (capturedImage) {
          console.log('Image captured, proceeding with navigation...');
          
          // Navigate based on mode (punch-in or punch-out)
          if (mode === 'punch-in') {
            console.log('Navigating to AttendanceHome with punch-in success...');
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'AttendanceHome',
                  params: { punchInSuccess: true },
                },
              ],
            });
          } else if (mode === 'punch-out') {
            console.log('Navigating to AttendanceHome with punch-out success...');
            navigation.reset({
              index: 0,
              routes: [
                {
                  name: 'AttendanceHome',
                  params: { checkInMode: 'check-in', isPunchOut: true },
                },
              ],
            });
          }
        } else {
          console.log('No image captured. Please capture your image first.');
        }
  
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  
  
  const getCurrentLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 60000,
    })
      .then(location => {
        if (location) {
          // Navigate to AttendanceHome page
          navigation.navigate('AttendanceHome', {
            // location: location, // pass the location data if necessary
          });
        }
      })
      .catch(error => {
        const { code, message } = error;
        console.warn(code, message);
      });
  };
  

  const handleRetake = () => {
    setCapturedImage(null);
    setToggle(true);
  };
  
  
  // Update the handleContinue method if needed:
//   const handleContinue = () => {
//     console.log('Captured Image:', capturedImage);
//     console.log('Mode:', mode);  // Check the value of mode
    
//     if (capturedImage) {
//       console.log('Image captured, proceeding with navigation...');
      
//       // Navigate based on mode (punch-in or punch-out)
//       if (mode === 'punch-in') {
//         console.log('Navigating to Selfie with punch-in success...');
//         navigation.reset({
//           index: 0,
//           routes: [
//             {
//               name: 'AttendanceHome',
//               params: { punchInSuccess: true },  // Pass punchInSuccess for punch-in mode
//             },
//           ],
//         });
//       } else if (mode === 'punch-out') {
//         console.log('Navigating to Selfie with punch-out success...');
//         navigation.reset({
//           index: 0,
//           routes: [
//             {
//               name: 'Selfie',
//               params: { 
//                 punchOutSuccess: true, 
//                 checkInMode: 'check-in',  // Pass checkInMode with 'check-in' value
//                 finalTimer: currentTimer    // Optional: If you need to pass the timer
//               },
//             },
//           ],
//         });
//       } else {
//         console.log('Invalid mode:', mode);  // Log if mode is neither 'punch-in' nor 'punch-out'
//       }
//     } else {
//       console.log('No image captured. Please capture your image first.');
//     }
// };


const handleContinue = () => {
    if (capturedImage) {
      // Show success modal when image is captured
      setModalVisible(true);
  
      // Simulate uploading process (optional)
      setIsUploading(true);
      let uploadProgress = 0;
      const interval = setInterval(() => {
        if (uploadProgress < 100) {
          uploadProgress += 10;
          setProgress(uploadProgress);
        } else {
          clearInterval(interval);
          setIsUploading(false);
        }
      }, 500);
    }
  };
  
  


  
  return (
    <View style={styles.container}>
      <ImageBackground
        source={watermarkIcon}
        resizeMode="contain"
        imageStyle={{
          width: width * 0.75,
          height: height * 0.22,
          marginLeft: width * 0.35,
        }}
        style={styles.watermarkIcon}
      >
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {mode === 'punch-in' ? 'Punch In Verification' : 'Punch Out Verification'}
          </Text>
        </View>
      </ImageBackground>

      <Text style={styles.instructionText}>
        {capturedImage ? "Verification Image Captured" : 'Show your face for verification'}
      </Text>

      <View style={styles.contentContainer}>
        {capturedImage ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: capturedImage }} 
              style={styles.previewImage}
            />
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.faceContainer}>
              <View style={styles.cornerTopLeft} />
              <View style={styles.cornerTopRight} />
              <View style={styles.cornerBottomLeft} />
              <View style={styles.cornerBottomRight} />
            </View>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {capturedImage ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.button, styles.retakeButton]} 
              onPress={handleRetake}
            >
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              disabled={toggle} 
              onPress={handleContinue}
              activeOpacity={0.8} 
              style={[
                styles.button,
                { backgroundColor: toggle ? 'gray' : 'steelblue' }
              ]} 
            >
              <Text style={styles.buttonText}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.captureButton} 
            onPress={requestCameraPermission}
          >
            <Text style={styles.buttonText}>Capture Image</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Face ID updated successfully</Text>
            <Text style={styles.emoji}>👍</Text>
            <TouchableOpacity 
              onPress={() => setModalVisible(false)} 
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>OK</Text>
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
    backgroundColor: '#F6F3ED',
  },
  watermarkIcon: {
    backgroundColor: '#3E89EC',
  },
  header: {
    paddingVertical: 40,
  },
  headerText: {
    fontSize: 25,
    color: '#FFFFFF',
    fontWeight: 'bold',
    width: 300,
    marginLeft: 18,
  },
  instructionText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  contentContainer: {
    flex: 1,
    marginTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewContainer: {
    width: '80%',
    height: '60%',
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  placeholderContainer: {
    width: '80%',
    height: '60%',
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  faceContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 50,
    left: 50,
    width: 30,
    height: 30,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    borderColor: '#666666',
    borderRadius: 5,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 50,
    right: 50,
    width: 30,
    height: 30,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: '#666666',
    borderRadius: 5,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    width: 30,
    height: 30,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#666666',
    borderRadius: 5,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 50,
    right: 50,
    width: 30,
    height: 30,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#666666',
    borderRadius: 5,
  },
  buttonContainer: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: '48%',
  },
  captureButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  retakeButton: {
    backgroundColor: '#7AB134',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 50,
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default AttendanceCamera;