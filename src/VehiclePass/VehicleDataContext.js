// import React, { createContext, useState, useCallback } from 'react';
// import base64 from 'react-native-base64';
// import axios from 'axios';
// import NetInfo from '@react-native-community/netinfo'; // You may need to install this package
// import { DataContext } from '../components/common/DataContext.js'; // Import DataContext

// export const VehicleDataContext = createContext();

// export const VehicleDataProvider = ({ children }) => {
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedPassNo, setSelectedPassNo] = useState(null);
//   const [vehicleOutData, setVehicleOutData] = useState(null);
//   const [processingVehicleOut, setProcessingVehicleOut] = useState(false);
//   const [vehicleData, setVehicleData] = useState({
//     inVehicles: [],
//     outVehicles: [],
//   });
//   const [alertInfo, setAlertInfo] = useState({
//     visible: false,
//     title: '',
//     message: '',
//   });
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [errorState, setErrorState] = useState(null);
  
//   // Add network error state
//   const [networkError, setNetworkError] = useState(false);
  
//   const API_BASE_URL = 'https://demo.sazss.in/Api';
//   const AUTH_CREDENTIALS = btoa('Inventory:SazsApps@123');

//   // API Service
//   const headers = {
//     Authorization: `Basic ${AUTH_CREDENTIALS}`,
//     'Content-Type': 'application/json',
//   };

//   // Check network connectivity
//   const checkNetwork = async () => {
//     try {
//       const state = await NetInfo.fetch();
//       return state.isConnected && state.isInternetReachable;
//     } catch (error) {
//       console.error('Error checking network:', error);
//       return false;
//     }
//   };

//   const postData = async (endpoint, data) => {
//     try {
//       const isConnected = await checkNetwork();
//       if (!isConnected) {
//         setNetworkError(true);
//         throw new Error('No internet connection');
//       }

