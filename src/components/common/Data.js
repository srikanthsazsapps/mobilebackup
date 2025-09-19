import React, {createContext, useState, useEffect} from 'react';
import {getStoredData} from './AsyncStorage';
import base64 from 'react-native-base64';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiClient } from './apiClient';
export const Data = createContext();

const combineDateTime = (date, time) => {
  const combined = new Date(date);
  combined.setHours(time.getHours(), time.getMinutes(), time.getSeconds());
  return combined.toISOString().slice(0, 19).replace('T', ' ');
};

const GetUserMenus = async userData => {
  try {
    const api = await getApiClient();
    const response = await api.get(`UserMenus?UserId=${userData.UserId}`);
    return response.data;
  } catch (error) {
    console.error('GetUserMenus error', error);
  }
};

const GatherData = async (userData, fromDate, toDate) => {
  try {
    const api = await getApiClient();
    const response = await api.post(`DashBoardData`, {
      userData, 
      fromDate,
      toDate,
    });
    return response.data;
  } catch (error) {
    console.error('GatherData error', error);
  }
};

export const DataProvider = ({children}) => {
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [userMenus, setUserMenus] = useState([]);

  const formatDate = date => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = time => {
    return time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
  };

  const setDefaultTimeTo8AM = date => {
    const localDate = new Date(date);
    localDate.setHours(8, 0, 0, 0);

    const timezoneOffset = localDate.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(localDate.getTime() - timezoneOffset);

    return adjustedDate; // Return the adjusted date object
  };

  useEffect(() => {
    const setDate = async () => {
      const defaultTime = setDefaultTimeTo8AM(new Date());
      setStartTime(defaultTime);
      setEndTime(defaultTime);

      const now = new Date();

      const localTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000,
      );

      if (localTime.getHours() < 8) {
        // Set startDate to yesterday
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
      // Set default start and end times
    };

    setDate();
  }, []);

  useEffect(() => {
    const SetCompany = async () => {
      const localCom = await AsyncStorage.getItem('SelectedCompany');
      if (localCom) {
        setSelectedCompany(JSON.parse(localCom)); // Set to parsed value
      } else {
        setSelectedCompany(0);
      }
    };
    SetCompany();
  }, []);

  const RefreshData = async () => {
    await AsyncStorage.setItem(
      'SelectedCompany',
      JSON.stringify(selectedCompany),
    );
    fetchData();
  };

  const fetchDataCustom = async (startDatee, endDatee) => {
    try {
      const defaultTime = setDefaultTimeTo8AM(new Date());

      setLoading(true);
      setTimeout(() => {}, 1000);
      const localData = await getStoredData('CompanyDetails');
      const formattedFromDate = combineDateTime(startDatee, defaultTime);
      const formattedToDate = combineDateTime(endDatee, defaultTime);
      const menus = await GetUserMenus(localData[0]);
      setUserMenus(menus[0]);

      if (selectedCompany === 0) {
        const purchaseSummary = [];
        const salesSummary = [];
        const purchsaseBySupplier = [];
        const salesByCust = [];
        const salesByProduct = [];
        for (const obj of localData) {
          const data = await GatherData(
            obj,
            formattedFromDate,
            formattedToDate,
          );
          purchaseSummary.push(data[0]);
          salesSummary.push(data[1]);
          purchsaseBySupplier.push(...data[2]);
          salesByCust.push(...data[3]);
          salesByProduct.push(...data[4]);
        }
        const totalP = [{AvgQty: 0, TotalQty: 0, TotalTrips: 0}];
        const totalS = [
          {
            TotalCashSales: 0,
            TotalCreditSales: 0,
            TotalMT: 0,
            TotalSales: 0,
            TotalTrips: 0,
          },
        ];

        purchaseSummary.forEach(itemArray => {
          itemArray.forEach(item => {
            totalP[0].AvgQty += Number(item.AvgQty);
            totalP[0].TotalQty += Number(item.TotalQty);
            totalP[0].TotalTrips += Number(item.TotalTrips);
          });
        });

        salesSummary.forEach(itemArray => {
          itemArray.forEach(item => {
            totalS[0].TotalCashSales += Number(item.TotalCashSales);
            totalS[0].TotalCreditSales += Number(item.TotalCreditSales);
            totalS[0].TotalMT += Number(item.TotalMT);
            totalS[0].TotalSales += Number(item.TotalSales);
            totalS[0].TotalTrips += Number(item.TotalTrips);
          });
        });

        const allData = [];
        allData.push(
          totalP,
          totalS,
          purchsaseBySupplier,
          salesByCust,
          salesByProduct,
        );

        setDailyData(allData);
      } else if (selectedCompany !== 0) {
        const selectedItem = localData.filter(
          val => val.id === selectedCompany,
        );

        const data = await GatherData(
          selectedItem[0],
          formattedFromDate,
          formattedToDate,
        );
        setDailyData(data);
      }
    } catch (error) {
      console.error('Error fetching stored data:', error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };
  const fetchData = async () => {
    try {
      setLoading(true);
      setTimeout(() => {}, 1000);
      const localData = await getStoredData('CompanyDetails');
      const formattedFromDate = combineDateTime(startDate, startTime);
      const formattedToDate = combineDateTime(endDate, endTime);
      const menus = await GetUserMenus(localData[0]);
      setUserMenus(menus[0]);
      
      if (selectedCompany === 0) {
        const purchaseSummary = [];
        const salesSummary = [];
        const purchsaseBySupplier = [];
        const salesByCust = [];
        const salesByProduct = [];
        for (const obj of localData) {
          const data = await GatherData(
            obj,
            formattedFromDate,
            formattedToDate,
          );
          purchaseSummary.push(data[0]);
          salesSummary.push(data[1]);
          purchsaseBySupplier.push(...data[2]);
          salesByCust.push(...data[3]);
          salesByProduct.push(...data[4]);
        }
        const totalP = [{AvgQty: 0, TotalQty: 0, TotalTrips: 0}];
        const totalS = [
          {
            TotalCashSales: 0,
            TotalCreditSales: 0,
            TotalMT: 0,
            TotalSales: 0,
            TotalTrips: 0,
          },
        ];

        purchaseSummary.forEach(itemArray => {
          itemArray.forEach(item => {
            totalP[0].AvgQty += Number(item.AvgQty);
            totalP[0].TotalQty += Number(item.TotalQty);
            totalP[0].TotalTrips += Number(item.TotalTrips);
          });
        });

        salesSummary.forEach(itemArray => {
          itemArray.forEach(item => {
            totalS[0].TotalCashSales += Number(item.TotalCashSales);
            totalS[0].TotalCreditSales += Number(item.TotalCreditSales);
            totalS[0].TotalMT += Number(item.TotalMT);
            totalS[0].TotalSales += Number(item.TotalSales);
            totalS[0].TotalTrips += Number(item.TotalTrips);
          });
        });

        const allData = [];
        allData.push(
          totalP,
          totalS,
          purchsaseBySupplier,
          salesByCust,
          salesByProduct,
        );

        setDailyData(allData);
      } else if (selectedCompany !== 0) {
        const selectedItem = localData.filter(
          val => val.id === selectedCompany,
        );

        const data = await GatherData(
          selectedItem[0],
          formattedFromDate,
          formattedToDate,
        );
        setDailyData(data);
      }
    } catch (error) {
      console.error('Error fetching stored data:', error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const SetToday = () => {
    const defaultTime = setDefaultTimeTo8AM(new Date());

    const now = new Date();
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    // Check if current time is before 08:00 AM
    if (localTime.getHours() < 8) {
      // Set startDate to yesterday
      const yesterday = new Date(localTime);
      yesterday.setDate(localTime.getDate() - 1);
      fetchDataCustom(yesterday, localTime);
      // Set endDate to today
      setStartDate(yesterday);
      setEndDate(localTime);
    } else {
      // Set startDate to today
      const tomorrow = new Date(localTime);
      tomorrow.setDate(localTime.getDate() + 1);
      fetchDataCustom(localTime, tomorrow);

      // Set endDate to tomorrow
      setStartDate(localTime);
      setEndDate(tomorrow);
    }

    // Set default start and end times
    setStartTime(defaultTime);
    setEndTime(defaultTime);
  };

  const SetYesterday = () => {
    const defaultTime = setDefaultTimeTo8AM(new Date());

    const now = new Date();
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    // Check if current time is before 08:00 AM
    if (localTime.getHours() < 8) {
      // Set startDate to two days ago
      const dayBeforeYesterday = new Date(localTime);
      dayBeforeYesterday.setDate(localTime.getDate() - 2);

      const yesterday = new Date(localTime);
      yesterday.setDate(localTime.getDate() - 1);

      fetchDataCustom(dayBeforeYesterday, yesterday);
      // Set start and end dates
      setStartDate(dayBeforeYesterday);
      setEndDate(yesterday);
    } else {
      // Set startDate to yesterday
      const yesterday = new Date(localTime);
      yesterday.setDate(localTime.getDate() - 1);

      fetchDataCustom(yesterday, localTime);

      // Set endDate to today
      setStartDate(yesterday);
      setEndDate(localTime);
    }

    // Set default start and end times
    setStartTime(defaultTime);
    setEndTime(defaultTime);
  };

  const SetWeek = () => {
    const defaultTime = setDefaultTimeTo8AM(new Date());

    const now = new Date();
    const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

    // Determine the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = localTime.getDay();

    // Calculate the start of the week (last Sunday at 8:00 AM)
    const startOfWeek = new Date(localTime);
    startOfWeek.setDate(localTime.getDate() - dayOfWeek); // Set to last Sunday
    startOfWeek.setHours(8, 0, 0, 0); // Set to 8:00 AM

    // Calculate the end of the week (next Sunday at 8:00 AM)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7); // Move to next Sunday
    endOfWeek.setHours(8, 0, 0, 0); // Set to 8:00 AM

    // Fetch data for the week
    fetchDataCustom(startOfWeek, endOfWeek);

    // Set start and end dates to the week's start and end
    setStartDate(startOfWeek);
    setEndDate(endOfWeek);

    // Set default start and end times
    setStartTime(defaultTime);
    setEndTime(defaultTime);
  };
  const SetMonth = () => {
    const defaultTime = setDefaultTimeTo8AM(new Date());

    const now = new Date();

    // Calculate the start of the month (1st day of the current month at 8:00 AM)
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      8,
      0,
      0,
      0,
    );

    // Calculate the end of the month (1st day of the next month at 8:00 AM)
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      8,
      0,
      0,
      0,
    );

    // Fetch data for the month
    fetchDataCustom(startOfMonth, endOfMonth);

    // Set start and end dates to the month's start and end
    setStartDate(startOfMonth);
    setEndDate(endOfMonth);

    // Set default start and end times
    setStartTime(defaultTime);
    setEndTime(defaultTime);
  };

  // Add these functions to your Data.js

const GetReceivables = async (userData, fromDate, toDate) => {
  try {
    const api = await getApiClient();
    const response = await api.post(`Receivables`, {
      userData, 
      fromDate,
      toDate,
    });
    return response.data;
  } catch (error) {
    console.error('GetReceivables error', error);
    return [];
  }
};

const GetPayables = async (userData, fromDate, toDate) => {
  try {
    const api = await getApiClient();
    const response = await api.post(`Payables`, {
      userData, 
      fromDate,
      toDate,
    });
    return response.data;
  } catch (error) {
    console.error('GetPayables error', error);
    return [];
  }
};


  return (
    <Data.Provider
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
        GetReceivables,
      GetPayables,
      }}>
      {children}
    </Data.Provider>
  );
};
