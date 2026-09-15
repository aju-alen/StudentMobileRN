import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { axiosWithAuth } from '../../../utils/customAxios';
import { ipURL } from '../../../utils/utils';
import { FONT } from '../../../../constants';
import { moderateScale, verticalScale } from '../../../utils/metrics';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChildProgressPage = () => {
  const { studentId } = useLocalSearchParams();
  const [progress, setProgress] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [progressResp, classesResp] = await Promise.all([
          axiosWithAuth.get(`${ipURL}/api/parent/children/${studentId}/progress`),
          axiosWithAuth.get(`${ipURL}/api/parent/children/${studentId}/upcoming-classes`),
        ]);
        setProgress(progressResp.data);
        setClasses(classesResp.data || []);
      } catch (error) {
        console.error('Error loading child activity:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1A2B4B" />
      </View>
    );
  }

  const overview = progress?.overview || {};

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Learning activity</Text>
        <View style={styles.grid}>
          <Stat label="Courses" value={overview.totalCourses ?? 0} />
          <Stat label="Completed" value={overview.completedCourses ?? 0} />
          <Stat label="Classes done" value={overview.completedClasses ?? 0} />
          <Stat label="Hours" value={overview.hoursCompleted ?? 0} />
        </View>
        <Text style={styles.section}>Upcoming classes</Text>
        {classes.length === 0 ? (
          <Text style={styles.empty}>No upcoming classes.</Text>
        ) : (
          classes.map((item) => (
            <View key={item.id} style={styles.classCard}>
              <Text style={styles.classTitle}>{item.subject?.subjectName}</Text>
              <Text style={styles.classMeta}>
                With {item.teacher?.name} · {item.bookingTime}
              </Text>
            </View>
          ))
        )}
        <Text style={styles.section}>Courses</Text>
        {(progress?.courses || []).length === 0 ? (
          <Text style={styles.empty}>No enrolled courses yet.</Text>
        ) : (
          progress.courses.map((course) => (
            <View key={course.subjectId || course.subjectName} style={styles.classCard}>
              <Text style={styles.classTitle}>{course.subjectName || course.name}</Text>
              <Text style={styles.classMeta}>{course.progress ?? 0}% complete</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const Stat = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, paddingBottom: verticalScale(40) },
  title: { fontFamily: FONT.bold, fontSize: moderateScale(22), color: '#12263A', marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  stat: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E6EBF0',
  },
  statValue: { fontFamily: FONT.bold, fontSize: moderateScale(20), color: '#12263A' },
  statLabel: { fontFamily: FONT.regular, color: '#5C6B76' },
  section: { fontFamily: FONT.bold, fontSize: moderateScale(16), color: '#12263A', marginBottom: 8, marginTop: 8 },
  empty: { fontFamily: FONT.regular, color: '#5C6B76', marginBottom: 12 },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E6EBF0',
  },
  classTitle: { fontFamily: FONT.bold, color: '#12263A' },
  classMeta: { fontFamily: FONT.regular, color: '#5C6B76', marginTop: 4 },
});

export default ChildProgressPage;
