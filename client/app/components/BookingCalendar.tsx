import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { FONT } from '../../constants';
import { moderateScale, verticalScale } from '../utils/metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ipURL } from '../utils/utils';
import { Ionicons } from '@expo/vector-icons';
import BookingSummaryModal from './BookingSummaryModal';
import { axiosWithAuth } from '../utils/customAxios';
import { normalizeHHmm, toUaeParts, uaeDateStr } from '../utils/uaeDateTime';

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

const formatSlotTime = (timeString: string) => {
  const time = normalizeHHmm(timeString);
  const hour = Number(time.slice(0, 2));
  const minute = time.slice(3, 5);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${period}`;
};

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
      const marked = {};
      setMarkedDates(marked);

      // Update time slots based on availability (bookedSlots use HH:mm format)
      const availableSlots = generateTimeSlots();
      const backendBookedSlots: string[] = response.data.bookedSlots || [];

      // Normalize times to HH:mm for consistent comparison (handles "9:00" vs "09:00", "1:00" vs "01:00")
      const normalizeTime = (t: string) => normalizeHHmm(t);

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
      const todayStr = uaeDateStr();
      const isToday = selectedDate === todayStr;
      let minAllowedHourForToday = 0;
      if (isToday) {
        const nowUae = toUaeParts(new Date());
        let hour = nowUae.hour;
        if (nowUae.minute > 0) {
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
      Alert.alert('Error', 'Failed to fetch tutor availability');
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
          <SafeAreaView style={styles.modalContent} edges={['bottom']}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={styles.iconButton} />
              <View style={styles.headerCopy}>
                <Text style={styles.title} numberOfLines={1}>
                  {isPackage ? `Topic ${currentTopicIndex + 1} of ${sortedTopics.length}` : 'Book a session'}
                </Text>
                {isPackage ? (
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {sortedTopics[currentTopicIndex]?.topicTitle ?? ''}
                  </Text>
                ) : (
                  <Text style={styles.subtitle}>Pick a date and time</Text>
                )}
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={22} color="#12263A" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.calendarCard}>
                <Calendar
                  onDayPress={handleDateSelect}
                  markedDates={{
                    ...markedDates,
                    [selectedDate]: {
                      selected: true,
                      selectedColor: '#1A4C6E',
                      fullBooked: false,
                    },
                  }}
                  minDate={uaeDateStr()}
                  theme={{
                    backgroundColor: '#FFFFFF',
                    calendarBackground: '#FFFFFF',
                    todayTextColor: '#1A4C6E',
                    selectedDayBackgroundColor: '#1A4C6E',
                    selectedDayTextColor: '#ffffff',
                    arrowColor: '#1A4C6E',
                    monthTextColor: '#12263A',
                    textSectionTitleColor: '#5C6B76',
                    dayTextColor: '#12263A',
                    textDisabledColor: '#A8B3BD',
                    textDayFontFamily: FONT.regular,
                    textMonthFontFamily: FONT.bold,
                    textDayHeaderFontFamily: FONT.medium,
                    textDayFontSize: moderateScale(14),
                    textMonthFontSize: moderateScale(16),
                    textDayHeaderFontSize: moderateScale(12),
                  }}
                />
              </View>

              {selectedDate && (
                <View style={styles.timeSlotsContainer}>
                  <Text style={styles.timeSlotsTitle}>Available times</Text>
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#1A4C6E" />
                    </View>
                  ) : (
                    <View style={styles.timeSlotsGrid}>
                      {timeSlots.map((slot, index) => {
                        const selected = selectedTime === slot.time;
                        return (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.timeSlot,
                              selected && styles.selectedSlot,
                              !slot.available && styles.unavailableSlot,
                            ]}
                            onPress={() => slot.available && handleTimeSlotSelect(slot.time)}
                            disabled={!slot.available || loading}
                            accessibilityRole="button"
                            accessibilityLabel={formatSlotTime(slot.time)}
                            accessibilityState={{ disabled: !slot.available, selected }}
                          >
                            <Text
                              style={[
                                styles.timeSlotText,
                                selected && styles.selectedSlotText,
                                !slot.available && styles.unavailableSlotText,
                              ]}
                            >
                              {formatSlotTime(slot.time)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
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
    backgroundColor: 'rgba(18, 38, 58, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F4F6F8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    flex: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D7DEE5',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#12263A',
  },
  subtitle: {
    marginTop: 2,
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: verticalScale(20),
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    overflow: 'hidden',
    paddingBottom: 8,
  },
  timeSlotsContainer: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 16,
  },
  loadingContainer: {
    paddingVertical: verticalScale(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotsTitle: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(15),
    color: '#12263A',
    marginBottom: 12,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '31%',
    borderRadius: 12,
    backgroundColor: '#F4F6F8',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    paddingHorizontal: 4,
  },
  selectedSlot: {
    backgroundColor: '#1A4C6E',
    borderColor: '#1A4C6E',
  },
  unavailableSlot: {
    backgroundColor: '#EEF1F4',
    borderColor: '#E6EBF0',
    opacity: 0.55,
  },
  timeSlotText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#12263A',
  },
  selectedSlotText: {
    color: '#FFFFFF',
  },
  unavailableSlotText: {
    color: '#8A97A3',
  },
});

export default BookingCalendar; 