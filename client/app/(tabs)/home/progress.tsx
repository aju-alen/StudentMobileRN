import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native';
import React from 'react';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { FONT, COLORS } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';

interface ProgressData {
  totalSubjects: number;
  completedSubjects: number;
  averageScore: number;
  totalHoursStudied: number;
  weeklyProgress: {
    date: string;
    hours: number;
  }[];
  subjectProgress: {
    subjectId: string;
    subjectName: string;
    progress: number;
    lastStudied: string;
  }[];
}

const staticProgressData: ProgressData = {
  totalSubjects: 12,
  completedSubjects: 4,
  averageScore: 85,
  totalHoursStudied: 156,
  weeklyProgress: [
    { date: 'Mon', hours: 3 },
    { date: 'Tue', hours: 5 },
    { date: 'Wed', hours: 2 },
    { date: 'Thu', hours: 4 },
    { date: 'Fri', hours: 6 },
    { date: 'Sat', hours: 8 },
    { date: 'Sun', hours: 4 },
  ],
  subjectProgress: [
    {
      subjectId: '1',
      subjectName: 'Mathematics',
      progress: 75,
      lastStudied: '2 days ago'
    },
    {
      subjectId: '2',
      subjectName: 'Physics',
      progress: 60,
      lastStudied: '1 day ago'
    },
    {
      subjectId: '3',
      subjectName: 'Chemistry',
      progress: 45,
      lastStudied: '3 days ago'
    },
    {
      subjectId: '4',
      subjectName: 'Biology',
      progress: 30,
      lastStudied: '5 days ago'
    },
    {
      subjectId: '5',
      subjectName: 'English',
      progress: 90,
      lastStudied: 'Today'
    }
  ]
};

const ProgressPage = () => {
  const ProgressCard = ({ title, value, icon }: { title: string; value: string | number; icon: string }) => (
    <View style={styles.progressCard}>
      <View style={styles.cardIconContainer}>
        <Ionicons name={icon as any} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );

  const SubjectProgressItem = ({ subject }: { subject: ProgressData['subjectProgress'][0] }) => (
    <View style={styles.subjectProgressItem}>
      <View style={styles.subjectProgressHeader}>
        <Text style={styles.subjectName}>{subject.subjectName}</Text>
        <Text style={styles.progressPercentage}>{subject.progress}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${subject.progress}%` }]} />
      </View>
      <Text style={styles.lastStudied}>Last studied: {subject.lastStudied}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Progress</Text>
        </View>

        <View style={styles.statsContainer}>
          <ProgressCard 
            title="Subjects Completed" 
            value={`${staticProgressData.completedSubjects}/${staticProgressData.totalSubjects}`}
            icon="book-outline"
          />
          <ProgressCard 
            title="Average Score" 
            value={`${staticProgressData.averageScore}%`}
            icon="trophy-outline"
          />
          <ProgressCard 
            title="Total Hours" 
            value={staticProgressData.totalHoursStudied}
            icon="time-outline"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Progress</Text>
          {staticProgressData.subjectProgress.map((subject) => (
            <SubjectProgressItem key={subject.subjectId} subject={subject} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Study Hours</Text>
          <View style={styles.weeklyProgressContainer}>
            {staticProgressData.weeklyProgress.map((week, index) => (
              <View key={index} style={styles.weekBarContainer}>
                <View style={[styles.weekBar, { height: `${(week.hours / 8) * 100}%` }]} />
                <Text style={styles.weekLabel}>{week.date}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgressPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(8),
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: COLORS.black,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(24),
  },
  progressCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: verticalScale(16),
    width: '30%',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  cardValue: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: COLORS.black,
    marginBottom: verticalScale(4),
  },
  cardTitle: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: COLORS.gray,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: horizontalScale(16),
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(18),
    color: COLORS.black,
    marginBottom: verticalScale(16),
  },
  subjectProgressItem: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: verticalScale(16),
    marginBottom: verticalScale(12),
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  subjectName: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: COLORS.black,
  },
  progressPercentage: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(14),
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: verticalScale(8),
    backgroundColor: COLORS.lightGray,
    borderRadius: moderateScale(4),
    marginBottom: verticalScale(8),
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(4),
  },
  lastStudied: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: COLORS.gray,
  },
  weeklyProgressContainer: {
    flexDirection: 'row',
    height: verticalScale(200),
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: verticalScale(24),
  },
  weekBarContainer: {
    alignItems: 'center',
    width: '12%',
  },
  weekBar: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(4),
    marginBottom: verticalScale(4),
  },
  weekLabel: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(10),
    color: COLORS.gray,
  },
}); 