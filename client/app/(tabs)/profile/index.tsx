import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Share,
  StatusBar,
} from "react-native";
import { Image } from 'expo-image';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { FONT } from "../../../constants";
import { horizontalScale, moderateScale, verticalScale } from "../../utils/metrics";
import SubjectCards from "../../components/SubjectCards";
import CalendarSummary from "../../components/CalendarSummary";
import { Ionicons } from '@expo/vector-icons';
import { axiosWithAuth } from "../../utils/customAxios";
import { ipURL } from "../../utils/utils";
import UserSubjectCards from "../../components/UserSubjectCards";
import * as Sentry from '@sentry/react-native';
import CourseTypeModal from "../../components/CourseTypeModal";
import { useRevenueCat } from "../../providers/RevenueCatProvider";
import { getTeacherProfileShareUrl } from "../../utils/teacherProfileLink";
import { SafeAreaView } from "react-native-safe-area-context";

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

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const ProfilePage = () => {
  const [user, setUser] = useState<User>({});
  const [userDetails, setUserDetails] = useState<User>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showCourseTypeModal, setShowCourseTypeModal] = useState(false);
  const [isButtonCooldown, setIsButtonCooldown] = useState<boolean>(false);
  const [profileImageVersion, setProfileImageVersion] = useState<string>('0');
  const revenueCatContext = useRevenueCat();

  const [hasSingleStudentDraft, setHasSingleStudentDraft] = useState(false);
  const [hasMultiStudentDraft, setHasMultiStudentDraft] = useState(false);
  const [hasSinglePackageDraft, setHasSinglePackageDraft] = useState(false);
  const [hasMultiPackageDraft, setHasMultiPackageDraft] = useState(false);

  const isMultiStudentSubscribed = !!revenueCatContext?.multiStudentCapacity;
  const isSinglePackageSubscribed = !!revenueCatContext?.hasSinglePackage;
  const isMultiPackageSubscribed = !!revenueCatContext?.hasMultiPackage;

  const getUser = async () => {
    try {
      const apiUser = await axiosWithAuth.get(`${ipURL}/api/auth/metadata`);

      setUser(apiUser.data);
      setUserDetails(apiUser.data);
      if (apiUser.data?.id) {
        await refreshDraftFlags(apiUser.data.id);
      }
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

  const refreshDraftFlags = async (userId: string) => {
    try {
      const keys = [
        `subjectDraft:${userId}:SINGLE_STUDENT`,
        `subjectDraft:${userId}:MULTI_STUDENT`,
        `subjectDraft:${userId}:SINGLE_PACKAGE`,
        `subjectDraft:${userId}:MULTI_PACKAGE`,
      ];
      const results = await AsyncStorage.multiGet(keys);
      setHasSingleStudentDraft(!!results[0][1]);
      setHasMultiStudentDraft(!!results[1][1]);
      setHasSinglePackageDraft(!!results[2][1]);
      setHasMultiPackageDraft(!!results[3][1]);
    } catch (e) {
      console.error('Failed to read subject draft flags', e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getUser();
      AsyncStorage.getItem('profileImageVersion').then((v) => {
        if (v != null) setProfileImageVersion(v);
      });
    }, [])
  );

  const handleItemPress = (itemId: { id: any }) => {
    router.push(`/(tabs)/profile/${itemId.id}`);
  };

  const handleCreateNewSubject = async () => {
    if (isButtonCooldown) {
      return;
    }

    setIsButtonCooldown(true);

    setTimeout(() => {
      setIsButtonCooldown(false);
    }, 3000);

    try {
      const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);

      const {isTeacher, id, zoomAccountCreated, zoomUserAcceptedInvite} = userverificationCheck.data.userDetail;
      const zoomVerified = zoomUserAcceptedInvite || zoomAccountCreated;
      if ( !isTeacher ) {
        Alert.alert('Incomplete Profile', 'You need to be registered as a tutor to create a course.');
        return;
      }
      if ( !zoomVerified ) {
        Alert.alert(
          'Zoom Account Not Verified',
          'Your Zoom account has not been verified yet. Please check your email (including spam folder) for the Zoom activation link and accept the invite. After that you can create courses.',
          [
            { text: 'OK', style: 'cancel' },
            {
              text: 'Resend Email',
              onPress: async () => {
                try {
                  await axiosWithAuth.post(`${ipURL}/api/auth/resend-zoom-invite`);
                  Alert.alert('Email Sent', 'A reminder has been sent to your email. Please check your inbox and spam folder.');
                } catch (err) {
                  const msg = err.response?.data?.message || 'Failed to resend email. Please try again.';
                  Alert.alert('Error', msg);
                }
              },
            },
          ]
        );
        return;
      }

      if (!id) {
        throw new Error('User ID not found in user details');
      }
      await refreshDraftFlags(id);
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
      if (revenueCatContext && revenueCatContext.getMultiStudentCapacity) {
        const capacity = await revenueCatContext.getMultiStudentCapacity();

        if (capacity && capacity > 0) {
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
          router.push(`/(tabs)/profile/course-paywall?courseType=MULTI_STUDENT&userEmail=${encodeURIComponent(user.email || '')}`);
        }
      } else {
        router.push(`/(tabs)/profile/course-paywall?courseType=MULTI_STUDENT&userEmail=${encodeURIComponent(user.email || '')}`);
      }
    } catch (error) {
      console.error('Error in handleSelectMultiStudent:', error);
      Alert.alert('Error', 'Failed to navigate to course creation.');
    }
  };

  const handleSelectSinglePackage = async () => {
    try {
      if (!revenueCatContext?.checkSinglePackageEntitlement) {
        router.push(`/(tabs)/profile/course-paywall?courseType=SINGLE_PACKAGE&userEmail=${encodeURIComponent(user.email || '')}`);
        return;
      }

      const entitled = await revenueCatContext.checkSinglePackageEntitlement();

      if (!entitled) {
        router.push(`/(tabs)/profile/course-paywall?courseType=SINGLE_PACKAGE&userEmail=${encodeURIComponent(user.email || '')}`);
        return;
      }

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
      if (!revenueCatContext?.checkMultiPackageEntitlement) {
        router.push(`/(tabs)/profile/course-paywall?courseType=MULTI_PACKAGE&userEmail=${encodeURIComponent(user.email || '')}`);
        return;
      }

      const entitled = await revenueCatContext.checkMultiPackageEntitlement();

      if (!entitled) {
        router.push(`/(tabs)/profile/course-paywall?courseType=MULTI_PACKAGE&userEmail=${encodeURIComponent(user.email || '')}`);
        return;
      }

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
        },
      });

      router.push(`/(tabs)/profile/createSubject/${id}?courseType=MULTI_PACKAGE&maxHours=20`);
    } catch (error) {
      console.error('Error in handleSelectMultiPackage:', error);
      Alert.alert('Error', 'Failed to navigate to course creation.');
    }
  };

  const handleSettingsPress = () => {
    router.push('/(tabs)/profile/settings');
  };

  const handleShareProfile = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Your profile is still loading. Please try again.');
      return;
    }

    const url = getTeacherProfileShareUrl(user.id);
    const message = `View ${user.name || 'this tutor'}'s profile on Coach Academ\n${url}`;

    try {
      await Share.share({ message, url });
    } catch (err) {
      if ((err as { message?: string })?.message !== 'User did not share') {
        Alert.alert('Error', 'Could not open share sheet.');
      }
    }
  };

  const onRefresh = () => {
    setLoading(true);
    setRefreshing(true);
    getUser();
  };

  const teacherCourses = user.subjects || [];
  const studentCourses = user.userSubjects || [];
  const hasCourses = userDetails?.isTeacher ? teacherCourses.length > 0 : studentCourses.length > 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <View style={styles.titleBlock}>
          <Text style={styles.pageTitle}>Profile</Text>
          <Text style={styles.pageSubtitle}>Your account, classes, and courses</Text>
        </View>
        <View style={styles.iconsContainer}>
          {userDetails?.isTeacher && (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleShareProfile}
              accessibilityRole="button"
              accessibilityLabel="Share profile"
            >
              <Ionicons name="share-outline" size={22} color="#12263A" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleSettingsPress}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
          >
            <Ionicons name="settings-outline" size={22} color="#12263A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.mainContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1A4C6E']}
            tintColor="#1A4C6E"
          />
        }
      >
        <View style={styles.identityCard}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/profile/edit-profile')}
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo"
          >
            {user.profileImage ? (
              <Image
                key={user.profileImage ?? 'default'}
                source={{
                  uri: user.profileImage,
                  cacheKey: `${user.profileImage ?? 'default'}-${profileImageVersion}`,
                }}
                style={styles.profileImage}
                placeholder={blurhash}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person-outline" size={28} color="#1A4C6E" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{user.name || 'Your profile'}</Text>
              <View style={styles.roleChip}>
                <Text style={styles.roleChipText}>
                  {userDetails?.isTeacher ? 'Tutor' : 'Student'}
                </Text>
              </View>
            </View>
            {!!user?.reccomendedSubjects?.length && (
              <View style={styles.badgeContainer}>
                {user.reccomendedSubjects.map((subjectTag, idx) => (
                  <View style={styles.badge} key={`${subjectTag}-${idx}`}>
                    <Text style={styles.badgeText}>{subjectTag}</Text>
                  </View>
                ))}
              </View>
            )}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile/edit-profile')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <Text style={styles.editLink}>Edit profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>About</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>
              {user.userDescription || "No description added yet."}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <CalendarSummary isTeacher={userDetails?.isTeacher} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Courses</Text>
            {userDetails?.isTeacher && (
              <TouchableOpacity
                onPress={handleCreateNewSubject}
                disabled={loading || refreshing || isButtonCooldown}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Create a new course"
              >
                <View style={[styles.addButton, (loading || refreshing || isButtonCooldown) && styles.addButtonDisabled]}>
                  <Text style={[styles.addButtonText, (loading || refreshing || isButtonCooldown) && styles.addButtonTextDisabled]}>
                    New course
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {userDetails?.isTeacher && hasCourses && (
            <SubjectCards
              subjectData={user.subjects}
              handleItemPress={handleItemPress}
              isHorizontal={false}
            />
          )}
          {!userDetails?.isTeacher && hasCourses && (
            <UserSubjectCards
              subjectData={user?.userSubjects}
              handleItemPress={handleItemPress}
              isHorizontal={false}
            />
          )}
          {!hasCourses && (
            <View style={styles.emptyCourses}>
              <Ionicons name="book-outline" size={28} color="#5C6B76" />
              <Text style={styles.emptyCoursesTitle}>
                {userDetails?.isTeacher ? 'No courses yet' : 'No enrolled courses'}
              </Text>
              <Text style={styles.emptyCoursesSub}>
                {userDetails?.isTeacher
                  ? 'Create a course to start teaching.'
                  : 'Courses you enroll in will show up here.'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {(loading || refreshing) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1A4C6E" />
        </View>
      )}

      <CourseTypeModal
        visible={showCourseTypeModal}
        onClose={() => setShowCourseTypeModal(false)}
        onSelectSingle={handleSelectSingleStudent}
        onSelectMulti={handleSelectMultiStudent}
        onSelectSinglePackage={handleSelectSinglePackage}
        onSelectMultiPackage={handleSelectMultiPackage}
        isMultiStudentSubscribed={isMultiStudentSubscribed}
        isSinglePackageSubscribed={isSinglePackageSubscribed}
        isMultiPackageSubscribed={isMultiPackageSubscribed}
        hasSingleStudentDraft={hasSingleStudentDraft}
        hasMultiStudentDraft={hasMultiStudentDraft}
        hasSinglePackageDraft={hasSinglePackageDraft}
        hasMultiPackageDraft={hasMultiPackageDraft}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(12),
  },
  titleBlock: {
    flex: 1,
    marginRight: 12,
  },
  pageTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#12263A',
  },
  pageSubtitle: {
    marginTop: 4,
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5C6B76',
  },
  iconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(28),
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(244,246,248,0.4)',
  },
  identityCard: {
    marginHorizontal: horizontalScale(20),
    marginBottom: verticalScale(8),
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#D7DEE5',
  },
  profileImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#EEF3F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flexShrink: 1,
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#12263A',
  },
  roleChip: {
    backgroundColor: '#E4EEF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  roleChipText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: '#1A4C6E',
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  badge: {
    backgroundColor: '#EEF3F7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#1A4C6E',
  },
  editLink: {
    marginTop: 8,
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#1A4C6E',
  },
  section: {
    paddingTop: verticalScale(16),
    paddingHorizontal: horizontalScale(20),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    gap: 12,
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
  },
  sectionTitleSpaced: {
    marginBottom: verticalScale(10),
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
  },
  aboutText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5C6B76',
    lineHeight: 22,
  },
  addButton: {
    minHeight: 44,
    backgroundColor: '#1A4C6E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#C5CDD6',
  },
  addButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#FFFFFF',
  },
  addButtonTextDisabled: {
    color: '#FFFFFF',
  },
  emptyCourses: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  emptyCoursesTitle: {
    marginTop: 10,
    fontFamily: FONT.bold,
    fontSize: moderateScale(15),
    color: '#12263A',
  },
  emptyCoursesSub: {
    marginTop: 4,
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProfilePage;
