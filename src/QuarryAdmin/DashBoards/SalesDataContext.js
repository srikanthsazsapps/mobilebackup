import React, {createContext, useState, useEffect} from 'react';
import { getStoredData } from '../../components/common/AsyncStorage';
import base64 from 'react-native-base64';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SalesDataContext = createContext();

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
    const {Webkey, GstNo, Username, Password, UserId} = userData;
    console.log(UserId, 'UserId');

    const authHeader2 = `Basic ${base64.encode(`${Username}:${Password}`)}`;
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const apiUrl = `https://${Webkey}.sazss.in/Api/UserMenus?UserId=${UserId}`;
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: authHeader2,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error during API call000', error);
  }
};

const GatherData = async (userData, fromDate, toDate, dashName) => {
  try {
    const {Webkey, GstNo, Username, Password} = userData;
    const authHeader2 = `Basic ${base64.encode(`${Username.trim()}:${Password.trim()}`)}`;
    const today = new Date();
    console.log(Webkey, GstNo, Username, Password, 'rfutfyt');
    
    const formattedDate = today.toISOString().split('T')[0];
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
          Authorization: authHeader2,
        },
      },
    );

    // Process the nested array response to flatten and structure the data
    const processedData = processApiResponse(response.data);
    return processedData;
  } catch (error) {
    console.error('Error during API call', error);
  }
};

// Process the nested API response into a structured format
const processApiResponse = (apiData) => {
  if (!Array.isArray(apiData) || apiData.length === 0) {
    return [];
  }

  const processedData = {
    summary: null,
    salesSummary: null,
    suppliers: [],
    customers: [],
    products: [],
  };

  // Process each section of the nested array
  apiData.forEach((section, index) => {
    if (!Array.isArray(section) || section.length === 0) {
      return;
    }

    const firstItem = section[0];

    // Section 0: General Summary (TotalTrips, TotalQty, AvgQty)
    if (index === 0 && firstItem.TotalTrips && firstItem.TotalQty && firstItem.AvgQty) {
      processedData.summary = firstItem;
    }

    // Section 1: Sales Summary (TotalCashSales, TotalCreditSales, etc.)
    if (index === 1 && firstItem.TotalCashSales && firstItem.TotalCreditSales) {
      processedData.salesSummary = firstItem;
    }

    // Section 2: Suppliers data
    if (index === 2 && firstItem.SNo && firstItem.Supplier !== undefined) {
      // Filter out the total row and process supplier data
      const supplierData = section.filter(item => item.Supplier && item.Supplier !== 'Total');
      processedData.suppliers = supplierData.map((item, idx) => ({
        id: idx,
        ...item,
      }));
    }

    // Section 3: Customers data
    if (index === 3 && firstItem.CustomerName) {
      processedData.customers = section.map((item, idx) => ({
        id: idx,
        ...item,
      }));
    }

    // Section 4: Products data
    if (index === 4 && firstItem.ProductName) {
      processedData.products = section.map((item, idx) => ({
        id: idx,
        ...item,
      }));
    }
  });

  // Create a flattened array for backward compatibility
  const flattenedData = [];
  
  if (processedData.summary) flattenedData.push(processedData.summary);
  if (processedData.salesSummary) flattenedData.push(processedData.salesSummary);
  processedData.suppliers.forEach(supplier => flattenedData.push(supplier));
  processedData.customers.forEach(customer => flattenedData.push(customer));
  processedData.products.forEach(product => flattenedData.push(product));

  return {
    ...processedData,
    flattenedData,
    rawData: apiData, // Keep original data for debugging
  };
};

