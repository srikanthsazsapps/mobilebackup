// locationUtils.js
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const locationUtils = {
  // Calculate distance between two points using Haversine formula
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  },

  // Request location permissions
  requestLocationPermission: async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This app needs to access your location for attendance',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true; // iOS handled differently
    } catch (err) {
      console.warn(err);
      return false;
    }
  },

  // Get current position
  getCurrentPosition: () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  },

  // Verify location
  verifyLocation: async (companyLat, companyLong, allowedDistance = 100) => {
    try {
      const hasPermission = await locationUtils.requestLocationPermission();
      
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const position = await locationUtils.getCurrentPosition();
      
      const distance = locationUtils.calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        parseFloat(companyLat),
        parseFloat(companyLong)
      );

      return {
        success: distance <= allowedDistance,
        distance: Math.round(distance),
        message: distance <= allowedDistance 
          ? 'Location verified successfully'
          : `You are ${Math.round(distance)}m away from office. Maximum allowed distance is ${allowedDistance}m`,
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      };
    } catch (error) {
      console.error('Location verification error:', error);
      throw new Error('Failed to verify location. Please try again.');
    }
  }
};

export default locationUtils;