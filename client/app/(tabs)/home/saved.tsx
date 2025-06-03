import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { ipURL } from '../../utils/utils';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { FONT, COLORS } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';
import StatusBarComponent from '../../components/StatusBarComponent';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface Subject {
  id: string;
  subjectName: string;
  subjectNameSubHeading: string;
  subjectDescription: string;
  subjectImage: string;
  subjectPrice: number;
  subjectBoard: string;
  subjectGrade: number;
  subjectDuration: number;
}

interface SavedSubject {
  id: string;
  subjectId: string;
  userId: string;
  subject: Subject;
}

const SavedPage = () => {
  const [savedSubjects, setSavedSubjects] = useState<SavedSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedSubjects = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(`${ipURL}/api/subjects/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedSubjects(response.data);
    } catch (err) {
      setError('Failed to fetch saved subjects. Please try again.');
      console.error('Error fetching saved subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSubjects();
  }, []);

  const handleItemPress = (subjectId: string) => {
    router.push(`/(tabs)/home/${subjectId}`);
  };

  const MinimalSubjectCard = ({ subject }: { subject: Subject }) => (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => handleItemPress(subject.id)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: subject.subjectImage }} 
        style={styles.subjectImage}
      />
      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={styles.subjectName} numberOfLines={1}>{subject.subjectName}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>AED {subject.subjectPrice / 100}</Text>
          </View>
        </View>
        <Text style={styles.subjectDescription} numberOfLines={2}>
          {subject.subjectNameSubHeading}
        </Text>
        <View style={styles.detailsRow}>
          <View style={styles.detailBadge}>
            <Ionicons name="school-outline" size={moderateScale(12)} color={COLORS.gray} style={styles.badgeIcon} />
            <Text style={styles.detailText}>{subject.subjectBoard}</Text>
          </View>
          <View style={styles.detailBadge}>
            <Ionicons name="book-outline" size={moderateScale(12)} color={COLORS.gray} style={styles.badgeIcon} />
            <Text style={styles.detailText}>Grade {subject.subjectGrade}</Text>
          </View>
          <View style={styles.detailBadge}>
            <Ionicons name="time-outline" size={moderateScale(12)} color={COLORS.gray} style={styles.badgeIcon} />
            <Text style={styles.detailText}>{subject.subjectDuration} hrs</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.mainContainer}>
        <StatusBarComponent />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Courses</Text>
          <Text style={styles.headerSubtitle}>Your favorite courses in one place</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={moderateScale(48)} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchSavedSubjects}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : savedSubjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={moderateScale(64)} color={COLORS.gray} />
            <Text style={styles.emptyText}>No Saved Courses</Text>
            <Text style={styles.emptySubtext}>Save courses to access them later</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/home/allSubject')}
            >
              <Text style={styles.exploreButtonText}>Explore Courses</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {savedSubjects.map((savedSubject) => (
              <MinimalSubjectCard 
                key={savedSubject.id} 
                subject={savedSubject.subject} 
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default SavedPage;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(28),
    color: COLORS.primary,
    marginBottom: verticalScale(4),
  },
  headerSubtitle: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: COLORS.gray,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: COLORS.error,
    textAlign: 'center',
    marginTop: verticalScale(16),
    marginBottom: verticalScale(20),
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  emptyText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: COLORS.black,
    marginTop: verticalScale(16),
  },
  emptySubtext: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: COLORS.gray,
    marginTop: verticalScale(8),
    marginBottom: verticalScale(24),
  },
  exploreButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  exploreButtonText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: COLORS.white,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    padding: verticalScale(16),
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  subjectImage: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(12),
  },
  cardContent: {
    flex: 1,
    marginLeft: horizontalScale(16),
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(8),
  },
  subjectName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: COLORS.black,
    flex: 1,
    marginRight: horizontalScale(8),
  },
  priceContainer: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
  },
  priceText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: COLORS.primary,
  },
  subjectDescription: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: COLORS.gray,
    marginBottom: verticalScale(12),
    lineHeight: moderateScale(20),
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: horizontalScale(8),
  },
  detailBadge: {
    backgroundColor: COLORS.lightGray + '20',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    marginRight: horizontalScale(4),
  },
  detailText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: COLORS.gray,
  },
}); 