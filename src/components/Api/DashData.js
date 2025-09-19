import axios from 'axios';
import base64 from 'react-native-base64';

export const GatherData = async userData => {
    const {Webkey, GstNo, Username, Password} = userData;
    const authHeader2 = `Basic ${base64.encode(
      `${Username.trim()}:${Password.trim()}`,
    )}`;
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    try {
      const apiUrl = `https://${Webkey.trim()}.sazss.in/Api/DailySiteReport`;
      const response = await axios.post(
        apiUrl,
        {
          fromDate: '2024-09-08', // Include fromDate in the body
          toDate: '2024-09-13', // Include toDate in the body
        },
        {
          headers: {
            Authorization: authHeader2,
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error during API call', error);
    }
  };