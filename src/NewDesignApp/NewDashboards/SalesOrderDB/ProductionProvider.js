import React, { createContext, useState, useEffect } from 'react';
import { getStoredData } from './AsyncStorage';
import base64 from 'react-native-base64';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ProductionContext = createContext();

export const DASHBOARD_TYPES = {
  PRODUCTION: 'production',
};

const combineDateTime = (date, time) => {
  if (!date || !time) {
    console.warn('ProductionContext: Invalid date or time in combineDateTime', { date, time });
    return '';
  }
  const dateObj = new Date(date);
  const timeObj = new Date(time);
  dateObj.setHours(timeObj.getHours(), timeObj.getMinutes(), timeObj.getSeconds());
  const formatted = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
  return formatted;
};

const fetchProductionData = async (userData, fromDate, toDate) => {
  try {
    if (!userData?.Webkey) throw new Error('Missing Webkey');
    const { Webkey, Username, Password } = userData;
    const authHeader = `Basic ${base64.encode(`${Username.trim()}:${Password.trim()}`)}`;
    const response = await axios.post(
      `https://${Webkey}.sazss.in/Api/DashesDatas`,
      { dashname: DASHBOARD_TYPES.PRODUCTION, fromDate, toDate },
      { headers: { Authorization: authHeader } }
    );
    const data = Array.isArray(response.data) ? response.data : [];
    return data;
  } catch (error) {
    console.error('ProductionContext: Error fetching data', error);
    return [];
  }
};

export const ProductionProvider = ({ children }) => {
  const [productionData, setProductionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const setDefaultTimeTo8AM = (date) => {
    const d = new Date(date);
    d.setHours(8, 0, 0, 0);
    return d;
  };

  useEffect(() => {
    const init = async () => {
      const now = new Date();
      const defaultTime = setDefaultTimeTo8AM(now);
      setStartTime(defaultTime);
      setEndTime(defaultTime);
      if (now.getHours() < 8) {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        setStartDate(yesterday);
        setEndDate(now);
      } else {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        setStartDate(now);
        setEndDate(tomorrow);
      }
      const localCom = await AsyncStorage.getItem('SelectedCompany');
      setSelectedCompany(localCom ? JSON.parse(localCom) : 0);
    };
    init();
  }, []);

  const fetchProductionDashboard = async (customStartDate = null, customEndDate = null) => {
    try {
      setLoading(true);
      const localData = await getStoredData('CompanyDetails');
      const fromDate = combineDateTime(customStartDate || startDate, startTime);
      const toDate = combineDateTime(customEndDate || endDate, endTime);
      let data = [];
      if (selectedCompany === 0) {
        for (const company of localData) {
          const companyData = await fetchProductionData(company, fromDate, toDate);
          data = [...data, ...companyData];
        }
      } else {
        const company = localData.find(c => c.id === selectedCompany);
        if (company) {
          data = await fetchProductionData(company, fromDate, toDate);
        }
      }
      setProductionData(data);
    } catch (error) {
      console.error('fetchProductionDashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomProductionDashboard = async (customStartDate, customEndDate) => {
    try {
      if (!customStartDate || !customEndDate || isNaN(new Date(customStartDate).getTime()) || isNaN(new Date(customEndDate).getTime())) {
        return;
      }
      const defaultStartTime = setDefaultTimeTo8AM(new Date());
      const defaultEndTime = new Date(customEndDate);
      defaultEndTime.setHours(23, 59, 59, 999);
      setLoading(true);
      const localData = await getStoredData('CompanyDetails');
      const formattedFromDate = combineDateTime(customStartDate, defaultStartTime);
      const formattedToDate = combineDateTime(customEndDate, defaultEndTime);
      let data = [];
      if (selectedCompany === 0) {
        for (const company of localData) {
          const companyData = await fetchProductionData(company, formattedFromDate, formattedToDate);
          data = [...data, ...companyData];
        }
      } else {
        const company = localData.find(c => c.id === selectedCompany);
        if (company) {
          data = await fetchProductionData(company, formattedFromDate, formattedToDate);
        }
      }
      setProductionData(data);
      setStartDate(new Date(customStartDate));
      setEndDate(new Date(customEndDate));
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
    } catch (error) {
      console.error('fetchCustomProductionDashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProductionData = async () => {
    await fetchProductionDashboard();
  };

  const setTodayRange = async () => {
    const now = new Date();
    const defaultTime = setDefaultTimeTo8AM(now);
    if (now.getHours() < 8) {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      setStartDate(yesterday);
      setEndDate(now);
      await fetchProductionDashboard(yesterday, now);
    } else {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      setStartDate(now);
      setEndDate(tomorrow);
      await fetchProductionDashboard(now, tomorrow);
    }
    setStartTime(defaultTime);
    setEndTime(defaultTime);
  };

  const setYesterdayRange = async () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const defaultTime = setDefaultTimeTo8AM(yesterday);
    const fetchStartDate = new Date(yesterday);
    fetchStartDate.setHours(8, 0, 0, 0);
    const fetchEndDate = new Date(now);
    fetchEndDate.setHours(8, 0, 0, 0);
    const displayDate = new Date(yesterday);
    displayDate.setHours(0, 0, 0, 0);
    setStartDate(displayDate);
    setEndDate(displayDate);
    setStartTime(defaultTime);
    setEndTime(defaultTime);
    await fetchProductionDashboard(fetchStartDate, fetchEndDate);
  };

  const setWeekRange = async () => {
    const now = new Date();
    const defaultTime = setDefaultTimeTo8AM(now);
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(now.getDate() + diffToMonday);
    startOfWeek.setHours(8, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    setStartDate(startOfWeek);
    setEndDate(endOfWeek);
    setStartTime(defaultTime);
    setEndTime(defaultTime);
    await fetchProductionDashboard(startOfWeek, endOfWeek);
  };

  const setMonthRange = async () => {
    const now = new Date();
    const defaultTime = setDefaultTimeTo8AM(now);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    setStartDate(startOfMonth);
    setEndDate(endOfMonth);
    setStartTime(defaultTime);
    setEndTime(defaultTime);
    await fetchProductionDashboard(startOfMonth, endOfMonth);
  };

  return (
    <ProductionContext.Provider
      value={{
        productionData,
        setProductionData,
        loading,
        selectedCompany,
        startDate,
        endDate,
        startTime,
        endTime,
        setStartDate,
        setEndDate,
        setStartTime,
        setEndTime,
        fetchProductionDashboard,
        fetchCustomProductionDashboard,
        refreshProductionData,
        setTodayRange,
        setYesterdayRange,
        setWeekRange,
        setMonthRange,
        DASHBOARD_TYPES,
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
};