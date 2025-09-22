import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faArrowDown, faTruck, faBox } from '@fortawesome/free-solid-svg-icons';

const TopCards = () => {
    // Data for mapping
    const salesData = [
        {
            id: 1,
            title: 'Total Sales',
            amount: '2,61,17,900.00',
            trend: '+42.6%',
            trendType: 'up',
            isTotal: true,
            subtext: null
        },
        {
            id: 2,
            title: 'Cash Sales',
            amount: '2,00,000',
            trend: '+42.6%',
            trendType: 'up',
            isTotal: false,
            subtext: '40,000\nthan last month'
        },
        {
            id: 3,
            title: 'Credit Sales',
            amount: '1,04,000',
            trend: '-42.6%',
            trendType: 'down',
            isTotal: false,
            subtext: '33,000\nthan last month'
        }
    ];

    const metricsData = [
        {
            id: 1,
            value: '40',
            label: 'Total Trip',
            icon: faTruck
        },
        {
            id: 2,
            value: '400',
            label: 'Total Metric TON',
            icon: faBox
        }
    ];

    const TrendIcon = ({ type }) => {
        if (type === 'up') {
            return <FontAwesomeIcon icon={faArrowUp} size={12} color="#28a745" />;
        } else {
            return <FontAwesomeIcon icon={faArrowDown} size={12} color="#dc3545" />;
        }
    };

    // Cash and Credit Sales Card (White card with two columns)
    const renderSalesComparisonCard = () => (
        <View style={styles.salesComparisonCardContainer}>
            <View style={styles.salesComparisonCard}>
                {/* Background Image */}
                <Image 
                    source={require('../../../images/LOGOor.png')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
                {/* Overlay for text readability */}
                <View style={styles.backgroundOverlay} />
                
                <View style={styles.totalSalesCardContainer}>
                    <View style={styles.totalSalesAmountRow}>
                        <View style={styles.totalSalesCard}>
                            <View style={styles.totalSalesContent}>
                                <View style={styles.totalSalesAmountRow}>
                                    <Text style={styles.totalSalesTitle}>Total Sales</Text>
                                    <Text style={styles.totalSalesAmount}>₹ {salesData[0].amount}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.totalTrendContainer}>
                            <TrendIcon type={salesData[0].trendType} />
                            <Text style={styles.totalTrendText}>{salesData[0].trend}</Text>
                        </View>
                    </View>
                </View>
                
                <View style={styles.salesRow}>
                    {/* Cash Sales */}
                    <View style={styles.salesColumn}>
                        <Text style={styles.salesColumnTitle}>Cash Sales</Text>
                        <Text style={styles.salesColumnAmount}>₹ {salesData[1].amount}</Text>
                        <View style={styles.salesTrendRow}>
                            <TrendIcon type={salesData[1].trendType} />
                            <Text style={[styles.salesTrendText, { color: '#28a745' }]}>
                                {salesData[1].trend}
                            </Text>
                            <Text style={styles.salesSubAmount}>40,000</Text>
                        </View>
                        <Text style={styles.salesSubtext}>than last month</Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Credit Sales */}
                    <View style={styles.salesColumn}>
                        <Text style={styles.salesColumnTitle}>Credit Sales</Text>
                        <Text style={styles.salesColumnAmount}>₹ {salesData[2].amount}</Text>
                        <View style={styles.salesTrendRow}>
                            <TrendIcon type={salesData[2].trendType} />
                            <Text style={[styles.salesTrendText, { color: '#dc3545' }]}>
                                {salesData[2].trend}
                            </Text>
                            <Text style={styles.salesSubAmount}>33,000</Text>
                        </View>
                        <Text style={styles.salesSubtext}>than last month</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    // Metrics Card (Separate cards for trip and metric data in same row)
    const renderMetricsCard = () => (
        <View style={styles.metricsCardContainer}>
            <View style={styles.metricsRow}>
                {metricsData.map((metric, index) => (
                    <View key={metric.id} style={styles.metricItem}>
                        <View style={styles.metricsCard}>
                            <View style={styles.metricCardContent}>
                                <View style={styles.metricContent}>
                                    <Text style={styles.metricLabel}>{metric.label}</Text>
                                    <Text style={styles.metricValue}>{metric.value}</Text>
                                </View>
                                <View style={styles.metricIconContainer}>
                                    <FontAwesomeIcon
                                        icon={metric.icon}
                                        size={20}
                                        color="#4A90E2"
                                    />
                                </View>
                            </View>
                        </View>
                        {index < metricsData.length - 1 && <View style={styles.metricDivider} />}
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                {renderSalesComparisonCard()}
                {renderMetricsCard()}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
        height: '100%',
    },
    // Total Sales Card Styles (Blue Card) - No elevation
    totalSalesCardContainer: {
        right: 20,
    },
    totalSalesCard: {
        backgroundColor: 'rgba(7, 101, 208, 0.64)',
        borderBottomRightRadius: 20,
        borderTopRightRadius: 20,
        padding: 10,
        // Removed shadow/elevation for clean fade
        width: '85%',
        height: 'auto',
        marginTop: 8,
    },
    totalSalesContent: {
        alignItems: 'flex-start',
    },
    totalSalesTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
        marginRight: 18,
    },
    totalSalesAmountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    totalSalesAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
    },
    totalTrendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    totalTrendText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000ff',
        marginLeft: 4,
    },

    // Sales Comparison Card Styles (White Card) - No elevation
    salesComparisonCardContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    salesComparisonCard: {
        backgroundColor: '#ffffffff',
        borderRadius: 16,
        padding: 20,
        // Removed elevation and shadow for clean fade
        height: '80%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        top:20,
    },
    // Background Image Styles
    backgroundImage: {
        position: 'absolute',
        top: 5,
        left: 137,
        right: 0,
        bottom: 0,
        zIndex: -1,
        width: 220,
        height: 190,
    },
    // Overlay for text readability
    backgroundOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.93)',
        zIndex: -1,
    },
    salesRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        zIndex: 3,
    },
    salesColumn: {
        flex: 1,
        alignItems: 'flex-start',
        top: 10,
        zIndex: 3,
    },
    salesColumnTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4A90E2',
        marginBottom: 8,
    },
    salesColumnAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    salesTrendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    salesTrendText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
        marginRight: 8,
    },
    salesSubAmount: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    salesSubtext: {
        fontSize: 11,
        color: '#888',
        fontWeight: '400',
    },
    divider: {
        width: 1,
        height: '80%',
        marginHorizontal: 20,
        zIndex: 3,
    },

    // Metrics Card Styles - No elevation
    metricsCardContainer: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    metricsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        // Removed elevation and shadow for clean fade
        flex: 1,
        marginHorizontal: 4,
        bottom: 40,
    },
    metricCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        height: '100%',
    },
    metricsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    metricItem: {
        flex: 1,
        position: 'relative',
    },
    metricContent: {
        alignItems: 'flex-start',
        flex: 1,
    },
    metricLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: -4,
        zIndex: 2,
    },
    metricValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    metricIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 24,
        backgroundColor: '#f0f7ff',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    metricDivider: {
        position: 'absolute',
        right: 0,
        width: 1,
        height: '60%',
        top: '20%',
        zIndex: 1,
    },
});

export default TopCards;