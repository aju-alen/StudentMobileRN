import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FONT } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { ipURL } from '../utils/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock data for upcoming classes - replace with actual API data

interface ClassItem {
  id: string;
  bookingDate: string;
  bookingTime: string;
  subject: {
    subjectName: string;
  };
  teacher: {
    name: string;
  };
  student: {
    name: string;
  };
}

const CalendarSummary = ({isTeacher}:{isTeacher:boolean}) => {
  const [upcomingClasses, setUpcomingClasses] = useState<ClassItem[]>([]);

  const formatDate = (dateString) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const renderClassItem = ({ item }: { item: ClassItem }) => (
    <View style={styles.classItem}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formatDate(item.bookingDate)}</Text>
        <Text style={styles.timeText}>{item.bookingTime}</Text>
      </View>
      <View style={styles.classInfo}>
        <Text style={styles.classTitle}>{item.subject.subjectName}</Text>
        <Text style={styles.instructorText}>with {isTeacher ? item.student.name : item.teacher.name}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#64748B" />
    </View>
  );

  useEffect(() => {
    const fetchUpcomingClasses = async () => {
      try{
        const token = await AsyncStorage.getItem('authToken');
        const getUpcomingClass = await axios.get(`${ipURL}/api/bookings/upcoming-classes?limit=3`,{
          headers:{
            Authorization: `Bearer ${token}`
          }
        })
        setUpcomingClasses(getUpcomingClass.data);
      }
      catch(error){
        console.log(error);
      }
    }
    fetchUpcomingClasses();
  },[])
  console.log(upcomingClasses,'---upcomingClasses');

  const handleViewAll = () => {
    router.push('/(tabs)/home/schedule');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Classes</Text>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {upcomingClasses && upcomingClasses.length > 0 ? (
        <FlatList
          data={upcomingClasses}
          renderItem={renderClassItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={40} color="#CBD5E1" />
          <Text style={styles.emptyText}>No upcoming classes</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(15),
    padding: moderateScale(15),
    marginBottom: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A2B4B',
  },
  viewAllText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#4F46E5',
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(10),
  },
  dateContainer: {
    width: horizontalScale(100),
  },
  dateText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#1A2B4B',
  },
  timeText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#64748B',
    marginTop: verticalScale(2),
  },
  classInfo: {
    flex: 1,
    marginLeft: horizontalScale(15),
  },
  classTitle: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#1A2B4B',
  },
  instructorText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#64748B',
    marginTop: verticalScale(2),
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: verticalScale(5),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(20),
  },
  emptyText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginTop: verticalScale(10),
  },
});

export default CalendarSummary; 