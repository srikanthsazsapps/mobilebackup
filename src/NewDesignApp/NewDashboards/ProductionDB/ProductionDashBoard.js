import React, { useState, useRef, useCallback } from "react";
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import GlobalStyle from "../../../components/common/GlobalStyle";
import NetworkStatusIndicator from "../../NetworkStatusIndicator";
import ProductionPieChart from "./ProductionPieChart";
import ScrollableUsageComponent from "./ScrollableUsageComponent";

const { width, height } = Dimensions.get("window");

const idToCardType = {
  1: 'diesel',
  2: 'explosive',
  3: 'labor',
  4: 'equipment',
  5: 'maintenance',
  6: 'transport',
};

const ProductionDashBoard = ({ navigation }) => {
  const handleCardClick = (card) => {
    const selectedCardType = idToCardType[card.id] || 'diesel';
    navigation.navigate("DetailedUsage", { selectedCardType });
  };

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => navigation.navigate("DashboardMain")}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
          </TouchableOpacity>
          <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Production</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
        </TouchableOpacity>
      </View>

      {/* Pie Chart */}
      <ProductionPieChart />

      {/* Usage Cards */}
      <ScrollableUsageComponent
        onCardClick={handleCardClick}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    marginLeft: 10,
  },
  menuButton: {
    backgroundColor: "#333333",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  menuText: {
    color: "#fff",
  },
});

export default ProductionDashBoard;