//       // Create an AbortController for timeout
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
//       const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//         method: 'POST',
//         headers: headers,
//         body: JSON.stringify(data),
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);
      
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed: ${response.status}, ${errorText}`);
//       }

//       return response.json();
//     } catch (error) {
//       // Handle network errors
//       if (
//         error.name === 'AbortError' || 
//         error.message?.includes('internet') ||
//         error.message?.includes('network') || 
//         error.message?.includes('connection') ||
//         error.code === 'ECONNABORTED' ||
//         error.message?.includes('timeout')
//       ) {
//         setNetworkError(true);
//         // throw new Error('Network error. Please check your connection.');
//       }
//       // throw error;
//     }
//   };

//   const fetchData = async (endpoint) => {
//     try {
//       const isConnected = await checkNetwork();
//       if (!isConnected) {
//         setNetworkError(true);
//         // throw new Error('No internet connection');
//       }

//       // Create an AbortController for timeout
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
//       const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//         method: 'GET',
//         headers: headers,
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       if (!response.ok) {
//         throw new Error(`Server error: ${response.status}`);
//       }

//       return response.json();
//     } catch (error) {
//       // Handle network errors
//       if (
//         error.name === 'AbortError' || 
//         error.message?.includes('internet') ||
//         error.message?.includes('network') || 
//         error.message?.includes('connection') ||
//         error.code === 'ECONNABORTED' ||
//         error.message?.includes('timeout')
//       ) {
//         setNetworkError(true);
//         throw new Error('Network error. Please check your connection.');
//       }
//       throw error;
//     }
//   };

//   const fetchVehicleData = useCallback(async () => {
//     try {
//       setLoading(true);
//       setErrorState(null);
//       setNetworkError(false); // Reset network error state

//       const data = await fetchData('/SecurityGatePass');

//       if (
//         !Array.isArray(data) ||
//         data.length < 2 ||
//         !Array.isArray(data[0]) ||
//         !Array.isArray(data[1])
//       ) {
//         throw new Error('Invalid data format received from server');
//       }

//       setVehicleData({ inVehicles: data[0], outVehicles: data[1] });
//     } catch (err) {
//       console.error('Error fetching vehicle data:', err);
//       setErrorState(err.message);

//       // Check specifically for network errors based on the error message
//       if (
//         err.message?.includes('internet') ||
//         err.message?.includes('network') ||
//         err.message?.includes('connection') ||
//         err.name === 'AbortError'
//       ) {
//         setNetworkError(true);
//       } else {
//         // For other errors, show the alert
//         setAlertInfo({
//           visible: true,
//           title: 'Error',
//           message: 'Failed to load vehicle data. Pull down to refresh.',
//         });
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   const handleVehicleOut = useCallback(async (passNo) => {
//     try {
//       setSelectedPassNo(passNo);
//       const data = await fetchData(
//         `/VehicleOut?GatePassNo=${passNo}`
//       );

//       if (
//         !Array.isArray(data) ||
//         data.length === 0 ||
//         !Array.isArray(data[0])
//       ) {
//         throw new Error('Invalid response format');
//       }

//       setVehicleOutData(data[0][0]);
//       setShowDetailsModal(true);
//     } catch (error) {
//       // Don't show alert if it's a network error (we'll show the NetworkErrorModal instead)
//       if (!networkError) {
//         setAlertInfo({
//           visible: true,
//           title: 'Error',
//           message: `Failed to fetch vehicle details. ${error.message}`,
//         });
//       }
//     }
//   }, [networkError]);

//   const handleConfirmVehicleOut = useCallback(async () => {
//     try {
//       await postData('/VehicleOut', { GatePassNo: selectedPassNo });

//       setAlertInfo({
//         visible: true,
//         title: 'Success',
//         message: 'Vehicle has been marked as out.',
//       });
//       setShowDetailsModal(false);
//       fetchVehicleData();
//     } catch (error) {
//       // Don't show alert if it's a network error (we'll show the NetworkErrorModal instead)
//       if (!networkError) {
//         setAlertInfo({
//           visible: true,
//           title: 'Error',
//           message: `Failed to mark vehicle as out. ${error.message}`,
//         });
//       }
//     }
//   }, [selectedPassNo, fetchVehicleData, networkError]);

//   const handleUndoVehicleOut = async (PassNo) => {
//     try {
//       const isConnected = await checkNetwork();
//       if (!isConnected) {
//         setNetworkError(true);
//         throw new Error('No internet connection');
//       }

//       // Create an AbortController for timeout
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
//       const response = await fetch(
//         `${API_BASE_URL}/VehicleOut?PassNo=${PassNo}`,
//         {
//           method: 'DELETE',
//           headers: headers,
//           signal: controller.signal,
//         }
//       );

//       clearTimeout(timeoutId);

//       if (!response.ok) {
//         throw new Error(`Failed to return vehicle. Status: ${response.status}`);
//       }

//       setAlertInfo({
//         visible: true,
//         title: 'Success',
//         message: 'Vehicle has been returned.',
//       });
//       fetchVehicleData();
//     } catch (error) {
//       // Handle network errors
//       if (
//         error.name === 'AbortError' || 
//         error.message?.includes('internet') ||
//         error.message?.includes('network') || 
//         error.message?.includes('connection') ||
//         error.code === 'ECONNABORTED' ||
//         error.message?.includes('timeout')
//       ) {
//         setNetworkError(true);
//       } else if (!networkError) {
//         setAlertInfo({
//           visible: true,
//           title: 'Error',
//           message: `Failed to return vehicle. ${error.message}`,
//         });
//       }
//     }
//   };

//   // Add retry function for network errors
//   const retryConnection = useCallback(() => {
//     setNetworkError(false);
//     fetchVehicleData();
//   }, [fetchVehicleData]);

//   return (
//     <VehicleDataContext.Provider
//       value={{
//         vehicleData,
//         fetchVehicleData,
//         handleConfirmVehicleOut,
//         handleVehicleOut,
//         setSelectedPassNo,
//         selectedPassNo,
//         loading,
//         setLoading,
//         setRefreshing,
//         refreshing,
//         setVehicleData,
//         vehicleOutData,
//         setVehicleOutData,
//         setShowDetailsModal,
//         showDetailsModal,
//         handleUndoVehicleOut,
//         setAlertInfo,
//         alertInfo,
//         errorState,
//         setErrorState,
//         // Add network error related states and functions
//         networkError,
//         setNetworkError,
//         retryConnection,
//       }}
//     >
//       {children}
//     </VehicleDataContext.Provider>
//   );
// };


import React, { createContext, useState, useCallback, useContext } from 'react';
import base64 from 'react-native-base64';
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo'; // You may need to install this package
import { DataContext } from '../components/common/DataContext.js'; // Import DataContext
import { getStoredData } from '../components/common/AsyncStorage.js';

export const VehicleDataContext = createContext();

export const VehicleDataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPassNo, setSelectedPassNo] = useState(null);
  const [vehicleOutData, setVehicleOutData] = useState(null);
  const [processingVehicleOut, setProcessingVehicleOut] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    inVehicles: [],
    outVehicles: [],
  });
  const [alertInfo, setAlertInfo] = useState({
    visible: false,
    title: '',
    message: '',
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [errorState, setErrorState] = useState(null);
  
  // Add network error state
  const [networkError, setNetworkError] = useState(false);
  
  // Access DataContext to get selectedCompany
  const { selectedCompany } = useContext(DataContext);

  // Dynamic API configuration
  const getApiConfig = async () => {
    try {
      // Get company details from storage
      const companyData = await getStoredData('CompanyDetails');
      let currentCompany = null;

      if (companyData && selectedCompany) {
        currentCompany = companyData.find(company => company.id === selectedCompany);
      } else if (companyData && companyData.length > 0) {
        // Fallback to first company if no selected company
        currentCompany = companyData[0];
      }

      if (!currentCompany) {
        throw new Error('No company configuration found');
      }

      const { Webkey, GstNo, PassKey, Username, Password, EmployeeKey } = currentCompany;
      
      // Construct dynamic API base URL
      const API_BASE_URL = `https://${Webkey}.sazss.in/Api`;
      
      // Create dynamic auth credentials
      const BasicUserKey = Username?.length > 0 ? Username : EmployeeKey;
      const AUTH_CREDENTIALS = base64.encode(`${BasicUserKey}:${Password}`);
      
      return {
        API_BASE_URL,
        headers: {
          Authorization: `Basic ${AUTH_CREDENTIALS}`,
          'Content-Type': 'application/json',
          [PassKey]: GstNo, // Add the PassKey header like in Register
        },
        companyInfo: currentCompany
      };
    } catch (error) {
      console.error('Error getting API config:', error);
      throw new Error('Failed to load company configuration');
    }
  };

  // Check network connectivity
  const checkNetwork = async () => {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected && state.isInternetReachable;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  };

  const postData = async (endpoint, data) => {
    try {
      const isConnected = await checkNetwork();
      if (!isConnected) {
        setNetworkError(true);
        throw new Error('No internet connection');
      }

      // Get dynamic API configuration
      const { API_BASE_URL, headers } = await getApiConfig();

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed: ${response.status}, ${errorText}`);
      }

      return response.json();
    } catch (error) {
      // Handle network errors
      if (
        error.name === 'AbortError' || 
        error.message?.includes('internet') ||
        error.message?.includes('network') || 
        error.message?.includes('connection') ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout')
      ) {
        setNetworkError(true);
        // throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  };

  const fetchData = async (endpoint) => {
    try {
      const isConnected = await checkNetwork();
      if (!isConnected) {
        setNetworkError(true);
        throw new Error('No internet connection');
      }

      // Get dynamic API configuration
      const { API_BASE_URL, headers } = await getApiConfig();

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Handle network errors
      if (
        error.name === 'AbortError' || 
        error.message?.includes('internet') ||
        error.message?.includes('network') || 
        error.message?.includes('connection') ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout')
      ) {
        setNetworkError(true);
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  };

  const deleteData = async (endpoint) => {
    try {
      const isConnected = await checkNetwork();
      if (!isConnected) {
        setNetworkError(true);
        throw new Error('No internet connection');
      }

      // Get dynamic API configuration
      const { API_BASE_URL, headers } = await getApiConfig();

      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to delete. Status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      // Handle network errors
      if (
        error.name === 'AbortError' || 
        error.message?.includes('internet') ||
        error.message?.includes('network') || 
        error.message?.includes('connection') ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout')
      ) {
        setNetworkError(true);
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
  };

  const fetchVehicleData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorState(null);
      setNetworkError(false); // Reset network error state

      const data = await fetchData('/SecurityGatePass');

      if (
        !Array.isArray(data) ||
        data.length < 2 ||
        !Array.isArray(data[0]) ||
        !Array.isArray(data[1])
      ) {
        throw new Error('Invalid data format received from server');
      }

      setVehicleData({ inVehicles: data[0], outVehicles: data[1] });
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
      setErrorState(err.message);

      // Check specifically for network errors based on the error message
      if (
        err.message?.includes('internet') ||
        err.message?.includes('network') ||
        err.message?.includes('connection') ||
        err.name === 'AbortError'
      ) {
        setNetworkError(true);
      } else {
        // For other errors, show the alert
        setAlertInfo({
          visible: true,
          title: 'Error',
          message: 'Failed to load vehicle data. Pull down to refresh.',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleVehicleOut = useCallback(async (passNo) => {
    try {
      setSelectedPassNo(passNo);
      const data = await fetchData(
        `/VehicleOut?GatePassNo=${passNo}`
      );

      if (
        !Array.isArray(data) ||
        data.length === 0 ||
        !Array.isArray(data[0])
      ) {
        throw new Error('Invalid response format');
      }

      setVehicleOutData(data[0][0]);
      setShowDetailsModal(true);
    } catch (error) {
      // Don't show alert if it's a network error (we'll show the NetworkErrorModal instead)
      if (!networkError) {
        setAlertInfo({
          visible: true,
          title: 'Error',
          message: `Failed to fetch vehicle details. ${error.message}`,
        });
      }
    }
  }, [networkError]);

  const handleConfirmVehicleOut = useCallback(async () => {
    try {
      await postData('/VehicleOut', { GatePassNo: selectedPassNo });

      setAlertInfo({
        visible: true,
        title: 'Success',
        message: 'Vehicle has been marked as out.',
      });
      setShowDetailsModal(false);
      fetchVehicleData();
    } catch (error) {
      // Don't show alert if it's a network error (we'll show the NetworkErrorModal instead)
      if (!networkError) {
        setAlertInfo({
          visible: true,
          title: 'Error',
          message: `Failed to mark vehicle as out. ${error.message}`,
        });
      }
    }
  }, [selectedPassNo, fetchVehicleData, networkError]);

  const handleUndoVehicleOut = async (PassNo) => {
    try {
      await deleteData(`/VehicleOut?PassNo=${PassNo}`);

      setAlertInfo({
        visible: true,
        title: 'Success',
        message: 'Vehicle has been returned.',
      });
      fetchVehicleData();
    } catch (error) {
      // Handle network errors
      if (
        error.name === 'AbortError' || 
        error.message?.includes('internet') ||
        error.message?.includes('network') || 
        error.message?.includes('connection') ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout')
      ) {
        setNetworkError(true);
      } else if (!networkError) {
        setAlertInfo({
          visible: true,
          title: 'Error',
          message: `Failed to return vehicle. ${error.message}`,
        });
      }
    }
  };

  // Add retry function for network errors
  const retryConnection = useCallback(() => {
    setNetworkError(false);
    fetchVehicleData();
  }, [fetchVehicleData]);

  // Add function to get current API info (useful for debugging)
  const getCurrentApiInfo = useCallback(async () => {
    try {
      const config = await getApiConfig();
      return {
        baseUrl: config.API_BASE_URL,
        companyName: config.companyInfo?.CompanyName || 'Unknown',
        webkey: config.companyInfo?.Webkey || 'Unknown',
      };
    } catch (error) {
      return null;
    }
  }, []);

  return (
    <VehicleDataContext.Provider
      value={{
        vehicleData,
        fetchVehicleData,
        handleConfirmVehicleOut,
        handleVehicleOut,
        setSelectedPassNo,
        selectedPassNo,
        loading,
        setLoading,
        setRefreshing,
        refreshing,
        setVehicleData,
        vehicleOutData,
        setVehicleOutData,
        setShowDetailsModal,
        showDetailsModal,
        handleUndoVehicleOut,
        setAlertInfo,
        alertInfo,
        errorState,
        setErrorState,
        // Add network error related states and functions
        networkError,
        setNetworkError,
        retryConnection,
        // Add API info function
        getCurrentApiInfo,
      }}
    >
      {children}
    </VehicleDataContext.Provider>
  );
};
