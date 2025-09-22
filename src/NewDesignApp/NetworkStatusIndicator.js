import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Easing,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
 
const NetworkStatusIndicator = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [showStatus, setShowStatus] = useState(false);
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable;
     
      if (connected !== isConnected) {
        setIsConnected(connected);
        handleNetworkChange(connected);
      }
    });
 
    NetInfo.fetch().then(state => {
      const connected = state.isConnected && state.isInternetReachable;
      setIsConnected(connected);
      if (!connected) {
        handleNetworkChange(connected);
      }
    });
 
    return () => unsubscribe();
  }, [isConnected]);
 
  const handleNetworkChange = (connected) => {
    if (connected) {
      // Network ON: Show green smoothly and hide after 3 seconds
      setShowStatus(true);
      showBarSmoothly();
      stopBlinking();
     
      setTimeout(() => {
        hideBarSmoothly();
      }, 3000);
    } else {
      // Network OFF: Show red with smooth blinking
      setShowStatus(true);
      showBarSmoothly();
      startSmoothBlinking();
    }
  };
 
  const showBarSmoothly = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };
 
  const hideBarSmoothly = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowStatus(false);
    });
  };
 
  const startSmoothBlinking = () => {
    const smoothBlink = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 1000,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.bezier(0.4, 0.0, 0.6, 1.0),
            useNativeDriver: true,
          }),
        ]),
        { iterations: -1 }
      ).start();
    };
   
    // Only start if disconnected
    if (!isConnected) {
      smoothBlink();
    }
  };
 
  const stopBlinking = () => {
    blinkAnim.stopAnimation();
    Animated.timing(blinkAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };
 
  if (!showStatus) {
    return null;
  }
 
  return (
    <Animated.View
      style={[
        styles.statusBar,
        {
          backgroundColor: isConnected ? '#4CAF50' : '#F44336',
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: isConnected ? 1 : blinkAnim,
          },
        ]}
      >
        <Animated.View style={[
          styles.statusDot,
          {
            opacity: isConnected ? 1 : blinkAnim,
            transform: [{
              scale: isConnected ? 1 : blinkAnim.interpolate({
                inputRange: [0.3, 1],
                outputRange: [0.8, 1],
              })
            }]
          }
        ]} />
        <Animated.Text style={[
          styles.statusText,
          {
            opacity: isConnected ? 1 : blinkAnim,
          }
        ]}>
          {isConnected ? '✓ Network Connected' : '⚠ No Internet Connection'}
        </Animated.Text>
      </Animated.View>
     
      {/* Smooth gradient overlay for better visual effect */}
      <View style={[
        styles.gradientOverlay,
        { backgroundColor: isConnected ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }
      ]} />
    </Animated.View>
  );
};
 
const styles = StyleSheet.create({
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    paddingTop: StatusBar.currentHeight || 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
});
 
export default NetworkStatusIndicator;