import { StyleSheet, Text, View, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import React, { useCallback, useState } from 'react';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { FONT, COLORS } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/en';
import { axiosWithAuth } from '../../utils/customAxios';
import { ipURL } from '../../utils/utils';

dayjs.extend(relativeTime);
dayjs.locale('en');

interface CourseProgress {
  subjectId: string;
  subjectName: string;
  courseType: string;
  progress: number;
  completedClasses: number;
  totalClasses: number;
  hoursCompleted: number;
  totalHours: number;
  lastSessionAt: string | null;
  nextSessionAt: string | null;
  studentCount?: number;
}

interface ProgressResponse {
  isTeacher: boolean;
  overview: {
    totalCourses: number;
    completedCourses: number;
    completedClasses: number;
    upcomingClasses: number;
    hoursCompleted: number;
  };
  courses: CourseProgress[];
}

const emptyOverview: ProgressResponse['overview'] = {
  totalCourses: 0,
  completedCourses: 0,
  completedClasses: 0,
  upcomingClasses: 0,
  hoursCompleted: 0,
};

const sessionLabel = (course: CourseProgress) => {
  if (course.lastSessionAt) {
    return `Last class ${dayjs(course.lastSessionAt).fromNow()}`;
  }
  if (course.nextSessionAt) {
    return `Next class ${dayjs(course.nextSessionAt).fromNow()}`;
  }
  return 'No classes scheduled';
};

const ProgressPage = () => {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    try {
      setError(null);
      const response = await axiosWithAuth.get(`${ipURL}/api/bookings/progress`);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Could not load your progress. Pull to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProgress();
    }, [fetchProgress])
  );

  const overview = data?.overview || emptyOverview;
  const courses = data?.courses || [];
  const isTeacher = !!data?.isTeacher;

  const ProgressCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
    <View style={styles.progressCard}>
      <View style={styles.cardIconContainer}>
        <Ionicons name={icon as any} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
    </View>
  );

  const SubjectProgressItem = ({ subject }: { subject: CourseProgress }) => (
    <TouchableOpacity
      style={styles.subjectProgressItem}
      onPress={() => router.push(`/(tabs)/home/${subject.subjectId}`)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={subject.subjectName}
    >
      <View style={styles.subjectProgressHeader}>
        <Text style={styles.subjectName}>{subject.subjectName}</Text>
        <Text style={styles.progressPercentage}>{subject.progress}%</Text>
      </View>
      <Text style={styles.lastStudied}>
        {isTeacher && subject.studentCount != null
          ? `${subject.studentCount} ${subject.studentCount === 1 ? 'student' : 'students'} · ${sessionLabel(subject)}`
          : sessionLabel(subject)}
      </Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${Math.min(100, Math.max(0, subject.progress))}%` }]} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]} edges={[]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.statusText}>Loading your progress</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProgress();
            }}
            tintColor={COLORS.primary}
          />
        }
      >
        {error ? (
          <View style={styles.statusBlock}>
            <Ionicons name="alert-circle-outline" size={moderateScale(36)} color="#C2410C" />
            <Text style={styles.statusText}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.statsContainer}>
                <ProgressCard
                  title={isTeacher ? 'Courses' : 'Courses completed'}
                  value={isTeacher ? overview.totalCourses : `${overview.completedCourses}/${overview.totalCourses}`}
                  icon="book"
                />
                <ProgressCard
                  title={isTeacher ? 'Classes held' : 'Classes completed'}
                  value={overview.completedClasses}
                  icon="checkmark-done"
                />
                <ProgressCard
                  title={isTeacher ? 'Hours taught' : 'Hours completed'}
                  value={overview.hoursCompleted}
                  icon="time"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>By course</Text>
              {courses.length > 0 ? (
                courses.map((subject) => (
                  <SubjectProgressItem key={subject.subjectId} subject={subject} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="stats-chart-outline" size={moderateScale(36)} color="#5C6B76" />
                  <Text style={styles.emptyTitle}>
                    {isTeacher ? 'No courses yet' : 'No enrolled courses yet'}
                  </Text>
                  <Text style={styles.emptySub}>
                    {isTeacher
                      ? 'Courses you create will show hours and classes here.'
                      : 'Courses you enroll in will show your class progress here.'}
                  </Text>
                  {!isTeacher && (
                    <TouchableOpacity
                      style={styles.emptyCta}
                      onPress={() => router.push('/(tabs)/home/allSubject')}
                      accessibilityRole="button"
                      accessibilityLabel="Find courses"
                    >
                      <Text style={styles.emptyCtaText}>Find courses</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgressPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: verticalScale(24),
  },
  section: {
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(20),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#12263A',
    marginBottom: verticalScale(12),
  },
  statsContainer: {
    gap: verticalScale(10),
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: verticalScale(14),
    paddingHorizontal: horizontalScale(14),
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E6EBF0',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  cardCopy: {
    flex: 1,
  },
  cardValue: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#12263A',
    marginTop: verticalScale(2),
  },
  cardTitle: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#5C6B76',
    textAlign: 'left',
  },
  subjectProgressItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: verticalScale(16),
    marginBottom: verticalScale(10),
    borderWidth: 1,
    borderColor: '#E6EBF0',
    minHeight: 88,
  },
  subjectProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  subjectName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(15),
    color: '#12263A',
    flex: 1,
    marginRight: horizontalScale(8),
  },
  progressPercentage: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(14),
    color: COLORS.primary,
  },
  lastStudied: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#5C6B76',
    marginBottom: verticalScale(10),
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E6EBF0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  statusBlock: {
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(48),
  },
  statusText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#5C6B76',
    textAlign: 'center',
    marginTop: verticalScale(10),
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E6EBF0',
    paddingVertical: verticalScale(28),
    paddingHorizontal: horizontalScale(16),
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
    marginTop: verticalScale(12),
  },
  emptySub: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
    textAlign: 'center',
    marginTop: verticalScale(6),
  },
  emptyCta: {
    marginTop: verticalScale(16),
    backgroundColor: COLORS.primary,
    minHeight: 44,
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
  },
  emptyCtaText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
});
