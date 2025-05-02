import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Dimensions,
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipURL } from "../utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { horizontalScale, verticalScale, moderateScale } from '../utils/metrics';
import { FONT } from "../../constants";
import { socket } from '../utils/socket';
import BookingCalendar from './BookingCalendar';

interface Review {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  user: {
    name: string;
    profileImage: string;
  };
}

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
  reviews?: Review[];
}

interface User {
  name?: string;
  profileImage?: string;
  id?: string;
}

const { width } = Dimensions.get('window');

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

interface ReviewFormProps {
  onSubmit: (reviewData: { title: string; description: string }) => void;
  isSubmitting: boolean;
}

const ReviewForm = React.memo(({ onSubmit, isSubmitting }: ReviewFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = useCallback(() => {
    onSubmit({ title, description });
    setTitle('');
    setDescription('');
  }, [title, description, onSubmit]);

  return (
    <View style={styles.reviewForm}>
      <Text style={styles.sectionTitle}>Submit Your Review</Text>
      <TextInput
        style={styles.input}
        placeholder="Review Title"
        placeholderTextColor="#A0AEC0"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Give a brief description of your experience."
        placeholderTextColor="#A0AEC0"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const SubjectPage = ({ subjectId }) => {
  const [singleSubjectData, setSingleSubjectData] = React.useState<SubjectData>({});
  const [userData, setUserData] = React.useState<User>({});
  const [teacherId, setTeacherId] = React.useState<string>("");
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [usertoken, setUserToken] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleChatNow = async () => {
    const token = await AsyncStorage.getItem('authToken');
    const userDetails = await AsyncStorage.getItem('userDetails');
    const userId = JSON.parse(userDetails).userId;
    const clientId = singleSubjectData.user?.id;

    try {
        // First check if a conversation already exists
        socket.emit("check-existing-conversation", {
            userId,
            clientId,
            subjectId
        });

        // Set up listeners for the response
        socket.once("conversation-exists", async (conversation) => {
            // Remove other listeners to prevent memory leaks
            socket.off("no-conversation-found");
            socket.off("conversation-check-error");
            
            // Join the existing conversation room
            socket.emit('chat-room', conversation.id);
            
            // Navigate to the existing conversation
            router.push(`/(tabs)/chat/${conversation.id}`);
        });

        socket.once("no-conversation-found", async () => {
            // Remove other listeners
            socket.off("conversation-exists");
            socket.off("conversation-check-error");
            
            try {
                // Create a new conversation since none exists
                const response = await axios.post(
                    `${ipURL}/api/conversation`,
                    {
                        userId,
                        clientId,
                        subjectId
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Join the new chat room
                socket.emit('chat-room', response.data.id);
                
                // Navigate to the new conversation
                router.push(`/(tabs)/chat/${response.data.id}`);
            } catch (err) {
                console.error('Error creating new conversation:', err);
                alert('Failed to create new chat. Please try again.');
            }
        });

        socket.once("conversation-check-error", (error) => {
            // Remove other listeners
            socket.off("conversation-exists");
            socket.off("no-conversation-found");
            
            console.error('Error checking for conversation:', error);
            alert('Failed to check for existing chat. Please try again.');
        });

    } catch (err) {
        console.error('Error in chat initialization:', err);
        alert('Failed to start chat. Please try again.');
    }
  };

  const handleEnrollPress = () => {
    setIsBookingModalVisible(true);
  };

  const handleSaveSubject = async () => {
    try {
      setIsSaving(true);
      const token = await AsyncStorage.getItem("authToken");
      const userDetails = await AsyncStorage.getItem("userDetails");
      const userId = JSON.parse(userDetails).userId;

      if (isSaved) {
        setIsSaved(false);
        // Unsave the subject
        await axios.delete(`${ipURL}/api/subjects/saved/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
      } else {
        setIsSaved(true);
        // Save the subject
        await axios.post(
          `${ipURL}/api/subjects/save/${subjectId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Error saving/unsaving subject:", error);
      alert("Failed to save/unsave subject. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const getSubjects = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        setUserToken(token);
        const resp = await axios.get(`${ipURL}/api/subjects/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeacherId(resp.data.user.id);
        setSingleSubjectData(resp.data);
      } catch (error) {
        console.error("Error fetching subject data:", error);
      }
    };

    const fetchReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const token = await AsyncStorage.getItem("authToken");
        const response = await axios.get(
          `${ipURL}/api/reviews/subject/${subjectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
      setIsLoadingReviews(false);
    };

    const checkIfSaved = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const response = await axios.get(`${ipURL}/api/subjects/saved`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const savedSubjects = response.data;
        setIsSaved(savedSubjects.some((subject: any) => subject.subjectId === subjectId));
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    getSubjects();
    fetchReviews();
    checkIfSaved();
  }, [subjectId]);

  const handleSubmitReview = useCallback(async (reviewData) => {
    if (!reviewData.title || !reviewData.description) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${ipURL}/api/reviews`,
        {
          title: reviewData.title,
          description: reviewData.description,
          subjectId: subjectId,
        },
        {
          headers: { authorization: `Bearer ${usertoken}` },
        }
      );
      
      setReviews(prevReviews => [response.data, ...prevReviews]);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert('Failed to submit review. Please try again.');
    }
    setIsSubmitting(false);
  }, [subjectId, usertoken]);

  const handleViewAllReviews = () => {
    router.push(`/(tabs)/home/subjectReviews/${subjectId}`);
  };

  const ReviewItem = ({ review }) => {
    const [voteState, setVoteState] = useState({
      upvotes: review.upvotes,
      downvotes: review.downvotes,
      userVote: review.userVote
    });

    const handleVote = async (voteType: 'up' | 'down') => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const response = await axios.post(
          `${ipURL}/api/reviews/${review.id}/vote`,
          { voteType },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setVoteState({
          upvotes: response.data.upvotes,
          downvotes: response.data.downvotes,
          userVote: response.data.userVote
        });
      } catch (error) {
        console.error("Error voting:", error);
        alert('Failed to vote. Please try again.');
      }
    };

    return (
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
        
        <View style={styles.voteContainer}>
          <TouchableOpacity 
            style={[styles.voteButton, voteState.userVote === 'up' && styles.activeVoteButton]}
            onPress={() => handleVote('up')}
          >
            <Ionicons 
              name="thumbs-up" 
              size={16} 
              color={voteState.userVote === 'up' ? '#2DCB63' : '#666'} 
            />
            <Text style={[styles.voteCount, voteState.userVote === 'up' && styles.activeVoteCount]}>
              {voteState.upvotes}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.voteButton, voteState.userVote === 'down' && styles.activeVoteButton]}
            onPress={() => handleVote('down')}
          >
            <Ionicons 
              name="thumbs-down" 
              size={16} 
              color={voteState.userVote === 'down' ? '#E74C3C' : '#666'} 
            />
            <Text style={[styles.voteCount, voteState.userVote === 'down' && styles.activeVoteCount]}>
              {voteState.downvotes}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={styles.scrollView} bounces={false}>
        <Image
          source={{ uri: singleSubjectData?.subjectImage }}
          style={styles.headerImage}
          placeholder={blurhash}
          contentFit="cover"
          transition={300}
        />

        <View style={styles.contentContainer}>
          {/* Status Bar */}
          <View style={styles.statusBar}>
            <View style={styles.statusIndicator}>
              <Ionicons name="star" size={24} color="#FFA000" />
              <Text style={[styles.statusText, {color: "#FFA000"}]}>
                Premium Course
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.saveButton, isSaved && styles.savedButton]} 
              onPress={handleSaveSubject}
              disabled={isSaving}
            >
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isSaved ? "#FFFFFF" : "#FFFFFF"} 
              />
              <Text style={styles.saveButtonText}>
                {  (isSaved ? "Saved" : "Save")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Subject Header */}
          <View style={styles.headerContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.subjectName}>{singleSubjectData.subjectName}</Text>
              <View style={styles.badgeContainer}>
                <View style={styles.badge}>
                  <Ionicons name="school" size={16} color="#0066cc" />
                  <Text style={styles.badgeText}>{singleSubjectData.subjectBoard}</Text>
                </View>
                <View style={[styles.badge, styles.gradeBadge]}>
                  <Ionicons name="bookmark" size={16} color="#f57c00" />
                  <Text style={[styles.badgeText, {color: '#f57c00'}]}>
                    Grade {singleSubjectData.subjectGrade}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Course Fee</Text>
              <Text style={styles.price}>AED {singleSubjectData.subjectPrice}</Text>
              <Text style={styles.durationText}>
                {singleSubjectData.subjectDuration} hours
              </Text>
            </View>
          </View>

          {/* Teacher Info */}
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

          {/* Quick Info Cards */}
          <View style={styles.quickInfoContainer}>
            <View style={styles.quickInfoCard}>
              <Ionicons name="language" size={24} color="#1976D2" />
              <Text style={styles.quickInfoLabel}>Language</Text>
              <Text style={styles.quickInfoValue}>{singleSubjectData.subjectLanguage}</Text>
            </View>
            <View style={styles.quickInfoCard}>
              <Ionicons name="time" size={24} color="#388E3C" />
              <Text style={styles.quickInfoLabel}>Duration</Text>
              <Text style={styles.quickInfoValue}>{singleSubjectData.subjectDuration} Hours</Text>
            </View>
          </View>

          {/* Description Section */}
          {singleSubjectData.subjectDescription && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Course Description</Text>
              <Text style={styles.description}>{singleSubjectData.subjectDescription}</Text>
            </View>
          )}

          {/* Key Points Section */}
          {singleSubjectData.subjectPoints && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What You'll Learn</Text>
              {singleSubjectData.subjectPoints.map((point, index) => (
                <View key={index} style={styles.pointRow}>
                  <View style={styles.bulletPoint}>
                    <Text style={styles.bulletNumber}>{index + 1}</Text>
                  </View>
                  <Text style={styles.pointText}>{point}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {reviews.length > 0 && (
                <TouchableOpacity onPress={handleViewAllReviews}>
                  <Text style={styles.viewAllButton}>View All Reviews</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {reviews.length > 0 ? (
              <>
                {reviews.slice(0, 3).map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </>
            ) : (
              <Text style={styles.noReviewsText}>No reviews yet. Be the first to review!</Text>
            )}
            
            {/* Review Form */}
            <ReviewForm onSubmit={handleSubmitReview} isSubmitting={isSubmitting} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={handleEnrollPress}
        >
          <Ionicons name="cart" size={24} color="white" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  headerImage: {
    width: width,
    height: 220,
    backgroundColor: '#e0e0e0',
  },
  contentContainer: {
    padding: 16,
    marginTop: -30,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    color: '#666',
    fontSize: 14,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  subjectName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gradeBadge: {
    backgroundColor: '#fff3e0',
  },
  badgeText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2e7d32',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  teacherImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  teacherInfo: {
    flex: 1,
    marginLeft: 15,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  teacherRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quickInfoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  bulletPoint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletNumber: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '600',
  },
  pointText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  reviewItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewerInfo: {
    marginLeft: 12,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  reviewDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  reviewForm: {
    marginTop: 16,
    paddingBottom: 24,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2DCB63',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minHeight: 44,
    marginTop: 16,
    marginBottom: 16,
    justifyContent: 'center',
    width: '100%',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  noReviewsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    fontSize: 14,
    color: '#2DCB63',
    textDecorationLine: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2DCB63',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  priceText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#3498DB',
    borderRadius: 12,
    padding: 16,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    gap: horizontalScale(6),
  },
  savedButton: {
    backgroundColor: '#2DCB63',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontFamily: FONT.medium,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 16,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  activeVoteButton: {
    backgroundColor: '#f0f0f0',
  },
  voteCount: {
    fontSize: 14,
    color: '#666',
  },
  activeVoteCount: {
    color: '#2DCB63',
  },
});

export default SubjectPage;