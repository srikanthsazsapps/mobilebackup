import React, {useState} from 'react';
import {Alert, Dimensions, StyleSheet, Text, View} from 'react-native';
import {Modal, Button} from 'react-native-paper';
import {CodeField, Cursor} from 'react-native-confirmation-code-field';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const PinChangeModal = ({visible, onClose, currentPin, onPinChange}) => {
  const [step, setStep] = useState(1);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');

  const handlePinChange = () => {
    if (step === 1) {
      if (Number(currentPinInput) === Number(currentPin)) {
        setStep(2); // Proceed to set new pin
      } else {
        Alert.alert('Incorrect current pin');
        setCurrentPinInput('');
      }
    } else if (step === 2) {
      if (Number(newPin) === Number(confirmNewPin)) {
        onPinChange(newPin); // Call the callback with the new PIN
        Alert.alert('Pin changed successfully');
        handleClose();
      } else {
        Alert.alert('Pins do not match');
        setNewPin('');
        setConfirmNewPin('');
      }
    }
  };

  const handleClose = () => {
    onClose();
    setStep(1); // Reset to step 1
    setCurrentPinInput('');
    setNewPin('');
    setConfirmNewPin('');
  };

  return (
    <Modal
      visible={visible}
      onDismiss={handleClose}
      dismissableBackButton={true}
      //   contentContainerStyle={styles.containerStyle}
    >
      <LinearGradient
        colors={['#ffffff', '#e0e0e0']}
        style={styles.containerStyle}>
        <Text style={styles.modalTitle}>
          {step === 1 ? 'Enter Current Pin' : 'Set New Pin'}
        </Text>
        <View>
          <CodeField
            value={step === 1 ? currentPinInput : newPin}
            onChangeText={step === 1 ? setCurrentPinInput : setNewPin}
            cellCount={4}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            renderCell={({index, symbol, isFocused}) => (
              <Text
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}>
                {symbol ? '●' : isFocused ? <Cursor /> : null}
              </Text>
            )}
          />
        </View>
        {step === 2 && (
          <>
            <Text style={styles.modalTitle}>Confirm New Pin</Text>
            <View>
              <CodeField
                value={confirmNewPin}
                onChangeText={setConfirmNewPin}
                cellCount={4}
                rootStyle={styles.codeFieldRoot}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                renderCell={({index, symbol, isFocused}) => (
                  <Text
                    key={index}
                    style={[styles.cell, isFocused && styles.focusCell]}>
                    {symbol ? '●' : isFocused ? <Cursor /> : null}
                  </Text>
                )}
              />
            </View>
          </>
        )}

        <Button
          labelStyle={styles.buttonLabel}
          style={styles.loginButton}
          onPress={handlePinChange}
          mode="contained">
          {step === 1 ? 'Verify Pin' : 'Change Pin'}
        </Button>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Cabin-Bold',
    textAlign: 'left',
    color: 'black',
    marginVertical: 15,
  },
  codeFieldRoot: {
    marginTop: 20,
  },
  cell: {
    width: 50,
    height: 40,
    lineHeight: 37,
    fontSize: 24,
    marginRight: 0,
    borderWidth: 1,
    borderRadius: 10,
    borderBottomColor: 'black',
    textAlign: 'center',
    color: 'black',
  },
  focusCell: {
    borderColor: 'blue',
  },
  buttonLabel: {
    color: 'white',
    fontSize: 16,
  },
  loginButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
});

export default PinChangeModal;
