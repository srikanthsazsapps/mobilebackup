// FloatingMenu.js
import React, { useRef, useState } from 'react';
import {
  View,
  Animated,
  PanResponder,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

// Replace these with your icons/components
const MenuIcon1 = () => <View style={styles.menuIcon} />;
const MenuIcon2 = () => <View style={styles.menuIcon} />;
const MenuIcon3 = () => <View style={styles.menuIcon} />;

const FloatingMenu = ({ navigation }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const [menuOpen, setMenuOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.extractOffset();
        Animated.spring(fabScale, {
          toValue: 1.1,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        Animated.spring(fabScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setMenuOpen(false));
    } else {
      setMenuOpen(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  // Link to Dashboard screen names
  const menuItems = [
    { Icon: MenuIcon1, action: () => navigation.navigate('AccountDashBoard') },
    { Icon: MenuIcon2, action: () => navigation.navigate('AuditDashBoard') },
    { Icon: MenuIcon3, action: () => navigation.navigate('AssetsDash') },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {menuOpen && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.fab,
          { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Toggle menu"
          onPress={toggleMenu}
        >
          <Animated.View
            style={[styles.fabButton, { transform: [{ scale: fabScale }] }]}
          />
        </TouchableOpacity>
        {menuOpen &&
          menuItems.map((item, idx) => {
            const angle = (Math.PI / 4) + idx * (Math.PI / 4); // 45°, 90°, 135°
            const radius = 80;
            const x = radius * Math.cos(angle);
            const y = -radius * Math.sin(angle);
            const itemStyle = {
              left: x,
              top: y,
              opacity: animation,
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            };
            return (
              <Animated.View key={idx} style={[styles.menuItem, itemStyle]}>
                <TouchableOpacity
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Navigate to Screen ${idx + 1}`}
                  onPress={() => {
                    item.action();
                    toggleMenu();
                  }}
                >
                  <item.Icon />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    zIndex: 1000,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'dodgerblue',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItem: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  menuIcon: {
    width: 24,
    height: 24,
    backgroundColor: 'gray',
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 500,
  },
});

export default FloatingMenu;
