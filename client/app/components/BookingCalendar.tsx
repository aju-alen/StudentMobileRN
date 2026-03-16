import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { FONT } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ipURL } from '../utils/utils';
import { Ionicons } from '@expo/vector-icons';
import BookingSummaryModal from './BookingSummaryModal';
import { axiosWithAuth } from '../utils/customAxios';
import { router } from 'expo-router';

interface SubjectTopic {
  id: string;
  orderIndex: number;
  topicTitle: string;
  hours: number;
  scheduledAt?: string | null;
}

interface BookingCalendarProps {
  teacherId: string;
  teacherProfileId?: string;
  subjectId: string;
  onClose: () => void;
  visible: boolean;
  courseType?: 'SINGLE_STUDENT' | 'SINGLE_PACKAGE';
  subjectTopics?: SubjectTopic[];
  subjectDuration?: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ teacherId, teacherProfileId, subjectId, onClose, visible, courseType = 'SINGLE_STUDENT', subjectTopics, subjectDuration }) => {
  const isPackage = courseType === 'SINGLE_PACKAGE' && subjectTopics && subjectTopics.length > 0;
  const sortedTopics = isPackage ? [...(subjectTopics || [])].sort((a, b) => a.orderIndex - b.orderIndex) : [];
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [topicSlots, setTopicSlots] = useState<Record<string, { date: string; time: string }>>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [summaryTopicSlots, setSummaryTopicSlots] = useState<{ subjectTopicId: string; date: string; time: string }[]>([]);

  // Generate time slots from 9 AM to 5 PM (HH:mm format to match backend)
  const generateTimeSlots = () => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        available: true
      });
    }
    return slots;
  };

  useEffect(() => {
    if (selectedDate) {
      fetchTeacherAvailability();
    }
  }, [selectedDate, isPackage ? currentTopicIndex : -1, topicSlots]);

  const fetchTeacherAvailability = async () => {
    try {
      setLoading(true);
      const availabilityTeacherId = teacherProfileId || teacherId;
      const response = await axiosWithAuth.get(`${ipURL}/api/bookings/available/${availabilityTeacherId}`, {
        params: { date: selectedDate }
      });

      // Mark unavailable dates in the calendar
      const unavailableDates = response.data.unavailableDates || [];
      const marked = {};
      unavailableDates.forEach((d: string) => {
        marked[d] = { disabled: true, disableTouchEvent: true, fullBooked: false };
      });
      setMarkedDates(marked);

      // Update time slots based on availability (bookedSlots use HH:mm format)
      const availableSlots = generateTimeSlots();
      const backendBookedSlots: string[] = response.data.bookedSlots || [];

      // Normalize times to HH:mm for consistent comparison (handles "9:00" vs "09:00", "1:00" vs "01:00")
      const normalizeTime = (t: string) => {
        const parts = String(t || '').trim().split(':');
        const h = parseInt(parts[0], 10);
        const m = parts[1] != null ? parseInt(parts[1], 10) : 0;
        return `${(isNaN(h) ? 0 : h).toString().padStart(2, '0')}:${(isNaN(m) ? 0 : m).toString().padStart(2, '0')}`;
      };

      // 1) Backend-booked slots (teacher + student existing bookings)
      const normalizedBackend = backendBookedSlots.map(normalizeTime);

      // 2) Session temp: slots blocked by topics already chosen in THIS booking flow (not sent to backend yet)
      const sessionBlockedSlots: string[] = [];
      if (isPackage && selectedDate && Object.keys(topicSlots).length > 0) {
        Object.entries(topicSlots).forEach(([topicId, slot]) => {
          if (!slot?.date || slot.date !== selectedDate) return;
          const topic = sortedTopics.find(t => t.id === topicId);
          if (!topic) return;
          const normalizedStart = normalizeTime(slot.time);
          const [startHour] = normalizedStart.split(':').map(Number);
          const topicDuration = Math.min(3, Math.max(1, topic.hours));
          for (let i = 0; i < topicDuration; i++) {
            const hour = startHour + i;
            if (hour >= 0 && hour <= 23) {
              sessionBlockedSlots.push(`${hour.toString().padStart(2, '0')}:00`);
            }
          }
        });
      }

      // Merge backend + session blocked slots
      const allBlockedTimes = [...normalizedBackend, ...sessionBlockedSlots];
      const bookedSet = new Set(allBlockedTimes);

      // For SINGLE_PACKAGE: slot is available only if full duration fits (topic hours 1-3)
      // AND none of the hours in that block overlap any blocked time (backend bookings or previous topics)
      const durationHours = isPackage && sortedTopics[currentTopicIndex]
        ? Math.min(3, Math.max(1, sortedTopics[currentTopicIndex].hours))
        : Math.min(2, Math.max(1, subjectDuration ?? 1));

      // For the selected date, prevent booking past times on *today*:
      // - Find current local time
      // - Ceil to the next full hour (10:10 → 11:00). If already at an exact hour (10:00),
      //   allow from that hour onward.
      const todayStr = new Date().toISOString().split('T')[0];
      const isToday = selectedDate === todayStr;
      let minAllowedHourForToday = 0;
      if (isToday) {
        const now = new Date();
        let hour = now.getHours();
        if (now.getMinutes() > 0 || now.getSeconds() > 0 || now.getMilliseconds() > 0) {
          hour += 1;
        }
        minAllowedHourForToday = hour;
      }

      const updatedSlots = availableSlots.map(slot => {
        const normalizedSlotTime = normalizeTime(slot.time);
        const [h] = normalizedSlotTime.split(':').map(Number);

        // For 1-hour topics just ensure this exact slot is not blocked
        if (durationHours === 1) {
          let available = !bookedSet.has(normalizedSlotTime);
          if (isToday && h < minAllowedHourForToday) {
            available = false;
          }
          return { ...slot, available };
        }

        // For multi-hour topics: every hour in the block must be free (no overlap at all)
        // Example: existing booking 10–12 blocks 10:00 and 11:00.
        // A 3h topic starting at 09:00 needs 09:00,10:00,11:00 -> overlaps 10:00 and 11:00 -> NOT allowed.
        let allFree = true;
        for (let i = 0; i < durationHours; i++) {
          const checkHour = h + i;
          if (checkHour > 17) {
            allFree = false;
            break;
          }
          const checkTime = `${checkHour.toString().padStart(2, '0')}:00`;
          if (bookedSet.has(checkTime)) {
            allFree = false;
            break;
          }
        }
        let available = allFree;
        if (isToday && h < minAllowedHourForToday) {
          available = false;
        }
        return { ...slot, available };
      });
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
    setSelectedTime(time);
    if (isPackage && sortedTopics[currentTopicIndex]) {
      const topic = sortedTopics[currentTopicIndex];
      const nextSlots = { ...topicSlots, [topic.id]: { date: selectedDate, time } };
      setTopicSlots(nextSlots);
      if (currentTopicIndex < sortedTopics.length - 1) {
        setCurrentTopicIndex(currentTopicIndex + 1);
        setSelectedDate('');
        setSelectedTime('');
        setMarkedDates({});
        setTimeSlots(generateTimeSlots());
      } else {
        setSummaryTopicSlots(
          sortedTopics.map((t) => ({ subjectTopicId: t.id, date: nextSlots[t.id].date, time: nextSlots[t.id].time }))
        );
        setShowSummary(true);
      }
    } else {
      setShowSummary(true);
    }
  };

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const userDetails = await AsyncStorage.getItem('userDetails');
      const userId = JSON.parse(userDetails).userId;

      // const response = await axios.post(`${ipURL}/api/bookings`, {
      //   teacherId,
      //   subjectId,
      //   studentId: userId,
      //   date: selectedDate,
      //   time: selectedTime,
      // }, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      Alert.alert('Success', 'Session booked successfully!');
      setShowSummary(false);
      onClose();
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Error booking session:', error);
      Alert.alert('Error', 'Failed to book session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible && !showSummary}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>
                {isPackage
                  ? `Book topic ${currentTopicIndex + 1} of ${sortedTopics.length}: ${sortedTopics[currentTopicIndex]?.topicTitle ?? ''}`
                  : 'Book a Session'}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#1A4C6E" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Calendar
                onDayPress={handleDateSelect}
                markedDates={{
                  ...markedDates,
                  [selectedDate]: {
                    selected: true,
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
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#2DCB63" />
                    </View>
                  ) : (
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
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <BookingSummaryModal
        visible={showSummary}
        onClose={() => {
          setShowSummary(false);
          if (isPackage) {
            setCurrentTopicIndex(0);
            setTopicSlots({});
            setSummaryTopicSlots([]);
          }
        }}
        teacherId={teacherId}
        subjectId={subjectId}
        date={summaryTopicSlots.length ? summaryTopicSlots[0]?.date ?? selectedDate : selectedDate}
        time={summaryTopicSlots.length ? summaryTopicSlots[0]?.time ?? selectedTime : selectedTime}
        onConfirm={handleConfirmBooking}
        topicSlots={summaryTopicSlots.length ? summaryTopicSlots : undefined}
      />
    </>
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
    maxHeight: '85%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(20),
    paddingBottom: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A4C6E',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(20),
  },
  timeSlotsContainer: {
    marginTop: verticalScale(25),
  },
  loadingContainer: {
    paddingVertical: verticalScale(40),
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(8),
    borderRadius: moderateScale(10),
    backgroundColor: '#F8F9FA',
    marginBottom: verticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: moderateScale(44),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unavailableSlot: {
    backgroundColor: '#E8E8E8',
    borderColor: '#D1D5DB',
    opacity: 0.6,
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