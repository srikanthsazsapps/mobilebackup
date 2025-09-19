// import {NativeModules, NativeEventEmitter, Platform} from 'react-native';
// // Import Geolocation correctly at the top level 
// import Geolocation from '@react-native-community/geolocation';

// // Import required libraries - use a more robust import approach
// let FusedLocation = null;
// let FusedLocationConstants = null;

// // Try to import the module
// if (Platform.OS === 'android') {
//   try {
//     // Import the module properly
//     const FusedLocationModule = require('react-native-fused-location');
//     FusedLocation = FusedLocationModule.default || FusedLocationModule;

//     console.log('FusedLocation imported successfully');
//   } catch (error) {
//     console.warn(
//       'react-native-fused-location not available, falling back to default implementation:',
//       error,
//     );
//     FusedLocation = null;
//   }
// }

// export class LocationManager {
//   constructor() {
//     this.isInitialized = false;
//     this.hasAndroidFusedLocation = Platform.OS === 'android' && FusedLocation;
//   }

//   async initialize() {
//     if (this.isInitialized) return;

//     if (this.hasAndroidFusedLocation) {
//       try {
//         // Skip setting priority completely since it's causing errors
//         // Just set the other parameters directly
//         console.log('Initializing FusedLocation without setting priority...');

//         await FusedLocation.setLocationInterval(10000); // Update every 10 seconds
//         await FusedLocation.setFastestLocationInterval(5000); // Fastest update interval: 5 seconds
//         await FusedLocation.setSmallestDisplacement(10); // 10 meters minimum displacement

//         this.isInitialized = true;
//         console.log('FusedLocation initialized successfully');
//       } catch (error) {
//         console.error('Failed to initialize FusedLocation:', error);
//         // Fall back to default if initialization fails
//         this.hasAndroidFusedLocation = false;
//         this.isInitialized = true;
//       }
//     } else {
//       // For iOS or when FusedLocation is not available, no initialization is needed
//       this.isInitialized = true;
//     }
//   }

//   async startLocationUpdates(callback) {
//     await this.initialize();

//     if (this.hasAndroidFusedLocation && FusedLocation) {
//       try {
//         // Set up event listener for continuous updates if needed
//         const eventEmitter = new NativeEventEmitter(
//           NativeModules.FusedLocation || {},
//         );
//         this.locationSubscription = eventEmitter.addListener(
//           'fusedLocation',
//           callback,
//         );

//         // Start location updates
//         await FusedLocation.startLocationUpdates();
//       } catch (error) {
//         console.error('Error starting location updates:', error);
//         // Fallback to regular Geolocation in case of error
//         this.hasAndroidFusedLocation = false;
//       }
//     }

//     if (!this.hasAndroidFusedLocation) {
//       // Fallback for iOS or when FusedLocation is not available
//       console.warn('Using standard Geolocation API for location updates');
//       // Implementation could be added here if needed
//     }
//   }

//   async stopLocationUpdates() {
//     if (
//       this.hasAndroidFusedLocation &&
//       FusedLocation &&
//       this.locationSubscription
//     ) {
//       try {
//         this.locationSubscription.remove();
//         await FusedLocation.stopLocationUpdates();
//       } catch (error) {
//         console.error('Error stopping location updates:', error);
//       }
//     }
//   }

//   async getCurrentLocation(options = {}) {
//     await this.initialize();

//     return new Promise(async (resolve, reject) => {
//       try {
//         if (this.hasAndroidFusedLocation && FusedLocation) {
//           try {
//             console.log(
//               'Attempting to get location with Fused Location Provider',
//             );

//             // Convert options to primitive values
//             const enableHighAccuracy = options.enableHighAccuracy === true;
//             const timeout = options.timeout ? Number(options.timeout) : 30000;

//             console.log(
//               'getFusedLocation params:',
//               enableHighAccuracy,
//               timeout,
//             );

//             // Try calling getFusedLocation with direct parameters instead of an object
//             // This avoids the ReadableNativeMap casting issue
//             const fusedLocation = await FusedLocation.getFusedLocation(
//               enableHighAccuracy, // first param: boolean
//               timeout, // second param: number
//             );

//             console.log('FusedLocation result:', fusedLocation);

//             // Format response to match Geolocation response format
//             resolve({
//               latitude: fusedLocation.latitude,
//               longitude: fusedLocation.longitude,
//               accuracy: fusedLocation.accuracy || 0,
//               altitude: fusedLocation.altitude || 0,
//               timestamp: fusedLocation.time || Date.now(),
//             });
//             return; // Early return if successful
//           } catch (error) {
//             console.warn(
//               'Fused Location error, falling back to Geolocation API:',
//               error,
//             );
//             // Fall through to Geolocation API on error
//             this.hasAndroidFusedLocation = false;
//           }
//         }

//         console.log('Using standard Geolocation API');
//         // Fallback to Geolocation API for iOS or when FusedLocation is not available
//         Geolocation.getCurrentPosition(
//           position => {
//             console.log('Geolocation position received:', position);
//             resolve({
//               latitude: position.coords.latitude,
//               longitude: position.coords.longitude,
//               accuracy: position.coords.accuracy || 0,
//               altitude: position.coords.altitude || 0,
//               timestamp: position.timestamp || Date.now(),
//             });
//           },
//           error => {
//             console.error('Geolocation error:', error);
//             reject(error);
//           },
//           {
//             enableHighAccuracy: options.enableHighAccuracy === true,
//             timeout: timeout || 30000,
//             maximumAge: options.maximumAge || 60000,
//           },
//         );
//       } catch (error) {
//         console.error('Unexpected error in getCurrentLocation:', error);
//         reject(error);
//       }
//     });
//   }
// }
import {NativeModules, NativeEventEmitter, Platform} from 'react-native';
// Import Geolocation correctly at the top level 
import Geolocation from '@react-native-community/geolocation';

