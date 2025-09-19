import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import Video from 'react-native-video';
import {useNavigation} from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();
  const [isVideoFinished, setIsVideoFinished] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isVideoFinished) {
      navigation.navigate('Signin');
    }
  }, [isVideoFinished]);

  const onError = error => {
    console.error('Video Error:', error);
    setError(error);
    // Navigate to signin after a brief delay if video fails
    setTimeout(() => navigation.navigate('Signin'), 1000);
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('./images/Splashscreen.mp4')}
        style={styles.video}
        resizeMode="contain"
        onEnd={() => setIsVideoFinished(true)}
        onError={onError}
        muted={true}
        repeat={false}
      />
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Loading...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#3E89EC',
    bottom: 0,
    right: 0,
  },
  errorContainer: {
    position: 'absolute',
    padding: 20,
    backgroundColor: '#3E89EC',
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default SplashScreen;
