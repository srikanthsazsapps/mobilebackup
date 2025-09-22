import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert,Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowAltCircleRight, faArrowCircleRight, faArrowDown, faArrowDown19, faArrowDownAZ, faArrowDownUpLock, faArrowLeft, faArrowsUpDown, faCar, faDriversLicense, faHollyBerry, faPerson, faSearch, faTractor, faTruck } from "@fortawesome/free-solid-svg-icons";
const { width } = Dimensions.get('window');

const DashboardMainChart = () => {
    const cashSales = 1320140000; // ₹1,32,01,400.00
    const creditSales = 1291650000; // ₹1,29,16,500.00
    const totalSales = cashSales + creditSales;

    // Fixed maximum height for bars (in pixels)
    const maxBarHeight = 102;
    
    // Calculate heights proportionally but cap at maxBarHeight
    const maxValue = Math.max(cashSales, creditSales);
    const cashBarHeight = Math.min((cashSales / maxValue) * maxBarHeight, maxBarHeight);
    const creditBarHeight = Math.min((creditSales / maxValue) * maxBarHeight, maxBarHeight);

    const statsData = [
        {
            title: "Total Loads",
            value: "1000",
            icon: faTruck,
            color: "#3E89EC"
        },
        {
            title: "Vehicle Rent",
            value: "₹ 1230",
            icon: faTruck,
            color: "#3E89EC"
        },
        {
            title: "Driver Beta",
            value: "₹ 500",
            icon: faDriversLicense,
            color: "#3E89EC"
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.Card}>
                <View style={styles.rowContainer}>
                    <Text style={styles.totalText}>Total Sales</Text>
                    <Text style={styles.valueText}>₹ {(totalSales / 10000000).toFixed(2)},17,900.00</Text>
                </View>
                
                <View style={styles.barContainer}>
                    <Image
    source={require('../../images/logoSazs.png')} // put your image path here
    style={styles.barBackgroundImage}
    resizeMode="contain"
  />
                    <View style={styles.chartContainer}>
                        {/* Cash Sales Bar */}
                        <View style={styles.barWrapper}>
                            <View style={styles.valueLabel}>
                                <Text style={styles.valueLabelText}>₹ 1,32,01,400.00</Text>
                            </View>
                            <LinearGradient
                                colors={['#3E89EC', '#3E89EC', '#3E89EC']}
                                style={[styles.bar, { height: cashBarHeight }]}
                            >
                                <View style={styles.stripesOverlay}>
                                    {Array.from({ length: Math.ceil((cashBarHeight + 60) / 8) }, (_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.stripe,
                                                { top: i * 8 - 20 }
                                            ]}
                                        />
                                    ))}
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Credit Sales Bar */}
                        <View style={styles.barWrapper}>
                            <LinearGradient
                                colors={['#D6B0FF', '#D6B0FF']}
                                style={[styles.valueLabel, { minWidth: 100 }]}
                            >
                                <Text style={styles.valueLabelText}>₹ 1,29,16,500.00</Text>
                            </LinearGradient>
                            <LinearGradient
                                colors={['#D6B0FF', '#D6B0FF', '#D6B0FF']}
                                style={[styles.bar, { height: creditBarHeight }]}
                            >
                                <View style={styles.stripesOverlay}>
                                    {Array.from({ length: Math.ceil((creditBarHeight + 60) / 8) }, (_, i) => (
                                        <View
                                            key={i}
                                            style={[
                                                styles.stripe,
                                                { top: i * 8 - 20 }
                                            ]}
                                        />
                                    ))}
                                </View>
                            </LinearGradient>
                        </View>
                    </View>
                </View>
                
                <View style={styles.labelsOutside}>
                    <View style={styles.labelContainer}>
                        <View style={[styles.legendDot, styles.cashLegendDot]} />
                        <Text style={styles.labelText}>Cash Sales</Text>
                    </View>
                    <View style={styles.labelContainer}>
                        <View style={[styles.legendDot, styles.creditLegendDot]} />
                        <Text style={styles.labelText}>Credit Sales</Text>
                    </View>
                </View>
            </View>

            <View style={styles.miniCard}>
                <View style={styles.miniCard}>
                    {statsData.map((item, index) => (
                        <View key={index} style={styles.StatsCard}>
                            <Text style={styles.loadsText}>{item.title}</Text>
                            <Text style={styles.amtText}>{item.value}</Text>
                            <FontAwesomeIcon style={styles.iconText} icon={item.icon} size={23} color={item.color} />
                        </View>
                    ))}
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        top: 30
    },
    Card: {
        width: '100%',
        height: 245,
        backgroundColor: "#F5F5F5",
        borderRadius: 20,
        top: 70,
        borderColor:'#E3E3E3',
        borderWidth:1,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 35,
        paddingVertical: 20,
        bottom: 5
    },
    totalText: {
        color: '#000',
        fontSize: 14,
        fontFamily: 'PlusJakartaSans-SemiBold',
    },
    valueText: {
        color: '#4DB20E',
        fontSize: 16,
        fontFamily: 'PlusJakartaSans-SemiBold',
    },
    barContainer: {
        width: '95%',
        height: 170,
        backgroundColor: '#FFFFFF',
        borderRadius: 20.85,
        marginHorizontal: 8,
        padding: 20,
        justifyContent: 'center',
        bottom: 15
    },
    barBackgroundImage: {
  position: 'absolute',
  bottom: 0,
  top:-9,
  right: 5,
  width: 188,   
  height: 190,
  opacity: 0.6, 
},

    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: '100%',
        paddingBottom: 10,
    },
    barWrapper: {
        alignItems: 'center',
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
    },
    valueLabel: {
        backgroundColor: '#4A90E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 5,
        marginBottom: 10,
        minWidth: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        top:30,
        elevation: 5,
    },
    valueLabelText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'PlusJakartaSans-Medium',
        textAlign: 'center',
    },
    bar: {
        width: 52.11,
        marginBottom: 10,
        overflow: 'hidden',
        position: 'relative',
        top: 40,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    cashBarGradient: {
        backgroundColor: '#4A90E2',
        shadowColor: '#6BB6FF',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#6BB6FF',
    },
    creditBarGradient: {
        backgroundColor: '#B8A9FF',
        shadowColor: '#D4C4FF',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#D4C4FF',
    },
    stripesOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
    },
    legendDot: {
        width: 15,
        height: 5,
        borderRadius: 4,
        marginRight: 5,
    },
    cashLegendDot: {
        backgroundColor: '#3E89EC',
    },
    creditLegendDot: {
        backgroundColor: '#D6B0FF',
    },
    stripe: {
        position: 'absolute',
        left: -30,
        right: -30,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        transform: [{ rotate: '-45deg' }],
    },
    labelText: {
        color: '#000',
        fontSize: 12,
        fontFamily: 'PlusJakartaSans-Medium',
    },
    labelsOutside: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginTop: 10,
        bottom: 35
    },
    miniCard:{
        flexDirection: 'row',   
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 55,
        top: 25
    },
    StatsCard:{
        height: 90,
        width:100,
        backgroundColor:'#FFF',
        borderRadius:10,
        borderColor:'#CCC',
        borderWidth:1,
        padding:10,
        marginHorizontal:2,
        justifyContent:'center'
    },
    loadsText:{
        color:'#000',
        fontSize:11,
        fontFamily: 'PlusJakartaSans-SemiBold',
    },
    amtText:{
        color:'#000',
        fontSize:16,
        top:6,
        fontFamily: 'PlusJakartaSans-SemiBold',
    },
    iconText:{
       left:60,
       top:10
    }
});

export default DashboardMainChart;