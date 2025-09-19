// import React, { createContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const ApiContext = createContext();

// export const ApiProvider = ({ children }) => {
//   const [webkey, setWebkey] = useState(null);
//   const [authHeader, setAuthHeader] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchApiConfig = async () => {
//       try {
//         const companyDetailsString = await AsyncStorage.getItem('CompanyDetails');
//         console.log('CompanyDetails retrieved:', companyDetailsString);
//         if (companyDetailsString) {
//           const companyDetails = JSON.parse(companyDetailsString);
//           const currentCompany = companyDetails[companyDetails.length - 1];
//           if (currentCompany?.Webkey) {
//             setWebkey(currentCompany.Webkey);
//             const username = currentCompany.EmployeeId || '07202519';
//             const password = currentCompany.PassKey || '12345';
//             const auth = `Basic ${btoa(`${username}:${password}`)}`;
//             setAuthHeader(auth);
//             console.log('API Config set:', { webkey: currentCompany.Webkey, authHeader: auth });
//           } else {
//             console.error('Webkey not found in CompanyDetails');
//           }
//         } else {
//           console.error('CompanyDetails not found in AsyncStorage');
//         }
//       } catch (error) {
//         console.error('Error fetching API config:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchApiConfig();
//   }, []);

//   return (
//     <ApiContext.Provider value={{ webkey, authHeader, loading }}>
//       {children}
//     </ApiContext.Provider>
//   );
// };