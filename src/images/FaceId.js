import React, { useState, useRef } from 'react';
import { StyleSheet, View, ImageBackground, Text, TouchableOpacity, Image, Platform, PermissionsAndroid, Modal, Dimensions, Animated } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faRedo, faUpload } from '@fortawesome/free-solid-svg-icons';
import { launchCamera } from 'react-native-image-picker';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const UploadProgress = ({ visible, onComplete }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const [progress, setProgress] = useState(0);

    React.useEffect(() => {
        if (visible) {
            // Reset progress when starting
            setProgress(0);
            
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: false,
            }).start(() => {
                onComplete();
            });

            // Update progress percentage
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 40); // 2000ms/50steps = 40ms per step

            return () => clearInterval(interval);
        } else {
            progressAnim.setValue(0);
            setProgress(0);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <View style={styles.uploadBackdrop}>
            <View style={styles.uploadProgressContainer}>
                <Text style={styles.uploadingText}>Uploading... {progress}%</Text>
                <View style={styles.progressBarContainer}>
                    <Animated.View 
                        style={[
                            styles.progressBar,
                            {
                                width: progressAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%']
                                })
                            }
                        ]} 
                    />
                </View>
            </View>
        </View>
    );
};

const CustomAlertModal = ({ visible, title, message, onClose }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}>
            <View style={styles.alertOverlay}>
                <View style={styles.alertContainer}>
                    <View style={styles.alertHandle}></View>
                    <Text style={styles.alertTitle}>{title}</Text>
                    <Text style={styles.alertMessage}>{message}</Text>
                    <View style={styles.animationContainer}>
                        <LottieView
                            style={styles.welcomeAnime}
                            source={require('../images/Animation3.json')}
                            autoPlay={true}
                            loop={false}
                            onAnimationFinish={() => {
                                onClose();
                            }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const FaceVerification = () => {
    const [photo, setPhoto] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '' });
    const [isUploading, setIsUploading] = useState(false);

    const navigation = useNavigation();
    const showModal = (title, message) => {
        setModalConfig({ title, message });
        setModalVisible(true);
    };

    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Camera Permission Required',
                    message: 'Camera access is needed for ID verification',
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
                    quality: 0.8,
                });

                if (result.didCancel) {
                    console.log('User cancelled camera');
                } else if (result.errorCode) {
                    console.log('Camera Error:', result.errorMessage);
                    showModal('Error', 'Failed to take picture. Please try again.');
                } else if (result.assets && result.assets[0]) {
                    setPhoto(result.assets[0].uri);
                    setIsPreviewMode(true);
                }
            } else {
                showModal('Permission Denied', 'Camera permission is required for ID verification.');
            }
        } catch (err) {
            console.warn(err);
            showModal('Error', 'Failed to request camera permission');
        }
    };

    const retakePicture = () => {
        setPhoto(null);
        setIsPreviewMode(false);
    };

    const handleSubmit = async () => {
        if (!photo) {
            showModal('Error', 'Please take a photo first');
            return;
        }

        try {
            setIsUploading(true);
            // The progress animation will complete in 2 seconds
            // After that, we'll show the success modal
        } catch (error) {
            setIsUploading(false);
            showModal('Error', 'Failed to upload photo. Please try again.');
            console.error('Upload error:', error);
        }
    };

    const handleUploadComplete = () => {
        setIsUploading(false);
        showModal('Success', 'Photo uploaded successfully!');
        // Reset the state after successful upload
        setPhoto(null);
        setIsPreviewMode(false);
    };

    const handleModalClose = () => {
        setModalVisible(false);
      
        navigation.navigate('EmployeeDetails');
    }

    return (
        <View style={styles.Container}>
            <View style={styles.header}>
                <ImageBackground
                    source={require('../images/LogoWaterMark.png')}
                    style={styles.headerImage}
                    resizeMode="contain"
                />
                <View style={styles.headerContent}>
                    <Text style={[styles.headerText, { marginTop: 100 }]}>Sazs Apps</Text>
                    <Text style={styles.headerText}>Private Limited</Text>
                </View>
            </View>
            
            <View style={styles.body}>
                <Text style={styles.BodyText1}>
                    {isPreviewMode 
                        ? 'Review your photo before uploading'
                        : 'Show your face for your ID verification'
                    }
                </Text>
            </View>

            <View style={styles.cameraContainer}>
                {photo ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: photo }} style={styles.preview} />
                        <View style={styles.previewActions}>
                            <TouchableOpacity 
                                style={styles.actionButton} 
                                onPress={retakePicture}
                                disabled={isUploading}
                            >
                                <FontAwesomeIcon icon={faRedo} size={20} color="white" />
                                <Text style={styles.actionButtonText}>Retake</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.actionButton} 
                                onPress={handleSubmit}
                                disabled={isUploading}
                            >
                                <FontAwesomeIcon icon={faUpload} size={20} color="white" />
                                <Text style={styles.actionButtonText}>Upload</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.cameraWrapper}>
                        <TouchableOpacity 
                            style={styles.captureButton} 
                            onPress={requestCameraPermission}
                        >
                            <FontAwesomeIcon 
                                icon={faCamera} 
                                size={24} 
                                color="white" 
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <UploadProgress 
                visible={isUploading}
                onComplete={handleUploadComplete}
            />

            <CustomAlertModal
                visible={modalVisible}
                title={modalConfig.title}
                message={modalConfig.message}
                onClose={handleModalClose}
            />
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
    },
    headerText: {
        fontSize: 33,
        fontWeight: 'bold',         
        color: 'white',
        marginLeft: 25,
    },
    body: {
        padding: 15,
    },
    BodyText1: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#000000',
        textAlign: 'center',
    },
    cameraContainer: {
        flex: 1,
        marginHorizontal: 20,
        marginVertical: 20,
        borderRadius: 20,
        overflow: 'hidden',
        alignItems: 'center',
        
    },
    cameraWrapper: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        justifyContent: 'center',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#3E89EC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewContainer: {
        flex: 1,
        width: '100%',
        position: 'relative',
    },
    preview: {
        flex: 1,
        borderRadius: 20,
        width: '100%',
        height: '100%',
        marginBottom: 80,
    },
    previewActions: {
        position: 'absolute',
        bottom: 20,
        right: 60,
        flexDirection: 'row',
        gap: 10,
    },
    actionButton: {
        backgroundColor: '#3E89EC',
        padding: 15,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Upload Progress Styles
    uploadProgressContainer: {
        position: 'absolute',
        top: '50%',
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    uploadingText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
    // Alert Modal Styles
    alertOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        
    },
    alertContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: 'center',
    },
    alertHandle: {
        width: width * 0.3,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 10,
        marginBottom: 15,
    },
    alertTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#000',
    },
    alertMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    animationContainer: {
        width: '100%',
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeAnime: {
        width: '100%',
        height: '100%',
    },
    uploadBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        
        marginTop: 580,
        alignItems: 'center',
        
    },
    uploadProgressContainer: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginTop: 40,
    },
    uploadingText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    progressBarContainer: {
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
        borderRadius: 4,
    },
});

export default FaceVerification;