import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Configuration for location services
const LOCATION_CONFIG = {
  enableHighAccuracy: false,
  timeout: 30000,
  maximumAge: 60000,
  distanceFilter: 10,
};

// Maximum allowed distance from office in meters
const ALLOWED_RADIUS = 300;

export class LocationVerifier {
  constructor(navigation) {
    this.navigation = navigation;
    this.officeLocation = null;
  }

  setOfficeLocation(latitude, longitude) {
    this.officeLocation = { latitude, longitude };
  }

  // Request location permissions
  async requestLocationPermission() {
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
      return false;
    }
  }

  // Calculate distance between two points
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
             Math.cos(φ1) * Math.cos(φ2) *
             Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Handle successful location retrieval
  handleLocationSuccess(position, callbacks = {}) {
    const { onSuccess, onComplete } = callbacks;
    const { latitude, longitude } = position.coords;

    if (!this.officeLocation) {
      onComplete?.({
        success: false,
        title: 'Error',
        message: 'Office location not initialized'
      });
      return;
    }

    const distance = this.calculateDistance(
      latitude,
      longitude,
      this.officeLocation.latitude,
      this.officeLocation.longitude
    );

    const isWithinRadius = distance <= ALLOWED_RADIUS;

    const result = {
      success: isWithinRadius,
      title: isWithinRadius ? 'Success!' : 'Outside Office Range',
      message: isWithinRadius
        ? `You are within the office radius (${Math.round(distance)}m from office)`
        : `You are ${Math.round(distance)}m from the office. Maximum allowed distance is ${ALLOWED_RADIUS}m.`,
      userLocation: { latitude, longitude },
      distance
    };

    setTimeout(() => {
        this.isVerifying = false;
        onSuccess?.(result);
        onComplete?.(result);

        if (isWithinRadius) {
          this.navigation.navigate('Securityattendance');
        }
      }, 1000);
    }

  // Handle location errors
  handleLocationError(error, callback) {
    let errorMessage = 'Could not get location. ';
    switch (error.code) {
      case 1:
        errorMessage += 'Please enable location permissions in your device settings.';
        break;
      case 2:
        errorMessage += 'Please check if location services are enabled on your device.';
        break;
      case 3:
        errorMessage += 'Request timed out. Please check your internet connection and try again.';
        break;
      default:
        errorMessage += error.message;
    }

    callback?.({
      success: false,
      title: 'Location Error',
      message: errorMessage
    });
  }

  // Main verification method
  async verifyLocation(callbacks = {}) {
    const { onStart, onComplete } = callbacks;

    // Prevent multiple simultaneous verifications
    if (this.isVerifying) {
      return;
    }

    if (!this.officeLocation) {
      onComplete?.({
        success: false,
        title: 'Error',
        message: 'Office location not initialized'
      });
      return;
    }

    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      onComplete?.({
        success: false,
        title: 'Permission Denied',
        message: 'Location permission is required'
      });
      return;
    }

    this.isVerifying = true;
    onStart?.();

    Geolocation.getCurrentPosition(
      (position) => this.handleLocationSuccess(position, callbacks),
      (error) => {
        // Retry once with less accurate settings
        Geolocation.getCurrentPosition(
          (position) => this.handleLocationSuccess(position, callbacks),
          (error) => {
            this.isVerifying = false;
            this.handleLocationError(error, onComplete);
          },
          { ...LOCATION_CONFIG, enableHighAccuracy: false, timeout: 60000 }
        );
      },
      LOCATION_CONFIG
    );
  }

  // Add method to check if verification is in progress
  isVerifyingLocation() {
    return this.isVerifying;
  }
}



// import { Platform, PermissionsAndroid } from 'react-native';
// import Geolocation from '@react-native-community/geolocation';

// // Configuration for location services
// const LOCATION_CONFIG = {
//   enableHighAccuracy: false,
//   timeout: 30000,
//   maximumAge: 60000,
//   distanceFilter: 10,
// };

// // Maximum allowed distance from office in meters
// const ALLOWED_RADIUS = 20000;

// export class LocationVerifier {
//   constructor(navigation) {
//     this.navigation = navigation;
//     this.officeLocation = null;
//   }

//   setOfficeLocation(latitude, longitude) {
//     this.officeLocation = { latitude, longitude };
//   }

//   // Request location permissions
//   async requestLocationPermission() {
//     if (Platform.OS === 'ios') {
//       Geolocation.requestAuthorization();
//       return true;
//     }

//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         {
//           title: 'Location Access Required',
//           message: 'This app needs to access your location',
//           buttonNeutral: 'Ask Me Later',
//           buttonNegative: 'Cancel',
//           buttonPositive: 'OK',
//         },
//       );
//       return granted === PermissionsAndroid.RESULTS.GRANTED;
//     } catch (err) {
//       return false;
//     }
//   }

