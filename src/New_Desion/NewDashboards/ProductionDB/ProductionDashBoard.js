import React, { useState, useRef, useCallback } from "react";
import {
  Text,
  SafeAreaView,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
// import NetworkStatusIndicator from "../../NetworkStatusIndicator";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
// import GlobalStyle from "../../components/common/GlobalStyle";
import GlobalStyle from "../../../components/common/GlobalStyle";
import ProductionPieChart from "./ProductionPieChart";
import ScrollableUsageComponent from "./ScrollableUsageComponent";
import ScrollableCarouselComponent from "./ScrollableCarouselComponent";

const { width, height } = Dimensions.get("window");

const ProductionDashBoard = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const translateY = useSharedValue(0);
  const isExpanded = useSharedValue(false);
  const containerGestureRef = useRef();

  const COLLAPSED_HEIGHT = height * 0.7;
  const EXPANDED_HEIGHT = height * 0.75;
  const COLLAPSED_TRANSLATE = 0;
  const EXPANDED_TRANSLATE = -height * 0.10;

  // Animated style for the main container
  const animatedStyle = useAnimatedStyle(() => {
    const progress = Math.abs(translateY.value) / Math.abs(EXPANDED_TRANSLATE);
    const currentHeight = COLLAPSED_HEIGHT + (EXPANDED_HEIGHT - COLLAPSED_HEIGHT) * progress;
    const opacity = translateY.value <= EXPANDED_TRANSLATE ? 0 : 1;

    return {
      transform: [{ translateY: translateY.value }],
      height: currentHeight,
      opacity,
    };
  });

  // Animated style for carousel visibility and position
  const carouselAnimatedStyle = useAnimatedStyle(() => {
    // Calculate progress based on translateY
    const progress = Math.abs(translateY.value) / Math.abs(EXPANDED_TRANSLATE);
    
    // Animate opacity: start showing at 30% progress, fully visible at 80%
    const opacity = interpolate(
      progress,
      [0, 0.3, 0.8, 1],
      [0, 0, 0.8, 1],
      Extrapolate.CLAMP
    );
    
    // Animate translateY: slide in from above
    const carouselTranslateY = interpolate(
      progress,
      [0, 0.5, 1],
      [50, 20, 0],
      Extrapolate.CLAMP
    );
    
    // Animate scale: start smaller and grow
    const scale = interpolate(
      progress,
      [0, 0.3, 1],
      [0.8, 0.9, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [
        { translateY: carouselTranslateY },
        { scale }
      ],
    };
  });

  const containerGestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
      ctx.startTime = Date.now();
    },
    onActive: (event, ctx) => {
      const isVerticalGesture = Math.abs(event.translationY) > Math.abs(event.translationX) * 1.5;
      const isSignificantMovement = Math.abs(event.translationY) > 15;

      if (isVerticalGesture && isSignificantMovement) {
        const newTranslateY = ctx.startY + event.translationY;
        if (newTranslateY <= COLLAPSED_TRANSLATE && newTranslateY >= EXPANDED_TRANSLATE) {
          translateY.value = newTranslateY;
        }
      }
    },
    onEnd: (event, ctx) => {
      const isVerticalGesture = Math.abs(event.translationY) > Math.abs(event.translationX) * 1.5;
      const isSignificantMovement = Math.abs(event.translationY) > 30;
      const isFastGesture = Math.abs(event.velocityY) > 600;

      if ((isVerticalGesture && isSignificantMovement) || isFastGesture) {
        const velocityThreshold = -600;
        const positionThreshold = EXPANDED_TRANSLATE / 1.8;

        const shouldExpand = event.velocityY < velocityThreshold || translateY.value < positionThreshold;

        if (shouldExpand) {
          translateY.value = withSpring(EXPANDED_TRANSLATE, {
            damping: 25,
            stiffness: 120,
            mass: 0.8,
            overshootClamping: true,
          });
          isExpanded.value = true;
        } else {
          translateY.value = withSpring(COLLAPSED_TRANSLATE, {
            damping: 25,
            stiffness: 120,
            mass: 0.8,
            overshootClamping: true,
          });
          isExpanded.value = false;
        }
      }
    },
  });

  const collapseContainer = useCallback(() => {
    translateY.value = withSpring(COLLAPSED_TRANSLATE, {
      damping: 25,
      stiffness: 120,
      mass: 0.8,
      overshootClamping: true,
    });
    isExpanded.value = false;
  }, [translateY, isExpanded]);

  const handleScrollToTop = useCallback(() => {
    collapseContainer();
  }, [collapseContainer]);

  return (
    <SafeAreaView style={styles.container}>
      {/* <NetworkStatusIndicator /> */}
      
      {/* Header Section */}
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

      {/* Pie Chart Component */}
      <ProductionPieChart splitMode={false} isExpanded={isExpanded} />

      {/* Animated Carousel Component */}
      <Animated.View style={[styles.carouselWrapper, carouselAnimatedStyle]}>
        <ScrollableCarouselComponent isVisible={true} translateY={translateY} />
      </Animated.View>

      {/* Bottom Sheet with Usage Details */}
      <PanGestureHandler
        ref={containerGestureRef}
        onGestureEvent={containerGestureHandler}
        simultaneousHandlers={[]}
        shouldCancelWhenOutside={false}
        activeOffsetY={[-15, 15]}
        failOffsetX={[-50, 50]}
      >
        <Animated.View style={[styles.DataContainer, animatedStyle]}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          <ScrollableUsageComponent
            onScrollToTop={handleScrollToTop}
            isExpanded={isExpanded}
            containerGestureRef={containerGestureRef}
            selectedFilter={selectedFilter}
          />
        </Animated.View>
      </PanGestureHandler>
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
  carouselWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  DataContainer: {
    position: "relative",
    width: "100%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    top: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    paddingTop: 10,
    borderColor: "#000",
    borderWidth: 0.5,
  },
  dragHandleContainer: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 12,
    zIndex: 1000,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 3,
    marginBottom: 4,
  },
});

export default ProductionDashBoard;
