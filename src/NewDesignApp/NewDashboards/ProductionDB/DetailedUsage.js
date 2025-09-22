import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetworkStatusIndicator from "../../NetworkStatusIndicator";
import GlobalStyle from "../../../components/common/GlobalStyle";

const data = [
  { name: "Raw Material Purchase", value: 40, color: "#216ECF" },
  { name: "Quarry to Crusher", value: 20, color: "#FB9DB3" }, 
  { name: "Crusher to Quarry", value: 15, color: "#D6B0FF" },
  { name: "Quarry to Stockyard", value: 25, color: "#77F5B0" },
];

const DetailedUsage = ({ navigation, route }) => {
  const selectedCardType = route.params?.selectedCardType || 'raw';
  const [selectedCard, setSelectedCard] = useState(selectedCardType);
  const scrollViewRef = useRef(null);
  const cardPositions = useRef({});

  const handleCardPress = (cardType) => {
    setSelectedCard(cardType);
  };

  const onCardLayout = (cardType) => (event) => {
    const { y, height } = event.nativeEvent.layout;
    cardPositions.current[cardType] = {
      top: y,
      center: y + height / 2,
      bottom: y + height
    };
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const viewHeight = event.nativeEvent.layoutMeasurement.height;
    const screenCenter = scrollY + viewHeight / 2;
    const scrollEnd = scrollY + viewHeight >= contentHeight - 50;

    let closestCard = selectedCard;
    let minDistance = Infinity;

    Object.entries(cardPositions.current).forEach(([cardType, position]) => {
      if (position && position.center) {
        const distance = Math.abs(screenCenter - position.center);
        if (distance < minDistance) {
          minDistance = distance;
          closestCard = cardType;
        }
      }
    });

    if (scrollEnd) {
      setSelectedCard('maintenance');
    } else if (scrollY <= 0) {
      setSelectedCard('raw');
    } else if (closestCard !== selectedCard && minDistance < 200) {
      setSelectedCard(closestCard);
    }
  };

  const getCardStyle = (cardType) => {
    const baseStyle = { marginHorizontal: 15, borderRadius: 15 };
    
    if (selectedCard === cardType) {
      return {
        ...baseStyle,
        zIndex: 10,
        elevation: 10,
        marginTop: 0,
      };
    } else {
      switch (cardType) {
        case 'raw':
          if (selectedCard === 'diesel' || selectedCard === 'explosive' || selectedCard === 'labor' || 
              selectedCard === 'equipment' || selectedCard === 'transport' || selectedCard === 'maintenance') {
            return {
              ...baseStyle,
              zIndex: 1,
              marginBottom: -80,
              elevation: 2
            };
          }
          return { ...baseStyle, zIndex: 5, marginBottom: 10, elevation: 4 };
          
        case 'diesel':
          return { ...baseStyle, zIndex: 3, marginTop: 0, elevation: 6 };
          
        case 'explosive':
          if (selectedCard === 'labor' || selectedCard === 'equipment' || 
              selectedCard === 'transport' || selectedCard === 'maintenance') {
            return {
              ...baseStyle,
              zIndex: 3,
              marginTop: -30,
              marginBottom: -30,
              elevation: 6
            };
          }
          return { ...baseStyle, zIndex: 2, marginTop: -10, elevation: 6 };
          
        case 'labor':
          if (selectedCard === 'equipment' || selectedCard === 'transport' || selectedCard === 'maintenance') {
            return {
              ...baseStyle,
              zIndex: 3,
              marginTop: -30,
              marginBottom: -30,
              elevation: 6
            };
          }
          return { ...baseStyle, zIndex: 1, marginTop: -10, elevation: 6 };

        case 'equipment':
          if (selectedCard === 'transport' || selectedCard === 'maintenance') {
            return {
              ...baseStyle,
              zIndex: 3,
              marginTop: -30,
              marginBottom: -30,
              elevation: 6
            };
          }
          return { ...baseStyle, zIndex: 1, marginTop: -10, elevation: 6 };

        case 'transport':
          if (selectedCard === 'maintenance') {
            return {
              ...baseStyle,
              zIndex: 3,
              marginTop: -30,
              marginBottom: -30,
              elevation: 6
            };
          }
          return { ...baseStyle, zIndex: 1, marginTop: -10, elevation: 6 };

        case 'maintenance':
          return { ...baseStyle, zIndex: 1, marginTop: -10, elevation: 6 };
          
        default:
          return baseStyle;
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current && cardPositions.current[selectedCard]) {
        const y = cardPositions.current[selectedCard].top - 100;
        scrollViewRef.current.scrollTo({ y, animated: true });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedCard]);

  return (
    <SafeAreaView style={styles.container}>
      <NetworkStatusIndicator />
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="black" />
          </TouchableOpacity>
          <Text style={[GlobalStyle.heading1, styles.headerTitle]}>Production Details</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={[GlobalStyle.H8, styles.menuText]}>Menu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.carouselContainer}>
        <View style={styles.singleCard}>
          {/* First row - Raw Material Purchase */}
          <View style={styles.firstRow}>
            <Text style={styles.firstRowLabel}>{data[0].name}</Text>
            <Text style={styles.firstRowValue}>
              {data[0].value.toLocaleString()}
            </Text>
          </View>

          {/* Second row - Other 3 values */}
          <View style={styles.secondRow}>
            {data.slice(1).map((item, index) => (
              <View key={index} style={styles.secondRowItem}>
                <Text style={styles.secondRowLabel}>{item.name}</Text>
                <Text style={styles.secondRowValue}>
                  {item.value.toLocaleString()} TON
                </Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={50}
          decelerationRate="fast"
          style={{ width: '90%', marginTop: 10 }}
        >
          {/* Raw Material Purchase Card */}
          <TouchableOpacity 
            style={[
              styles.card,
              selectedCard === 'raw' ? styles.selectedBlueCard : styles.grayCard,
              getCardStyle('raw')
            ]}
            onPress={() => handleCardPress('raw')}
            onLayout={onCardLayout('raw')}
            activeOpacity={0.8}
          >
            {selectedCard === 'raw' ? (
              <LinearGradient
                colors={['#216DCE', '#86BAFB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Raw Material Purchase</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>1000.46</Text>
                        <Text style={styles.stockUnit}>Ton</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 92,390.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>400.46</Text>
                        <Text style={styles.stockUnit}>Ton</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 36,998.49</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <>
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Raw Material Purchase</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>1000.46</Text>
                        <Text style={styles.stockUnit}>Ton</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 92,390.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>400.46</Text>
                        <Text style={styles.stockUnit}>Ton</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 36,998.49</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* Diesel Usage Card */}
          <TouchableOpacity 
            style={[
              styles.card,
              selectedCard === 'diesel' ? styles.selectedBlueCard : styles.grayCard,
              getCardStyle('diesel')
            ]}
            onPress={() => handleCardPress('diesel')}
            onLayout={onCardLayout('diesel')}
            activeOpacity={0.8}
          >
            {selectedCard === 'diesel' ? (
              <LinearGradient
                colors={['#216DCE', '#86BAFB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Diesel Usage</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>1000.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 92,390.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>400.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 36,998.49</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <>
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Diesel Usage</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>1000.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 92,390.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>400.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 36,998.49</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* Explosive Usage Card */}
          <TouchableOpacity 
            style={[
              styles.card,
              selectedCard === 'explosive' ? styles.selectedBlueCard : styles.grayCard,
              getCardStyle('explosive')
            ]}
            onPress={() => handleCardPress('explosive')}
            onLayout={onCardLayout('explosive')}
            activeOpacity={0.8}
          >
            {selectedCard === 'explosive' ? (
              <LinearGradient
                colors={['#216DCE', '#86BAFB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Explosive Usage</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>1000.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 92,390.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>400.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 36,998.49</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <>
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Explosive Usage</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>1000.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 92,390.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>400.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 36,998.49</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* Labor Salary Card */}
          <TouchableOpacity 
            style={[
              styles.card,
              selectedCard === 'labor' ? styles.selectedBlueCard : styles.grayCard,
              getCardStyle('labor')
            ]}
            onPress={() => handleCardPress('labor')}
            onLayout={onCardLayout('labor')}
            activeOpacity={0.8}
          >
            {selectedCard === 'labor' ? (
              <LinearGradient
                colors={['#216DCE', '#86BAFB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Labor Salary</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>1000.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 92,390.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>400.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 36,998.49</Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <>
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Labor Salary</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>1000.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 92,390.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>400.46</Text>
                        <Text style={styles.stockUnit}>Liter</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 36,998.49</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* Equipment Management Card */}
          <TouchableOpacity 
            style={[
              styles.card,
              selectedCard === 'equipment' ? styles.selectedBlueCard : styles.grayCard,
              getCardStyle('equipment')
            ]}
            onPress={() => handleCardPress('equipment')}
            onLayout={onCardLayout('equipment')}
            activeOpacity={0.8}
          >
            {selectedCard === 'equipment' ? (
              <LinearGradient
                colors={['#216DCE', '#86BAFB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Equipment Management</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>85</Text>
                        <Text style={styles.stockUnit}>Units</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 2,45,000.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>25</Text>
                        <Text style={styles.stockUnit}>Units</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 75,000.00</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <>
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Equipment Management</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>85</Text>
                        <Text style={styles.stockUnit}>Units</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 2,45,000.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>25</Text>
                        <Text style={styles.stockUnit}>Units</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 75,000.00</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* Transport Management Card */}
          <TouchableOpacity 
            style={[
              styles.card,
              selectedCard === 'transport' ? styles.selectedBlueCard : styles.grayCard,
              getCardStyle('transport')
            ]}
            onPress={() => handleCardPress('transport')}
            onLayout={onCardLayout('transport')}
            activeOpacity={0.8}
          >
            {selectedCard === 'transport' ? (
              <LinearGradient
                colors={['#216DCE', '#86BAFB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Transport Management</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>42</Text>
                        <Text style={styles.stockUnit}>Vehicles</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 1,85,750.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>18</Text>
                        <Text style={styles.stockUnit}>Vehicles</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 65,250.00</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <>
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Transport Management</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>42</Text>
                        <Text style={styles.stockUnit}>Vehicles</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 1,85,750.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>18</Text>
                        <Text style={styles.stockUnit}>Vehicles</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 65,250.00</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* Maintenance & Safety Card */}
          <TouchableOpacity 
            style={[
              styles.card,
              selectedCard === 'maintenance' ? styles.selectedBlueCard : styles.grayCard,
              getCardStyle('maintenance')
            ]}
            onPress={() => handleCardPress('maintenance')}
            onLayout={onCardLayout('maintenance')}
            activeOpacity={0.8}
          >
            {selectedCard === 'maintenance' ? (
              <LinearGradient
                colors={['#216DCE', '#86BAFB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientCard}
              >
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Maintenance & Safety</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>156</Text>
                        <Text style={styles.stockUnit}>Items</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 89,450.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator, { backgroundColor: '#FFD700' }]} />
                        <Text style={styles.stockAmount}>78</Text>
                        <Text style={styles.stockUnit}>Items</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 32,180.00</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </LinearGradient>
            ) : (
              <>
                <TouchableOpacity style={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faArrowLeft} size={20} color="#fff" />
                  <Text style={styles.sectionHeaderText}>Maintenance & Safety</Text>
                </TouchableOpacity>
                
                <View style={styles.stockContainer}>
                  <View style={styles.stockTabs}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                      <Text style={styles.activeTabText}>Available Stock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tab, styles.inactiveTab]}>
                      <Text style={styles.inactiveTabText}>Used Stock</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.stockDetailsRow}>
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={styles.dotIndicator} />
                        <Text style={styles.stockAmount}>156</Text>
                        <Text style={styles.stockUnit}>Items</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 89,450.00</Text>
                    </View>
                    
                    <View style={styles.stockItem}>
                      <View style={styles.stockInfo}>
                        <View style={[styles.dotIndicator]} />
                        <Text style={styles.stockAmount}>78</Text>
                        <Text style={styles.stockUnit}>Items</Text>
                      </View>
                      <Text style={styles.stockPrice}>₹ 32,180.00</Text>
                    </View>
                  </View>
                  
                  <View style={styles.iconContainer}>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>
          
          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
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
  carouselContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  singleCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderColor: '#A2A2A2',
    borderWidth: 1
  },
  firstRow: {
    marginBottom: 12,
    marginLeft: 8
  },
  firstRowLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  firstRowValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  secondRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 17
  },
  secondRowItem: {
    alignItems: 'center',
    flex: 1,
  },
  secondRowLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  secondRowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  topCard: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    transition: 'all 0.3s ease',
  },
  card: {
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    transition: 'all 0.3s ease',
    borderRadius: 15,
  },
  grayCard: {
    backgroundColor: '#9E9E9E',
    transition: 'all 0.3s ease',
  },
  selectedBlueCard: {
    shadowOpacity: 0.5,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 25,
    transform: [{ scale: 1.08 }],
    elevation: 18,
    borderWidth: 3,
    borderColor: '#fff',
    shadowSpread: 5,
  },
  gradientCard: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  selectedText: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '400',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  sectionHeaderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 15,
  },
  stockContainer: {
    paddingBottom: 25,
  },
  stockTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  inactiveTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTabText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  inactiveTabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  stockDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  stockItem: {
    flex: 1,
    marginRight: 10,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 12,
  },
  stockAmount: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  stockUnit: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
  stockPrice: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 18,
  },
  iconContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
  },
  fuelIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fuelBarrel: {
    width: 45,
    height: 55,
    backgroundColor: '#FFA726',
    borderRadius: 8,
    position: 'absolute',
  },
  fuelNozzle: {
    width: 15,
    height: 25,
    backgroundColor: '#37474F',
    borderRadius: 4,
    position: 'absolute',
    right: -5,
    top: 15,
  },
  explosiveIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dynamite: {
    width: 30,
    height: 50,
    backgroundColor: '#F44336',
    borderRadius: 15,
    position: 'absolute',
  },
  dynamiteFuse: {
    width: 2,
    height: 15,
    backgroundColor: '#795548',
    position: 'absolute',
    top: -5,
    borderRadius: 1,
  },
  equipmentIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  excavator: {
    width: 40,
    height: 30,
    backgroundColor: '#FF9800',
    borderRadius: 5,
    position: 'absolute',
  },
  excavatorArm: {
    width: 25,
    height: 8,
    backgroundColor: '#F57C00',
    borderRadius: 4,
    position: 'absolute',
    right: -10,
    top: 8,
  },
  transportIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  truck: {
    width: 45,
    height: 25,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    position: 'absolute',
  },
  truckCargo: {
    width: 30,
    height: 20,
    backgroundColor: '#388E3C',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: -15,
  },
  maintenanceIcon: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helmet: {
    width: 35,
    height: 30,
    backgroundColor: '#FFC107',
    borderRadius: 20,
    position: 'absolute',
    top: 5,
  },
  wrench: {
    width: 25,
    height: 4,
    backgroundColor: '#607D8B',
    borderRadius: 2,
    position: 'absolute',
    bottom: 8,
    transform: [{ rotate: '45deg' }],
  },
});

export default DetailedUsage;