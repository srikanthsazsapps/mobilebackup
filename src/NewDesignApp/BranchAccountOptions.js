import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';

// Custom Logo Component
const Logo = () => (
  <Svg width="80" height="80" viewBox="0 0 100 100">
    <Path
      d="M25 75 L75 75 L65 55 L50 25 L35 55 Z M45 35 C47 33 53 33 55 35 C57 37 57 43 55 45 C53 47 47 47 45 45 C43 43 43 37 45 35 Z M35 50 C37 48 43 48 45 50 C47 52 47 58 45 60 C43 62 37 62 35 60 C33 58 33 52 35 50 Z M55 50 C57 48 63 48 65 50 C67 52 67 58 65 60 C63 62 57 62 55 60 C53 58 53 52 55 50 Z"
      fill="#2563eb"
    />
  </Svg>
);

// Custom Toggle Switch Component
const CustomToggle = ({ isEnabled, onToggle }) => {
  const [animation] = useState(new Animated.Value(isEnabled ? 1 : 0));

  React.useEffect(() => {
    Animated.timing(animation, {
      toValue: isEnabled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isEnabled]);

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26],
  });

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e5e7eb', '#22c55e'],
  });

  return (
    <TouchableOpacity
      style={styles.toggleContainer}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.toggleTrack, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.toggleThumb,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// Account Option Component
const AccountOption = ({ title, isEnabled, onToggle }) => (
  <View style={styles.accountOption}>
    <View style={styles.avatar} />
    <Text style={styles.accountText}>{title}</Text>
    <CustomToggle isEnabled={isEnabled} onToggle={onToggle} />
  </View>
);

const BranchAccountOptions = () => {
  const [toggleStates, setToggleStates] = useState({
    owner: false,
    security: false,
    attendance: false,
  });

  const handleToggle = (accountType) => {
    setToggleStates(prev => ({
      ...prev,
      [accountType]: !prev[accountType]
    }));
    console.log(`Toggled: ${accountType}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Logo />
        </View>

        {/* Title */}
        <Text style={styles.title}>Choose an account</Text>

        {/* Account Options */}
        <View style={styles.accountsList}>
          <AccountOption 
            title="Owner" 
            isEnabled={toggleStates.owner}
            onToggle={() => handleToggle('owner')} 
          />
          <AccountOption 
            title="Security" 
            isEnabled={toggleStates.security}
            onToggle={() => handleToggle('security')} 
          />
          <AccountOption 
            title="Attendance" 
            isEnabled={toggleStates.attendance}
            onToggle={() => handleToggle('attendance')} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: '#374151',
    marginBottom: 40,
    textAlign: 'center',
  },
  accountsList: {
    width: '100%',
    maxWidth: 400,
  },
  accountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 16,
  },
  accountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
    textAlign: 'center',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
});

export default BranchAccountOptions;