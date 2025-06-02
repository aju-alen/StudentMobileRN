import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  ActivityIndicator,
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { ipURL } from '../../utils/utils';
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, SIZES } from '../../../constants';
import { horizontalScale, verticalScale, moderateScale } from '../../utils/metrics';
import { debounce } from "lodash";
import { StatusBar } from "expo-status-bar";
import SubjectCards from "../../components/SubjectCards";
import HorizontalSubjectCard from "../../components/horizontalSubjectCard";
import ColumnSubjectCards from "../../components/colSubjectCards";
import VideoPlayer from "../../components/VideoPlayer";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/en';
import { axiosWithAuth } from "../../utils/customAxios";

// Initialize dayjs plugins
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
  completedCourses?: number;
  level?: number;
  nextLevelProgress?: number;
  enrolledCourses?: number;
  certificatesEarned?: number;
  upcomingDeadlines?: Deadline[];
}

interface Stats {
  icon: string;
  label: string;
  value: number;
}

interface Deadline {
  id: string;
  bookingDate: string; // ISO date string
  bookingTime: string; // e.g., "11:00"
  subject: {
    subjectName: string;
  };
  teacher: {
    name: string;
  };
  student: {
    name: string;
  };
  priority?: 'high' | 'medium' | 'low';
}

interface LiveSession {
  id: string;
  title: string;
  instructor: string;
  startTime: string;
  duration: string;
  thumbnail: string;
  participantsCount: number;
}