//   // Calculate distance between two points
//   calculateDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371e3;
//     const φ1 = lat1 * Math.PI/180;
//     const φ2 = lat2 * Math.PI/180;
//     const Δφ = (lat2-lat1) * Math.PI/180;
//     const Δλ = (lon2-lon1) * Math.PI/180;

//     const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
//              Math.cos(φ1) * Math.cos(φ2) *
//              Math.sin(Δλ/2) * Math.sin(Δλ/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

//     return R * c;
//   }

//   // Handle successful location retrieval
//   handleLocationSuccess(position, callbacks = {}) {
//     const { onSuccess, onComplete } = callbacks;
//     const { latitude, longitude } = position.coords;

//     if (!this.officeLocation) {
//       onComplete?.({
//         success: false,
//         title: 'Error',
//         message: 'Office location not initialized'
//       });
//       return;
//     }

//     const distance = this.calculateDistance(
//       latitude,
//       longitude,
//       this.officeLocation.latitude,
//       this.officeLocation.longitude
//     );

//     const isWithinRadius = distance <= ALLOWED_RADIUS;

//     // Format location for display with fixed decimal places
//     const formattedLocation = `Your location: [${latitude.toFixed(6)}, ${longitude.toFixed(6)}]`;

//     const result = {
//       success: isWithinRadius,
//       title: isWithinRadius ? 'Success!' : 'Outside Office Range',
//       message: isWithinRadius
//         ? `You are within the office radius (${Math.round(distance)}m from office). ${formattedLocation}`
//         : `You are ${Math.round(distance)}m from the office. Maximum allowed distance is ${ALLOWED_RADIUS}m. ${formattedLocation}`,
//       userLocation: { latitude, longitude },
//       distance
//     };

//     setTimeout(() => {
//         this.isVerifying = false;
//         onSuccess?.(result);
//         onComplete?.(result);

//         if (isWithinRadius) {
//           this.navigation.navigate('Securityattendance');
//         }
//       }, 1000);
//     }

//   // Handle location errors
//   handleLocationError(error, callback) {
//     let errorMessage = 'Could not get location. ';
//     switch (error.code) {
//       case 1:
//         errorMessage += 'Please enable location permissions in your device settings.';
//         break;
//       case 2:
//         errorMessage += 'Please check if location services are enabled on your device.';
//         break;
//       case 3:
//         errorMessage += 'Request timed out. Please check your internet connection and try again.';
//         break;
//       default:
//         errorMessage += error.message;
//     }

//     callback?.({
//       success: false,
//       title: 'Location Error',
//       message: errorMessage
//     });
//   }

//   // Main verification method
//   async verifyLocation(callbacks = {}) {
//     const { onStart, onComplete } = callbacks;

//     // Prevent multiple simultaneous verifications
//     if (this.isVerifying) {
//       return;
//     }

//     if (!this.officeLocation) {
//       onComplete?.({
//         success: false,
//         title: 'Error',
//         message: 'Office location not initialized'
//       });
//       return;
//     }

//     const hasPermission = await this.requestLocationPermission();
//     if (!hasPermission) {
//       onComplete?.({
//         success: false,
//         title: 'Permission Denied',
//         message: 'Location permission is required'
//       });
//       return;
//     }

//     this.isVerifying = true;
//     onStart?.();

//     Geolocation.getCurrentPosition(
//       (position) => this.handleLocationSuccess(position, callbacks),
//       (error) => {
//         // Retry once with less accurate settings
//         Geolocation.getCurrentPosition(
//           (position) => this.handleLocationSuccess(position, callbacks),
//           (error) => {
//             this.isVerifying = false;
//             this.handleLocationError(error, onComplete);
//           },
//           { ...LOCATION_CONFIG, enableHighAccuracy: false, timeout: 60000 }
//         );
//       },
//       LOCATION_CONFIG
//     );
//   }

//   // Add method to check if verification is in progress
//   isVerifyingLocation() {
//     return this.isVerifying;
//   }
// }








// import {Platform, PermissionsAndroid} from 'react-native';
// // Replace Geolocation with the Fused Location Provider library
// import {request, check, PERMISSIONS, RESULTS} from 'react-native-permissions';
// import {LocationManager} from './LocationManager'; // We'll create this below

// // Configuration for location services
// const LOCATION_CONFIG = {
//   enableHighAccuracy: true,
//   timeout: 30000,
//   maximumAge: 60000,
//   distanceFilter: 10,
//   // Fused Location Provider specific settings
//   priority: 'balanced', // 'high', 'balanced', 'low', or 'passive'
//   interval: 10000, // Update interval in milliseconds
//   fastestInterval: 5000, // Fastest update interval in milliseconds
// };

// // Maximum allowed distance from office in meters
// const ALLOWED_RADIUS = 500;

// export class LocationVerifier {
//   constructor(navigation) {
//     this.navigation = navigation;
//     this.officeLocation = null;
//     this.isVerifying = false;
//     this.locationManager = new LocationManager();
//   }

