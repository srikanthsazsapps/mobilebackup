import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { SalesDataContext } from '../../../QuarryAdmin/DashBoards/SalesDataContext';

const TopCards = () => {
    const { salesSummary, previousDailyData, summary, selectedPeriodType } = useContext(SalesDataContext);

    const previousSalesSummary = previousDailyData?.salesSummary || null;

    const currentTotal = (parseFloat(salesSummary?.TotalCashSales || 0) + parseFloat(salesSummary?.TotalCreditSales || 0));
    const prevTotal = (parseFloat(previousSalesSummary?.TotalCashSales || 0) + parseFloat(previousSalesSummary?.TotalCreditSales || 0));
    let percTotal = prevTotal !== 0 ? ((currentTotal - prevTotal) / prevTotal * 100) : (currentTotal !== 0 ? 100 : 0);
    const trendTotal = Math.abs(percTotal).toFixed(1);
    const signTotal = percTotal > 0 ? '+' : percTotal < 0 ? '-' : '';
    const trendTotalStr = signTotal + trendTotal + '%';
    const trendTypeTotal = percTotal > 0 ? 'up' : 'down';

    const currentCash = parseFloat(salesSummary?.TotalCashSales || 0);
    const prevCash = parseFloat(previousSalesSummary?.TotalCashSales || 0);
    let percCash = prevCash !== 0 ? ((currentCash - prevCash) / prevCash * 100) : (currentCash !== 0 ? 100 : 0);
    const trendCash = Math.abs(percCash).toFixed(1);
    const signCash = percCash > 0 ? '+' : percCash < 0 ? '-' : '';
    const trendCashStr = signCash + trendCash + '%';
    const trendTypeCash = percCash > 0 ? 'up' : 'down';
    const subAmountCash = prevCash.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const currentCredit = parseFloat(salesSummary?.TotalCreditSales || 0);
    const prevCredit = parseFloat(previousSalesSummary?.TotalCreditSales || 0);
    let percCredit = prevCredit !== 0 ? ((currentCredit - prevCredit) / prevCredit * 100) : (currentCredit !== 0 ? 100 : 0);
    const trendCredit = Math.abs(percCredit).toFixed(1);
    const signCredit = percCredit > 0 ? '+' : percCredit < 0 ? '-' : '';
    const trendCreditStr = signCredit + trendCredit + '%';
    const trendTypeCredit = percCredit > 0 ? 'up' : 'down';
    const subAmountCredit = prevCredit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const periodLabel = selectedPeriodType === 'day' ? 'day' : selectedPeriodType === 'custom' ? 'period' : selectedPeriodType;
    const subtext = `than previous ${periodLabel}`;

    console.log('TopCards - SalesSummary:', JSON.stringify(salesSummary, null, 2));

    const salesData = [
        {
            id: 1,
            title: 'Total Sales',
            amount: currentTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            trend: trendTotalStr,
            trendType: trendTypeTotal,
            isTotal: true,
            subtext: null
        },
        {
            id: 2,
            title: 'Cash Sales',
            amount: currentCash.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            trend: trendCashStr,
            trendType: trendTypeCash,
            isTotal: false,
        },
        {
            id: 3,
            title: 'Credit Sales',
            amount: currentCredit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            trend: trendCreditStr,
            trendType: trendTypeCredit,
            isTotal: false,
        }
    ];

    const TrendIcon = ({ type }) => {
        if (type === 'up') {
            return <FontAwesomeIcon icon={faArrowUp} size={12} color="#28a745" />;
        } else {
            return <FontAwesomeIcon icon={faArrowDown} size={12} color="#dc3545" />;
        }
    };

    const renderSalesComparisonCard = () => (
        <View style={styles.salesComparisonCardContainer}>
            <View style={styles.salesComparisonCard}>
                <Image 
                    source={require('../../../images/LOGOor.png')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
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
                    <View style={styles.salesColumn}>
                        <Text style={styles.salesColumnTitle}>Cash Sales</Text>
                        <Text style={styles.salesColumnAmount}>₹ {salesData[1].amount}</Text>
                        <View style={styles.salesTrendRow}>
                            <TrendIcon type={salesData[1].trendType} />
                            <Text style={[styles.salesTrendText, { color: percCash > 0 ? '#28a745' : '#dc3545' }]}>
                                {salesData[1].trend}
                            </Text>
                            <Text style={styles.salesSubAmount}>{subAmountCash}</Text>
                        </View>
                        <Text style={styles.salesSubtext}>{subtext}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.salesColumn}>
                        <Text style={styles.salesColumnTitle}>Credit Sales</Text>
                        <Text style={styles.salesColumnAmount}>₹ {salesData[2].amount}</Text>
                        <View style={styles.salesTrendRow}>
                            <TrendIcon type={salesData[2].trendType} />
                            <Text style={[styles.salesTrendText, { color: percCredit > 0 ? '#28a745' : '#dc3545' }]}>
                                {salesData[2].trend}
                            </Text>
                            <Text style={styles.salesSubAmount}>{subAmountCredit}</Text>
                        </View>
                        <Text style={styles.salesSubtext}>{subtext}</Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderMetricsCard = () => {
        const metricsData = salesSummary
            ? [
                  {
                      id: 1,
                      value: salesSummary.TotalTrips?.toLocaleString('en-IN') || '0',
                      label: 'Total Trip',
                      image: require('../../../images/totaltrip.png'),
                  },
                  {
                      id: 2,
                      value: parseFloat(salesSummary.TotalMT)?.toLocaleString('en-IN') || '0',
                      label: 'Total Metric TON',
                      image: require('../../../images/metricton.png'),
                  },
              ]
            : [
                  {
                      id: 1,
                      value: '0',
                      label: 'Total Trip',
                      image: require('../../../images/totaltrip.png'),
                  },
                  {
                      id: 2,
                      value: '0',
                      label: 'Total Metric TON',
                      image: require('../../../images/metricton.png'),
                  },
              ];

        return (
            <View style={[styles.metricsCardContainer, { marginTop: 0 }]}>
                <View style={styles.metricsRow}>
                    {metricsData.map((metric, index) => (
                        <View key={metric.id} style={styles.metricItem}>
                            <View style={styles.metricsCard}>
                                <View style={styles.metricCardContent}>
                                    <View style={styles.metricContent}>
                                        <Image
                                            source={metric.image}
                                            style={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                zIndex: 1,
                                                left: 50,
                                                opacity: 0.9,
                                                top: 10,
                                                resizeMode: 'contain',
                                            }}
                                        />
                                        <View style={{ zIndex: 2 }}>
                                            <Text style={styles.metricLabel}>{metric.label}</Text>
                                            <Text style={styles.metricValue}>{metric.value}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {index < 1 && <View style={styles.metricDivider} />}
                        </View>
                    ))}
                </View>
            </View>
        );
    };

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
    totalSalesCardContainer: {
        right: 20,
    },
    totalSalesCard: {
        backgroundColor: 'rgba(7, 101, 208, 0.64)',
        borderBottomRightRadius: 20,
        borderTopRightRadius: 20,
        padding: 10,
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
        fontFamily: 'PlusJakartaSans',
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
        fontFamily: 'PlusJakartaSans',
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
        fontFamily: 'PlusJakartaSans',
        color: '#000000ff',
        marginLeft: 4,
    },
    salesComparisonCardContainer: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    salesComparisonCard: {
        backgroundColor: '#ffffffff',
        borderRadius: 16,
        padding: 20,
        paddingBottom: 40,
        height: '80%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        top: 20,
    },
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
        fontFamily: 'PlusJakartaSans',
        color: '#4A90E2',
        marginBottom: 8,
    },
    salesColumnAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'PlusJakartaSans',
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
        fontFamily: 'PlusJakartaSans',
        marginLeft: 4,
        marginRight: 8,
    },
    salesSubAmount: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans',
        color: '#666',
    },
    salesSubtext: {
        fontSize: 11,
        fontFamily: 'PlusJakartaSans',
        color: '#888',
        fontWeight: '400',
    },
    divider: {
        width: 1,
        height: '80%',
        marginHorizontal: 20,
        zIndex: 3,
    },
    metricsCardContainer: {
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    metricsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        flex: 1,
        marginHorizontal: 4,
        bottom: 30,
        height: 80,
    },
    metricCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
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
        position: 'relative',
    },
    metricLabel: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans',
        color: '#333',
        marginBottom: -4,
        zIndex: 2,
    },
    metricValue: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'PlusJakartaSans',
        color: '#333',
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