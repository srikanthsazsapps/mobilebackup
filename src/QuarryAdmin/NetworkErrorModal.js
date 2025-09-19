import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import GlobalStyle from '../components/common/GlobalStyle';
import NetInfo from '@react-native-community/netinfo';
import LottieView from 'lottie-react-native';

const NetworkErrorModal = ({ onRefresh, visible = true }) => {
  const [modalVisible, setModalVisible] = useState(visible);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const currentlyConnected = state.isConnected && state.isInternetReachable;
      setIsConnected(currentlyConnected);

      if (currentlyConnected && modalVisible) {
        handleRefresh();
      }
    });

    return () => unsubscribe();
  }, [modalVisible]);

  useEffect(() => {
    setModalVisible(visible);
  }, [visible]);

  const handleRefresh = () => {
    setModalVisible(false);
    if (onRefresh && typeof onRefresh === 'function') {
      onRefresh();
    }
  };

  return (
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LottieView
            source={require('../images/NetOff.json')}
            autoPlay
            loop
            style={styles.noResultsImage}
          />

          <Text style={[GlobalStyle.heading7, styles.errorText]}>
            Make sure your network is enabled
          </Text>

          <TouchableOpacity onPress={handleRefresh} style={styles.closeButton}>
            <Text style={[GlobalStyle.heading6, styles.closeButtonText]}>
              Refresh
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    alignItems: 'center',
    width: '100%',
    height: '50%',
    paddingBottom: 30,
  },
  noResultsImage: {
    width: 150,
    height: 150,
    marginTop: 15,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 15,
  },
  closeButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 25,
  },
  closeButtonText: {
    color: 'white',
  },
});

export default NetworkErrorModal;
