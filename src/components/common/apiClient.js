// // apiClient.js
// import axios from 'axios';
// import base64 from 'react-native-base64';

// const createApiClient = (webkey, username, password) => {
//   const authHeader = `Basic ${base64.encode(`${username}:${password}`)}`;

//   return axios.create({
//     baseURL: `https://${webkey}.sazss.in/Api`,
//     headers: {
//       Authorization: authHeader,
//       'Content-Type': 'application/json',
//     },
//   });
// };

// export default createApiClient;


// utils/apiClient.js
import axios from 'axios';
import { getStoredData } from './AsyncStorage';
import base64 from 'react-native-base64';

let apiClient = null;

export const getApiClient = async () => {
  if (!apiClient) {
    const userData = (await getStoredData('CompanyDetails'))?.[0];

    if (!userData) throw new Error('User data not found');

    const {Webkey, Username, Password} = userData;
    const authHeader = `Basic ${base64.encode(`${Username.trim()}:${Password.trim()}`)}`;

    apiClient = axios.create({
      baseURL: `https://${Webkey}.sazss.in/Api/dash`,
      headers: {
        Authorization: authHeader,
      },
    });
  }

  return apiClient;
};
