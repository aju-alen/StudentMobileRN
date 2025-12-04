import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Animated,
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { ipURL } from '../../utils/utils';
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, SIZES } from '../../../constants';
import { horizontalScale, verticalScale, moderateScale } from '../../utils/metrics';
import { StatusBar } from "expo-status-bar";
import SubjectCards from "../../components/SubjectCards";
import HorizontalSubjectCard from "../../components/horizontalSubjectCard";
import ColumnSubjectCards from "../../components/colSubjectCards";
import VideoPlayer from "../../components/VideoPlayer";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/en';
import { axiosWithAuth } from "../../utils/customAxios";
import { LinearGradient } from 'expo-linear-gradient';
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

interface Stats {
  icon: string;
  label: string;
  value: number;
  color?: string;
  progress?: number;
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

const { width: screenWidth } = Dimensions.get('window');

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
    studyTime: 0,
    weeklyGoal: 20,
    rank: 0,
    totalStudents: 0,
  });
  const [userDetails, setUserDetails] = useState({
    userName: '',
    userProfileImage: '',

  });

  useEffect(() => {
    async function getUserDetails() {
      const userDetails = JSON.parse(await AsyncStorage.getItem('userDetails'));
      console.log(userDetails, 'this is the user details');
      setUserDetails(userDetails);
    }
    getUserDetails();
  }, []);

  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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
    <View style={[styles.statsCard, { backgroundColor: stats.color || '#FFFFFF' }]}>
      <View style={styles.statsIconContainer}>
        <Ionicons name={stats.icon as any} size={24} color={stats.color ? '#FFFFFF' : '#1A4C6E'} />
      </View>
      <Text style={[styles.statsValue, { color: stats.color ? '#FFFFFF' : '#1A4C6E' }]}>{stats.value}</Text>
      <Text style={[styles.statsLabel, { color: stats.color ? 'rgba(255,255,255,0.8)' : '#666' }]}>{stats.label}</Text>
      {stats.progress && (
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${stats.progress}%` }]} />
        </View>
      )}
    </View>
  );

  const StudyStreakCard = () => (
    <LinearGradient
      colors={['#FF6B6B', '#FF8E8E']}
      style={styles.streakCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.streakContent}>
        <View style={styles.streakIcon}>
          <Ionicons name="flame" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.streakInfo}>
          <Text style={styles.streakNumber}>{user.streakCount || 0}</Text>
          <Text style={styles.streakLabel}>Day Streak</Text>
          <Text style={styles.streakSubtext}>Keep it up!</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const StudyProgressCard = () => (
    <View style={styles.progressCard}>
      <View style={styles.progressHeaderNew}>
        <Text style={styles.progressTitleNew}>Weekly Goal</Text>
        <Text style={styles.progressPercentage}>
          {Math.round((user.studyTime || 0) / (user.weeklyGoal || 20) * 100)}%
        </Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { 
          width: `${Math.min((user.studyTime || 0) / (user.weeklyGoal || 20) * 100, 100)}%`,
          backgroundColor: '#4ECDC4'
        }]} />
      </View>
      <Text style={styles.progressTextNew}>
        {user.studyTime || 0}h / {user.weeklyGoal || 20}h this week
      </Text>
    </View>
  );

  const LeaderboardCard = () => (
    <View style={styles.leaderboardCard}>
      <View style={styles.leaderboardHeader}>
        <Ionicons name="trophy" size={20} color="#FFD700" />
        <Text style={styles.leaderboardTitle}>Your Rank</Text>
      </View>
      <Text style={styles.rankNumber}>#{user.rank || 0}</Text>
      <Text style={styles.rankSubtext}>out of {user.totalStudents || 0} students</Text>
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

  const QuickActionButton = ({ icon, label, onPress, color = "#1A4C6E", badge = null }) => {
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
              transform: [{ scale }],
              backgroundColor: color === "#1A4C6E" ? 'rgba(26,76,110,0.08)' : `${color}20`
            }
          ]}
        >
          <Ionicons name={icon} size={20} color={color} />
          {badge && (
            <View style={styles.quickActionBadge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </Animated.View>
        <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
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

  const DeadlineCard = ({
    deadline,
    isTeacher,
    onPress,
  }: {
    deadline: Deadline;
    isTeacher: boolean;
    onPress: () => void;
  }) => {
    const scale = useRef(new Animated.Value(1)).current;
    const priority = getPriority(deadline.bookingDate);
    
    const handlePress = () => {
      animateButton(scale);
      onPress && onPress();
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
            {isTeacher ? (
              <Text style={styles.teacherName}>with {deadline?.student.name}</Text>
            ) : (
              <Text style={styles.teacherName}>with {deadline?.teacher.name}</Text>
            )}
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
      console.log(userResponse.data, 'this is the user response');
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

    // Update time every minute for greeting
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={styles.container}>
    <StatusBar style="dark" />
    
    {/* Enhanced Animated Header */}
    <Animated.View style={[styles.header]}>
      <LinearGradient
        colors={['#1A4C6E', '#2A5C7E']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
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
              source={{ uri: userDetails.userProfileImage }}
              style={styles.profileImage}
              placeholder={blurhash}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.onlineIndicator} />
          </Animated.View>
        </TouchableOpacity>
        
        <View style={styles.welcomeText}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.userName}>{userDetails.userName.split(' ')[0]}</Text>
            <Text style={styles.userLevel}> {user.isTeacher ? 'Teacher' : 'Student'}</Text>
        </View>
        
     
      </View>

        {/* Enhanced Stats Container */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={styles.statsContent}
        >
          {/*<StudyStreakCard />
          <StudyProgressCard />
          <LeaderboardCard />
          */}
        </ScrollView>
      </LinearGradient>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Enhanced Quick Actions */}
        <View style={styles.quickActions}>
          <QuickActionButton 
            icon="search-outline" 
            label="Find Courses"
            onPress={() => router.push('/(tabs)/home/allSubject')}
            color="#1A4C6E"
          />
          <QuickActionButton 
            icon="calendar-outline" 
            label="Schedule"
            onPress={() => router.push('/(tabs)/profile/schedule')}

            badge={deadlines.length > 0 ? deadlines.length.toString() : null}
          />
          <QuickActionButton 
            icon="bookmark-outline" 
            label="Saved"
            onPress={() => router.push('/(tabs)/home/saved')}

          />
          <QuickActionButton 
            icon="trophy-outline" 
            label="Achievements"
            onPress={() => {
              // Alert.alert("Coming Soon", "Achievements feature will be available soon!");
              router.push('/(tabs)/home/progress');
            }}
          />
        </View>

        {/* Study Tools Section */}
        {/* <View style={styles.studyToolsSection}>
          <SectionHeader title="Study Tools" />
          <View style={styles.studyToolsGrid}>
            <TouchableOpacity 
              style={styles.studyToolCard}
              onPress={() => {
                Alert.alert("Coming Soon", "Study Timer feature will be available soon!");
              }}
            >
              <View style={[styles.studyToolIcon, { backgroundColor: '#4ECDC420' }]}>
                <Ionicons name="timer-outline" size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.studyToolLabel}>Study Timer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.studyToolCard}
              onPress={() => {
                Alert.alert("Coming Soon", "Flashcards feature will be available soon!");
              }}
            >
              <View style={[styles.studyToolIcon, { backgroundColor: '#FF6B6B20' }]}>
                <Ionicons name="library-outline" size={24} color="#FF6B6B" />
              </View>
              <Text style={styles.studyToolLabel}>Flashcards</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.studyToolCard}
              onPress={() => {
                Alert.alert("Coming Soon", "Study Groups feature will be available soon!");
              }}
            >
              <View style={[styles.studyToolIcon, { backgroundColor: '#FFD70020' }]}>
                <Ionicons name="people-outline" size={24} color="#FFD700" />
              </View>
              <Text style={styles.studyToolLabel}>Study Groups</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.studyToolCard}
              onPress={() => {
                Alert.alert("Coming Soon", "AI Tutor feature will be available soon!");
              }}
            >
              <View style={[styles.studyToolIcon, { backgroundColor: '#9B59B620' }]}>
                <Ionicons name="chatbubble-outline" size={24} color="#9B59B6" />
              </View>
              <Text style={styles.studyToolLabel}>AI Tutor</Text>
            </TouchableOpacity>
          </View>
        </View> */}

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
        {deadlines.length > 0 && <View style={styles.section}>
          <SectionHeader title="Upcoming Deadlines" />
          <View style={styles.deadlinesContainer}>
            {deadlines.map(deadline => (
              <DeadlineCard
                key={deadline.id}
                deadline={deadline}
                isTeacher={user.isTeacher}
                onPress={() => router.push('/profile/schedule')}
              />
            ))}
          </View>
        </View>}

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
            subjectData={subjectData
              .sort(() => Math.random() - 0.5)
              .slice(0, 7)} 
            handleItemPress={handleItemPress} 
            isHorizontal={true}
          />
        </View>

        {/* Browse Courses Section */}
        <View style={styles.section}>
          <SectionHeader title="Browse Courses" showSeeAll />
          <ColumnSubjectCards 
            subjectData={subjectData.slice(0, 14)} 
            handleItemPress={handleItemPress} 
            isHorizontal={false}
          />
        </View>

        {/* Video Section */}
        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader title="Recommended Videos" />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.videoScrollContainer}
          >
            <VideoPlayer 
              videoUrl={'https://coachacademic.s3.ap-southeast-1.amazonaws.com/VIDEO-2024-02-06-19-22-24+(1).mp4'} 
            />
            <VideoPlayer 
              videoUrl={'https://coachacademic.s3.ap-southeast-1.amazonaws.com/video/VIDEO-2025-06-04-12-53-18.mp4'} 
            />
            <VideoPlayer 
              videoUrl={'https://coachacademic.s3.ap-southeast-1.amazonaws.com/video/VIDEO-2025-06-04-12-54-39.mp4'} 
            />
            <VideoPlayer 
              videoUrl={'https://coachacademic.s3.ap-southeast-1.amazonaws.com/video/VIDEO-2025-06-04-12-51-14.mp4'} 
            />
            <VideoPlayer 
              videoUrl={'https://coachacademic.s3.ap-southeast-1.amazonaws.com/video/VIDEO-2025-06-04-12-54-20.mp4'} 
            />
          </ScrollView>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {

    paddingBottom: verticalScale(0),

    borderBottomLeftRadius: moderateScale(35),
    borderBottomRightRadius: moderateScale(35),
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(25),
    borderBottomLeftRadius: moderateScale(35),
    borderBottomRightRadius: moderateScale(35),
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(40),
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
  userLevel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#B0C4DE',
    marginTop: verticalScale(2),
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF4A4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
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
    fontSize: moderateScale(10),
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
    //shadowOpacity: 0.05,
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
    //shadowOpacity: 0.05,
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
    padding: moderateScale(16),
    marginHorizontal: horizontalScale(8),
    alignItems: 'center',
    minWidth: horizontalScale(120),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsIconContainer: {
    marginBottom: verticalScale(8),
  },
  streakCard: {
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginHorizontal: horizontalScale(8),
    minWidth: horizontalScale(140),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    marginRight: horizontalScale(12),
  },
  streakInfo: {
    flex: 1,
  },
  streakNumber: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#FFFFFF',
  },
  streakLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: 'rgba(255,255,255,0.9)',
  },
  streakSubtext: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(10),
    color: 'rgba(255,255,255,0.7)',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginHorizontal: horizontalScale(8),
    minWidth: horizontalScale(140),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeaderNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  progressTitleNew: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#666',
  },
  progressPercentage: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A4C6E',
  },
  progressBarContainer: {
    height: verticalScale(6),
    backgroundColor: 'rgba(26,76,110,0.1)',
    borderRadius: moderateScale(3),
    marginBottom: verticalScale(8),
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: moderateScale(3),
  },
  progressTextNew: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(10),
    color: '#666',
  },
  leaderboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginHorizontal: horizontalScale(8),
    minWidth: horizontalScale(120),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  leaderboardTitle: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#666',
    marginLeft: horizontalScale(4),
  },
  rankNumber: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A4C6E',
    marginBottom: verticalScale(4),
  },
  rankSubtext: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(10),
    color: '#666',
    textAlign: 'center',
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
    position: 'relative',
  },
  quickActionBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF4A4A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studyToolsSection: {
    marginTop: verticalScale(24),
  },
  studyToolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
  },
  studyToolCard: {
    width: (screenWidth - horizontalScale(60)) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  studyToolIcon: {
    width: horizontalScale(48),
    height: verticalScale(48),
    borderRadius: moderateScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  studyToolLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#1A4C6E',
    textAlign: 'center',
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
    //shadowOpacity: 0.08,
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
  videoScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  videoPlayer: {
    marginRight: 12,
  },
});
