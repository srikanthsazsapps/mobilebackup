import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  withTiming,
  Easing,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get("window");

const SalesOrderBarChart = ({
  selectedCategory,
  data = { daybook: 0, stock: 0, cancelledBill: 0, anpr: 0 },
  chartTransition,
  productionData,
}) => {
  // Dropdown states
  const [productDropdownVisible, setProductDropdownVisible] = useState(false);
  const [uomDropdownVisible, setUomDropdownVisible] = useState(false);
  const [infoTitleDropdownVisible, setInfoTitleDropdownVisible] = useState(false);
  
  // Chart visibility state
  const [showChart, setShowChart] = useState(true);
  
  // Active dropdown state
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Selected values
  const [selectedProduct, setSelectedProduct] = useState('All Products');
  const [selectedUom, setSelectedUom] = useState('All UOM');
  const [selectedInfoTitle, setSelectedInfoTitle] = useState('All Items');
  
  // Track initial render
  const [isInitialRender, setIsInitialRender] = useState(true);
  
  // Animation values for each bar
  const bar1Animation = useSharedValue(0);
  const bar2Animation = useSharedValue(0);
  const bar3Animation = useSharedValue(0);
  
  // Compute unique ItemName values from productionData[3]
  const itemNames = useMemo(() => {
    if (!productionData || !productionData[3] || productionData[3].length === 0) {
      return ['No Items'];
    }
    const names = [...new Set(productionData[3].map(item => item.ItemName))];
    return names.length > 0 ? names : ['No Items'];
  }, [productionData]);

  // Compute unique UOM values for all items
  const uomOptions = useMemo(() => {
    if (!productionData || !productionData[3] || productionData[3].length === 0) {
      return ['TON', 'unit', 'pieces'];
    }
    const uoms = [...new Set(productionData[3].map(item => item.UOM || 'unit'))];
    return uoms.length > 0 ? uoms : ['TON', 'unit', 'pieces'];
  }, [productionData]);

  // Compute totals for bar chart
  const barChartTotals = useMemo(() => {
    if (!productionData || !productionData[3] || productionData[3].length === 0) {
      return { reqQty: 0, supQty: 0, balQty: 0 };
    }
    
    let filteredData = productionData[3];
    
    if (selectedProduct !== 'All Products') {
      filteredData = filteredData.filter(item => item.ItemName === selectedProduct);
    }
    
    if (selectedUom !== 'All UOM') {
      filteredData = filteredData.filter(item => (item.UOM || 'unit') === selectedUom);
    }
    
    return filteredData.reduce(
      (acc, item) => ({
        reqQty: acc.reqQty + (parseFloat(item.ReqQty) || 0),
        supQty: acc.supQty + (parseFloat(item.SupQty) || 0),
        balQty: acc.balQty + (parseFloat(item.BalQty) || 0),
      }),
      { reqQty: 0, supQty: 0, balQty: 0 }
    );
  }, [productionData, selectedProduct, selectedUom]);

  // Compute highest balance product for stock card
  const highestBalanceProduct = useMemo(() => {
    if (!productionData || !productionData[3] || productionData[3].length === 0) {
      return { ItemName: 'No Items', BalQty: 0 };
    }
    return productionData[3].reduce(
      (max, item) => {
        const balQty = parseFloat(item.BalQty) || 0;
        return balQty > max.BalQty ? { ItemName: item.ItemName, BalQty: balQty } : max;
      },
      { ItemName: productionData[3][0].ItemName, BalQty: parseFloat(productionData[3][0].BalQty) || 0 }
    );
  }, [productionData]);

  // Compute totals for selected ItemName in info card
  const infoCardTotals = useMemo(() => {
    if (!productionData || !productionData[3] || productionData[3].length === 0) {
      return { reqQty: 0, supQty: 0, balQty: 0 };
    }
    let filteredData = productionData[3];
    
    if (selectedInfoTitle !== 'All Items') {
      filteredData = filteredData.filter(item => item.ItemName === selectedInfoTitle);
    }
    
    return filteredData.reduce(
      (acc, item) => ({
        reqQty: acc.reqQty + (parseFloat(item.ReqQty) || 0),
        supQty: acc.supQty + (parseFloat(item.SupQty) || 0),
        balQty: acc.balQty + (parseFloat(item.BalQty) || 0),
      }),
      { reqQty: 0, supQty: 0, balQty: 0 }
    );
  }, [productionData, selectedInfoTitle]);

  // Calculate bar heights based on values
  const { barHeights, maxValue } = useMemo(() => {
    const values = [barChartTotals.reqQty, barChartTotals.supQty, barChartTotals.balQty];
    const maxVal = Math.max(...values, 1); // Ensure minimum of 1 to avoid division by zero
    const maxBarHeight = 120; // Maximum height for bars
    const minBarHeight = 10; // Minimum height for visibility
    
    const heights = values.map(value => {
      if (value === 0) return minBarHeight;
      return Math.max(minBarHeight, (value / maxVal) * maxBarHeight);
    });
    
    return { barHeights: heights, maxValue: maxVal };
  }, [barChartTotals]);

  // Trigger animations when data changes
  useEffect(() => {
    // Reset animations
    bar1Animation.value = 0;
    bar2Animation.value = 0;
    bar3Animation.value = 0;
    
    // Start staggered animations
    bar1Animation.value = withDelay(100, withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.cubic) 
    }));
    bar2Animation.value = withDelay(200, withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.cubic) 
    }));
    bar3Animation.value = withDelay(300, withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.cubic) 
    }));
  }, [barChartTotals, showChart]);

  // Dropdown options
  const productOptions = useMemo(() => ['All Products', ...itemNames], [itemNames]);
  const infoTitleOptions = useMemo(() => ['All Items', ...itemNames], [itemNames]);
  const uomDropdownOptions = useMemo(() => ['All UOM', ...uomOptions], [uomOptions]);

  const categoryColors = {
    daybook: { 
      gradient: ['#4A90E2', '#357ABD'],
      stripeColor: 'rgba(255,255,255,0.3)'
    },
    stock: { 
      gradient: ['#50C878', '#228B22'],
      stripeColor: 'rgba(255,255,255,0.3)'
    },
    cancelledBill: { 
      gradient: ['#DDA0DD', '#BA55D3'],
      stripeColor: 'rgba(255,255,255,0.3)'
    },
  };

  const categories = [
    { key: 'daybook', label: 'Request Qty', value: barChartTotals.reqQty.toFixed(1), color: { gradient: ['#4A90E2', '#357ABD'], stripeColor: 'rgba(255,255,255,0.3)' } },
    { key: 'stock', label: 'Supplied Qty', value: barChartTotals.supQty.toFixed(2), color: { gradient: ['#50C878', '#228B22'], stripeColor: 'rgba(255,255,255,0.3)' } },
    { key: 'cancelledBill', label: 'Balance Qty', value: barChartTotals.balQty.toFixed(2), color: { gradient: ['#DDA0DD', '#BA55D3'], stripeColor: 'rgba(255,255,255,0.3)' } },
  ];

  // Handle dropdown container click
  const handleDropdownClick = () => {
    setShowChart(!showChart);
  };

  // Handle individual dropdown clicks
  const handleProductClick = () => {
    setActiveDropdown(activeDropdown === 'product' ? null : 'product');
    setProductDropdownVisible(!productDropdownVisible);
    setUomDropdownVisible(false);
    setInfoTitleDropdownVisible(false);
  };

  const handleUomClick = () => {
    setActiveDropdown(activeDropdown === 'uom' ? null : 'uom');
    setUomDropdownVisible(!uomDropdownVisible);
    setProductDropdownVisible(false);
    setInfoTitleDropdownVisible(false);
  };

  const handleInfoTitleClick = () => {
    setActiveDropdown(activeDropdown === 'infoTitle' ? null : 'infoTitle');
    setInfoTitleDropdownVisible(!infoTitleDropdownVisible);
    setProductDropdownVisible(false);
    setUomDropdownVisible(false);
  };

  // Handle dropdown selections with immediate chart update
  const handleProductSelection = (option) => {
    setSelectedProduct(option);
    setSelectedUom('All UOM'); // Reset UOM when product changes
    setProductDropdownVisible(false);
    setActiveDropdown(null);
    setIsInitialRender(false);
    setShowChart(true);
  };

  const handleUomSelection = (option) => {
    setSelectedUom(option);
    setUomDropdownVisible(false);
    setActiveDropdown(null);
    setShowChart(true);
  };

  const handleInfoTitleSelection = (option) => {
    setSelectedInfoTitle(option);
    setInfoTitleDropdownVisible(false);
    setActiveDropdown(null);
  };

  // Close all dropdowns when clicking outside
  const closeAllDropdowns = () => {
    setProductDropdownVisible(false);
    setUomDropdownVisible(false);
    setInfoTitleDropdownVisible(false);
    setActiveDropdown(null);
  };

  // Animate container (chart view)
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(
        interpolate(chartTransition.value, [0, 0.1, 1], [1, 0, 0]),
        { duration: 100, easing: Easing.out(Easing.cubic) }
      ),
      transform: [
        {
          translateX: withTiming(
            interpolate(chartTransition.value, [0, 0.1, 1], [0, -50, -width * 0.8]),
            { duration: 100, easing: Easing.out(Easing.cubic) }
          )
        },
        {
          scale: withTiming(
            interpolate(chartTransition.value, [0, 0.1, 1], [1, 0.8, 0.7]),
            { duration: 100, easing: Easing.out(Easing.cubic) }
          )
        }
      ],
      shadowOpacity: withTiming(0, { duration: 50 }),
      elevation: withTiming(0, { duration: 50 }),
    };
  });

  // Animate card (info card)
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(
        interpolate(chartTransition.value, [0, 0.3, 1], [0, 0.5, 1]),
        { duration: 700, easing: Easing.out(Easing.cubic) }
      ),
      transform: [
        {
          translateX: withTiming(
            interpolate(chartTransition.value, [0, 1], [width * 0.8, 0]),
            { duration: 700, easing: Easing.out(Easing.cubic) }
          )
        },
        {
          scale: withTiming(
            interpolate(chartTransition.value, [0, 1], [0.8, 1]),
            { duration: 700, easing: Easing.out(Easing.cubic) }
          )
        }
      ],
      shadowOpacity: withTiming(
        interpolate(chartTransition.value, [0, 0.5, 1], [0, 0.05, 0.1]),
        { duration: 700, easing: Easing.out(Easing.cubic) }
      ),
      elevation: withTiming(
        interpolate(chartTransition.value, [0, 0.5, 1], [0, 2, 4]),
        { duration: 700, easing: Easing.out(Easing.cubic) }
      ),
    };
  });

  // Stock card animation
  const bottomCardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(
        interpolate(chartTransition.value, [0, 0.1, 1], [1, 0, 0]),
        { duration: 100, easing: Easing.out(Easing.cubic) }
      ),
      transform: [
        {
          translateX: withTiming(
            interpolate(chartTransition.value, [0, 0.1, 1], [0, -50, -width * 0.8]),
            { duration: 100, easing: Easing.out(Easing.cubic) }
          )
        },
        {
          scale: withTiming(
            interpolate(chartTransition.value, [0, 0.1, 1], [1, 0.8, 0.7]),
            { duration: 100, easing: Easing.out(Easing.cubic) }
          )
        }
      ],
      shadowOpacity: withTiming(0, { duration: 50 }),
      elevation: withTiming(0, { duration: 50 }),
    };
  });

  // Custom Bar with Diagonal Stripes and Animation
  const StripedBar = ({ height, color, index }) => {
    const animationValue = index === 0 ? bar1Animation : index === 1 ? bar2Animation : bar3Animation;
    
    const animatedBarStyle = useAnimatedStyle(() => {
      const animatedHeight = interpolate(animationValue.value, [0, 1], [0, height]);
      return {
        height: animatedHeight,
      };
    });

    const animatedStripesStyle = useAnimatedStyle(() => {
      const animatedHeight = interpolate(animationValue.value, [0, 1], [0, height]);
      const stripeCount = Math.ceil(animatedHeight / 8);
      return {
        height: animatedHeight,
      };
    });

    return (
      <View style={[styles.barContainer, { height }]}>
        <Animated.View style={[styles.gradientBarWrapper, animatedBarStyle]}>
          <LinearGradient
            colors={color.gradient}
            style={[styles.gradientBar]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <Animated.View style={[styles.stripesContainer, animatedStripesStyle]}>
              {Array.from({ length: Math.ceil(height / 8) }).map((_, i) => (
                <View 
                  key={i}
                  style={[
                    styles.diagonalStripe,
                    {
                      top: i * 8,
                      backgroundColor: color.stripeColor,
                    }
                  ]}
                />
              ))}
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Chart Container */}
      <Animated.View style={[styles.container, containerAnimatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ position: 'relative' }}>
            <TouchableOpacity 
              style={[styles.dropdownContainer, { zIndex: 1000 }]}
              onPress={() => { 
                handleDropdownClick(); 
                handleProductClick(); 
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, { color: activeDropdown === 'product' ? '#000000' : '#9CA3AF' }]}>{selectedProduct}</Text>
              <FontAwesomeIcon icon={faCaretDown} size={12} color="grey" />
            </TouchableOpacity>
           
          </View>
          
          <View style={{ position: 'relative' }}>
            <TouchableOpacity 
              style={[styles.dropdownContainer, { zIndex: 1000 }]}
              onPress={() => { 
                handleDropdownClick(); 
                handleUomClick(); 
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dropdownText, { color: activeDropdown === 'uom' ? '#000000' : '#9CA3AF' }]}>{selectedUom}</Text>
              <FontAwesomeIcon icon={faCaretDown} size={12} color="grey" />
            </TouchableOpacity>
           
          </View>
        </View>

        {/* Conditional Content: Chart or Product Card */}
        {showChart ? (
          <>
            <View style={styles.chartContainer}>
              <View style={styles.barChartArea}>
                {categories.map((category, index) => {
                  const barHeight = barHeights[index];

                  return (
                    <View key={index} style={styles.barItem}>
                      <View style={styles.valueAboveBar}>
                        <Text style={styles.valueText}>{category.value}</Text>
                        <FontAwesomeIcon icon={faCaretDown} size={10} color="black" style={styles.iconAboveBar} />
                      </View>
                      <StripedBar 
                        height={barHeight} 
                        color={category.color} 
                        index={index}
                      />
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          /* Product Card Container */
          <View style={styles.productCardContainer}>
            {productDropdownVisible && (
              <ScrollView
                horizontal={false}
                showsVerticalScrollIndicator={true}
                style={styles.scrollView}
              >
                <View style={styles.productButtonsContainer}>
                  <View style={styles.sectionRow}>
                    {productOptions.map((product, index) => (
                      <TouchableOpacity
                        key={`product-${index}`}
                        style={[
                          styles.productButton,
                          product === selectedProduct && styles.selectedProductButton
                        ]}
                        onPress={() => handleProductSelection(product)}
                      >
                        <View style={[
                          styles.circleIndicator,
                          product === selectedProduct && styles.selectedCircleIndicator
                        ]} />
                        <Text style={[
                          styles.productButtonText,
                          product === selectedProduct && styles.selectedProductButtonText
                        ]}>
                          {product}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )}
            {uomDropdownVisible && (
              <ScrollView
                horizontal={false}
                showsVerticalScrollIndicator={true}
                style={styles.scrollView}
              >
                <View style={styles.productButtonsContainer}>
                  <View style={styles.sectionRow}>
                    {uomDropdownOptions.map((uom, index) => (
                      <TouchableOpacity
                        key={`uom-${index}`}
                        style={[
                          styles.productButton,
                          uom === selectedUom && styles.selectedProductButton
                        ]}
                        onPress={() => handleUomSelection(uom)}
                      >
                        <View style={[
                          styles.circleIndicator,
                          uom === selectedUom && styles.selectedCircleIndicator
                        ]} />
                        <Text style={[
                          styles.productButtonText,
                          uom === selectedUom && styles.selectedProductButtonText
                        ]}>
                          {uom}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {showChart ? (
            categories.map((category, index) => (
              <View key={index} style={styles.labelContainer}>
                <Text style={styles.label}>{category.label}</Text>
              </View>
            ))
          ) : (
            <View style={styles.footerPlaceholder} />
          )}
        </View>
      </Animated.View>

      {/* Stock Availability Card */}
      <Animated.View style={[styles.stockCard, bottomCardAnimatedStyle]}>
        <View style={styles.stockCardContent}>
          <View style={styles.stockLeftSection}>
            <Text style={styles.stockAvailabilityText}>Highly available Stock</Text>
            <Text style={styles.stockProductText}>{highestBalanceProduct.ItemName}</Text>
          </View>
          <View style={styles.stockRightSection}>
            <View style={styles.stockQuantityBadge}>
              <Text style={styles.stockQuantityText}>{highestBalanceProduct.BalQty.toFixed(0)}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Info Card */}
      <Animated.View style={[styles.infoCard, cardAnimatedStyle]}>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity 
            style={styles.TitleRow}
            onPress={handleInfoTitleClick}
          >
            <Text style={[styles.infoTitle, { color: activeDropdown === 'infoTitle' ? '#000000' : '#9CA3AF' }]}>{selectedInfoTitle}</Text>
            <FontAwesomeIcon style={styles.titleIcon} icon={faCaretDown} size={13} color="black" />
          </TouchableOpacity>
          
          {infoTitleDropdownVisible && (
            <View style={styles.infoDropdownContainer}>
              <ScrollView style={styles.infoDropdownScrollView} nestedScrollEnabled={true}>
                {infoTitleOptions.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.infoDropdownOption,
                      selectedInfoTitle === option && styles.selectedInfoDropdownOption
                    ]}
                    onPress={() => handleInfoTitleSelection(option)}
                  >
                    <Text style={[
                      styles.infoDropdownOptionText,
                      selectedInfoTitle === option && styles.selectedInfoDropdownOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Request Qty</Text>
            <Text style={styles.infoValue}>{infoCardTotals.reqQty.toFixed(1)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Supplied Qty</Text>
            <Text style={styles.infoValue}>{infoCardTotals.supQty.toFixed(2)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Balance</Text>
            <Text style={styles.infoValue}>{infoCardTotals.balQty.toFixed(2)}</Text>
          </View>
          <Image
            source={require('../../../images/DieselImg.png')}
            style={styles.profileImage}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 330,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 10,
    marginTop: 10,
    height: 248,
    borderColor: '#AAAAAA',
    borderWidth: 0.5,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginBottom: 16,
    zIndex: 1000,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    top: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    zIndex: 1000,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '400',
    marginRight: 6,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    width: '100%',
    top: 5,
  },
  barChartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    height: 160,
    paddingHorizontal: 32,
  },
  barItem: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    marginHorizontal: 9,
  },
  productCardContainer: {
    height: 160,
    width: '100%',
    top: 5,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  scrollView: {
    height: 140,
    width: '100%',
  },
  productButtonsContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedProductButton: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  circleIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginRight: 4,
  },
  selectedCircleIndicator: {
    backgroundColor: '#FFFFFF',
  },
  productButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedProductButtonText: {
    color: '#FFFFFF',
  },
  valueAboveBar: {
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 30,
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  iconAboveBar: {
    alignSelf: 'center',
  },
  barContainer: {
    width: 42,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradientBarWrapper: {
    width: 42,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  gradientBar: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    position: 'relative',
    overflow: 'hidden',
  },
  stripesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  diagonalStripe: {
    position: 'absolute',
    left: -20,
    right: -20,
    height: 2,
    transform: [{ rotate: '45deg' }],
    opacity: 0.8,
  },
  footer: {
    backgroundColor: '#1F2937',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    bottom: 16,
    minHeight: 40,
  },
  footerPlaceholder: {
    height: 20,
    width: '100%',
  },
  labelContainer: {
    justifyContent: 'space-evenly',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    left: 2,
  },
  stockCard: {
    width: 330,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 15,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    bottom: 2,
    borderColor: '#AAAAAA',
    borderWidth: 0.5,
  },
  stockCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockLeftSection: {
    flex: 1,
  },
  stockAvailabilityText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  stockProductText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  stockRightSection: {
    alignItems: 'flex-end',
  },
  stockQuantityBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  stockQuantityText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    bottom: 365,
    height:120,
    zIndex: 1000,
  },
  TitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#F9FAFB',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    left: 4,
  },
  titleIcon: {
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    marginHorizontal: 14,
    right: 10,
    bottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  profileImage: {
    width: 60,
    height: 60,
    right: 10,
    bottom: 5,
  },
  infoDropdownContainer: {
    position: 'absolute',
    top: 40,
    left: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    maxHeight: 200,
    zIndex: 2000,
  },
  infoDropdownScrollView: {
    maxHeight: 200,
  },
  infoDropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedInfoDropdownOption: {
    backgroundColor: '#3B82F6',
  },
  infoDropdownOptionText: {
    fontSize: 14,
    color: '#111827',
  },
  selectedInfoDropdownOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    maxHeight: 200,
    zIndex: 2000,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedDropdownOption: {
    backgroundColor: '#3B82F6',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#111827',
  },
  selectedDropdownOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SalesOrderBarChart;