import React, { createContext, useState, useEffect } from 'react';
import { getStoredData } from './AsyncStorage';
import base64 from 'react-native-base64';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DashesDataContext = createContext();

export const DASHBOARD_TYPES = {
  PRODUCTION: 'production',
  PROFIT_LOSS: 'profit&loss',
  ACCOUNTS: 'accounts',
  ASSET: 'asset',
};

const combineDateTime = (date, time) => {
  if (!date || !time) {
    console.warn('DashesDataContext: Invalid date or time in combineDateTime', { date, time });
    return '';
  }
  const dateObj = new Date(date);
  const timeObj = new Date(time);
  dateObj.setHours(timeObj.getHours(), timeObj.getMinutes(), timeObj.getSeconds());
  const formatted = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`;
  console.log('DashesDataContext: Combined date-time:', { inputDate: date, inputTime: time, output: formatted });
  return formatted;
};

const fetchDashesData = async (userData, dashName, fromDate, toDate) => {
  try {
    if (!userData?.Webkey || !userData?.Username || !userData?.Password) {
      console.error('DashesDataContext: Missing required CompanyDetails fields', {
        Webkey: userData?.Webkey,
        Username: userData?.Username,
        Password: userData?.Password ? '[REDACTED]' : undefined,
      });
      throw new Error('Missing required CompanyDetails fields (Webkey, Username, or Password)');
    }
    const { Webkey, Username, Password } = userData;
    const authHeader = `Basic ${base64.encode(`${Username.trim()}:${Password.trim()}`)}`;
    console.log(`DashesDataContext: Fetching ${dashName} data...`);
    console.log(`DashesDataContext: URL: https://${Webkey}.sazss.in/Api/DashesDatas`);
    console.log(`DashesDataContext: Payload:`, { dashname: dashName, fromDate, toDate });
    console.log(`DashesDataContext: Headers:`, { Authorization: authHeader });

    const response = await axios.post(
      `https://${Webkey}.sazss.in/Api/DashesDatas`,
      { dashname: dashName, fromDate, toDate },
      { headers: { Authorization: authHeader } }
    );

    console.log(`DashesDataContext: ${dashName} API Response Status:`, response.status);
    console.log(`DashesDataContext: ${dashName} API Response Data:`, JSON.stringify(response.data, null, 2));

    if (dashName === DASHBOARD_TYPES.ASSET) {
      if (!Array.isArray(response.data)) {
        console.warn(`DashesDataContext: Invalid API response for ${dashName}, expected array`, response.data);
        return [];
      }
      const data = Array.isArray(response.data[0])
        ? response.data.flatMap((subArray, index) => {
            if (!Array.isArray(subArray)) {
              console.warn(`DashesDataContext: Invalid sub-array at index ${index} for ${dashName}`);
              return [];
            }
            return subArray.map(item => ({
              ...item,
              Category: index === 0 ? 'Total Vehicle' :
                        index === 1 ? 'In Transit' :
                        index === 2 ? 'Idle Vehicle' :
                        index === 3 ? 'Workshop' :
                        index === 4 ? 'Fuel Consumption' : 'FC Volume',
              VehicleNumber: item.VechNumber || item.VechileNumber || item.VehicleNumber || item.veh_number || item.vehicle_number || item.veh_no || null
            }));
          })
        : response.data.map(item => ({
            ...item,
            Category: item?.TransStatus?.toLowerCase()?.includes('transit') ? 'In Transit' :
                      item?.TransStatus?.toLowerCase()?.includes('completed') ? 'Idle Vehicle' :
                      item?.TransStatus?.toLowerCase()?.includes('workshop') ? 'Workshop' :
                      item?.Qty ? 'Fuel Consumption' :
                      item?.FCDate ? 'FC Volume' : 'Total Vehicle',
            VehicleNumber: item.VechNumber || item.VechileNumber || item.VehicleNumber || item.veh_number || item.vehicle_number || item.veh_no || null
          }));
      console.log(`DashesDataContext: Processed ${dashName} data:`, JSON.stringify(data, null, 2));
      return data;
    } else {
      const data = Array.isArray(response.data) ? response.data : [];
      console.log(`DashesDataContext: Processed ${dashName} data:`, JSON.stringify(data, null, 2));
      return data;
    }
  } catch (error) {
    console.error(`DashesDataContext: Error fetching ${dashName} data:`, {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : null
    });
    return [];
  }
};

