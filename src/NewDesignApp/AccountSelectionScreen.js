import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Image,
  Dimensions,
  Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AccountSelectionScreen = ({ navigation }) => {
  const [toggleStates, setToggleStates] = useState({
    owner: false,
    security: false,
    attendance: false,
  });

  const [animations, setAnimations] = useState({
    owner: new Animated.Value(0),
    security: new Animated.Value(0),
    attendance: new Animated.Value(0),
  });

  const accountTypes = [
    {
      id: 'owner',
      title: 'Owner',
      // thumbIcon: require('../images/call.png'),
    },
    {
      id: 'security',
      title: 'Security',
      // thumbIcon: require('../images/logoicon.png'),
    },
    {
      id: 'attendance',
      title: 'Attendance',
      // thumbIcon: require('../images/logoicon.png'),
    },
  ];

  // Calculate responsive dimensions
  const toggleWidth = screenWidth * 0.85; // 85% of screen width
  const thumbSize = screenHeight * 0.06; // 6% of screen height
  const logoSize = Math.min(screenWidth * 0.6, screenHeight * 0.3); // Responsive logo size for 50% layout
  const translateDistance = toggleWidth - thumbSize - 4; // Dynamic translate distance

  const handleToggle = (accountId) => {
    const newState = !toggleStates[accountId];

    setToggleStates((prev) => ({
      ...prev,
      [accountId]: newState,
    }));

    Animated.timing(animations[accountId], {
      toValue: newState ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (newState) {
      setTimeout(() => {
        navigation.navigate('Login', { role: accountId });
      }, 1000);
    }
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
  };

  useFocusEffect(
    useCallback(() => {
      setToggleStates({
        owner: false,
        security: false,
        attendance: false,
      });

      Object.keys(animations).forEach((key) => {
        animations[key].setValue(0);
      });
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2d2d2d" />

      {/* Top 50% - Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../images/logoicon.png')}
          style={[styles.logoImage, { width: logoSize, height: logoSize * 0.5 }]}
          resizeMode="contain"
        />
      </View>

      {/* Bottom 50% - Card Container */}
      <View style={styles.cardContainer}>
        <Text style={styles.title}>Choose an account</Text>
        
        <View style={styles.accountList}>
          {accountTypes.map((account) => (
            <TouchableOpacity
              key={account.id}
              style={styles.accountItem}
              onPress={() => handleToggle(account.id)}
              activeOpacity={0.7}
            >
              <View style={styles.toggleContainer}>
                <Animated.View
                  style={[
                    styles.toggleTrack,
                    {
                      width: toggleWidth,
                      height: thumbSize + 4,
                      backgroundColor: animations[account.id].interpolate({
                        inputRange: [0, 1],
                        outputRange: ['#e5e5e5', '#4CAF50'],
                      }),
                    },
                  ]}
                >
                  <View style={styles.trackLabels}>
                    <Text
                      style={[
                        styles.trackLabelText,
                        { fontSize: Math.max(14, screenWidth * 0.035) },
                        toggleStates[account.id] && styles.trackLabelTextActive,
                      ]}
                    >
                      {account.title}
                    </Text>
                  </View>

                  <Animated.View
                    style={[
                      styles.toggleThumb,
                      {
                        width: thumbSize,
                        height: thumbSize - 4,
                        borderRadius: thumbSize / 2,
                        transform: [
                          {
                            translateX: animations[account.id].interpolate({
                              inputRange: [0, 1],
                              outputRange: [2, translateDistance],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Image
                      source={account.thumbIcon}
                      style={[
                        styles.thumbImage,
                        {
                          width: thumbSize * 0.6,
                          height: thumbSize * 0.6,
                        }
                      ]}
                      resizeMode="contain"
                    />
                  </Animated.View>
                </Animated.View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Text style={styles.agreeText}>
            By proceeding, you agree to SAZS APPS{' '}
          </Text>
          <Text style={styles.linkText} onPress={() => openLink('https://sazsapps.com/')}>
            Terms & Conditions
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Top 50% - Image Container
  imageContainer: {
    flex: 0.5, // 50% of the screen
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: screenWidth * 0.05,
  },
  
  logoImage: {
    // Dynamic sizing handled in component
  },
  
  // Bottom 50% - Card Container
  cardContainer: {
    flex: 0.5, // 50% of the screen
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: screenWidth * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'space-between',
  },
  
  title: {
    fontSize: Math.max(18, screenWidth * 0.045),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: screenHeight * 0.02,
  },
  
  accountList: {
    flex: 1,
    gap: screenHeight * 0.015,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  accountItem: {
    width: '100%',
    alignItems: 'center',
  },
  
  toggleContainer: {
    alignItems: 'center',
  },
  
  toggleTrack: {
    borderRadius: 30,
    justifyContent: 'center',
    backgroundColor: '#e5e5e5',
    padding: 2,
    position: 'relative',
  },
  
  toggleThumb: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: 2,
    left: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  thumbImage: {
    // Dynamic sizing handled in component
  },
  
  trackLabels: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: screenWidth * 0.025,
  },
  
  trackLabelText: {
    fontWeight: '500',
    color: '#666',
  },
  
  trackLabelTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  
  // Terms and Conditions at bottom
  termsContainer: {
    alignItems: 'center',
    marginTop: screenHeight * 0.02,
  },
  
  agreeText: {
    color: 'gray',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Cabin-Regular',
  },
  
  linkText: {
    color: 'rgb(33,109,206)',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default AccountSelectionScreen;
