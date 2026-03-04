import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from 'expo-image';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { COLORS, FONT } from "../../../constants";
import { horizontalScale, moderateScale, verticalScale } from "../../utils/metrics";
import SubjectCards from "../../components/SubjectCards";
import CalendarSummary from "../../components/CalendarSummary";
import { Ionicons } from '@expo/vector-icons';
import { axiosWithAuth } from "../../utils/customAxios";
import UserSubjectCards from "../../components/UserSubjectCards";
import * as Sentry from '@sentry/react-native';
import CourseTypeModal from "../../components/CourseTypeModal";
import { useRevenueCat } from "../../providers/RevenueCatProvider";

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
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showCourseTypeModal, setShowCourseTypeModal] = useState(false);
  const [isButtonCooldown, setIsButtonCooldown] = useState<boolean>(false);
  const [profileImageVersion, setProfileImageVersion] = useState<string>('0');
  const revenueCatContext = useRevenueCat();

  const getUser = async () => {
    try {
      const apiUser = await axiosWithAuth.get(`${ipURL}/api/auth/metadata`);
      
      setUser(apiUser.data);
      setUserDetails(apiUser.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  // Refetch user when screen is focused (e.g. returning from edit-profile after updating photo)
  useFocusEffect(
    React.useCallback(() => {
      getUser();
      AsyncStorage.getItem('profileImageVersion').then((v) => {
        if (v != null) setProfileImageVersion(v);
      });
    }, [])
  );

  console.log("user in profile", user);
  



  const handleItemPress = (itemId: { id: any }) => {
    router.push(`/(tabs)/profile/${itemId.id}`);
  };

  const handleCreateNewSubject = async () => {
    // Prevent multiple clicks within 3 seconds
    if (isButtonCooldown) {
      return;
    }

    // Set cooldown state
    setIsButtonCooldown(true);
    
    // Reset cooldown after 3 seconds
    setTimeout(() => {
      setIsButtonCooldown(false);
    }, 3000);

    try {
      const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);

      const {isTeacher, id, zoomAccountCreated, zoomUserAcceptedInvite} = userverificationCheck.data.userDetail;
      const zoomVerified = zoomUserAcceptedInvite || zoomAccountCreated;
      console.log(zoomAccountCreated, zoomUserAcceptedInvite, isTeacher, 'this is the user verification check');
      if ( !isTeacher ) {
        Alert.alert('Incomplete Profile', 'You need to be registered as a teacher to create a course.');
        return;
      }
      if ( !zoomVerified ) {
        Alert.alert('Zoom required', 'Please complete Zoom setup: create your Zoom account and accept the invite sent to your email. After that you can create courses.');
        return;
      }
      
      if (!id) {
        throw new Error('User ID not found in user details');
      }
      
      // Show course type selection modal
      setShowCourseTypeModal(true);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          location: 'handleCreateNewSubject',
          action: 'new_course_button_click'
        },
        extra: {
          error: error.message,
          stack: error.stack,
          userDetails: await AsyncStorage.getItem('userDetails')
        }
      });
      Alert.alert('Error', 'Failed to create new course. Please try again.');
    }
  };

  const handleSelectSingleStudent = async () => {
    try {
      const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);
      const { id } = userverificationCheck.data.userDetail;
      
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: 'Creating single student course',
        level: 'info',
        data: {
          userId: id,
          courseType: 'SINGLE_STUDENT'
        }
      });
      
      router.push(`/(tabs)/profile/createSubject/${id}?courseType=SINGLE_STUDENT`);
    } catch (error) {
      Alert.alert('Error', 'Failed to navigate to course creation.');
    }
  };

  const handleSelectMultiStudent = async () => {
    try {
      console.log(revenueCatContext, 'this is the revenue cat context');
      
      if (revenueCatContext && revenueCatContext.getMultiStudentCapacity) {
        const capacity = await revenueCatContext.getMultiStudentCapacity();

        console.log(capacity, 'this is the capacity');
        
        
        if (capacity && capacity > 0) {
          // User has entitlement, proceed to create multi-student course
          const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);
          const { id } = userverificationCheck.data.userDetail;
          
          Sentry.addBreadcrumb({
            category: 'navigation',
            message: 'Creating multi student course',
            level: 'info',
            data: {
              userId: id,
              courseType: 'MULTI_STUDENT',
              capacity
            }
          });
          
          router.push(`/(tabs)/profile/createSubject/${id}?courseType=MULTI_STUDENT&maxCapacity=${capacity}`);
        } else {
          // No entitlement, navigate to paywall page
          console.log('no entitlement, navigating to paywall');
          router.push(`/(tabs)/profile/multi-student-paywall?userEmail=${encodeURIComponent(user.email || '')}`);
        }
      } else {
        // RevenueCat not ready, navigate to paywall page
        console.log('revenue cat not ready, navigating to paywall');
        router.push(`/(tabs)/profile/multi-student-paywall?userEmail=${encodeURIComponent(user.email || '')}`);
      }
    } catch (error) {
      console.error('Error in handleSelectMultiStudent:', error);
      Alert.alert('Error', 'Failed to navigate to course creation.');
    }
  };

  const handleSelectSinglePackage = async () => {
    try {
      const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);
      const { id } = userverificationCheck.data.userDetail;

      Sentry.addBreadcrumb({
        category: 'navigation',
        message: 'Creating single course package',
        level: 'info',
        data: {
          userId: id,
          courseType: 'SINGLE_PACKAGE',
          maxHours: 20,
        },
      });

      router.push(`/(tabs)/profile/createSubject/${id}?courseType=SINGLE_PACKAGE&maxHours=20`);
    } catch (error) {
      Alert.alert('Error', 'Failed to navigate to course creation.');
    }
  };

  const handleSelectMultiPackage = async () => {
    try {
      if (revenueCatContext && revenueCatContext.getMultiStudentCapacity) {
        const capacity = await revenueCatContext.getMultiStudentCapacity();

        if (capacity && capacity > 0) {
          const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);
          const { id } = userverificationCheck.data.userDetail;

          Sentry.addBreadcrumb({
            category: 'navigation',
            message: 'Creating multi course package',
            level: 'info',
            data: {
              userId: id,
              courseType: 'MULTI_PACKAGE',
              maxHours: 20,
              capacity,
            },
          });

          router.push(`/(tabs)/profile/createSubject/${id}?courseType=MULTI_PACKAGE&maxHours=20&maxCapacity=${capacity}`);
        } else {
          router.push(`/(tabs)/profile/multi-student-paywall?userEmail=${encodeURIComponent(user.email || '')}`);
        }
      } else {
        router.push(`/(tabs)/profile/multi-student-paywall?userEmail=${encodeURIComponent(user.email || '')}`);
      }
    } catch (error) {
      console.error('Error in handleSelectMultiPackage:', error);
      Alert.alert('Error', 'Failed to navigate to course creation.');
    }
  };

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  

  const handleSettingsPress = () => {
    router.push('/(tabs)/profile/settings');
  };

  const onRefresh = () => {
    // Show the same ActivityIndicator as initial load and refetch all data
    setLoading(true);
    setRefreshing(true);
    getUser();
  };

  console.log(user, 'this is the user');
  

  return (
    <View style={styles.screen}>
      {/* Main content remains visible */}
      <TouchableWithoutFeedback onPress={closeDropdown}>
        <ScrollView
          style={styles.mainContainer}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
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
              key={user.profileImage ?? 'default'}
              source={{
                uri: user.profileImage,
                cacheKey: `${user.profileImage ?? 'default'}-${profileImageVersion}`,
              }}
              style={styles.profileImage}
              placeholder={blurhash}
              contentFit="cover"
              transition={500}
              cachePolicy="memory-disk"
            />
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.role}>
                {userDetails?.isTeacher ? 'Teacher' : 'Student'}
              </Text>
              <View style={styles.badgeContainer}>

                {user?.reccomendedSubjects?.map((subjectTag,idx) =>

                (
                <View style={styles.badge} key={idx} >
                  <Text style={styles.badgeText}>{subjectTag.toLocaleUpperCase()}</Text>
                </View>
                )
                )}

              </View>
            </View>
          </View>
        </View>

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
            <Text style={styles.sectionTitle}>Your Courses</Text>
            {userDetails?.isTeacher && (
              <TouchableOpacity 
                onPress={handleCreateNewSubject}
                disabled={loading || refreshing || isButtonCooldown}
                activeOpacity={0.7}
              >
                <View style={[styles.addButton, (loading || refreshing || isButtonCooldown) && styles.addButtonDisabled]}>
                  <Text style={[styles.addButtonText, (loading || refreshing || isButtonCooldown) && styles.addButtonTextDisabled]}>
                    + New Course
                  </Text>
                </View>
              </TouchableOpacity>
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

      {/* Loading overlay on top of content */}
      {(loading || refreshing) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      {/* Course Type Selection Modal */}
      <CourseTypeModal
        visible={showCourseTypeModal}
        onClose={() => setShowCourseTypeModal(false)}
        onSelectSingle={handleSelectSingleStudent}
        onSelectMulti={handleSelectMultiStudent}
        onSelectSinglePackage={handleSelectSinglePackage}
        onSelectMultiPackage={handleSelectMultiPackage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  scrollContent: {
    paddingBottom: verticalScale(24),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(244,246,248,0.4)',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: verticalScale(48),
    paddingBottom: verticalScale(20),
    borderBottomLeftRadius: moderateScale(20),
    borderBottomRightRadius: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    //shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(12),
  },
  pageTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(22),
    color: '#1A2B4B',
  },
  profileSection: {
    flexDirection: 'row',
    paddingHorizontal: horizontalScale(20),
    alignItems: 'center',
  },
  profileImage: {
    width: horizontalScale(72),
    height: verticalScale(72),
    borderRadius: moderateScale(36),
    marginRight: horizontalScale(16),
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A2B4B',
    marginBottom: verticalScale(2),
  },
  role: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#64748B',
    marginBottom: verticalScale(6),
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(6),
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(10),
    marginRight: horizontalScale(6),
    marginBottom: verticalScale(4),
  },
  badgeText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(8),
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
    //shadowOpacity: 0.1,
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
    paddingVertical: verticalScale(16),
    paddingHorizontal: horizontalScale(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A2B4B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(20),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    //shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  aboutText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
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
    //shadowOpacity: 0.1,
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
  addButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#cccccc',
  },
  addButtonTextDisabled: {
    color: '#999999',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(12),
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