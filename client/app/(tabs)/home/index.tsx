import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
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
import Video from "../../components/Video";

interface User {
  email?: string;
  name?: string;
  profileImage?: string;
  userDescription?: string;
  reccomendedSubjects?: [string];
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const HomePage = () => {
  const [subjectData, setSubjectData] = React.useState([]);
  const [recommendedSubjects, setRecommendedSubjects] = React.useState([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const params = useLocalSearchParams();
  const { subjectGrade, subjectBoard, subjectTags } = params;
  const [user, setUser] = useState<User>({});

  const SectionHeader = ({ title, showSeeAll = false }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {showSeeAll && (
        <TouchableOpacity 
          style={styles.seeAllButton} 
          onPress={() => router.push('/(tabs)/home/allSubject')}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#F1A568" />
        </TouchableOpacity>
      )}
    </View>
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const [userResponse, subjectsResponse] = await Promise.all([
        axios.get(`${ipURL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${ipURL}/api/subjects/search?subjectGrade=${subjectGrade}&subjectBoard=${subjectBoard}&subjectTags=${subjectTags}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      setUser(userResponse.data);
      setSubjectData(subjectsResponse.data);

      const { reccomendedSubjects: recommendedSubjects, recommendedGrade, recommendedBoard } = userResponse.data;
      const recommendedResponse = await axios.post(
        `${ipURL}/api/subjects/get-recommended-subjects`,
        { recommendedSubjects, recommendedBoard, recommendedGrade },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setRecommendedSubjects(recommendedResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const handleItemPress = (itemId: { _id: any }) => {
    router.push(`/(tabs)/home/${itemId._id}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.userSection}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.replace('/(tabs)/profile')}
          >
            <Image
              source={{ uri: user.profileImage }}
              style={styles.profileImage}
              placeholder={blurhash}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.onlineIndicator} />
          </TouchableOpacity>
          
          <View style={styles.welcomeText}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Recommended Courses Section */}
        <View style={styles.section}>
          <SectionHeader title="Recommended for You" />
          <HorizontalSubjectCard 
            subjectData={recommendedSubjects} 
            handleItemPress={handleItemPress} 
            isHorizontal={true}
          />
        </View>

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
          <Video />
        </View>
      </ScrollView>
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
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    height: verticalScale(45),
    width: horizontalScale(45),
    borderRadius: moderateScale(23),
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
  userName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#FFFFFF',
  },
  notificationButton: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(16),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A4C6E',
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
});