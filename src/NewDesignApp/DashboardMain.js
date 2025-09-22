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
  ScrollView
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import NetworkStatusIndicator from './NetworkStatusIndicator';
import DashboardMainChart from './PieChartDesign/DashBoardMainChart';
import DateFilter from './CommonFiles/DateFilter';
// import DashboardMainChart from './PieChartDesign/DashBoardMainChart';

const { width, height } = Dimensions.get('window');
const GradientText = ({ children, style, colors = ['#2383FD', '#113768'] }) => {
    return (
        <MaskedView
            maskElement={
                <Text style={[style, { backgroundColor: 'transparent' }]}>
                    {children}
                </Text>
            }
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <Text style={[style, { opacity: 0 }]}>
                    {children}
                </Text>
            </LinearGradient>
        </MaskedView>
    );
};

//Images for reusability 
const IMAGES = {
  accounts: require('../images/bill.png'),
  audit: require('../images/bill.png'),
  asset: require('../images/bill.png'),
  production: require('../images/bill.png'),
  purchase: require('../images/bill.png'),
  profit_loss: require('../images/bill.png'),
  sales: require('../images/bill.png'),
  trend_analysis: require('../images/bill.png'),
  profit: require('../images/bill.png'),
};

// Separate ScrollableReports Component
const ScrollableReportsComponent = ({ 
  reportCards, 
  handleCardPress, 
  onScrollToTop,
  isExpanded,
  containerGestureRef 
}) => {
  const [scrollViewRef, setScrollViewRef] = React.useState(null);

  const handleScroll = (event) => {
    const { contentOffset } = event.nativeEvent;
    // Call parent's scroll to top handler when scrolled to very top
    if (contentOffset.y <= 5 && isExpanded.value) {
      onScrollToTop();
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
    <View style={styles.scrollableReportsContainer}>
      <Text style={styles.sectionTitle}>See all reports here</Text>
      
      {/* Scrollable Grid Container */}
      <ScrollView 
        ref={(ref) => setScrollViewRef(ref)}
        style={styles.scrollContainer}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: 40}]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={true}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="normal"
        overScrollMode="auto"
        scrollIndicatorInsets={{ right: 1 }}
        simultaneousHandlers={containerGestureRef}
        waitFor={containerGestureRef}
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
  );
};

