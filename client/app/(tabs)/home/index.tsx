import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import * as Updates from "expo-updates";
import axios from "axios";
import { ipURL } from '../../utils/utils';
import { Ionicons } from "@expo/vector-icons";
import { FONT } from '../../../constants';
import { horizontalScale, verticalScale, moderateScale } from '../../utils/metrics';
import { StatusBar } from "expo-status-bar";
import HorizontalSubjectCard from "../../components/horizontalSubjectCard";
import ColumnSubjectCards from "../../components/colSubjectCards";
import VideoPlayer from "../../components/VideoPlayer";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/en';
import { axiosWithAuth } from "../../utils/customAxios";
import { SafeAreaView } from "react-native-safe-area-context";

dayjs.extend(relativeTime);
dayjs.locale('en');

interface User {
  email?: string;
  name?: string;
  profileImage?: string;
  userDescription?: string;
  reccomendedSubjects?: [string];
  streakCount?: number;
  totalPoints?: number;
  isTeacher?: boolean;
  completedCourses?: number;
  level?: number;
  nextLevelProgress?: number;
  enrolledCourses?: number;
  certificatesEarned?: number;
  upcomingDeadlines?: Deadline[];
  studyTime?: number;
  weeklyGoal?: number;
  rank?: number;
  totalStudents?: number;
}

interface Deadline {
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

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const communityVideos = [
  {
    id: "welcome-splash",
    title: "Mathematics",
    videoUrl: "https://coachacademic.s3.ap-southeast-1.amazonaws.com/video/1f.mp4",
  },
  {
    id: "community-reel",
    title: "Mathematics",
    videoUrl: "https://coachacademic.s3.ap-southeast-1.amazonaws.com/video/2f.mp4",
  },
  {
    id: "highlights",
    title: "Mathematics",
    videoUrl: "https://coachacademic.s3.ap-southeast-1.amazonaws.com/video/3f.mp4",
  },
  {
    id: "high",
    title: "Mathematics",
    videoUrl: "https://coachacademic.s3.ap-southeast-1.amazonaws.com/video/4f.mp4",
  },
];

const getGreeting = (date: Date) => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const getRelativeDate = (dateString: string) => {
  const bookingDate = dayjs(dateString);
  const today = dayjs().startOf('day');
  const tomorrow = today.add(1, 'day');

  if (bookingDate.isSame(today, 'day')) return 'Today';
  if (bookingDate.isSame(tomorrow, 'day')) return 'Tomorrow';
  return bookingDate.format('MMM D');
};

const SectionHeader = ({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {!!actionLabel && !!onAction && (
      <TouchableOpacity
        onPress={onAction}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        style={styles.seeAllButton}
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
      >
        <Text style={styles.seeAllText}>{actionLabel}</Text>
        <Ionicons name="chevron-forward" size={16} color="#1A4C6E" />
      </TouchableOpacity>
    )}
  </View>
);

const DestinationTile = ({
  icon,
  label,
  onPress,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  badge?: string | null;
}) => (
  <TouchableOpacity
    style={styles.destinationTile}
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={badge ? `${label}, ${badge}` : label}
  >
    <View style={styles.destinationIconWrap}>
      <Ionicons name={icon} size={22} color="#1A4C6E" />
      {!!badge && (
        <View style={styles.destinationBadge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </View>
    <Text style={styles.destinationLabel}>{label}</Text>
  </TouchableOpacity>
);

const NextClassCard = ({
  deadline,
  isTeacher,
  onPress,
  compact = false,
}: {
  deadline: Deadline;
  isTeacher?: boolean;
  onPress: () => void;
  compact?: boolean;
}) => {
  const counterpart = isTeacher ? deadline?.student?.name : deadline?.teacher?.name;
  const when = getRelativeDate(deadline.bookingDate);
  const isToday = when === 'Today';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        compact ? styles.nextClassCompact : styles.nextClassCard,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${deadline?.subject?.subjectName}, ${when} at ${deadline.bookingTime}`}
    >
      <View style={[styles.nextClassWhen, isToday && styles.nextClassWhenToday]}>
        <Text style={[styles.nextClassWhenLabel, isToday && styles.nextClassWhenLabelToday]}>
          {when}
        </Text>
        <Text style={[styles.nextClassTime, isToday && styles.nextClassTimeToday]}>
          {deadline.bookingTime}
        </Text>
      </View>
      <View style={styles.nextClassBody}>
        <Text style={styles.nextClassKicker}>{isTeacher ? 'Your class' : 'Live class'}</Text>
        <Text style={styles.nextClassTitle} numberOfLines={2}>
          {deadline?.subject?.subjectName}
        </Text>
        {!!counterpart && (
          <Text style={styles.nextClassWith} numberOfLines={1}>
            with {counterpart}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#5C6B76" />
    </Pressable>
  );
};

const HomePage = () => {
  const [subjectData, setSubjectData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const params = useLocalSearchParams();
  const { subjectGrade, subjectBoard, subjectTags } = params;
  const [user, setUser] = useState<User>({
    name: '',
    profileImage: '',
    streakCount: 0,
    totalPoints: 0,
    completedCourses: 0,
    studyTime: 0,
    weeklyGoal: 20,
    rank: 0,
    totalStudents: 0,
  });
  const [userDetails, setUserDetails] = useState({
    userName: '',
    userProfileImage: '',
  });
  const [profileImageVersion, setProfileImageVersion] = useState<string>('0');
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { isUpdateAvailable, isUpdatePending } = Updates.useUpdates();
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);
  const [hasShownUpdateAlert, setHasShownUpdateAlert] = useState(false);

  const firstName = userDetails.userName?.split(' ')[0] || 'there';
  const roleLabel = user.isTeacher ? 'Tutor' : 'Student';
  const featuredCourses = useMemo(() => subjectData.slice(0, 6), [subjectData]);
  const browseCourses = useMemo(() => subjectData.slice(6, 16), [subjectData]);
  const [nextClass, ...laterClasses] = deadlines;

  const refreshUserDetails = useCallback(async () => {
    const stored = await AsyncStorage.getItem('userDetails');
    if (stored) setUserDetails(JSON.parse(stored));
    const version = await AsyncStorage.getItem('profileImageVersion');
    if (version != null) setProfileImageVersion(version);
  }, []);

  useEffect(() => {
    refreshUserDetails();
  }, [refreshUserDetails]);

  useFocusEffect(
    useCallback(() => {
      refreshUserDetails();
    }, [refreshUserDetails])
  );

  const fetchData = async () => {
    try {
      const [userResponse, subjectsResponse] = await Promise.all([
        axiosWithAuth.get(`${ipURL}/api/auth/metadata`),
        axiosWithAuth.get(`${ipURL}/api/subjects/search?subjectGrade=${subjectGrade}&subjectBoard=${subjectBoard}&subjectTags=${subjectTags}`)
      ]);
      setUser(userResponse.data);
      setSubjectData(subjectsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchDeadlines = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${ipURL}/api/bookings/upcoming-classes?limit=2`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeadlines(response.data);
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([fetchData(), fetchDeadlines()]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsDataLoaded(true);
      }
    };
    loadAllData();

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchData(), fetchDeadlines()]).finally(() => setRefreshing(false));
  }, []);

