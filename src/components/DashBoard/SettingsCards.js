import React from 'react';
import {StyleSheet, TouchableOpacity, View, Text} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const SwitchContainer = ({
  title,
  icon,
  actionicon,
  onPress,
  actionText,
  children,
  Subtitle,
  gradientColors = ['#ffffff', '#ffffff'], //'#3E89EC', '#5FA9FF', // Default gradient colors
}) => {
  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={{flex: 1, flexDirection: 'column'}}>
          {title && (
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                // justifyContent: 'flex-start',
              }}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.actionIconContainer}>{actionicon}</View>

            </View>
          )}
          {Subtitle && <Text style={styles.Subtitle}>{Subtitle}</Text>}
        </View>
      </TouchableOpacity>
      {actionText && (
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Text style={styles.actionText}>{actionText}</Text>
        </TouchableOpacity>
      )}
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 10,
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    marginHorizontal: 15,
  },
  title: {
    fontSize: 17,
    color: 'black',
    fontFamily: 'Cabin-Bold',
  },
  Subtitle: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'Cabin-Bold',
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  actionText: {
    color: '#3E89EC',
    fontFamily: 'Cabin-Bold',
  },
  actionIconContainer: {
    marginLeft: 10, // Adjust spacing
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SwitchContainer;
