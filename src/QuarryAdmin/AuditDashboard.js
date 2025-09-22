import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView,
    ImageBackground,
    Modal
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    faArrowLeft,
    faCalendar,
    faClock
} from '@fortawesome/free-solid-svg-icons';
import GlobalStyle from '../components/common/GlobalStyle';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale } from 'react-native-size-matters';
import { DashesDataContext } from '../components/common/DashesDataContext';
import Loading from '../components/common/Loading';
import { debounce } from 'lodash';
import DashesDateFilter from './DashBoards/DashesDataFilter';
import Svg, { Path } from 'react-native-svg';
import VehicleIconCircle from '../images/VehicleIconCircle.svg';
import TripIcon from '../images/TripIcon.svg';
const { width } = Dimensions.get('window');

const AuditDashboard = ({ navigation }) => {
    const [dateTab, setDateTab] = useState('Today');
    const tabs = ['Yesterday', 'Today', 'Week', 'Month', 'Custom'];
    const [activeTab, setActiveTab] = useState('Cancelled');
    const [expandedRow, setExpandedRow] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showCustomFilter, setShowCustomFilter] = useState(false);
    const [customStartDate, setCustomStartDate] = useState(null);
    const [customEndDate, setCustomEndDate] = useState(null);

    const {
        auditData,
        loadingStates,
        fetchSingleDashboard,
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        setTodayRange,
        setYesterdayRange,
        setWeekRange,
        setMonthRange
    } = useContext(DashesDataContext);

    // Load initial data
    useEffect(() => {
        setIsLoading(true);
        setTodayRange('audit').then(() => setIsLoading(false));
    }, []);

    const tabImages = {
        Cancelled: require('../images/EditedBill.png'),
        Daybook: require('../images/CancelledBills.png'),
        Stock: require('../images/StockSummary.png'),
        ANPR: require('../images/SuspectedBill.png'),
    };

    // Optimized data transformation with useMemo
    const tabData = useMemo(() => {
        if (!auditData || auditData.length < 4) {
            return {
                Cancelled: [],
                Daybook: [],
                Stock: [],
                ANPR: []
            };
        }

        const [cancelledData, daybookData, stockData, anprData] = auditData;

        // Aggregate ANPR data by vehicle number
        const anprGrouped = anprData.reduce((acc, item) => {
            const regNumber = item.RegNumber || 'N/A';
            if (!acc[regNumber]) {
                acc[regNumber] = {
                    dates: [],
                    times: [],
                    remarks: item.Remarks || 'Vehicle Entry',
                };
            }
            const captureTime = new Date(item.Time);
            acc[regNumber].dates.push(captureTime.toLocaleDateString());
            acc[regNumber].times.push(captureTime.toLocaleTimeString());
            return acc;
        }, {});

        // Convert grouped ANPR data to array format
        const anprArray = Object.keys(anprGrouped).map((regNumber, index) => ({
            id: index + 1,
            billNo: regNumber,
            reason: anprGrouped[regNumber].remarks,
            dates: anprGrouped[regNumber].dates,
            times: anprGrouped[regNumber].times,
            tripCount: anprGrouped[regNumber].dates.length,
        }));

        return {
            Cancelled: cancelledData.map((item, index) => ({
                id: index + 1,
                billNo: item.InvoiceNumber || 'N/A',
                reason: item.Comments || 'No Reason',
                fullReason: item.Comments || 'No Reason',
            })),
            Daybook: daybookData.map((item, index) => ({
                id: index + 1,
                billNo: item.Inv || 'N/A',
                reason: item.Bt || 'No Reason',
                deliverTo: item.DT || 'N/A',
                subTotal: item.ST?.toString() || '0',
                discount: item.DP?.toString() || '0',
            })),
            Stock: stockData.map((item, index) => ({
                id: index + 1,
                billNo: item.Product || 'N/A',
                quantity: `${item.PurchaseQty || 0} units`,
                rate: `₹${item.PurchaseValue || 0}`,
                totalValue: `₹${item.ClosingBalanceValue || 0}`,
                openingQty: item.OpenningBalanceQty || 0,
                issuedQty: item.IssuedQty || 0,
                closingQty: item.ClosingBalanceQty || 0,
                PurchaseQty: item.PurchaseQty || 0,
                PurchaseValue: item.PurchaseValue || 0,
                date: item.ReportDate ? new Date(item.ReportDate).toLocaleDateString() : 'N/A'
            })),
            ANPR: anprArray
        };
    }, [auditData]);

    // Debounced handleDateTabPress
    const debouncedHandleDateTabPress = debounce(async (tab) => {
        setDateTab(tab);
        setExpandedRow(null);
        setIsLoading(true);
        try {
            if (tab === 'Custom') {
                setShowCustomFilter(true);
                setIsLoading(false); // Stop loading to show custom filter
                return;
            }
            switch (tab) {
                case 'Yesterday':
                    await setYesterdayRange('audit');
                    break;
                case 'Today':
                    await setTodayRange('audit');
                    break;
                case 'Week':
                    await setWeekRange('audit');
                    break;
                case 'Month':
                    await setMonthRange('audit');
                    break;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    }, 300);

    const handleTabPress = (tab) => {
        setActiveTab(tab);
        setExpandedRow(null);
    };

    const handleRowPress = (itemId) => {
        // Now all tabs can be expandable
        setExpandedRow(expandedRow === itemId ? null : itemId);
    };

    const handleCustomDateSelected = async (startDateTime, endDateTime) => {
        setCustomStartDate(startDateTime);
        setCustomEndDate(endDateTime);
        setIsLoading(true);
        try {
            setStartDate(startDateTime);
            setEndDate(endDateTime);
            await fetchSingleDashboard('audit', startDateTime, endDateTime);
            setShowCustomFilter(false); // Modal already closed by DashesDateFilter
        } catch (error) {
            console.error('Error fetching custom date range:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderExpandedContent = (item) => {
        if (activeTab === 'Cancelled') {
            return (
                <View style={styles.expandedContent}>
                    <View style={styles.expandedRow}>
                        <View style={[styles.expandedColumn, { flex: 1 }]}>
                            <Text style={styles.expandedLabel}>Full Remarks</Text>
                            <Text style={[styles.expandedValue, { textAlign: 'left', width: '100%' }]}>
                                {item.fullReason}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        } else if (activeTab === 'Daybook') {
            return (
                <View style={styles.expandedContent}>
                    <View style={styles.expandedRow}>
                        <View style={styles.expandedColumn}>
                            <Text style={styles.expandedLabel}>Deliver to</Text>
                            <Text style={styles.expandedValue}>{item.deliverTo}</Text>
                        </View>
                        <View style={styles.expandedColumn}>
                            <Text style={styles.expandedLabel}>Sub total</Text>
                            <Text style={styles.expandedValue}>{item.subTotal}</Text>
                        </View>
                        <View style={styles.expandedColumn}>
                            <Text style={styles.expandedLabel}>Discount</Text>
                            <Text style={styles.expandedValue}>{item.discount}</Text>
                        </View>
                    </View>
                </View>
            );
        } else if (activeTab === 'Stock') {
            return (
                <View style={styles.expandedContent}>
                    <View style={styles.expandedRow}>
                    </View>
                    <View style={styles.expandedRow}>
                        <View style={styles.expandedColumn}>
                            <Text style={styles.expandedLabel}>Opening Qty</Text>
                            <Text style={styles.expandedValue}>{item.openingQty}</Text>
                        </View>
                        <View style={styles.expandedColumn}>
                            <Text style={styles.expandedLabel}>Issued Qty</Text>
                            <Text style={styles.expandedValue}>{item.issuedQty}</Text>
                        </View>
                        <View style={styles.expandedColumn}>
                            <Text style={styles.expandedLabel}>Closing Qty</Text>
                            <Text style={styles.expandedValue}>{item.closingQty}</Text>
                        </View>
                    </View>
                     <View style={styles.expandedRow}>
                        <View style={styles.expandedColumn}>
                            <Text style={styles.expandedLabel}>Purchase Qty</Text>
                            <Text style={styles.expandedValue}>{item.PurchaseQty}</Text>
                        </View>
                        <View style={styles.expandedColumn}>
                            <Text style={styles.expandedLabel}>Purchase Value</Text>
                            <Text style={styles.expandedValue}>{item.PurchaseValue}</Text>
                        </View>
                    </View>
                </View>
            );
        } else if (activeTab === 'ANPR') {
            return (
                <View style={styles.expandedContent}>
                    <View style={styles.expandedRow}>
                        <View style={styles.expandedColumn}>
                            <Text style={styles.expandedLabel}>Dates</Text>
                            {item.dates.map((date, idx) => (
                                <View key={idx} style={styles.iconTextContainer}>
                                    <FontAwesomeIcon icon={faCalendar} size={12} color="#666" style={styles.icon} />
                                    <Text style={styles.expandedValue}>{date}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.expandedColumn}>
                            <Text style={styles.expandedLabel}>Times</Text>
                            {item.times.map((time, idx) => (
                                <View key={idx} style={styles.iconTextContainer}>
                                    <FontAwesomeIcon icon={faClock} size={12} color="#666" style={styles.icon} />
                                    <Text style={styles.expandedValue}>{time}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    <View style={styles.expandedRow}>
                    </View>
                </View>
            );
        }
        return null;
    };

    // Helper function to truncate text
    const truncateText = (text, maxLength = 30) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const renderTableRow = () => {
        const currentTabData = tabData[activeTab] || [];

        if (currentTabData.length === 0) {
            return (
                <View style={[styles.tableCard, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text>No data available for {activeTab}</Text>
                </View>
            );
        }

        // Custom headers for each tab
        const renderHeader = () => {
            switch (activeTab) {
                case 'Cancelled':
                    return (
                        <View style={styles.tableHeaderRow}>
                            <View style={[styles.tableHeaderCell, { flex: 0.5, marginRight: 30 }]}>
                                <Image
                                    source={require('../images/S.no.png')}
                                    style={{ width: 13, height: 13 }}
                                />
                                <Text style={styles.tableHeaderCellText}>S.No</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { flex: 1, marginLeft: 25 }]}>
                                <Image
                                    source={require('../images/bill.png')}
                                    style={{ width: 15, height: 15 }}
                                />
                                <Text style={styles.tableHeaderCellText}>Bill No</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { flex: 1.5, left: 30 }]}>
                                <Image
                                    source={require('../images/remarks.png')}
                                    style={{ width: 15, height: 15 }}
                                />
                                <Text style={styles.tableHeaderCellText}>Remarks</Text>
                            </View>
                        </View>
                    );
                case 'Daybook':
                    return (
                        <View style={styles.tableHeaderRow}>
                            <View style={[styles.tableHeaderCell, { flex: 0, marginRight: 30 }]}>
                                 <Image
                                    source={require('../images/S.no.png')}
                                    style={{ width: 10, height: 10 }}
                                />
                                <Text style={styles.tableHeaderCellText}>S.No</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { flex: 2.5, marginLeft: 20 }]}>
                                <Image
                                    source={require('../images/bill.png')}
                                    style={{ width: 15, height: 15 }}
                                />
                                <Text style={styles.tableHeaderCellText}>Invoice No</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { flex: 1.5, right: 15 }]}>
                                <Image
                                    source={require('../images/bill.png')}
                                    style={{ width: 15, height: 15 }}
                                />
                                <Text style={styles.tableHeaderCellText}>Bill Type</Text>
                            </View>
                        </View>
                    );
                case 'Stock':
                    return (
                        <View style={styles.tableHeaderRow}>
                            <View style={[styles.tableHeaderCell, { flex: 0, marginLeft: 10 }]}>
                                <Image
                                    source={require('../images/S.no.png')}
                                    style={{ width: 10, height: 10 }}
                                />
                                <Text style={styles.tableHeaderCellText}>S.No</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { flex: 2.5, marginLeft: 50 }]}>
                                <Image
                                    source={require('../images/product.png')}
                                    style={{ width: 15, height: 15 }}
                                />
                                <Text style={styles.tableHeaderCellText}>Product</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { flex: 1.5, right: 10 }]}>
                                <Image
                                    source={require('../images/Quantity.png')}
                                    style={{ width: 15, height: 15 }}
                                />
                                <Text style={styles.tableHeaderCellText}>Qty</Text>
                            </View>
                        </View>
                    );
                case 'ANPR':
                    return (
                        <View style={styles.tableHeaderRow}>
                            <View style={[styles.tableHeaderCell, { flex: 0, marginRight: 30 }]}>
                                <Image
                                    source={require('../images/S.no.png')}
                                    style={{ width: 10, height: 10 }}
                                />
                                <Text style={styles.tableHeaderCellText}>S.No</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { flex: 1.5, marginLeft: 25 }]}>
                                <VehicleIconCircle width={20} height={20} />
                                <Text style={styles.tableHeaderCellText}>Vehicle No</Text>
                            </View>
                            <View style={[styles.tableHeaderCell, { flex: 1.5, left: 20 }]}>
                                <TripIcon width={30} height={30} />
                                <Text style={styles.tableHeaderCellText}>Total Trips</Text>
                            </View>
                        </View>
                    );
                default:
                    return null;
            }
        };

        return (
            <View style={styles.tableCard}>
                {renderHeader()}
                <ScrollView contentContainerStyle={{ paddingBottom: 70, bottom: 15 }} style={styles.tableBody}>
                    {currentTabData.map((item, index) => (
                        <View key={item.id}>
                            <TouchableOpacity
                                style={[
                                    styles.tableRow,
                                    index % 2 === 1 && styles.evenRow,
                                    expandedRow === item.id && styles.expandedRowStyle
                                ]}
                                onPress={() => handleRowPress(item.id)}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.tableCell, styles.indexColumn, { flex: 0.5 }]}>
                                    {index + 1}
                                </Text>
                                <Text style={[styles.tableCell, { flex: 2, fontWeight: '500', left: 40 }]}>
                                    {item.billNo}
                                </Text>
                                {activeTab === 'Cancelled' && (
                                    <Text style={[styles.tableCell, { flex: 2.5, left: 30 }]}>
                                        {truncateText(item.reason)}
                                    </Text>
                                )}
                                {activeTab === 'Daybook' && (
                                    <Text style={[styles.tableCell, { flex: 2.5, left: 50 }]}>
                                        {item.reason}
                                    </Text>
                                )}
                                {activeTab === 'Stock' && (
                                    <Text style={[styles.tableCell, { flex: 2.5, left: 40 }]}>
                                        {item.quantity}
                                    </Text>
                                )}
                                {activeTab === 'ANPR' && (
                                    <Text style={[styles.tableCell, { flex: 2.5, left: 70 }]}>
                                        {item.tripCount}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {expandedRow === item.id && renderExpandedContent(item)}

                            <View style={styles.rowSeparator} />
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    return (
        <View style={styles.Container}>
            {isLoading && <Loading />}
            <Modal
                visible={showCustomFilter}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowCustomFilter(false)}
            >
                <View style={styles.modalOverlay}>
                    <DashesDateFilter
                        CloseModel={() => setShowCustomFilter(false)}
                        onDateSelected={(startDateTime, endDateTime) => {
                            setShowCustomFilter(false); // Close modal immediately
                            handleCustomDateSelected(startDateTime, endDateTime);
                        }}
                        setIsLoading={setIsLoading}
                        initialFromDate={startDate || new Date()}
                        initialToDate={endDate || new Date()}
                    />
                </View>
            </Modal>
            <View style={styles.header}>
                <ImageBackground
                    source={require('../images/LogoWaterMark.png')}
                    style={styles.headerImage}
                    resizeMode="contain"
                />
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <FontAwesomeIcon
                            icon={faArrowLeft}
                            size={22}
                            color="white"
                            style={{ top: 11, right: 12 }}
                        />
                    </TouchableOpacity>
                    <Text style={[GlobalStyle.H3, styles.headerText]}>Audit</Text>
                </View>

                <View style={styles.daycontainer}>
                    {tabs.map((tab, index) => (
                        <React.Fragment key={tab}>
                            <TouchableOpacity
                                style={[
                                    styles.tab,
                                    dateTab === tab && styles.dateTab,
                                    index === 0 && styles.firstTab,
                                    index === tabs.length - 1 && styles.lastTab,
                                ]}
                                onPress={() => debouncedHandleDateTabPress(tab)}
                            >
                                <Text
                                    style={[
                                        styles.tabText,
                                        GlobalStyle.H12,
                                        dateTab === tab && styles.activeTabText,
                                    ]}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                            {index < tabs.length - 1 && <View style={styles.divider} />}
                        </React.Fragment>
                    ))}
                </View>
            </View>

            <View style={styles.profitCard}>
                <View style={styles.netProfitRow}>
                    <Text style={[styles.netText, GlobalStyle.H5]}>
                        {tabData[activeTab]?.length || 0} {activeTab} Bills
                    </Text>
                    <Image
                        source={tabImages[activeTab]}
                        style={styles.netProfitImage}
                    />
                </View>
            </View>

            <View style={[styles.container, { marginBottom: 10, bottom: 50 }]}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.switchContainer}
                >
                    {Object.keys(tabData).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.switchButton,
                                activeTab === tab && styles.activeSwitchButton,
                            ]}
                            onPress={() => handleTabPress(tab)}
                        >
                            <Text
                                style={[
                                    styles.switchButtonText,
                                    activeTab === tab && styles.activeSwitchButtonText,
                                ]}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {renderTableRow()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        width: '100%',
        height: 231,
        backgroundColor: '#3E89EC',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        position: 'relative',
    },
    headerImage: {
        position: 'absolute',
        width: 232,
        marginTop: 33,
        height: 208,
        alignSelf: 'flex-end',
        marginLeft: width - 232,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 35,
        marginLeft: 35,
        paddingTop: 40,
    },
    headerText: {
        color: '#FFFFFF',
        marginLeft: scale(1),
        top: verticalScale(10),
    },
    daycontainer: {
        flexDirection: 'row',
        backgroundColor: '#4A90E2',
        borderRadius: scale(5),
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        top: scale(13),
        height: scale(30),
        marginVertical: verticalScale(2),
        width: scale(320),
        justifyContent: 'center',
        alignSelf: 'center',
        top: 30,
    },
    tab: {
        flex: 1,
        paddingVertical: scale(2),
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateTab: {
        backgroundColor: '#FFFFFF',
    },
    firstTab: {
        borderTopLeftRadius: scale(1),
        borderBottomLeftRadius: scale(1),
    },
    lastTab: {
        borderTopRightRadius: scale(1),
        borderBottomRightRadius: scale(1),
    },
    tabText: {
        color: '#FFFFFF',
    },
    activeTabText: {
        color: '#3E89EC',
    },
    divider: {
        width: scale(1),
        backgroundColor: '#FFFFFF',
        height: '100%',
    },
    profitCard: {
        backgroundColor: '#FFF',
        marginHorizontal: 25,
        padding: 20,
        borderRadius: 40,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        bottom: 70,
        height: 140,
        width: 310
    },
    netProfitRow: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    netText: {
        textAlign: 'left',
        left: 10
    },
    netProfitAmount: {
        color: '#7AB134',
    },
    netProfitImage: {
        position: 'absolute',
        top: 20,
        right: 5,
        width: 90,
        height: 90,
        marginTop: -20,
        resizeMode: 'contain',
    },
    container: {
        paddingTop: 10,
        paddingHorizontal: 10,
        backgroundColor: '#F5F5F5',
    },
    switchContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 2,
        gap: -10,
        marginBottom: 10,
        alignSelf: 'center',
    },
    switchButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginHorizontal: 5,
        backgroundColor: '#fff',
    },
    activeSwitchButton: {
        backgroundColor: '#3E89EC',
    },
    switchButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
    },
    activeSwitchButtonText: {
        color: '#FFF',
    },
    listItem: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginVertical: 5,
        elevation: 2,
    },
    listText: {
        fontSize: 16,
        color: '#333',
    },
    tableContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
    },
    tableHeaderCell: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    tableHeaderCellText: {
        fontSize: scale(14),
        color: '#3E89EC',
        fontWeight: '600',
    },
    tableBody: {
        flex: 1,
        marginBottom: verticalScale(8),
        padding: 10,
        backgroundColor: '#F6F3ED'
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 15,
        marginVertical: 1,
        borderRadius: 8,
        alignItems: 'center',
        borderRadius: 70,
        gap: 30,
        marginTop: 10,
        height: 50
    },
    expandedRowStyle: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        borderRadius: 20,
        marginBottom: 0,
    },
    evenRow: {},
    tableCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: scale(16),
        overflow: 'hidden',
        marginBottom: verticalScale(13),
        elevation: 2,
        flexGrow: 1,
        minHeight: verticalScale(400),
        width: '100%',
        alignSelf: 'center',
        paddingHorizontal: scale(0),
    },
    tableCell: {
        fontSize: scale(14),
        color: '#1F2937',
        borderRadius: 20
    },
    indexColumn: {
        width: scale(24),
        height: scale(24),
        borderRadius: scale(12),
        backgroundColor: '#F6F3ED',
        textAlign: 'center',
        lineHeight: scale(24),
    },
    expandedContent: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    expandedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        top: 3
    },
    expandedColumn: {
        flex: 1,
        alignItems: 'center',
    },
    expandedLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
        fontWeight: '500',
    },
    expandedValue: {
        fontSize: 14,
        color: '#7AB134',
        fontWeight: '600',
        backgroundColor: '#F6F3ED',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 2,
        textAlign: 'center',
    },
    rowSeparator: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginHorizontal: 15,
        marginVertical: 2,
    },
    iconTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        justifyContent: 'center',
    },
    icon: {
        marginRight: 5,
    },
});

export default AuditDashboard;