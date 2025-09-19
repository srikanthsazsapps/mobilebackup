import React, { useState, useRef, useEffect, useContext } from "react";
import {View,Text,StyleSheet, SafeAreaView, TouchableOpacity,ScrollView,TextInput,Animated,Dimensions,Modal,Pressable,Image,} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft, faSearch, faFilter } from "@fortawesome/free-solid-svg-icons";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import GlobalStyle from "../../../components/common/GlobalStyle";
import { useNavigation } from "@react-navigation/native";
import NetworkStatusIndicator from "../../NetworkStatusIndicator";
import PieChart from "./PieChart";
import { DashesDataContext } from "../../../components/common/DashesDataContext";
import DateFilter from "./DateFilter";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
const amountFilterOptions = ["Low to High", "High to Low"];
const safeLower = val => (typeof val === "string" ? val.toLowerCase().trim() : "");
const ProfitlLoss = () => {
  const [showAmountFilterDropdown, setShowAmountFilterDropdown] = useState(false);
  const [selectedAmountFilter, setSelectedAmountFilter] = useState("Low to High");
  const [selectedTab, setSelectedTab] = useState("Income");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("Today");
  const {profitLossData,loadingStates,setTodayRange,setPreviousTodayRange,} = useContext(DashesDataContext);
  const navigation = useNavigation();
  const translateY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const pieOpacity = useRef(new Animated.Value(1)).current;  // Animation values for PieChart
  const pieScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;  // Animation values for Top Income/Expense Card
  const cardScale = useRef(new Animated.Value(0.8)).current;
  const cardTranslateY = useRef(new Animated.Value(50)).current;
  const expandedHeight = screenHeight * 0.5;
  const collapsedHeight = screenHeight * 0.4;
  const expansionDistance = expandedHeight - collapsedHeight;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pieOpacity, {
        toValue: isExpanded ? 0 : 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(pieScale, {
        toValue: isExpanded ? 0.6 : 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: isExpanded ? 1 : 0,
        duration: 350,
        delay: isExpanded ? 200 : 0,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: isExpanded ? 1 : 0.8,
        duration: 350,
        delay: isExpanded ? 200 : 0,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: isExpanded ? 0 : 50,
        duration: 350,
        delay: isExpanded ? 200 : 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isExpanded]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('ProfitLoss: Initializing data...');
        await setTodayRange("profitLoss");
        await setPreviousTodayRange("profitLoss");
      } catch (error) {
        console.error('ProfitLoss: Error initializing data:', error);
      }
    };
    
    initializeData();
  }, []);

  const handleAmountFilterChange = (filter) => {
    setSelectedAmountFilter(filter);
    setShowAmountFilterDropdown(false);
  };

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
        Animated.spring(translateY, {
          toValue: -expansionDistance,
          useNativeDriver: true,
        }).start();
      } else if (!shouldExpand && isExpanded) {
        setIsExpanded(false);
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.spring(translateY, {
          toValue: isExpanded ? -expansionDistance : 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const getFilteredData = (category) => {
    if (!profitLossData || !Array.isArray(profitLossData)) return [];
    let filteredData = profitLossData
      .flat()
      .filter((item) => {
        const itemCategory = safeLower(item?.Category);
        const matchesCategory =
          safeLower(category) === "income"
            ? itemCategory === "income" || itemCategory === "incomes"
            : itemCategory === "expenses" ||
              itemCategory === "expense" ||
              itemCategory === "expenditure";
        if (!matchesCategory) return false;
        if (!searchQuery.trim()) return true;
        const searchLower = safeLower(searchQuery);
        const title =
          safeLower(item?.Description) ||
          safeLower(item?.Particulars) ||
          safeLower(item?.Title) ||
          safeLower(item?.Account);
        const amount = (item?.Amount ?? "").toString().toLowerCase();
        return title.includes(searchLower) || amount.includes(searchLower);
      })
      .map((item) => ({
        id: item?.id || item?.sno || Math.random(),
        title: item?.Description || item?.Particulars || item?.Title || item?.Account || "Unknown",
        time:
          item?.Date ||
          item?.CreatedDate ||
          item?.Time ||
          new Date().toLocaleTimeString(),
        amount: `₹ ${parseFloat(item?.Amount || 0).toLocaleString("en-IN")}`,
        rawAmount: parseFloat(item?.Amount || 0),
        code:
          (safeLower(item?.Description)?.substring(0, 2).toUpperCase() ||
            safeLower(item?.Particulars)?.substring(0, 2).toUpperCase() ||
            safeLower(item?.Account)?.substring(0, 2).toUpperCase() ||
            "UN"),
      }));

    filteredData.sort((a, b) => {
      if (selectedAmountFilter === "Low to High") {
        return a.rawAmount - b.rawAmount;
      } else {
        return b.rawAmount - a.rawAmount;
      }
    });

    return filteredData;
  };

  const TopIncomeExpenseCard = ({ isAnimated = false }) => {
    const getTopIncome = () => {
      if (!profitLossData || !Array.isArray(profitLossData)) return { title: "N/A", amount: 0 };
      const incomeItems = profitLossData
        .flat()
        .filter((item) => {
          const category = safeLower(item?.Category);
          return category === "income" || category === "incomes";
        });
      if (incomeItems.length === 0) return { title: "N/A", amount: 0 };
      const topItem = incomeItems.reduce((max, item) =>
        parseFloat(item?.Amount || 0) > parseFloat(max?.Amount || 0) ? item : max
      );
      return {
        title:
          topItem?.Description ||
          topItem?.Particulars ||
          topItem?.Title ||
          topItem?.Account ||
          "Unknown",
        amount: parseFloat(topItem?.Amount || 0),
      };
    };

    const getTopExpense = () => {
      if (!profitLossData || !Array.isArray(profitLossData)) return { title: "N/A", amount: 0 };
      const expenseItems = profitLossData
        .flat()
        .filter((item) => {
          const category = safeLower(item?.Category);
          return category === "expenses" || category === "expense" || category === "expenditure";
        });
      if (expenseItems.length === 0) return { title: "N/A", amount: 0 };
      const topItem = expenseItems.reduce((max, item) =>
        parseFloat(item?.Amount || 0) > parseFloat(max?.Amount || 0) ? item : max
      );
      return {
        title:
          topItem?.Description ||
          topItem?.Particulars ||
          topItem?.Title ||
          topItem?.Account ||
          "Unknown",
        amount: parseFloat(topItem?.Amount || 0),
      };
    };

    const topIncome = getTopIncome();
    const topExpense = getTopExpense();

    const containerStyle = isAnimated
      ? [
          styles.topIncomeExpenseCard,
          styles.animatedCardPosition,
          {
            opacity: cardOpacity,
            transform: [
              { scale: cardScale },
              { translateY: cardTranslateY }
            ]
          }
        ]
      : styles.topIncomeExpenseCard;

    return (
      <Animated.View style={containerStyle}>
        <View style={styles.topItemContainer}>
          <Text style={styles.topItemLabel}>Top Income</Text>
          <Text style={styles.topItemTitle} numberOfLines={1} ellipsizeMode="tail">
            {topIncome.title}
          </Text>
          <Text style={[styles.topItemAmount, { color: "#22C55E" }]}>
            ₹{topIncome.amount.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={styles.topItemContainer}>
          <Text style={styles.topItemLabel}>Top Expense</Text>
          <Text style={styles.topItemTitle} numberOfLines={1} ellipsizeMode="tail">
            {topExpense.title}
          </Text>
          <Text style={[styles.topItemAmount, { color: "#EF4444" }]}>
            ₹{topExpense.amount.toLocaleString("en-IN")}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const dataToShow = getFilteredData(selectedTab);

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />

      {/* Modal Dropdown for Amount Filters */}
      <Modal
        visible={showAmountFilterDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAmountFilterDropdown(false)}
      >
        <Pressable style={styles.dropdownBackdrop} onPress={() => setShowAmountFilterDropdown(false)} />
        <View style={[
          styles.dropdownMenu, 
          styles.amountDropdownPosition,
          {
            // Dynamic positioning based on expanded state
            top: isExpanded 
              ? screenHeight * 0.25 + 150 // Position when expanded
              : screenHeight * 0.55 + 150, // Position when collapsed
          }
        ]}>
          {amountFilterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.dropdownItem,
                selectedAmountFilter === filter && { backgroundColor: "#eee" },
              ]}
              onPress={() => handleAmountFilterChange(filter)}
            >
              <Text
                style={[
                  styles.itemTextStyle,
                  selectedAmountFilter === filter && { color: "#000000" },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => navigation.navigate("DashboardMain")}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
          </TouchableOpacity>
          <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Profit & Loss</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DateFilter dashboardType="profitLoss" onFilterChange={(filter) => setSelectedTimeFilter(filter)} />
          <TouchableOpacity style={styles.menuButton}>
            <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View contentContainerStyle={{ flexGrow: 2 }}>
        <View style={styles.content}>
          <View style={styles.chartContainer}>
            <Animated.View style={{
              ...styles.PieChart,
              opacity: pieOpacity,
              transform: [{ scale: pieScale }]
            }}>
              <PieChart selectedTimeFilter={selectedTimeFilter} />
            </Animated.View>
            <TopIncomeExpenseCard isAnimated={true} />
          </View>

          {!isExpanded && <TopIncomeExpenseCard />}

          <Animated.View
            style={[
              styles.detailsSection,
              {
                transform: [{ translateY }],
                minHeight: isExpanded ? expandedHeight : collapsedHeight,
              },
            ]}
          >
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View style={styles.gestureArea}>
                <View style={styles.dragHandle} />
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

            <Text style={styles.detailsTitle}>{selectedTab} details</Text>
            
            {/* Combined Search and Filter Row */}
            <View style={styles.searchFilterRow}>
              <View style={styles.searchContainer}>
  <TextInput
    placeholder={`Search by ${selectedTab.toLowerCase()}`}
    style={styles.searchInput}
    placeholderTextColor="#999"
    value={searchQuery}
    onChangeText={setSearchQuery}
  />
  <FontAwesomeIcon icon={faSearch} size={16} color="#666" style={styles.searchIcon} />
</View>
              <TouchableOpacity
                onPress={() => setShowAmountFilterDropdown(true)}
                style={styles.filterIconButton}
              >
                <Image 
                  source={require('../../../images/Sorting.png')} 
                  style={styles.filterImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {loadingStates.profitLoss ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading {selectedTab.toLowerCase()} data...</Text>
              </View>
            ) : (
              <ScrollView
                style={{
                  maxHeight: isExpanded ? expandedHeight : screenHeight * 0.4,
                  marginBottom: 20,
                }}
                contentContainerStyle={{ paddingBottom: 400 }}
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
  chartContainer: {
    position: 'relative',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  animatedCardPosition: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    marginLeft: -screenWidth * 0.5,
    marginTop: -40,
    width: screenWidth * 0.9,
    zIndex: 10,
  },
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
    marginLeft: 10,
  },
  filterHeaderButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 4,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 68,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 6,
    paddingVertical: 8,
    minWidth: 140,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  amountDropdownPosition: {
    right: 25, // Align with filter button
    top: 'auto', // Will be set dynamically
  },
  itemTextStyle: {
    color: 'black',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  topIncomeExpenseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 60,
    marginBottom: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topItemContainer: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 8,
  },
  topItemLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    marginBottom: 6,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  topItemTitle: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-SemiBold',
 
  },
  topItemAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  menuText: {},
  content: { alignItems: "center" },
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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
    width: "85%",
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
  tabText: { fontSize: 14, fontWeight: "500", color: "#333", fontFamily: 'PlusJakartaSans-SemiBold',
  },
  tabTextActive: { color: "#fff" },
  detailsTitle: {
    fontSize: 15,
    fontWeight: "600",
    alignSelf: "flex-start",
    marginLeft: 35,
    marginBottom: 15,
    color: "#111",
    fontFamily: 'PlusJakartaSans-SemiBold',
 
  },
  // New combined search and filter row styles
  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 30,
    marginBottom: 12,
    gap: 10,
  },
 searchContainer: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#f5f5f5",
  borderRadius: 20,
  paddingHorizontal: 12,
  paddingVertical: 10,
  borderWidth: 1,
  borderColor: "#ddd",
},
searchIcon: {
  marginRight: 8,
},
searchInput: {
  flex: 1,
  fontSize: 14,
  color: "#333",
  paddingVertical: 0,
},
  filterIconButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 50,
    width: 33,
    height: 33,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4A90E2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  filterImage: {
    width: 16,
    height: 16,
    tintColor: '#fff', // This will make the image white if it's a single color icon
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
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 12 ,fontFamily: 'PlusJakartaSans-SemiBold',
 },
  listTitle: { fontSize: 15, fontWeight: "600", color: "#222" ,fontFamily: 'PlusJakartaSans-SemiBold',
 },
  listTime: { fontSize: 12, color: "#777", marginTop: 2 },
  listAmount: { fontSize: 15, fontWeight: "700",fontFamily: 'PlusJakartaSans-SemiBold',
  },
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
    fontFamily: 'PlusJakartaSans-SemiBold',
 
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
    fontFamily: 'PlusJakartaSans-SemiBold',
 
  },
});

export default ProfitlLoss;