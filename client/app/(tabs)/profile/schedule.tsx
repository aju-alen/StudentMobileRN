import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ipURL } from '../../utils/utils';
import { FONT } from '../../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { axiosWithAuth } from '../../utils/customAxios';
import { Linking } from 'react-native';
import StatusBarComponent from '../../components/StatusBarComponent';

const SchedulePage = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [userDetails, setUserDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  console.log(events, 'this is the events');
  

  

  useEffect(() => {
    const fetchData = async () => {
      try {

        const user = JSON.parse(await AsyncStorage.getItem("userDetails"));
        setUserDetails(user);

        const userType = await AsyncStorage.getItem('userType');
        setUserType(userType);
        

        const response = await axiosWithAuth.get(`${ipURL}/api/bookings/upcoming-classes`);

        // Transform the API data to match the component's expected format
        const formattedEvents = response.data.map((classData) => ({
          id: classData.id,
          title: `${classData.subject.subjectName} Class`,
          instructor: userType === 'teacher' ? classData.teacher.name : classData.student.name,
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
    console.log(event, 'this is the event in click');
    Alert.alert(
      event.title,
      `Instructor: ${event.instructor}\nDate: ${formatDate(event.date)}\nTime: ${event.time}\nSubject: ${event.subject}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => Linking.openURL(event.zoomUrl) }
      ]
    );
  };

  if (loading) {
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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBarComponent />
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
          <Text style={styles.summaryCount}>{events.length} classes scheduled</Text>
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
                  <View style={[styles.statusBadge, styles.upcomingBadge]}>
                    <Text style={styles.statusText}>Upcoming</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No upcoming classes scheduled</Text>
          </View>
        )}
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
    //shadowOpacity: 0.1,
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
    //shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  statusText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#4F46E5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  emptyText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#64748B',
    textAlign: 'center',
  },
});

export default SchedulePage; 