import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { globalStyles } from '../../Styles/globalStyles';
const SampleDesign = () => {
    return(
        <View style={globalStyles.headerContainer}>
            <Text style={globalStyles.AppHeader}>Attendance</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        color:'black',
    }

});    
export default SampleDesign;