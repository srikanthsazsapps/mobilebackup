import React, {useContext, useRef, useEffect, useState} from 'react';
import {
  View,
  Dimensions,
  Text,
  Animated,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  PanResponder,
} from 'react-native';
import {BlurView} from '@react-native-community/blur';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons';
import Notifications from './Notifications';
import GlobalStyle from '../components/common/GlobalStyle';
const {height} = Dimensions.get('window');

const DRAWER_HEIGHTS = {
  CLOSED: 0,
  MINIMIZED: height * 0.25,
  HALF: height * 0.5,
  FULL: height * 0.8,
};

const TopDrawer = ({ isVisible, onClose }) => {
  const translateY = useRef(new Animated.Value(-DRAWER_HEIGHTS.FULL)).current;
  const [currentHeight, setCurrentHeight] = useState(DRAWER_HEIGHTS.HALF);

  useEffect(() => {
    if (isVisible) {
      openDrawer();
    } else {
      closeDrawer();
    }
  }, [isVisible]);

  const openDrawer = () => {
    Animated.spring(translateY, {
      toValue: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(translateY, {
      toValue: -DRAWER_HEIGHTS.FULL,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        const newPosition = Math.max(-gestureState.dy, -DRAWER_HEIGHTS.FULL);
        translateY.setValue(newPosition);
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vy;
        const currentPosition = -gestureState.dy;

        if (velocity > 0.5 || currentPosition < DRAWER_HEIGHTS.MINIMIZED) {
          closeDrawer();
        } else if (velocity < -0.5 || currentPosition > DRAWER_HEIGHTS.HALF) {
          snapToHeight(DRAWER_HEIGHTS.FULL);
        } else {
          snapToHeight(DRAWER_HEIGHTS.HALF);
        }
      },
    }),
  ).current;

  const snapToHeight = (height) => {
    setCurrentHeight(height);
    Animated.spring(translateY, {
      toValue: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
  };

  if (!isVisible) return null;

  return (
    <>
      <TouchableOpacity
        style={styles.blurContainer}
        activeOpacity={1}
        onPress={closeDrawer}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={10}
        />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{translateY}],
            height: DRAWER_HEIGHTS.FULL,
          },
        ]}>
        <View style={styles.drawerHeader}>
          <Text style={[GlobalStyle.heading5,styles.notificationTitle]}>Notifications</Text>
          <TouchableOpacity
            onPress={closeDrawer}
            style={styles.closeButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <FontAwesomeIcon icon={faTimes} size={20} style={{right:13}}color="black" />
          </TouchableOpacity>
        </View>

        <View
          style={styles.notificationScroll}
          showsVerticalScrollIndicator={false}>
          <Notifications />
        </View>

        <View {...panResponder.panHandlers} style={styles.handleBarContainer}>
          <View style={styles.handleBar} />
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  blurContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    marginTop:30,
  },
  notificationTitle: {
    flex: 1,
    // fontSize: 18,
    // fontFamily: 'Cabin-Bold',
    // color:'black'
  },
  closeButton: {
    padding: 8,
  },
  notificationScroll: {
    flex: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  handleBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleBar: {
    width: 60,
    height: 5,
    backgroundColor: '#3E89EC',
    borderRadius: 2.5,
  },
});

export default TopDrawer;