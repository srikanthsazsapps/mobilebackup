// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   Animated,
//   Dimensions,
//   StatusBar,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';

// const { width, height } = Dimensions.get('window');

// const HowItWorksScreen = ({ navigation }) => {
//   const [expandedSection, setExpandedSection] = useState(null);
//   const [animatedValues] = useState(
//     Array.from({ length: 8 }, () => new Animated.Value(0))
//   );

//   const toggleSection = (index) => {
//     const isExpanded = expandedSection === index;
//     setExpandedSection(isExpanded ? null : index);

//     Animated.timing(animatedValues[index], {
//       toValue: isExpanded ? 0 : 1,
//       duration: 300,
//       useNativeDriver: false,
//     }).start();
//   };

//   const appScreens = [
//     {
//       title: 'Welcome & Onboarding',
//       icon: 'phone-portrait-outline',
//       color: '#3B82F6',
//       description: 'Get started with personalized setup',
//       features: [
//         'Account creation and email verification',
//         'Profile setup with photo upload',
//         'Interactive app tutorial',
//         'Notification permissions setup',
//         'Location services configuration'
//       ]
//     },
//     {
//       title: 'Home Dashboard',
//       icon: 'grid-outline',
//       color: '#10B981',
//       description: 'Your main hub for all activities',
//       features: [
//         'Real-time activity feed',
//         'Quick action buttons',
//         'Personalized content recommendations',
//         'Recent activity history',
//         'Weather and location info',
//         'Daily progress tracking'
//       ]
//     },
//     {
//       title: 'Profile & Settings',
//       icon: 'person-outline',
//       color: '#8B5CF6',
//       description: 'Manage your account and preferences',
//       features: [
//         'Personal information editing',
//         'Profile photo management',
//         'Privacy and security settings',
//         'Notification preferences',
//         'Theme and appearance options',
//         'Account linking (Google, Apple, Facebook)'
//       ]
//     },
//     {
//       title: 'Search & Discovery',
//       icon: 'search-outline',
//       color: '#F59E0B',
//       description: 'Find content tailored to you',
//       features: [
//         'Smart search with autocomplete',
//         'Advanced filtering options',
//         'Category browsing',
//         'Voice search capability',
//         'Barcode scanner integration',
//         'Location-based results'
//       ]
//     },
//     {
//       title: 'Favorites & Collections',
//       icon: 'heart-outline',
//       color: '#EF4444',
//       description: 'Save and organize what you love',
//       features: [
//         'One-tap favorite saving',
//         'Custom collection creation',
//         'Share collections with friends',
//         'Offline access to saved items',
//         'Smart categorization',
//         'Export to other apps'
//       ]
//     },
//     {
//       title: 'Cart & Checkout',
//       icon: 'bag-outline',
//       color: '#06B6D4',
//       description: 'Seamless shopping experience',
//       features: [
//         'Easy quantity management',
//         'Real-time price calculations',
//         'Multiple payment options',
//         'Address book integration',
//         'Order tracking',
//         'One-click reordering'
//       ]
//     },
//     {
//       title: 'Notifications Center',
//       icon: 'notifications-outline',
//       color: '#84CC16',
//       description: 'Stay updated with important info',
//       features: [
//         'Push notification management',
//         'In-app message center',
//         'Custom alert settings',
//         'Do not disturb scheduling',
//         'Notification grouping',
//         'Archive and search history'
//       ]
//     },
//     {
//       title: 'Help & Support',
//       icon: 'help-circle-outline',
//       color: '#F97316',
//       description: 'Get help when you need it',
//       features: [
//         'FAQ with search functionality',
//         'Live chat support',
//         'Video tutorials',
//         'Contact form submission',
//         'Feedback and rating system',
//         'Community forums access'
//       ]
//     }
//   ];

//   const ScreenSection = ({ screen, index, isLast }) => {
//     const rotateZ = animatedValues[index].interpolate({
//       inputRange: [0, 1],
//       outputRange: ['0deg', '90deg'],
//     });

//     const maxHeight = animatedValues[index].interpolate({
//       inputRange: [0, 1],
//       outputRange: [0, screen.features.length * 35 + 20],
//     });

//     return (
//       <View style={[styles.sectionContainer, isLast && styles.lastSection]}>
//         <TouchableOpacity
//           style={styles.sectionHeader}
//           onPress={() => toggleSection(index)}
//           activeOpacity={0.7}
//         >
//           <View style={styles.sectionInfo}>
//             <View style={[styles.iconContainer, { backgroundColor: screen.color + '15' }]}>
//               <Ionicons name={screen.icon} size={24} color={screen.color} />
//             </View>
//             <View style={styles.sectionText}>
//               <Text style={styles.sectionTitle}>{screen.title}</Text>
//               <Text style={styles.sectionDescription}>{screen.description}</Text>
//             </View>
//           </View>
//           <Animated.View style={[styles.chevron, { transform: [{ rotateZ }] }]}>
//             <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
//           </Animated.View>
//         </TouchableOpacity>

