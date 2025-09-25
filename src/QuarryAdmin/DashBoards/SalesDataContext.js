import React, { createContext, useState, useEffect } from 'react';
import { getStoredData } from '../../components/common/AsyncStorage'; // Adjust path as needed
import base64 from 'react-native-base64';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SalesDataContext = createContext();

export const DASHBOARD_TYPES = {
  SALES: 'sales',
  PURCHASE: 'purchase',
};

const formatDateToString = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const GetUserMenus = async userData => {
  try {
    const { Webkey, Username, Password, UserId } = userData;
    console.log('GetUserMenus - UserId:', UserId, 'Webkey:', Webkey);

    const authHeader = `Basic ${base64.encode(`${Username}:${Password}`)}`;
    const apiUrl = `https://${Webkey}.sazss.in/Api/UserMenus?UserId=${UserId}`;
    console.log('GetUserMenus - URL:', apiUrl, 'Auth:', authHeader.slice(0, 20) + '...');

    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: authHeader,
      },
      timeout: 10000,
    });
    console.log('GetUserMenus - Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('GetUserMenus - Error:', error.response?.status, error.response?.data || error.message);
    return null;
  }
};

const GatherData = async (userData, fromDate, toDate, dashName) => {
  try {
    const { Webkey, GstNo, Username, Password } = userData;
    const authHeader = `Basic ${base64.encode(`${Username.trim()}:${Password.trim()}`)}`;
    console.log('GatherData - Params:', { Webkey, GstNo, dashName, fromDate, toDate });

    const apiUrl = `https://${Webkey}.sazss.in/Api/DashesDatas`;
    console.log('GatherData - URL:', apiUrl, 'Auth:', authHeader.slice(0, 20) + '...');

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
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      },
    );

    console.log('GatherData - Full Response:', JSON.stringify(response.data, null, 2));
    const processedData = processApiResponse(response.data);
    console.log('GatherData - Processed Data:', JSON.stringify(processedData, null, 2));
    return processedData;
  } catch (error) {
    console.error('GatherData - Error Details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      fromDate,
      toDate,
      dashName,
    });
    return null;
  }
};

const processApiResponse = (apiData) => {
  console.log('processApiResponse - Raw API Input:', JSON.stringify(apiData, null, 2));

  if (!Array.isArray(apiData) || apiData.length === 0) {
    console.warn('processApiResponse - Invalid or empty data received');
    return {
      summary: null,
      salesSummary: null,
      suppliers: [],
      customers: [],
      products: [],
      additionalData: [],
      flattenedData: [],
      rawData: apiData,
    };
  }

  const processedData = {
    summary: null,
    salesSummary: null,
    suppliers: [],
    customers: [],
    products: [],
    additionalData: [],
  };

  apiData.forEach((section, index) => {
    console.log(`processApiResponse - Processing Section ${index}:`, JSON.stringify(section, null, 2));

    if (!Array.isArray(section) || section.length === 0) {
      console.log(`processApiResponse - Section ${index} is empty or not an array`);
      return;
    }

    const firstItem = section[0];
    console.log(`processApiResponse - Section ${index} First Item:`, JSON.stringify(firstItem, null, 2));

    if (index === 0 && firstItem.TotalTrips !== undefined && firstItem.TotalQty !== undefined && firstItem.AvgQty !== undefined) {
      processedData.summary = firstItem;
      console.log('processApiResponse - Summary Data:', JSON.stringify(processedData.summary, null, 2));
    }

    if (index === 1 && firstItem.TotalCashSales !== undefined && firstItem.TotalCreditSales !== undefined) {
      processedData.salesSummary = firstItem;
      console.log('processApiResponse - Sales Summary Data:', JSON.stringify(processedData.salesSummary, null, 2));
    }

    if (index === 2 && firstItem.SNo !== undefined && firstItem.Supplier !== undefined) {
      const supplierData = section.filter(item => item.Supplier && item.Supplier !== 'Total');
      processedData.suppliers = supplierData.map((item, idx) => ({
        id: idx,
        ...item,
      }));
      console.log('processApiResponse - Suppliers Data:', JSON.stringify(processedData.suppliers, null, 2));
    }

    if (index === 3 && firstItem.CustomerName !== undefined) {
      processedData.customers = section.map((item, idx) => ({
        id: idx,
        ...item,
      }));
      console.log('processApiResponse - Customers Data:', JSON.stringify(processedData.customers, null, 2));
    }

    if (index === 4 && firstItem.ProductName !== undefined) {
      processedData.products = section.map((item, idx) => ({
        id: idx,
        ...item,
      }));
      console.log('processApiResponse - Products Data:', JSON.stringify(processedData.products, null, 2));
    }

    if (index === 5 && firstItem.Head !== undefined && firstItem.Cnt !== undefined && firstItem.Val !== undefined) {
      processedData.additionalData = section.map((item, idx) => ({
        id: idx,
        ...item,
      }));
      console.log('processApiResponse - Additional Data (Section 5):', JSON.stringify(processedData.additionalData, null, 2));
    }
  });

  const flattenedData = [];

  if (processedData.summary) flattenedData.push(processedData.summary);
  if (processedData.salesSummary) flattenedData.push(processedData.salesSummary);
  processedData.suppliers.forEach(supplier => flattenedData.push(supplier));
  processedData.customers.forEach(customer => flattenedData.push(customer));
  processedData.products.forEach(product => flattenedData.push(product));
  processedData.additionalData.forEach(item => flattenedData.push(item));

  const result = {
    ...processedData,
    flattenedData,
    rawData: apiData,
  };

  console.log('processApiResponse - Final Processed Output:', JSON.stringify(result, null, 2));
  return result;
};

