import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLocationDot, faXmark } from '@fortawesome/free-solid-svg-icons';

const { height } = Dimensions.get('window');

const LocationErrorModal = ({ visible, message, onClose }) => {
  const slideAnim = new Animated.Value(height);

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 9,
      }).start();
    } else {
      // Slide down animation
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <FontAwesomeIcon 
                icon={faLocationDot} 
                size={24} 
                color="#C16161" 
              />
              <Text style={styles.headerText}>Location Error</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesomeIcon 
                icon={faXmark} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.messageText}>{message}</Text>
          </View>

          {/* Bottom Button */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'Cabin-Bold',
    color: '#C16161',
  },
  closeButton: {
    padding: 5,
  },
  content: {
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontFamily: 'Cabin-Regular',
  },
  button: {
    backgroundColor: '#3E89EC',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Cabin-Bold',
  },
});

export default LocationErrorModal;