import {View, Text} from 'react-native';
import {TextInput} from 'react-native-paper';

const InputBox = ({
  style,
  required = true,
  value = '',
  label = '',
  order = '',
  right = <TextInput.Affix text="" />,
  maxLength = 100,
  multiline = false,
  lines = 1,
  keyboardType,
  minLength = '',
  secureTextEntry = false,
  onChangeText = () => {},
  showErrorText = false,
  errorText = `Please enter the ${label}`,
}) => {
  return (
    <View key={order ?? value}>
      <TextInput
        numberOfLines={lines}
        keyboardType={keyboardType}
        mode="outlined"
        label={label + ` ${required ? '*' : ''}`}
        style={style}
        right={right}
        text="Boolean"
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
        value={value}
        minLength={minLength}
        multiline={multiline}
        onChangeText={onChangeText}
        outlineColor="#3E89EC"
        outlineStyle={{borderWidth: 2, fontFamily: 'Cabin-Bold'}}
        activeOutlineColor="green"
      />
      {showErrorText ? (
        <Text style={{color: 'rgb(33,109,206)', fontWeight: 'bold'}}>
          {errorText}
        </Text>
      ) : null}
    </View>
  );
};

export default InputBox;
