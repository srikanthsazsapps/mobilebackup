import React, { useState, useEffect, useContext, useRef } from "react";
import { View, Image, ScrollView, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faCalendarAlt, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import GlobalStyle from "../../components/common/GlobalStyle";
import { scale, verticalScale } from 'react-native-size-matters';
import { DashesDataContext } from '../../components/common/DashesDataContext';
import Loading from '../../components/common/Loading';

const { width, height: screenHeight } = Dimensions.get('window');

const AssetDashboard = ({ navigation }) => {
    const {
        assetData,
        loadingStates,
        setAssetData,
        getInTransitVehicles,
        getIdleVehicles,
        getWorkshopVehicles,
        getTotalVehicleCount,
        fetchSingleDashboard,
        DASHBOARD_TYPES
    } = useContext(DashesDataContext);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCategories, setShowCategories] = useState(true);
    const [activeTab, setActiveTab] = useState('FC ending');
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Animated values
    const expandAnimation = useRef(new Animated.Value(0)).current;
    const containerAnimation = useRef(new Animated.Value(0)).current;
    const categoryHeightAnimation = useRef(new Animated.Value(0)).current;
    const categorySlideAnimation = useRef(new Animated.Value(0)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    
    // Refs
    const categoryScrollViewRef = useRef(null);
    const fcTabsScrollViewRef = useRef(null);
    const vehicleListScrollViewRef = useRef(null);

    useEffect(() => {
        fetchSingleDashboard(DASHBOARD_TYPES.ASSET)
            .then(() => {
                console.log('AssetDashboard: fetchSingleDashboard completed');
            })
            .catch(error => {
                console.error('AssetDashboard: fetchSingleDashboard error:', error);
            });
    }, []);

    const calculateDaysLeft = (dateString) => {
        if (!dateString) return 'No data';
        const today = new Date('2025-06-10');
        const targetDate = new Date(dateString);
        if (isNaN(targetDate.getTime())) return 'Invalid date';
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 ? diffDays : null;
    };

    const getHighlyUsedVehicle = () => {
        const inTransitData = assetData.filter(item => item.Category === 'In Transit');
        if (inTransitData.length === 0) return { vehicleNumber: 'N/A', trips: 'No data' };
        
        const vehicleTripCounts = inTransitData.reduce((acc, item) => {
            const vehicleNumber = item.VehicleNumber || 'N/A';
            acc[vehicleNumber] = (acc[vehicleNumber] || 0) + 1;
            return acc;
        }, {});
        
        const highestVehicle = Object.entries(vehicleTripCounts).reduce((prev, [vNum, count]) => 
            count > prev.count ? { vehicleNumber: vNum, count } : prev,
            { vehicleNumber: 'N/A', count: 0 }
        );
        
        return {
            vehicleNumber: highestVehicle.vehicleNumber,
            trips: `${highestVehicle.count} times in a week`
        };
    };

    const vehiclePerformanceData = [
        {
            id: 1,
            title: "Highly Used Vehicle",
            vehicleNumber: getHighlyUsedVehicle().vehicleNumber,
            subtitle: getHighlyUsedVehicle().trips,
            image: require('../../images/truckbg.png'),
            color: '#3E89EC'
        },
        {
            id: 2,
            title: "Fuel Consumption",
            vehicleNumber: assetData.filter(item => item.Category === 'Fuel Consumption').length > 0
                ? assetData
                    .filter(item => item.Category === 'Fuel Consumption')
                    .reduce((prev, curr) => (parseFloat(prev.Qty) > parseFloat(curr.Qty) ? prev : curr), { Qty: -Infinity })
                    .VehicleNumber || 'N/A'
                : 'N/A',
            subtitle: assetData.filter(item => item.Category === 'Fuel Consumption').length > 0
                ? `${assetData
                    .filter(item => item.Category === 'Fuel Consumption')
                    .reduce((prev, curr) => (parseFloat(prev.Qty) > parseFloat(curr.Qty) ? prev : curr), { Qty: -Infinity })
                    .Qty} Liters per day`
                : 'No data',
            image: require('../../images/dieselbg.png'),
            color: '#3E89EC'
        },
        {
            id: 3,
            title: "Expiring Documents",
            vehicleNumber: assetData.filter(item => item.Category === 'FC Volume').length > 0
                ? assetData.filter(item => item.Category === 'FC Volume')[0].VehicleNumber || 'N/A'
                : 'N/A',
            subtitle: assetData.filter(item => item.Category === 'FC Volume').length > 0
                ? calculateDaysLeft(assetData.filter(item => item.Category === 'FC Volume')[0].FCDate) !== null
                    ? `${calculateDaysLeft(assetData.filter(item => item.Category === 'FC Volume')[0].FCDate)} Days`
                    : 'Expired'
                : 'No data',
            tabs: ["FC ending", "Permit Date", "Tax Date", "Insurance Date"],
            image: require('../../images/fcbg.png'),
            color: '#C16161',
            expandedData: assetData.filter(item => item.Category === 'FC Volume').map(doc => {
                const daysLeft = {
                    FC: calculateDaysLeft(doc.FCDate),
                    Permit: calculateDaysLeft(doc.PermitDate),
                    Tax: calculateDaysLeft(doc.TaxDate),
                    Insurance: calculateDaysLeft(doc.InsuranceDate),
                };
                return Object.values(daysLeft).some(day => day !== null) ? { vehicleNumber: doc.VehicleNumber || 'N/A', daysLeft } : null;
            }).filter(item => item !== null)
        }
    ];

    const vehicleData = {
        'Total Vehicle': [
            ...getInTransitVehicles(),
            ...getIdleVehicles(),
            ...getWorkshopVehicles()
        ],
        'In Transit': getInTransitVehicles(),
        'Idle Vehicle': getIdleVehicles(),
        'In Workshop': getWorkshopVehicles()
    };

    const CategoryCard = ({ title, count, imageSource, onPress }) => (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.iconRow}>
                <Text style={styles.count}>{count !== undefined ? count : 'N/A'}</Text>
                <Image source={imageSource} style={styles.cardImage} />
            </View>
        </TouchableOpacity>
    );

    const handleCategoryPress = (category, index) => {
        setSelectedCategory(category);
        setShowCategories(false);
        if (categoryScrollViewRef.current) {
            const tabWidth = 120;
            const scrollX = index * tabWidth - (width - tabWidth) / 2;
            categoryScrollViewRef.current.scrollTo({ x: Math.max(scrollX, 0), animated: true });
        }
    };

    const handleBackToCategories = () => {
        setShowCategories(true);
        setSelectedCategory(null);
    };

    const toggleDropdown = () => {
        const toValue = isExpanded ? 0 : 1;
        const expandedHeightValue = isExpanded ? 0 : 500;
        
        Animated.parallel([
            Animated.timing(expandAnimation, {
                toValue,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }),
            Animated.timing(containerAnimation, {
                toValue,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }),
            Animated.timing(categorySlideAnimation, {
                toValue: isExpanded ? 0 : expandedHeightValue,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }),
            Animated.timing(categoryHeightAnimation, {
                toValue: toValue,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            })
        ]).start(() => {
            setIsExpanded(!isExpanded);
        });
    };

    const renderVerticalCard = (item) => {
        const itemCount = item.expandedData ? item.expandedData.length : 0;
        const baseExpandedHeight = 60;
        const dynamicExpandedHeight = itemCount * baseExpandedHeight;

        const expandedHeight = expandAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, dynamicExpandedHeight]
        });

        const fcCardHeight = containerAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [140, 140 + dynamicExpandedHeight]
        });

        // Use the first item from expandedData for fcVehicleInfo if available
        const firstExpandedData = item.expandedData && item.expandedData.length > 0 ? item.expandedData[0] : null;
        const displayVehicleNumber = firstExpandedData ? firstExpandedData.vehicleNumber : item.vehicleNumber;
        const displaySubtitle = firstExpandedData ? 
            `${firstExpandedData.daysLeft[activeTab.replace(' Date', '').replace('FC ending', 'FC')] !== null 
                ? `${firstExpandedData.daysLeft[activeTab.replace(' Date', '').replace('FC ending', 'FC')]} Days` 
                : 'N/A'}` 
            : item.subtitle;

        return (
            <Animated.View
                key={item.id}
                style={[
                    styles.verticalCard,
                    item.id === 3 && { height: fcCardHeight }
                ]}
            >
                <View style={styles.cardHeader}>
                    <Image source={item.image} style={styles.verticalCardImage} />
                    <View style={styles.textContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={[styles.titleText, GlobalStyle.H8]}>{item.title}</Text>
                        </View>
                        {item.id !== 3 && (
                            <View style={styles.bottomRow}>
                                <Text style={[styles.cardvehnum, GlobalStyle.H7]}>{item.vehicleNumber}</Text>
                                <Text style={[styles.cardsubtitle, GlobalStyle.H9]}>{item.subtitle}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {item.id === 3 ? (
                    <View style={styles.fcContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.fcTabsContainer}
                            contentContainerStyle={styles.fcTabsContentContainer}
                            ref={fcTabsScrollViewRef}
                        >
                            {item.tabs.map((tab, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.fcTab, activeTab === tab && styles.activeFcTab]}
                                    onPress={() => {
                                        setActiveTab(tab);
                                        if (fcTabsScrollViewRef.current) {
                                            const tabWidth = 100;
                                            const scrollX = index * tabWidth - (width - tabWidth) / 2;
                                            fcTabsScrollViewRef.current.scrollTo({ x: Math.max(scrollX, 0), animated: true });
                                        }
                                    }}
                                >
                                    <Text style={[GlobalStyle.heading8, styles.fcTabText, activeTab === tab && styles.activeFcTabText, activeTab === tab && GlobalStyle.H8]}>{tab}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.fcVehicleInfo}>
                            <Text style={[styles.fcVehicleNumber, GlobalStyle.H7]}>{displayVehicleNumber}</Text>
                            <Text style={[styles.subtitleText, GlobalStyle.H11, { color: item.color }]}>{displaySubtitle}</Text>
                            <TouchableOpacity style={styles.fcDropdownIcon} onPress={toggleDropdown}>
                                <Animated.View
                                    style={{
                                        transform: [{
                                            rotate: expandAnimation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '180deg']
                                            })
                                        }]
                                    }}
                                >
                                    <FontAwesomeIcon icon={faChevronDown} size={16} color="black" />
                                </Animated.View>
                            </TouchableOpacity>
                        </View>

                        <Animated.View style={[styles.expandedContent, { height: expandedHeight, marginTop: 10 }]}>
                            <ScrollView
                                style={styles.expandedScrollView}
                                contentContainerStyle={styles.expandedScrollContent}
                                nestedScrollEnabled={true}
                                showsVerticalScrollIndicator={true}
                            >
                                {item.expandedData.map((data, index) => (
                                    <View key={index} style={styles.expandedItem}>
                                        <Text style={[styles.expandedVehicleNumber, GlobalStyle.heading8]}>{data.vehicleNumber}</Text>
                                        <Text style={[styles.expandedDaysLeft, GlobalStyle.H9, { color: item.color }]}>
                                            {data.daysLeft[activeTab.replace(' Date', '').replace('FC ending', 'FC')] !== null
                                                ? `${data.daysLeft[activeTab.replace(' Date', '').replace('FC ending', 'FC')]} Days`
                                                : 'N/A'}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </Animated.View>
                    </View>
                ) : (
                    <View style={styles.cardContent}>
                        <Text style={styles.vehicleNumberText}>{item.vehicleNumber}</Text>
                        <Text style={[styles.subtitleText, { color: '#7AB134' }]}>{item.subtitle}</Text>
                    </View>
                )}
            </Animated.View>
        );
    };

    const formatDate = (dateString) => {
    if (!dateString) return 'No data';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    // Format as DD-MM-YYYY (or change format as needed)
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
};

    const VehicleCard = ({ vehicle }) => {
        let statusColor = '#FFC107';
        let statusText = 'Last used';
        if (vehicle.statusLabel.toLowerCase().includes('transit')) {
            statusColor = '#7AB134';
            statusText = 'Last updated trip';
        } else if (vehicle.statusLabel.toLowerCase().includes('idle')) {
            statusColor = '#FFDB44';
            statusText = 'Last used';
        } else if (vehicle.statusLabel.toLowerCase().includes('workshop')) {
            statusColor = '#C16161';
            statusText = 'Last used';
        }

        return (
            <View style={styles.vehicleCard}>
                <View style={styles.vehiclePlateContainer}>
                    <Text style={[styles.vehiclePlate, GlobalStyle.H7]}>{vehicle.plate}</Text>
                    <Text style={[styles.statusText, GlobalStyle.H10]}>{statusText}</Text>
                </View>
                <View style={styles.vehicleDetails}>
                    <Text style={[styles.vehicleStatus, GlobalStyle.H8, { backgroundColor: statusColor }]}>
                        {vehicle.statusLabel}
                    </Text>
                    <View style={styles.lastUsedContainer}>
                        <FontAwesomeIcon icon={faCalendarAlt} size={14} color="#3E89EC" style={styles.calendarIcon} />
                        <Text style={[styles.lastUsedDate, GlobalStyle.H11]}>{formatDate(vehicle.lastUsed)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const CategoryTabButton = ({ category, isActive, index }) => {
        const vehicleCount = vehicleData[category]?.length || 0;
        return (
            <TouchableOpacity
                style={[styles.tabButton, isActive && styles.activeTabButton]}
                onPress={() => handleCategoryPress(category, index)}
            >
                <Text style={[styles.tabButtonText, GlobalStyle.H11, isActive && styles.activeTabButtonText]}>
                    {category}
                </Text>
                <View style={styles.vehicleCountBadge}>
                    <Text style={[styles.vehicleCountText, GlobalStyle.H11]}>{vehicleCount}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    const categoryHeight = scrollY.interpolate({
        inputRange: [0, screenHeight],
        outputRange: [screenHeight * 0.5, screenHeight * 0.5], // Ensure full expansion
        extrapolate: "clamp",
    });

    const categoryOpacity = scrollY.interpolate({
        inputRange: [0, 100, 200],
        outputRange: [1, 100, 100],
        extrapolate: "clamp",
    });

    const categoryScale = scrollY.interpolate({
        inputRange: [0, 200],
        outputRange: [1, 0.99],
        extrapolate: "clamp",
    });

    const categoryTranslateY = scrollY.interpolate({
        inputRange: [0, 100, 200],
        outputRange: [0, -20, -40],
        extrapolate: "clamp",
    });

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
    );

    if (loadingStates.asset) {
        return (
            <View style={styles.loadingContainer}>
                <Loading />
            </View>
        );
    }

    return (
        <View style={styles.Container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <FontAwesomeIcon icon={faArrowLeft} size={22} color="white" />
                    </TouchableOpacity>
                    <Text style={[GlobalStyle.heading1, styles.headerText]}>Asset</Text>
                </View>

                <View style={styles.verticalCardsContainer}>
                    {vehiclePerformanceData.map((item) => renderVerticalCard(item))}
                </View>
            </View>

            <Animated.View
                style={[
                    styles.CategorieContainer,
                    { 
                        height: categoryHeight,
                        opacity: categoryOpacity,
                        transform: [
                            { scale: categoryScale },
                            { translateY: categoryTranslateY }
                        ]
                    }
                ]}
            >
                {showCategories ? (
                    <>
                        <Text style={[GlobalStyle.H3, styles.CategorieText]}>Categories</Text>
                        <View style={styles.container}>
                            <CategoryCard
                                title="Total Vehicle"
                                count={vehicleData['Total Vehicle'].length}
                                imageSource={require('../../images/total.png')}
                                onPress={() => handleCategoryPress('Total Vehicle', 0)}
                            />
                            <CategoryCard
                                title="In Transit"
                                count={vehicleData['In Transit'].length}
                                imageSource={require('../../images/trasnit.png')}
                                onPress={() => handleCategoryPress('In Transit', 1)}
                            />
                            <CategoryCard
                                title="Idle Vehicle"
                                count={vehicleData['Idle Vehicle'].length}
                                imageSource={require('../../images/idle.png')}
                                onPress={() => handleCategoryPress('Idle Vehicle', 2)}
                            />
                            <CategoryCard
                                title="In Workshop"
                                count={vehicleData['In Workshop'].length}
                                imageSource={require('../../images/workshop.png')}
                                onPress={() => handleCategoryPress('In Workshop', 3)}
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.tabContainer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.tabScrollContent}
                                ref={categoryScrollViewRef}
                            >
                                {Object.keys(vehicleData).map((category, index) => (
                                    <CategoryTabButton
                                        key={category}
                                        category={category}
                                        isActive={selectedCategory === category}
                                        index={index}
                                    />
                                ))}
                            </ScrollView>
                        </View>

                        <ScrollView
                            style={styles.vehicleListContainer}
                            ref={vehicleListScrollViewRef}
                            onScroll={handleScroll}
                            scrollEventThrottle={16}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{
                                flexGrow: 1,
                                paddingBottom: 20,
                            }}
                        >
                            {vehicleData[selectedCategory]?.length > 0 ? (
                                vehicleData[selectedCategory].map(item => (
                                    <VehicleCard key={item.id} vehicle={item} />
                                ))
                            ) : (
                                <Text style={styles.subtitleText}>
                                    No vehicles found for {selectedCategory}.
                                </Text>
                            )}
                        </ScrollView>
                    </>
                )}
            </Animated.View>
  {/* {loadingStates.asset && <Loading />} */}
        </View>
    );
};

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: "#3E89EC",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        width: "100%",
        backgroundColor: "#3E89EC",
        paddingTop: 40,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    headerText: {
        bottom: 8,
        marginLeft: 10,
    },
    verticalCardsContainer: {
        paddingHorizontal: 20,
        bottom:10,
    },
    verticalCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        padding: 10,
        marginBottom: 10,
        flexDirection: "column",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    verticalCardImage: {
        width: 45,
        height: 45,
        resizeMode: "contain",
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    titleContainer: {
        backgroundColor: "#3E89EC",
        borderRadius: 11,
        paddingVertical: 4,
        paddingHorizontal: 10,
        alignSelf: "flex-start",
        marginBottom: 4,
    },
    titleText: {
        // color: 'white',
        // fontSize: 14,
        // fontWeight: 'bold',
    },
    bottomRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardvehnum: {
        // fontSize: 16,
        // color: 'black',
        marginLeft: 8,
        top: 5,
    },
    cardsubtitle: {
        // fontSize: 14,
        // color: '#7AB134',
        marginRight: 5,
        top: 8,
    },
    cardContent: {
        flex: 1,
        alignItems: "flex-end",
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    vehicleNumberText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginRight: 10,
    },
    subtitleText: {
        // fontSize: 14,
        // color: '#666',
        left: 10,
    },
    fcContainer: {
        flexDirection: "column",
    },
    fcTabsContainer: {
        marginTop: 2,
    },
    fcTabsContentContainer: {
        flexDirection: "row",
        paddingRight: 20,
    },
    fcTab: {
        paddingVertical: 5,
        paddingHorizontal: 15,
        borderRadius: 15,
        backgroundColor: "#F6F3ED",
        marginRight: 10,
    },
    activeFcTab: {
        backgroundColor: "#3E89EC",
    },
    fcTabText: {},
    activeFcTabText: {
        // color: '#FFFFFF',
        // fontWeight: 'bold',
    },
    fcVehicleInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        top: 10,
    },
    fcVehicleNumber: {
        // fontSize: 16,
        // fontWeight: 'bold',
        // color: '#333',
        left: 5,
    },
    fcDropdownIcon: {
        padding: 5,
        backgroundColor: "#F6F3ED",
        borderRadius: 10,
        top: 0,
        marginRight: 10,
    },
    expandedContent: {
        overflow: "hidden",
    },
    expandedScrollView: {
        maxHeight: 500,
    },
    expandedScrollContent: {
        paddingBottom: 200,
    },
    expandedItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        top: 8,
        borderRadius: 8,
    },
    expandedVehicleNumber: {
        // fontSize: 13,
        // color: '#333',
        // fontWeight: 'bold',
        backgroundColor: "#F6F3ED",
        borderRadius: 16,
        paddingHorizontal: 6,
        paddingVertical: 6,
        minWidth: 190,
        maxWidth: 120,
        textAlign: "center",
        marginRight: 10,
    },
    expandedDaysLeft: {
        // fontSize: 11,
        // fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: "rgba(255, 68, 68, 0.1)",
        marginRight: 100,
    },
    CategorieContainer: {
        // flex: 1,
         backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
    // position: "absolute",
    top: 28,
    left: 0,
    right: 0,

    },
    CategorieText: {
        padding: 25,
        bottom: 20,
    },
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        padding: 16,
        bottom: 35,
        minHeight: 250,
    },
    card: {
        backgroundColor: "#f9f6ef",
        borderRadius: 16,
        width: "47%",
        padding: 16,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        marginBottom: 12,
        fontSize: 14,
        color: "black",
    },
    iconRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    count: {
        color: "#3E89EC",
        marginRight: 10,
    },
    cardImage: {
        width: 50,
        height: 50,
        resizeMode: "contain",
        marginLeft: 35,
    },
    tabContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    tabScrollContent: {
        paddingRight: 20,
    },
    tabButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        backgroundColor: "#F0F0F0",
        marginRight: 10,
    },
    activeTabButton: {
        backgroundColor: "#3E89EC",
    },
    tabButtonText: {
        // fontSize: 14,
        // color: '#333',
        marginRight: 5,
    },
    activeTabButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    vehicleCountBadge: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    vehicleCountText: {
        // fontSize: 12,
        // color: '#333',
    },
    vehicleListContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    vehicleCard: {
        backgroundColor: "#F8F8F8",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    vehiclePlateContainer: {
        flexDirection: "column",
    },
    vehiclePlate: {
        // fontSize: 16,
        // fontWeight: 'bold',
        // color: '#333',
    },
    statusText: {
        // fontSize: 12,
        // color: '#666',
        marginTop: 4,
    },
    vehicleDetails: {
        flexDirection: "column",
        alignItems: "flex-end",
    },
    vehicleStatus: {
        // color: '#fff',
        // fontSize: 12,
        // fontWeight: 'bold',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 15,
        marginBottom: 5,
    },
    lastUsedContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    calendarIcon: {
        marginRight: 5,
    },
    lastUsedDate: {
        // fontSize: 12,
        // color: '#333',
    },
    listItemContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 8,
        justifyContent: "space-between",
        padding: 50,
        marginTop: -55,
    },
});

export default AssetDashboard;