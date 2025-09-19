import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Animated,
  Dimensions,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft, faSearch } from "@fortawesome/free-solid-svg-icons";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import GlobalStyle from "../../../components/common/GlobalStyle";
import { useNavigation } from "@react-navigation/native";
import NetworkStatusIndicator from "../../NetworkStatusIndicator";
import PieChart from "./PieChart";
import { DashesDataContext } from "../../../components/common/DashesDataContext";
import CustomRangeDatePicker from "./CustomRangeDatePicker";
import netProfitImg from "../../../images/NetProfit.png";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

const ProfitlLossDashBoard = () => {
  // --- Popup Date Picker State ---
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);

  // --- Usual State ---
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [selectedTab, setSelectedTab] = useState("Income");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- Context ---
  const {
    profitLossData,
    loadingStates,
    setTodayRange,
    setYesterdayRange,
    setMonthRange,
    fetchCustomDashboard,
       startDate,
    endDate,
    startTime,
    endTime,

  } = useContext(DashesDataContext);

  // --- Other Hooks ---
  const navigation = useNavigation();
  const translateY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);

  // --- Calculation Functions ---
  const calculateTotalIncome = () => {
    if (!profitLossData || !Array.isArray(profitLossData)) return 0;
    return profitLossData
      .flat()
      .filter(item => {
        const category = (item?.Category || '').toLowerCase().trim();
        return category === 'income' || category === 'incomes';
      })
      .reduce((sum, item) => sum + parseFloat(item?.Amount || 0), 0);
  };

  const calculateTotalExpenses = () => {
    if (!profitLossData || !Array.isArray(profitLossData)) return 0;
    return profitLossData
      .flat()
      .filter(item => {
        const category = (item?.Category || '').toLowerCase().trim();
        return category === 'expenses' || category === 'expense' || category === 'expenditure';
      })
      .reduce((sum, item) => sum + parseFloat(item?.Amount || 0), 0);
  };

  const calculateNetProfit = () => calculateTotalIncome() - calculateTotalExpenses();

  // --- Effects ---
  useEffect(() => { setTodayRange('profitLoss'); }, []);

  // --- Filtered Data ---
  const getFilteredData = (category) => {
    if (!profitLossData || !Array.isArray(profitLossData)) return [];
    return profitLossData
      .flat()
      .filter(item => {
        const itemCategory = (item?.Category || '').toLowerCase().trim();
        const matchesCategory =
          category.toLowerCase() === 'income'
            ? itemCategory === 'income' || itemCategory === 'incomes'
            : itemCategory === 'expenses' || itemCategory === 'expense' || itemCategory === 'expenditure';
        if (!matchesCategory) return false;
        if (!searchQuery.trim()) return true;
        const searchLower = searchQuery.toLowerCase();
        const title = (item?.Description || item?.Particulars || item?.Title || item?.Account || '').toLowerCase();
        const amount = (item?.Amount || '').toString().toLowerCase();
        return title.includes(searchLower) || amount.includes(searchLower);
      })
      .map(item => ({
        id: item?.id || item?.sno || Math.random(),
        title: item?.Description || item?.Particulars || item?.Title || item?.Account || 'Unknown',
        time: formatTime(item?.Date || item?.CreatedDate || item?.Time),
        amount: `₹ ${parseFloat(item?.Amount || 0).toLocaleString('en-IN')}`,
        code: (item?.Description || item?.Particulars || item?.Account || 'UN').substring(0, 2).toUpperCase(),
      }));
  };

  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return new Date().toLocaleTimeString();
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) {
        if (dateTimeString.includes(':')) return dateTimeString;
        return new Date().toLocaleTimeString();
      }
      return date.toLocaleTimeString();
    } catch (error) {
      return new Date().toLocaleTimeString();
    }
  };

  // --- Handle filter (with popup logic) ---
  const handleFilterChange = async (filter) => {
    setSelectedFilter(filter);
    switch (filter) {
      case "Today": await setTodayRange('profitLoss'); break;
      case "Yesterday": await setYesterdayRange('profitLoss'); break;
      case "Month": await setMonthRange('profitLoss'); break;
      case "Custom":
        setShowCustomPicker(true);
        break;
      default: await setTodayRange('profitLoss');
    }
  };

  // --- Handle pan gesture ---
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY: translation, velocityY } = event.nativeEvent;
      const shouldExpand = translation < -50 || velocityY < -500;
      if (shouldExpand && !isExpanded) {
        setIsExpanded(true);
        Animated.spring(translateY, { toValue: -(screenHeight * 0.09), useNativeDriver: true }).start();
      } else if (!shouldExpand && isExpanded) {
        setIsExpanded(false);
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
      } else {
        Animated.spring(translateY, { toValue: isExpanded ? -(screenHeight * 0.09) : 0, useNativeDriver: true }).start();
      }
    }
  };

  // --- Auto-scroll for info boxes ---
  useEffect(() => {
    if (!isExpanded) return;
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % 3;
      setCurrentIndex(nextIndex);
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ x: nextIndex * screenWidth * 0.8, animated: true });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, isExpanded]);

  const dataToShow = getFilteredData(selectedTab);

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />

      {/* Custom Range Date Picker */}
      <CustomRangeDatePicker
        visible={showCustomPicker}
        onClose={() => setShowCustomPicker(false)}
        onSelectRange={async ({ start, end }) => {
          setCustomStartDate(start);
          setCustomEndDate(end);
          setShowCustomPicker(false);
          if (start && end) {
            await fetchCustomDashboard("profitLoss", start, end);
          }
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => navigation.navigate("DashboardMain")}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
          </TouchableOpacity>
          <Text style={[GlobalStyle.heading1, styles.headerTitle]}>
            Profit & Loss
          </Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
        </TouchableOpacity>
      </View>

      <View contentContainerStyle={{ flexGrow: 2 }}>
        <View style={styles.content}>
          {/* Filters */}
          <View style={styles.filterContainer}>
            {["Today", "Yesterday", "Month", "Custom"].map((filter, i) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  selectedFilter === filter && styles.filterButtonActive,
                  i !== 3 && styles.filterButtonSpacing,
                  loadingStates.profitLoss && styles.filterButtonDisabled,
                ]}
                onPress={() => handleFilterChange(filter)}
                disabled={loadingStates.profitLoss}
              >
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter && styles.filterTextActive,
                    loadingStates.profitLoss && styles.filterTextDisabled,
                  ]}
                >
                  {loadingStates.profitLoss && selectedFilter === filter ? 'Loading...' : filter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart or Scrollable Boxes */}
          {!isExpanded ? (
            <PieChart style={styles.PieChart} />
          ) : (
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              style={styles.scrollContainer}
            >
              {/* Income */}
              <View style={styles.valueBox}>
                <View style={styles.netProfitTextWrap}>
                  <Text style={styles.netProfitLabel}>Income</Text>
                  <Text style={styles.netProfitValue}>
                    ₹ {calculateTotalIncome().toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </Text>
                </View>
                <Image source={netProfitImg} style={styles.netProfitImage} resizeMode="contain" />
              </View>
              {/* Expense */}
              <View style={styles.valueBox}>
                <View style={styles.netProfitTextWrap}>
                  <Text style={styles.netProfitLabel}>Expense</Text>
                  <Text style={[styles.netProfitValue, { color: 'red' }]}>
                    ₹ {calculateTotalExpenses().toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </Text>
                </View>
                <Image source={netProfitImg} style={styles.netProfitImage} resizeMode="contain" />
              </View>
              {/* Net Profit */}
              <View style={styles.valueBox}>
                <View style={styles.netProfitTextWrap}>
                  <Text style={styles.netProfitLabel}>Net Profit</Text>
                  <Text style={[
                    styles.netProfitValue,
                    { color: calculateNetProfit() >= 0 ? 'green' : 'red' }
                  ]}>
                    ₹ {calculateNetProfit().toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </Text>
                </View>
                <Image source={netProfitImg} style={styles.netProfitImage} resizeMode="contain" />
              </View>
            </ScrollView>
          )}

          {/* Animated Details Section */}
          <Animated.View
            style={[
              styles.detailsSection,
              { transform: [{ translateY }] },
            ]}
          >
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View style={styles.gestureArea}>
                <View style={styles.dragHandle} />

                {/* Tabs */}
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tabButton, selectedTab === "Income" && styles.tabActive]}
                    onPress={() => setSelectedTab("Income")}
                  >
                    <Text style={[styles.tabText, selectedTab === "Income" && styles.tabTextActive]}>
                      Income
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabButton, selectedTab === "Expense" && styles.tabActive]}
                    onPress={() => setSelectedTab("Expense")}
                  >
                    <Text style={[styles.tabText, selectedTab === "Expense" && styles.tabTextActive]}>
                      Expense
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </PanGestureHandler>

            {/* Details */}
            <Text style={styles.detailsTitle}>{selectedTab} details</Text>

            {/* Search */}
            <View style={styles.searchContainer}>
              <TextInput
                placeholder={`Search by ${selectedTab.toLowerCase()}`}
                style={styles.searchInput}
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <FontAwesomeIcon icon={faSearch} size={16} color="#666" />
            </View>

            {/* Loading or Data List */}
            {loadingStates.profitLoss ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading {selectedTab.toLowerCase()} data...</Text>
              </View>
            ) : (
              <ScrollView
                style={{ maxHeight: screenHeight * 0.50, marginBottom: -30 }}
                contentContainerStyle={{ paddingBottom: 350 }}
                showsVerticalScrollIndicator={false}
              >
                {dataToShow.length > 0 ? (
                  dataToShow.map((item) => (
                    <View key={item.id} style={styles.listCard}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{item.code}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listTitle}>{item.title}</Text>
                        <Text style={styles.listTime}>{item.time}</Text>
                      </View>
                      <Text
                        style={[
                          styles.listAmount,
                          selectedTab === "Expense" && { color: "red" },
                          selectedTab === "Income" && { color: "green" },
                        ]}
                      >
                        {item.amount}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.noDataContainer}>
                    <Text style={styles.noDataText}>
                      No {selectedTab.toLowerCase()} data found for the selected period
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  PieChart: { marginTop: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  leftSection: { flexDirection: "row", alignItems: "center" },
  headerTitle: { marginLeft: 10 },
  menuButton: {
    backgroundColor: "#333333",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  netProfitTextWrap: {},
  netProfitLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    marginBottom: 5,
    paddingLeft: 10,
  },
  netProfitValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    paddingLeft: 10,
  },
  netProfitImage: { width: 50, height: 50 },
  menuText: {},
  content: { alignItems: "center" },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 13,
    bottom: 20,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  filterButtonSpacing: { marginRight: 6 },
  filterButtonActive: { backgroundColor: "#4A90E2" },
  filterButtonDisabled: { backgroundColor: "#f0f0f0", opacity: 0.6 },
  filterText: { fontSize: 14, color: "#666", fontWeight: "500" },
  filterTextActive: { color: "#ffffff" },
  filterTextDisabled: { color: "#999" },
  scrollContainer: {
    maxHeight: 130,
    marginVertical: 20,
    zIndex: 10,
  },
  valueBox: {
    width: screenWidth * 0.8,
    backgroundColor: "#fff",
    marginHorizontal: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 10,
    marginBottom: 20,
  },
  gestureArea: {
    paddingTop: 12,
    paddingBottom: 15,
    width: "100%",
  },
  detailsSection: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 0,
    paddingBottom: 20,
    width: "100%",
    minHeight: screenHeight * 0.4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    top: 50,
  },
    dragHandle: {
      width: 40,
      height: 4,
      backgroundColor: "#ccc",
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 15,
    },
    tabContainer: {
      flexDirection: "row",
      justifyContent: "center",
      backgroundColor: "#eee",
      borderRadius: 20,
      padding: 3,
      width: "70%",
      alignSelf: "center",
      marginBottom: 15,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 20,
      alignItems: "center",
    },
    tabActive: { backgroundColor: "#4A90E2" },
    tabText: { fontSize: 14, fontWeight: "500", color: "#333" },
    tabTextActive: { color: "#fff" },
    detailsTitle: {
      fontSize: 15,
      fontWeight: "600",
      alignSelf: "flex-start",
      marginLeft: 35,
      marginBottom: 8,
      color: "#111",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginHorizontal: 30,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: "#ddd",
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: "#333",
      paddingVertical: 0,
    },
    listCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      padding: 12,
      marginHorizontal: 25,
      marginBottom: 10,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
      borderWidth: 1,
      borderColor: "#f0f0f0",
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#4A90E2",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    avatarText: { color: "#fff", fontWeight: "700", fontSize: 12 },
    listTitle: { fontSize: 15, fontWeight: "600", color: "#222" },
    listTime: { fontSize: 12, color: "#777", marginTop: 2 },
    listAmount: { fontSize: 15, fontWeight: "700" },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 50,
    },
    loadingText: {
      fontSize: 16,
      color: "#666",
      fontWeight: "500",
    },
    noDataContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 50,
    },
    noDataText: {
      fontSize: 16,
      color: "#999",
      
      textAlign: "center",
      paddingHorizontal: 20,
    },
  });

  export default ProfitlLossDashBoard;
