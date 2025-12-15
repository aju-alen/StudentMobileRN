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
  Modal,
  ActivityIndicator,
  Animated,
  Easing
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipURL } from "../utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { horizontalScale, verticalScale, moderateScale } from '../utils/metrics';
import { COLORS, FONT } from "../../constants";
import { socket } from '../utils/socket';
import BookingCalendar from './BookingCalendar';
import BookingSummaryModal from './BookingSummaryModal';
import { axiosWithAuth } from "../utils/customAxios";

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
  courseType?: 'SINGLE_STUDENT' | 'MULTI_STUDENT';
  maxCapacity?: number;
  currentEnrollment?: number;
  scheduledDateTime?: string;
  zoomMeetingUrl?: string;
  zoomMeetingPassword?: string;
}

interface User {
  name?: string;
  profileImage?: string;
  id?: string;
  userType?: UserType;
}

type UserType = 'TEACHER' | 'ADMIN' | 'STUDENT';

const { width } = Dimensions.get('window');

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

interface ReviewFormProps {
  onSubmit: (reviewData: { title: string; description: string }) => void;
  isSubmitting: boolean;
  purchaseStatus: boolean;
}

const ReviewForm = React.memo(({ onSubmit, isSubmitting, purchaseStatus }: ReviewFormProps) => {
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
      {purchaseStatus ? <View>
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
      </View> : <Text style={styles.purchaseStatusText}>Please purchase the course to submit a review</Text>}
    </View>
  );
});

