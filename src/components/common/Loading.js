// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import FastImage from 'react-native-fast-image';

// const Loading = () => {
//   return (
//     <View style={styles.animationContainer}>
//       <FastImage
//         source={require('../../images/SazsLgo.gif')}
//         style={styles.loadingGif}
//         resizeMode={FastImage.resizeMode.contain}
//       />
//     </View>
//   );
// };
 
// const styles = StyleSheet.create({
//   overlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0, 0, 0, 0.2)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 999, // optional: ensures it overlays other content
//   },
//   container: {
//     width: 100,
//     height: 120,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   spinnerContainer: {
//     position: 'absolute',
//     width: SIZE,
//     height: SIZE,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logoContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     overflow: 'hidden',
//   },
//   logo: {
//     width: 60,
//     height: 60,
//   },
// });
 
// export default Loading;
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import FastImage from 'react-native-fast-image';
 
const SIZE = 120;
const STROKE_WIDTH = 6;
const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
 
const Loading = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
 
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);
 
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
 
  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate: spin }] }]}>
          <Svg width={SIZE} height={SIZE}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="#216dce"
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${CIRCUMFERENCE * 0.3}, ${CIRCUMFERENCE}`}
              strokeLinecap="round"
              fill="none"
            />
          </Svg>
        </Animated.View>
 
        <View style={styles.logoContainer}>
          <FastImage
            source={require('../../images/SazsLgo.gif')}
            style={styles.logo}
            resizeMode={FastImage.resizeMode.contain}
          />
        </View>
      </View>
    </View>
  );
};
 
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    // backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999, // optional: ensures it overlays other content
  },
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerContainer: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  logo: {
    width: 60,
    height: 60,
  },
});
 
export default Loading;