// Import required libraries - use a more robust import approach
let FusedLocation = null;
let FusedLocationConstants = null;

// Try to import the module
if (Platform.OS === 'android') {
  try {
    // Import the module properly
    const FusedLocationModule = require('react-native-fused-location');
    FusedLocation = FusedLocationModule.default || FusedLocationModule;

    console.log('FusedLocation imported successfully');
  } catch (error) {
    console.warn(
      'react-native-fused-location not available, falling back to default implementation:',
      error,
    );
    FusedLocation = null;
  }
}

export class LocationManager {
  constructor() {
    this.isInitialized = false;
    this.hasAndroidFusedLocation = Platform.OS === 'android' && FusedLocation;
  }

  async initialize() {
    if (this.isInitialized) return;

    if (this.hasAndroidFusedLocation) {
      try {
        // Skip setting priority completely since it's causing errors
        // Just set the other parameters directly
        console.log('Initializing FusedLocation without setting priority...');

        await FusedLocation.setLocationInterval(10000); // Update every 10 seconds
        await FusedLocation.setFastestLocationInterval(5000); // Fastest update interval: 5 seconds
        await FusedLocation.setSmallestDisplacement(10); // 10 meters minimum displacement

        this.isInitialized = true;
        console.log('FusedLocation initialized successfully');
      } catch (error) {
        console.error('Failed to initialize FusedLocation:', error);
        // Fall back to default if initialization fails
        this.hasAndroidFusedLocation = false;
        this.isInitialized = true;
      }
    } else {
      // For iOS or when FusedLocation is not available, no initialization is needed
      this.isInitialized = true;
    }
  }

  async startLocationUpdates(callback) {
    await this.initialize();

    if (this.hasAndroidFusedLocation && FusedLocation) {
      try {
        // Set up event listener for continuous updates if needed
        const eventEmitter = new NativeEventEmitter(
          NativeModules.FusedLocation || {},
        );
        this.locationSubscription = eventEmitter.addListener(
          'fusedLocation',
          callback,
        );

        // Start location updates
        await FusedLocation.startLocationUpdates();
      } catch (error) {
        console.error('Error starting location updates:', error);
        // Fallback to regular Geolocation in case of error
        this.hasAndroidFusedLocation = false;
      }
    }

    if (!this.hasAndroidFusedLocation) {
      // Fallback for iOS or when FusedLocation is not available
      console.warn('Using standard Geolocation API for location updates');
      // Implementation could be added here if needed
    }
  }

  async stopLocationUpdates() {
    if (
      this.hasAndroidFusedLocation &&
      FusedLocation &&
      this.locationSubscription
    ) {
      try {
        this.locationSubscription.remove();
        await FusedLocation.stopLocationUpdates();
      } catch (error) {
        console.error('Error stopping location updates:', error);
      }
    }
  }

  async getCurrentLocation(options = {}) {
    await this.initialize();

    return new Promise(async (resolve, reject) => {
      try {
        if (this.hasAndroidFusedLocation && FusedLocation) {
          try {
            console.log(
              'Attempting to get location with Fused Location Provider',
            );

            // Convert options to primitive values
            const enableHighAccuracy = options.enableHighAccuracy === true;
            const timeout = options.timeout ? Number(options.timeout) : 30000;

            console.log(
              'getFusedLocation params:',
              enableHighAccuracy,
              timeout,
            );

            // Try calling getFusedLocation with direct parameters instead of an object
            // This avoids the ReadableNativeMap casting issue
            const fusedLocation = await FusedLocation.getFusedLocation(
              enableHighAccuracy, // first param: boolean
              timeout, // second param: number
            );

            console.log('FusedLocation result:', fusedLocation);

            // Format response to match Geolocation response format
            resolve({
              latitude: fusedLocation.latitude,
              longitude: fusedLocation.longitude,
              accuracy: fusedLocation.accuracy || 0,
              altitude: fusedLocation.altitude || 0,
              timestamp: fusedLocation.time || Date.now(),
            });
            return; // Early return if successful
          } catch (error) {
            console.warn(
              'Fused Location error, falling back to Geolocation API:',
              error,
            );
            // Fall through to Geolocation API on error
            this.hasAndroidFusedLocation = false;
          }
        }

        console.log('Using standard Geolocation API');
        // Extract timeout from options, providing a default value
        const timeout = options.timeout ? Number(options.timeout) : 30000;
        
        // Fallback to Geolocation API for iOS or when FusedLocation is not available
        Geolocation.getCurrentPosition(
          position => {
            console.log('Geolocation position received:', position);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy || 0,
              altitude: position.coords.altitude || 0,
              timestamp: position.timestamp || Date.now(),
            });
          },
          error => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          {
            enableHighAccuracy: options.enableHighAccuracy === true,
            timeout: timeout,
            maximumAge: options.maximumAge || 60000,
          },
        );
      } catch (error) {
        console.error('Unexpected error in getCurrentLocation:', error);
        reject(error);
      }
    });
  }
}