interface CourseProgress {
  id: string;
  title: string;
  progress: number;
  lastAccessed: string;
  nextLesson: string;
  thumbnail: string;
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const HomePage = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [subjectData, setSubjectData] = React.useState([]);
  const [recommendedSubjects, setRecommendedSubjects] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [currentLearning, setCurrentLearning] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const params = useLocalSearchParams();
  const { subjectGrade, subjectBoard, subjectTags } = params;
  const [user, setUser] = useState<User>({
    name: '',
    profileImage: '',
    streakCount: 0,
    totalPoints: 0,
    completedCourses: 0,
  });

  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const videoData = [
    { id: '1', videoUrl: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/VIDEO-2024-02-06-19-22-24+(1).mp4' },
    { id: '2', videoUrl: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/VIDEO-2024-02-06-19-22-24+(1).mp4' },
    { id: '3', videoUrl: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/VIDEO-2024-02-06-19-22-24+(1).mp4' },
    { id: '4', videoUrl: 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/VIDEO-2024-02-06-19-22-24+(1).mp4' },
  ];

  // Updated Header animation for smoother transition
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [verticalScale(200), verticalScale(140)], // Increased height
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.98],
    extrapolate: 'clamp',
  });

  const StatsCard = ({ stats }: { stats: Stats }) => (
    <View style={styles.statsCard}>
      <Text style={styles.statsValue}>{stats.value}</Text>
      <Text style={styles.statsLabel}>{stats.label}</Text>
    </View>
  );

  const animateButton = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const QuickActionButton = ({ icon, label, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      animateButton(scale);
      onPress();
    };

    return (
      <TouchableOpacity 
        style={styles.quickActionButton} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Animated.View 
          style={[
            styles.quickActionIcon,
            {
              transform: [{ scale }]
            }
          ]}
        >
          <Ionicons name={icon} size={24} color="#1A4C6E" />
        </Animated.View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({ title, showSeeAll = false }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const handleSeeAllPress = () => {
      animateButton(scale);
      router.push('/(tabs)/home/allSubject');
    };

    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showSeeAll && (
          <TouchableOpacity 
            style={styles.seeAllButton} 
            onPress={handleSeeAllPress}
            activeOpacity={0.7}
          >
            <Animated.View 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                transform: [{ scale }]
              }}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Ionicons name="chevron-forward" size={16} color="#F1A568" />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const getRelativeDate = (dateString: string) => {
    const bookingDate = dayjs(dateString);
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');
    
    if (bookingDate.isSame(today, 'day')) {
      return 'Today';
    } else if (bookingDate.isSame(tomorrow, 'day')) {
      return 'Tomorrow';
    } else {
      return bookingDate.format('MMM D, YYYY');
    }
  };

  const getPriority = (dateString: string): 'high' | 'medium' | 'low' => {
    const bookingDate = dayjs(dateString);
    const today = dayjs().startOf('day');
    const tomorrow = today.add(1, 'day');
    
    if (bookingDate.isSame(today, 'day')) {
      return 'high';
    } else if (bookingDate.isSame(tomorrow, 'day')) {
      return 'medium';
    } else {
      return 'low';
    }
  };

  const DeadlineCard = ({ deadline }: { deadline: Deadline }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const priority = getPriority(deadline.bookingDate);
    
    const handlePress = () => {
      animateButton(scale);
    };

    return (
      <TouchableOpacity 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Animated.View 
          style={[
            styles.deadlineCard,
            {
              transform: [{ scale }]
            }
          ]}
        >
          <View style={[styles.priorityIndicator, styles[`priority${priority}`]]} />
          <View style={styles.deadlineInfo}>
            <Text style={styles.deadlineTitle}>{deadline?.subject.subjectName}</Text>
            <Text style={styles.deadlineType}>Live Class</Text>
            <Text style={styles.teacherName}>with {deadline?.teacher.name}</Text>
          </View>
          <View style={styles.deadlineTime}>
            <Text style={styles.deadlineLabel}>Due</Text>
            <Text style={styles.deadlineDate}>{getRelativeDate(deadline.bookingDate)}</Text>
            <Text style={styles.classTime}>{deadline.bookingTime}</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userResponse, subjectsResponse] = await Promise.all([
        axiosWithAuth.get(`${ipURL}/api/auth/metadata`),
        axiosWithAuth.get(`${ipURL}/api/subjects/search?subjectGrade=${subjectGrade}&subjectBoard=${subjectBoard}&subjectTags=${subjectTags}`)
      ]);

      setUser(userResponse.data);
      setSubjectData(subjectsResponse.data);

      const { reccomendedSubjects: recommendedSubjects, recommendedGrade, recommendedBoard } = userResponse.data;
      // const recommendedResponse = await axios.post(
      //   `${ipURL}/api/subjects/get-recommended-subjects`,
      //   { recommendedSubjects, recommendedBoard, recommendedGrade },
      //   { headers: { Authorization: `Bearer ${token}` }}
      // );
      // setRecommendedSubjects(recommendedResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadAllData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchData(), fetchDeadlines()]).finally(() => setRefreshing(false));
  }, []);

  const handleItemPress = (itemId: { id: any }) => {
    router.push(`/(tabs)/home/${itemId.id}`);
  };

  if (!isDataLoaded) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1A4C6E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <StatusBar style="light" />
    
    {/* Enhanced Animated Header */}
    <Animated.View style={[styles.header, {  opacity: headerOpacity }]}>
      <View style={styles.userSection}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => {
            animateButton(buttonScale);
            router.replace('/(tabs)/profile');
          }}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Image
              source={{ uri: user.profileImage }}
              style={styles.profileImage}
              placeholder={blurhash}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.onlineIndicator} />
          </Animated.View>
        </TouchableOpacity>
        
