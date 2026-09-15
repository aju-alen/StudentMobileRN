import React, { ReactNode } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Image } from 'expo-image';
import { FONT } from "../../constants";
import { horizontalScale, moderateScale, verticalScale } from "../utils/metrics";
import SubjectCards from "./SubjectCards";
import StatusBarComponent from "./StatusBarComponent";

interface SubjectItem {
  id: string;
  subjectName: string;
  subjectDescription?: string;
  subjectImage?: string;
  subjectPrice?: number;
  subjectBoard?: string;
  subjectGrade?: number;
}

interface TeacherStats {
  hoursTaught?: number;
  studentCount?: number;
  classesHeld?: number;
  completionPercent?: number;
  courseCount?: number;
  reviewCount?: number;
  upcomingClasses?: number;
}

interface User {
  id?: string;
  email?: string;
  name?: string;
  profileImage?: string;
  userDescription?: string;
  subjects?: SubjectItem[];
  reccomendedSubjects?: string[];
  stats?: TeacherStats;
}

interface UserDetails {
  isTeacher?: boolean;
  isAdmin?: boolean;
}

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

type TeacherProfileViewProps = {
  user: User;
  userDetails: UserDetails;
  coursesInteractive?: boolean;
  onCoursePress?: (item: { id: any }) => void;
  roleLabel?: string;
  showTutorStats?: boolean;
  footer?: ReactNode;
};

const TeacherProfileView = ({
  user,
  userDetails,
  coursesInteractive = true,
  onCoursePress,
  roleLabel,
  showTutorStats,
  footer,
}: TeacherProfileViewProps) => {
  const role = roleLabel ?? (userDetails?.isTeacher ? 'Tutor' : 'Student');
  const displayTutorStats = showTutorStats ?? !!userDetails?.isTeacher;
  const stats = user.stats;

  return (
    <View style={styles.mainContainer}>
      <StatusBarComponent />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image
              source={{ uri: user.profileImage }}
              style={styles.profileImage}
              placeholder={blurhash}
              contentFit="cover"
              transition={500}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.role}>{role}</Text>
              <View style={styles.badgeContainer}>
                {user?.reccomendedSubjects?.map((subjectTag, idx) => (
                  <View style={styles.badge} key={idx}>
                    <Text style={styles.badgeText}>{subjectTag.toLocaleUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {displayTutorStats && (
          <View style={styles.statsSection}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.hoursTaught ?? 0}</Text>
                <Text style={styles.statLabel}>Hours Taught</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.studentCount ?? 0}</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.classesHeld ?? 0}</Text>
                <Text style={styles.statLabel}>Classes Held</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.completionPercent ?? 0}%</Text>
                <Text style={styles.statLabel}>Completion</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>
              {user.userDescription || "No description added."}
            </Text>
          </View>
        </View>

        {displayTutorStats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teaching Overview</Text>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{stats?.courseCount ?? 0}</Text>
                <Text style={styles.overviewLabel}>Courses</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{stats?.upcomingClasses ?? 0}</Text>
                <Text style={styles.overviewLabel}>Upcoming</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewValue}>{stats?.reviewCount ?? 0}</Text>
                <Text style={styles.overviewLabel}>Reviews</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Courses</Text>
          <SubjectCards
            subjectData={user.subjects}
            handleItemPress={onCoursePress}
            isHorizontal={false}
            interactive={coursesInteractive}
          />
        </View>
        {footer}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(20),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  profileSection: {
    flexDirection: 'row',
    paddingHorizontal: horizontalScale(20),
    alignItems: 'center',
  },
  profileImage: {
    width: horizontalScale(80),
    height: verticalScale(80),
    borderRadius: moderateScale(40),
    marginRight: horizontalScale(15),
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A2B4B',
    marginBottom: verticalScale(4),
  },
  role: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginBottom: verticalScale(8),
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    marginRight: horizontalScale(8),
    marginBottom: verticalScale(4),
  },
  badgeText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#4F46E5',
  },
  statsSection: {
    padding: moderateScale(20),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: moderateScale(15),
    borderRadius: moderateScale(15),
    alignItems: 'center',
    marginBottom: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A2B4B',
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
  },
  section: {
    padding: moderateScale(20),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A2B4B',
    marginBottom: verticalScale(15),
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(20),
    borderRadius: moderateScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  aboutText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(15),
    color: '#475569',
    lineHeight: moderateScale(24),
  },
  overviewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: moderateScale(20),
    borderRadius: moderateScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  overviewItem: {
    alignItems: 'center',
  },
  overviewValue: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A2B4B',
    marginBottom: verticalScale(4),
  },
  overviewLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#64748B',
  },
});

export default TeacherProfileView;
