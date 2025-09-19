import React, { useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F5F6FA' 
  },
  vehicleWrapper: { 
    backgroundColor: '#fff', 
    padding: 10, 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    elevation: 5, 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 100, // Start partially visible
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
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  }
});

export default SalesReport;