export const SalesDataProvider = ({children}) => {
  const [dailyData, setDailyData] = useState({
    summary: null,
    salesSummary: null,
    suppliers: [],
    customers: [],
    products: [],
    flattenedData: [],
    rawData: null,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [startTime, setStartTime] = useState();
  const [endTime, setEndTime] = useState();
  const [userMenus, setUserMenus] = useState([]);
  const [currentDashboardType, setCurrentDashboardType] = useState(DASHBOARD_TYPES.SALES);

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

    return adjustedDate;
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
    await AsyncStorage.setItem(
      'SelectedCompany',
      JSON.stringify(selectedCompany),
    );
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
      const formattedFromDate = combineDateTime(startDatee, defaultTime);
      const formattedToDate = combineDateTime(endDatee, defaultTime);
      const menus = await GetUserMenus(localData[0]);
      setUserMenus(menus[0]);

      let allData;

      if (selectedCompany === 0) {
        allData = [];
        
        for (const obj of localData) {
          const companyData = await GatherData(
            obj,
            formattedFromDate,
            formattedToDate,
            dashType
          );
          
          if (companyData && companyData.flattenedData) {
            allData = allData.concat(companyData.flattenedData);
          }
        }
        
        // Merge data from multiple companies
        const mergedData = mergeCompanyData(allData);
        setDailyData(mergedData);
      } else {
        const selectedItem = localData.filter(
          val => val.id === selectedCompany,
        );

        const data = await GatherData(
          selectedItem[0],
          formattedFromDate,
          formattedToDate,
          dashType
        );
        setDailyData(data);
      }
    } catch (error) {
      console.error('Error fetching stored data:', error);
      setDailyData({
        summary: null,
        salesSummary: null,
        suppliers: [],
        customers: [],
        products: [],
        flattenedData: [],
        rawData: null,
      });
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  // Merge data from multiple companies
  const mergeCompanyData = (allFlattenedData) => {
    if (!allFlattenedData || allFlattenedData.length === 0) {
      return {
        summary: null,
        salesSummary: null,
        suppliers: [],
        customers: [],
        products: [],
        flattenedData: [],
        rawData: null,
      };
    }

    // This is a simplified merge - you might want to implement more sophisticated merging logic
    // based on your specific requirements
    const merged = {
      summary: allFlattenedData.find(item => item.TotalTrips && item.TotalQty && item.AvgQty) || null,
      salesSummary: allFlattenedData.find(item => item.TotalCashSales && item.TotalCreditSales) || null,
      suppliers: allFlattenedData.filter(item => item.Supplier && item.TotalQty && item.UOM),
      customers: allFlattenedData.filter(item => item.CustomerName && item.TotalNetAmount),
      products: allFlattenedData.filter(item => item.ProductName && item.TotalNetAmount),
      flattenedData: allFlattenedData,
      rawData: allFlattenedData,
    };

    return merged;
  };

  const fetchData = async (dashType = currentDashboardType) => {
    try {
      setLoading(true);
      
      const localData = await getStoredData('CompanyDetails');
      const formattedFromDate = combineDateTime(startDate, startTime);
      const formattedToDate = combineDateTime(endDate, endTime);
      const menus = await GetUserMenus(localData[0]);
      setUserMenus(menus[0]);
      
      let allData;

      if (selectedCompany === 0) {
        allData = [];
        
        for (const obj of localData) {
          const companyData = await GatherData(
            obj,
            formattedFromDate,
            formattedToDate,
            dashType
          );
          
          if (companyData && companyData.flattenedData) {
            allData = allData.concat(companyData.flattenedData);
          }
        }
        
        const mergedData = mergeCompanyData(allData);
        setDailyData(mergedData);
      } else {
        const selectedItem = localData.filter(
          val => val.id === selectedCompany,
        );

        const data = await GatherData(
          selectedItem[0],
          formattedFromDate,
          formattedToDate,
          dashType
        );
        setDailyData(data);
      }
    } catch (error) {
      console.error('Error fetching stored data:', error);
      setDailyData({
        summary: null,
        salesSummary: null,
        suppliers: [],
        customers: [],
        products: [],
        flattenedData: [],
        rawData: null,
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

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      8,
      0,
      0,
      0,
    );

    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      8,
      0,
      0,
      0,
    );

    fetchDataCustom(startOfMonth, endOfMonth, dashType);
    setStartDate(startOfMonth);
    setEndDate(endOfMonth);
    setStartTime(defaultTime);
    setEndTime(defaultTime);
  };

  // Helper functions to access structured data
  const getSummaryData = () => dailyData.summary;
  const getSalesSummary = () => dailyData.salesSummary;
  const getSuppliers = () => dailyData.suppliers;
  const getCustomers = () => dailyData.customers;
  const getProducts = () => dailyData.products;
  const getFlattenedData = () => dailyData.flattenedData;

  return (
    <SalesDataContext.Provider
      value={{
        // Structured data access
        summaryData: getSummaryData(),
        salesSummary: getSalesSummary(),
        suppliers: getSuppliers(),
        customers: getCustomers(),
        products: getProducts(),
        flattenedData: getFlattenedData(),
        
        // Legacy support
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
      }}>
      {children}
    </SalesDataContext.Provider>
  );
};