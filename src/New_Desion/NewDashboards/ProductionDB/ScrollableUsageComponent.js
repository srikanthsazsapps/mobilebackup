import React, { useCallback } from "react";
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";

// Enhanced Usage Card Component
const EnhancedUsageCard = ({ item }) => {
  return (
    <View style={[styles.usageCard]}>
      <Text style={styles.usageTitle}>{item.title}</Text>
      <View style={styles.usageValueContainer}>
        <Text style={styles.usageValue}>{item.value}</Text>
        {item.id === 3 ? (
          <Image
            // source={require("../../../images/LaborSalary.png")}
            style={styles.usageSalaryImage}
            resizeMode="contain"
          />
        ) : (
          item.icon &&
          typeof item.icon !== "string" && (
            <Image
              source={item.icon}
              style={styles.usageImage}
              resizeMode="contain"
            />
          )
        )}
      </View>
    </View>
  );
};

// Main Scrollable Usage Details Component
const ScrollableUsageComponent = React.memo(
  ({ onScrollToTop, isExpanded, containerGestureRef, selectedFilter }) => {
    const [scrollViewRef, setScrollViewRef] = React.useState(null);

    const Data = [
      {
        id: 1,
        title: "Diesel Usage",
        value: "4,000 Liter",
        // icon: require("../../../images/DieselImg.png"),
        bgcolor: "#F6F6F6",
      },
      {
        id: 2,
        title: "Explosive Used",
        value: "200 Ton",
        // icon: require("../../../images/ExplosiveImg.png"),
        bgcolor: "#F6F6F6",
      },
      {
        id: 3,
        title: "Labour Salary",
        value: "5,344",
        // icon: require("../../../images/LaborSalary.png"),
        bgcolor: "#F6F6F6",
      },
      {
        id: 4,
        title: "Total Feet",
        value: "200 ft",
        // icon: require("../../../images/TotalHole.png"),
        bgcolor: "#F6F6F6",
      },
      {
        id: 5,
        title: "EB Reading",
        value: "4000 Units",
        // icon: require("../../../images/EBReadingImg.png"),
        bgcolor: "#F6F6F6",
      },
      {
        id: 6,
        title: "Vehicle Trip",
        value: "10000Kms",
        // icon: require("../../../images/VehicleTripImg.png"),
        bgcolor: "#F6F6F6",
      },
    ];

    const handleScroll = useCallback(
      (event) => {
        const { contentOffset } = event.nativeEvent;
        if (contentOffset.y <= 5 && isExpanded.value) {
          onScrollToTop();
        }
      },
      [isExpanded, onScrollToTop]
    );

    return (
      <View style={styles.scrollableUsageContainer}>
        <Text style={styles.sectionTitle}>Usage Details</Text>
        <View style={styles.scrollableContainer}>
          <ScrollView
            style={styles.usageScrollView}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            ref={scrollViewRef}
          >
            <View style={styles.usageGrid}>
              {Data.length > 0 ? (
                Data.map((item) => (
                  <EnhancedUsageCard key={item.id} item={item} />
                ))
              ) : (
                <Text style={styles.noDataText}>No usage data available</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  scrollableUsageContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
    bottom: 6,
  },
  scrollableContainer: {
    flex: 1,
    minHeight: 200,
  },
  usageScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  usageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 6,
  },
  usageCard: {
    width: "47%",
    height: 100,
    padding: 15,
    borderRadius: 15,
    borderColor: "#ccc",
    borderWidth: 0.5,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    backgroundColor: "#F6F6F6",
  },
  usageTitle: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
    marginBottom: 8,
  },
  usageValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  usageValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    flex: 1,
  },
  usageImage: {
    width: 60,
    height: 60,
    position: "absolute",
    left: 80,
    top: 10,
  },
  usageSalaryImage: {
    width: 60,
    height: 60,
    position: "absolute",
    left: 78,
    top: 5,
  },
  noDataText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    padding: 20,
  },
});

export default ScrollableUsageComponent;
