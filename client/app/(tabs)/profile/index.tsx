import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { Image } from 'expo-image';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { COLORS, FONT } from "../../../constants";
import { horizontalScale, moderateScale, verticalScale } from "../../utils/metrics";
import SubjectCards from "../../components/SubjectCards";
import CalendarSummary from "../../components/CalendarSummary";
import { Ionicons } from '@expo/vector-icons';
import { axiosWithAuth } from "../../utils/customAxios";
import UserSubjectCards from "../../components/UserSubjectCards";

interface User {
  id?: string;
  email?: string;
  name?: string;
  profileImage?: string;
  userDescription?: string;
  subjects?: SubjectItem[];
  reccomendedSubjects?: string[];
  userSubjects?: SubjectItem[];
  isTeacher?: boolean;
}

interface SubjectItem {
  id: string;
  subjectName: string;
  subjectDescription?: string;
  subjectImage?: string;
  subjectPrice?: number;
  subjectBoard?: string;
  subjectGrade?: number;
}



const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const ProfilePage = () => {
  const [user, setUser] = useState<User>({});
  const [userDetails, setUserDetails] = useState<User>({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCourses, setActiveCourses] = useState<SubjectItem[]>([]);
  useEffect(() => {
    const getUser = async () => {
      const apiUser = await axiosWithAuth.get(`${ipURL}/api/auth/metadata`);
      console.log("apiUser", apiUser.data);
      
      setUser(apiUser.data);
      const user = JSON.parse(await AsyncStorage.getItem("userDetails"));
      console.log(user,'user in profile');
      setUserDetails(user);
    };
    getUser();
  }, []);

  console.log("user in profile", user);
  



  const handleItemPress = (itemId: { id: any }) => {
    router.push(`/(tabs)/profile/${itemId.id}`);
  };

  const handleCreateNewSubject = () => {
    router.push(`/(tabs)/profile/createSubject/${user.id}`);
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  

  const handleSettingsPress = () => {
    router.push('/(tabs)/profile/settings');
  };

  console.log(user, 'this is the user');
  

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <ScrollView style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.topBar}>
            <Text style={styles.pageTitle}>My Profile</Text>
            <View style={styles.iconsContainer}>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={handleSettingsPress}
              >
                <Ionicons name="settings-outline" size={24} color="#1A2B4B" />
              </TouchableOpacity>
            </View>
          </View>
          
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
              <Text style={styles.role}>
                {userDetails?.isTeacher ? 'Instructor' : 'Student'}
              </Text>
              <View style={styles.badgeContainer}>

                {user?.reccomendedSubjects?.map((subjectTag,idx) =>

                (<View style={styles.badge} key={idx} >
                  <Text style={styles.badgeText}>{subjectTag.toLocaleUpperCase()}</Text>
                </View>)
                )}

              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        {/* {userDetails?.isTeacher && <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Hours Taught</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>156</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>89%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </View>
        </View>} */}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>
              {user.userDescription || "No description added."}
            </Text>
          </View>
        </View>

        {/* Calendar Summary Section */}
        <View style={styles.section}>
          <CalendarSummary isTeacher={userDetails?.isTeacher} />
        </View>

        {/* Teaching Stats */}
       {/* {userDetails?.isTeacher && <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teaching Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>98%</Text>
              <Text style={styles.overviewLabel}>Response Rate</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>2hr</Text>
              <Text style={styles.overviewLabel}>Avg. Response</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>95%</Text>
              <Text style={styles.overviewLabel}>Satisfaction</Text>
            </View>
          </View>
        </View>} */}

        {/* Courses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Courses</Text>
            {userDetails?.isTeacher && (
              <TouchableWithoutFeedback onPress={handleCreateNewSubject}>
                <View style={styles.addButton}>
                  <Text style={styles.addButtonText}>+ New Course</Text>
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
       {userDetails?.isTeacher && <SubjectCards 
            subjectData={user.subjects} 
            handleItemPress={handleItemPress} 
            isHorizontal={false} 
          />}
          {!userDetails?.isTeacher && <UserSubjectCards 
            subjectData={user?.userSubjects} 
            handleItemPress={handleItemPress} 
            isHorizontal={false} 
          />}
        </View>
         {/* Add Logout Section */}
         
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(20),
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(20),
  },
  pageTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A2B4B',
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
  },
  badgeText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#4F46E5',
  },
  statsGrid: {
    padding: moderateScale(20),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(15),
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    width: '48%',
    padding: moderateScale(15),
    borderRadius: moderateScale(15),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A2B4B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(20),
    borderRadius: moderateScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
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
    shadowOpacity: 0.1,
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
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
  },
  addButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
  logoutSection: {
    padding: moderateScale(20),
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: horizontalScale(30),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(20),
    width: '100%',
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#DC2626',
  },
  bottomPadding: {
    height: verticalScale(20),
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    marginRight: horizontalScale(15),
  },
});

export default ProfilePage;