import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  ScrollView,
  TextInput,
  ImageBackground,
  TouchableWithoutFeedback
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowAltCircleRight, faArrowCircleRight, faArrowDown, faArrowDown19, faArrowDownAZ, faArrowDownUpLock, faArrowLeft, faArrowsUpDown, faSearch } from "@fortawesome/free-solid-svg-icons";
import NetworkStatusIndicator from '../../NetworkStatusIndicator';
import DateFilter from '../../CommonFiles/DateFilter';
import AccountBarChart from './AccountBarChart';

const { width, height } = Dimensions.get('window');

const AccountsDB = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('receivables');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmountTab, setSelectedAmountTab] = useState('All');
  const [expandedCard, setExpandedCard] = useState(null);
  const [isSortDropdownVisible, setIsSortDropdownVisible] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState(null);

  // Draggable animation values
  const translateY = useSharedValue(0);
  const isExpanded = useSharedValue(false);
  const dragProgress = useSharedValue(0);

  const containerGestureRef = useRef();

  // Define positions
  const COLLAPSED_HEIGHT = height * 0.9;
  const EXPANDED_HEIGHT = height * 0.95;
  const COLLAPSED_TRANSLATE = 0;
  const EXPANDED_TRANSLATE = -height * 0.20;

  // Receivables Tabs
  const receivablesTabs = [
    { id: 'All', label: 'All' },
    { id: '0-30', label: '0-30' },
    { id: '30-60', label: '30-60' },
    { id: '60-90', label: '60-90' },
    { id: '90-120', label: '90-120' }
  ];

  // Payables Tabs
  const payablesTabs = [
    { id: 'All', label: 'All' },
    { id: 'Default', label: 'Default' },
    { id: 'Liabilities', label: 'Liabilities' },
    { id: 'SubContractor', label: 'Sub-Contractor' },
  ];

  const payablesData = [
    { id: 1, header: 'Liabilities', outstanding: '8,45,567.00', totalBills: 10 },
    { id: 2, header: 'Sub-Contractor', outstanding: '8,45,567.00', totalBills: 10 },
    { id: 3, header: 'Contractor', outstanding: '8,45,567.00', totalBills: 10 },
    { id: 4, header: 'Defaults', outstanding: '8,45,567.00', totalBills: 10 },
    { id: 5, header: 'Other Payable 1', outstanding: '2,34,567.00', totalBills: 5 },
    { id: 6, header: 'Other Payable 2', outstanding: '5,00,000.00', totalBills: 7 },
    { id: 7, header: 'Other Payable 3', outstanding: '1,00,000.00', totalBills: 3 },
    { id: 8, header: 'Other Payable 4', outstanding: '3,50,000.00', totalBills: 4 },
  ];

  // Generate 10 sample dropdown items for each card
  const generateDropdownData = (cardId) => {
    const sampleData = [];
    for (let i = 1; i <= 10; i++) {
      sampleData.push({
        id: i,
        name: `${cardId === 1 ? 'Ajay' : cardId === 2 ? 'Karthik' : cardId === 3 ? 'Muthu' : cardId === 4 ? 'Raja' : 'Person'} ${i}`,
        amount: `${Math.floor(Math.random() * 900000) + 100000}.00`,
        avatar: require('../../../images/dropDown.png')
      });
    }
    return sampleData;
  };

  const tabsToRender = activeTab === 'receivables' ? receivablesTabs : payablesTabs;

  const updateProgress = (progress) => {
    dragProgress.value = progress;
  };

  const animatedStyle = useAnimatedStyle(() => {
    const progress = Math.abs(translateY.value) / Math.abs(EXPANDED_TRANSLATE);
    const currentHeight = COLLAPSED_HEIGHT + (EXPANDED_HEIGHT - COLLAPSED_HEIGHT) * progress;

    runOnJS(updateProgress)(progress);

    return {
      transform: [{ translateY: translateY.value }],
      height: currentHeight,
    };
  });

  const containerGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      const isVerticalGesture = Math.abs(event.translationY) > Math.abs(event.translationX) * 1.5;
      if (isVerticalGesture) {
        const newTranslateY = ctx.startY + event.translationY;
        if (newTranslateY <= COLLAPSED_TRANSLATE && newTranslateY >= EXPANDED_TRANSLATE) {
          translateY.value = newTranslateY;
        }
      }
    },
    onEnd: (event) => {
      const velocityThreshold = -800;
      const positionThreshold = EXPANDED_TRANSLATE / 2;
      const shouldExpand =
        event.velocityY < velocityThreshold || translateY.value < positionThreshold;

      translateY.value = withSpring(shouldExpand ? EXPANDED_TRANSLATE : COLLAPSED_TRANSLATE, {
        damping: 20,
        stiffness: 150,
        mass: 1,
      });
      isExpanded.value = shouldExpand;
    },
  });

  const toggleDropdown = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // Toggle sort dropdown visibility
  const toggleSortDropdown = () => {
    setIsSortDropdownVisible(!isSortDropdownVisible);
  };

  // Handle sort option selection
  const handleSortOption = (option) => {
    setSelectedSortOption(option);
    console.log(`Selected sort option: ${option}`);
    setIsSortDropdownVisible(false);
  };

  // Close dropdown on outside click
  const handleOutsideClick = () => {
    if (isSortDropdownVisible) {
      setIsSortDropdownVisible(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleOutsideClick}>
      <SafeAreaView style={styles.container}>
        <NetworkStatusIndicator />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.leftSection}>
            <TouchableOpacity onPress={() => navigation.navigate("DashboardMain")}>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" style={{top:2}} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle]}>Accounts</Text>
          </View>
          <DateFilter />
          <TouchableOpacity style={styles.menuButton}>
            <Text style={[styles.menuText]}>Menu</Text>
          </TouchableOpacity>
        </View>

        {/* Chart */}
        <AccountBarChart 
          isExpanded={isExpanded} 
          dragProgress={dragProgress}
          translateY={translateY}
        />

        {/* Draggable Reports Container */}
        <PanGestureHandler
          ref={containerGestureRef}
          onGestureEvent={containerGestureHandler}
          activeOffsetY={[-15, 15]}
          failOffsetX={[-50, 50]}
        >
          <Animated.View style={[styles.rowContainer, animatedStyle]}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />

              {/* Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tab, activeTab === 'receivables' && styles.activeTab]}
                  onPress={() => {
                    setActiveTab('receivables');
                    setSelectedAmountTab('All');
                    setExpandedCard(null);
                    setIsSortDropdownVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'receivables' && styles.activeTabText,
                    ]}
                  >
                    Receivables
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tab, activeTab === 'payables' && styles.activeTab]}
                  onPress={() => {
                    setActiveTab('payables');
                    setSelectedAmountTab('All');
                    setExpandedCard(null);
                    setIsSortDropdownVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === 'payables' && styles.activeTabText,
                    ]}
                  >
                    Payables
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Title */}
              <Text style={styles.ContainerText}>
                {activeTab === 'receivables' ? 'Receivables Details' : 'Payables Details'}
              </Text>

              {/* Search + Sort */}
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by customer name"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                  />
                  <FontAwesomeIcon
                    icon={faSearch}
                    size={16}
                    color="#999"
                    style={styles.searchIcon}
                  />
                </View>
                <TouchableOpacity 
                  style={styles.sortButton} 
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleSortDropdown();
                  }}
                >
                  <Image
                    style={styles.welcomeimage}
                    source={require('../../../images/Sorting.png')}
                  />
                </TouchableOpacity>
                {/* Sort Dropdown */}
                {isSortDropdownVisible && (
                  <View style={styles.sortDropdown}>
                    <TouchableOpacity
                      style={styles.sortOption}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSortOption('High to Low');
                      }}
                    >
                      <Text 
                        style={[
                          styles.sortOptionText,
                          { color: selectedSortOption === 'High to Low' ? '#000' : '#CCC' }
                        ]}
                      >
                        High to Low
                      </Text>
                      <View
                        style={[
                          styles.sortIndicatorDot,
                          selectedSortOption === 'High to Low' && styles.selectedSortIndicatorDot
                        ]}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.sortOption}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleSortOption('Low to High');
                      }}
                    >
                      <Text 
                        style={[
                          styles.sortOptionText,
                          { color: selectedSortOption === 'Low to High' ? '#000' : '#CCC' }
                        ]}
                      >
                        Low to High
                      </Text>
                      <View
                        style={[
                          styles.sortIndicatorDot,
                          selectedSortOption === 'Low to High' && styles.selectedSortIndicatorDot
                        ]}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Amount Tabs */}
              <View style={styles.amountTabsWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.amountTabsScrollContent}
                >
                  {tabsToRender.map((tab) => (
                    <TouchableOpacity
                      key={tab.id}
                      style={[
                        styles.amountTab,
                        selectedAmountTab === tab.id && styles.selectedAmountTab,
                      ]}
                      onPress={() => setSelectedAmountTab(tab.id)}
                    >
                      <Text
                        style={[
                          styles.amountTabText,
                          selectedAmountTab === tab.id && styles.selectedAmountTabText,
                        ]}
                      >
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Show Receivables MenuCard */}
              {activeTab === 'receivables' && (
                <ImageBackground
                  source={require('../../../images/MenuCard.png')}
                  style={styles.backgroundImage}
                  imageStyle={styles.imageStyle}
                  resizeMode="stretch"
                >
                  <View style={styles.overlay}>
                    <View style={styles.OverlayHeader}>
                      <Text style={[styles.title]}>Mariappan Private Limited</Text>
                      <TouchableOpacity onPress={() => navigation.navigate('AccountDetails')}>
                        <Text style={[styles.viewMore]}>View More &gt;</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.statsContainer}>
                      <View style={styles.statItem}>
                        <View style={styles.statButton}>
                          <Text style={[styles.statLabel]}>Opening Balance</Text>
                        </View>
                        <Text style={[styles.statNumber]}>45,89,9898</Text>
                      </View>
                      <View style={styles.statItem}>
                        <View style={styles.statButton}>
                          <Text style={[styles.statLabel]}>Sales</Text>
                        </View>
                        <Text style={[styles.statNumber]}>45,89,9898</Text>
                      </View>
                      <View style={styles.statItem}>
                        <View style={styles.statButton}>
                          <Text style={[styles.statLabel]}>Closing Balance</Text>
                        </View>
                        <Text style={[styles.statNumber]}>45,89,9898</Text>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              )}

              {/* Show Payables Card */}
              {activeTab === 'payables' && (
                <View style={styles.payablesContainer}>
                  <ScrollView
                    contentContainerStyle={{ paddingBottom: 600 }}
                    showsVerticalScrollIndicator={true}
                  >
                    {payablesData.map((item) => (
                      <View key={item.id} style={styles.payablesCardWrapper}>
                        <View style={styles.payablesCard}>
                          {/* Header */}
                          <View style={styles.headerRow}>
                            <Text style={styles.payablesHeader}>{item.header}</Text>
                            <TouchableOpacity onPress={() => toggleDropdown(item.id)}>
                              <Image
                                source={require('../../../images/dropDown.png')}
                                style={[
                                  styles.icon,
                                  expandedCard === item.id && styles.rotatedIcon
                                ]}
                                resizeMode="contain"
                              />
                            </TouchableOpacity>
                          </View>

                          <View style={styles.line} />

                          {/* Labels */}
                          <View style={styles.row}>
                            <Text style={styles.label}>Outstanding Amount</Text>
                            <Text style={styles.labelText}>Total Bills</Text>
                          </View>

                          {/* Values */}
                          <View style={styles.row}>
                            <Text style={styles.payablesAmount}>₹ {item.outstanding}</Text>
                            <Text style={styles.totalBills}>{item.totalBills}</Text>
                          </View>
                        </View>

                        {/* Dropdown List as Separate Cards */}
                        {expandedCard === item.id && (
                          <View style={styles.dropdownContainer}>
                            <ScrollView
                              style={styles.dropdownScrollView}
                              nestedScrollEnabled={true}
                              showsVerticalScrollIndicator={true}
                            >
                              {generateDropdownData(item.id).map((dropdownItem) => (
                                <View key={dropdownItem.id} style={styles.dropdownCard}>
                                  <View style={styles.avatarContainer}>
                                    <View style={styles.avatar}>
                                      <Text style={styles.avatarText}>
                                        {dropdownItem.name.charAt(0)}
                                      </Text>
                                    </View>
                                  </View>
                                  <View style={styles.dropdownContent}>
                                    <Text style={styles.dropdownName}>{dropdownItem.name}</Text>
                                    <View style={styles.dropdownRightContent}>
                                      <Text style={styles.dropdownLabel}>Outstanding Amount</Text>
                                      <Text style={styles.dropdownAmount}>₹ {dropdownItem.amount}</Text>
                                    </View>
                                  </View>
                                  <TouchableOpacity style={styles.arrowButton} onPress={() => navigation.navigate('PayablesDetails')}>
                                    <FontAwesomeIcon icon={faArrowCircleRight} size={20} color="white" />
                                  </TouchableOpacity>
                                </View>
                              ))}
                            </ScrollView>
                          </View>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

            </View>
          </Animated.View>
        </PanGestureHandler>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  leftSection: { flexDirection: "row", alignItems: "center" },
  headerTitle: { 
    marginLeft: 10,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color: '#000',
    fontSize: 20 
  },
  menuButton: {
    backgroundColor: "#333333",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    top: 3
  },
  menuText: { 
    color: "#fff",
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12 
  },
  rowContainer: {
    position: 'absolute',
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    top: 350,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    paddingTop: 10,
  },
  dragHandleContainer: { 
    width: '100%', 
    alignItems: 'center', 
    paddingVertical: 12 
  },
  dragHandle: { 
    width: 40, 
    height: 5, 
    backgroundColor: '#ccc', 
    borderRadius: 3, 
    marginBottom: 4 
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    padding: 2,
    marginVertical: 18,
    marginHorizontal: 25,
  },
  tab: { 
    flex: 1, 
    paddingVertical: 8, 
    alignItems: 'center', 
    borderRadius: 20 
  },
  activeTab: { 
    backgroundColor: '#4A90E2' 
  },
  tabText: { 
    color: '#666666', 
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  activeTabText: { 
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  ContainerText: {
    color: '#000', 
    fontSize: 16, 
    textAlign: 'left',
    alignSelf: 'flex-start', 
    marginLeft: 25, 
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  searchContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    marginBottom: 15,
    position: 'relative',
  },
  searchInputContainer: {
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#F5F6FA', 
    borderRadius: 25,
    paddingHorizontal: 15, 
    height: 45,
  },
  sortButton: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginLeft: 10 
  },
  welcomeimage: { 
    width: 35, 
    height: 35 
  },
  searchIcon: { 
    marginRight: 10 
  },
  searchInput: { 
    flex: 1, 
    color: '#333',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15 
  },
  sortDropdown: {
    position: 'absolute',
    top: 45,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D0CCCC',
    zIndex: 1000,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sortOptionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    right: 7
  },
  sortIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    top: 2,
    left: 5
  },
  selectedSortIndicatorDot: {
    backgroundColor: '#4A90E2',
  },
  amountTabsWrapper: { 
    width: '100%', 
    paddingHorizontal: 10, 
    marginBottom: 15 
  },
  amountTabsScrollContent: { 
    paddingRight: 20 
  },
  amountTab: {
    backgroundColor: '#F5F6FA',
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 0.75,
    borderColor: '#A9A6A6',
    height: 30,
  },
  selectedAmountTab: { 
    backgroundColor: '#4A90E2', 
    borderColor: '#4A90E2' 
  },
  amountTabText: { 
    fontSize: 14, 
    color: '#A9A6A6',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12 
  },
  selectedAmountTabText: { 
    color: '#FFFFFF',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12 
  },
  backgroundImage: { 
    width: '100%', 
    height: 130, 
    justifyContent: 'center', 
    top: 20 
  },
  imageStyle: { 
    borderRadius: 12 
  },
  overlay: { 
    flex: 1, 
    padding: 8, 
    justifyContent: 'space-between', 
    borderRadius: 12 
  },
  OverlayHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 12,
  },
  title: { 
    marginLeft: 16,
    color: '#000',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16 
  },
  viewMore: { 
    marginRight: 0, 
    marginBottom: 15, 
    bottom: 5, 
    color: '#666',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12 
  },
  statsContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center', 
    paddingHorizontal: 2,
  },
  statItem: { 
    flex: 1, 
    alignItems: 'center' 
  },
  statButton: { 
    backgroundColor: '#fff', 
    paddingHorizontal: 6, 
    paddingVertical: 4, 
    borderRadius: 12, 
    marginBottom: 6,
    bottom: 15 
  },
  statLabel: { 
    color: '#4A90E2', 
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10,
  },
  statNumber: { 
    color: '#000',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 15,
    bottom: 15,
    right: 1 
  },
  payablesContainer: {
    flex: 0,
    width: '95%',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  payablesCardWrapper: {
    width: '100%',
    marginBottom: 10,
    alignSelf: 'center',
  },
  payablesCard: {
    width: '100%',
    backgroundColor: '#F4F9FF',
    padding: 12,
    borderRadius: 20,
    borderColor: '#9CC5FB',
    borderWidth: 1,
    height: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  payablesHeader: { 
    fontSize: 18, 
    color: '#000',
    flex: 1,
    fontFamily: 'PlusJakartaSans-SemiBold',
    bottom: 5
  },
  icon: {
    width: 30,
    height: 30,
    left: 2,
    transform: [{ rotate: '0deg' }],
  },
  rotatedIcon: {
    transform: [{ rotate: '180deg' }],
  },
  line: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#9CC5FB',
    marginBottom: 5,
    bottom: 10,
    right: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 5,
  },
  label: {
    color: '#666',
    flex: 1,
    bottom: 8,
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10
  },
  labelText: {
    color: '#666',
    textAlign: 'left',
    flex: 1,
    bottom: 8,
    left: 10,
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 12
  },
  payablesAmount: { 
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#000', 
    flex: 1,
    bottom: 15
  },
  totalBills: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
    flex: 1,
    bottom: 5,
    left: 10,
    bottom: 15
  },
  dropdownContainer: {
    borderRadius: 15,
    marginTop: 5,
    maxHeight: 300,
  },
  dropdownScrollView: {
    maxHeight: 300,
  },
  dropdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 5,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 6
  },
  avatarText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 30,
    color: '#ccc',
  },
  dropdownContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownName: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
    flex: 1,
  },
  dropdownLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  dropdownAmount: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    right: 11
  },
  dropdownRightContent: {
    alignItems: 'flex-end',
  },
  arrowButton: {
    padding: 5,
    marginLeft: 10,
    backgroundColor: "#ccc",
    borderRadius: 30,
    width: 30,
    height: 30
  },
});

export default AccountsDB;