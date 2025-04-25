import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { FONT } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ipURL } from '../utils/utils';
import { Ionicons } from '@expo/vector-icons';

interface BookingCalendarProps {
  teacherId: string;
  subjectId: string;
  onClose: () => void;
  visible: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ teacherId, subjectId, onClose, visible }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(false);

  console.log(markedDates,'---markedDates');
  

  // Generate time slots from 9 AM to 5 PM
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push({
        time: `${hour}:00`,
        available: true
      });
    }
    return slots;
  };

  useEffect(() => {
    if (selectedDate) {
      fetchTeacherAvailability();
    }
  }, [selectedDate]);

  const fetchTeacherAvailability = async () => {
    try {
      setLoading(true);
      console.log(selectedDate);
      
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(`${ipURL}/api/bookings/teacher/availability/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { date: selectedDate }
      });

      // Mark unavailable dates in the calendar
      const unavailableDates = response.data.unavailableDates || [];
      const marked = {};
      unavailableDates.forEach(date => {
        marked[date] = { disabled: true, disableTouchEvent: true, fullBooked: false };
      });
      setMarkedDates(marked);

      // Update time slots based on availability
      const availableSlots = generateTimeSlots();
      const bookedSlots = response.data.bookedSlots || [];
      const updatedSlots = availableSlots.map(slot => ({
        ...slot,
        available: !bookedSlots.includes(slot.time)
      }));
      setTimeSlots(updatedSlots);
    } catch (error) {
      console.error('Error fetching teacher availability:', error);
      Alert.alert('Error', 'Failed to fetch teacher availability');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };

  const handleTimeSlotSelect = async (time: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const userDetails = await AsyncStorage.getItem('userDetails');
      const userId = JSON.parse(userDetails).userId;

      const response = await axios.post(`${ipURL}/api/bookings`, {
        teacherId,
        subjectId,
        studentId: userId,
        date: selectedDate,
        time,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      Alert.alert('Success', 'Session booked successfully!');
      onClose();
    } catch (error) {
      console.error('Error booking session:', error);
      Alert.alert('Error', 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Book a Session</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1A4C6E" />
            </TouchableOpacity>
          </View>

          <Calendar
            onDayPress={handleDateSelect}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                selected: false,
                selectedColor: '#2DCB63',
                fullBooked: false,
              },
            }}
            minDate={new Date().toISOString().split('T')[0]}
            theme={{
              todayTextColor: '#2DCB63',
              selectedDayBackgroundColor: '#2DCB63',
              selectedDayTextColor: '#ffffff',
              textDayFontFamily: FONT.regular,
              textMonthFontFamily: FONT.bold,
              textDayHeaderFontFamily: FONT.medium,
              textDayFontSize: moderateScale(14),
              textMonthFontSize: moderateScale(16),
              textDayHeaderFontSize: moderateScale(14),
            }}
          />

          {selectedDate && (
            <View style={styles.timeSlotsContainer}>
              <Text style={styles.timeSlotsTitle}>Available Time Slots</Text>
              <View style={styles.timeSlotsGrid}>
                {timeSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      !slot.available && styles.unavailableSlot
                    ]}
                    onPress={() => slot.available && handleTimeSlotSelect(slot.time)}
                    disabled={!slot.available || loading}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      !slot.available && styles.unavailableSlotText
                    ]}>
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(20),
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A4C6E',
  },
  timeSlotsContainer: {
    marginTop: verticalScale(20),
  },
  timeSlotsTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A4C6E',
    marginBottom: verticalScale(15),
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '30%',
    padding: moderateScale(10),
    borderRadius: moderateScale(8),
    backgroundColor: '#F8F9FA',
    marginBottom: verticalScale(10),
    alignItems: 'center',
  },
  unavailableSlot: {
    backgroundColor: '#E8E8E8',
  },
  timeSlotText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#1A4C6E',
  },
  unavailableSlotText: {
    color: '#999999',
  },
});

export default BookingCalendar; 