  const handleItemPress = (itemId: { id: any }) => {
    router.push(`/(tabs)/home/${itemId.id}`);
  };

  const openSchedule = () => router.push('/(tabs)/home/schedule');

  const applyOtaUpdate = useCallback(async () => {
    if (__DEV__) {
      Alert.alert("Unavailable in development", "OTA updates are available in release builds.");
      return;
    }

    setIsUpdatingApp(true);
    try {
      if (!isUpdatePending) {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
        } else {
          Alert.alert("No update found", "You are already on the latest version.");
          return;
        }
      }

      await Updates.reloadAsync();
    } catch (error) {
      console.error("Failed to apply OTA update:", error);
      Alert.alert("Update failed", "Could not install the update right now. Please try again.");
    } finally {
      setIsUpdatingApp(false);
    }
  }, [isUpdatePending]);

  useEffect(() => {
    if (!isUpdateAvailable) {
      setHasShownUpdateAlert(false);
      return;
    }

    if (!hasShownUpdateAlert) {
      setHasShownUpdateAlert(true);
      Alert.alert(
        "Update available",
        "A new app update is ready to install.",
        [
          { text: "Later", style: "cancel" },
          {
            text: "Update now",
            onPress: () => {
              void applyOtaUpdate();
            },
          },
        ]
      );
    }
  }, [applyOtaUpdate, hasShownUpdateAlert, isUpdateAvailable]);

  useFocusEffect(
    useCallback(() => {
      if (__DEV__) return;

      const checkForUpdate = async () => {
        try {
          await Updates.checkForUpdateAsync();
        } catch (error) {
          console.error("Failed to check OTA update:", error);
        }
      };

      void checkForUpdate();
    }, [])
  );

  if (!isDataLoaded) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#1A4C6E" />
        <Text style={styles.loadingText}>Loading your home</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.navigate('/(tabs)/profile')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Image
            source={{
              uri: userDetails.userProfileImage,
              cacheKey: `${userDetails.userProfileImage ?? 'default'}-${profileImageVersion}`,
            }}
            style={styles.profileImage}
            placeholder={blurhash}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        </TouchableOpacity>

        <View style={styles.welcomeText}>
          <Text style={styles.greeting}>{getGreeting(currentTime)}</Text>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>{firstName}</Text>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>{roleLabel}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
    style={styles.scroll}
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A4C6E" />
    }
  >
    <TouchableOpacity
      style={styles.searchBar}
      onPress={() => router.push('/(tabs)/home/allSubject')}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Search courses"
    >
      <Ionicons name="search" size={20} color="#5C6B76" />
      <Text style={styles.searchPlaceholder}>Search courses or tutors</Text>
    </TouchableOpacity>

    {isUpdateAvailable && (
      <View style={styles.updateBanner}>
        <View style={styles.updateMessage}>
          <Ionicons name="cloud-download-outline" size={20} color="#1A4C6E" />
          <View style={styles.updateTextContainer}>
            <Text style={styles.updateTitle}>Update available</Text>
            <Text style={styles.updateSubtitle}>Install the latest fixes and improvements.</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.updateButton, isUpdatingApp && styles.updateButtonDisabled]}
          onPress={() => {
            void applyOtaUpdate();
          }}
          disabled={isUpdatingApp}
        >
          {isUpdatingApp ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.updateButtonText}>Update now</Text>
          )}
        </TouchableOpacity>
      </View>
    )}

    {nextClass ? (
      <View style={styles.section}>
        <SectionHeader title="Up next" actionLabel="Schedule" onAction={openSchedule} />
        <View style={styles.paddedBlock}>
          <NextClassCard
            deadline={nextClass}
            isTeacher={user.isTeacher}
            onPress={openSchedule}
          />
          {laterClasses.map((deadline) => (
            <NextClassCard
              key={deadline.id}
              deadline={deadline}
              isTeacher={user.isTeacher}
              onPress={openSchedule}
              compact
            />
          ))}
        </View>
      </View>
    ) : (
      <View style={styles.section}>
        <View style={styles.paddedBlock}>
          <TouchableOpacity style={styles.emptyClass} onPress={openSchedule} activeOpacity={0.85}>
            <Ionicons name="calendar-outline" size={22} color="#1A4C6E" />
            <View style={styles.emptyClassCopy}>
              <Text style={styles.emptyClassTitle}>No class booked yet</Text>
              <Text style={styles.emptyClassSub}>Open your schedule to see upcoming sessions.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#5C6B76" />
          </TouchableOpacity>
        </View>
      </View>
    )}

    <View style={styles.destinationRow}>
      <DestinationTile
        icon="calendar-outline"
        label="Schedule"
        onPress={openSchedule}
        badge={deadlines.length > 0 ? String(deadlines.length) : null}
      />
      <DestinationTile
        icon="bookmark-outline"
        label="Saved"
        onPress={() => router.push('/(tabs)/home/saved')}
      />
      <DestinationTile
        icon="stats-chart-outline"
        label="Progress"
        onPress={() => router.push('/(tabs)/home/progress')}
      />
    </View>

    {subjectData.length > 0 ? (
      <>
        <View style={styles.section}>
          <SectionHeader
            title="Featured courses"
            actionLabel="See all"
            onAction={() => router.push('/(tabs)/home/allSubject')}
          />
          <HorizontalSubjectCard
            subjectData={featuredCourses}
            handleItemPress={handleItemPress}
            isHorizontal
          />
        </View>

        {browseCourses.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Browse courses"
            actionLabel="See all"
            onAction={() => router.push('/(tabs)/home/allSubject')}
          />
          <ColumnSubjectCards
            subjectData={browseCourses}
            handleItemPress={handleItemPress}
            isHorizontal={false}
          />
        </View>
        )}
      </>
    ) : (
      <View style={styles.section}>
        <View style={styles.paddedBlock}>
          <View style={styles.emptyCourses}>
            <Text style={styles.emptyClassTitle}>No courses to show yet</Text>
            <Text style={styles.emptyClassSub}>Pull to refresh, or search to find a tutor.</Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => router.push('/(tabs)/home/allSubject')}
            >
              <Text style={styles.emptyCtaText}>Find courses</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}

    <View style={[styles.section, styles.lastSection]}>
      <SectionHeader title="Community videos" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.videoScroll}
      >
        {communityVideos.map((item) => (
          <View key={item.id} style={styles.videoCard}>
            <VideoPlayer videoUrl={item.videoUrl} />
            <Text style={styles.videoTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  </ScrollView>
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
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
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(12),
  },
  profileButton: {
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
  },
  profileImage: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: '#D7DEE5',
  },
  welcomeText: {
    flex: 1,
    marginLeft: horizontalScale(12),
  },
  greeting: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
    marginTop: verticalScale(2),
  },
  userName: {
    flexShrink: 1,
    fontFamily: FONT.bold,
    fontSize: moderateScale(22),
    color: '#12263A',
  },
  roleChip: {
    backgroundColor: '#E4EEF5',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(999),
  },
  roleChipText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: '#1A4C6E',
  },
  content: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(28),
  },
  searchBar: {
    marginHorizontal: horizontalScale(20),
    minHeight: 48,
    borderRadius: moderateScale(14),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EBF0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(14),
    gap: horizontalScale(10),
  },
  searchPlaceholder: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(15),
    color: '#8A97A3',
  },
  updateBanner: {
    marginTop: verticalScale(16),
    marginHorizontal: horizontalScale(20),
    padding: moderateScale(14),
    borderRadius: moderateScale(14),
    backgroundColor: '#E9F2F8',
    borderWidth: 1,
    borderColor: '#BFD7E8',
  },
  updateMessage: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateTextContainer: {
    marginLeft: horizontalScale(10),
    flex: 1,
  },
  updateTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#1A4C6E',
  },
  updateSubtitle: {
    marginTop: verticalScale(2),
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#355D7A',
  },
  updateButton: {
    marginTop: verticalScale(12),
    alignSelf: 'flex-start',
    backgroundColor: '#1A4C6E',
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(14),
    minWidth: 110,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#FFFFFF',
  },
  section: {
    marginTop: verticalScale(22),
  },
  lastSection: {
    marginBottom: verticalScale(8),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#12263A',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  seeAllText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#1A4C6E',
    marginRight: horizontalScale(2),
  },
  paddedBlock: {
    paddingHorizontal: horizontalScale(20),
    gap: verticalScale(10),
  },
  nextClassCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(18),
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: moderateScale(14),
    minHeight: 88,
    gap: horizontalScale(12),
  },
  nextClassCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(14),
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: moderateScale(12),
    minHeight: 64,
    gap: horizontalScale(12),
  },
  pressed: {
    opacity: 0.92,
  },
  nextClassWhen: {
    width: horizontalScale(72),
    borderRadius: moderateScale(12),
    backgroundColor: '#EEF3F7',
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextClassWhenToday: {
    backgroundColor: '#1A4C6E',
  },
  nextClassWhenLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: '#1A4C6E',
  },
  nextClassWhenLabelToday: {
    color: '#D7E6F2',
  },
  nextClassTime: {
    marginTop: verticalScale(2),
    fontFamily: FONT.bold,
    fontSize: moderateScale(13),
    color: '#12263A',
  },
  nextClassTimeToday: {
    color: '#FFFFFF',
  },
  nextClassBody: {
    flex: 1,
  },
  nextClassKicker: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: '#5C6B76',
    marginBottom: verticalScale(2),
  },
  nextClassTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
  },
  nextClassWith: {
    marginTop: verticalScale(2),
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  emptyClass: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: moderateScale(14),
    minHeight: 72,
    gap: horizontalScale(12),
  },
  emptyClassCopy: {
    flex: 1,
  },
  emptyClassTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(15),
    color: '#12263A',
  },
  emptyClassSub: {
    marginTop: verticalScale(2),
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  emptyCourses: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: moderateScale(18),
    alignItems: 'flex-start',
  },
  emptyCta: {
    marginTop: verticalScale(14),
    backgroundColor: '#1A4C6E',
    borderRadius: moderateScale(12),
    minHeight: 44,
    paddingHorizontal: horizontalScale(16),
    justifyContent: 'center',
  },
  emptyCtaText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
  destinationRow: {
    marginTop: verticalScale(18),
    paddingHorizontal: horizontalScale(20),
    flexDirection: 'row',
    gap: horizontalScale(10),
  },
  destinationTile: {
    flex: 1,
    minHeight: 88,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E6EBF0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(6),
  },
  destinationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF3F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C2410C',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: FONT.bold,
  },
  destinationLabel: {
    marginTop: verticalScale(8),
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#12263A',
    textAlign: 'center',
  },
  videoScroll: {
    paddingHorizontal: horizontalScale(20),
  },
  videoCard: {
    marginRight: horizontalScale(12),
  },
  videoTitle: {
    marginTop: verticalScale(8),
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#12263A',
  },
});