//   setOfficeLocation(latitude, longitude) {
//     this.officeLocation = {latitude, longitude};
//   }

//   // Request location permissions
//   async requestLocationPermission() {
//     if (Platform.OS === 'ios') {
//       const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
//       return status === RESULTS.GRANTED;
//     } else {
//       try {
//         const status = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
//         return status === RESULTS.GRANTED;
//       } catch (err) {
//         console.error('Error requesting location permission:', err);
//         return false;
//       }
//     }
//   }

//   // Calculate distance between two points using Haversine formula
//   calculateDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371e3;
//     const φ1 = (lat1 * Math.PI) / 180;
//     const φ2 = (lat2 * Math.PI) / 180;
//     const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//     const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//     const a =
//       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c;
//   }

//   // Handle successful location retrieval
//   handleLocationSuccess(position, callbacks = {}) {
//     const {onSuccess, onComplete} = callbacks;
//     const {latitude, longitude, accuracy} = position;

//     if (!this.officeLocation) {
//       onComplete?.({
//         success: false,
//         title: 'Error',
//         message: 'Office location not initialized',
//       });
//       return;
//     }

//     const distance = this.calculateDistance(
//       latitude,
//       longitude,
//       this.officeLocation.latitude,
//       this.officeLocation.longitude,
//     );

//     const isWithinRadius = distance <= ALLOWED_RADIUS;

//     // Format location for display with fixed decimal places
//     const formattedLocation = `Your location: [${latitude.toFixed(
//       6,
//     )}, ${longitude.toFixed(6)}] (Accuracy: ${Math.round(accuracy)}m)`;

//     const result = {
//       success: isWithinRadius,
//       title: isWithinRadius ? 'Success!' : 'Outside Office Range',
//       message: isWithinRadius
//         ? `You are within the office radius (${Math.round(
//             distance,
//           )}m from office). ${formattedLocation}`
//         : `You are ${Math.round(
//             distance,
//           )}m from the office. Maximum allowed distance is ${ALLOWED_RADIUS}m. ${formattedLocation}`,
//       userLocation: {latitude, longitude, accuracy},
//       distance,
//     };

//     setTimeout(() => {
//       this.isVerifying = false;
//       onSuccess?.(result);
//       onComplete?.(result);

//       if (isWithinRadius) {
//         this.navigation.navigate('Securityattendance');
//       }
//     }, 1000);
//   }

//   // Handle location errors
//   handleLocationError(error, callback) {
//     let errorMessage = 'Could not get location. ';

//     if (error.code) {
//       switch (error.code) {
//         case 1:
//           errorMessage +=
//             'Please enable location permissions in your device settings.';
//           break;
//         case 2:
//           errorMessage +=
//             'Please check if location services are enabled on your device.';
//           break;
//         case 3:
//           errorMessage +=
//             'Request timed out. Please check your internet connection and try again.';
//           break;
//         default:
//           errorMessage += error.message || 'Unknown error occurred.';
//       }
//     } else {
//       errorMessage += error.message || 'Unknown error occurred.';
//     }

//     this.isVerifying = false;
//     callback?.({
//       success: false,
//       title: 'Location Error',
//       message: errorMessage,
//     });
//   }

//   // Main verification method using Fused Location Provider
//   async verifyLocation(callbacks = {}) {
//     const {onStart, onComplete} = callbacks;

//     // Prevent multiple simultaneous verifications
//     if (this.isVerifying) {
//       return;
//     }

//     if (!this.officeLocation) {
//       onComplete?.({
//         success: false,
//         title: 'Error',
//         message: 'Office location not initialized',
//       });
//       return;
//     }

//     const hasPermission = await this.requestLocationPermission();
//     if (!hasPermission) {
//       onComplete?.({
//         success: false,
//         title: 'Permission Denied',
//         message: 'Location permission is required',
//       });
//       return;
//     }

//     this.isVerifying = true;
//     onStart?.();

//     try {
//       // Get location using the Fused Location Provider
//       const position = await this.locationManager.getCurrentLocation({
//         ...LOCATION_CONFIG,
//         numUpdates: 1, // Get just one location update
//       });

//       this.handleLocationSuccess(position, callbacks);
//     } catch (error) {
//       console.error('Location error:', error);

//       // Retry with less strict settings
//       try {
//         const position = await this.locationManager.getCurrentLocation({
//           ...LOCATION_CONFIG,
//           enableHighAccuracy: false,
//           timeout: 60000,
//           priority: 'balanced',
//         });

//         this.handleLocationSuccess(position, callbacks);
//       } catch (retryError) {
//         this.handleLocationError(retryError, onComplete);
//       }
//     }
//   }

//   // Check if verification is in progress
//   isVerifyingLocation() {
//     return this.isVerifying;
//   }
// }
