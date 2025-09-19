import React, { useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ImageBackground } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedGestureHandler, 
  useAnimatedStyle, 
  withSpring,
  runOnJS 
} from 'react-native-reanimated';

const SalesReport = () => {
  const translateY = useSharedValue(0);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (event, context) => {
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateY.value = context.startY + event.translationY;
    },
    onEnd: (event) => {
      const shouldClose = translateY.value > 100;
      translateY.value = withSpring(shouldClose ? 300 : 0);
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Image */}
      <ImageBackground 
        source={require('../../../images/22.png')} // Replace with your image path
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Draggable Container */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.vehicleWrapper, animatedStyle]}>
            {/* Drag Handle */}
            <View style={styles.dragBarContainer}>
              <View style={styles.dragHandle} />
            </View>
            
            {/* Content Container */}
            <View style={styles.contentContainer}>
              <Text style={styles.title}>Content Here</Text>
              <Text style={styles.subtitle}>Drag me up and down</Text>
            </View>
          </Animated.View>
        </PanGestureHandler>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    bottom:60,
  },
  vehicleWrapper: { 
    backgroundColor: '#fff', 
    padding: 10, 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    elevation: 5, 
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 200, // Start partially visible
    height: '100%'
  },
  dragBarContainer: { 
    paddingVertical: 16, 
    paddingHorizontal: 4, 
    alignItems: 'center' 
  },
  dragHandle: { 
    width: 40, 
    height: 4, 
    backgroundColor: '#ddd', 
    borderRadius: 2, 
    marginBottom: 12 
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  }
});

export default SalesReport;