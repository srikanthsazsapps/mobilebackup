import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import NetworkStatusIndicator from '../New_Desion/NetworkStatusIndicator'; // Add this import

const { width, height } = Dimensions.get('window');

//Images for reusability
const IMAGES = {
  accounts: require('../images/2.jpg'),
  // audit: require('../images/bill.png'),
  // asset: require('../images/bill.png'),
  // production: require('../images/bill.png'),
  // purchase: require('../images/bill.png'),
  // profit_loss: require('../images/bill.png'),
  // sales: require('../images/bill.png'),
  // trend_analysis: require('../images/bill.png'),
  // profit: require('../images/bill.png'),
};

const DashboardMain = ({ navigation }) => {
  // Compact card definitions
  const cardData = [
    ['Accounts', 'accounts', 'AccountsDashBoard'],
    ['Audit', 'audit', 'AuditDashBoard'],
    ['Asset', 'asset', 'AssetsDash'],
    ['Production', 'production', 'ProductionDashBoard'],
    ['Purchase', 'purchase', 'PurchaseDashBoard'],
    ['Profit & Loss', 'profit_loss', 'ProfitlLoss'],
    ['Sales', 'sales', 'SalesDashBoard'],
    ['TrendAnalysis', 'trend_analysis', 'TrendAnalysisDashBoard'],
    ['Profit', 'profit', 'ProfitDashBoard'],
    ['Profit & Loss', 'profit_loss', 'ProfitLossDashBoard2'],
    ['Sales', 'sales', 'SalesDashBoard2'],
    ['TrendAnalysis', 'trend_analysis', 'TrendAnalysisDashBoard2'],
    ['Profit', 'profit', 'ProfitDashBoard2'],
    ['Sales', 'sales', 'SalesDashBoard3'],
    ['TrendAnalysis', 'trend_analysis', 'TrendAnalysisDashBoard3'],
    ['Profit', 'profit', 'ProfitDashBoard3'],
  ];

  // Generate reportCards from cardData
  const reportCards = cardData.map(([title, imageKey, screenName], index) => ({
    id: index + 1,
    title,
    image: IMAGES[imageKey],
    subtitle: '',
    screenName,
  }));

  const handleCardPress = (card) => {
    if (navigation && card.screenName) {
      // Direct navigation to individual screens
      navigation.navigate(card.screenName, { 
        title: card.title,
        cardId: card.id 
      });
    } else {
      console.log(`Navigating to ${card.title} screen`);
    }
  };

  const ReportCard = ({ title, image, onPress }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <Image source={image} style={styles.cardImage} resizeMode="contain" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Network Status Indicator */}
      <NetworkStatusIndicator />
      
      {/* <StatusBar barStyle="dark-content" backgroundColor="#D3E9FF" /> */}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Image
                source={require('../images/sazs.png')}
                style={styles.profileImage}
            />
            <Image
                // source={require('../images/logotext.png')}
                style={styles.logoText}
            />
          </View>
        </View>
       <View style={styles.headerActions}>
          <TouchableOpacity style={styles.howWorksButton}>
            <Text style={styles.howWorksText}>How Works</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

       <View style={styles.FilterContainer}>
        <View style={styles.filterrow}>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Yesterday</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Week</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Month</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>Custom</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Pie Chart Space */}
        <View style={styles.chartSpace}>
          {/* <Text style={styles.chartPlaceholder}>Pie Chart Area</Text> */}
        </View>
      </View>

      <View style={styles.rowContainer}>
        <Text style={styles.sectionTitle}>See all reports here</Text>
        
        {/* Scrollable Grid Container */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={[styles.scrollContent,{paddingBottom:40}]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {Array.from({ length: Math.ceil(reportCards.length / 3) }, (_, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {reportCards.slice(rowIndex * 3, (rowIndex + 1) * 3).map((card) => (
                  <ReportCard 
                    key={card.id} 
                    title={card.title} 
                    image={card.image} 
                    onPress={() => handleCardPress(card)}
                  />
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#D3E9FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 25,
    // backgroundColor: '#D3E9FF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40
  },
  logoIcon: {
    marginRight: 8,
  },
  logoText: {
    width: 100,
    height: 30,
    resizeMode: 'contain',
  },
  profileImage: {
    width: 26,
    height: 20,
    marginLeft:40
  },
  brandText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  howWorksButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: -40
  },
  howWorksText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  notificationButton: {
    width: 30,
    height: 30,
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -40
  },
  notificationIcon: {
    fontSize: 15,
  },
  rowContainer: {
    flex:1,
    height: height * 0.5,
    backgroundColor: '#ffffff',
    borderTopRightRadius: 40,
    borderTopLeftRadius: 40,
    marginTop: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 30,
    marginBottom: 20,
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  FilterContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  filterrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    paddingHorizontal: 10,
  },
  filterButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '500',
  },
  grid: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
    height: 80,
  },
  card: {
    width: '31%',
    backgroundColor: '#F4E6D4',
    borderRadius: 12,
    // Add subtle shadow for better UX
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  cardImage: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});

export default DashboardMain;
