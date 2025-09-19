import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalStyle from '../components/common/GlobalStyle';

const Maps = ({ route, navigation }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [companyLocation, setCompanyLocation] = useState(null);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('punch-in');
    const [allowedRadius] = useState(20000);
    const [isLoading, setIsLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);

    const getCompanyDetails = async () => {
        try {
            const companyDetailsStr = await AsyncStorage.getItem('CompanyDetails');
            if (companyDetailsStr) {
                const companyDetails = JSON.parse(companyDetailsStr);
                if (companyDetails && companyDetails.length > 0) {
                    const company = companyDetails[0];
                    setCompanyLocation({
                        latitude: parseFloat(company.Latitude),
                        longitude: parseFloat(company.Longitude)
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching company details:', error);
            setError('Failed to fetch company location');
        }
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
    };

    const isWithinRadius = () => {
        if (!userLocation || !companyLocation) return false;
        
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            companyLocation.latitude,
            companyLocation.longitude
        );

        return distance <= allowedRadius;
    };

    const handleLocationUpdate = (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setError(null);
        
        if (companyLocation) {
            const distance = calculateDistance(
                latitude,
                longitude,
                companyLocation.latitude,
                companyLocation.longitude
            );
            
            if (distance <= allowedRadius) {
                setIsLoading(true);
                setTimeout(() => {
                    navigation.navigate('AttendanceHome', {
                        locationVerified: true,
                        mode: route.params?.mode
                    });
                }, 800);
            } else {
                setIsLoading(false);
                setShowMap(true);
            }
        }
    };

    const checkLocation = async () => {
        setIsLoading(true);
        setShowMap(false);
        
        try {
            const hasPermission = await requestLocationPermission();
            if (!hasPermission) {
                setError('Location permission denied');
                setIsLoading(false);
                return;
            }

            Geolocation.getCurrentPosition(
                handleLocationUpdate,
                error => {
                    console.error('Location Error:', error);
                    setError('Location Request Timed Out');
                    setIsLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 5000,
                    distanceFilter: 1,
                }
            );
        } catch (err) {
            console.error('Location Error:', err);
            setError('Failed to get location');
            setIsLoading(false);
        }
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            Geolocation.requestAuthorization();
            return true;
        }

        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Access Required',
                    message: 'This app needs to access your location',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.error('Permission Error:', err);
            return false;
        }
    };

    useEffect(() => {
        getCompanyDetails();
        if (route.params?.mode) {
            setMode(route.params.mode);
        }
    }, [route.params?.mode]);

    useEffect(() => {
        checkLocation();
        const watchId = Geolocation.watchPosition(
            handleLocationUpdate,
            error => {
                console.error('Watch Position Error:', error);
                setError('Location Request Timed Out');
                setIsLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 5000,
                distanceFilter: 1,
            }
        );

        return () => Geolocation.clearWatch(watchId);
    }, [companyLocation]);

    return (
        <View style={styles.container}>
            <View style={styles.modalContent}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#7AB134" />
                        <Text style={styles.loadingText}>Checking location...</Text>
                    </View>
                ) : (
                    <>
                        {showMap && (
                            <View style={styles.mapContainer}>
                                <MapView
                                    style={styles.map}
                                    provider={PROVIDER_GOOGLE}
                                    region={userLocation ? {
                                        ...userLocation,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                    } : null}
                                >
                                    {userLocation && (
                                        <Marker
                                            coordinate={userLocation}
                                            title="Your Location"
                                            pinColor="blue"
                                        />
                                    )}
                                    {companyLocation && (
                                        <>
                                            <Marker
                                                coordinate={companyLocation}
                                                title="Company Location"
                                                pinColor="red"
                                            />
                                            <Circle
                                                center={companyLocation}
                                                radius={allowedRadius}
                                                fillColor="rgba(62, 137, 236, 0.2)"
                                                strokeColor="rgba(62, 137, 236, 0.5)"
                                            />
                                        </>
                                    )}
                                </MapView>
                            </View>
                        )}

                        <View style={styles.bottomContent}>
                            {error ? (
                                <Text style={styles.errorText}>Error: {error}</Text>
                            ) : (
                                <>
                                    {userLocation && !isWithinRadius() && showMap && (
                                        <>
                                            <Text style={[GlobalStyle.heading6, styles.statusText]}>
                                                Status: Outside company radius
                                            </Text>
                                            <View style={styles.buttonContainer}>
                                                <TouchableOpacity
                                                    style={[styles.button, styles.cancelButton]}
                                                    onPress={() => navigation.navigate('AttendanceHome', {
                                                        locationVerified: false,
                                                        mode: route.params?.mode
                                                    })}
                                                >
                                                    <Text style={[GlobalStyle.H6, styles.cancelButtonText]}>Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={[styles.button, styles.verifyButton]}
                                                    onPress={checkLocation}
                                                >
                                                    <Text style={[GlobalStyle.H6, styles.buttonText]}>Verify</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    )}
                                </>
                            )}
                        </View>
                    </>
                )}
            </View>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: wp('90%'),
        backgroundColor: 'white',
        borderRadius: wp('4%'),
        padding: wp('4%'),
        maxHeight: hp('80%'),
    },
    mapContainer: {
        height: hp('40%'),
        borderRadius: wp('2%'),
        overflow: 'hidden',
    },
    map: {
        flex: 1,
    },
    bottomContent: {
        marginTop: hp('2%'),
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: hp('2%'),
    },
    loadingText: {
        marginTop: hp('1%'),
        color: '#7AB134',
        fontSize: wp('4%'),
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: hp('1%'),
    },
    statusText: {
        textAlign: 'center',
        marginBottom: hp('2%'),
        fontWeight: '600',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: wp('4%'),
    },
    button: {
        flex: 1,
        padding: hp('1.5%'),
        borderRadius: wp('35%'),
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#C16161',
    },
    verifyButton: {
        backgroundColor: '#7AB134',
    },
    buttonText: {
        color: 'white',
    },
    cancelButtonText: {
        color: 'white',
    }
});

