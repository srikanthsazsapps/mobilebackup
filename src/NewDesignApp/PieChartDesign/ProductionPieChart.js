// import React from "react";
// import { View, Text, StyleSheet, Dimensions } from "react-native";
// import Svg, { G, Path, Text as SvgText, Line } from "react-native-svg";

// const { width } = Dimensions.get("window");
// const size = Math.min(width * 0.7, 250);

// // Sample Data
// const data = [
//   { name: "EB Reading", value: 40, color: "#216ECF" },
//   { name: "Diesel", value: 20, color: "#FB9DB3" },
//   { name: "Net Weight", value: 15, color: "#D6B0FF" },
//   { name: "Transport", value: 25, color: "#77F5B0" },
// ];

// const ProductionPieChart = () => {
//   const svgSize = size + 80; // Increased padding for labels
//   const center = svgSize / 2;
//   const radius = size * 0.35;
//   const innerRadius = size * 0.2;
 
//   // Calculate total value
//   const total = data.reduce((sum, item) => sum + item.value, 0);
  
//   // Calculate angles for each segment with spacing
//   const segmentSpacing = 3; // degrees of spacing between segments
//   const totalSpacing = segmentSpacing * data.length;
//   const availableAngle = 360 - totalSpacing;
  
//   let currentAngle = 0;
//   const segments = data.map(item => {
//     const percentage = (item.value / total) * 100;
//     const angle = (item.value / total) * availableAngle;
//     const startAngle = currentAngle;
//     const endAngle = currentAngle + angle;
//     const midAngle = (startAngle + endAngle) / 2;
    
//     currentAngle += angle + segmentSpacing; // Add spacing after each segment
    
//     return {
//       ...item,
//       percentage: Math.round(percentage),
//       startAngle,
//       endAngle,
//       midAngle
//     };
//   });
  
//   // Function to create SVG path for donut segment
//   const createPath = (startAngle, endAngle, outerRadius, innerRadius) => {
//     const startAngleRad = (startAngle - 90) * Math.PI / 180;
//     const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
//     const x1 = center + outerRadius * Math.cos(startAngleRad);
//     const y1 = center + outerRadius * Math.sin(startAngleRad);
//     const x2 = center + outerRadius * Math.cos(endAngleRad);
//     const y2 = center + outerRadius * Math.sin(endAngleRad);
    
//     const x3 = center + innerRadius * Math.cos(endAngleRad);
//     const y3 = center + innerRadius * Math.sin(endAngleRad);
//     const x4 = center + innerRadius * Math.cos(startAngleRad);
//     const y4 = center + innerRadius * Math.sin(startAngleRad);
    
//     const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
//     return [
//       "M", x1, y1,
//       "A", outerRadius, outerRadius, 0, largeArcFlag, 1, x2, y2,
//       "L", x3, y3,
//       "A", innerRadius, innerRadius, 0, largeArcFlag, 0, x4, y4,
//       "Z"
//     ].join(" ");
//   };
  
//   // Function to calculate label position
//   const getLabelPosition = (midAngle, distance) => {
//     const angleRad = (midAngle - 90) * Math.PI / 180;
//     return {
//       x: center + distance * Math.cos(angleRad),
//       y: center + distance * Math.sin(angleRad)
//     };
//   };
  
//   return (
//     <View style={styles.container}>
//       {/* Main Content - Centered Chart */}
//       <View style={styles.mainContent}>
//         {/* SVG Pie Chart */}
//         <View style={styles.chartContainer}>
//           <Svg width={svgSize} height={svgSize}>
//             <G>
//               {/* Render segments */}
//               {segments.map((segment, index) => {
//                 const labelPos = getLabelPosition(segment.midAngle, radius + 35);
//                 const lineStartPos = getLabelPosition(segment.midAngle, radius + 3);
//                 const lineEndPos = getLabelPosition(segment.midAngle, radius + 25);
//                 const percentagePos = getLabelPosition(segment.midAngle, (radius + innerRadius) / 2);
                
//                 return (
//                   <G key={index}>
//                     {/* Segment path */}
//                     <Path
//                       d={createPath(segment.startAngle, segment.endAngle, radius, innerRadius)}
//                       fill={segment.color}
//                       stroke="white"
//                       strokeWidth={2}
//                     />
                    
//                     {/* Connection line from segment to label */}
//                     <Line
//                       x1={lineStartPos.x}
//                       y1={lineStartPos.y}
//                       x2={lineEndPos.x}
//                       y2={lineEndPos.y}
//                       stroke="#666"
//                       strokeWidth={1}
//                       opacity={0.6}
//                     />
                    
