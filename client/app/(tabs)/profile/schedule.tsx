import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, Linking } from 'react-native';
import { useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FONT } from '../../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { axiosWithAuth } from '../../utils/customAxios';
import { ipURL } from '../../utils/utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { goBack } from '../../utils/navigation';

const SchedulePage = () => {
  const segments = useSegments() as string[];
  const [events, setEvents] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem("userDetails"));
        setUserDetails(user);

        const response = await axiosWithAuth.get(`${ipURL}/api/bookings/upcoming-classes`);
        const isTeacher = !!user?.isTeacher;

        const formattedEvents = response.data.map((classData) => ({
          id: classData.id,
          title: `${classData.subject.subjectName} Class`,
          instructor: isTeacher ? classData.student.name : classData.teacher.name,
          date: classData.bookingDate,
          time: classData.bookingTime,
          subject: classData.subject.subjectName,
          status: 'upcoming',
          zoomUrl: classData.bookingZoomUrl,
          subjectId: classData.subject?.id,
          teacherId: classData.teacher?.id,
          studentId: classData.student?.id
        }));

        setEvents(formattedEvents);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to fetch schedule data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedEvents = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedEvents).sort();

  const formatDate = (dateString) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleEventPress = (event) => {
    Alert.alert(
      event.title,
      `With: ${event.instructor}\nDate: ${formatDate(event.date)}\nTime: ${event.time}\nSubject: ${event.subject}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => Linking.openURL(event.zoomUrl) }
      ]
    );
  };

  const header = (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => goBack(segments.includes('home') ? '/(tabs)/home' : '/(tabs)/profile')}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={24} color="#12263A" />
      </TouchableOpacity>
      <View style={styles.headerText}>
        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.subtitle}>Your upcoming classes</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        {header}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A4C6E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      {header}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Upcoming classes</Text>
          <Text style={styles.summaryCount}>
            {events.length} {events.length === 1 ? 'class' : 'classes'} scheduled
          </Text>
        </View>

        {sortedDates.length > 0 ? (
          sortedDates.map((date) => (
            <View key={date} style={styles.dateSection}>
              <Text style={styles.dateHeader}>{formatDate(date)}</Text>
              {groupedEvents[date].map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => handleEventPress(event)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel={`${event.title} at ${event.time}`}
                >
                  <View style={styles.eventTime}>
                    <Ionicons name="time-outline" size={16} color="#5C6B76" />
                    <Text style={styles.timeText}>{event.time}</Text>
                  </View>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.withText}>with {event.instructor}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={40} color="#5C6B76" />
            <Text style={styles.emptyText}>No upcoming classes</Text>
            <Text style={styles.emptySubText}>Booked classes will show up here.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(12),
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 4,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#12263A',
  },
  subtitle: {
    marginTop: 2,
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5C6B76',
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(32),
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 16,
    marginBottom: verticalScale(16),
  },
  summaryTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
  },
  summaryCount: {
    marginTop: 4,
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5C6B76',
  },
  dateSection: {
    marginBottom: verticalScale(16),
  },
  dateHeader: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#5C6B76',
    marginBottom: 8,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 14,
    marginBottom: 10,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  timeText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  eventTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
  },
  withText: {
    marginTop: 4,
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(48),
    paddingHorizontal: 24,
  },
  emptyText: {
    marginTop: 12,
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 6,
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5C6B76',
    textAlign: 'center',
  },
});

export default SchedulePage;