//         <Animated.View style={[styles.expandedContent, { maxHeight }]}>
//           <View style={styles.featuresContainer}>
//             <Text style={styles.featuresTitle}>Available Features:</Text>
//             {screen.features.map((feature, featureIndex) => (
//               <View key={featureIndex} style={styles.featureItem}>
//                 <View style={[styles.bulletPoint, { backgroundColor: screen.color }]} />
//                 <Text style={styles.featureText}>{feature}</Text>
//               </View>
//             ))}
//           </View>
//         </Animated.View>
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#1F2937" />
      
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>How It Works</Text>
//         <View style={styles.headerSpacer} />
//       </View>

//       <ScrollView 
//         style={styles.scrollView}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Hero Section */}
//         <View style={styles.heroSection}>
//           <Text style={styles.heroTitle}>
//             Master Every Feature
//           </Text>
//           <Text style={styles.heroSubtitle}>
//             Discover what each screen offers and how to make the most of your app experience
//           </Text>
//         </View>

//         {/* Key Stats */}
//         <View style={styles.statsContainer}>
//           <View style={styles.statItem}>
//             <Text style={styles.statNumber}>8</Text>
//             <Text style={styles.statLabel}>Main Screens</Text>
//           </View>
//           <View style={styles.statItem}>
//             <Text style={styles.statNumber}>40+</Text>
//             <Text style={styles.statLabel}>Features</Text>
//           </View>
//           <View style={styles.statItem}>
//             <Text style={styles.statNumber}>24/7</Text>
//             <Text style={styles.statLabel}>Support</Text>
//           </View>
//         </View>

//         {/* App Screens Guide */}
//         <View style={styles.guideSectionHeader}>
//           <Text style={styles.guideTitle}>App Screen Guide</Text>
//           <Text style={styles.guideSubtitle}>
//             Tap any section to explore its features
//           </Text>
//         </View>

//         <View style={styles.sectionsContainer}>
//           {appScreens.map((screen, index) => (
//             <ScreenSection
//               key={index}
//               screen={screen}
//               index={index}
//               isLast={index === appScreens.length - 1}
//             />
//           ))}
//         </View>

//         {/* Getting Started CTA */}
//         <View style={styles.ctaContainer}>
//           <Text style={styles.ctaTitle}>Ready to Explore?</Text>
//           <Text style={styles.ctaSubtitle}>
//             Start using these features right away and discover everything our app has to offer.
//           </Text>
//           <TouchableOpacity style={styles.ctaButton}>
//             <Text style={styles.ctaButtonText}>Get Started Now</Text>
//             <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>

//         {/* Bottom Spacing */}
//         <View style={styles.bottomSpacing} />
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     backgroundColor: '#1F2937',
//     elevation: 4,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 20,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#FFFFFF',
//   },
//   headerSpacer: {
//     width: 40,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   heroSection: {
//     paddingHorizontal: 20,
//     paddingVertical: 30,
//     alignItems: 'center',
//     backgroundColor: '#FFFFFF',
//   },
//   heroTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     textAlign: 'center',
//     marginBottom: 12,
//   },
//   heroSubtitle: {
//     fontSize: 16,
//     color: '#6B7280',
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 20,
//   },
//   statsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 25,
//     marginHorizontal: 20,
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     marginTop: 20,
//     elevation: 2,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   statItem: {
//     alignItems: 'center',
//   },
//   statNumber: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#3B82F6',
//     marginBottom: 4,
//   },
//   statLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   guideSectionHeader: {
//     paddingHorizontal: 20,
//     paddingTop: 40,
//     paddingBottom: 20,
//     alignItems: 'center',
//   },
//   guideTitle: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     marginBottom: 8,
//   },
//   guideSubtitle: {
//     fontSize: 16,
//     color: '#6B7280',
//     textAlign: 'center',
//   },
//   sectionsContainer: {
//     paddingHorizontal: 20,
//   },
//   sectionContainer: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     marginBottom: 16,
//     elevation: 2,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     overflow: 'hidden',
//   },
//   lastSection: {
//     marginBottom: 0,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 20,
//   },
//   sectionInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   iconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 16,
//   },
//   sectionText: {
//     flex: 1,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 4,
//   },
//   sectionDescription: {
//     fontSize: 14,
//     color: '#6B7280',
//     lineHeight: 20,
//   },
//   chevron: {
//     marginLeft: 10,
//   },
//   expandedContent: {
//     overflow: 'hidden',
//   },
//   featuresContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   featuresTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 12,
//   },
//   featureItem: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     marginBottom: 8,
//   },
//   bulletPoint: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     marginTop: 7,
//     marginRight: 12,
//   },
//   featureText: {
//     flex: 1,
//     fontSize: 14,
//     color: '#4B5563',
//     lineHeight: 20,
//   },
//   ctaContainer: {
//     margin: 20,
//     padding: 30,
//     backgroundColor: '#3B82F6',
//     borderRadius: 20,
//     alignItems: 'center',
//   },
//   ctaTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#FFFFFF',
//     marginBottom: 8,
//     textAlign: 'center',
//   },
//   ctaSubtitle: {
//     fontSize: 16,
//     color: '#DBEAFE',
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 25,
//   },
//   ctaButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#1F2937',
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     borderRadius: 12,
//   },
//   ctaButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#FFFFFF',
//     marginRight: 8,
//   },
//   bottomSpacing: {
//     height: 30,
//   },
// });

// export default HowItWorksScreen;