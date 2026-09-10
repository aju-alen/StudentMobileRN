import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FONT } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { ipURL } from '../utils/utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

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

  const handleViewAll = () => {
    router.push('/(tabs)/profile/schedule');
  };

  const renderClassItem = ({ item }: { item: ClassItem }) => (
    <TouchableOpacity
      onPress={handleViewAll}
      style={styles.classItem}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${item.subject.subjectName} on ${formatDate(item.bookingDate)}`}
    >
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{formatDate(item.bookingDate)}</Text>
        <Text style={styles.timeText}>{item.bookingTime}</Text>
      </View>
      <View style={styles.classInfo}>
        <Text style={styles.classTitle} numberOfLines={1}>{item.subject.subjectName}</Text>
        <Text style={styles.instructorText} numberOfLines={1}>
          with {isTeacher ? item.student.name : item.teacher.name}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#5C6B76" />
    </TouchableOpacity>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Classes</Text>
        <TouchableOpacity
          onPress={handleViewAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="View full schedule"
        >
          <Text style={styles.viewAllText}>View all</Text>
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
          <Ionicons name="calendar-outline" size={28} color="#5C6B76" />
          <Text style={styles.emptyText}>No upcoming classes</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
  },
  viewAllText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#1A4C6E',
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingVertical: 10,
  },
  dateContainer: {
    width: horizontalScale(92),
  },
  dateText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(13),
    color: '#12263A',
  },
  timeText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#5C6B76',
    marginTop: 2,
  },
  classInfo: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  classTitle: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#12263A',
  },
  instructorText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#5C6B76',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#E6EBF0',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(20),
  },
  emptyText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#5C6B76',
    marginTop: 8,
  },
});

export default CalendarSummary;
