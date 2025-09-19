import React from 'react';
import { View, Text, Dimensions, ImageBackground } from 'react-native';

const { width, height } = Dimensions.get('window');

const AppHeader = ({ line1, line2 }) => {

  return (
    <ImageBackground
      style={{ height: 241, paddingTop: 35, backgroundColor: '#3E89EC' }}
      resizeMode="contain"
      imageStyle={{
        width: 232,
        marginTop: 33,
        height: 208,
        alignSelf: 'flex-end',
        marginLeft: width - 232,
      }}
      source={require('../images/sazswater.png')}
    >
      <View
        style={{
          height: 241,
          flex: 1,
          justifyContent: 'flex-end',
          padding: 30,
          paddingVertical: 40,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 32,
              color: 'white',
              fontFamily: 'Cabin-Bold',
            }}
          >
            {line1}
          </Text>
          <Text
            style={{
              fontSize: 32,
              color: 'white',
              fontFamily: 'Cabin-Bold',
            }}
          >
            {line2}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

export default AppHeader;
