import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from "react-native";
import { DashesDataContext } from "../../../components/common/DashesDataContext";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

const width = Dimensions.get("window").width;

const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Utility to generate days matrix for month/year
const getMonthMatrix = (month, year) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  let current = 1;
  const rows = [];
  for (let week = 0; week < 6; week++) {
    const row = [];
    for (let day = 0; day < 7; day++) {
      if (week === 0 && day < firstDay) {
        row.push(null);
      } else if (current <= daysInMonth) {
        row.push(current);
        current++;
      } else {
        row.push(null);
      }
    }
    rows.push(row);
  }
  return rows;
};

const DateFilter = ({ dashboardType = "profitLoss", onFilterChange }) => {
  const [visible, setVisible] = useState(false);
  const [customVisible, setCustomVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Today");
  const [showText, setShowText] = useState(false);
  const [customRangeText, setCustomRangeText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calendar states for month/year navigation
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(year - 5);

  const datesMatrix = getMonthMatrix(month, year);

  // Use context states and methods
  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setTodayRange,
    setYesterdayRange,
    setWeekRange,
    setMonthRange,
    fetchCustomDashboard,
    setPreviousTodayRange,
    setPreviousYesterdayRange,
    setPreviousWeekRange,
    setPreviousMonthRange,
    setPreviousCustomRange,
  } = useContext(DashesDataContext);

  // Initialize dates when custom modal opens
  useEffect(() => {
    if (customVisible) {
      setMonth(today.getMonth());
      setYear(today.getFullYear());
      setStartDate(new Date());
      setEndDate(new Date());
    }
  }, [customVisible, setStartDate, setEndDate]);

  const handleSelect = async (value) => {
    setSelectedOption(value);
    setCustomRangeText(null);
    setShowText(true);
    setVisible(false);
    setIsLoading(true);

    try {
      switch (value) {
        case "Today":
          await setTodayRange(dashboardType);
          await setPreviousTodayRange(dashboardType);
          onFilterChange?.("Today");
          break;
        case "Yesterday":
          await setYesterdayRange(dashboardType);
          await setPreviousYesterdayRange(dashboardType);
          onFilterChange?.("Yesterday");
          break;
        case "Week":
          await setWeekRange(dashboardType);
          await setPreviousWeekRange(dashboardType);
          onFilterChange?.("Week");
          break;
        case "Month":
          await setMonthRange(dashboardType);
          await setPreviousMonthRange(dashboardType);
          onFilterChange?.("Month");
          break;
        case "Custom":
          setCustomVisible(true);
          break;
      }
    } catch (error) {
      console.error("DateFilter: Error setting date range:", error);
      alert("Failed to load date range.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    const fullDate = new Date(year, month, date);
    if (!startDate || (startDate && endDate)) {
      setStartDate(fullDate);
      setEndDate(null);
    } else if (fullDate < startDate) {
      setEndDate(startDate);
      setStartDate(fullDate);
    } else {
      setEndDate(fullDate);
    }
  };

  const handleCustomSelect = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);

    if (endDateTime < startDateTime) {
      alert("End date cannot be before start date.");
      return;
    }

    setIsLoading(true);
    setCustomVisible(false);
    setVisible(false);

    try {
      await fetchCustomDashboard(dashboardType, startDateTime, endDateTime);
      await setPreviousCustomRange(dashboardType, startDateTime, endDateTime);
      setSelectedOption("Custom");
      setCustomRangeText(
        `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      );
      onFilterChange?.("Custom");
    } catch (error) {
      console.error("DateFilter: Error fetching custom dashboard:", error);
      alert("Failed to load custom date range.");
    } finally {
      setIsLoading(false);
    }
  };

  const isInRange = (date) => {
    if (!startDate || !endDate) return false;
    const fullDate = new Date(year, month, date);
    return fullDate >= startDate && fullDate <= endDate;
  };

  const changeMonth = (delta) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const options = ["Today", "Yesterday", "Week", "Month", "Custom"];

  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.filterButton}
        disabled={isLoading}
      >
        {isLoading ? (
          <Text style={styles.selectedText}>Loading...</Text>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesomeIcon icon={faFilter} size={16} color="white" style={{ marginRight: showText ? 5 : 0 }} />
            {/* {showText && (
              <Text style={styles.selectedText} numberOfLines={1}>
                {customRangeText || selectedOption}
              </Text>
            )} */}
          </View>
        )}
      </TouchableOpacity>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setVisible(false)}
        >
          <View style={styles.dropdown}>
            {options.map((item, index) => (
              <View key={index}>
                <TouchableOpacity
                  style={[styles.option, selectedOption === item && styles.selectedOption]}
                  onPress={() => handleSelect(item)}
                  accessibilityLabel={`Select ${item} date range`}
                >
                  <Text style={[styles.optionText, selectedOption === item && styles.selectedOptionText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
                {index < options.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={customVisible} animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPressOut={() => setCustomVisible(false)}
        >
          <View style={styles.popup}>
            <Text style={styles.title}>Select Date Range</Text>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={() => changeMonth(-1)}>
                <Text style={styles.arrow}>◀</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={() => setShowMonthPicker(true)}>
                  <Text style={styles.subtitle}>{months[month]}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowYearPicker(true)}>
                  <Text style={styles.subtitle}>{year}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => changeMonth(1)}>
                <Text style={styles.arrow}>▶</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.calendarContainer}>
              <View style={styles.weekdays}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <Text key={d} style={styles.weekday}>{d}</Text>
                ))}
              </View>
              {datesMatrix.map((week, i) => (
                <View key={i} style={styles.weekRow}>
                  {week.map((date, j) => {
                    const isSelectedStart =
                      startDate &&
                      date &&
                      startDate.getDate() === date &&
                      startDate.getMonth() === month &&
                      startDate.getFullYear() === year;
                    const isSelectedEnd =
                      endDate &&
                      date &&
                      endDate.getDate() === date &&
                      endDate.getMonth() === month &&
                      endDate.getFullYear() === year;
                    const isBetween = date && isInRange(date);

                    return (
                      <TouchableOpacity
                        key={j}
                        style={[
                          styles.dayBox,
                          date ? styles.dayBoxEnabled : styles.dayBoxDisabled,
                          isSelectedStart || isSelectedEnd ? styles.dayBoxSelected : isBetween ? styles.dayBoxRange : null,
                        ]}
                        disabled={!date}
                        onPress={() => date && handleDateSelect(date)}
                      >
                        <Text
                          style={[styles.dayText, isSelectedStart || isSelectedEnd ? styles.dayTextSelected : null]}
                        >
                          {date ? String(date).padStart(2, "0") : ""}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.selectBtn,
                  !(startDate && endDate) && { opacity: 0.5 },
                ]}
                disabled={!(startDate && endDate)}
                onPress={handleCustomSelect}
              >
                <Text style={styles.selectBtnText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setCustomVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
        {showMonthPicker && (
          <Modal transparent animationType="fade">
            <View style={styles.overlay}>
              <View style={styles.monthPopup}>
                <Text style={styles.timeTitle}>Select Month</Text>
                <View style={styles.monthGrid}>
                  {months.map((m, i) => (
                    <TouchableOpacity
                      key={m}
                      style={[styles.monthBox, i === month && styles.monthBoxSelected]}
                      onPress={() => {
                        setMonth(i);
                        setShowMonthPicker(false);
                      }}
                    >
                      <Text style={[styles.monthText, i === month && styles.monthTextSelected]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowMonthPicker(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
        {showYearPicker && (
          <Modal transparent animationType="fade">
            <View style={styles.overlay}>
              <View style={styles.monthPopup}>
                <Text style={styles.timeTitle}>Select Year</Text>
                <View style={styles.headerRow}>
                  <TouchableOpacity onPress={() => setYearRangeStart(yearRangeStart - 10)}>
                    <Text style={styles.arrow}>◀</Text>
                  </TouchableOpacity>
                  <Text style={styles.subtitle}>{yearRangeStart} - {yearRangeStart + 9}</Text>
                  <TouchableOpacity onPress={() => setYearRangeStart(yearRangeStart + 10)}>
                    <Text style={styles.arrow}>▶</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.monthGrid}>
                  {Array.from({ length: 10 }, (_, i) => yearRangeStart + i).map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[styles.monthBox, y === year && styles.monthBoxSelected]}
                      onPress={() => {
                        setYear(y);
                        setShowYearPicker(false);
                      }}
                    >
                      <Text style={[styles.monthText, y === year && styles.monthTextSelected]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowYearPicker(false)}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    backgroundColor: "#3E89EC",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 35,
    minHeight: 35,
    justifyContent: "center",
  },
  selectedText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 200,
    fontFamily: 'PlusJakartaSans-SemiBold',
 
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    position: "absolute",
    top: 50,
    right: 10,
    width: 130,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 1000,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 15,
  },
  selectedOption: {
    backgroundColor: "#e3f2fd",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
    fontFamily: 'PlusJakartaSans-SemiBold',
 
  },
  selectedOptionText: {
    color: "#1976d2",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e5e5",
    marginHorizontal: 10,
  },
  popup: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 10,
    elevation: 8,
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "600", color: "#222", marginBottom: 5 ,fontFamily: 'PlusJakartaSans-SemiBold',
 },
  subtitle: { fontSize: 16, color: "#3578d6", fontWeight: "700", marginBottom: 7,fontFamily: 'PlusJakartaSans-SemiBold',
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 5,
  },
  arrow: { fontSize: 18, color: "#3578d6", fontWeight: "700" },
  calendarContainer: { width: "100%", marginBottom: 12 },
  weekdays: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  weekday: {
    width: 36,
    textAlign: "center",
    color: "#666",
    fontWeight: "600",
    fontSize: 13,
  },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayBox: {
    width: 36,
    height: 36,
    margin: 1,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  dayBoxEnabled: { backgroundColor: "#f7fafb" },
  dayBoxDisabled: { backgroundColor: "transparent" },
  dayBoxSelected: { backgroundColor: "#4A90E2" },
  dayBoxRange: { backgroundColor: "#cfe2f9" },
  dayText: { fontSize: 14, color: "#222", fontWeight: "500" ,fontFamily: 'PlusJakartaSans-SemiBold',
 },
  dayTextSelected: { color: "#fff", fontWeight: "700",fontFamily: 'PlusJakartaSans-SemiBold',
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 10,
  },
  selectBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: "#f1f7fd",
    borderRadius: 8,
    marginRight: 8,
  },
  selectBtnText: { color: "#3578d6", fontWeight: "600", fontSize: 15 ,fontFamily: 'PlusJakartaSans-SemiBold',
 },
  closeBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f3f3f7",
    marginTop: 10,
    alignItems: "center",
  },
  closeText: { color: "#888", fontSize: 15, fontWeight: "500",fontFamily: 'PlusJakartaSans-SemiBold',
  },
  timeTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  monthPopup: {
    width: width * 0.8,  
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  monthBox: {
    width: "25%",
    padding: 12,
    margin: 4,
    borderRadius: 8,
    backgroundColor: "#f3f6fb",
    alignItems: "center",
  },
  monthBoxSelected: { backgroundColor: "#4A90E2" },
  monthText: { fontSize: 15, fontWeight: "500", color: "#333" },
  monthTextSelected: { color: "#fff", fontWeight: "700" },
});
export default DateFilter;