export default Maps;



// import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import Geolocation from '@react-native-community/geolocation';
// import { PermissionsAndroid, Platform } from 'react-native';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import GlobalStyle from '../components/common/GlobalStyle';

// const Maps = ({ route, navigation }) => {
//     const [userLocation, setUserLocation] = useState(null);
//     const [error, setError] = useState(null);
//     const [mode, setMode] = useState('punch-in');

    
//     useEffect(() => {
//         if (route.params?.mode === 'punch-out') {
//             setMode('punch-out');
//         } else if (route.params?.mode === 'punch-in') {
//             setMode('punch-in');
//         }
//     }, [route.params?.mode]);

//     const requestLocationPermission = async () => {
//         if (Platform.OS === 'ios') {
//             Geolocation.requestAuthorization();
//             return true;
//         }

//         try {
//             const granted = await PermissionsAndroid.request(
//                 PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//                 {
//                     title: 'Location Access Required',
//                     message: 'This app needs to access your location',
//                     buttonNeutral: 'Ask Me Later',
//                     buttonNegative: 'Cancel',
//                     buttonPositive: 'OK',
//                 }
//             );
//             return granted === PermissionsAndroid.RESULTS.GRANTED;
//         } catch (err) {
//             return false;
//         }
//     };

//     const locationConfig = {
//         enableHighAccuracy: true,
//         timeout: 30000,
//         maximumAge: 60000,
//         distanceFilter: 10,
//     };

//     const handleLocationSuccess = (position) => {
//         const { latitude, longitude } = position.coords;
//         setUserLocation({ latitude, longitude });
//     };

//     const handleLocationError = (error) => {
//         setError(error.message);
//     };

//     const checkLocation = async () => {
//         const hasPermission = await requestLocationPermission();
//         if (!hasPermission) {
//             setError('Location permission denied');
//             return;
//         }

//         Geolocation.getCurrentPosition(
//             position => handleLocationSuccess(position),
//             handleLocationError,
//             locationConfig
//         );
//     };

//     useEffect(() => {
//         checkLocation();
//     }, []);

//     const navigateToSelfie = () => {
//         navigation.navigate('AttendanceHome', {
//             mode: mode,
//             returnMode: mode === 'punch-in' ? 'punch-out' : 'punch-in',
//             ...(userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : {}),
//         });
//     };

//     return (
//         <View style={styles.container}>
//             <View style={styles.header}>
//                 <Text style={StyleSheet.compose(GlobalStyle.heading1, styles.headerText)}>
//                     {mode === 'punch-in' ? 'Punch In Location' : 'Punch Out Location'}
//                 </Text>
//             </View>

//             <MapView
//                 style={styles.map}
//                 provider={PROVIDER_GOOGLE}
//                 region={userLocation ? {
//                     ...userLocation,
//                     latitudeDelta: 0.01,
//                     longitudeDelta: 0.01,
//                 } : null}
//             >
//                 {userLocation && (
//                     <Marker
//                         coordinate={userLocation}
//                         title="Your Location"
//                     />
//                 )}
//             </MapView>

//             <View style={styles.bottomContainer}>
//                 {error ? (
//                     <Text style={styles.statusText}>Error: {error}</Text>
//                 ) : (
//                     userLocation && (
//                         <>
//                             <Text style={StyleSheet.compose(GlobalStyle.Body, styles.statusText)}>
//                                 Latitude: {userLocation.latitude}
//                             </Text>
//                             <Text style={StyleSheet.compose(GlobalStyle.Body, styles.statusText)}>
//                                 Longitude: {userLocation.longitude}
//                             </Text>
//                         </>
//                     )
//                 )}

//                 <TouchableOpacity
//                     style={styles.verifyButton}
//                     onPress={navigateToSelfie}
//                 >
//                     <Text style={StyleSheet.compose(GlobalStyle.H6, styles.buttonText)}>
//                         {mode === 'punch-in' ? 'Verify Punch In Location' : 'Verify Punch Out Location'}
//                     </Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },
//     header: {
//         backgroundColor: '#3E89EC',
//         // padding: hp('2%'), 
//         alignItems: 'center',
//         justifyContent: 'center',
//         paddingVertical: hp('3%'),
        
//     },
//     headerText: {
//         // color: 'white',
//         fontSize: wp('6%'), 
//         // fontWeight: 'bold',
//         // fontFamily: 'Cabin-bold',
//     },
//     map: {
//         flex: 1,
//     },
//     bottomContainer: {
//         position: 'absolute',
//         bottom: 0,
//         left: 0,
//         right: 0,
//         backgroundColor: 'white',
//         padding: wp('5%'), 
//         borderTopLeftRadius: wp('4%'), 
//         borderTopRightRadius: wp('4%'),
//         elevation: 5,
//     },
//     statusText: {
//         // fontSize: wp('4%'), 
//         textAlign: 'center',
//         marginBottom: hp('1%'), 
//         // fontWeight: '500',
//         // fontFamily: 'Cabin-Regular',
//     },
//     verifyButton: {
//         padding: hp('1.5%'), 
//         borderRadius: wp('35%'), 
//         alignItems: 'center',
//         backgroundColor: '#3E89EC',
//     },
//     buttonText: {
//         // color: 'white',
//         // fontSize: wp('4.5%'), 
//         // fontWeight: '500',
//         // fontFamily: 'Cabin-Regular',
//         justifyContent:'center',
//     }
// });

// export default Maps;