const SubjectPage = ({ subjectId }) => {
  const [singleSubjectData, setSingleSubjectData] = React.useState<SubjectData>({});
  const [capacityInfo, setCapacityInfo] = React.useState<{
    availableSpots: number;
    isFull: boolean;
    isVerified: boolean;
  } | null>(null);
  const [teacherId, setTeacherId] = React.useState<string>("");
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [showBookingSummary, setShowBookingSummary] = useState(false);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>("");
  const [selectedBookingTime, setSelectedBookingTime] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [usertoken, setUserToken] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isUserType, setIsUserType] = useState<UserType>();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializingChat, setIsInitializingChat] = useState(false);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(50)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const menuScale = useRef(new Animated.Value(0)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;

  console.log(singleSubjectData,'singleSubjectData in single subject page');

  // Fetch capacity info for multi-student courses
  React.useEffect(() => {
    const fetchCapacityInfo = async () => {
      if (singleSubjectData.courseType === 'MULTI_STUDENT' && subjectId) {
        try {
          const token = await AsyncStorage.getItem("authToken");
          const capacityResponse = await axios.get(
            `${ipURL}/api/subjects/capacity/${subjectId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCapacityInfo(capacityResponse.data);
        } catch (error) {
          console.error('Error fetching capacity info:', error);
        }
      }
    };

    fetchCapacityInfo();
  }, [singleSubjectData.courseType, subjectId]);
  const handleChatNow = async () => {
    if (isInitializingChat) {
      return; // Prevent multiple simultaneous initializations
    }

    if(!purchaseStatus){
      alert('Please purchase the course to chat with the teacher');
      return;
    }

    const token = await AsyncStorage.getItem('authToken');
    const userDetails = await AsyncStorage.getItem('userDetails');
    if (!userDetails) {
      alert('Please login to chat');
      return;
    }
    const userId = JSON.parse(userDetails).userId;
    const clientId = singleSubjectData.user?.id;
    
    if (!clientId) {
      alert('Teacher information not available');
      return;
    }

    setIsInitializingChat(true);

    try {
        // First check if a conversation already exists
        socket.emit("check-existing-conversation", {
            userId,
            clientId,
            subjectId
        });

        // Set up listeners for the response
        socket.once("conversation-exists", async (conversation) => {
            try {
                // Remove other listeners to prevent memory leaks
                socket.off("no-conversation-found");
                socket.off("conversation-check-error");
                
                // Join the existing conversation room
                socket.emit('chat-room', conversation.id);
                
                // Navigate to the existing conversation
                router.push(`/(tabs)/chat/${conversation.id}`);
            } finally {
                setIsInitializingChat(false);
            }
        });

        socket.once("no-conversation-found", async () => {
            try {
                // Remove other listeners
                socket.off("conversation-exists");
                socket.off("conversation-check-error");
                
                // Create a new conversation since none exists
                try {
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
                } catch (err: any) {
                    console.error('Error creating new conversation:', err);
                    
                    // If conversation already exists (race condition), find and navigate to it
                    if (err.response?.status === 400 || err.response?.data?.message?.includes('already exists') || err.response?.data?.message?.includes('Conversation already exists')) {
                        // Re-check for existing conversation
                        socket.emit("check-existing-conversation", {
                            userId,
                            clientId,
                            subjectId
                        });
                        
                        socket.once("conversation-exists", async (conversation) => {
                            try {
                                socket.off("no-conversation-found");
                                socket.off("conversation-check-error");
                                socket.emit('chat-room', conversation.id);
                                router.push(`/(tabs)/chat/${conversation.id}`);
                            } finally {
                                setIsInitializingChat(false);
                            }
                        });

                        socket.once("no-conversation-found", () => {
                            socket.off("conversation-exists");
                            socket.off("conversation-check-error");
                            alert('Failed to create new chat. Please try again.');
                            setIsInitializingChat(false);
                        });
                    } else {
                        alert('Failed to create new chat. Please try again.');
                        setIsInitializingChat(false);
                    }
                }
            } catch (err) {
                console.error('Error in no-conversation-found handler:', err);
                setIsInitializingChat(false);
            }
        });

        socket.once("conversation-check-error", (error) => {
            try {
                // Remove other listeners
                socket.off("conversation-exists");
                socket.off("no-conversation-found");
                
                console.error('Error checking for conversation:', error);
                alert('Failed to check for existing chat. Please try again.');
            } finally {
                setIsInitializingChat(false);
            }
        });

    } catch (err) {
        console.error('Error in chat initialization:', err);
        alert('Failed to start chat. Please try again.');
        setIsInitializingChat(false);
    }
  };

  const handleEnrollPress = async () => {
    // For multi-student courses, skip date/time selection and go directly to payment
    if (singleSubjectData.courseType === 'MULTI_STUDENT') {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const capacityResponse = await axios.get(
          `${ipURL}/api/subjects/capacity/${subjectId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const { availableSpots, isFull, isVerified } = capacityResponse.data;

        if (!isVerified) {
          alert('This course has not been verified yet.');
          return;
        }

        if (isFull || availableSpots === 0) {
          alert('This course is full. No spots available.');
          return;
        }

        // Extract date and time from scheduledDateTime
        if (singleSubjectData.scheduledDateTime) {
          const scheduledDate = new Date(singleSubjectData.scheduledDateTime);
          const dateString = scheduledDate.toISOString().split('T')[0]; // YYYY-MM-DD
          const timeString = scheduledDate.toTimeString().split(' ')[0].slice(0, 5); // HH:MM
          
          setSelectedBookingDate(dateString);
          setSelectedBookingTime(timeString);
          // Show booking summary modal directly (payment page) - skip BookingCalendar
          setShowBookingSummary(true);
        } else {
          alert('Course schedule information is missing. Please contact support.');
        }
      } catch (error) {
        console.error('Error checking capacity:', error);
        alert('Failed to check course availability. Please try again.');
      }
    } else {
      // Single student course - show booking calendar for date/time selection
      setIsBookingModalVisible(true);
    }
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

  const handleReportSubject = async () => {
    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting');
      return;
    }
    console.log(reportReason);
    
    try {
      setIsLoading(true);
      const cleanedReportReason = reportReason.replace(/\s+/g, ' ').trim()

   //ToDo: Implement API call to report subject with reason
   const sendReport = await axiosWithAuth.post(`${ipURL}/api/reports/create-report`,{subjectId,reportReason:cleanedReportReason})
   console.log(sendReport);

      alert('Subject reported successfully');
      setReportReason('');
      setShowReportModal(false);
      setShowMenu(false);
      setIsLoading(false);
    } catch (error) {
      console.error('Error reporting subject:', error);
      alert('Failed to report subject. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement API call to block user
      const blockUser = await axiosWithAuth.post(`${ipURL}/api/reports/block-user`,{subjectId})
      console.log(blockUser);
      
      alert('User blocked successfully. You can unblock them from the blocked users page in your profile settings.');
      setShowMenu(false);
      router.back();
      setIsLoading(false);
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. Please try again.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getSubjects = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (userDetails) {
          const parsedDetails = JSON.parse(userDetails);
          setIsUserType(parsedDetails.userType);
        }
        setUserToken(token);
        const resp = await axiosWithAuth.get(`${ipURL}/api/subjects/${subjectId}`);
        if (resp.data?.user?.id) {
          setTeacherId(resp.data.user.id);
        }
        setSingleSubjectData(resp.data);
        console.log(resp.data,'resp.data in subject page');

        const purchaseStatus = await axiosWithAuth.get(`${ipURL}/api/auth/metadata/verify-purchase/${subjectId}`);
        setPurchaseStatus(purchaseStatus.data?.hasPurchased || false);
        setIsPageLoading(false);
      } catch (error) {
        console.error("Error fetching subject data:", error);
        setIsPageLoading(false);
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
        // Ensure reviews have the expected structure with user object
        const reviewsData = Array.isArray(response.data) ? response.data : [];
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      }
      setIsLoadingReviews(false);
    };

    const checkIfSaved = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const response = await axios.get(`${ipURL}/api/subjects/saved`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const savedSubjects = Array.isArray(response.data) ? response.data : [];
        // Check if subjectId matches either subjectId field or subject.id
        setIsSaved(savedSubjects.some((saved: any) => 
          saved.subjectId === subjectId || saved.subject?.id === subjectId
        ));
      } catch (error) {
        console.error("Error checking saved status:", error);
        setIsSaved(false);
      }
    };

    getSubjects();
    fetchReviews();
    checkIfSaved();
  }, [subjectId]);

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 800,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 800,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 800,
        delay: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 800,
        delay: 400,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleMenuPress = () => {
    if (showMenu) {
      Animated.parallel([
        Animated.timing(menuScale, {
          toValue: 0,
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        })
      ]).start(() => setShowMenu(false));
    } else {
      setShowMenu(true);
      Animated.parallel([
        Animated.spring(menuScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(menuOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const handleButtonPress = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  const headerStyle = {
    opacity: headerOpacity,
    transform: [{ translateY: headerTranslateY }]
  };

  const contentStyle = {
    opacity: contentOpacity,
    transform: [{ translateY: contentTranslateY }]
  };

  const buttonStyle = {
    opacity: buttonOpacity,
    transform: [{ scale: buttonScale }]
  };

  const menuStyle = {
    opacity: menuOpacity,
    transform: [{ scale: menuScale }]
  };

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
      
      // Ensure response.data has the expected structure with user object
      if (response.data) {
        setReviews(prevReviews => [response.data, ...prevReviews]);
      }
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
      upvotes: review?.upvotes || 0,
      downvotes: review?.downvotes || 0,
      userVote: review?.userVote || null
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

    // Safety check for review data
    if (!review || !review.user) {
      return null;
    }

    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <Image
            source={{ uri: review.user?.profileImage || '' }}
            style={styles.reviewerImage}
            placeholder={blurhash}
            contentFit='fill'
            transition={100}
          />
          <View style={styles.reviewerInfo}>
            <Text style={styles.reviewerName}>{review.user?.name || 'Anonymous'}</Text>
            <Text style={styles.reviewDate}>
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
            </Text>
          </View>
        </View>
        <Text style={styles.reviewTitle}>{review.title || ''}</Text>
        <Text style={styles.reviewDescription}>{review.description || ''}</Text>
        
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
   isPageLoading ? <ActivityIndicator size="large" color="#0000ff" style={{flex: 1, justifyContent: 'center', alignItems: 'center'}} /> : 
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Animated.ScrollView 
        style={styles.scrollView} 
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.headerImageContainer, headerStyle]}>
          <Image
            source={{ uri: singleSubjectData?.subjectImage }}
            style={styles.headerImage}
            placeholder={blurhash}
            contentFit='fill'
            transition={300}
          />
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={handleMenuPress}
          >
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        {showMenu && (
          <Animated.View style={[styles.menuContainer, menuStyle]}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowReportModal(true);
              }}
            >
              <Ionicons name="flag-outline" size={20} color="#E74C3C" />
              <Text style={styles.menuItemText}>Report Subject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleBlockUser}
            >
              <Ionicons name="ban-outline" size={20} color="#E74C3C" />
              {isLoading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Text style={styles.menuItemText}>Block User</Text>}
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View style={[styles.contentContainer, contentStyle]}>
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
                {isSaved ? "Saved" : "Save"}
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
              <Text style={styles.price}>AED {(singleSubjectData.subjectPrice) / 100}</Text>
              <Text style={styles.durationText}>
                {singleSubjectData.subjectDuration} hours
              </Text>
            </View>
          </View>

          {/* Teacher Info */}
          {singleSubjectData?.user && teacherId && (
            <TouchableOpacity  
              style={styles.teacherCard}
              onPress={() => router.push(`/(tabs)/home/singleProfile/${teacherId}`)}
            >
              <Image
                source={{ uri: singleSubjectData.user?.profileImage || '' }}
                style={styles.teacherImage}
                placeholder={blurhash}
                contentFit="cover"
                transition={100}
              />
              <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>{singleSubjectData.user?.name || 'Teacher'}</Text>  
                <Text style={styles.teacherRole}>
                  {singleSubjectData.user?.userType}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#1A4C6E" />
            </TouchableOpacity>
          )}

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

          {/* Multi-Student Course Schedule Info */}
          {singleSubjectData.courseType === 'MULTI_STUDENT' && singleSubjectData.scheduledDateTime && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Course Schedule</Text>
              <View style={styles.scheduleInfo}>
                <View style={styles.scheduleItem}>
                  <Ionicons name="calendar-outline" size={20} color="#1976D2" />
                  <Text style={styles.scheduleText}>
                    {new Date(singleSubjectData.scheduledDateTime).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={styles.scheduleItem}>
                  <Ionicons name="time-outline" size={20} color="#1976D2" />
                  <Text style={styles.scheduleText}>
                    {new Date(singleSubjectData.scheduledDateTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </Text>
                </View>
                {capacityInfo && (
                  <View style={styles.scheduleItem}>
                    <Ionicons name="people-outline" size={20} color="#1976D2" />
                    <Text style={styles.scheduleText}>
                      {capacityInfo.availableSpots} of {singleSubjectData.maxCapacity} spots available
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

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
            <ReviewForm purchaseStatus={purchaseStatus} onSubmit={handleSubmitReview} isSubmitting={isSubmitting} />
          </View>
        </Animated.View>
      </Animated.ScrollView>

      <Animated.View style={[styles.footer, buttonStyle]}>
        <TouchableOpacity 
          style={[
            styles.primaryButton,
            isUserType === 'TEACHER' && styles.disabledButton,
            singleSubjectData.courseType === 'MULTI_STUDENT' && purchaseStatus && styles.disabledButton
          ]} 
          onPress={() => {
            handleButtonPress();
            handleEnrollPress();
          }}
          disabled={
            isUserType === 'TEACHER' ||
            (singleSubjectData.courseType === 'MULTI_STUDENT' && purchaseStatus)
          }
        >
          <Ionicons name="cart" size={24} color="white" />
          <View style={styles.buttonTextContainer}>
            <View style={styles.buttonMainRow}>
              <Text style={styles.primaryButtonText}>
                {isUserType === 'TEACHER' 
                  ? "Please login as student to purchase" 
                  : singleSubjectData.courseType === 'MULTI_STUDENT' && purchaseStatus
                  ? "Already Enrolled"
                  : singleSubjectData.courseType === 'MULTI_STUDENT' && capacityInfo?.isFull
                  ? "Course Full"
                  : "Enroll Now"}
              </Text>
              {isUserType !== 'TEACHER' 
                && !(singleSubjectData.courseType === 'MULTI_STUDENT' && capacityInfo?.isFull) 
                && !(singleSubjectData.courseType === 'MULTI_STUDENT' && purchaseStatus) && (
                <Text style={styles.priceText}>AED {(singleSubjectData.subjectPrice) / 100}</Text>
              )}
            </View>
            {singleSubjectData.courseType === 'MULTI_STUDENT' && capacityInfo && !capacityInfo.isFull && !purchaseStatus && (
              <Text style={styles.capacityText}>
                {capacityInfo.availableSpots} of {singleSubjectData.maxCapacity} spots available
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.secondaryButton, isInitializingChat && styles.disabledButton]} 
          onPress={() => {
            handleButtonPress();
            handleChatNow();
          }}
          disabled={isInitializingChat}
        >
          {isInitializingChat ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="chatbubbles-outline" size={24} color="#FFFFFF" />
          )}
          <Text style={styles.secondaryButtonText}>
            {isInitializingChat ? 'Connecting...' : 'Chat'}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Only show BookingCalendar for single-student courses */}
      {singleSubjectData.courseType !== 'MULTI_STUDENT' && (
        <BookingCalendar
          teacherId={teacherId}
          subjectId={subjectId}
          visible={isBookingModalVisible}
          onClose={() => setIsBookingModalVisible(false)}
        />
      )}

      {/* BookingSummaryModal for multi-student courses (direct payment) */}
      {singleSubjectData.courseType === 'MULTI_STUDENT' && (
        <BookingSummaryModal
          visible={showBookingSummary}
          onClose={() => setShowBookingSummary(false)}
          teacherId={teacherId}
          subjectId={subjectId}
          date={selectedBookingDate}
          time={selectedBookingTime}
          onConfirm={() => {
            setShowBookingSummary(false);
            // Refresh the page or navigate
            router.replace('/(tabs)/home');
          }}
        />
      )}

      <Modal
        visible={showReportModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report Subject</Text>
            <TextInput
              style={styles.reportInput}
              placeholder="Please provide a reason for reporting..."
              placeholderTextColor="#A0AEC0"
              value={reportReason}
              onChangeText={setReportReason}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={handleReportSubject}
              >
                {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.modalSubmitButtonText}>Submit Report</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerImageContainer: {
    position: 'relative',
  },
  headerImage: {
    width: width,
    height: verticalScale(400),
    backgroundColor: '#e0e0e0',
  },
  contentContainer: {
    padding: moderateScale(16),
    marginTop: verticalScale(-60),
    backgroundColor: 'white',
    borderTopLeftRadius: moderateScale(30),
    borderTopRightRadius: moderateScale(30),
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    paddingTop: verticalScale(10),
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(6),
  },
  statusText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  dateText: {
    color: '#666',
    fontSize: moderateScale(12),
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(24),
  },
  titleContainer: {
    flex: 1,
    marginRight: horizontalScale(16),
  },
  subjectName: {
    fontSize: moderateScale(22),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: moderateScale(12),
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: horizontalScale(8),
  },
  badge: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  gradeBadge: {
    backgroundColor: '#fff3e0',
  },
  badgeText: {
    color: '#0066cc',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: moderateScale(12),
    color: '#666',
    marginBottom: verticalScale(4),
  },
  price: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: '#2e7d32',
  },
  durationText: {
    fontSize: moderateScale(12),
    color: '#666',
    marginTop: verticalScale(4),
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(24),
  },
  teacherImage: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
  },
  teacherInfo: {
    flex: 1,
    marginLeft: horizontalScale(15),
  },
  teacherName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: '#1a1a1a',
  },
  teacherRole: {
    fontSize: moderateScale(14),
    color: '#666',
    marginTop: verticalScale(4),
  },
  quickInfoContainer: {
    flexDirection: 'row',
    gap: horizontalScale(12),
    marginBottom: verticalScale(24),
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  quickInfoLabel: {
    fontSize: moderateScale(12),
    color: '#666',
    marginTop: verticalScale(8),
  },
  quickInfoValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: verticalScale(4),
  },
  section: {
    marginBottom: verticalScale(24),
    backgroundColor: 'white',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#f0f0f0',
    flex: 1,
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: verticalScale(16),
  },
  description: {
    fontSize: moderateScale(14),
    color: '#666',
    lineHeight: verticalScale(24),
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
    gap: horizontalScale(12),
  },
  bulletPoint: {
    width: horizontalScale(24),
    height: verticalScale(24),
    borderRadius: moderateScale(12),
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletNumber: {
    color: '#0066cc',
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  pointText: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#666',
    lineHeight: verticalScale(24),
  },
  reviewItem: {
    backgroundColor: '#f8f9fa',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(16),
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  reviewerImage: {
    width: horizontalScale(40),
    height: verticalScale(40),
    borderRadius: moderateScale(20),
  },
  reviewerInfo: {
    marginLeft: horizontalScale(12),
  },
  reviewerName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reviewDate: {
    fontSize: moderateScale(14),
    color: '#666',
    marginTop: verticalScale(4),
  },
  reviewTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: verticalScale(8),
  },
  reviewDescription: {
    fontSize: moderateScale(12),
    color: '#666',
    lineHeight: verticalScale(20),
  },
  reviewForm: {
    flex: 1,
    marginTop: verticalScale(16),
    paddingBottom: verticalScale(104),
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginBottom: verticalScale(12),
    fontSize: moderateScale(14),
  },
  textArea: {
    height: verticalScale(100),
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2DCB63',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    alignItems: 'center',
    minHeight: verticalScale(44),
    marginTop: verticalScale(16),
    marginBottom: verticalScale(16),
    justifyContent: 'center',
    width: '100%',
  },
  submitButtonText: {
    color: 'white',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  noReviewsText: {
    fontSize: moderateScale(14),
    color: '#666',
    textAlign: 'center',
    marginTop: verticalScale(12),
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  viewAllButton: {
    fontSize: moderateScale(14),
    color: '#2DCB63',
    textDecorationLine: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: moderateScale(16),
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2DCB63',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginRight: horizontalScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(8),
  },
  buttonTextContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  buttonMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    gap: horizontalScale(8),
  },
  primaryButtonText: {
    color: 'white',
    fontSize: moderateScale(16),
    fontWeight: '600',
    flexShrink: 1,
  },
  capacityText: {
    fontSize: moderateScale(11),
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: FONT.medium,
    marginTop: verticalScale(2),
  },
  priceText: {
    color: 'white',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#3498DB',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    width: horizontalScale(70),
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: moderateScale(12),
    marginTop: verticalScale(4),
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    gap: horizontalScale(8),
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
    marginTop: verticalScale(12),
    gap: horizontalScale(16),
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(8),
    borderRadius: moderateScale(8),
    backgroundColor: '#f8f9fa',
    gap: horizontalScale(4),
  },
  activeVoteButton: {
    backgroundColor: '#f0f0f0',
  },
  voteCount: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  activeVoteCount: {
    color: '#2DCB63',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(12),
  },
  menuButton: {
    position: 'absolute',
    top: verticalScale(16),
    right: horizontalScale(16),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: moderateScale(20),
    padding: moderateScale(8),
  },
  menuContainer: {
    position: 'absolute',
    top: verticalScale(70),
    right: horizontalScale(16),
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    padding: moderateScale(8),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    //shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(12),
    gap: horizontalScale(8),
  },
  menuItemText: {
    fontSize: moderateScale(16),
    color: '#1A4C6E',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    padding: moderateScale(20),
    width: '90%',
    maxWidth: horizontalScale(400),
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: '#1A4C6E',
    marginBottom: verticalScale(16),
  },
  reportInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginBottom: verticalScale(16),
    fontSize: moderateScale(14),
    minHeight: verticalScale(100),
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: horizontalScale(12),
  },
  modalButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(8),
  },
  modalCancelButton: {
    backgroundColor: '#f8f9fa',
  },
  modalSubmitButton: {
    backgroundColor: '#E74C3C',
  },
  modalCancelButtonText: {
    color: '#1A4C6E',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  modalSubmitButtonText: {
    color: 'white',
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.7,
  },
  purchaseStatusText: {
    fontSize: moderateScale(14),
    color: '#666',
    textAlign: 'center',
    marginTop: verticalScale(12),
  },
  scheduleInfo: {
    gap: verticalScale(12),
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(12),
    paddingVertical: verticalScale(8),
  },
  scheduleText: {
    fontSize: moderateScale(16),
    color: '#1a1a1a',
    fontFamily: FONT.medium,
  },
});

export default SubjectPage;