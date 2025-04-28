import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipURL } from "../../../utils/utils";
import { useLocalSearchParams, router } from "expo-router";
import { horizontalScale, verticalScale, moderateScale } from '../../../utils/metrics';
import { FONT } from "../../../../constants";

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

interface Review {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  user: {
    name: string;
    profileImage: string;
  };
}

const SubjectReviews = () => {
  const { subjectId } = useLocalSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subjectName, setSubjectName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        
        // Fetch subject details
        const subjectResponse = await axios.get(`${ipURL}/api/subjects/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubjectName(subjectResponse.data.subjectName);

        // Fetch all reviews
        const reviewsResponse = await axios.get(
          `${ipURL}/api/reviews/subject/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setReviews(reviewsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subjectId]);

  const ReviewItem = ({ review }: { review: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: review.user.profileImage }}
          style={styles.reviewerImage}
          placeholder={blurhash}
          contentFit="cover"
          transition={100}
        />
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{review.user.name}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={styles.reviewTitle}>{review.title}</Text>
      <Text style={styles.reviewDescription}>{review.description}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2DCB63" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.subjectName}>{subjectName}</Text>
          <Text style={styles.reviewsCount}>{reviews.length} Reviews</Text>
        </View>

        <View style={styles.reviewsContainer}>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))
          ) : (
            <Text style={styles.noReviewsText}>No reviews yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubjectReviews;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: moderateScale(20),
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  subjectName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A4C6E',
    marginBottom: verticalScale(5),
  },
  reviewsCount: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#5D6D7E',
  },
  reviewsContainer: {
    padding: moderateScale(20),
  },
  reviewItem: {
    backgroundColor: '#F8F9FA',
    padding: moderateScale(15),
    borderRadius: 12,
    marginBottom: verticalScale(15),
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerInfo: {
    marginLeft: horizontalScale(10),
  },
  reviewerName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#1A4C6E',
  },
  reviewDate: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#5D6D7E',
  },
  reviewTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A4C6E',
    marginBottom: verticalScale(5),
  },
  reviewDescription: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5D6D7E',
    lineHeight: 20,
  },
  noReviewsText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5D6D7E',
    textAlign: 'center',
    marginTop: verticalScale(20),
  },
}); 