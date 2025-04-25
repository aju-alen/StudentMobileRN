import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipURL } from "../utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { horizontalScale, verticalScale, moderateScale } from '../utils/metrics';
import { FONT } from "../../constants";
import { socket } from '../utils/socket';
import BookingCalendar from './BookingCalendar';

interface SubjectData {
  subjectImage?: string;
  subjectName?: string;
  subjectBoard?: string;
  subjectDescription?: string;
  subjectLanguage?: string;
  subjectGrade?: number;
  subjectPrice?: number;
  subjectTags?: [string];
  user?: User;
  profileImage?: User;
  subjectPoints?: [string];
  subjectNameSubHeading?: string;
  subjectDuration?: string;
}

interface User {
  name?: string;
  profileImage?: string;
  id?: string;
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const SubjectPage = ({ subjectId }) => {
  const [singleSubjectData, setSingleSubjectData] = React.useState<SubjectData>({});
  const [userData, setUserData] = React.useState<User>({});
  const [teacherId, setTeacherId] = React.useState<string>("");
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);

  const handleChatNow = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const userDetails = await AsyncStorage.getItem('userDetails');
    const userId = JSON.parse(userDetails).userId;
    const clientId = singleSubjectData.user?.id;
    try {
      socket.emit('send-chat-details', { userId, clientId, subjectId });
      socket.on("chat-details", (data) => {
        console.log(data, 'this is the chat room details from server');
      });
      router.replace(`/(tabs)/chat`);
    } catch (err) {
      console.log(err, 'this is the error when clicking chat now button');
    }
  };

  const handleEnrollPress = () => {
    setIsBookingModalVisible(true);
  };

  useEffect(() => {
    const getSubjects = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const resp = await axios.get(`${ipURL}/api/subjects/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeacherId(resp.data.user.id);
        setSingleSubjectData(resp.data);
      } catch (error) {
        console.error("Error fetching subject data:", error);
      }
    };

    getSubjects();
  }, [subjectId]);

  const FeatureItem = ({ icon, text }) => (
    <View style={styles.featureItem}>
      <Ionicons name={icon} size={24} color="#1A4C6E" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: singleSubjectData?.subjectImage }}
            style={styles.mainImage}
            placeholder={blurhash}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.imageOverlay} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.gradeContainer}>
            <Text style={styles.gradeText}>Grade {singleSubjectData.subjectGrade}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{singleSubjectData.subjectLanguage}</Text>
            </View>
          </View>

          <Text style={styles.titleText}>{singleSubjectData.subjectName}</Text>
          <Text style={styles.subtitleText}>{singleSubjectData.subjectNameSubHeading}</Text>

          <TouchableOpacity 
            style={styles.teacherCard}
            onPress={() => router.push(`/(tabs)/home/singleProfile/${teacherId}`)}
          >
            <Image
              source={{ uri: singleSubjectData?.user?.profileImage }}
              style={styles.teacherImage}
              placeholder={blurhash}
              contentFit="cover"
              transition={100}
            />
            <View style={styles.teacherInfo}>
              <Text style={styles.teacherName}>{singleSubjectData.user?.name}</Text>
              <Text style={styles.teacherRole}>Sr. French Professor</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#1A4C6E" />
          </TouchableOpacity>

          <View style={styles.featuresContainer}>
            <FeatureItem icon="time-outline" text={`${singleSubjectData.subjectDuration} Hours`} />
            <FeatureItem icon="globe-outline" text="100% Online" />
            <FeatureItem icon="calendar-outline" text="Flexible Schedule" />
          </View>

          {singleSubjectData.subjectDescription && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Course Description</Text>
              <Text style={styles.descriptionText}>{singleSubjectData.subjectDescription}</Text>
            </View>
          )}

          {singleSubjectData.subjectPoints && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What You'll Learn</Text>
              {singleSubjectData.subjectPoints.map((point, i) => (
                <View key={i} style={styles.bulletPoint}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{point}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleEnrollPress}
        >
          <Text style={styles.primaryButtonText}>Enroll Now</Text>
          <Text style={styles.priceText}>AED {singleSubjectData.subjectPrice}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleChatNow}>
          <Ionicons name="chatbubbles-outline" size={24} color="#FFFFFF" />
          <Text style={styles.secondaryButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>

      <BookingCalendar
        teacherId={teacherId}
        subjectId={subjectId}
        visible={isBookingModalVisible}
        onClose={() => setIsBookingModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default SubjectPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageWrapper: {
    height: verticalScale(250),
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(100),
  },
  gradeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(15),
  },
  gradeText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(16),
    color: '#2DCB63',
  },
  badge: {
    backgroundColor: '#E8F5FF',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#1A4C6E',
  },
  titleText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A4C6E',
    marginBottom: verticalScale(8),
  },
  subtitleText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#5D6D7E',
    marginBottom: verticalScale(20),
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: moderateScale(15),
    borderRadius: 12,
    marginBottom: verticalScale(20),
  },
  teacherImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  teacherInfo: {
    flex: 1,
    marginLeft: horizontalScale(15),
  },
  teacherName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A4C6E',
  },
  teacherRole: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#5D6D7E',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(25),
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#5D6D7E',
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
  section: {
    marginBottom: verticalScale(25),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A4C6E',
    marginBottom: verticalScale(15),
  },
  descriptionText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(15),
    color: '#5D6D7E',
    lineHeight: 24,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2DCB63',
    marginRight: horizontalScale(12),
  },
  bulletText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: moderateScale(15),
    color: '#5D6D7E',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: moderateScale(15),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2DCB63',
    borderRadius: 12,
    padding: moderateScale(15),
    marginRight: horizontalScale(10),
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
  },
  priceText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
    marginTop: verticalScale(4),
  },
  secondaryButton: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    padding: moderateScale(15),
    width: horizontalScale(70),
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#FFFFFF',
    marginTop: verticalScale(4),
  },
});