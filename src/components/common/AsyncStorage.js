import AsyncStorage from "@react-native-async-storage/async-storage";

export const getStoredData = async localkey => {
    try {
      const storedData = await AsyncStorage.getItem(localkey);
      if (storedData !== undefined || storedData !== null) {
        return JSON.parse(storedData);
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  };