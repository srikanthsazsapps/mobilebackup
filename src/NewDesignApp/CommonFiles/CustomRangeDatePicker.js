import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
 
const width = Dimensions.get("window").width;
 
const months = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
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
 
const CustomRangeDatePicker = ({ visible, onClose, onSelectRange }) => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
 
  // Set default startTime to "8:00 AM" and endTime to "8:00 PM"
  const [startTime, setStartTime] = useState("8:00 AM");
  const [endTime, setEndTime] = useState("8:00 PM");
 
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(null); // "start" or "end"
 
  const [yearRangeStart, setYearRangeStart] = useState(year - 5); // show 10-year chunks
 
  const datesMatrix = getMonthMatrix(month, year);
 
  // Reset default times on modal show
useEffect(() => {
  if (visible) {
    const today = new Date();
    setMonth(today.getMonth());
    setYear(today.getFullYear());
    setStartDate(today);   // ✅ mark today as start
    setEndDate(today);     // ✅ also mark today as end
    setStartTime("8:00 AM");
    setEndTime("8:00 PM");
  }
}, [visible]);
 
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
 
  const formatDate = (d) => {
    if (!d) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };
 
  const handleConfirm = () => {
    if (onSelectRange && startDate && endDate && startTime && endTime) {
      onSelectRange({
        start: `${formatDate(startDate)} ${startTime}`,
        end: `${formatDate(endDate)} ${endTime}`,
      });
    }
    onClose && onClose();
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
 
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>Select Date Range</Text>
 
          {/* Month Header */}
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
 
          {/* Calendar */}
          <View style={styles.calendarContainer}>
            <View style={styles.weekdays}>
              {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
                <Text key={d} style={styles.weekday}>{d}</Text>
              ))}
            </View>
            {datesMatrix.map((week, i) => (
              <View key={i} style={styles.weekRow}>
                {week.map((date, j) => {
                  const isSelectedStart =
                    startDate && date &&
                    startDate.getDate() === date &&
                    startDate.getMonth() === month &&
                    startDate.getFullYear() === year;
                  const isSelectedEnd =
                    endDate && date &&
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
                        isSelectedStart || isSelectedEnd
                          ? styles.dayBoxSelected
                          : isBetween
                          ? styles.dayBoxRange
                          : null,
                      ]}
                      disabled={!date}
                      onPress={() => date && handleDateSelect(date)}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isSelectedStart || isSelectedEnd
                            ? styles.dayTextSelected
                            : null,
                        ]}
                      >
                        {date ? String(date).padStart(2, "0") : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
 
          {/* Time Pickers */}
          <View style={styles.timeRow}>
            <TouchableOpacity
              style={styles.timeBtn}
              onPress={() => setShowTimePicker("start")}
            >
              <Text style={styles.timeText}>⏰ Start: {startTime || "--:--"}</Text>
            </TouchableOpacity>
 
            <TouchableOpacity
              style={styles.timeBtn}
              onPress={() => setShowTimePicker("end")}
            >
              <Text style={styles.timeText}>⏰ End: {endTime || "--:--"}</Text>
            </TouchableOpacity>
          </View>
 
          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.selectBtn,
                !(startDate && endDate && startTime && endTime) && { opacity: 0.5 },
              ]}
              disabled={!(startDate && endDate && startTime && endTime)}
              onPress={handleConfirm}
            >
              <Text style={styles.selectBtnText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
 
      {/* Time Picker Modal */}
      {showTimePicker && (
        <Modal transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.timePopup}>
              <Text style={styles.timeTitle}>
                Select {showTimePicker === "start" ? "Start" : "End"} Time
              </Text>
              <FlatList
                data={timeSlots}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.timeOption}
                    onPress={() => {
                      if (showTimePicker === "start") setStartTime(item);
                      else setEndTime(item);
                      setShowTimePicker(null);
                    }}
                  >
                    <Text style={styles.timeOptionText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowTimePicker(null)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
 
      {/* Month Picker Modal */}
      {showMonthPicker && (
        <Modal transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.monthPopup}>
              <Text style={styles.timeTitle}>Select Month</Text>
              <View style={styles.monthGrid}>
                {months.map((m, i) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.monthBox,
                      i === month && styles.monthBoxSelected,
                    ]}
                    onPress={() => {
                      setMonth(i);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthText,
                        i === month && styles.monthTextSelected,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowMonthPicker(false)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
 
      {/* Year Picker Modal */}
      {showYearPicker && (
        <Modal transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.monthPopup}>
              <Text style={styles.timeTitle}>Select Year</Text>
              <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => setYearRangeStart(yearRangeStart - 10)}>
                  <Text style={styles.arrow}>◀</Text>
                </TouchableOpacity>
                <Text style={styles.subtitle}>
                  {yearRangeStart} - {yearRangeStart + 9}
                </Text>
                <TouchableOpacity onPress={() => setYearRangeStart(yearRangeStart + 10)}>
                  <Text style={styles.arrow}>▶</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.monthGrid}>
                {Array.from({ length: 10 }, (_, i) => yearRangeStart + i).map((y) => (
                  <TouchableOpacity
                    key={y}
                    style={[
                      styles.monthBox,
                      y === year && styles.monthBoxSelected,
                    ]}
                    onPress={() => {
                      setYear(y);
                      setShowYearPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.monthText,
                        y === year && styles.monthTextSelected,
                      ]}
                    >
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowYearPicker(false)}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};
 
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
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
  title: { fontSize: 18, fontWeight: "600", color: "#222", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#3578d6", fontWeight: "700", marginBottom: 7 },
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
    width: 36, textAlign: "center", color: "#666", fontWeight: "600", fontSize: 13,
  },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayBox: {
    width: 36, height: 36, margin: 1, borderRadius: 9,
    justifyContent: "center", alignItems: "center",
  },
  dayBoxEnabled: { backgroundColor: "#f7fafb" },
  dayBoxDisabled: { backgroundColor: "transparent" },
  dayBoxSelected: { backgroundColor: "#4A90E2" },
  dayBoxRange: { backgroundColor: "#cfe2f9" },
  dayText: { fontSize: 14, color: "#222", fontWeight: "500" },
  dayTextSelected: { color: "#fff", fontWeight: "700" },
  buttonRow: {
    flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 10,
  },
  selectBtn: {
    paddingHorizontal: 22, paddingVertical: 10,
    backgroundColor: "#f1f7fd", borderRadius: 8, marginRight: 8,
  },
  selectBtnText: { color: "#3578d6", fontWeight: "600", fontSize: 15 },
  closeBtn: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 8, backgroundColor: "#f3f3f7", marginTop: 10, alignItems: "center",
  },
  closeText: { color: "#888", fontSize: 15, fontWeight: "500" },
 
  // Time Picker styles
  timeRow: {
    flexDirection: "row", justifyContent: "space-between", width: "100%", marginVertical: 10,
  },
  timeBtn: {
    flex: 1, marginHorizontal: 5, paddingVertical: 10,
    backgroundColor: "#f1f7fd", borderRadius: 8, alignItems: "center",
  },
  timeText: { fontSize: 15, color: "#3578d6", fontWeight: "600" },
  timePopup: {
    width: width * 0.7, maxHeight: "60%", backgroundColor: "#fff",
    borderRadius: 16, padding: 16,
  },
  timeTitle: { fontSize: 17, fontWeight: "700", marginBottom: 10 },
  timeOption: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee",
  },
  timeOptionText: { fontSize: 16, color: "#222" },
 
  // Month / Year picker styles
  monthPopup: {
    width: width * 0.8, backgroundColor: "#fff", borderRadius: 16,
    padding: 16, alignItems: "center",
  },
  monthGrid: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "center",
  },
  monthBox: {
    width: "25%", padding: 12, margin: 4, borderRadius: 8,
    backgroundColor: "#f3f6fb", alignItems: "center",
  },
  monthBoxSelected: { backgroundColor: "#4A90E2" },
  monthText: { fontSize: 15, fontWeight: "500", color: "#333" },
  monthTextSelected: { color: "#fff", fontWeight: "700" },
});
 
export default CustomRangeDatePicker;
 
 