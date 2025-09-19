import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const { width } = Dimensions.get("window");

// Individual Carousel Card Component with better transformation
const CarouselCard = ({ item, index }) => {
  return (
    <View
      style={[
        styles.carouselCard,
        {
          backgroundColor: item.backgroundColor,
          zIndex: 10 - index, // Higher z-index for front cards
          marginTop: index * -25, // Negative margin to stack cards
          marginLeft: index * 1, // Slight horizontal offset
          marginRight: index * 8, // Slight horizontal offset from right
          opacity: index === 0 ? 1 : 0.85,
          transform: [
            { scale: 1 - (index * 0.03) }, // Slight scale reduction for depth
            { translateY: index * 8 }, // Vertical offset
          ],
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <TouchableOpacity>
          <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.cardTitle}>{item.title}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <View style={styles.stockButton}>
          <Text style={styles.stockButtonText}>Available Stock</Text>
        </View>
        <View style={styles.stockButton}>
          <Text style={styles.stockButtonText}>Used Stock</Text>
        </View>
      </View>
      <View style={styles.stockDataContainer}>
        <View style={styles.stockColumn}>
          <View style={styles.stockIndicator} />
          <Text style={styles.stockValue}>{item.availableStock}</Text>
          <Text style={styles.stockAmount}>{item.availableCurrency}</Text>
        </View>
        <View style={styles.stockColumn}>
          <View style={styles.stockIndicator} />
          <Text style={styles.stockValue}>{item.usedStock}</Text>
          <Text style={styles.stockAmount}>{item.usedCurrency}</Text>
        </View>
      </View>
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Image
            source={item.icon}
            style={styles.cardIcon}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

// Alternative Card Stack Component using different approach
const StackedCarouselCards = ({ carouselData }) => {
  return (
    <View style={styles.stackContainer}>
      {carouselData.map((item, index) => (
        <View
          key={item.id}
          style={[
            styles.stackedCard,
            {
              backgroundColor: item.backgroundColor,
              zIndex: carouselData.length - index,
              top: index * 12,
              left: index * 6,
              right: index * 6,
              opacity: index === 0 ? 1 : 0.8,
              transform: [{ scale: 1 - index * 0.025 }],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <TouchableOpacity>
              <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <View style={styles.stockButton}>
              <Text style={styles.stockButtonText}>Available Stock</Text>
            </View>
            <View style={styles.stockButton}>
              <Text style={styles.stockButtonText}>Used Stock</Text>
            </View>
          </View>
          <View style={styles.stockDataContainer}>
            <View style={styles.stockColumn}>
              <View style={styles.stockIndicator} />
              <Text style={styles.stockValue}>{item.availableStock}</Text>
              <Text style={styles.stockAmount}>{item.availableCurrency}</Text>
            </View>
            <View style={styles.stockColumn}>
              <View style={styles.stockIndicator} />
              <Text style={styles.stockValue}>{item.usedStock}</Text>
              <Text style={styles.stockAmount}>{item.usedCurrency}</Text>
            </View>
          </View>
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Image
                source={item.icon}
                style={styles.cardIcon}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

// Main Scrollable Carousel Component
const ScrollableCarouselComponent = React.memo(({ isVisible }) => {
  const carouselData = [
    {
      id: 1,
      title: "Diesel Usage",
      availableStock: "1000.46 Liter",
      availableCurrency: "₹92,390.00",
      usedStock: "400.46 Liter",
      usedCurrency: "₹36,998.49",
      backgroundColor: "#4A90E2",
      // icon: require("../../../images/DieselImg.png"),
    },
    {
      id: 2,
      title: "Explosive Usage",
      availableStock: "250 Ton",
      availableCurrency: "₹1,50,000.00",
      usedStock: "100 Ton",
      usedCurrency: "₹60,000.00",
      backgroundColor: "#7B68EE",
      // icon: require("../../../images/ExplosiveImg.png"),
    },
    {
      id: 3,
      title: "Explosive Usage",
      availableStock: "250 Ton",
      availableCurrency: "₹1,50,000.00",
      usedStock: "100 Ton",
      usedCurrency: "₹60,000.00",
      backgroundColor: "#7B68EE",
      // icon: require("../../../images/ExplosiveImg.png"),
    },
    {
      id: 4,
      title: "Explosive Usage",
      availableStock: "250 Ton",
      availableCurrency: "₹1,50,000.00",
      usedStock: "100 Ton",
      usedCurrency: "₹60,000.00",
      backgroundColor: "#7B68EE",
      // icon: require("../../../images/ExplosiveImg.png"),
    },
  ];

  return (
    <View style={[styles.carouselContainer, { display: isVisible ? "flex" : "none" }]}>
      <Text style={styles.sectionTitle}>Production Carousel</Text>
      
      {/* Method 1: Using the improved individual cards */}
      <View style={styles.carouselCardsContainer}>
        {carouselData.map((item, index) => (
          <CarouselCard key={`card-${item.id}`} item={item} index={index} />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  carouselContainer: {
    paddingHorizontal: 20,
    height: 350,
    marginBottom: 20,
    top: 250,
  },
  carouselCardsContainer: {
    height: 280,
    position: "relative",
  },
  carouselCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    height: 250,
    width: width - 40,
  },
  // Alternative stack styles
  stackContainer: {
    height: 280,
    position: "relative",
  },
  stackedCard: {
    position: "absolute",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    height: 250,
    width: "100%",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25,
  },
  stockButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stockButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  stockDataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  stockColumn: {
    alignItems: "center",
    flex: 1,
  },
  stockIndicator: {
    width: 8,
    height: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
    marginBottom: 12,
  },
  stockValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  stockAmount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "500",
  },
  iconContainer: {
    position: "absolute",
    alignContent:'flex-end',
    justifyContent:'flex-end',
    bottom: 20,
    right:1,
  },
  iconBackground: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIcon: {
    width: 30,
    height: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
    bottom: 6,
  },
});

export default ScrollableCarouselComponent;
