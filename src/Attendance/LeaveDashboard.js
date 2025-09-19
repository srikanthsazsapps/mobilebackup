import React, { useState,useEffect } from "react";
import { Text, View, StyleSheet, ImageBackground, Image, Modal, TouchableWithoutFeedback, TouchableOpacity, Alert } from "react-native";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faCalendarAlt, faChevronDown, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { ScrollView, TextInput } from "react-native-gesture-handler";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Calendar } from 'react-native-calendars';
import LottieView from "lottie-react-native";
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import GlobalStyle from '../components/common/GlobalStyle';
import NetworkErrorModal from "../QuarryAdmin/NetworkErrorModal";
import NetInfo from '@react-native-community/netinfo';

const LeaveDashboard = () => {
    const [selectedLeave, setSelectedLeave] = useState("");
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [showFromDatePicker, setShowFromDatePicker] = useState(false);
    const [showToDatePicker, setShowToDatePicker] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [notes, setNotes] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const watermarkIcon = require('../images/LogoWaterMark.png');
    const [isConnected, setIsConnected] = useState(true);
    const [showNetworkError, setShowNetworkError] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [refreshing, setRefreshing] = useState(false);


    const [errors, setErrors] = useState({
        fromDate: '',
        toDate: '',
        leaveType: '',
        notes: ''
    });

    const navigation = useNavigation();

    const leaveTypes = [
        "Casual Leave",
        "Sick Leave",
    ];

    const handleMonthChange = (month) => {
        setCurrentMonth(month.month);
    };

    const calendarTheme = {
        textMonthFontWeight: 'bold',
        textMonthFontSize: 16,
        textMonthFontFamily: 'Arial',
        textMonthFontColor: '#000',
        selectedDayBackgroundColor: '#3E89EC',
        todayTextColor: '#3E89EC',
        arrowColor: '#3E89EC',
    };

    const toggleDropdown = () => {
        setDropdownVisible(!isDropdownVisible);
    };

    const selectLeaveType = (leaveType) => {
        setSelectedLeave(leaveType);
        setDropdownVisible(false);
        setErrors(prev => ({ ...prev, leaveType: '' }));
    };

    const onFromDateSelect = (day) => {
        setFromDate(new Date(day.dateString));
        setShowFromDatePicker(false);
        setErrors(prev => ({ ...prev, fromDate: '' }));
    };

    const onToDateSelect = (day) => {
        setToDate(new Date(day.dateString));
        setShowToDatePicker(false);
        setErrors(prev => ({ ...prev, toDate: '' }));
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected && state.isInternetReachable);
            
            // If internet is restored, hide network error
            if (state.isConnected && state.isInternetReachable && error) {
                setShowNetworkError(false);
                setError(null);
            } else if (!state.isConnected || !state.isInternetReachable) {
                setShowNetworkError(true);
                setError("Network connectivity issue");
            }
        });
        
        return () => unsubscribe();
    }, [error]);

    const validateForm = () => {
        const newErrors = {
            fromDate: !fromDate ? 'Please select a from date' : '',
            toDate: !toDate ? 'Please select a to date' : '',
            leaveType: !selectedLeave ? 'Please select a leave type' : '',
            notes: !notes.trim() ? 'Please provide leave reason' : '' 
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    const handleSubmit = () => {
        if (!isConnected) {
            setShowNetworkError(true);
            return;
        }

        if (validateForm()) {
            setIsLoading(true);
            
            // Simulate API call
            setTimeout(() => {
                setIsLoading(false);
                setShowSuccessMessage(true);
                setTimeout(() => {
                    setShowSuccessMessage(false);
                    handleClose();
                    navigation.navigate('AttendanceHome');
                }, 2000);
            }, 1000);
        }
    };


    const handleClose = () => {
        setSelectedLeave("");
        setShowSuccessMessage(false);
        setFromDate(null);
        setToDate(null);
        setNotes('');
        setErrors({
            fromDate: '',
            toDate: '',
            leaveType: '',
            notes: ''
        });
    };

    const onRefresh = () => {
        setRefreshing(true);
        setIsLoading(true);
        
        // Simulate checking connection and refreshing data
        NetInfo.fetch().then(state => {
            if (state.isConnected && state.isInternetReachable) {
                setShowNetworkError(false);
                setError(null);
            } else {
                setShowNetworkError(true);
                setError("Network connectivity issue");
            }
            setRefreshing(false);
            setIsLoading(false);
        });
    };

    if (showNetworkError && !refreshing) {
        return (
            <NetworkErrorModal 
                visible={showNetworkError} 
                onRefresh={onRefresh} 
            />
        );
    }


    
    return (
        <View style={styles.container}>
            <ImageBackground
                source={watermarkIcon}
                resizeMode="contain"
                imageStyle={styles.imageStyle}
                style={styles.headerBackground}
            >
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={[GlobalStyle.heading1, styles.headerText]}>Leave Request</Text>
                    </View>
                </View>
            </ImageBackground>


            <View style={styles.leaveBalanceContainer}>
                <View style={styles.leaveCard}>
                    <Text style={[GlobalStyle.heading7, styles.leaveTypeText]}>Casual Leave</Text>
                    <Text style={[GlobalStyle.heading7, styles.leaveBalanceText]}></Text>
                    <View style={[styles.progressBar, { width: '60%' }]}></View>
                </View>
                <View style={styles.leaveCard}>
                    <Text style={[GlobalStyle.heading7, styles.leaveTypeText]}>Sick Leave</Text>
                    <Text style={[GlobalStyle.heading7, styles.leaveBalanceText]}></Text>
                    <View style={[styles.progressBar, { width: '50%' }]}></View>
                </View>
            </View>

            <ScrollView style={styles.formContainer}>
                {/* Leave Type Selection */}
                <View style={styles.inputContainer}>
                    <Text style={[GlobalStyle.heading7, styles.inputLabel]}>Leave type</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={toggleDropdown}
                    >
                        <Image
                            source={require('../images/leave.png')}
                            style={styles.profileImage}
                        />
                        <Text style={[GlobalStyle.heading8, styles.inputText, !selectedLeave && styles.placeholderText]}>
                            {selectedLeave || "Select leave type"}
                        </Text>
                        <FontAwesomeIcon icon={faChevronDown} size={16} color="#777" />
                    </TouchableOpacity>
                    {errors.leaveType ? <Text style={[GlobalStyle.heading8,styles.errorText]}>{errors.leaveType}</Text> : null}
                </View>

                {/* Dropdown for Leave Types */}
                {isDropdownVisible && (
                    <View style={styles.dropdownList}>
                        {leaveTypes.map((leaveType, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.dropdownItem}
                                onPress={() => selectLeaveType(leaveType)}
                            >
                                <Text style={[GlobalStyle.heading8, styles.dropdownItemText]}>{leaveType}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* From Date Selection */}
                <View style={styles.inputContainer}>
                    <Text style={[GlobalStyle.heading7, styles.inputLabel]}>From date</Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowFromDatePicker(true)}
                    >
                        <Image
                            source={require('../images/frmdte.png')}
                            style={styles.profileImage}
                        />
                        <Text style={[GlobalStyle.heading8, styles.inputText, !fromDate && styles.placeholderText]}>
                            {fromDate ? fromDate.toLocaleDateString() : "Select date"}
                        </Text>
                        <Image
                            source={require('../images/clndr.png')}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                    {errors.fromDate ? <Text style={[GlobalStyle.heading8,styles.errorText]}>{errors.fromDate}</Text> : null}
                </View>

                {/* To Date Selection */}
                <View style={styles.inputContainer}>
                    <Text style={[GlobalStyle.heading7, styles.inputLabel]}>To date </Text>
                    <TouchableOpacity
                        style={styles.input}
                        onPress={() => setShowToDatePicker(true)}
                    >
                        <Image
                            source={require('../images/todte.png')}
                            style={styles.profileImage}
                        />
                        <Text style={[GlobalStyle.heading8, styles.inputText, !toDate && styles.placeholderText]}>
                            {toDate ? toDate.toLocaleDateString() : "Select date"}
                        </Text>
                        <Image
                            source={require('../images/clndr.png')}
                            style={styles.profileImage}
                        />
                    </TouchableOpacity>
                    {errors.toDate ? <Text style={[GlobalStyle.heading8,styles.errorText]}>{errors.toDate}</Text> : null}
                </View>

                {/* Notes Input */}
                <View style={styles.inputContainer}>
                    <Text style={[GlobalStyle.heading7, styles.inputLabel]}>Make your notes</Text>
                    <TextInput
                        style={[GlobalStyle.heading8, styles.textArea]}
                        placeholder="Enter your leave reason here..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={(text) => {
                            setNotes(text);
                            if (text.trim()) {
                                setErrors(prev => ({ ...prev, notes: '' }));
                            }
                        }}
                    />
                    {errors.notes ? <Text style={styles.errorText}>{errors.notes}</Text> : null}
                    <Text style={[GlobalStyle.heading8, styles.characterLimit]}>Maximum 100 Characters</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                        <Text style={[GlobalStyle.heading7, styles.cancelButtonText]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={[GlobalStyle.heading7, styles.submitButtonText]}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* From Date Calendar Modal */}
            <Modal
                transparent={true}
                visible={showFromDatePicker}
                animationType="slide"
            >
                <TouchableWithoutFeedback onPress={() => setShowFromDatePicker(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.calendarContainer}>
                            <Calendar
                                onDayPress={onFromDateSelect}
                                markedDates={{
                                    [fromDate?.toISOString().split('T')[0]]: { selected: true, selectedColor: '#3E89EC' }
                                }}
                                theme={calendarTheme}
                                onMonthChange={handleMonthChange}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowFromDatePicker(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* To Date Calendar Modal */}
            <Modal
                transparent={true}
                visible={showToDatePicker}
                animationType="slide"
            >
                <TouchableWithoutFeedback onPress={() => setShowToDatePicker(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.calendarContainer}>
                            <Calendar
                                onDayPress={onToDateSelect}
                                markedDates={{
                                    [toDate?.toISOString().split('T')[0]]: { selected: true, selectedColor: '#3E89EC' }
                                }}
                                theme={calendarTheme}
                                onMonthChange={handleMonthChange}
                            />
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setShowToDatePicker(false)}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Success Message Modal */}
            {showSuccessMessage && (
                <Modal
                    transparent={true}
                    visible={showSuccessMessage}
                    animationType="slide"
                >
                    <View style={styles.successModalOverlay}>
                        <View style={styles.successCard}>
                            <Text style={[GlobalStyle.heading6,styles.successText]}>Leave Request Applied Successfully</Text>
                            <LottieView
                                style={styles.successAnimation}
                                source={require('../images/Animation3.json')}
                                autoPlay={true}
                                loop={true}
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F3ED',
    },
    imageStyle: {
        width: scale(200),
        marginTop: verticalScale(17),
        height: verticalScale(170),
        alignSelf: 'flex-end',
        marginVertical: verticalScale(20),
        marginLeft: scale(150),
    },
    header: {
        paddingVertical: hp('5%'),
        flexDirection: 'row',
        bottom: verticalScale(3),
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        color: '#FFFFFF',
        marginLeft: scale(12),
        bottom: scale(22),
    },

    headerBackground: {
        height: verticalScale(180),
        backgroundColor: '#3E89EC',
        paddingTop: verticalScale(25),
        paddingHorizontal: scale(20),
    },

    leaveBalanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: wp('5%'),
        marginTop: -hp('13%'),
    },
    leaveCard: {
        backgroundColor: 'white',
        borderRadius: wp('4%'),
        padding: wp('4%'),
        width: wp('42%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    leaveTypeText: {
        color: '#000',
        marginBottom: hp('1%'),
    },
    leaveBalanceText: {
        color: '#333',
        marginBottom: hp('1%'),
    },
    profileImage: {
        width: scale(20),
        height: scale(20),
        right: scale(3),
        alignItems: 'center',
        bottom: verticalScale(1),
    },
    progressBar: {
        height: hp('0.2%'),
        backgroundColor: 'grey',
        borderRadius: 5,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: wp('5%'),
        paddingTop: hp('3%'),
    },
    inputContainer: {
        marginBottom: hp('2%'),
    },
    inputLabel: {
        color: '#555',
        marginBottom: hp('0.5%'),
    },
    input: {
        backgroundColor: 'white',
        borderRadius: wp('4%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.5%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    inputIcon: {
        marginRight: wp('2%'),
    },
    inputText: {
        flex: 1,
        color: '#000',
    },
    placeholderText: {
        color: '#999',
    },
    textArea: {
        backgroundColor: 'white',
        borderRadius: wp('4%'),
        paddingHorizontal: wp('4%'),
        paddingVertical: hp('1.5%'),
        borderWidth: 1,
        borderColor: '#DDD',
        height: hp('15%'),
        textAlignVertical: 'top',
        fontSize: wp('3.8%'),
    },
    characterLimit: {
        color: '#888',
        marginTop: hp('0.5%'),
        marginLeft: 15,
    },
    errorText: {
        color: 'red',
        // fontSize: wp('3.5%'),
        marginTop: hp('0.5%'),
        marginLeft: scale(5),
    },

    dropdownList: {
        backgroundColor: 'white',
        borderRadius: wp('3%'),
        marginTop: -hp('1.5%'),
        marginBottom: hp('2%'),
        borderWidth: 1,
        borderColor: '#DDD',
        zIndex: 999,
    },
    dropdownItem: {
        paddingVertical: hp('1.5%'),
        paddingHorizontal: wp('4%'),
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    dropdownItemText: {
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: hp('0%'),
        marginBottom: hp('10%'),
    },
    cancelButton: {
        width: wp('42%'),
        backgroundColor: 'white',
        paddingVertical: hp('1.8%'),
        borderRadius: wp('3%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#DDD',
    },
    submitButton: {
        width: wp('42%'),
        backgroundColor: '#3E89EC',
        paddingVertical: hp('1.8%'),
        borderRadius: wp('3%'),
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#3E89EC',
    },
    submitButtonText: {
        color: 'white',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    calendarContainer: {
        backgroundColor: 'white',
        borderRadius: wp('4%'),
        padding: wp('5%'),
        width: wp('90%'),
    },
    closeButton: {
        backgroundColor: '#3E89EC',
        paddingVertical: hp('1.5%'),
        borderRadius: wp('2%'),
        alignItems: 'center',
        marginTop: hp('2%'),
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: wp('3.8%'),
    },
    successModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    successCard: {
        backgroundColor: 'white',
        borderTopLeftRadius: wp('8%'),
        borderTopRightRadius: wp('8%'),
        padding: wp('5%'),
        alignItems: 'center',
        paddingBottom: hp('5%'),
    },
    successText: {
        marginTop: hp('3%'),
        marginBottom: hp('2%'),
        color: '#333',
    },
    successAnimation: {
        width: wp('50%'),
        height: hp('25%'),
    },
});

export default LeaveDashboard;