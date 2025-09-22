import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Animated } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faTimes, faGasPump, faBolt, faBox, faClipboardList, faTruck, faCarSide } from '@fortawesome/free-solid-svg-icons';

const FloatingActionButton = ({ navigation, currentScreen = 'ProductionDashBoard' }) => {
    const [isFabExpanded, setIsFabExpanded] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));
    const [fabRotation] = useState(new Animated.Value(0));

     const fabMenuItems = [
        { 
            id: 1, 
            title: 'EB Reading', 
            icon: '📊', 
            screen: 'VehicleTripScreen',
            dataType: 'ebReading'
        },
        { 
            id: 2, 
            title: 'Vehicle Trip', 
            icon: '🚛', 
            screen: 'VehicleTripScreen',
            dataType: 'vehicleTrip'
        },
        { 
            id: 3, 
            title: 'Diesel Availability', 
            icon: '⛽', 
            screen: 'VehicleTripScreen',
            dataType: 'diesel'
        },
        { 
            id: 4, 
            title: 'Sales Order', 
            icon: '📋', 
            screen: 'VehicleTripScreen',
            dataType: 'salesOrder'
        },
        { 
            id: 5, 
            title: 'Transport Trip', 
            icon: '🚚', 
            screen: 'VehicleTripScreen',
            dataType: 'transportTrip'
        },
        { 
            id: 6, 
            title: 'Raw Material', 
            icon: '📦', 
            screen: 'VehicleTripScreen',
            dataType: 'rawMaterial'
        },
    ];

    const toggleFab = () => {
        const isExpanding = !isFabExpanded;
        
        if (isExpanding) {
            setIsFabExpanded(true);
        }
        
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: isExpanding ? 1 : 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: isExpanding ? 0 : 50,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(fabRotation, {
                toValue: isExpanding ? 1 : 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (!isExpanding) {
                setIsFabExpanded(false);
            }
        });
    };

    const handleMenuItemPress = (item) => {
        console.log('FAB: Selected item:', item.title);
        
        if (item.screen && navigation) {
            navigation.navigate(item.screen, {
                dataType: item.dataType,
                title: item.title
            });
        }
        
        toggleFab();
    };

    const fabIconRotation = fabRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg'],
    });

    return (
        <>
            {/* Overlay */}
            {isFabExpanded && (
                <Animated.View
                    style={[
                        styles.overlay,
                        { opacity: fadeAnim }
                    ]}
                >
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        onPress={toggleFab}
                        activeOpacity={1}
                    />
                </Animated.View>
            )}

            {/* FAB Menu Items */}
            {isFabExpanded && (
                <Animated.View 
                    style={[
                        styles.fabMenuContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }
                    ]}
                >
                    {fabMenuItems.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            style={{
                                transform: [{
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 50],
                                        outputRange: [0, (index + 1) * 10]
                                    })
                                }],
                                opacity: fadeAnim
                            }}
                        >
                            <TouchableOpacity
                                style={styles.fabMenuItem}
                                onPress={() => handleMenuItemPress(item)}
                                activeOpacity={0.8}
                            >
                                <View style={styles.fabMenuItemContent}>
                                    <View style={[styles.alphabetCircle]}>
                                        {item.icon && <Text style={styles.usageIcon}>{item.icon}</Text>}
                                    </View>
                                    <Text style={styles.fabMenuText}>{item.title}</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </Animated.View>
            )}

            {/* Main FAB Button */}
            <TouchableOpacity 
                style={[styles.fab, isFabExpanded && styles.fabExpanded]} 
                onPress={toggleFab}
                activeOpacity={0.8}
            >
                <Animated.View
                    style={{
                        transform: [{ rotate: fabIconRotation }],
                    }}
                >
                    <FontAwesomeIcon 
                        icon={isFabExpanded ? faTimes : faPlus} 
                        size={24} 
                        color="white" 
                    />
                </Animated.View>
            </TouchableOpacity>
        </>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
        zIndex: 1001,
    },
    fabExpanded: {
        backgroundColor: '#3E89EC',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 999,
    },
    fabMenuContainer: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        zIndex: 1000,
    },
    fabMenuItem: {
        marginBottom: 12,
        borderRadius: 25,
        borderColor: '#E5E7EB',
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    fabMenuItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        minWidth: 180,
    },
    alphabetCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    alphabetText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    fabMenuText: {
        color: '#6292daff',
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
});

export default FloatingActionButton;