const DashboardMain = ({ navigation }) => {
  const [selectedFilter,setSelectedFilter] = useState('Today');
  // Draggable animation values
  const translateY = useSharedValue(0);
  const isExpanded = useSharedValue(false);

  // Create ref for the container gesture handler
  const containerGestureRef = useRef();

  // Define positions more clearly
  const COLLAPSED_HEIGHT = height * 0.8; // 50% of screen
  const EXPANDED_HEIGHT = height * 0.90; // 95% of screen for full view
  const COLLAPSED_TRANSLATE = 0;
  const EXPANDED_TRANSLATE = -height * 0.35; // Move up to show more content

  // Compact card definit  ions
 const cardData = [
    ['Sales Order', 'purchase', 'SalesOrders'],
    ['Asset', 'asset', 'AssetsDash'],
    ['Profit&loss', 'production', 'ProfitlLoss'],
    ['Accounts', 'accounts', 'AccountsDB'],
    ['Audit', 'audit', 'AuditDashBoard'],
    ['Sales', 'sales', 'SalesReport'],

   
  ];
  // Generate reportCards from cardData
  const reportCards = cardData.map(([title, imageKey, screenName], index) => ({
    id: index + 1,
    title,
    image: IMAGES[imageKey],
    subtitle: '',
    screenName,
  }));

  const animatedStyle = useAnimatedStyle(() => {
    const progress = Math.abs(translateY.value) / Math.abs(EXPANDED_TRANSLATE);
    const currentHeight = COLLAPSED_HEIGHT + (EXPANDED_HEIGHT - COLLAPSED_HEIGHT) * progress;

    return {
      transform: [{ translateY: translateY.value }],
      height: currentHeight,
    };
  });

  // Container-wide drag gesture handler
  const containerGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
      ctx.startTime = Date.now();
    },
    onActive: (event, ctx) => {
      // Only handle gesture if it's a clear vertical movement
      const isVerticalGesture = Math.abs(event.translationY) > Math.abs(event.translationX) * 1.5;
      const isSignificantMovement = Math.abs(event.translationY) > 10;
      
      // Only proceed with drag if it's clearly a vertical gesture with significant movement
      if (isVerticalGesture && isSignificantMovement) {
        const newTranslateY = ctx.startY + event.translationY;
        if (newTranslateY <= COLLAPSED_TRANSLATE && newTranslateY >= EXPANDED_TRANSLATE) {
          translateY.value = newTranslateY;
        }
      }
    },
    onEnd: (event, ctx) => {
      const isVerticalGesture = Math.abs(event.translationY) > Math.abs(event.translationX) * 1.5;
      const isSignificantMovement = Math.abs(event.translationY) > 20;
      const isFastGesture = Math.abs(event.velocityY) > 800;
      
      // Only process as drag gesture if conditions are met
      if ((isVerticalGesture && isSignificantMovement) || isFastGesture) {
        const velocityThreshold = -800;
        const positionThreshold = EXPANDED_TRANSLATE / 2;

        const shouldExpand = event.velocityY < velocityThreshold || translateY.value < positionThreshold;

        if (shouldExpand) {
          translateY.value = withSpring(EXPANDED_TRANSLATE, {
            damping: 20,
            stiffness: 150,
            mass: 1
          });
          isExpanded.value = true;
        } else {
          translateY.value = withSpring(COLLAPSED_TRANSLATE, {
            damping: 20,
            stiffness: 150,
            mass: 1
          });
          isExpanded.value = false;
        }
      }
    }
  });

  const collapseContainer = () => {
    translateY.value = withSpring(COLLAPSED_TRANSLATE, {
      damping: 20,
      stiffness: 150,
      mass: 1
    });
    isExpanded.value = false;
  };

  // Handle scroll to top callback from scrollable component
  const handleScrollToTop = () => {
    collapseContainer();
  };

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

  return (
    <SafeAreaView style={styles.container}>
       <Image
          style={styles.welcomeimage}
          source={require('../../../sazsquarryking/src/images/blurheader.png')}
        />
      <NetworkStatusIndicator />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
    <GradientText style={styles.greetingText}>
        Good Morning
    </GradientText>
    
    <View style={styles.nameContainer}>
        <GradientText style={styles.nameText}>
            Cathrin 
        </GradientText>
        <Text style={styles.emojiText}> 👋</Text>
    </View>
</View>


        </View>
       <View style={styles.headerActions}>
         <View style={styles.filterWrapper}>
  <DateFilter style={styles.dateFilter} />
</View>

          <TouchableOpacity onPress={() => navigation.navigate('HowItWorksScreen')}style={styles.howWorksButton}>
            <Text style={styles.howWorksText}>How Works</Text>
          </TouchableOpacity>
        </View>
      </View>

      

    <DashboardMainChart 
          isExpanded={isExpanded} 
        />

      {/* Draggable Reports Container */}
      <PanGestureHandler 
        ref={containerGestureRef}
        onGestureEvent={containerGestureHandler}
        simultaneousHandlers={[]}
        shouldCancelWhenOutside={false}
        activeOffsetY={[-15, 15]}
        failOffsetX={[-50, 50]}
      >
        <Animated.View style={[styles.rowContainer, animatedStyle]}>
          {/* Drag Handle - Visual indicator */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          
          {/* Scrollable Reports Component */}
          <ScrollableReportsComponent
            reportCards={reportCards}
            handleCardPress={handleCardPress}
            onScrollToTop={handleScrollToTop}
            isExpanded={isExpanded}
            containerGestureRef={containerGestureRef}
          />
        </Animated.View>
      </PanGestureHandler>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF5',
  },
   welcomeimage: {
  position: 'absolute', // Position it as background
  top: 0,
  left: 0,
  width: '100%',
  height: 200,
  resizeMode: 'cover', // Use resizeMode instead of objectFit
  zIndex: -1, // Put it behind other content
},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 25,
    backgroundColor: 'transparent',
    bottom:20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40
  },
  logoIcon: {
    marginRight: 12,
  },
  greetingText:{
    fontSize:18,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color:'#000'
    
  },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    nameWithEmoji: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emojiText: {
        fontSize: 20, // Match or adjust based on your nameText size
        marginLeft: 5,
    },
    waveEmoji: {
        fontSize: 20,
        marginLeft: 8,
        // Ensure no color inheritance
        color: 'transparent',
        textShadowColor: '#FFCC02', // Original emoji color
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 0,
    },
  nameText:{
    fontSize:18,
    fontFamily: 'PlusJakartaSans-SemiBold',
    color:'#000'
    
  },
  logoText: {
    width: 100,
    height: 30,
    resizeMode: 'contain',
  },
  profileImage: {
    width: 26,
    height: 20,
    marginLeft: 40
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
   filterWrapper: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    top:13,
    right:10
  },
  howWorksButton: {
    backgroundColor: '#3E89EC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: -35,
    left:5
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
    marginBottom: -35
  },
  notificationIcon: {
    fontSize: 15,
  },

  rowContainer: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#ffffff',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    top: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    paddingTop: 10,
    borderColor:'#CCC',
    borderWidth:1,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    zIndex: 1000,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    marginBottom: 4,
  },
  scrollableReportsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 30,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  grid: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
    height: 90,
  },
  card: {
    width: '31%',
    backgroundColor: '#F5F6FA',
    borderRadius: 12,
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