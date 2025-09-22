import React, { createContext, useState, useEffect, useCallback } from 'react';
import { getStoredData } from './AsyncStorage';
import base64 from 'react-native-base64';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DataContext = createContext();

export const DASHBOARD_TYPES = {
  SALES: 'sales',
  PURCHASE: 'purchase',
};

const combineDateTime = (date, time) => {
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
  return combined.toISOString().slice(0, 19).replace('T', ' ');
};

const GetUserMenus = async userData => {
  try {
    const { Webkey, GstNo, Username, Password, UserId } = userData || {};
    console.log('GetUserMenus Request:', {
      Username: Username || 'N/A',
      Password: Password || userData?.PassKey || 'N/A',
      EmployeeKey: userData?.EmployeeKey || 'N/A',
      EmployeeId: userData?.EmployeeId || 'N/A',
      UserId,
      Webkey,
      GstNo
    });

    if (!Username || !Password || !Webkey || !UserId) {
      console.error('GetUserMenus Validation Error:', {
        Username: Username || 'N/A',
        Password: Password || userData?.PassKey || 'N/A',
        EmployeeKey: userData?.EmployeeKey || 'N/A',
        EmployeeId: userData?.EmployeeId || 'N/A',
        Error: 'Missing required credentials: Username, Password, Webkey, or UserId'
      });
      throw new Error('Missing required credentials for GetUserMenus');
    }

    const authHeader = `Basic ${base64.encode(`${Username.trim()}:${Password.trim()}`)}`;
    const apiUrl = `https://${Webkey}.sazss.in/Api/UserMenus?UserId=${UserId}`;
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: authHeader,
      },
    });
    console.log('GetUserMenus Success:', {
      Username: Username || 'N/A',
      Password: Password || userData?.PassKey || 'N/A',
      EmployeeKey: userData?.EmployeeKey || 'N/A',
      EmployeeId: userData?.EmployeeId || 'N/A',
      ResponseData: response.data
    });
    return response.data;
  } catch (error) {
    console.error('Error during GetUserMenus API call:', {
      Username: userData?.Username || 'N/A',
      Password: userData?.Password || userData?.PassKey || 'N/A',
      EmployeeKey: userData?.EmployeeKey || 'N/A',
      EmployeeId: userData?.EmployeeId || 'N/A',
      Error: error.message,
      Response: error.response?.data || 'No response data'
    });
    throw error;
  }
};

const GatherData = async (userData, fromDate, toDate, dashName) => {
  try {
    const { Webkey, GstNo, Username, Password } = userData || {};
    console.log('GatherData Request:', {
      Username: Username || 'N/A',
      Password: Password || userData?.PassKey || 'N/A',
      EmployeeKey: userData?.EmployeeKey || 'N/A',
      EmployeeId: userData?.EmployeeId || 'N/A',
      Webkey,
      GstNo,
      DashName: dashName,
      FromDate: fromDate,
      ToDate: toDate
    });

    if (!Username || !Password || !Webkey) {
      console.error('GatherData Validation Error:', {
        Username: Username || 'N/A',
        Password: Password || userData?.PassKey || 'N/A',
        EmployeeKey: userData?.EmployeeKey || 'N/A',
        EmployeeId: userData?.EmployeeId || 'N/A',
        Error: 'Missing required credentials: Username, Password, or Webkey'
      });
      throw new Error('Missing required credentials for GatherData');
    }

    const authHeader = `Basic ${base64.encode(`${Username.trim()}:${Password.trim()}`)}`;
    const apiUrl = `https://${Webkey}.sazss.in/Api/DashesDatas`;
    const response = await axios.post(
      apiUrl,
      {
        dashname: dashName,
        fromDate: fromDate,
        toDate: toDate,
      },
      {
        headers: {
          Authorization: authHeader,
        },
      },
    );
    console.log('GatherData Success:', {
      Username: Username || 'N/A',
      Password: Password || userData?.PassKey || 'N/A',
      EmployeeKey: userData?.EmployeeKey || 'N/A',
      EmployeeId: userData?.EmployeeId || 'N/A',
      ResponseData: response.data
    });
    return response.data;
  } catch (error) {
    console.error('Error during GatherData API call:', {
      Username: userData?.Username || 'N/A',
      Password: userData?.Password || userData?.PassKey || 'N/A',
      EmployeeKey: userData?.EmployeeKey || 'N/A',
      EmployeeId: userData?.EmployeeId || 'N/A',
      Error: error.message,
      Response: error.response?.data || 'No response data'
    });
    throw error;
  }
};

// const AttendanceGatherData = async (userData, actionData) => {
//   try {
//     const { Webkey, Username, Password, EmployeeKey, EmployeeId } = userData || {};
//     console.log('AttendanceGatherData Request:', {
//       Username: Username || 'N/A',
//       Password: Password || userData?.PassKey || 'N/A',
//       EmployeeKey: EmployeeKey || 'N/A',
//       EmployeeId: EmployeeId || 'N/A',
//       Webkey,
//       ActionData: actionData
//     });

