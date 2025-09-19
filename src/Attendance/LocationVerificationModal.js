import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LocationVerifier from './LocationVerifier';

const LocationVerificationModal = ({
  visible,
  onClose,
  onLocationVerified,
  actionType 
}) => {
  const getActionText = () => {
    switch (actionType) {
      case 'checkIn': return 'Check In';
      case 'checkOut': return 'Check Out';
      case 'breakIn': return 'Break In';
      case 'breakOut': return 'Break Out';
      default: return 'Verify Location';
    }
  };
  
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
     <TouchableOpacity 
        style={styles.centeredView} 
        activeOpacity={1} 
        onPress={onClose}
      >
       <TouchableOpacity 
          style={styles.modalView} 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.header}>
            {/* <Text style={styles.headerText}>{getActionText()}</Text> */}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            </TouchableOpacity>
          </View>
          
          <LocationVerifier
            onVerificationComplete={onLocationVerified}
            onCancel={onClose}
          />
        </TouchableOpacity>
        </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalView: {
    width: '75%',
    height: '15%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
 
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default LocationVerificationModal;