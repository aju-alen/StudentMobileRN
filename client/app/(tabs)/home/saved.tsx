import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator, ScrollView, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import { ipURL } from '../../utils/utils';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { FONT, COLORS } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';

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
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: subject.subjectImage }} 
        style={styles.subjectImage}
      />
      <View style={styles.cardContent}>
        <View style={styles.titleRow}>
          <Text style={styles.subjectName} numberOfLines={1}>{subject.subjectName}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>AED {subject.subjectPrice}</Text>
          </View>
        </View>
        <Text style={styles.subjectDescription} numberOfLines={2}>
          {subject.subjectNameSubHeading}
        </Text>
        <View style={styles.detailsRow}>
          <View style={styles.detailBadge}>
            <Text style={styles.detailText}>{subject.subjectBoard}</Text>
          </View>
          <View style={styles.detailBadge}>
            <Text style={styles.detailText}>Grade {subject.subjectGrade}</Text>
          </View>
          <View style={styles.detailBadge}>
            <Text style={styles.detailText}>{subject.subjectDuration} hrs</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : savedSubjects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved courses</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.contentContainer}
          showsVerticalScrollIndicator={false}
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
  );
};

export default SavedPage;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingHorizontal: horizontalScale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(8),
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: COLORS.black,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(16),
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
    paddingHorizontal: horizontalScale(16),
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: COLORS.error,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: COLORS.gray,
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
    padding: verticalScale(12),

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subjectImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(8),
  },
  cardContent: {
    flex: 1,
    marginLeft: horizontalScale(12),
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(4),
  },
  subjectName: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(16),
    color: COLORS.black,
    flex: 1,
    marginRight: horizontalScale(8),
  },
  priceContainer: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
  },
  priceText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(14),
    color: COLORS.primary,
  },
  subjectDescription: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: COLORS.gray,
    marginBottom: verticalScale(8),
    lineHeight: moderateScale(16),
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: horizontalScale(6),
  },
  detailBadge: {
    backgroundColor: COLORS.lightGray + '20',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(6),
  },
  detailText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: COLORS.gray,
  },
}); 