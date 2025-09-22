import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import LinearGradient from "react-native-linear-gradient";

const ProfitCard = ({ title, amount, percentage, icon, gradientColors }) => {
  const isPositive = percentage > 0;
  
  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.card}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        {/* <View style={styles.percentageContainer}>
          <Text style={styles.arrow}>{isPositive ? '↗' : '↘'}</Text>
          <Text style={styles.percentage}>
            {isPositive ? '+' : ''}{percentage}%
          </Text>
        </View> */}
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
    </LinearGradient>
  );
};

const ProfitCards = () => {
  const cardsData = [
    {
      id: 1,
      title: 'Total Profit',
      amount: '₹ 12,450',
      percentage: 8.2,
      icon: '📈',
      gradientColors: ['#4ade80', '#22c55e', '#16a34a'],
    },
    {
      id: 2,
      title: 'Total Loss',
      amount: '₹ 8,240',
      percentage: -12.5,
      icon: '💰',
      gradientColors: ['#3b82f6', '#2563eb', '#1d4ed8'],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {cardsData.map((card) => (
          <ProfitCard
            key={card.id}
            title={card.title}
            amount={card.amount}
            percentage={card.percentage}
            icon={card.icon}
            gradientColors={card.gradientColors}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    bottom:18,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  card: {
    width: 150,
    height: 140,
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    left:8
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    bottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  percentageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrow: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  percentage: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  amount: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -1,
  },
});

export default ProfitCards;