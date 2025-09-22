import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Donut Chart Component with Lines and Labels
const QuarryDonutChart = ({ data, size = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate angles and positions for each segment
  let currentAngle = -90; // Start from top
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const midAngle = currentAngle + angle / 2;
    
    const segment = {
      ...item,
      angle,
      startAngle: currentAngle,
      midAngle,
      percentage: percentage.toFixed(1),
    };
    currentAngle += angle;
    return segment;
  });

  const outerRadius = size / 2 - 10;
  const innerRadius = outerRadius * 0.6;
  const strokeWidth = outerRadius - innerRadius;

  // Calculate label positions
  const getLabelPosition = (midAngle, isOuter = false) => {
    const radius = isOuter ? outerRadius + 30 : outerRadius + 15;
    const radian = (midAngle * Math.PI) / 180;
    return {
      x: size / 2 + radius * Math.cos(radian),
      y: size / 2 + radius * Math.sin(radian),
    };
  };

  return (
    <View style={[styles.donutContainer, { width: size + 120, height: size + 60 }]}>
      {/* Donut Chart */}
      <View style={[styles.donutChart, { width: size, height: size }]}>
        {/* Background circle */}
        <View style={[
          styles.donutBackground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: '#F0F0F0',
          }
        ]} />
        
        {/* Colored segments */}
        {segments.map((segment, index) => {
          const { startAngle, angle, color } = segment;
          // Simplified segment representation
          if (index === 0) {
            return (
              <View
                key={index}
                style={[
                  styles.donutSegment,
                  {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderTopColor: color,
                    borderRightColor: color,
                    borderBottomColor: 'transparent',
                    borderLeftColor: 'transparent',
                    transform: [{ rotate: '0deg' }],
                  }
                ]}
              />
            );
          } else if (index === 1) {
            return (
              <View
                key={index}
                style={[
                  styles.donutSegment,
                  {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderTopColor: 'transparent',
                    borderRightColor: 'transparent',
                    borderBottomColor: color,
                    borderLeftColor: color,
                    transform: [{ rotate: '0deg' }],
                  }
                ]}
              />
            );
          } else {
            return (
              <View
                key={index}
                style={[
                  styles.donutSegment,
                  {
                    position: 'absolute',
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderTopColor: 'transparent',
                    borderRightColor: color,
                    borderBottomColor: 'transparent',
                    borderLeftColor: 'transparent',
                    transform: [{ rotate: '45deg' }],
                  }
                ]}
              />
            );
          }
        })}
        
        {/* Center circle with total */}
        <View style={[
          styles.donutCenter,
          {
            width: innerRadius * 2,
            height: innerRadius * 2,
            borderRadius: innerRadius,
          }
        ]}>
          <Text style={styles.donutCenterTitle}>Total Sales</Text>
          <Text style={styles.donutCenterValue}>₹{(total / 1000).toFixed(0)}K</Text>
          <Text style={styles.donutCenterSubText}>This Month</Text>
        </View>
      </View>
      
      {/* Labels with lines */}
      <View style={styles.labelsContainer}>
        {segments.map((segment, index) => {
          const labelPos = getLabelPosition(segment.midAngle);
          const lineStartPos = getLabelPosition(segment.midAngle - 10, false);
          
          return (
            <View key={`label-${index}`} style={styles.labelGroup}>
              {/* Line from donut to label */}
              <View
                style={[
                  styles.labelLine,
                  {
                    position: 'absolute',
                    left: lineStartPos.x,
                    top: lineStartPos.y,
                    width: 25,
                    height: 1,
                    backgroundColor: segment.color,
                    transform: [
                      { 
                        rotate: `${segment.midAngle > 90 && segment.midAngle < 270 ? 
                          segment.midAngle + 180 : segment.midAngle}deg` 
                      }
                    ],
                  }
                ]}
              />
              
              {/* Label */}
              <View
                style={[
                  styles.label,
                  {
                    position: 'absolute',
                    left: labelPos.x - 40,
                    top: labelPos.y - 20,
                    alignItems: labelPos.x > size / 2 ? 'flex-start' : 'flex-end',
                  }
                ]}
              >
                <Text style={[styles.labelText, { color: segment.color }]}>
                  {segment.label}
                </Text>
                <Text style={styles.labelValue}>
                  {segment.unit === '₹' ? 
                    `₹${(segment.value / 1000).toFixed(0)}K` : 
                    `${segment.value} ${segment.unit}`
                  }
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const Dashboard = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Sales');

  // Quarry and Crusher Sales Data
  const quarrySalesData = [
    { label: 'Cash Sales', value: 450000, color: '#4CAF50', unit: '₹' },
    { label: 'Credit Sales', value: 280000, color: '#FF9800', unit: '₹' },
    { label: 'Total MT', value: 1250, color: '#2196F3', unit: 'MT' },
  ];

  const dashboardItems = [
    { id: 1, title: 'Cash Sales', emoji: '💵', color: '#4CAF50', bgColor: '#E8F5E8' },
    { id: 2, title: 'Credit Sales', emoji: '📋', color: '#FF9800', bgColor: '#FFF3E0' },
    { id: 3, title: 'Production', emoji: '⚙️', color: '#2196F3', bgColor: '#E3F2FD' },
    { id: 4, title: 'Inventory', emoji: '📦', color: '#9C27B0', bgColor: '#F3E5F5' },
    { id: 5, title: 'Trucks', emoji: '🚛', color: '#FF5722', bgColor: '#FFEBEE' },
    { id: 6, title: 'Expenses', emoji: '💰', color: '#795548', bgColor: '#EFEBE9' },
    { id: 7, title: 'Quality', emoji: '✅', color: '#009688', bgColor: '#E0F2F1' },
  ];

  const additionalItems = [
    { id: 8, title: 'Analytics', emoji: '📈', color: '#3F51B5', bgColor: '#E8EAF6' },
    { id: 9, title: 'Settings', emoji: '⚙️', color: '#607D8B', bgColor: '#ECEFF1' },
    { id: 10, title: 'Workers', emoji: '👷', color: '#E91E63', bgColor: '#FCE4EC' },
    { id: 11, title: 'Support', emoji: '🎧', color: '#00BCD4', bgColor: '#E0F7FA' },
    { id: 12, title: 'Backup', emoji: '💾', color: '#8BC34A', bgColor: '#F1F8E9' },
    { id: 13, title: 'Security', emoji: '🔒', color: '#FFC107', bgColor: '#FFFDE7' },
  ];

  const DashboardCard = ({ item, onPress }) => (
    <TouchableOpacity style={[styles.card, { backgroundColor: item.bgColor }]} onPress={onPress}>
      <Text style={styles.cardEmoji}>{item.emoji}</Text>
      <Text style={[styles.cardTitle, { color: item.color }]}>{item.title}</Text>
    </TouchableOpacity>
  );

  const SeeAllCard = () => (
    <TouchableOpacity 
      style={[styles.card, styles.seeAllCard]} 
      onPress={() => setModalVisible(true)}
    >
      <Text style={styles.seeAllEmoji}>➕</Text>
      <Text style={styles.seeAllTitle}>See All</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1976D2" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quarry Dashboard</Text>
        <TouchableOpacity style={styles.profileIcon}>
          <Text style={styles.profileEmoji}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dashboard Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.grid}>
            {dashboardItems.slice(0, 4).map((item) => (
              <DashboardCard key={item.id} item={item} />
            ))}
          </View>
          <View style={styles.grid}>
            {dashboardItems.slice(4, 7).map((item) => (
              <DashboardCard key={item.id} item={item} />
            ))}
            <SeeAllCard />
          </View>
        </View>

        {/* Sales Performance Tabs */}
        <View style={styles.section}>
          <View style={styles.tabContainer}>
            {['Sales', 'Production', 'Analytics'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chart and Stats */}
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Sales Overview</Text>
            
            <View style={styles.chartContainer}>
              <QuarryDonutChart data={quarrySalesData} size={200} />
            </View>

            {/* Statistics */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Daily Avg</Text>
                <Text style={styles.statValue}>₹24K</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>This Week</Text>
                <Text style={styles.statValue}>₹168K</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Target</Text>
                <Text style={styles.statValue}>₹800K</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            <View style={styles.activityItem}>
              <Text style={styles.activityEmoji}>💵</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Cash sale: ₹45,000 - 150 MT</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityEmoji}>🚛</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Truck dispatched - Load #TR001</Text>
                <Text style={styles.activityTime}>4 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityEmoji}>📋</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Credit sale: ₹28,000 - ABC Corp</Text>
                <Text style={styles.activityTime}>6 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Text style={styles.activityEmoji}>⚙️</Text>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Crusher maintenance completed</Text>
                <Text style={styles.activityTime}>8 hours ago</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>All Dashboards</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalGrid}>
                {additionalItems.map((item) => (
                  <DashboardCard
                    key={item.id}
                    item={item}
                    onPress={() => {
                      setModalVisible(false);
                      // Handle item selection
                    }}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#1976D2',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileEmoji: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    width: (width - 55) / 4,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  seeAllCard: {
    backgroundColor: '#E0E0E0',
  },
  seeAllEmoji: {
    fontSize: 24,
    color: '#757575',
    marginBottom: 5,
  },
  seeAllTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#757575',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#1976D2',
  },
  tabText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  chartSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  donutContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutChart: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutBackground: {
    position: 'absolute',
  },
  donutSegment: {
    position: 'absolute',
  },
  segmentArc: {
    position: 'absolute',
  },
  donutCenter: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    zIndex: 10,
  },
  donutCenterTitle: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 2,
  },
  donutCenterValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  donutCenterSubText: {
    fontSize: 10,
    color: '#999',
  },
  labelsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  labelGroup: {
    position: 'relative',
  },
  labelLine: {
    backgroundColor: '#333',
    zIndex: 5,
  },
  label: {
    zIndex: 6,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  labelValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#757575',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#757575',
  },
  modalContent: {
    padding: 20,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default Dashboard;