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
      <Text style={styles.lastStudied}>Last studied: {subject.lastStudied}</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${subject.progress}%` }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsContainer}>
            <ProgressCard 
              title="Subjects Completed" 
              value={`${staticProgressData.completedSubjects}/${staticProgressData.totalSubjects}`}
              icon="book"
            />
            <ProgressCard 
              title="Average Score" 
              value={`${staticProgressData.averageScore}%`}
              icon="trophy"
            />
            <ProgressCard 
              title="Total Hours" 
              value={staticProgressData.totalHoursStudied}
              icon="time"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subject Progress</Text>
          {staticProgressData.subjectProgress.map((subject) => (
            <SubjectProgressItem key={subject.subjectId} subject={subject} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProgressPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: verticalScale(24),
  },
  section: {
    paddingHorizontal: horizontalScale(16),
    marginTop: verticalScale(24),
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#222222',
    marginBottom: verticalScale(16),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(8),
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: verticalScale(16),
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
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
    color: '#222222',
    marginBottom: verticalScale(4),
  },
  cardTitle: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: COLORS.gray,
    textAlign: 'center',
  },
  subjectProgressItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: verticalScale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
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
    marginBottom: verticalScale(4),
  },
  subjectName: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#222222',
  },
  progressPercentage: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(14),
    color: COLORS.primary,
  },
  lastStudied: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: COLORS.gray,
    marginBottom: verticalScale(8),
  },
  progressBarContainer: {
    height: verticalScale(8),
    backgroundColor: '#E5E5E5',
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(4),
  },
}); 