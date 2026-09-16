import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Share,
  StatusBar,
  ActivityIndicator,
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
import CreateCourseCTA from "../../components/CreateCourseCTA";
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
  isParent?: boolean;
  userType?: string;
}

interface SubjectItem {
  id: string;
  subjectName: string;
  subjectDescription?: string;
  subjectImage?: string;
  subjectPrice?: number;
  subjectBoard?: string;
  subjectGrade?: number;
  subjectVerification?: boolean;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
}

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const ProfilePage = () => {
  const [user, setUser] = useState<User>({});
  const [userDetails, setUserDetails] = useState<User>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [profileImageVersion, setProfileImageVersion] = useState<string>('0');
  const [resubmittingId, setResubmittingId] = useState<string | null>(null);
  const [parentInvites, setParentInvites] = useState([]);

  const isParent = !!(userDetails?.isParent || userDetails?.userType === 'PARENT');

  const getUser = async () => {
    try {
      const apiUser = await axiosWithAuth.get(`${ipURL}/api/auth/metadata`);

      setUser(apiUser.data);
      setUserDetails(apiUser.data);
      if (apiUser.data?.userType === 'STUDENT' && !apiUser.data?.isTeacher) {
        try {
          const invites = await axiosWithAuth.get(`${ipURL}/api/student/parent-invites`);
          setParentInvites(invites.data || []);
        } catch (error) {
          setParentInvites([]);
        }
      } else {
        setParentInvites([]);
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

  const handleResubmitSubject = async (item: { id: string }) => {
    try {
      setResubmittingId(item.id);
      await axiosWithAuth.put(`${ipURL}/api/subjects/resubmit/${item.id}`);
      Alert.alert('Resubmitted', 'Your course is back in the verification queue.');
      getUser();
    } catch (error) {
      console.error('Error resubmitting subject:', error);
      Alert.alert('Resubmit failed', 'Could not resubmit this course. Please try again.');
    } finally {
      setResubmittingId(null);
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
    setRefreshing(true);
    getUser();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, styles.loadingContainer]}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#1A4C6E" />
        <Text style={styles.loadingText}>Loading your profile</Text>
      </SafeAreaView>
    );
  }

  const teacherCourses = user.subjects || [];
  const studentCourses = user.userSubjects || [];
  const hasCourses = userDetails?.isTeacher ? teacherCourses.length > 0 : studentCourses.length > 0;
  const profileAvatar = user.profileImage ? (
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
  );

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
          {isParent ? (
            profileAvatar
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/profile/edit-profile')}
              accessibilityRole="button"
              accessibilityLabel="Edit profile photo"
            >
              {profileAvatar}
            </TouchableOpacity>
          )}
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>{user.name || 'Your profile'}</Text>
              <View style={styles.roleChip}>
                <Text style={styles.roleChipText}>
                  {userDetails?.isTeacher ? 'Tutor' : isParent ? 'Parent' : 'Student'}
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
            {!isParent && (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile/edit-profile')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <Text style={styles.editLink}>Edit profile</Text>
            </TouchableOpacity>
            )}
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

        {parentInvites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parent requests</Text>
            {parentInvites.map((invite) => (
              <View key={invite.linkId} style={styles.card}>
                <Text style={styles.aboutText}>
                  {invite.parent?.name} ({invite.status === 'PENDING' ? 'wants to link' : 'linked'})
                </Text>
                {invite.status === 'PENDING' && (
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={async () => {
                        await axiosWithAuth.post(`${ipURL}/api/student/parent-invites/${invite.linkId}/accept`);
                        getUser();
                      }}
                    >
                      <Text style={styles.editLink}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={async () => {
                        await axiosWithAuth.post(`${ipURL}/api/student/parent-invites/${invite.linkId}/reject`);
                        getUser();
                      }}
                    >
                      <Text style={[styles.editLink, { color: '#C44747' }]}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {invite.status === 'ACCEPTED' && (
                  <TouchableOpacity
                    onPress={async () => {
                      await axiosWithAuth.delete(`${ipURL}/api/student/parent-links/${invite.linkId}`);
                      getUser();
                    }}
                  >
                    <Text style={[styles.editLink, { color: '#C44747' }]}>Unlink</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
        {!(userDetails?.isParent || userDetails?.userType === 'PARENT') && (
        <View style={styles.section}>
          <CalendarSummary isTeacher={userDetails?.isTeacher} />
        </View>
        )}

        {userDetails?.isParent || userDetails?.userType === 'PARENT' ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Linked students</Text>
            <Text style={styles.emptyCoursesSub}>
              Invite and manage students from Home. Parent accounts cannot create courses or join organizations.
            </Text>
          </View>
        ) : (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Courses</Text>
            {userDetails?.isTeacher && (
              <CreateCourseCTA
                variant="compact"
                email={user.email}
                disabled={refreshing}
              />
            )}
          </View>

          {userDetails?.isTeacher && hasCourses && (
            <SubjectCards
              subjectData={user.subjects}
              handleItemPress={handleItemPress}
              isHorizontal={false}
              isOwner
              onEdit={(item) => router.push(`/(tabs)/profile/editSubject/${item.id}`)}
              onResubmit={handleResubmitSubject}
              resubmittingId={resubmittingId}
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#5C6B76',
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
