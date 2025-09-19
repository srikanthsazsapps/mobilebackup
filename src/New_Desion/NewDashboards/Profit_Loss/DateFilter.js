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
// import { DashesDataContext } from "../../components/common/DashesDataContext";
import { DashesDataContext } from "../../../components/common/DashesDataContext";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faSearch, faChevronDown, faFilter } from '@fortawesome/free-solid-svg-icons';
 
 
const width = Dimensions.get("window").width;
 
const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
 
// Generate all 24-hour times in 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h % 12 === 0 ? 12 : h % 12;
      const minute = m.toString().padStart(2, "0");
      const ampm = h < 12 ? "AM" : "PM";
      slots.push(`${hour}:${minute} ${ampm}`);
    }
  }
  return slots;
};
const timeSlots = generateTimeSlots();
 
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
  const [showText, setShowText] = useState(false); // 👈 added for toggle
  const [customRangeText, setCustomRangeText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
 
  // Calendar states
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(null);
  const [yearRangeStart, setYearRangeStart] = useState(year - 5);
 
  const datesMatrix = getMonthMatrix(month, year);
 
  // Context values
  const {
    startDate,
    endDate,
    startTime,
    endTime,
    setStartDate,
    setEndDate,
    setStartTime,
    setEndTime,
    setTodayRange,
    setYesterdayRange,
    setWeekRange,
    setMonthRange,
    fetchCustomDashboard,
  } = useContext(DashesDataContext);
 
  useEffect(() => {
    if (customVisible) {
      setMonth(today.getMonth());
      setYear(today.getFullYear());
    }
  }, [customVisible]);
 
  const handleSelect = async (value) => {
    if (value === "Today") {
      setShowText((prev) => !prev); // toggle if Today is clicked
    } else {
      setShowText(true); // always show for other options
    }
 
    setSelectedOption(value);
    setCustomRangeText(null);
 
    setVisible(false);
    setIsLoading(true);
 
    try {
      switch (value) {
        case "Today":
          await setTodayRange(dashboardType);
          onFilterChange?.(value);
          break;
        case "Yesterday":
          await setYesterdayRange(dashboardType);
          onFilterChange?.(value);
          break;
        case "Week":
          await setWeekRange(dashboardType);
          onFilterChange?.(value);
          break;
        case "Month":
          await setMonthRange(dashboardType);
          onFilterChange?.(value);
          break;
        case "Custom":
          setCustomVisible(true);
          break;
      }
    } catch (error) {
      console.error("Error setting date range:", error);
      alert("Failed to load date range.");
    } finally {
      setIsLoading(false);
    }
  };
 
  // --- rest of calendar/time logic unchanged ---
 
  const formatDateTime = (date, time) => {
    if (!date || !time) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(time.getHours()).padStart(2, "0");
    const minutes = String(time.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:00`;
  };
 
  const formatTimeForDisplay = (time) => {
    if (!time || isNaN(time.getTime())) return "--:--";
    const hours = time.getHours() % 12 || 12;
    const minutes = String(time.getMinutes()).padStart(2, "0");
    const ampm = time.getHours() < 12 ? "AM" : "PM";
    return `${hours}:${minutes} ${ampm}`;
  };
 
  const parseTimeString = (timeStr) => {
    if (!timeStr) return new Date();
    const [time, ampm] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(
      ampm === "PM" && hours !== 12
        ? hours + 12
        : hours === 12 && ampm === "AM"
        ? 0
        : hours
    );
    date.setMinutes(minutes);
    date.setSeconds(0);
    return date;
  };
 
  // ... keep your handleDateSelect, handleCustomSelect, isInRange, changeMonth etc.
 
  const options = ["Today", "Yesterday", "Week", "Month", "Custom"];
 
  return (
    <View>
      {/* Filter Button */}
     <TouchableOpacity
  onPress={() => setVisible(true)}
  style={styles.filterButton}
  disabled={isLoading}
>
  {isLoading ? (
    <Text style={styles.selectedText}>Loading...</Text>
  ) : (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {/* Show only icon OR only text */}
      {!showText ? (
      <FontAwesomeIcon icon={faFilter} size={18} color="white" style={{ top: 1 }} />
      ) : (
        <Text style={styles.selectedText} numberOfLines={1}>
          {selectedOption}
        </Text>
      )}
    </View>
  )}
</TouchableOpacity>
 
 
      {/* Dropdown Modal */}
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
                  style={[
                    styles.option,
                    selectedOption === item && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === item && styles.selectedOptionText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
                {index < options.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
 
      {/* ... your custom date modal, month/year pickers etc. remain the same */}
    </View>
  );
};
 
const styles = StyleSheet.create({
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    left: 12,
    backgroundColor: "#3E89EC",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#e9ecef",
    paddingHorizontal: 7,
    paddingVertical: 6,
    minWidth: 20,
    minHeight: 15,
    top: 4,
    justifyContent: "center",
  },
  selectedText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 200,
  },
  iconText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
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
});
 
export default DateFilter;