import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Dimensions,
  Text,
  SafeAreaView,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { BackHandler } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHome, faKey, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { getStoredData } from '../common/AsyncStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WebViewComponent = ({ route }) => {
  const webViewRef = useRef(null);
  const navigation = useNavigation();
  const { URL } = route.params;
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(URL);
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [comDetails, setComDetails] = useState({
    GstNo: '',
    Webkey: '',
    PassKey: '',
    Username: '',
    Password: '',
    MobileAuthId: '',
    MobileAppId: '',
    UserId: '',
    Role: '',
  });
  const [loginUrl, setLoginUrl] = useState("");

  useEffect(() => {
    const SetCompany = async () => {
      try {
        const localCom = await AsyncStorage.getItem('SelectedCompany');
        const selectedCompany = localCom ? JSON.parse(localCom) : 0;
        setSelectedCompany(selectedCompany);

        const localData = await getStoredData('CompanyDetails');
        if (localData) {
          const selectedItem = localData.find(val => val.id === selectedCompany);
          if (selectedItem) {
            setComDetails(selectedItem);
            const { Webkey, UserId, Username, Password, MobileAppId, MobileAuthId } = selectedItem;
            const baseUrl = `https://${Webkey}.sazss.in/`;
            const path = URL.replace(baseUrl, "");
            const MobLoginurl = `https://${Webkey}.sazss.in/SazsMobileAu.aspx?MobAppId=${MobileAppId}&MobAuthId=${MobileAuthId}&MinesreDirect=${UserId}&RedirectURL=${path}`;
            setLoginUrl(MobLoginurl);
            console.log("Constructed URL:", MobLoginurl, loginUrl);
          }
        }
      } catch (error) {
        console.error("Error setting company details:", error);
      }
    };

    SetCompany();
  }, []);


  useEffect(() => {
    const handleBackButtonClick = () => {
      if (canGoBack) {
        if (URL === currentUrl) {
          navigation.navigate('AdminMain');

        } else {
          webViewRef.current.goBack();

        }
        return true;
      } else {
        navigation.navigate('AdminMain');
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackButtonClick,
    );

    return () => {
      backHandler.remove();
    };
  }, [canGoBack]);

  const onNavigationStateChange = navState => {
    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);
    console.log(navState.url);

    if (navState.url.includes('Login') || navState.url.includes('Oops')) {
      console.log();
      setCurrentUrl(loginUrl);

    }
  };

  const handleNavigation = (request) => {
    const { url } = request;

    // Ensure the navigation happens within the WebView
    // if (url.startsWith('https://example.com')) {
    //   return true; // Allow navigation
    // }

    // Block or handle external links
    return true;
  };
  const navigateToUrl = newUrl => {
    setCurrentUrl(newUrl);
  };

  return (
    <SafeAreaView style={styles.home}>
      <WebView
        ref={webViewRef}
        style={styles.webview}
        source={{ uri: currentUrl }}
        onNavigationStateChange={onNavigationStateChange}
        onShouldStartLoadWithRequest={handleNavigation}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true} // Support pinch-to-zoom
        allowsFullscreenVideo={true}
        setSupportMultipleWindows={false}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
        injectedJavaScript={`
    const metaTag = document.createElement('meta');
    metaTag.name = 'viewport';
    metaTag.content = 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes';
    document.getElementsByTagName('head')[0].appendChild(metaTag);
    true;
  `}
        javaScriptEnabledAndroid={true}
        onContentProcessDidTerminate={() => webViewRef.current.reload()} // Auto-reload if content process crashes
      />
      {/* <TouchableOpacity
        style={styles.BtnLeft}
        onPress={() => {
          console.log(loginUrl);
          setCurrentUrl(loginUrl)
        }}>
        <FontAwesomeIcon icon={faKey} size={25} color="white" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.BtnRight}
        onPress={() => navigation.navigate('AdminMain')}>
        <FontAwesomeIcon icon={faHome} size={25} color="white" />
      </TouchableOpacity> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  home: {
    marginTop: 40,
    backgroundColor: '#3E89EC',
    flex: 1,
  },
  BtnRight: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#3E89EC',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  BtnLeft: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#3E89EC',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  webview: {
    flex: 1,
    width: '100%',
    marginTop: 30,
    height: Dimensions.get('window').height,
  },
});

export default WebViewComponent;
