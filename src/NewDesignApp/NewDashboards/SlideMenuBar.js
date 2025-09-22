import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft,faArrowRight } from '@fortawesome/free-solid-svg-icons';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SlideMenuBar = ({ isVisible, onClose }) => {
  const slideAnim = useRef(new Animated.Value(320)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [activeItem, setActiveItem] = useState(null);
  const [shouldRender, setShouldRender] = useState(false);

  const dashboardItems = [
    { 
      id: 1, 
      title: "Account", 
      icon: "💼", 
      description: "Manage accounts & balances"
    },
    { 
      id: 2, 
      title: "Audit", 
      icon: "🔍", 
      description: "Audit trails & reports"
    },
    { 
      id: 3, 
      title: "Asset", 
      icon: "🏢", 
      description: "Asset management"
    },
    { 
      id: 4, 
      title: "Purchase", 
      icon: "🛒", 
      description: "Purchase orders & invoices"
    },
    { 
      id: 5, 
      title: "Production", 
      icon: "⚙️", 
      description: "Production planning"
    },
    { 
      id: 6, 
      title: "Profit & Loss", 
      icon: "📊", 
      description: "P&L statements"
    },
    { 
      id: 7, 
      title: "Sales", 
      icon: "💰", 
      description: "Sales analytics"
    },
  ];

  const supportItems = [
    { id: 1, title: "Help Center", icon: "❓" },
    { id: 2, title: "Contact Support", icon: "📞" },
  ];

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 320,
          duration: 350, // Increased duration for smoother close
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350, // Increased duration for smoother close
          useNativeDriver: true,
        }),
      ]).start((finished) => {
        if (finished) {
          setShouldRender(false);
        }
      });
    }
  }, [isVisible]);

  // Handle close with smooth animation
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 320,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start((finished) => {
      if (finished && onClose) {
        onClose();
      }
    });
  };

  if (!isVisible && !shouldRender) return null;

  const handleItemPress = (item) => {
    setActiveItem(item.id);
    setTimeout(() => setActiveItem(null), 200);
    // Add navigation logic here
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.backdrop} onPress={handleClose} />
      
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateX: slideAnim }] }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {/* <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
                        <FontAwesomeIcon icon={faArrowLeft} size={20} color="white" />
                    </TouchableOpacity> */}
              <View>
                <Text style={styles.headerTitle}>Other Dashboards</Text>
              </View>
            </View>
            
            {/* <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Quick Stats Card */}
          {/* <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Today's Overview</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>₹7.5L</Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>23</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
            </View>
          </View> */}

          {/* Dashboard Items */}
          <View style={styles.section}>
            {/* <Text style={styles.sectionTitle}>
              <Text style={styles.sectionIcon}>🚀</Text> Dashboards
            </Text> */}
            
            {dashboardItems.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  styles.menuItem,
                  activeItem === item.id && styles.activeMenuItem,
                  { marginTop: index === 0 ? 0 : 6 }
                ]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.8}
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemLeft}>
                    {/* <View style={styles.iconContainer}>
                      <Text style={styles.menuIcon}>{item.icon}</Text>
                    </View> */}
                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuText}>{item.title}</Text>
                      {/* <Text style={styles.menuDescription}>{item.description}</Text> */}
                    </View>
                  </View>
                  <View style={styles.menuArrow}>
                     {/* <TouchableOpacity onPress={() => navigation.navigate('DashboardMain')}>
                        <FontAwesomeIcon icon={faArrowRight} size={15} color="#3E89EC" />
                    </TouchableOpacity> */}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Text style={styles.sectionIcon}>🛠️</Text>Help & Support 
            </Text>
            
            {/* <View style={styles.supportGrid}>
              {supportItems.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.supportItem}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={styles.supportIcon}>
                    <Text style={styles.supportIconText}>{item.icon}</Text>
                  </View>
                  <Text style={styles.supportText}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View> */}
          </View>

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 260,
    height: '100%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: -5,
      height: 0,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 15,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: '#3E89EC',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
    right:5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  statsCard: {
    marginTop: 20,
    marginBottom: 25,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(62, 137, 236, 0.1)',
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3E89EC',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
  },
  statLabel: {
    fontSize: 12,
    color: '#636e72',
    marginTop: 2,
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 15,
    paddingLeft: 5,
  },
  sectionIcon: {
    marginRight: 8,
  },
  menuItem: {
    // borderRadius: 12,
    // backgroundColor: '#FFFFFF',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.06,
    // shadowRadius: 4,
    // elevation: 2,
    // borderWidth: 1,
    // borderColor: 'rgba(62, 137, 236, 0.08)',
  },
  activeMenuItem: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#F6F3ED',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: '#3E89EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 10,
  },
  menuDescription: {
    fontSize: 12,
    color: '#636e72',
  },
  menuArrow: {
    // width: 30,
    // height: 30,
    // borderRadius: 15,
    // backgroundColor: '#F6F3ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 14,
    color: '#3E89EC',
    fontWeight: '600',
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  supportItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(62, 137, 236, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  supportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3E89EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  supportIconText: {
    fontSize: 16,
  },
  supportText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#495057',
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default SlideMenuBar;