import React, { useState, useRef } from 'react';
import { StyleSheet, View, ImageBackground, Text, TouchableOpacity, Image, Platform, PermissionsAndroid, Modal, Dimensions, Animated, BackHandler, TextInput, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faArrowRight, faCamera, faRefresh, faSearch, faTicket } from '@fortawesome/free-solid-svg-icons';
import { launchCamera } from 'react-native-image-picker';
import LottieView from 'lottie-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const UploadProgress = ({ visible, onComplete }) => {
    const progressAnim = useRef(new Animated.Value(0)).current;
    const [progress, setProgress] = useState(0);

    React.useEffect(() => {
        if (visible) {
            console.log('📤 Upload progress started');
            setProgress(0);
            
            Animated.timing(progressAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: false,
            }).start(() => {
                console.log('📤 Upload progress animation completed');
                onComplete();
            });

            const interval = setInterval(() => {
                setProgress(prev => {
                    const newProgress = prev + 2;
                    if (newProgress <= 100) {
                        console.log(`📊 Upload progress: ${newProgress}%`);
                    }
                    if (newProgress >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return newProgress;
                });
            }, 40);

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
                <Text style={styles.uploadingText}>Processing Attendance... {progress}%</Text>
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
                                console.log('🎬 Success animation finished');
                                onClose();
                            }}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const CameraScreen = () => {
    const [photo, setPhoto] = useState(null);
    const [photoPath, setPhotoPath] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [employeeName, setEmployeeName] = useState('');
    const [showNameInput, setShowNameInput] = useState(false);
    const navigation = useNavigation();

    useFocusEffect(
        React.useCallback(() => {
            console.log('📱 Camera Screen focused');
            let isActive = true;

            const onBackPress = () => {
                if (isActive) {
                    console.log('⬅️ Back button pressed');
                    navigation.navigate('');
                    return true;
                }
                return false;
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => {
                console.log('📱 Camera Screen unfocused');
                isActive = false;
                BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            };
        }, [navigation])
    );

    const showModal = (title, message) => {
        console.log(`📋 Showing modal: ${title} - ${message}`);
        setModalConfig({ title, message });
        setModalVisible(true);
    };

    // Save photo data to AsyncStorage with folder structure
    const savePhotoToStorage = async (photoUri, photoBase64 = null) => {
        try {
            console.log('💾 Starting to save photo to AsyncStorage...');
            
            const timestamp = new Date().getTime();
            const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            const fileName = `attendance_${timestamp}.jpg`;
            
            // Create folder-like structure
            const photoData = {
                fileName: fileName,
                uri: photoUri,
                timestamp: timestamp,
                date: new Date().toISOString(),
                dateString: dateStr,
                base64: photoBase64,
                folder: `photos/${dateStr}`, // Organize by date
                size: photoBase64 ? Math.round(photoBase64.length * 0.75) : 0, // Approximate size
            };
            
            // Save individual photo
            await AsyncStorage.setItem(`photo_${timestamp}`, JSON.stringify(photoData));
            
            // Update photos index/folder structure
            await updatePhotosIndex(photoData);
            
            console.log('✅ Photo data saved to AsyncStorage:', {
                fileName: photoData.fileName,
                folder: photoData.folder,
                timestamp: photoData.timestamp,
                size: `${Math.round(photoData.size / 1024)} KB`,
                hasBase64: !!photoData.base64
            });
            
            return photoUri;
        } catch (error) {
            console.error('❌ Error saving photo to AsyncStorage:', error);
            throw error;
        }
    };

    // Update photos index for folder organization
    const updatePhotosIndex = async (newPhotoData) => {
        try {
            const photosIndex = await AsyncStorage.getItem('photos_index');
            const index = photosIndex ? JSON.parse(photosIndex) : {
                totalPhotos: 0,
                folders: {},
                lastUpdated: new Date().toISOString()
            };

            const dateFolder = newPhotoData.dateString;
            
            // Initialize folder if it doesn't exist
            if (!index.folders[dateFolder]) {
                index.folders[dateFolder] = {
                    date: dateFolder,
                    photoCount: 0,
                    photos: [],
                    totalSize: 0
                };
            }

            // Add photo to folder
            index.folders[dateFolder].photos.push({
                timestamp: newPhotoData.timestamp,
                fileName: newPhotoData.fileName,
                size: newPhotoData.size
            });
            
            index.folders[dateFolder].photoCount += 1;
            index.folders[dateFolder].totalSize += newPhotoData.size;
            index.totalPhotos += 1;
            index.lastUpdated = new Date().toISOString();

            await AsyncStorage.setItem('photos_index', JSON.stringify(index));
            console.log('📁 Updated photos index:', {
                totalPhotos: index.totalPhotos,
                foldersCount: Object.keys(index.folders).length,
                currentFolder: `${dateFolder} (${index.folders[dateFolder].photoCount} photos)`
            });

        } catch (error) {
            console.error('❌ Error updating photos index:', error);
        }
    };

    // Get photos organized by folders
    const getPhotosWithFolders = async () => {
        try {
            console.log('📁 Retrieving photos with folder organization...');
            
            const photosIndex = await AsyncStorage.getItem('photos_index');
            if (!photosIndex) {
                console.log('📁 No photos index found');
                return { totalPhotos: 0, folders: {} };
            }

            const index = JSON.parse(photosIndex);
            console.log('📁 Photos Index Retrieved:', {
                totalPhotos: index.totalPhotos,
                foldersCount: Object.keys(index.folders).length,
                folders: Object.keys(index.folders)
            });

            return index;
        } catch (error) {
            console.error('❌ Error retrieving photos index:', error);
            return { totalPhotos: 0, folders: {} };
        }
    };

    // Get specific photo data
    const getPhotoData = async (timestamp) => {
        try {
            const photoData = await AsyncStorage.getItem(`photo_${timestamp}`);
            return photoData ? JSON.parse(photoData) : null;
        } catch (error) {
            console.error('❌ Error retrieving photo data:', error);
            return null;
        }
    };

    const requestCameraPermission = async () => {
        console.log('📷 Requesting camera permission...');
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
                console.log('✅ Camera permission granted');
                
                const result = await launchCamera({
                    mediaType: 'photo',
                    cameraType: 'front',
                    includeBase64: true, // Enable base64 for storage
                    saveToPhotos: false,
                    quality: 0.8,
                });

                if (result.didCancel) {
                    console.log('❌ User cancelled camera');
                } else if (result.errorCode) {
                    console.log('❌ Camera Error:', result.errorMessage);
                    showModal('Error', 'Failed to take picture. Please try again.');
                } else if (result.assets && result.assets[0]) {
                    const asset = result.assets[0];
                    console.log('✅ Photo captured successfully');
                    console.log('📷 Photo URI:', asset.uri);
                    console.log('📷 Photo details:', {
                        width: asset.width,
                        height: asset.height,
                        fileSize: asset.fileSize,
                        type: asset.type
                    });
                    
                    setPhoto(asset.uri);
                    setIsPreviewMode(true);
                    
                    // Save photo to AsyncStorage immediately
                    try {
                        const savedPath = await savePhotoToStorage(asset.uri, asset.base64);
                        setPhotoPath(savedPath);
                        console.log('✅ Photo saved and ready for attendance');
                    } catch (error) {
                        console.error('❌ Failed to save photo:', error);
                        showModal('Error', 'Failed to save photo. Please try again.');
                    }
                }
            } else {
                console.log('❌ Camera permission denied');
                showModal('Permission Denied', 'Camera permission is required for ID verification.');
            }
        } catch (err) {
            console.error('❌ Camera permission error:', err);
            showModal('Error', 'Failed to request camera permission');
        }
    };

    const retakePicture = () => {
        console.log('🔄 Retaking picture...');
        setPhoto(null);
        setPhotoPath(null);
        setIsPreviewMode(false);
        setShowNameInput(false);
        setEmployeeName('');
    };

    const proceedToNameInput = () => {
        console.log('👤 Proceeding to name input...');
        setShowNameInput(true);
    };

    const confirmAttendance = async () => {
        if (!employeeName.trim()) {
            console.log('❌ Employee name is required');
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        if (!photo || !photoPath) {
            console.log('❌ Photo is required for attendance');
            showModal('Error', 'Please take a photo first');
            return;
        }

        try {
            console.log('🎯 Starting attendance confirmation process...');
            console.log('👤 Employee Name:', employeeName);
            console.log('📷 Photo Path:', photoPath);
            
            setIsUploading(true);
            
            // Create attendance record with better organization
            const attendanceRecord = {
                employeeName: employeeName.trim(),
                photoPath: photoPath, // This is the timestamp for photo lookup
                photoTimestamp: photoPath, // More explicit
                timestamp: new Date().getTime(),
                date: new Date().toISOString(),
                attendanceDate: new Date().toDateString(),
                attendanceTime: new Date().toLocaleTimeString(),
                folder: `attendance/${new Date().toISOString().split('T')[0]}`, // Organize by date
            };
            
            console.log('📋 Attendance Record Created:', attendanceRecord);
            
            // Save attendance record to AsyncStorage
            const attendanceKey = `attendance_${attendanceRecord.timestamp}`;
            await AsyncStorage.setItem(attendanceKey, JSON.stringify(attendanceRecord));
            console.log('✅ Attendance record saved with key:', attendanceKey);
            
            // Also update a master attendance list
            const existingAttendance = await AsyncStorage.getItem('attendance_list');
            const attendanceList = existingAttendance ? JSON.parse(existingAttendance) : [];
            attendanceList.push(attendanceRecord);
            await AsyncStorage.setItem('attendance_list', JSON.stringify(attendanceList));
            console.log('✅ Updated master attendance list. Total records:', attendanceList.length);
            
            // Show all stored attendance records
            console.log('📊 All Attendance Records:');
            attendanceList.forEach((record, index) => {
                console.log(`${index + 1}. Name: ${record.employeeName}, Date: ${record.attendanceDate}, Time: ${record.attendanceTime}`);
            });
            
        } catch (error) {
            console.error('❌ Attendance confirmation error:', error);
            setIsUploading(false);
            showModal('Error', 'Failed to confirm attendance. Please try again.');
        }
    };

    const handleUploadComplete = () => {
        console.log('🎉 Attendance process completed successfully!');
        setIsUploading(false);
        showModal('Success', `Attendance confirmed for ${employeeName}!`);
        
        // Reset the state after successful upload
        setPhoto(null);
        setPhotoPath(null);
        setIsPreviewMode(false);
        setShowNameInput(false);
        setEmployeeName('');
    };

    const handleModalClose = () => {
        console.log('📋 Modal closed, navigating to next screen...');
        setModalVisible(false);
        navigation.navigate('CameraScreen'); 
    };

    // Enhanced debug function with folder structure
    const showStoredData = async () => {
        console.log('🔍 === DEBUGGING: SHOWING ALL STORED DATA WITH FOLDERS ===');
        try {
            // Show photos with folder organization
            const photosIndex = await getPhotosWithFolders();
            
            if (photosIndex.totalPhotos > 0) {
                console.log('📁 PHOTO FOLDERS STRUCTURE:');
                console.log(`📊 Total Photos: ${photosIndex.totalPhotos}`);
                console.log(`📂 Total Folders: ${Object.keys(photosIndex.folders).length}`);
                console.log('');
                
                // Show each folder
                const sortedFolders = Object.keys(photosIndex.folders).sort().reverse(); // Latest first
                for (const folderDate of sortedFolders) {
                    const folder = photosIndex.folders[folderDate];
                    console.log(`📂 Folder: ${folderDate}`);
                    console.log(`   📊 Photos: ${folder.photoCount}`);
                    console.log(`   💾 Total Size: ${Math.round(folder.totalSize / 1024)} KB`);
                    
                    // Show individual photos in folder
                    for (let i = 0; i < folder.photos.length; i++) {
                        const photo = folder.photos[i];
                        const photoData = await getPhotoData(photo.timestamp);
                        console.log(`   📷 Photo ${i + 1}:`, {
                            fileName: photo.fileName,
                            timestamp: new Date(photo.timestamp).toLocaleString(),
                            size: `${Math.round(photo.size / 1024)} KB`,
                            hasBase64: !!(photoData && photoData.base64),
                            uri: photoData ? `${photoData.uri.substring(0, 50)}...` : 'N/A'
                        });
                    }
                    console.log('');
                }
            } else {
                console.log('📁 No photos found in storage');
            }
            
            // Show attendance records
            const attendanceData = await AsyncStorage.getItem('attendance_list');
            if (attendanceData) {
                const attendanceList = JSON.parse(attendanceData);
                console.log('📋 ATTENDANCE RECORDS:');
                console.log(`📊 Total Records: ${attendanceList.length}`);
                
                // Group attendance by date
                const attendanceByDate = {};
                attendanceList.forEach(record => {
                    const date = record.attendanceDate;
                    if (!attendanceByDate[date]) {
                        attendanceByDate[date] = [];
                    }
                    attendanceByDate[date].push(record);
                });

                // Show attendance by date
                const sortedDates = Object.keys(attendanceByDate).sort().reverse();
                for (const date of sortedDates) {
                    console.log(`📅 Date: ${date}`);
                    attendanceByDate[date].forEach((record, index) => {
                        console.log(`   👤 Record ${index + 1}:`, {
                            name: record.employeeName,
                            time: record.attendanceTime,
                            hasPhoto: !!record.photoPath,
                            photoTimestamp: record.photoPath
                        });
                    });
                    console.log('');
                }
            } else {
                console.log('📋 No attendance records found');
            }
            
            // Show storage summary
            const allKeys = await AsyncStorage.getAllKeys();
            const photoKeys = allKeys.filter(k => k.startsWith('photo_'));
            const attendanceKeys = allKeys.filter(k => k.startsWith('attendance_'));
            const systemKeys = ['photos_index', 'attendance_list'];
            const userKeys = allKeys.filter(k => !k.startsWith('photo_') && !k.startsWith('attendance_') && !systemKeys.includes(k));
            
            console.log('🗄️ STORAGE SUMMARY:');
            console.log(`   📷 Photo entries: ${photoKeys.length}`);
            console.log(`   📋 Attendance entries: ${attendanceKeys.length}`);
            console.log(`   🗂️ System entries: ${systemKeys.filter(k => allKeys.includes(k)).length}`);
            console.log(`   👤 User entries: ${userKeys.length}`);
            console.log(`   🔑 Total keys: ${allKeys.length}`);
            
            console.log('');
            console.log('🔑 All Storage Keys:', allKeys.sort());
            
        } catch (error) {
            console.error('❌ Error showing stored data:', error);
        }
        console.log('🔍 === END DEBUG DATA ===');
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
                    <Text style={[styles.headerText, { marginTop: 100 }]}>Sazs Apps</Text>
                    <Text style={styles.headerText}>Private Limited</Text>
                </View>
            </View>
            
            <View style={styles.body}>
                <Text style={styles.BodyText1}>
                    {!isPreviewMode 
                        ? 'Show your face for your ID verification'
                        : !showNameInput 
                        ? 'Review your photo before proceeding'
                        : 'Enter your name to confirm attendance'
                    }
                </Text>
            </View>

            <View style={styles.cameraContainer}>
                {photo ? (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: photo }} style={styles.preview} />
                        
                        {!showNameInput ? (
                            <View style={styles.previewActions}>
                                <TouchableOpacity 
                                    style={styles.actionButton} 
                                    onPress={retakePicture}
                                    disabled={isUploading}
                                >
                                                <FontAwesomeIcon icon={faRefresh} size={20} color="black" />
                                    
                                    <Text style={styles.actionButtonText}>Retake</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.actionButton} 
                                    onPress={proceedToNameInput}
                                    disabled={isUploading}
                                >
                                                <FontAwesomeIcon icon={faArrowRight} size={20} color="black" />
                                    
                                    <Text style={styles.actionButtonText}>Next</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.nameInputContainer}>
                                <TextInput
                                    style={styles.nameInput}
                                    placeholder="Enter your full name"
                                    value={employeeName}
                                    onChangeText={(text) => {
                                        console.log('👤 Name input changed:', text);
                                        setEmployeeName(text);
                                    }}
                                    disabled={isUploading}
                                />
                                <View style={styles.confirmActions}>
                                    <TouchableOpacity 
                                        style={styles.actionButton} 
                                        onPress={() => setShowNameInput(false)}
                                        disabled={isUploading}
                                    >
                                                   <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
                                       
                                        <Text style={styles.actionButtonText}>Back</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.actionButton, styles.confirmButton]} 
                                        onPress={confirmAttendance}
                                        disabled={isUploading}
                                    >
                                                   <FontAwesomeIcon icon={faTicket} size={20} color="black" />
                                       
                                        <Text style={styles.actionButtonText}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.cameraWrapper}>
                        <TouchableOpacity 
                            style={styles.captureButton} 
                            onPress={requestCameraPermission}
                        >
                                       <FontAwesomeIcon icon={faCamera} size={20} color="black" />
                           
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Debug buttons - remove in production */}
            <View style={styles.debugContainer}>
                <TouchableOpacity 
                    style={styles.debugButton} 
                    onPress={showStoredData}
                >
                    <Text style={styles.debugButtonText}>Show Stored Data</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.debugButton, styles.clearButton]} 
                    onPress={async () => {
                        try {
                            console.log('🗑️ Starting to clear all attendance data...');
                            const keys = await AsyncStorage.getAllKeys();
                            const relevantKeys = keys.filter(key => 
                                key.startsWith('photo_') || 
                                key.startsWith('attendance_') || 
                                key === 'attendance_list' ||
                                key === 'photos_index'
                            );
                            
                            if (relevantKeys.length > 0) {
                                await AsyncStorage.multiRemove(relevantKeys);
                                console.log('✅ Cleared attendance data keys:', relevantKeys);
                                console.log('📊 Cleared items:');
                                console.log(`   📷 Photos: ${relevantKeys.filter(k => k.startsWith('photo_')).length}`);
                                console.log(`   📋 Attendance: ${relevantKeys.filter(k => k.startsWith('attendance_')).length}`);
                                console.log(`   🗂️ System: ${relevantKeys.filter(k => k === 'attendance_list' || k === 'photos_index').length}`);
                                Alert.alert('Success', `Cleared ${relevantKeys.length} items from storage`);
                            } else {
                                console.log('ℹ️ No attendance data to clear');
                                Alert.alert('Info', 'No attendance data found to clear');
                            }
                        } catch (error) {
                            console.error('❌ Error clearing data:', error);
                            Alert.alert('Error', 'Failed to clear data');
                        }
                    }}
                >
                    <Text style={styles.debugButtonText}>Clear All Data</Text>
                </TouchableOpacity>
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
        right: 20,
        left: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    actionButton: {
        backgroundColor: '#3E89EC',
        padding: 15,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
    },
    actionButtonText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    nameInputContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 20,
        borderRadius: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    nameInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
        backgroundColor: 'white',
    },
    confirmActions: {
        flexDirection: 'row',
        gap: 10,
    },
    debugContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginBottom: 10,
    },
    debugButton: {
        backgroundColor: '#FF6B6B',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
    },
    clearButton: {
        backgroundColor: '#FF4444',
    },
    debugButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    uploadBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
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
});

export default CameraScreen;