//     if (!Webkey) {
//       console.error('AttendanceGatherData Validation Error:', {
//         Username: Username || 'N/A',
//         Password: Password || userData?.PassKey || 'N/A',
//         EmployeeKey: EmployeeKey || 'N/A',
//         EmployeeId: EmployeeId || 'N/A',
//         Webkey: Webkey || 'N/A',
//         Error: 'Missing required Webkey'
//       });
//       throw new Error('Missing required Webkey for AttendanceGatherData');
//     }

//     if (!actionData || !actionData.EmId) {
//       console.error('AttendanceGatherData Validation Error:', {
//         Username: Username || 'N/A',
//         Password: Password || userData?.PassKey || 'N/A',
//         EmployeeKey: EmployeeKey || 'N/A',
//         EmployeeId: EmployeeId || 'N/A',
//         Webkey: Webkey || 'N/A',
//         Error: 'Missing required EmId in actionData'
//       });
//       throw new Error('Missing required EmId in actionData');
//     }

//     const apiUrl = `https://${Webkey}.sazss.in/Api/EmployeeAttendance`;
//     const response = await axios.post(apiUrl, {
//       Type: actionData.Type,
//       EmId: actionData.EmId,
//       Shift: actionData.Shift,
//       CreatedBy: actionData.CreatedBy,
//       Latitude: actionData.Latitude || userData?.Latitude || '0',
//       Longitude: actionData.Longitude || userData?.Longitude || '0',
//       ElapsedTime: actionData.ElapsedTime || '00:00:00',
//       Timestamp: actionData.Timestamp || new Date().toISOString()
//     });
//     console.log('AttendanceGatherData Success:', {
//       Username: Username || 'N/A',
//       Password: Password || userData?.PassKey || 'N/A',
//       EmployeeKey: EmployeeKey || 'N/A',
//       EmployeeId: EmployeeId || 'N/A',
//       ResponseData: response.data,
//       Timestamp: new Date().toISOString()
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error during AttendanceGatherData API call:', {
//       Username: userData?.Username || 'N/A',
//       Password: userData?.Password || userData?.PassKey || 'N/A',
//       EmployeeKey: userData?.EmployeeKey || 'N/A',
//       EmployeeId: userData?.EmployeeId || 'N/A',
//       Webkey: userData?.Webkey || 'N/A',
//       Error: error.message,
//       Response: error.response?.data || 'No response data',
//       Timestamp: new Date().toISOString()
//     });
//     throw error;
//   }
// };

const AttendanceGatherData = async (userData, actionData) => {
  try {
    const { Webkey, Username, Password, EmployeeKey, EmployeeId } = userData || {};
    console.log('AttendanceGatherData Request:', {
      Username: Username || 'N/A',
      Password: Password || userData?.PassKey || 'N/A',
      EmployeeKey: EmployeeKey || 'N/A',
      EmployeeId: EmployeeId || 'N/A',
      Webkey,
      ActionData: actionData
    });

    if (!Webkey) {
      console.error('AttendanceGatherData Validation Error:', {
        Username: Username || 'N/A',
        Password: Password || userData?.PassKey || 'N/A',
        EmployeeKey: EmployeeKey || 'N/A',
        EmployeeId: EmployeeId || 'N/A',
        Webkey: Webkey || 'N/A',
        Error: 'Missing required Webkey'
      });
      throw new Error('Missing required Webkey for AttendanceGatherData');
    }

    if (!actionData || !actionData.EmId) {
      console.error('AttendanceGatherData Validation Error:', {
        Username: Username || 'N/A',
        Password: Password || userData?.PassKey || 'N/A',
        EmployeeKey: EmployeeKey || 'N/A',
        EmployeeId: EmployeeId || 'N/A',
        Webkey: Webkey || 'N/A',
        Error: 'Missing required EmId in actionData'
      });
      throw new Error('Missing required EmId in actionData');
    }

    const apiUrl = `https://${Webkey}.sazss.in/Api/EmployeeAttendance`;
    const response = await axios.post(apiUrl, {
      Type: actionData.Type,
      EmId: actionData.EmId || EmployeeId, // Use EmployeeId if EmId is missing
      Shift: actionData.Shift,
      CreatedBy: actionData.CreatedBy,
      Latitude: actionData.Latitude || userData?.Latitude || '0',
      Longitude: actionData.Longitude || userData?.Longitude || '0',
      ElapsedTime: actionData.ElapsedTime || '00:00:00',
      Timestamp: actionData.Timestamp || new Date().toISOString()
    });
    console.log('AttendanceGatherData Success:', {
      Username: Username || 'N/A',
      Password: Password || userData?.PassKey || 'N/A',
      EmployeeKey: EmployeeKey || 'N/A',
      EmployeeId: EmployeeId || 'N/A',
      ResponseData: response.data,
      Timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error during AttendanceGatherData API call:', {
      Username: userData?.Username || 'N/A',
      Password: userData?.Password || userData?.PassKey || 'N/A',
      EmployeeKey: userData?.EmployeeKey || 'N/A',
      EmployeeId: userData?.EmployeeId || 'N/A',
      Webkey: userData?.Webkey || 'N/A',
      Error: error.message,
      Response: error.response?.data || 'No response data',
      Timestamp: new Date().toISOString()
    });
    throw error;
  }
};