export const DashesDataProvider = ({ children }) => {
  const [profitLossData, setProfitLossData] = useState([]);
  const [accountsData, setAccountsData] = useState([]);
  const [productionData, setProductionData] = useState([]);
  const [assetData, setAssetData] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    profitLoss: false,
    accounts: false,
    production: false,
    asset: false,
    all: false,
  });
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [previousProfitLossData, setPreviousProfitLossData] = useState([]);
  const [previousPeriodLoading, setPreviousPeriodLoading] = useState(false);

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

  const fetchSingleDashboard = async (dashboardType, customStartDate = null, customEndDate = null) => {
    try {
      console.log(`DashesDataContext: fetchSingleDashboard called with type: ${dashboardType}`, {
        customStartDate: customStartDate?.toISOString(),
        customEndDate: customEndDate?.toISOString()
      });
      setLoadingStates(prev => ({ ...prev, [dashboardType]: true }));
      const localData = await getStoredData('CompanyDetails');
      console.log('DashesDataContext: Company data:', JSON.stringify(localData, null, 2));

      if (!localData || !Array.isArray(localData) || localData.length === 0) {
        console.error('DashesDataContext: No valid CompanyDetails found');
        return [];
      }

      const fromDate = combineDateTime(customStartDate || startDate, startTime);
      const toDate = combineDateTime(customEndDate || endDate, endTime);
      console.log('DashesDataContext: Date range:', { fromDate, toDate });

      let data = [];
      let dashName = '';
      switch (dashboardType) {
        case 'profitLoss':
        case 'profit&loss':
          dashName = DASHBOARD_TYPES.PROFIT_LOSS;
          break;
        case 'accounts':
          dashName = DASHBOARD_TYPES.ACCOUNTS;
          break;
        case 'production':
          dashName = DASHBOARD_TYPES.PRODUCTION;
          break;
        case 'asset':
          dashName = DASHBOARD_TYPES.ASSET;
          break;
        default:
          dashName = DASHBOARD_TYPES.PROFIT_LOSS;
      }
      console.log(`DashesDataContext: Dashboard name: ${dashName}, Selected company: ${selectedCompany}`);

      if (selectedCompany === 0) {
        console.log('DashesDataContext: Fetching data for all companies');
        for (const company of localData) {
          if (!company.Webkey || !company.Username || !company.Password) {
            console.warn('DashesDataContext: Skipping company due to missing credentials', {
              companyId: company.id,
              companyName: company.CompanyName
            });
            continue;
          }
          const companyData = await fetchDashesData(company, dashName, fromDate, toDate);
          data = [...data, ...companyData];
        }
      } else {
        console.log('DashesDataContext: Fetching data for single company');
        const company = localData.find(c => c.id === selectedCompany);
        if (!company) {
          console.error('DashesDataContext: Selected company not found', { selectedCompany });
          return [];
        }
        if (!company.Webkey || !company.Username || !company.Password) {
          console.error('DashesDataContext: Selected company missing credentials', {
            companyId: company.id,
            companyName: company.CompanyName
          });
          return [];
        }
        data = await fetchDashesData(company, dashName, fromDate, toDate);
      }

      console.log(`DashesDataContext: Final data for ${dashboardType}:`, JSON.stringify(data, null, 2));
      if (dashboardType === 'accounts') {
        setAccountsData(data);
      } else if (dashboardType === 'profitLoss' || dashboardType === 'profit&loss') {
        setProfitLossData(data);
      } else if (dashboardType === 'production') {
        setProductionData(data);
        console.log('DashesDataContext: Updated productionData:', JSON.stringify(data, null, 2));
      } else if (dashboardType === 'asset') {
        setAssetData(data);
      }
      return data;
    } catch (error) {
      console.error('DashesDataContext: Error fetching data:', error.message);
      return [];
    } finally {
      setLoadingStates(prev => ({ ...prev, [dashboardType]: false }));
    }
  };

  const fetchAllDashboards = async (customStartDate = null, customEndDate = null) => {
    try {
      setLoadingStates(prev => ({ ...prev, all: true }));
      await Promise.all([
        fetchSingleDashboard('profitLoss', customStartDate, customEndDate),
        fetchSingleDashboard('accounts', customStartDate, customEndDate),
        fetchSingleDashboard('production', customStartDate, customEndDate),
        fetchSingleDashboard('asset', customStartDate, customEndDate),
      ]);
    } catch (error) {
      console.error('DashesDataContext: Error fetching all dashboards:', error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, all: false }));
    }
  };

  const fetchCustomDashboard = async (dashboardType, customStartDate, customEndDate) => {
    try {
      if (!customStartDate || !customEndDate || isNaN(new Date(customStartDate).getTime()) || isNaN(new Date(customEndDate).getTime())) {
        console.error(`DashesDataContext: Invalid custom dates for ${dashboardType}`, { customStartDate, customEndDate });
        return;
      }
      const defaultStartTime = setDefaultTimeTo8AM(new Date());
      const defaultEndTime = new Date(customEndDate);
      defaultEndTime.setHours(23, 59, 59, 999);
      setLoadingStates(prev => ({ ...prev, [dashboardType]: true }));
      const localData = await getStoredData('CompanyDetails');
      const formattedFromDate = combineDateTime(customStartDate, defaultStartTime);
      const formattedToDate = combineDateTime(customEndDate, defaultEndTime);
      console.log('DashesDataContext: Custom date range:', {
        formattedFromDate,
        formattedToDate,
        customStartDate: customStartDate.toISOString(),
        customEndDate: customEndDate.toISOString()
      });

      let data = [];
      let dashName = '';
      switch (dashboardType) {
        case 'profitLoss':
        case 'profit&loss':
          dashName = DASHBOARD_TYPES.PROFIT_LOSS;
          break;
        case 'accounts':
          dashName = DASHBOARD_TYPES.ACCOUNTS;
          break;
        case 'production':
          dashName = DASHBOARD_TYPES.PRODUCTION;
          break;
        case 'asset':
          dashName = DASHBOARD_TYPES.ASSET;
          break;
        default:
          dashName = DASHBOARD_TYPES.PROFIT_LOSS;
      }

      if (selectedCompany === 0) {
        console.log('DashesDataContext: Fetching custom data for all companies');
        for (const company of localData) {
          if (!company.Webkey || !company.Username || !company.Password) {
            console.warn('DashesDataContext: Skipping company due to missing credentials', {
              companyId: company.id,
              companyName: company.CompanyName
            });
            continue;
          }
          const companyData = await fetchDashesData(company, dashName, formattedFromDate, formattedToDate);
          data = [...data, ...companyData];
        }
      } else {
        console.log('DashesDataContext: Fetching custom data for single company');
        const company = localData.find(c => c.id === selectedCompany);
        if (!company) {
          console.error('DashesDataContext: Selected company not found', { selectedCompany });
          return;
        }
        if (!company.Webkey || !company.Username || !company.Password) {
          console.error('DashesDataContext: Selected company missing credentials', {
            companyId: company.id,
            companyName: company.CompanyName
          });
          return;
        }
        data = await fetchDashesData(company, dashName, formattedFromDate, formattedToDate);
      }

      console.log(`DashesDataContext: Custom data for ${dashboardType}:`, JSON.stringify(data, null, 2));
      if (dashboardType === 'accounts') {
        setAccountsData(data);
      } else if (dashboardType === 'profitLoss' || dashboardType === 'profit&loss') {
        setProfitLossData(data);
      } else if (dashboardType === 'production') {
        setProductionData(data);
        console.log('DashesDataContext: Updated productionData (custom):', JSON.stringify(data, null, 2));
      } else if (dashboardType === 'asset') {
        setAssetData(data);
      }

      setStartDate(new Date(customStartDate));
      setEndDate(new Date(customEndDate));
      setStartTime(defaultStartTime);
      setEndTime(defaultEndTime);
    } catch (error) {
      console.error('DashesDataContext: Error fetching custom data:', error.message);
    } finally {
      setLoadingStates(prev => ({ ...prev, [dashboardType]: false }));
    }
  };

  const refreshDashboardData = async () => {
    await fetchAllDashboards();
  };

  const setTodayRange = async (dashboardType = 'profitLoss') => {
    const now = new Date();
    const defaultTime = setDefaultTimeTo8AM(now);
    let data = [];
    if (now.getHours() < 8) {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      setStartDate(yesterday);
      setEndDate(now);
      data = await fetchSingleDashboard(dashboardType, yesterday, now);
    } else {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      setStartDate(now);
      setEndDate(tomorrow);
      data = await fetchSingleDashboard(dashboardType, now, tomorrow);
    }
    setStartTime(defaultTime);
    setEndTime(defaultTime);
    return data;
  };

  const setYesterdayRange = async (dashboardType = 'profitLoss') => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const defaultTime = setDefaultTimeTo8AM(yesterday);

    let data = [];
    if (dashboardType === 'profitLoss' || dashboardType === 'profit&loss') {
      const displayAndFetchDate = new Date(yesterday);
      displayAndFetchDate.setHours(8, 0, 0, 0);
      console.log('Yesterday range (profit&loss):', {
        displayStart: displayAndFetchDate,
        displayEnd: displayAndFetchDate,
        fetchStart: displayAndFetchDate,
        fetchEnd: displayAndFetchDate
      });
      setStartDate(displayAndFetchDate);
      setEndDate(displayAndFetchDate);
      setStartTime(defaultTime);
      setEndTime(defaultTime);
      data = await fetchSingleDashboard(dashboardType, displayAndFetchDate, displayAndFetchDate);
    } else {
      const fetchStartDate = new Date(yesterday);
      fetchStartDate.setHours(8, 0, 0, 0);
      const fetchEndDate = new Date(now);
      fetchEndDate.setHours(8, 0, 0, 0);
      const displayDate = new Date(yesterday);
      displayDate.setHours(0, 0, 0, 0);
      console.log('Yesterday range (production/other):', {
        displayStart: displayDate,
        displayEnd: displayDate,
        fetchStart: fetchStartDate,
        fetchEnd: fetchEndDate
      });
      setStartDate(displayDate);
      setEndDate(displayDate);
      setStartTime(defaultTime);
      setEndTime(defaultTime);
      data = await fetchSingleDashboard(dashboardType, fetchStartDate, fetchEndDate);
    }
    return data;
  };

  const setWeekRange = async (dashboardType = 'profitLoss') => {
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
    console.log('DashesDataContext: Week range:', {
      startOfWeek: startOfWeek.toISOString(),
      endOfWeek: endOfWeek.toISOString()
    });
    setStartDate(startOfWeek);
    setEndDate(endOfWeek);
    setStartTime(defaultTime);
    setEndTime(defaultTime);
    const data = await fetchSingleDashboard(dashboardType, startOfWeek, endOfWeek);
    return data;
  };

  const setPreviousWeekRange = async (dashboardType = 'profitLoss') => {
    try {
      setPreviousPeriodLoading(true);
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startOfPreviousWeek = new Date(now);
      startOfPreviousWeek.setDate(now.getDate() + diffToMonday - 7);
      startOfPreviousWeek.setHours(8, 0, 0, 0);
      const endOfPreviousWeek = new Date(startOfPreviousWeek);
      endOfPreviousWeek.setDate(startOfPreviousWeek.getDate() + 6);
      endOfPreviousWeek.setHours(23, 59, 59, 999);
      const fromDate = combineDateTime(startOfPreviousWeek, startTime);
      const toDate = combineDateTime(endOfPreviousWeek, endTime);
      const localData = await getStoredData('CompanyDetails');
      let data = [];

      if (!localData || !Array.isArray(localData) || localData.length === 0) {
        console.error('DashesDataContext: No valid CompanyDetails found for previous week');
        return [];
      }

      if (selectedCompany === 0) {
        console.log('DashesDataContext: Fetching previous week data for all companies');
        for (const company of localData) {
          if (!company.Webkey || !company.Username || !company.Password) {
            console.warn('DashesDataContext: Skipping company due to missing credentials', {
              companyId: company.id,
              companyName: company.CompanyName
            });
            continue;
          }
          const companyData = await fetchDashesData(company, DASHBOARD_TYPES.PROFIT_LOSS, fromDate, toDate);
          data = [...data, ...companyData];
        }
      } else {
        console.log('DashesDataContext: Fetching previous week data for single company');
        const company = localData.find(c => c.id === selectedCompany);
        if (!company) {
          console.error('DashesDataContext: Selected company not found', { selectedCompany });
          return [];
        }
        if (!company.Webkey || !company.Username || !company.Password) {
          console.error('DashesDataContext: Selected company missing credentials', {
            companyId: company.id,
            companyName: company.CompanyName
          });
          return [];
        }
        data = await fetchDashesData(company, DASHBOARD_TYPES.PROFIT_LOSS, fromDate, toDate);
      }

      console.log('DashesDataContext: Previous week data:', JSON.stringify(data, null, 2));
      setPreviousProfitLossData(data);
      return data;
    } catch (error) {
      console.error('DashesDataContext: Error fetching previous week data:', error.message);
      setPreviousProfitLossData([]);
      return [];
    } finally {
      setPreviousPeriodLoading(false);
    }
  };

  const setMonthRange = async (dashboardType = 'profitLoss') => {
    const now = new Date();
    const defaultTime = setDefaultTimeTo8AM(now);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    console.log('DashesDataContext: Month range:', {
      startOfMonth: startOfMonth.toISOString(),
      endOfMonth: endOfMonth.toISOString()
    });
    setStartDate(startOfMonth);
    setEndDate(endOfMonth);
    setStartTime(defaultTime);
    setEndTime(defaultTime);
    const data = await fetchSingleDashboard(dashboardType, startOfMonth, endOfMonth);
    return data;
  };

  const setPreviousTodayRange = async (dashboardType = 'profitLoss') => {
    try {
      setPreviousPeriodLoading(true);
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const fromDate = combineDateTime(yesterday, startTime);
      const toDate = combineDateTime(yesterday, endTime);
      const localData = await getStoredData('CompanyDetails');
      let data = [];

      if (!localData || !Array.isArray(localData) || localData.length === 0) {
        console.error('DashesDataContext: No valid CompanyDetails found for previous today');
        return [];
      }

      if (selectedCompany === 0) {
        console.log('DashesDataContext: Fetching previous today data for all companies');
        for (const company of localData) {
          if (!company.Webkey || !company.Username || !company.Password) {
            console.warn('DashesDataContext: Skipping company due to missing credentials', {
              companyId: company.id,
              companyName: company.CompanyName
            });
            continue;
          }
          const companyData = await fetchDashesData(company, DASHBOARD_TYPES.PROFIT_LOSS, fromDate, toDate);
          data = [...data, ...companyData];
        }
      } else {
        console.log('DashesDataContext: Fetching previous today data for single company');
        const company = localData.find(c => c.id === selectedCompany);
        if (!company) {
          console.error('DashesDataContext: Selected company not found', { selectedCompany });
          return [];
        }
        if (!company.Webkey || !company.Username || !company.Password) {
          console.error('DashesDataContext: Selected company missing credentials', {
            companyId: company.id,
            companyName: company.CompanyName
          });
          return [];
        }
        data = await fetchDashesData(company, DASHBOARD_TYPES.PROFIT_LOSS, fromDate, toDate);
      }

      console.log('DashesDataContext: Previous today data:', JSON.stringify(data, null, 2));
      setPreviousProfitLossData(data);
      return data;
    } catch (error) {
      console.error('DashesDataContext: Error fetching previous today data:', error.message);
      setPreviousProfitLossData([]);
      return [];
    } finally {
      setPreviousPeriodLoading(false);
    }
  };

  const setPreviousYesterdayRange = async (dashboardType = 'profitLoss') => {
    try {
      setPreviousPeriodLoading(true);
      const now = new Date();
      const dayBefore = new Date(now);
      dayBefore.setDate(now.getDate() - 2);
      const fromDate = combineDateTime(dayBefore, startTime);
      const toDate = combineDateTime(dayBefore, endTime);
      const localData = await getStoredData('CompanyDetails');
      let data = [];

      if (!localData || !Array.isArray(localData) || localData.length === 0) {
        console.error('DashesDataContext: No valid CompanyDetails found for previous yesterday');
        return [];
      }

      if (selectedCompany === 0) {
        console.log('DashesDataContext: Fetching previous yesterday data for all companies');
        for (const company of localData) {
          if (!company.Webkey || !company.Username || !company.Password) {
            console.warn('DashesDataContext: Skipping company due to missing credentials', {
              companyId: company.id,
              companyName: company.CompanyName
            });
            continue;
          }
          const companyData = await fetchDashesData(company, DASHBOARD_TYPES.PROFIT_LOSS, fromDate, toDate);
          data = [...data, ...companyData];
        }
      } else {
        console.log('DashesDataContext: Fetching previous yesterday data for single company');
        const company = localData.find(c => c.id === selectedCompany);
        if (!company) {
          console.error('DashesDataContext: Selected company not found', { selectedCompany });
          return [];
        }
        if (!company.Webkey || !company.Username || !company.Password) {
          console.error('DashesDataContext: Selected company missing credentials', {
            companyId: company.id,
            companyName: company.CompanyName
          });
          return [];
        }
        data = await fetchDashesData(company, DASHBOARD_TYPES.PROFIT_LOSS, fromDate, toDate);
      }

      console.log('DashesDataContext: Previous yesterday data:', JSON.stringify(data, null, 2));
      setPreviousProfitLossData(data);
      return data;
    } catch (error) {
      console.error('DashesDataContext: Error fetching previous yesterday data:', error.message);
      setPreviousProfitLossData([]);
      return [];
    } finally {
      setPreviousPeriodLoading(false);
    }
  };

  const setPreviousMonthRange = async (dashboardType = 'profitLoss') => {
    try {
      setPreviousPeriodLoading(true);
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      const fromDate = combineDateTime(lastMonth, startTime);
      const toDate = combineDateTime(endOfLastMonth, endTime);
      const localData = await getStoredData('CompanyDetails');
      let data = [];

      if (!localData || !Array.isArray(localData) || localData.length === 0) {
        console.error('DashesDataContext: No valid CompanyDetails found for previous month');
        return [];
      }

      if (selectedCompany === 0) {
        console.log('DashesDataContext: Fetching previous month data for all companies');
        for (const company of localData) {
          if (!company.Webkey || !company.Username || !company.Password) {
            console.warn('DashesDataContext: Skipping company due to missing credentials', {
              companyId: company.id,
              companyName: company.CompanyName
            });
            continue;
          }
          const companyData = await fetchDashesData(company, DASHBOARD_TYPES.PROFIT_LOSS, fromDate, toDate);
          data = [...data, ...companyData];
        }
      } else {
        console.log('DashesDataContext: Fetching previous month data for single company');
        const company = localData.find(c => c.id === selectedCompany);
        if (!company) {
          console.error('DashesDataContext: Selected company not found', { selectedCompany });
          return [];
        }
        if (!company.Webkey || !company.Username || !company.Password) {
          console.error('DashesDataContext: Selected company missing credentials', {
            companyId: company.id,
            companyName: company.CompanyName
          });
          return [];
        }
        data = await fetchDashesData(company, DASHBOARD_TYPES.PROFIT_LOSS, fromDate, toDate);
      }

      console.log('DashesDataContext: Previous month data:', JSON.stringify(data, null, 2));
      setPreviousProfitLossData(data);
      return data;
    } catch (error) {
      console.error('DashesDataContext: Error fetching previous month data:', error.message);
      setPreviousProfitLossData([]);
      return [];
    } finally {
      setPreviousPeriodLoading(false);
    }
  };

  const setPreviousCustomRange = async (dashboardType, customStartDate, customEndDate) => {
    try {
      setPreviousPeriodLoading(true);
      const duration = customEndDate.getTime() - customStartDate.getTime();
      const prevEnd = new Date(customStartDate.getTime() - 1000); // Just before current start
      const prevStart = new Date(prevEnd.getTime() - duration);
      const fromDate = combineDateTime(prevStart, startTime);
      const toDate = combineDateTime(prevEnd, endTime);
      const localData = await getStoredData('CompanyDetails');
      let data = [];

      if (!localData || !Array.isArray(localData) || localData.length === 0) {
        console.error('DashesDataContext: No valid CompanyDetails found for previous custom range');
        return [];
      }

      if (selectedCompany === 0) {
        console.log('DashesDataContext: Fetching previous custom data for all companies');
        for (const company of localData) {
          if (!company.Webkey || !company.Username || !company.Password) {
            console.warn('DashesDataContext: Skipping company due to missing credentials', {
              companyId: company.id,
              companyName: company.CompanyName
            });
            continue;
          }
          const companyData = await fetchDashesData(company, DASHBOARD_TYPES.PROFIT_LOSS, fromDate, toDate);
          data = [...data, ...companyData];
        }
      } else {
        console.log('DashesDataContext: Fetching previous custom data for single company');
        const company = localData.find(c => c.id === selectedCompany);
        if (!company) {
          console.error('DashesDataContext: Selected company not found', { selectedCompany });
          return [];
        }
        if (!company.Webkey || !company.Username || !company.Password) {
          console.error('DashesDataContext: Selected company missing credentials', {
            companyId: company.id,
            companyName: company.CompanyName
          });
          return [];
        }
        data = await fetchDashesData(company, DASHBOARD_TYPES.PROFIT_LOSS, fromDate, toDate);
      }

      console.log('DashesDataContext: Previous custom data:', JSON.stringify(data, null, 2));
      setPreviousProfitLossData(data);
      return data;
    } catch (error) {
      console.error('DashesDataContext: Error fetching previous custom data:', error.message);
      setPreviousProfitLossData([]);
      return [];
    } finally {
      setPreviousPeriodLoading(false);
    }
  };

  const getTotalByCategory = (category) => {
    if (!profitLossData.length) return 0;
    return profitLossData
      .filter(item => item?.Category?.toLowerCase() === category.toLowerCase())
      .reduce((sum, item) => sum + (parseFloat(item.Amount) || 0), 0);
  };

  const getNetProfitLoss = () => {
    const income = getTotalByCategory('Income');
    const expenses = getTotalByCategory('Expenses');
    return income - expenses;
  };

  const getInTransitVehicles = () => {
    if (!assetData.length) {
      console.log('DashesDataContext: No asset data for In Transit vehicles');
      return [];
    }
    console.log('DashesDataContext: Inspecting assetData for In Transit:', JSON.stringify(assetData, null, 2));
    const vehicles = assetData
      .filter(item => {
        const status = (item?.TransStatus || item?.status || item?.Status || '').toLowerCase().trim();
        const hasTripDate = item?.TripDate || item?.trip_date || item?.tripdate || item?.Date || item?.date;
        const isInTransit = status.includes('transit') || item?.Category === 'In Transit';
        console.log('DashesDataContext: In Transit filter:', {
          sno: item.sno,
          vehicleNumber: item.VehicleNumber || item.VechNumber || item.VechileNumber || item.veh_number || item.veh_no,
          status,
          hasTripDate: !!hasTripDate,
          isInTransit,
          category: item.Category
        });
        return isInTransit || hasTripDate;
      })
      .map(item => {
        const vehicleNumber = item.VehicleNumber || item.VechNumber || item.VechileNumber || item.veh_number || item.vehicle_number || item.veh_no || 'N/A';
        const lastUsed = item.TripDate || item.trip_date || item.tripdate || item.Date || item.date || new Date().toISOString().split('T')[0];
        const statusLabel = (item?.TransStatus || item?.status || item?.Status || 'In Transit');
        console.log('DashesDataContext: Mapping In Transit item:', {
          sno: item.sno,
          vehicleNumber,
          lastUsed,
          statusLabel
        });
        return {
          id: item.id || item.sno || Math.random(),
          plate: vehicleNumber,
          lastUsed,
          statusLabel
        };
      });
    console.log('DashesDataContext: In Transit vehicles:', JSON.stringify(vehicles, null, 2));
    return vehicles;
  };

  const getIdleVehicles = () => {
    if (!assetData.length) {
      console.log('DashesDataContext: No asset data for Idle vehicles');
      return [];
    }
    console.log('DashesDataContext: Inspecting assetData for Idle:', JSON.stringify(assetData, null, 2));
    const vehicles = assetData
      .filter(item => {
        const status = (item?.TransStatus || item?.status || item?.Status || '').toLowerCase().trim();
        const hasIdleDate = item?.IdleDate || item?.idle_date || item?.idledate || item?.Date || item?.date;
        const isIdle = status.includes('completed') || status.includes('idle') || item?.Category === 'Idle Vehicle';
        console.log('DashesDataContext: Idle Vehicle filter:', {
          sno: item.sno,
          vehicleNumber: item.VehicleNumber || item.VechNumber || item.VechileNumber || item.veh_number || item.veh_no,
          status,
          hasIdleDate: !!hasIdleDate,
          isIdle,
          category: item.Category
        });
        return isIdle || hasIdleDate;
      })
      .map(item => {
        const vehicleNumber = item.VehicleNumber || item.VechNumber || item.VechileNumber || item.veh_number || item.vehicle_number || item.veh_no || 'N/A';
        const lastUsed = item.IdleDate || item.idle_date || item.idledate || item.Date || item.date || new Date().toISOString().split('T')[0];
        const statusLabel = (item?.TransStatus || item?.status || item?.Status || 'Completed');
        console.log('DashesDataContext: Mapping Idle Vehicle item:', {
          sno: item.sno,
          vehicleNumber,
          lastUsed,
          statusLabel
        });
        return {
          id: item.id || item.sno || Math.random(),
          plate: vehicleNumber,
          lastUsed,
          statusLabel
        };
      });
    console.log('DashesDataContext: Idle vehicles:', JSON.stringify(vehicles, null, 2));
    return vehicles;
  };

  const getWorkshopVehicles = () => {
    if (!assetData.length) {
      console.log('DashesDataContext: No asset data for Workshop vehicles');
      return [];
    }
    console.log('DashesDataContext: Inspecting assetData for Workshop:', JSON.stringify(assetData, null, 2));
    const vehicles = assetData
      .filter(item => {
        const status = (item?.TransStatus || item?.status || item?.Status || '').toLowerCase().trim();
        const hasWorkshopDate = item?.WorkshopDate || item?.workshop_date || item?.workshopdate || item?.Date || item?.date;
        const isWorkshop = status.includes('workshop') || 
                          status.includes('repair') || 
                          status.includes('maintenance') || 
                          status.includes('inworkshop') || 
                          status.includes('under_repair') || 
                          item?.Category?.toLowerCase() === 'workshop';
        console.log('DashesDataContext: Workshop filter:', {
          sno: item.sno,
          vehicleNumber: item.VehicleNumber || item.VechNumber || item.VechileNumber || item.veh_number || item.veh_no,
          status,
          hasWorkshopDate: !!hasWorkshopDate,
          isWorkshop,
          category: item.Category
        });
        return isWorkshop;
      })
      .map(item => {
        const vehicleNumber = item.VehicleNumber || item.VechNumber || item.VechileNumber || item.veh_number || item.vehicle_number || item.veh_no || 'N/A';
        const lastUsed = item.WorkshopDate || item.workshop_date || item.workshopdate || item.Date || item.date || new Date().toISOString().split('T')[0];
        const statusLabel = (item?.TransStatus || item?.status || item?.Status || 'Workshop');
        console.log('DashesDataContext: Mapping Workshop item:', {
          sno: item.sno,
          vehicleNumber,
          lastUsed,
          statusLabel
        });
        return {
          id: item.id || item.sno || Math.random(),
          plate: vehicleNumber,
          lastUsed,
          statusLabel
        };
      });
    console.log('DashesDataContext: Workshop vehicles:', JSON.stringify(vehicles, null, 2));
    return vehicles;
  };

  const getHighestFuelConsumptionVehicle = () => {
    if (!assetData.length) {
      console.log('DashesDataContext: No asset data for Fuel Consumption');
      return null;
    }
    console.log('DashesDataContext: Inspecting assetData for Fuel:', JSON.stringify(assetData, null, 2));
    const fuelData = assetData.filter(item => item.Category === 'Fuel Consumption' && item?.Qty && parseFloat(item.Qty) > 0);
    if (!fuelData.length) {
      console.log('DashesDataContext: No valid fuel consumption data');
      return null;
    }
    const highestConsumption = fuelData.reduce((max, item) => {
      const currentQty = parseFloat(item.Qty) || 0;
      const maxQty = parseFloat(max.Qty) || 0;
      return currentQty > maxQty ? item : max;
    });
    const vehicleNumber = highestConsumption.VehicleNumber || highestConsumption.VechNumber || highestConsumption.VechileNumber || highestConsumption.veh_number || highestConsumption.vehicle_number || highestConsumption.veh_no || 'N/A';
    const result = {
      plate: vehicleNumber,
      Qty: highestConsumption.Qty || '0',
      lastUsed: highestConsumption.Date || highestConsumption.date || new Date().toISOString().split('T')[0]
    };
    console.log('DashesDataContext: Highest Fuel Consumption:', JSON.stringify(result, null, 2));
    return result;
  };

  const getTotalVehicleCount = () => {
    if (!assetData.length) {
      console.log('DashesDataContext: No asset data for Total Vehicle Count');
      return 0;
    }
    const uniqueVehicles = new Set();
    assetData.forEach(item => {
      const vehicleNumber = item.VehicleNumber || item.VechNumber || item.VechileNumber || item.veh_number || item.vehicle_number || item.veh_no;
      if (vehicleNumber) {
        uniqueVehicles.add(vehicleNumber);
      }
    });
    const count = uniqueVehicles.size;
    console.log('DashesDataContext: Total Vehicle Count:', count);
    return count;
  };

  return (
    <DashesDataContext.Provider
      value={{
        previousProfitLossData,
        previousPeriodLoading,
        setPreviousTodayRange,
        setPreviousYesterdayRange,
        setPreviousWeekRange,
        setPreviousMonthRange,
        setPreviousCustomRange,
        profitLossData,
        accountsData,
        productionData,
        assetData,
        setAssetData,
        loadingStates,
        selectedCompany,
        startDate,
        endDate,
        startTime,
        endTime,
        setStartDate,
        setEndDate,
        setStartTime,
        setEndTime,
        fetchSingleDashboard,
        fetchAllDashboards,
        fetchCustomDashboard,
        refreshDashboardData,
        setTodayRange,
        setYesterdayRange,
        setWeekRange,
        setMonthRange,
        getTotalByCategory,
        getNetProfitLoss,
        DASHBOARD_TYPES,
        getInTransitVehicles,
        getIdleVehicles,
        getWorkshopVehicles,
        getHighestFuelConsumptionVehicle,
        getTotalVehicleCount,
      }}
    >
      {children}
    </DashesDataContext.Provider>
  );
};