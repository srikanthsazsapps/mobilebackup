import React, {createContext, useState, useEffect} from 'react';
import {getStoredData} from './AsyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';

export const LocalDataContext = createContext();

const LocalDataProvider = ({children}) => {
  const [profileInfo, setProfileInfo] = useState({
    ProfilePhoto: null,
    CompanyName: null,
  });

  const getprofile = async () => {
    const ComDetails = await getStoredData('ProfileInfo');
    console.log(ComDetails, 'ComDetails');
    setProfileInfo(ComDetails);
  };

  const ChangeCompanyName = async value => {
    await AsyncStorage.setItem(
      'ProfileInfo',
      JSON.stringify({...profileInfo, CompanyName: value}),
    );
    setProfileInfo({...profileInfo, CompanyName: value});
  };

  const ChangeCompanyLogo = async value => {
    await AsyncStorage.setItem(
      'ProfileInfo',
      JSON.stringify({...profileInfo, ProfilePhoto: value}),
    );
    setProfileInfo({...profileInfo, ProfilePhoto: value});
  };

  const handleProfilePhotoUpload = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const uri = response.assets[0].uri;
        setProfileInfo({...profileInfo, ProfilePhoto: uri});
        ChangeCompanyLogo(uri);
      }
    });
  };

  const handleClearProfilePhoto = () => {
    setProfileInfo({...profileInfo, ProfilePhoto: null});
    ChangeCompanyLogo(null);
  };

  useEffect(() => {
    getprofile();
  }, []);

  return (
    <LocalDataContext.Provider
      value={{
        profileInfo,
        getprofile,
        ChangeCompanyName,
        ChangeCompanyLogo,
        handleProfilePhotoUpload,
        handleClearProfilePhoto,
        setProfileInfo,
      }}>
      {children}
    </LocalDataContext.Provider>
  );
};

export default LocalDataProvider;
