import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as lucide from 'lucide-react-native';

import { DataContext } from '../components/common/DataContext';
import { getStoredData } from '../components/common/AsyncStorage';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const MenuGrid = ({ menuData, searchQuery = '' }) => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const sectionLayoutsRef = useRef({});
  
  const { selectedCompany } = useContext(DataContext);
  
  const [webkey, setWebkey] = useState('');
  
  const parsedMenuData =
    typeof menuData === 'string' ? JSON.parse(menuData) : menuData || [];

  useEffect(() => {
    const getWebkey = async () => {
      try {
        const localData = await getStoredData('CompanyDetails');
        if (localData && localData.length > 0) {
          if (selectedCompany === 0) {
            setWebkey(localData[0].Webkey);
          } else {
            const selectedItem = localData.find(val => val.id === selectedCompany);
            if (selectedItem) {
              setWebkey(selectedItem.Webkey);
            } else {
              setWebkey(localData[0].Webkey);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching Webkey:', error);
      }
    };

    getWebkey();
  }, [selectedCompany]); 

  const groupedMenus = parsedMenuData.reduce((acc, item) => {
    if (!item || !item.MNA) return acc;

    const sectionName = item.MNA.trim();
    if (!acc[sectionName]) {
      acc[sectionName] = [];
    }
    acc[sectionName].push(item);
    return acc;
  }, {});

  const initialCollapsedState = Object.keys(groupedMenus).reduce(
    (acc, sectionName) => {
      acc[sectionName] = true;
      return acc;
    },
    {}
  );

  const [collapsedSections, setCollapsedSections] = useState(initialCollapsedState);
  const [expandedSection, setExpandedSection] = useState(null);
  const windowHeight = Dimensions.get('window').height;

  // Icon mapping for sections
  const iconMap = {
    Sales: lucide.BadgeIndianRupee,
    Supplier: lucide.Users,
    Customer: lucide.Users,
    Employee: lucide.BookUser,
    Purchase: lucide.ShoppingCart,
    Accounts: lucide.FileText,
    Settings: lucide.Settings,
    Masters: lucide.Cog,
    Reports: lucide.FileText,
    Operations: lucide.Home,
    Inventory: lucide.Database,
    Vehicle: lucide.Truck,
    Diesel: lucide.Fuel,
    Pass: lucide.ShieldCheck,
    Weighment: lucide.Home,
    Conversation: lucide.Home,
    Discount: lucide.BadgePercent,
    Product: lucide.Package,
    Default: lucide.Home,
  };

  const handleSectionLayout = (sectionName, event) => {
    const { y, height } = event.nativeEvent.layout;
    sectionLayoutsRef.current[sectionName] = { y, height };
  };

  const toggleCollapse = (sectionName) => {
    // Configure animation
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    const newCollapsedState = { ...initialCollapsedState };
    newCollapsedState[sectionName] = collapsedSections[sectionName];
    
    const isCurrentlyCollapsed = collapsedSections[sectionName];
    
    setCollapsedSections(prev => ({
      ...newCollapsedState,
      [sectionName]: !prev[sectionName]
    }));

    setExpandedSection(prev => prev === sectionName ? null : sectionName);
    
    if (isCurrentlyCollapsed) {
      setTimeout(() => {
        if (scrollViewRef.current && sectionLayoutsRef.current[sectionName]) {
          const { y } = sectionLayoutsRef.current[sectionName];
          const centerPosition = Math.max(0, y - (windowHeight / 4));
          
          scrollViewRef.current.scrollTo({
            y: centerPosition,
            animated: true,
          });
        }
      }, 300); // Give time for the animation to start
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const filteredMenus = filterMenuData(searchQuery);
      const newCollapsedState = { ...initialCollapsedState };

      // Expand all sections that have matching items
      Object.keys(filteredMenus).forEach(section => {
        newCollapsedState[section] = false;
      });

      // Use LayoutAnimation for smooth transitions
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCollapsedSections(newCollapsedState);

      // If only one section matches, set it as the expanded section
      const matchingSections = Object.keys(filteredMenus);
      if (matchingSections.length === 1) {
        setExpandedSection(matchingSections[0]);
      } else {
        setExpandedSection(null);
      }
    } else {
      // Reset to initial collapsed state when search is cleared
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCollapsedSections(initialCollapsedState);
      setExpandedSection(null);
    }
  }, [searchQuery]);

  // Filter menu data based on search query
  const filterMenuData = (query) => {
    if (!query) return groupedMenus;

    const filteredMenus = {};

    Object.keys(groupedMenus).forEach((sectionName) => {
      // Check if section name matches search query
      const sectionMatches = sectionName.toLowerCase().includes(query.toLowerCase());

      // Check if any submenu matches search query
      const filteredItems = groupedMenus[sectionName].filter((item) =>
        item.SMA.toLowerCase().includes(query.toLowerCase())
      );

      // Include section if name matches or has matching items
      if (sectionMatches || filteredItems.length > 0) {
        filteredMenus[sectionName] = sectionMatches ? groupedMenus[sectionName] : filteredItems;
      }
    });

    return filteredMenus;
  };

  // Render a menu section
  const renderMenuSection = (sectionName, items) => {
    const SectionIcon = iconMap[sectionName] || iconMap['Default'];
    const isCollapsed = collapsedSections[sectionName];
    const isExpanded = expandedSection === sectionName;

    return (
      <View 
        key={sectionName} 
        style={styles.sectionContainer}
        onLayout={(event) => handleSectionLayout(sectionName, event)}
      >
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => toggleCollapse(sectionName)}>
          <SectionIcon color="#2563EB" size={22} />
          <Text style={styles.sectionTitle}>{sectionName}</Text>
          {isCollapsed ? (
            <lucide.ChevronDown
              color="#2563EB"
              size={20}
              style={styles.collapseIcon}
            />
          ) : (
            <lucide.ChevronUp
              color="#2563EB"
              size={20}
              style={styles.collapseIcon}
            />
          )}
        </TouchableOpacity>

        {/* Show content if section is expanded */}
        {!isCollapsed && (
          <View style={styles.gridContainer}>
            {items.map((item, index) => {
              const SubMenuIcon = lucide[item.SMICO] || lucide.ChevronRight;

              // Highlight item if it matches search
              const isHighlighted = searchQuery &&
                (item.SMA.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  sectionName.toLowerCase().includes(searchQuery.toLowerCase()));

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.gridItem,
                    isHighlighted && styles.highlightedItem
                  ]}
                  onPress={() => {
                    // Check if webkey is available before navigation
                    if (webkey) {
                      navigation.navigate('WebView', {
                        URL: `https://${webkey}.sazss.in/${item.SNAV}`,
                      });
                    } else {
                      console.error('Webkey not available');
                      // You could show an alert or handle this error case
                    }
                  }}>
                  <SubMenuIcon color={isHighlighted ? "#fff" : "#2563EB"} size={22} />
                  <Text
                    style={[
                      styles.gridItemText,
                      isHighlighted && styles.highlightedText
                    ]}
                    numberOfLines={2}>
                    {item.SMA}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const filteredMenus = filterMenuData(searchQuery);

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {Object.keys(filteredMenus).length > 0 ? (
        Object.entries(filteredMenus).map(([sectionName, items]) =>
          renderMenuSection(sectionName, items)
        )
      ) : searchQuery ? (
        <View style={styles.noResultsContainer}>
          <Image
            source={require('../images/NoResult.png')} 
            style={styles.noResultsImage}
            resizeMode="contain"
          />
          <Text style={styles.noResultsText}>No results found</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    paddingTop: 26,
    marginTop: 15,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 28,
    paddingHorizontal: 16,
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Cabin-Bold',
    flex: 1,
    marginLeft: 10,
    color: 'black',
  },
  collapseIcon: {
    marginLeft: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '20%',
    marginHorizontal: '2.5%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gridItemText: {
    marginTop: 6,
    color: '#000000',
    fontSize: 10,
    fontFamily: 'Cabin-Bold',
    textAlign: 'center',
  },
  highlightedItem: {
    backgroundColor: '#3E89EC',
  },
  highlightedText: {
    color: '#FFFFFF',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  noResultsImage: {
    width: 120,
    height: 120,
    // marginBottom: 10,
  },
  noResultsText: {
    fontSize: 16,
    color: '#555',
  },
});

export default MenuGrid;