const calculatePreviousDates = (periodType, start, end) => {
  let prevStart, prevEnd;
  if (periodType === 'day') {
    prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 1);
    prevEnd = new Date(prevStart);
  } else if (periodType === 'week') {
    prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 7);
    prevEnd = new Date(end);
    prevEnd.setDate(prevEnd.getDate() - 7);
  } else if (periodType === 'month') {
    let prevMonth = start.getMonth() - 1;
    let prevYear = start.getFullYear();
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }
    prevStart = new Date(prevYear, prevMonth, 1);
    prevEnd = new Date(prevYear, prevMonth + 1, 0);
  } else if (periodType === 'custom') {
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - days);
    prevEnd = new Date(end);
    prevEnd.setDate(prevEnd.getDate() - days);
  }
  return { prevStart, prevEnd };
};

export const SalesDataProvider = ({ children }) => {
  const [dailyData, setDailyData] = useState({
    summary: null,
    salesSummary: null,
    suppliers: [],
    customers: [],
    products: [],
    additionalData: [],
    flattenedData: [],
    rawData: null,
  });
  const [previousDailyData, setPreviousDailyData] = useState({
    summary: null,
    salesSummary: null,
    suppliers: [],
    customers: [],
    products: [],
    additionalData: [],
    flattenedData: [],
    rawData: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [userMenus, setUserMenus] = useState([]);
  const [currentDashboardType, setCurrentDashboardType] = useState(DASHBOARD_TYPES.SALES);
  const [selectedPeriodType, setSelectedPeriodType] = useState('day');

  const formatDate = date => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  useEffect(() => {
    const setDate = async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      setStartDate(today);
      setEndDate(today);
    };
    setDate();
  }, []);

  useEffect(() => {
    const SetCompany = async () => {
      const localCom = await AsyncStorage.getItem('SelectedCompany');
      console.log('SetCompany - Stored:', localCom);
      if (localCom) {
        try {
          setSelectedCompany(JSON.parse(localCom));
        } catch (e) {
          console.error('SetCompany - Parse error:', e);
          setSelectedCompany(0);
        }
      } else {
        setSelectedCompany(0);
      }
    };
    SetCompany();
  }, []);

  useEffect(() => {
    if (startDate && endDate && selectedCompany !== undefined) {
      const timer = setTimeout(() => {
        console.log('Auto-fetching data on mount', { startDate, endDate, selectedCompany });
        fetchData();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [startDate, endDate, selectedCompany]);

  useEffect(() => {
    if (startDate && endDate && selectedPeriodType) {
      const fetchPrev = async () => {
        const { prevStart, prevEnd } = calculatePreviousDates(selectedPeriodType, startDate, endDate);
        const prevData = await fetchSalesData(prevStart, prevEnd, currentDashboardType);
        setPreviousDailyData(prevData || {
          summary: null,
          salesSummary: null,
          suppliers: [],
          customers: [],
          products: [],
          additionalData: [],
          flattenedData: [],
          rawData: null,
        });
      };
      fetchPrev();
    }
  }, [startDate, endDate, selectedPeriodType, currentDashboardType, selectedCompany]);

  const fetchSalesData = async (startDatee, endDatee, dashType) => {
    try {
      const localData = await getStoredData('CompanyDetails');
      if (!localData || localData.length === 0) {
        return null;
      }

      const formattedFromDate = formatDateToString(startDatee);
      const formattedToDate = formatDateToString(endDatee);

      let allData;
      if (selectedCompany === 0) {
        allData = [];
        for (const obj of localData) {
          console.log('fetchSalesData - Fetching for company:', JSON.stringify(obj, null, 2));
          const companyData = await GatherData(obj, formattedFromDate, formattedToDate, dashType);
          if (companyData && companyData.flattenedData && companyData.flattenedData.length > 0) {
            allData = allData.concat(companyData.flattenedData);
          } else {
            console.warn('fetchSalesData - No data for company:', obj.id || 'unknown');
          }
        }
        console.log('fetchSalesData - All Data:', JSON.stringify(allData, null, 2));
        const mergedData = mergeCompanyData(allData);
        console.log('fetchSalesData - Merged data:', JSON.stringify(mergedData, null, 2));
        return mergedData;
      } else {
        const selectedItem = localData.find(val => val.id === selectedCompany);
        console.log('fetchSalesData - Selected Item:', JSON.stringify(selectedItem, null, 2));
        if (!selectedItem) {
          return null;
        }
        const data = await GatherData(selectedItem, formattedFromDate, formattedToDate, dashType);
        console.log('fetchSalesData - Single company data:', JSON.stringify(data, null, 2));
        return data;
      }
    } catch (error) {
      console.error('fetchSalesData - Error:', error);
      return null;
    }
  };

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
      setLoading(true);
      setError(null);

      if (!startDatee || !endDatee) {
        throw new Error('Invalid start or end date');
      }

      const localData = await getStoredData('CompanyDetails');
      console.log('fetchDataCustom - CompanyDetails:', JSON.stringify(localData, null, 2));
      console.log('fetchDataCustom - Selected Company:', selectedCompany);
      if (!localData || localData.length === 0) {
        throw new Error('No company details found in storage');
      }

      const menus = await GetUserMenus(localData[0]);
      if (menus) setUserMenus(menus[0]);

      const data = await fetchSalesData(startDatee, endDatee, dashType);
      setDailyData(data || {
        summary: null,
        salesSummary: null,
        suppliers: [],
        customers: [],
        products: [],
        additionalData: [],
        flattenedData: [],
        rawData: null,
      });
    } catch (error) {
      console.error('fetchDataCustom - Overall error:', error);
      setError(error.message || 'Failed to fetch data');
      setDailyData({
        summary: null,
        salesSummary: null,
        suppliers: [],
        customers: [],
        products: [],
        additionalData: [],
        flattenedData: [],
        rawData: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const mergeCompanyData = (allFlattenedData) => {
    console.log('mergeCompanyData - Input:', JSON.stringify(allFlattenedData, null, 2));
    if (!allFlattenedData || allFlattenedData.length === 0) {
      return {
        summary: null,
        salesSummary: null,
        suppliers: [],
        customers: [],
        products: [],
        additionalData: [],
        flattenedData: [],
        rawData: null,
      };
    }

    let totalSummary = allFlattenedData.find(item => item.TotalTrips && item.TotalQty && item.AvgQty);
    let totalSalesSummary = allFlattenedData.find(item => item.TotalCashSales && item.TotalCreditSales);

    const summaries = allFlattenedData.filter(item => item.TotalTrips && item.TotalQty && item.AvgQty);
    if (summaries.length > 1) {
      totalSummary = {
        TotalTrips: summaries.reduce((sum, s) => sum + (s.TotalTrips || 0), 0),
        TotalQty: summaries.reduce((sum, s) => sum + (s.TotalQty || 0), 0),
        AvgQty: summaries.reduce((sum, s) => sum + (s.AvgQty || 0), 0) / summaries.length,
      };
    }

    const salesSummaries = allFlattenedData.filter(item => item.TotalCashSales && item.TotalCreditSales);
    if (salesSummaries.length > 1) {
      totalSalesSummary = {
        TotalCashSales: salesSummaries.reduce((sum, s) => sum + (parseFloat(s.TotalCashSales) || 0), 0),
        TotalCreditSales: salesSummaries.reduce((sum, s) => sum + (parseFloat(s.TotalCreditSales) || 0), 0),
      };
    }

    const merged = {
      summary: totalSummary,
      salesSummary: totalSalesSummary,
      suppliers: allFlattenedData.filter(item => item.Supplier && item.TotalQty && item.UOM),
      customers: allFlattenedData.filter(item => item.CustomerName && item.TotalNetAmount),
      products: allFlattenedData.filter(item => item.ProductName && item.TotalNetAmount),
      additionalData: allFlattenedData.filter(item => item.Head && item.Cnt && item.Val),
      flattenedData: allFlattenedData,
      rawData: allFlattenedData,
    };

    console.log('mergeCompanyData - Output:', JSON.stringify(merged, null, 2));
    return merged;
  };

  const fetchData = async (dashType = currentDashboardType) => {
    try {
      setLoading(true);
      setError(null);

      const localData = await getStoredData('CompanyDetails');
      console.log('fetchData - CompanyDetails:', JSON.stringify(localData, null, 2));
      if (!localData || localData.length === 0) {
        throw new Error('No company details found in storage');
      }

      const formattedFromDate = formatDateToString(startDate);
      const formattedToDate = formatDateToString(endDate);
      console.log('fetchData - Date range:', { formattedFromDate, formattedToDate });

      const menus = await GetUserMenus(localData[0]);
      if (menus) setUserMenus(menus[0]);

      const data = await fetchSalesData(startDate, endDate, dashType);
      setDailyData(data || {
        summary: null,
        salesSummary: null,
        suppliers: [],
        customers: [],
        products: [],
        additionalData: [],
        flattenedData: [],
        rawData: null,
      });
    } catch (error) {
      console.error('fetchData - Overall error:', error);
      setError(error.message || 'Failed to fetch data');
      setDailyData({
        summary: null,
        salesSummary: null,
        suppliers: [],
        customers: [],
        products: [],
        additionalData: [],
        flattenedData: [],
        rawData: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const SetToday = async (dashType = currentDashboardType) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    console.log('SetToday - Setting today:', today);
    await fetchDataCustom(today, today, dashType);
    setStartDate(today);
    setEndDate(today);
  };

  const SetYesterday = async (dashType = currentDashboardType) => {
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    console.log('SetYesterday - Setting yesterday:', yesterday);
    await fetchDataCustom(yesterday, yesterday, dashType);
    setStartDate(yesterday);
    setEndDate(yesterday);
  };

  const SetWeek = async (dashType = currentDashboardType) => {
    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6);
    console.log('SetWeek - Setting startOfWeek:', startOfWeek, 'to endOfWeek:', endOfWeek);
    await fetchDataCustom(startOfWeek, endOfWeek, dashType);
    setStartDate(startOfWeek);
    setEndDate(endOfWeek);
  };

  const SetMonth = async (dashType = currentDashboardType) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    console.log('SetMonth - Setting startOfMonth:', startOfMonth, 'to endOfMonth:', endOfMonth);
    await fetchDataCustom(startOfMonth, endOfMonth, dashType);
    setStartDate(startOfMonth);
    setEndDate(endOfMonth);
  };

  const getSummaryData = () => dailyData.summary;
  const getSalesSummary = () => dailyData.salesSummary;
  const getSuppliers = () => dailyData.suppliers;
  const getCustomers = () => dailyData.customers;
  const getProducts = () => dailyData.products;
  const getAdditionalData = () => dailyData.additionalData;
  const getFlattenedData = () => dailyData.flattenedData;

  return (
    <SalesDataContext.Provider
      value={{
        summaryData: getSummaryData(),
        salesSummary: getSalesSummary(),
        suppliers: getSuppliers(),
        customers: getCustomers(),
        products: getProducts(),
        additionalData: getAdditionalData(),
        flattenedData: getFlattenedData(),
        dailyData,
        previousDailyData,
        loading,
        error,
        selectedCompany,
        setSelectedCompany,
        RefreshData,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        SetToday,
        SetYesterday,
        SetWeek,
        SetMonth,
        userMenus,
        currentDashboardType,
        switchDashboardType,
        DASHBOARD_TYPES,
        fetchDataCustom,
        selectedPeriodType,
        setSelectedPeriodType,
      }}
    >
      {children}
    </SalesDataContext.Provider>
  );
};
