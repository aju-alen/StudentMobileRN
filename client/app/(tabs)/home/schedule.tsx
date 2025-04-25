import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ipURL } from '../../utils/utils';
import { FONT } from '../../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';

// Mock data for calendar events - replace with actual API data
const mockEvents = [
  {
    id: '1',
    title: 'Mathematics Class',
    instructor: 'John Smith',
    date: '2023-05-15',
    time: '10:00 AM - 11:30 AM',
    subject: 'Advanced Mathematics',
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Physics Lab',
    instructor: 'Sarah Johnson',
    date: '2023-05-16',
    time: '2:00 PM - 3:30 PM',
    subject: 'Physics',
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Chemistry Lecture',
    instructor: 'Michael Brown',
    date: '2023-05-18',
    time: '11:00 AM - 12:30 PM',
    subject: 'Chemistry',
    status: 'completed'
  },
  {
    id: '4',
    title: 'Biology Workshop',
    instructor: 'Emily Davis',
    date: '2023-05-20',
    time: '3:00 PM - 4:30 PM',
    subject: 'Biology',
    status: 'upcoming'
  }
];

const SchedulePage = () => {
  const [events, setEvents] = useState(mockEvents);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem("userDetails"));
        setUserDetails(user);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    
    fetchUserDetails();
  }, []);

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(groupedEvents).sort();

  const formatDate = (dateString) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleEventPress = (event) => {
    Alert.alert(
      event.title,
      `Instructor: ${event.instructor}\nDate: ${formatDate(event.date)}\nTime: ${event.time}\nSubject: ${event.subject}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => console.log('Join pressed') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'My Schedule',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#1A2B4B',
          headerTitleStyle: {
            fontFamily: FONT.bold,
          },
        }} 
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.calendarSummary}>
          <Text style={styles.summaryTitle}>Upcoming Classes</Text>
          <Text style={styles.summaryCount}>{events.filter(e => e.status === 'upcoming').length} classes scheduled</Text>
        </View>

        {sortedDates.map((date) => (
          <View key={date} style={styles.dateSection}>
            <Text style={styles.dateHeader}>{formatDate(date)}</Text>
            {groupedEvents[date].map((event) => (
              <TouchableOpacity 
                key={event.id} 
                style={[
                  styles.eventCard,
                  event.status === 'completed' && styles.completedEvent
                ]}
                onPress={() => handleEventPress(event)}
              >
                <View style={styles.eventTime}>
                  <Ionicons name="time-outline" size={16} color="#64748B" />
                  <Text style={styles.timeText}>{event.time}</Text>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventDetails}>
                  <View style={styles.instructorInfo}>
                    <Ionicons name="person-outline" size={16} color="#64748B" />
                    <Text style={styles.instructorText}>{event.instructor}</Text>
                  </View>
                  <View style={styles.subjectInfo}>
                    <Ionicons name="book-outline" size={16} color="#64748B" />
                    <Text style={styles.subjectText}>{event.subject}</Text>
                  </View>
                </View>
                <View style={[
                  styles.statusBadge,
                  event.status === 'completed' ? styles.completedBadge : styles.upcomingBadge
                ]}>
                  <Text style={styles.statusText}>
                    {event.status === 'completed' ? 'Completed' : 'Upcoming'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  content: {
    flex: 1,
  },
  calendarSummary: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(20),
    marginBottom: verticalScale(10),
    borderRadius: moderateScale(15),
    margin: moderateScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A2B4B',
    marginBottom: verticalScale(5),
  },
  summaryCount: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#64748B',
  },
  dateSection: {
    marginBottom: verticalScale(20),
    paddingHorizontal: moderateScale(15),
  },
  dateHeader: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A2B4B',
    marginBottom: verticalScale(10),
    paddingLeft: moderateScale(10),
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(15),
    padding: moderateScale(15),
    marginBottom: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedEvent: {
    opacity: 0.7,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  timeText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginLeft: horizontalScale(5),
  },
  eventTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A2B4B',
    marginBottom: verticalScale(10),
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructorText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginLeft: horizontalScale(5),
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginLeft: horizontalScale(5),
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(20),
  },
  upcomingBadge: {
    backgroundColor: '#EEF2FF',
  },
  completedBadge: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#4F46E5',
  },
});

export default SchedulePage; 