export const DataProvider = ({ children }) => {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [userMenus, setUserMenus] = useState([]);
  const [currentDashboardType, setCurrentDashboardType] = useState(DASHBOARD_TYPES.SALES);
  const [attendanceData, setAttendanceData] = useState(null);
  const [isDateInitialized, setIsDateInitialized] = useState(false);

  const initializeDates = useCallback(() => {
    const defaultTime = new Date();
    defaultTime.setHours(8, 0, 0, 0);
    const now = new Date();
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    if (localTime.getHours() < 8) {
      const yesterday = new Date(localTime);
      yesterday.setDate(localTime.getDate() - 1);
      setStartDate(yesterday);
      setEndDate(localTime);
    } else {
      const tomorrow = new Date(localTime);
      tomorrow.setDate(localTime.getDate() + 1);
      setStartDate(localTime);
      setEndDate(tomorrow);
    }
    setStartTime(defaultTime);
    setEndTime(defaultTime);
    setIsDateInitialized(true);
  }, []);

  useEffect(() => {
    initializeDates();
  }, [initializeDates]);

  const formatDate = date => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = time => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const setDefaultTimeTo8AM = date => {
    const localDate = new Date(date);
    localDate.setHours(8, 0, 0, 0);
    const timezoneOffset = localDate.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(localDate.getTime() - timezoneOffset);
    return adjustedDate;
  };

  useEffect(() => {
    const setDate = async () => {
      const defaultTime = setDefaultTimeTo8AM(new Date());
      setStartTime(defaultTime);
      setEndTime(defaultTime);

      const now = new Date();
      const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

      if (localTime.getHours() < 8) {
        const yesterday = new Date(localTime);
        yesterday.setDate(localTime.getDate() - 1);
        setStartDate(yesterday);
        setEndDate(localTime);
      } else {
        const tomorrow = new Date(localTime);
        tomorrow.setDate(localTime.getDate() + 1);
        setStartDate(localTime);
        setEndDate(tomorrow);
      }
    };
    setDate();
  }, []);

  useEffect(() => {
    const SetCompany = async () => {
      const localCom = await AsyncStorage.getItem('SelectedCompany');
      if (localCom) {
        setSelectedCompany(JSON.parse(localCom));
      } else {
        setSelectedCompany(0);
      }
    };
    SetCompany();
  }, []);

  const RefreshData = async () => {
    await AsyncStorage.setItem('SelectedCompany', JSON.stringify(selectedCompany));
    fetchData();
  };

  const switchDashboardType = (dashType) => {
    setCurrentDashboardType(dashType);
    fetchData(dashType);
  };

  const fetchDataCustom = async (startDatee, endDatee, dashType = currentDashboardType) => {
    try {
      const defaultTime = setDefaultTimeTo8AM(new Date());
      setLoading(true);
      const localData = await getStoredData('CompanyDetails');
      console.log('fetchDataCustom CompanyDetails:', {
        Username: localData[0]?.Username || 'N/A',
        Password: localData[0]?.Password || localData[0]?.PassKey || 'N/A',
        EmployeeKey: localData[0]?.EmployeeKey || 'N/A',
        EmployeeId: localData[0]?.EmployeeId || 'N/A',
        CompanyDetails: localData
      });

      if (!localData || localData.length === 0) {
        console.error('fetchDataCustom Error:', {
          Username: 'N/A',
          Password: 'N/A',
          EmployeeKey: 'N/A',
          EmployeeId: 'N/A',
          Error: 'No company data available'
        });
        throw new Error('No company data available');
      }

      const formattedFromDate = combineDateTime(startDatee, defaultTime);
      const formattedToDate = combineDateTime(endDatee, defaultTime);
      
      // Skip GetUserMenus for Role: "0" (Attendance users)
      if (localData[0]?.Role !== '0') {
        const menus = await GetUserMenus(localData[0]);
        setUserMenus(menus[0]);
      } else {
        console.log('fetchDataCustom: Skipping GetUserMenus for Role: "0"', {
          Username: localData[0]?.Username || 'N/A',
          Password: localData[0]?.Password || localData[0]?.PassKey || 'N/A',
          EmployeeKey: localData[0]?.EmployeeKey || 'N/A',
          EmployeeId: localData[0]?.EmployeeId || 'N/A'
        });
        setUserMenus([]);
      }

      if (selectedCompany === 0) {
        const allData = [];
        for (const obj of localData) {
          if (obj.Role !== '0') {
            const data = await GatherData(obj, formattedFromDate, formattedToDate, dashType);
            if (data && Array.isArray(data)) {
              allData.push(...data);
            }
          }
        }
        setDailyData(allData);
        console.log('fetchDataCustom All Data:', {
          Username: localData[0]?.Username || 'N/A',
          Password: localData[0]?.Password || localData[0]?.PassKey || 'N/A',
          EmployeeKey: localData[0]?.EmployeeKey || 'N/A',
          EmployeeId: localData[0]?.EmployeeId || 'N/A',
          Data: allData
        });
      } else if (selectedCompany !== 0) {
        const selectedItem = localData.filter(val => val.id === selectedCompany);
        if (selectedItem[0]?.Role !== '0') {
          const data = await GatherData(selectedItem[0], formattedFromDate, formattedToDate, dashType);
          setDailyData(data);
          console.log('fetchDataCustom Selected Data:', {
            Username: selectedItem[0]?.Username || 'N/A',
            Password: selectedItem[0]?.Password || selectedItem[0]?.PassKey || 'N/A',
            EmployeeKey: selectedItem[0]?.EmployeeKey || 'N/A',
            EmployeeId: selectedItem[0]?.EmployeeId || 'N/A',
            Data: data
          });
        } else {
          console.log('fetchDataCustom: Skipping GatherData for Role: "0"', {
            Username: selectedItem[0]?.Username || 'N/A',
            Password: selectedItem[0]?.Password || selectedItem[0]?.PassKey || 'N/A',
            EmployeeKey: selectedItem[0]?.EmployeeKey || 'N/A',
            EmployeeId: selectedItem[0]?.EmployeeId || 'N/A'
          });
          setDailyData([]);
        }
      }
    } catch (error) {
      console.error('Error fetching stored data in fetchDataCustom:', {
        Username: localData ? localData[0]?.Username : 'N/A',
        Password: localData ? (localData[0]?.Password || localData[0]?.PassKey) : 'N/A',
        EmployeeKey: localData ? localData[0]?.EmployeeKey : 'N/A',
        EmployeeId: localData ? localData[0]?.EmployeeId : 'N/A',
        Error: error.message,
        Response: error.response?.data || 'No response data'
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const fetchData = async (dashType = currentDashboardType) => {
    try {
      setLoading(true);
      const localData = await getStoredData('CompanyDetails');
      console.log('fetchData CompanyDetails:', {
        Username: localData[0]?.Username || 'N/A',
        Password: localData[0]?.Password || localData[0]?.PassKey || 'N/A',
        EmployeeKey: localData[0]?.EmployeeKey || 'N/A',
        EmployeeId: localData[0]?.EmployeeId || 'N/A',
        CompanyDetails: localData
      });

      if (!localData || localData.length === 0) {
        console.error('fetchData Error:', {
          Username: 'N/A',
          Password: 'N/A',
          EmployeeKey: 'N/A',
          EmployeeId: 'N/A',
          Error: 'No company data available'
        });
        throw new Error('No company data available');
      }

      const formattedFromDate = combineDateTime(startDate, startTime);
      const formattedToDate = combineDateTime(endDate, endTime);

      // Skip GetUserMenus for Role: "0" (Attendance users)
      if (localData[0]?.Role !== '0') {
        const menus = await GetUserMenus(localData[0]);
        setUserMenus(menus[0]);
      } else {
        console.log('fetchData: Skipping GetUserMenus for Role: "0"', {
          Username: localData[0]?.Username || 'N/A',
          Password: localData[0]?.Password || localData[0]?.PassKey || 'N/A',
          EmployeeKey: localData[0]?.EmployeeKey || 'N/A',
          EmployeeId: localData[0]?.EmployeeId || 'N/A'
        });
        setUserMenus([]);
      }

      if (selectedCompany === 0) {
        const allData = [];
        for (const obj of localData) {
          if (obj.Role !== '0') {
            const data = await GatherData(obj, formattedFromDate, formattedToDate, dashType);
            if (data && Array.isArray(data)) {
              allData.push(...data);
            }
          }
        }
        setDailyData(allData);
        console.log('fetchData All Data:', {
          Username: localData[0]?.Username || 'N/A',
          Password: localData[0]?.Password || localData[0]?.PassKey || 'N/A',
          EmployeeKey: localData[0]?.EmployeeKey || 'N/A',
          EmployeeId: localData[0]?.EmployeeId || 'N/A',
          Data: allData
        });
      } else if (selectedCompany !== 0) {
        const selectedItem = localData.filter(val => val.id === selectedCompany);
        if (selectedItem[0]?.Role !== '0') {
          const data = await GatherData(selectedItem[0], formattedFromDate, formattedToDate, dashType);
          setDailyData(data);
          console.log('fetchData Selected Data:', {
            Username: selectedItem[0]?.Username || 'N/A',
            Password: selectedItem[0]?.Password || selectedItem[0]?.PassKey || 'N/A',
            EmployeeKey: selectedItem[0]?.EmployeeKey || 'N/A',
            EmployeeId: selectedItem[0]?.EmployeeId || 'N/A',
            Data: data
          });
        } else {
          console.log('fetchData: Skipping GatherData for Role: "0"', {
            Username: selectedItem[0]?.Username || 'N/A',
            Password: selectedItem[0]?.Password || selectedItem[0]?.PassKey || 'N/A',
            EmployeeKey: selectedItem[0]?.EmployeeKey || 'N/A',
            EmployeeId: selectedItem[0]?.EmployeeId || 'N/A'
          });
          setDailyData([]);
        }
      }
    } catch (error) {
      console.error('Error fetching stored data in fetchData:', {
        Username: localData ? localData[0]?.Username : 'N/A',
        Password: localData ? (localData[0]?.Password || localData[0]?.PassKey) : 'N/A',
        EmployeeKey: localData ? localData[0]?.EmployeeKey : 'N/A',
        EmployeeId: localData ? localData[0]?.EmployeeId : 'N/A',
        Error: error.message,
        Response: error.response?.data || 'No response data'
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const SetToday = (dashType = currentDashboardType) => {
    const defaultTime = setDefaultTimeTo8AM(new Date());
    const now = new Date();
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    if (localTime.getHours() < 8) {
      const yesterday = new Date(localTime);
      yesterday.setDate(localTime.getDate() - 1);
      fetchDataCustom(yesterday, localTime, dashType);
      setStartDate(yesterday);
      setEndDate(localTime);
    } else {
      const tomorrow = new Date(localTime);
      tomorrow.setDate(localTime.getDate() + 1);
      fetchDataCustom(localTime, tomorrow, dashType);
      setStartDate(localTime);
      setEndDate(tomorrow);
    }
    setStartTime(defaultTime);
    setEndTime(defaultTime);
  };

  const SetYesterday = (dashType = currentDashboardType) => {
    const defaultTime = setDefaultTimeTo8AM(new Date());
    const now = new Date();
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    if (localTime.getHours() < 8) {
      const dayBeforeYesterday = new Date(localTime);
      dayBeforeYesterday.setDate(localTime.getDate() - 2);
      const yesterday = new Date(localTime);
      yesterday.setDate(localTime.getDate() - 1);
      fetchDataCustom(dayBeforeYesterday, yesterday, dashType);
      setStartDate(dayBeforeYesterday);
      setEndDate(yesterday);
    } else {
      const yesterday = new Date(localTime);
      yesterday.setDate(localTime.getDate() - 1);
      fetchDataCustom(yesterday, localTime, dashType);
      setStartDate(yesterday);
      setEndDate(localTime);
    }
    setStartTime(defaultTime);
    setEndTime(defaultTime);
  };

  const SetWeek = (dashType = currentDashboardType) => {
    const defaultTime = setDefaultTimeTo8AM(new Date());
    const now = new Date();
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const dayOfWeek = localTime.getDay();
    const startOfWeek = new Date(localTime);
    startOfWeek.setDate(localTime.getDate() - dayOfWeek);
    startOfWeek.setHours(8, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(8, 0, 0, 0);
    fetchDataCustom(startOfWeek, endOfWeek, dashType);
    setStartDate(startOfWeek);
    setEndDate(endOfWeek);
    setStartTime(defaultTime);
    setEndTime(defaultTime);
  };

  const SetMonth = (dashType = currentDashboardType) => {
    const defaultTime = setDefaultTimeTo8AM(new Date());
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 8, 0, 0, 0);
    fetchDataCustom(startOfMonth, endOfMonth, dashType);
    setStartDate(startOfMonth);
    setEndDate(endOfMonth);
    setStartTime(defaultTime);
    setEndTime(defaultTime);
  };

  const processAttendanceAction = async (actionData) => {
    try {
      setLoading(true);
      const localData = await getStoredData('CompanyDetails');
      console.log('processAttendanceAction CompanyDetails:', {
        Username: localData[0]?.Username || 'N/A',
        Password: localData[0]?.Password || localData[0]?.PassKey || 'N/A',
        EmployeeKey: localData[0]?.EmployeeKey || 'N/A',
        EmployeeId: localData[0]?.EmployeeId || 'N/A',
        CompanyDetails: localData
      });

      if (!localData || localData.length === 0) {
        console.error('processAttendanceAction Error:', {
          Username: 'N/A',
          Password: 'N/A',
          EmployeeKey: 'N/A',
          EmployeeId: 'N/A',
          Error: 'No company data available'
        });
        throw new Error('No company data available');
      }

      const currentCompany = localData.find((val) => val.id === selectedCompany) || localData[0];
      if (!currentCompany.Webkey || !actionData.EmId) {
        console.error('processAttendanceAction Validation Error:', {
          Username: currentCompany?.Username || 'N/A',
          Password: currentCompany?.Password || currentCompany?.PassKey || 'N/A',
          EmployeeKey: currentCompany?.EmployeeKey || 'N/A',
          EmployeeId: currentCompany?.EmployeeId || 'N/A',
          Error: 'Missing Webkey or EmId'
        });
        throw new Error('Missing Webkey or EmId');
      }

      const updatedActionData = {
        ...actionData,
        Timestamp: new Date().toISOString(),
      };
      const response = await AttendanceGatherData(currentCompany, updatedActionData);
      console.log('processAttendanceAction Success:', {
        Username: currentCompany?.Username || 'N/A',
        Password: currentCompany?.Password || currentCompany?.PassKey || 'N/A',
        EmployeeKey: currentCompany?.EmployeeKey || 'N/A',
        EmployeeId: currentCompany?.EmployeeId || 'N/A',
        ResponseData: response
      });
      setAttendanceData(response);
      return response;
    } catch (error) {
      console.error('Attendance action failed:', {
        Username: currentCompany?.Username || 'N/A',
        Password: currentCompany?.Password || currentCompany?.PassKey || 'N/A',
        EmployeeKey: currentCompany?.EmployeeKey || 'N/A',
        EmployeeId: currentCompany?.EmployeeId || 'N/A',
        Error: error.message,
        Response: error.response?.data || 'No response data',
        Timestamp: new Date().toISOString()
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataContext.Provider
      value={{
        dailyData,
        loading,
        selectedCompany,
        setSelectedCompany,
        RefreshData,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        setStartTime,
        startTime,
        setEndTime,
        endTime,
        SetToday,
        SetYesterday,
        SetWeek,
        SetMonth,
        userMenus,
        currentDashboardType,
        switchDashboardType,
        DASHBOARD_TYPES,
        attendanceData,
        processAttendanceAction,
        setLoading,
      }}>
      {children}
    </DataContext.Provider>
  );
};

// import React, { createContext, useState, useEffect, useCallback } from 'react';
// import { getStoredData } from './AsyncStorage';
// import base64 from 'react-native-base64';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const DataContext = createContext();

// export const DASHBOARD_TYPES = {
//   SALES: 'sales',
//   PURCHASE: 'purchase',
// };

// const combineDateTime = (date, time) => {
//   if (!date || !time) {
//     const now = new Date();
//     return now.toISOString().slice(0, 19).replace('T', ' ');
//   }
//   const combined = new Date(date);
//   combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
//   return combined.toISOString().slice(0, 19).replace('T', ' ');
// };

// const GetUserMenus = async (userData) => {
//   try {
//     const { Webkey, UserId } = userData || {};
//     if (!Webkey || !UserId) {
//       console.error('Missing required user data for GetUserMenus:', userData);
//       return [];
//     }
//     const Username = userData?.Username;
//     const Password = userData?.Password;
//     console.log('Using credentials for GetUserMenus - Username:', Username, 'Password:', Password, 'UserId:', UserId);

//     const authHeader2 = `Basic ${base64.encode(`${Username}:${Password}`)}`;
//     const today = new Date();
//     const formattedDate = today.toISOString().split('T')[0];
//     const apiUrl = `https://${Webkey}.sazss.in/Api/UserMenus?UserId=${UserId}`;
//     const response = await axios.get(apiUrl, {
//       headers: {
//         Authorization: authHeader2,
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error during API call000:', error);
//     return [];
//   }
// };

// const GatherData = async (userData, fromDate, toDate, dashName) => {
//   try {
//     const { Webkey } = userData || {};
//     if (!Webkey) {
//       console.error('Missing required user data for GatherData:', userData);
//       return [];
//     }
//     const Username = userData?.Username;
//     const Password = userData?.Password;
//     console.log('Using credentials for GatherData - Username:', Username, 'Password:', Password);

//     const authHeader2 = `Basic ${base64.encode(`${Username.trim()}:${Password.trim()}`)}`;
//     const apiUrl = `https://${Webkey}.sazss.in/Api/DashesDatas`;
//     const response = await axios.post(
//       apiUrl,
//       {
//         dashname: dashName,
//         fromDate: fromDate,
//         toDate: toDate,
//       },
//       {
//         headers: {
//           Authorization: authHeader2,
//         },
//       },
//     );
//     return response.data;
//   } catch (error) {
//     console.error('Error during API call:', error);
//     return [];
//   }
// };

// const AttendanceGatherData = async (userData, actionData) => {
//   try {
//     const { Webkey } = userData || {};
//     if (!Webkey) {
//       console.error('Missing required user data for AttendanceGatherData:', userData);
//       throw new Error('Missing Webkey');
//     }
//     const Username = userData?.Username;
//     const Password = userData?.Password;
//     console.log('Using credentials for AttendanceGatherData - Username:', Username, 'Password:', Password);

//     const authHeader2 = `Basic ${base64.encode(`${Username.trim()}:${Password.trim()}`)}`;
//     const apiUrl = `https://${Webkey}.sazss.in/Api/EmployeeAttendance`;
    
//     const response = await axios.post(
//       apiUrl,
//       actionData,
//       {
//         headers: {
//           Authorization: authHeader2,
//         },
//       },
//     );
//     console.log('Attendance API Response:', response.data, new Date().toISOString());
//     return response.data;
//   } catch (error) {
//     console.error('Error during Attendance API call:', error, new Date().toISOString());
//     throw error;
//   }
// };

// export const DataProvider = ({ children }) => {
//   const [dailyData, setDailyData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedCompany, setSelectedCompany] = useState(0);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [startTime, setStartTime] = useState(null);
//   const [endTime, setEndTime] = useState(null);
//   const [userMenus, setUserMenus] = useState([]);
//   const [currentDashboardType, setCurrentDashboardType] = useState(DASHBOARD_TYPES.SALES);
//   const [attendanceData, setAttendanceData] = useState(null);
//   const [isDateInitialized, setIsDateInitialized] = useState(false);

//   const initializeDates = useCallback(() => {
//     const defaultTime = new Date();
//     defaultTime.setHours(8, 0, 0, 0); // Set to 8 AM
//     const now = new Date();
//     const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

//     if (localTime.getHours() < 8) {
//       const yesterday = new Date(localTime);
//       yesterday.setDate(localTime.getDate() - 1);
//       setStartDate(yesterday);
//       setEndDate(localTime);
//     } else {
//       const tomorrow = new Date(localTime);
//       tomorrow.setDate(localTime.getDate() + 1);
//       setStartDate(localTime);
//       setEndDate(tomorrow);
//     }
//     setStartTime(defaultTime);
//     setEndTime(defaultTime);
//     setIsDateInitialized(true);
//   }, []);

//   useEffect(() => {
//     initializeDates();
//   }, [initializeDates]);

//   useEffect(() => {
//     const SetCompany = async () => {
//       const localCom = await AsyncStorage.getItem('SelectedCompany');
//       if (localCom) {
//         setSelectedCompany(JSON.parse(localCom));
//       } else {
//         setSelectedCompany(0);
//       }
//       const localData = await getStoredData('CompanyDetails');
//       if (localData && localData.length > 0 && selectedCompany !== 0) {
//         const selectedItem = localData.find((val) => val.id === selectedCompany);
//         if (selectedItem && (!selectedItem.Username || !selectedItem.Password)) {
//           console.warn('Selected company missing Username or Password, using defaults');
//         }
//       }
//     };
//     SetCompany();
//   }, [selectedCompany]);

//   const RefreshData = async () => {
//     await AsyncStorage.setItem('SelectedCompany', JSON.stringify(selectedCompany));
//     if (isDateInitialized && startDate && endDate && startTime && endTime) fetchData();
//   };

//   const switchDashboardType = (dashType) => {
//     setCurrentDashboardType(dashType);
//     if (isDateInitialized && startDate && endDate && startTime && endTime) fetchData(dashType);
//   };

//   const fetchDataCustom = async (startDatee, endDatee, dashType = currentDashboardType) => {
//     if (!startDatee || !endDatee) {
//       console.warn('fetchDataCustom called with invalid dates, using defaults');
//       return;
//     }
//     try {
//       setLoading(true);
//       setTimeout(() => {}, 1000);
//       const localData = await getStoredData('CompanyDetails');
//       const selectedItem = selectedCompany === 0 ? localData[0] : localData.find((val) => val.id === selectedCompany);
//       const formattedFromDate = combineDateTime(startDatee, new Date());
//       const formattedToDate = combineDateTime(endDatee, new Date());
//       const menus = await GetUserMenus(selectedItem);
//       setUserMenus(menus[0] || []);

//       if (selectedCompany === 0) {
//         const allData = [];
//         for (const obj of localData) {
//           const data = await GatherData(obj, formattedFromDate, formattedToDate, dashType);
//           if (data && Array.isArray(data)) {
//             allData.push(...data);
//           }
//         }
//         setDailyData(allData);
//       } else if (selectedCompany !== 0 && selectedItem) {
//         const data = await GatherData(selectedItem, formattedFromDate, formattedToDate, dashType);
//         setDailyData(data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching stored data:', error);
//     } finally {
//       setTimeout(() => {
//         setLoading(false);
//       }, 2000);
//     }
//   };

//   const fetchData = async (dashType = currentDashboardType) => {
//     if (!isDateInitialized || !startDate || !endDate || !startTime || !endTime) {
//       console.warn('fetchData called with incomplete date/time, initializing dates');
//       initializeDates();
//       return;
//     }
//     try {
//       setLoading(true);
//       setTimeout(() => {}, 1000);
//       const localData = await getStoredData('CompanyDetails');
//       const selectedItem = selectedCompany === 0 ? localData[0] : localData.find((val) => val.id === selectedCompany);
//       const formattedFromDate = combineDateTime(startDate, startTime);
//       const formattedToDate = combineDateTime(endDate, endTime);
//       const menus = await GetUserMenus(selectedItem);
//       setUserMenus(menus[0] || []);

//       if (selectedCompany === 0) {
//         const allData = [];
//         for (const obj of localData) {
//           const data = await GatherData(obj, formattedFromDate, formattedToDate, dashType);
//           if (data && Array.isArray(data)) {
//             allData.push(...data);
//           }
//         }
//         setDailyData(allData);
//       } else if (selectedCompany !== 0 && selectedItem) {
//         const data = await GatherData(selectedItem, formattedFromDate, formattedToDate, dashType);
//         setDailyData(data || []);
//       }
//     } catch (error) {
//       console.error('Error fetching stored data:', error);
//     } finally {
//       setTimeout(() => {
//         setLoading(false);
//       }, 2000);
//     }
//   };

//   const SetToday = (dashType = currentDashboardType) => {
//     const now = new Date();
//     const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
//     const defaultTime = new Date();
//     defaultTime.setHours(8, 0, 0, 0);

//     if (localTime.getHours() < 8) {
//       const yesterday = new Date(localTime);
//       yesterday.setDate(localTime.getDate() - 1);
//       fetchDataCustom(yesterday, localTime, dashType);
//       setStartDate(yesterday);
//       setEndDate(localTime);
//     } else {
//       const tomorrow = new Date(localTime);
//       tomorrow.setDate(localTime.getDate() + 1);
//       fetchDataCustom(localTime, tomorrow, dashType);
//       setStartDate(localTime);
//       setEndDate(tomorrow);
//     }
//     setStartTime(defaultTime);
//     setEndTime(defaultTime);
//   };

//   const SetYesterday = (dashType = currentDashboardType) => {
//     const now = new Date();
//     const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
//     const defaultTime = new Date();
//     defaultTime.setHours(8, 0, 0, 0);

//     if (localTime.getHours() < 8) {
//       const dayBeforeYesterday = new Date(localTime);
//       dayBeforeYesterday.setDate(localTime.getDate() - 2);
//       const yesterday = new Date(localTime);
//       yesterday.setDate(localTime.getDate() - 1);
//       fetchDataCustom(dayBeforeYesterday, yesterday, dashType);
//       setStartDate(dayBeforeYesterday);
//       setEndDate(yesterday);
//     } else {
//       const yesterday = new Date(localTime);
//       yesterday.setDate(localTime.getDate() - 1);
//       fetchDataCustom(yesterday, localTime, dashType);
//       setStartDate(yesterday);
//       setEndDate(localTime);
//     }
//     setStartTime(defaultTime);
//     setEndTime(defaultTime);
//   };

//   const SetWeek = (dashType = currentDashboardType) => {
//     const now = new Date();
//     const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
//     const defaultTime = new Date();
//     defaultTime.setHours(8, 0, 0, 0);
//     const dayOfWeek = localTime.getDay();
//     const startOfWeek = new Date(localTime);
//     startOfWeek.setDate(localTime.getDate() - dayOfWeek);
//     startOfWeek.setHours(8, 0, 0, 0);
//     const endOfWeek = new Date(startOfWeek);
//     endOfWeek.setDate(startOfWeek.getDate() + 7);
//     endOfWeek.setHours(8, 0, 0, 0);
//     fetchDataCustom(startOfWeek, endOfWeek, dashType);
//     setStartDate(startOfWeek);
//     setEndDate(endOfWeek);
//     setStartTime(defaultTime);
//     setEndTime(defaultTime);
//   };

//   const SetMonth = (dashType = currentDashboardType) => {
//     const now = new Date();
//     const defaultTime = new Date();
//     defaultTime.setHours(8, 0, 0, 0);
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0, 0);
//     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 8, 0, 0, 0);
//     fetchDataCustom(startOfMonth, endOfMonth, dashType);
//     setStartDate(startOfMonth);
//     setEndDate(endOfMonth);
//     setStartTime(defaultTime);
//     setEndTime(defaultTime);
//   };

//   const processAttendanceAction = async (actionData) => {
//     try {
//       setLoading(true);
//       const localData = await getStoredData('CompanyDetails');
//       if (!localData || localData.length === 0) {
//         throw new Error('No company data available');
//       }
//       const currentCompany = localData.find((val) => val.id === selectedCompany) || localData[0];
//       const Username = currentCompany?.Username || 'Inventory';
//       const Password = currentCompany?.Password || 'SazsApps@123';
//       console.log('Using credentials for Attendance - Username:', Username, 'Password:', Password);

//       const updatedActionData = {
//         ...actionData,
//         Timestamp: new Date().toISOString(), // Ensure precise timing for attendance
//       };
//       const response = await AttendanceGatherData(currentCompany, updatedActionData);
//       setAttendanceData(response);
//       return response;
//     } catch (error) {
//       console.error('Attendance action failed:', error, new Date().toISOString());
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <DataContext.Provider
//       value={{
//         dailyData,
//         loading,
//         selectedCompany,
//         setSelectedCompany,
//         RefreshData,
//         startDate,
//         setStartDate,
//         endDate,
//         setEndDate,
//         setStartTime,
//         startTime,
//         setEndTime,
//         endTime,
//         SetToday,
//         SetYesterday,
//         SetWeek,
//         SetMonth,
//         userMenus,
//         currentDashboardType,
//         switchDashboardType,
//         DASHBOARD_TYPES,
//         attendanceData,
//         processAttendanceAction,
//       }}>
//       {children}
//     </DataContext.Provider>
//   );
// };