//                     {/* Percentage label inside segment */}
//                     <SvgText
//                       x={percentagePos.x}
//                       y={percentagePos.y}
//                       textAnchor="middle"
//                       alignmentBaseline="middle"
//                       fill="white"
//                       fontSize="12"
//                       fontWeight="bold"
//                     >
//                       {segment.percentage}%
//                     </SvgText>
                    
//                     {/* Segment name label outside */}
//                     <SvgText
//                       x={labelPos.x}
//                       y={labelPos.y - 5}
//                       textAnchor="middle"
//                       alignmentBaseline="middle"
//                       fill="#333"
//                       fontSize="11"
//                       fontWeight="600"
//                     >
//                       {segment.name}
//                     </SvgText>

//                     {/* Value below the label */}
//                     <SvgText
//                       x={labelPos.x}
//                       y={labelPos.y + 10}
//                       textAnchor="middle"
//                       alignmentBaseline="middle"
//                       fill="#000"
//                       fontSize="13"
//                       fontWeight="bold"
//                     >
//                       {segment.value}
//                     </SvgText>
//                   </G>
//                 );
//               })}
//             </G>
//           </Svg>
//         </View>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 20,
//     bottom:60
//   },
//   mainContent: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   chartContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });

// export default ProductionPieChart;


// // import React from "react";
// // import { View, Dimensions, Text, StyleSheet } from "react-native";
// // import Svg, { G, Path, Text as SvgText } from "react-native-svg";
// // import * as d3Shape from "d3-shape";

// // const { width } = Dimensions.get("window");
// // const size = width * 0.50; // Chart size

// // // Sample Data
// // const data = [
// //   { key: 1, value: 30, color: "#216ECF", label: "10 Lakhs" },       // Blue
// //   { key: 2, value: 20, color: "#FB9DB3", label: "Diesel" }, // Orange
// //   { key: 3, value: 15, color: "#D6B0FF", label: "Net Weight" }, // Gray
// //   { key: 4, value: 25, color: "#77F5B0", label: "Transport" }, // Yellow
// // ];

// // const ProductionPieChart = () => {
// //   // Create arcs with gap
// //   const arcs = d3Shape
// //     .pie()
// //     .value((d) => d.value)
// //     .padAngle(0.05)(data);

// //   // Arc Generator
// //   const arcGenerator = d3Shape
// //     .arc()
// //     .outerRadius(size / 2)
// //     .innerRadius(size / 3) // Donut thickness
// //     .cornerRadius(0);

// //   return (
// //     <View style={styles.container}>
// //       {/* Pie Chart */}
// //       <Svg width={size} height={size}>
// //         <G x={size / 2} y={size / 2}>
// //           {arcs.map((arc, index) => {
// //             const [x, y] = arcGenerator.centroid(arc);
// //             return (
// //               <G key={index}>
// //                 <Path
// //                   d={arcGenerator(arc)}
// //                   fill={data[index].color}
// //                   stroke="white"
// //                   strokeWidth={2}
// //                 />
// //                 <SvgText
// //                   x={x + 2}
// //                   y={y}
// //                   fill="white"
// //                   fontSize="14"
// //                   fontWeight="bold"
// //                   textAnchor="middle"
// //                   alignmentBaseline="middle"
// //                 >
// //                   {Math.round((data[index].value /
// //                     data.reduce((sum, d) => sum + d.value, 0)) * 50)}
                    
// //                 </SvgText>
// //               </G>
// //             );
// //           })}
// //         </G>
// //       </Svg>

// //       {/* Legend */}
// //       <View style={styles.legendContainer}>
// //         {data.map((item) => (
// //           <View key={item.key} style={styles.legendItem}>
// //             <View style={[styles.colorBox, { backgroundColor: item.color }]} />
// //             <Text style={styles.legendText}>{item.label}</Text>
// //           </View>
// //         ))}
// //       </View>
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flexDirection: "row", // Pie chart left, legend right
// //     justifyContent: "center",
// //     alignItems: "center",
// //     marginVertical: 20,
// //     bottom:10
// //   },
// //   legendContainer: {
// //     marginLeft: 20,
// //   },
// //   legendItem: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //     marginBottom: 8,
// //   },
// //   colorBox: {
// //     width: 15,
// //     height: 5,
// //     marginRight: 8,
// //   },
// //   legendText: {
// //     fontSize: 14,
// //     color: "#000",
// //   },
// // });

// // export default ProductionPieChart;


