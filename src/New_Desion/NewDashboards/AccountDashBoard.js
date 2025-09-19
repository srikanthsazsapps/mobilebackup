import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, Image } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faArrowUp, faArrowDown, faSort, faSortAlphaDown, faSortNumericDown, faSortNumericUp } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { DashesDataContext } from "../../components/common/DashesDataContext";
import SlideMenuBar from "./SlideMenuBar";
import NetworkStatusIndicator from "../NetworkStatusIndicator";
import GlobalStyle from "../../components/common/GlobalStyle";
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Function to convert string to camelCase
const toCamelCase = (str) => {
    return str
        .toLowerCase()
        .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
            if (+match === 0) return '';
            return index === 0 ? match.toUpperCase() : match.toUpperCase();
        });
};

// Function to format number to Indian format
const formatIndianNumber = (num) => {
    if (isNaN(num)) return '0';
    const numStr = Math.abs(num).toFixed(0);
    let lastThree = numStr.slice(-3);
    const otherNumbers = numStr.slice(0, -3);
    if (otherNumbers !== '') {
        lastThree = ',' + lastThree;
    }
    const formattedNumber = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return `${num < 0 ? '-' : ''}${formattedNumber}`;
};

// Separate Scrollable Data Component
const ScrollableDataComponent = ({
    activeTab,
    receivablesData,
    payablesData,
    handleTabChange,
    onScrollToTop,
    isExpanded,
    containerGestureRef
}) => {
    const [scrollViewRef, setScrollViewRef] = useState(null);
    const [nameSortOrder, setNameSortOrder] = useState(null);
    const [amountSortOrder, setAmountSortOrder] = useState(null);

    const getCurrentList = () => {
        let data = activeTab === 'receivables' ? receivablesData : payablesData;

        // Apply sorting based on current sort orders
        if (nameSortOrder) {
            data = [...data].sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                if (nameSortOrder === 'asc') {
                    return nameA.localeCompare(nameB);
                } else {
                    return nameB.localeCompare(nameA);
                }
            });
        }

        if (amountSortOrder) {
            data = [...data].sort((a, b) => {
                if (amountSortOrder === 'desc') {
                    return b.amount - a.amount; // High to low
                } else {
                    return a.amount - b.amount; // Low to high
                }
            });
        }

        return data;
    };

    const handleNameSort = () => {
        // Reset amount sort when sorting by name
        setAmountSortOrder(null);

        if (nameSortOrder === null) {
            setNameSortOrder('asc');
        } else if (nameSortOrder === 'asc') {
            setNameSortOrder('desc');
        } else {
            setNameSortOrder(null); // Reset
        }
    };

    const handleAmountSort = () => {
        // Reset name sort when sorting by amount
        setNameSortOrder(null);

        if (amountSortOrder === null) {
            setAmountSortOrder('desc'); // High to low
        } else if (amountSortOrder === 'desc') {
            setAmountSortOrder('asc'); // Low to high
        } else {
            setAmountSortOrder(null); // Reset
        }
    };

    const getNameSortIcon = () => {
        if (nameSortOrder === 'asc') return faSortAlphaDown;
        if (nameSortOrder === 'desc') return faSortAlphaDown;
        return faSort;
    };

    const getAmountSortIcon = () => {
        if (amountSortOrder === 'desc') return faSortNumericDown;
        if (amountSortOrder === 'asc') return faSortNumericUp;
        return faSort;
    };

    const handleScroll = (event) => {
        const { contentOffset } = event.nativeEvent;
        // Call parent's scroll to top handler when scrolled to very top
        if (contentOffset.y <= 5 && isExpanded.value) {
            onScrollToTop();
        }
    };

    const scrollToTop = () => {
        if (scrollViewRef && scrollViewRef.scrollTo) {
            scrollViewRef.scrollTo({ y: 0, animated: true });
        }
    };

    const onTabChange = (tab) => {
        handleTabChange(tab);
        // Reset sort orders when changing tabs
        setNameSortOrder(null);
        setAmountSortOrder(null);
        setTimeout(scrollToTop, 100); // Small delay to ensure tab change is complete
    };

    return (
        <View style={styles.scrollableDataContainer}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'receivables' && styles.activeTab]}
                    onPress={() => onTabChange('receivables')}
                >
                    <Text style={[GlobalStyle.H12, styles.tabText, activeTab === 'receivables' && styles.activeTabText]}>
                        Receivables ({receivablesData.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'payables' && styles.activeTab]}
                    onPress={() => onTabChange('payables')}
                >
                    <Text style={[GlobalStyle.H12, styles.tabText, activeTab === 'payables' && styles.activeTabText]}>
                        Payables ({payablesData.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.listHeader}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleNameSort}
                    activeOpacity={0.7}
                >
                    <Text style={[GlobalStyle.heading7, styles.headerLabel, { marginRight: 8 }]}>Name</Text>
                    <FontAwesomeIcon
                        icon={getNameSortIcon()}
                        size={14}
                        color={nameSortOrder ? '#3E89EC' : '#999'}
                        style={{
                            transform: [{
                                rotate: nameSortOrder === 'desc' ? '180deg' : '0deg'
                            }]
                        }}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={handleAmountSort}
                    activeOpacity={0.7}
                >
                    <Text style={[GlobalStyle.heading7, styles.headerLabel, { marginRight: 8 }]}>Amount</Text>
                    <FontAwesomeIcon
                        icon={getAmountSortIcon()}
                        size={14}
                        color={amountSortOrder ? '#3E89EC' : '#999'}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={(ref) => setScrollViewRef(ref)}
                style={styles.listScrollView}
                contentContainerStyle={styles.listContentContainer}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
                bounces={true}
                scrollEnabled={true}
                keyboardShouldPersistTaps="handled"
                onScroll={handleScroll}
                scrollEventThrottle={16}
                decelerationRate="normal"
                overScrollMode="auto"
                scrollIndicatorInsets={{ right: 1 }}
                simultaneousHandlers={containerGestureRef}
                waitFor={containerGestureRef}
            >
                {getCurrentList().length > 0 ? (
                    getCurrentList().map((item, index) => (
                        <View
                            key={item.id}
                            style={[styles.itemRow, { bottom: 10 }]}
                        >
                            <View style={[styles.receivableItem]}>
                                <Text style={[GlobalStyle.heading7, styles.itemName]}>{item.name}</Text>
                                <Text style={[GlobalStyle.heading7, styles.itemAmount, item.amount < 0 && styles.negativeAmount]}>
                                    ₹{item.Balance}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.noDataContainer}>
                        <Image
                            source={require('../../images/NoResult.png')}
                            style={styles.noDataImage}
                            resizeMode="contain"
                        />
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={styles.noDataText}>No Data Available</Text>
                        </View>

                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const AccountDashBoard = () => {
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('receivables');
    const navigation = useNavigation();

    // Draggable animation values - improved positioning
    const translateY = useSharedValue(0);
    const isExpanded = useSharedValue(false);

    // Create ref for the container gesture handler
    const containerGestureRef = React.useRef();

    // Define positions more clearly
    const COLLAPSED_HEIGHT = height * 0.6; // 50% of screen
    const EXPANDED_HEIGHT = height * 0.95; // 95% of screen for full view
    const COLLAPSED_TRANSLATE = 0;
    const EXPANDED_TRANSLATE = -height * 0.38; // Move up to show more content

    const animatedStyle = useAnimatedStyle(() => {
        const progress = Math.abs(translateY.value) / Math.abs(EXPANDED_TRANSLATE);
        const currentHeight = COLLAPSED_HEIGHT + (EXPANDED_HEIGHT - COLLAPSED_HEIGHT) * progress;

        return {
            transform: [{ translateY: translateY.value }],
            height: currentHeight,
        };
    });

    // Container-wide drag gesture handler with improved logic
    const containerGestureHandler = useAnimatedGestureHandler({
        onStart: (_, ctx) => {
            ctx.startY = translateY.value;
            ctx.startTime = Date.now();
        },
        onActive: (event, ctx) => {
            // Only handle gesture if it's a clear vertical movement
            const isVerticalGesture = Math.abs(event.translationY) > Math.abs(event.translationX) * 1.5;
            const isSignificantMovement = Math.abs(event.translationY) > 10;

            // Only proceed with drag if it's clearly a vertical gesture with significant movement
            if (isVerticalGesture && isSignificantMovement) {
                const newTranslateY = ctx.startY + event.translationY;
                if (newTranslateY <= COLLAPSED_TRANSLATE && newTranslateY >= EXPANDED_TRANSLATE) {
                    translateY.value = newTranslateY;
                }
            }
        },
        onEnd: (event, ctx) => {
            const gestureTime = Date.now() - ctx.startTime;
            const isVerticalGesture = Math.abs(event.translationY) > Math.abs(event.translationX) * 1.5;
            const isSignificantMovement = Math.abs(event.translationY) > 20;
            const isFastGesture = Math.abs(event.velocityY) > 800;

            // Only process as drag gesture if conditions are met
            if ((isVerticalGesture && isSignificantMovement) || isFastGesture) {
                const velocityThreshold = -800;
                const positionThreshold = EXPANDED_TRANSLATE / 2;

                const shouldExpand = event.velocityY < velocityThreshold || translateY.value < positionThreshold;

                if (shouldExpand) {
                    translateY.value = withSpring(EXPANDED_TRANSLATE, {
                        damping: 20,
                        stiffness: 150,
                        mass: 1
                    });
                    isExpanded.value = true;
                } else {
                    translateY.value = withSpring(COLLAPSED_TRANSLATE, {
                        damping: 20,
                        stiffness: 150,
                        mass: 1
                    });
                    isExpanded.value = false;
                }
            }
        }
    });

    const collapseContainer = () => {
        translateY.value = withSpring(COLLAPSED_TRANSLATE, {
            damping: 20,
            stiffness: 150,
            mass: 1
        });
        isExpanded.value = false;
    };

    // Handle scroll to top callback from scrollable component
    const handleScrollToTop = () => {
        collapseContainer();
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // Get data from context
    const {
        accountsData,
        loadingStates,
        fetchSingleDashboard,
        selectedCompany,
        setTodayRange,
    } = useContext(DashesDataContext);

    useEffect(() => {
        const fetchDailyData = async () => {
            try {
                await setTodayRange('accounts');
                await fetchSingleDashboard('accounts');
            } catch (error) {
                console.error('Error fetching daily data:', error);
            }
        };
        fetchDailyData();
    }, [selectedCompany]);

    const getAccountData = () => {
        if (!accountsData || accountsData.length === 0) {
            return { receivablesArray: [], payablesArray: [] };
        }

        let receivablesArray = [];
        let payablesArray = [];

        if (Array.isArray(accountsData)) {
            if (accountsData[0] && Array.isArray(accountsData[0])) {
                receivablesArray = accountsData[0] || [];
                payablesArray = accountsData[1] || [];
            } else {
                receivablesArray = accountsData;
                payablesArray = accountsData;
            }
        }

        return { receivablesArray, payablesArray };
    };

    const { receivablesArray, payablesArray } = getAccountData();

    const receivablesData = receivablesArray
        .filter((item) => {
            const amount = parseFloat(item.Balance || 0);
            return item && item.Na && item.Na.trim() !== '' && amount !== 0;
        })
        .map((item, index) => {
            const parsedAmount = parseFloat(item.Balance || 0);
            return {
                id: index + 1,
                name: toCamelCase(item.Na.toString().trim()),
                amount: parsedAmount,
                Na: item.Na,
                Balance: formatIndianNumber(parsedAmount),
            };
        });

    const payablesData = payablesArray
        .filter((item) => {
            const amount = parseFloat(item.Balance || 0);
            return item && item.Na && item.Na.trim() !== '' && amount !== 0;
        })
        .map((item, index) => {
            const parsedAmount = parseFloat(item.Balance || 0);
            return {
                id: index + 1,
                name: toCamelCase(item.Na.toString().trim()),
                amount: parsedAmount,
                Na: item.Na,
                Balance: formatIndianNumber(parsedAmount),
            };
        });

    const totalReceivables = receivablesData
        .filter((item) => {
            const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || 0);
            return amount < 0;
        })
        .reduce((sum, item) => {
            const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || 0);
            return sum + Math.abs(amount);
        }, 0);

    const receivablesTotal = receivablesData.reduce((sum, item) => {
        const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || 0);
        return sum + amount;
    }, 0);

    const payablesTotal = payablesData.reduce((sum, item) => {
        const amount = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount || 0);
        return sum + amount;
    }, 0);

    const StatsCards = () => {
        const totalAmount = totalReceivables + payablesTotal;
        const receivablesPercentage = totalAmount > 0 ? (receivablesTotal / totalAmount) * 100 : 0;
        const payablesPercentage = totalAmount > 0 ? (payablesTotal / totalAmount) * 100 : 0;

        return (
            <View style={styles.statsContainer}>
                <View style={styles.totalCard}>
                    <Text style={[GlobalStyle.heading9, styles.totalLabel]}>Total Advance (Receivables)</Text>
                    <Text style={[GlobalStyle.H1, styles.totalAmount]}>
                        ₹{formatIndianNumber(totalReceivables)}
                    </Text>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { width: `${receivablesPercentage}%`, backgroundColor: '#4A90E2' }]} />
                        <View style={[styles.progressBar, { width: `${payablesPercentage}%`, backgroundColor: '#F5A3C7', position: 'absolute', left: `${receivablesPercentage}%` }]} />
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { borderLeftColor: '#4A90E2', flex: 1 }]}>
                        <View style={styles.statHeader}>
                            <FontAwesomeIcon icon={faArrowUp} size={16} color="#4A90E2" />
                            <Text style={[GlobalStyle.H10, styles.statLabel]}>Receivables</Text>
                        </View>
                        <Text style={[GlobalStyle.H5, styles.statAmount]}>₹{formatIndianNumber(receivablesTotal)}</Text>
                        <Text style={[GlobalStyle.H10, styles.statPercentage]}>{receivablesPercentage.toFixed(1)}%</Text>
                    </View>

                    <View style={[styles.statCard, { borderLeftColor: '#F5A3C7', flex: 1 }]}>
                        <View style={styles.statHeader}>
                            <FontAwesomeIcon icon={faArrowDown} size={16} color="#F5A3C7" />
                            <Text style={[GlobalStyle.H10, styles.statLabel]}>Payables</Text>
                        </View>
                        <Text style={[GlobalStyle.H5, styles.statAmount]}>₹{formatIndianNumber(payablesTotal)}</Text>
                        <Text style={[GlobalStyle.H10, styles.statPercentage]}>{payablesPercentage.toFixed(1)}%</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <NetworkStatusIndicator />
            <View style={styles.header}>
                <View style={styles.leftSection}>
                    <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
                        <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
                    </TouchableOpacity>
                    <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Accounts</Text>
                </View>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setIsMenuVisible(true)}
                >
                    <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <StatsCards />

                <View style={styles.DataContent} >
                    <PanGestureHandler
                        ref={containerGestureRef}
                        onGestureEvent={containerGestureHandler}
                        simultaneousHandlers={[]}
                        shouldCancelWhenOutside={false}
                        activeOffsetY={[-15, 15]}
                        failOffsetX={[-50, 50]}
                    >
                        <Animated.View style={[styles.DataContainer, animatedStyle]}>
                            {/* Drag Handle - Visual indicator */}
                            <View style={styles.dragHandleContainer}>
                                <View style={styles.dragHandle} />
                                {/* <Text style={styles.dragHint}>Drag anywhere to expand</Text> */}
                            </View>

                            {/* Scrollable Data Component - Handles scroll gestures */}
                            <ScrollableDataComponent
                                activeTab={activeTab}
                                receivablesData={receivablesData}
                                payablesData={payablesData}
                                handleTabChange={handleTabChange}
                                onScrollToTop={handleScrollToTop}
                                isExpanded={isExpanded}
                                containerGestureRef={containerGestureRef}
                            />
                        </Animated.View>
                    </PanGestureHandler>
                </View>
            </View>

            <SlideMenuBar
                isVisible={isMenuVisible}
                onClose={() => setIsMenuVisible(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F6FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginTop: 20,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        // fontSize: 18,
        // color: '#333333',
        marginLeft: 10,
    },
    menuButton: {
        backgroundColor: '#333333',
        paddingHorizontal: 15,
        paddingVertical: 6,
        borderRadius: 20,
    },
    menuText: {
        // color: '#fff',
        // fontSize: 14,
    },
    content: {
        flex: 1,
        marginHorizontal: 13,
    },
    DataContent: {
        bottom: 20,
        marginHorizontal: -13,
    },
    rowSeperator: {
        width: '20%',
        height: 5,
        borderRadius: 10,
        backgroundColor: '#a19c9cff',
        marginVertical: 15,
        alignSelf: 'center',
    },
    statsContainer: {
        paddingVertical: 20,
    },
    totalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderLeftWidth: 4,
    },
    totalLabel: {
        // fontSize: 14,
        // color: '#666666',
        marginBottom: 8,
        fontWeight: '500',
    },
    totalAmount: {
        // fontSize: 32,
        // fontWeight: '700',
        // color: '#333333',
        marginBottom: 16,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#F0F0F0',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: '#F5F5F5',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        // fontSize: 12,
        // color: '#666666',
        marginLeft: 8,
        // fontWeight: '500',
        textTransform: 'uppercase',
    },
    statAmount: {
        // fontSize: 16,
        // fontWeight: '700',
        // color: '#333333',
        marginBottom: 4,
    },
    statPercentage: {
        // fontSize: 10,
        // color: '#999999',
        // fontWeight: '500',
    },
    DataContainer: {
        position: 'relative',
        width: '100%',
        backgroundColor: '#ffffff',
        borderTopRightRadius: 40,
        borderTopLeftRadius: 40,
        elevation: 5,
        paddingHorizontal: 20,
        paddingTop: 10,
        top: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    dragHandleContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 12,
        zIndex: 1000, // Ensure drag handle is on top
    },
    dragHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 3,
        marginBottom: 4,
    },
    dragHint: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    scrollableDataContainer: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        padding: 2,
        marginVertical: 10,
        marginHorizontal: 5,
        bottom: 10,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#4A90E2',
    },
    tabText: {
        // fontSize: 14,
        // fontWeight: '500',
        color: '#666666',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        bottom: 20,
    },
    headerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: 'transparent',
    },
    headerLabel: {
        // fontSize: 16,
        // fontWeight: '600',
        // color: '#000',
    },
    listScrollView: {
        // flex: 1,
        // paddingTop: 10,
    },
    listContentContainer: {
        // paddingBottom: 30,
        // flexGrow: 1,
        minHeight: 200,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        bottom: 20, // Changed from -80 to 0
        marginHorizontal: 20,
        justifyContent: 'space-evenly',
        paddingTop: 10, // Add some top padding
    },
    receivableItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F7F8FA',
        borderColor: '#fff',
        borderWidth: 1,
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 35,
        marginHorizontal: -20,
        marginBottom: 8,
        justifyContent: 'space-between',
    },
    itemName: {
        flex: 1,
        // fontSize: 16,
        // fontWeight: '500',
        // color: '#333333',
        // left: 5,
    },
    itemAmount: {
        // fontSize: 16,
        // fontWeight: '600',
        // color: '#333333',
        // left: 25,
    },

    negativeAmount: {
        color: '#000',
        // fontWeight: '700',
    },
    noDataContainer: {
        padding: 40,
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    noDataImage: {
        width: 150,
        height: 150,
        bottom: 40,
    },
    noDataText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        bottom: 40,
    },
});

export default AccountDashBoard;