        <View style={styles.welcomeText}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user.name.split(' ')[0]}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => animateButton(buttonScale)}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View style={styles.notificationBadge} />
          </Animated.View>
        </TouchableOpacity>
      </View>

        {/* Enhanced Stats Container */}
        {/* <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsContent}
        >
          <StatsCard stats={{ icon: "flame-outline", label: "Day Streak", value: user.streakCount || 4 }} />
          <StatsCard stats={{ icon: "star-outline", label: "Total Points", value: user.totalPoints || 11 }} />
          <StatsCard stats={{ icon: "trophy-outline", label: "Completed", value: user.completedCourses || 81 }} />
        </ScrollView> */}
      </Animated.View>

      {/* Main Content */}
      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing}  />
        }
      >
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <QuickActionButton 
            icon="search-outline" 
            label="Find Courses"
            onPress={() => router.push('/(tabs)/home/filter')}
          />
          <QuickActionButton 
            icon="calendar-outline" 
            label="Schedule"
            onPress={() => router.push('/(tabs)/profile/schedule')}
          />
          <QuickActionButton 
            icon="bookmark-outline" 
            label="Saved"
            onPress={() => router.push('/(tabs)/home/saved')}
          />
          <QuickActionButton 
            icon="trending-up-outline" 
            label="Progress"
            onPress={() => router.push('/(tabs)/home/progress')}
          />
        </View>

        {/* Continue Learning Section */}
        {currentLearning.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Continue Learning" />
            <View style={styles.continueCard}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '65%' }]} />
              </View>
              <Text style={styles.continueTitle}>Advanced Mathematics</Text>
              <Text style={styles.continueProgress}>65% Complete</Text>
              <TouchableOpacity style={styles.continueButton}>
                <Text style={styles.continueButtonText}>Resume</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Upcoming Deadlines */}
        <View style={styles.section}>
          <SectionHeader title="Upcoming Deadlines" />
          <View style={styles.deadlinesContainer}>
            {deadlines.map(deadline => (
              <DeadlineCard key={deadline.id} deadline={deadline} />
            ))}
          </View>
        </View>

        {/* Recommended Courses Section */}
        {/* <View style={styles.section}>
          <SectionHeader title="Recommended for You" />
          <HorizontalSubjectCard 
            subjectData={recommendedSubjects} 
            handleItemPress={handleItemPress} 
            isHorizontal={true}
          />
        </View> */}

        {/* Popular Courses Section */}
        <View style={styles.section}>
          <SectionHeader title="Popular Courses" />
          <HorizontalSubjectCard 
            subjectData={subjectData} 
            handleItemPress={handleItemPress} 
            isHorizontal={true}
          />
        </View>

        {/* Browse Courses Section */}
        <View style={styles.section}>
          <SectionHeader title="Browse Courses" showSeeAll />
          <ColumnSubjectCards 
            subjectData={subjectData} 
            handleItemPress={handleItemPress} 
            isHorizontal={false}
          />
        </View>

        {/* Video Section */}
        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader title="Recommended Videos" />
          <VideoPlayer videoUrl={'https://coachacademic.s3.ap-southeast-1.amazonaws.com/VIDEO-2024-02-06-19-22-24+(1).mp4'} />
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#1A4C6E',
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(25),
    borderBottomLeftRadius: moderateScale(35),
    borderBottomRightRadius: moderateScale(35),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
  },
  profileButton: {
    position: 'relative',
  },
  profileImage: {
    height: verticalScale(48),
    width: horizontalScale(48),
    borderRadius: moderateScale(24),
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2DCB63',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  welcomeText: {
    flex: 1,
    marginLeft: horizontalScale(12),
  },
  greeting: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#E0E0E0',
  },
  
  
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F1A568',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: verticalScale(24),
  },
  lastSection: {
    marginBottom: verticalScale(24),
  },
  
 
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#F1A568',
    marginRight: horizontalScale(4),
  },
  
  statsValue: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A4C6E',
    marginTop: verticalScale(5),
  },
  statsLabel: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#666',
    marginTop: verticalScale(2),
  },
  quickActionButton: {
    alignItems: 'center',
    width: horizontalScale(80),
  },
  
  quickActionLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: COLORS.primary,
    marginTop: verticalScale(8),
  },
  statsContainer: {
    marginTop: verticalScale(10),
  },
  statsContent: {
    paddingHorizontal: horizontalScale(20),
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(20),
  },
  continueCard: {
    backgroundColor: '#F1A568',
    borderRadius: moderateScale(15),
    padding: moderateScale(20),
    alignItems: 'center',
  },
 
  continueTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A4C6E',
  },
  continueProgress: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#1A4C6E',
    marginBottom: verticalScale(12),
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(15),
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
  },
  continueButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#1A4C6E',
  },
  achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(15),
    padding: moderateScale(15),
    width: horizontalScale(100),
    alignItems: 'center',
  },
  achievementIcon: {
    backgroundColor: '#F1A568',
    width: horizontalScale(50),
    height: verticalScale(50),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#1A4C6E',
    marginTop: verticalScale(8),
  },
  achievementDesc: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#666',
    marginTop: verticalScale(4),
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    margin: horizontalScale(20),
    borderRadius: moderateScale(15),
    padding: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  progressTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A4C6E',
  },
  progressStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressNumber: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A4C6E',
  },
  progressLabel: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#666666',
    marginLeft: horizontalScale(4),
  },
  progressDivider: {
    width: 1,
    height: verticalScale(20),
    backgroundColor: '#E0E0E0',
    marginHorizontal: horizontalScale(12),
  },
  progressBar: {
    height: verticalScale(8),
    backgroundColor: 'rgba(26,76,110,0.1)',
    borderRadius: moderateScale(4),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F1A568',
    borderRadius: moderateScale(4),
  },
  progressText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#666666',
    marginTop: verticalScale(8),
  },
  liveSessionsContainer: {
    paddingHorizontal: horizontalScale(20),
  },
  liveSessionCard: {
    width: horizontalScale(280),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(15),
    marginRight: horizontalScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionThumbnail: {
    width: '100%',
    height: verticalScale(140),
    borderTopLeftRadius: moderateScale(15),
    borderTopRightRadius: moderateScale(15),
  },
  liveIndicator: {
    position: 'absolute',
    top: verticalScale(12),
    left: horizontalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4A4A',
    marginRight: horizontalScale(4),
  },
  liveText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(10),
    color: '#FFFFFF',
  },
  sessionInfo: {
    padding: moderateScale(16),
  },
  sessionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A4C6E',
    marginBottom: verticalScale(4),
  },
  sessionInstructor: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#666666',
    marginBottom: verticalScale(8),
  },
  sessionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: horizontalScale(16),
  },
  sessionTimeText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#666666',
    marginLeft: horizontalScale(4),
  },
  sessionParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionParticipantsText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#666666',
    marginLeft: horizontalScale(4),
  },

  // Deadlines
  deadlinesContainer: {
    paddingHorizontal: horizontalScale(20),
  },
  
  priorityIndicator: {
    width: 4,
    height: verticalScale(40),
    borderRadius: moderateScale(2),
    marginRight: horizontalScale(12),
  },
  priorityhigh: {
    backgroundColor: '#FF4A4A',
  },
  prioritymedium: {
    backgroundColor: '#F1A568',
  },
  prioritylow: {
    backgroundColor: '#2DCB63',
  },
  deadlineInfo: {
    flex: 1,
    marginRight: horizontalScale(12),
  },
  deadlineTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#1A4C6E',
    marginBottom: verticalScale(4),
  },
  deadlineType: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#666666',
  },
  deadlineTime: {
    alignItems: 'flex-end',
    minWidth: horizontalScale(100),
  },
  deadlineLabel: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#666666',
  },
  deadlineDate: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#1A4C6E',
  },
  teacherName: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#666666',
    marginTop: verticalScale(4),
  },
  classTime: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#1A4C6E',
    marginTop: verticalScale(4),
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: moderateScale(20),
    padding: moderateScale(4),
    marginHorizontal: horizontalScale(4),
    alignItems: 'center',
    minWidth: horizontalScale(110),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: horizontalScale(56),
    height: verticalScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: 'rgba(26,76,110,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A4C6E',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(18),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(18),
    marginTop: verticalScale(8),
  },

  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A4C6E',
    letterSpacing: -0.5,
  },

  notificationButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  userName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
