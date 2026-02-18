import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { ipURL } from '../../utils/utils';
import { axiosWithAuth } from '../../utils/customAxios';
import { FONT } from '../../../constants';

interface Review {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  subject: {
    id: string;
    subjectName: string;
  };
}

const YourReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axiosWithAuth.get(`${ipURL}/api/reviews/my-reviews`);
      setReviews(response.data);
    } catch (err) {
      setError('Failed to fetch your reviews');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleReviewPress = (subjectId: string) => {
    router.push(`/(tabs)/home/subjectReviews/${subjectId}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A2B4B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A2B4B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Reviews</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>You haven't posted any reviews yet</Text>
        </View>
      ) : (
        <ScrollView style={styles.reviewsList} showsVerticalScrollIndicator={false}>
          {reviews.map((review) => (
            <TouchableOpacity
              key={review.id}
              style={styles.reviewCard}
              onPress={() => handleReviewPress(review.subject.id)}
              activeOpacity={0.7}
            >
              <View style={styles.reviewHeader}>
                <Text style={styles.subjectName} numberOfLines={1}>
                  {review.subject.subjectName}
                </Text>
                <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
              </View>
              <Text style={styles.reviewTitle} numberOfLines={2}>
                {review.title}
              </Text>
              <Text style={styles.reviewDescription} numberOfLines={3}>
                {review.description}
              </Text>
              <View style={styles.votesRow}>
                <Ionicons name="thumbs-up-outline" size={14} color="#64748B" />
                <Text style={styles.votesText}>{review.upvotes}</Text>
                <Ionicons name="thumbs-down-outline" size={14} color="#64748B" style={{ marginLeft: horizontalScale(12) }} />
                <Text style={styles.votesText}>{review.downvotes}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(16),
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    marginRight: horizontalScale(15),
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A2B4B',
  },
  errorContainer: {
    padding: moderateScale(16),
    backgroundColor: '#ffebee',
    margin: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontFamily: FONT.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(24),
  },
  emptyText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#666',
    marginTop: verticalScale(16),
    textAlign: 'center',
  },
  reviewsList: {
    flex: 1,
    padding: moderateScale(20),
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  subjectName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#1A2B4B',
    flex: 1,
  },
  date: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#64748B',
    marginLeft: horizontalScale(8),
  },
  reviewTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A2B4B',
    marginBottom: verticalScale(6),
  },
  reviewDescription: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
    lineHeight: moderateScale(20),
  },
  votesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  votesText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#64748B',
    marginLeft: horizontalScale(4),
  },
});

export default YourReviewsPage;
