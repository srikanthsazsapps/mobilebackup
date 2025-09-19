import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Button, Alert, Platform } from 'react-native';
import { getStoredData } from '../components/common/AsyncStorage';
import GlobalStyle from '../components/common/GlobalStyle';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid } from 'react-native';

const LocationVerifier = ({ onVerificationComplete, onCancel }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [officeLocation, setOfficeLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const ALLOWED_RADIUS = 200; 

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const companyInfo = await getStoredData("CompanyDetails");
        console.log("Company info retrieved:", companyInfo);

        if (companyInfo && Array.isArray(companyInfo) && companyInfo.length > 0) {
          const companyData = companyInfo[0];

          if (companyData && companyData.Latitude && companyData.Longitude) {
            const latitude = parseFloat(companyData.Latitude);
            const longitude = parseFloat(companyData.Longitude);

            console.log("Office coordinates:", latitude, longitude);

            if (!isNaN(latitude) && !isNaN(longitude)) {
              const locationData = { latitude, longitude };
              setOfficeLocation(locationData);
            } else {
              setError("Invalid office location coordinates");
              setIsLoading(false);
            }
          } else {
            setError("Company location coordinates missing");
            setIsLoading(false);
          }
        } else {
          setError("Company location information not found");
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing location:', error);
        setError(`Error loading company location: ${error.message}`);
        setIsLoading(false);
      }
    };

    initializeLocation();
  }, []);

  useEffect(() => {
    if (officeLocation) {
      verifyLocation();
    }
  }, [officeLocation]);

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
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      return false;
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const verifyLocation = async () => {
    console.log("Starting location verification...");
    console.log("Office location:", officeLocation);

    if (!officeLocation) {
      setError('Office location not initialized');
      setIsLoading(false);
      return;
    }

    // Ensure we have permissions before requesting location
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setError('Location permission not granted');
      setIsLoading(false);
      return;
    }

    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
      enableBackgroundLocationUpdates: false,
    });

    // Use balanced settings for faster location retrieval
    Geolocation.getCurrentPosition(
      position => {
        console.log("Position received:", position);
        handleLocationSuccess(position);
      },
      error => {
        console.log("Location error:", error);
        handleLocationError(error);
      },
      {
        enableHighAccuracy: false, // Prioritize speed over accuracy
        timeout: 5000, // Reduce timeout to 5 seconds
        maximumAge: 10000 // Accept cached locations up to 10 seconds old
      }
    );
  };

  const handleLocationSuccess = (position) => {
    setIsLoading(false);
    const { latitude, longitude } = position.coords;

    console.log("User location received:", latitude, longitude);
    setUserLocation({ latitude, longitude });

    const distance = calculateDistance(
      latitude,
      longitude,
      officeLocation.latitude,
      officeLocation.longitude
    );

    console.log("Distance from office:", distance, "meters");

    const isWithinRadius = distance <= ALLOWED_RADIUS;

    if (isWithinRadius) {
      console.log("Location verified successfully: User is within the allowed radius of the office.");
      onVerificationComplete({
        success: true,
        location: { latitude, longitude },
        message: `Location verified (${Math.round(distance)}m from office)`
      });
    } else {
      console.log("Location verification failed: User is outside the allowed radius of the office.");
      onVerificationComplete({
        success: false,
        location: { latitude, longitude },
        message: `You are ${Math.round(distance)}m from the office. Maximum allowed distance is ${ALLOWED_RADIUS}m.`
      });
    }
  };

  const handleLocationError = (error) => {
    setIsLoading(false);

    let userMessage = '';

    switch (error.code) {
      case 1:
        userMessage = 'Location permission is required. Please enable it in settings.';
        break;
      case 2:
        userMessage = 'Unable to determine location. Check if location services are enabled.';
        break;
      case 3:
        userMessage = 'Location request timed out. Ensure a stable internet connection and try again.';
        break;
      default:
        userMessage = 'An unexpected error occurred while fetching location.';
    }

    setError(userMessage);
  };

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    verifyLocation();
  };

  return (
    <View style={styles.container}>
      <Text style={StyleSheet.compose(GlobalStyle.heading5, styles.title)}>Verifying Location</Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3E89EC" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={StyleSheet.compose(GlobalStyle.heading8, styles.errorText)}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'white',
  },
  title: {
    bottom: 15,
  },
  loadingContainer: {
    bottom: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    bottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});

export default LocationVerifier;