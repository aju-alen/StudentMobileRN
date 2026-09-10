import {
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
import { router, useSegments } from "expo-router";
import { horizontalScale, verticalScale, moderateScale } from '../utils/metrics';
import { COLORS, FONT } from "../../constants";
import { socket } from '../utils/socket';
import BookingCalendar from './BookingCalendar';
import CoverImage from './CoverImage';
import BookingSummaryModal from './BookingSummaryModal';
import { axiosWithAuth } from "../utils/customAxios";
import { SafeAreaView } from "react-native-safe-area-context";
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

interface SubjectTopic {
  id: string;
  orderIndex: number;
  topicTitle: string;
  hours: number;
  scheduledAt?: string | null;
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
  courseType?: 'SINGLE_STUDENT' | 'MULTI_STUDENT' | 'SINGLE_PACKAGE' | 'MULTI_PACKAGE';
  maxCapacity?: number;
  currentEnrollment?: number;
  scheduledDateTime?: string;
  subjectTopics?: SubjectTopic[];
  zoomMeetingUrl?: string;
  zoomMeetingPassword?: string;
  teacherProfileId?: string;
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
        placeholder="Review title"
        placeholderTextColor="#8A97A3"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Give a brief description of your experience."
        placeholderTextColor="#8A97A3"
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

interface CapacityCardProps {
  availableSpots: number;
  maxCapacity: number;
  isFull: boolean;
}

const CapacityCard = React.memo(({ availableSpots, maxCapacity, isFull }: CapacityCardProps) => {
  const filledPercent = maxCapacity > 0 ? Math.min(100, ((maxCapacity - availableSpots) / maxCapacity) * 100) : 0;
  const isLow = availableSpots <= 3 && !isFull;
  const progressColor = isFull ? COLORS.danger : isLow ? COLORS.warning : COLORS.success;
  return (
    <View style={styles.capacityCard}>
      <View style={styles.capacityCardContent}>
        <View style={styles.capacityIconWrap}>
          <Ionicons name={isFull ? "close-circle" : "people"} size={22} color={COLORS.primary} />
        </View>
        <View style={styles.capacityTextWrap}>
          <Text style={styles.capacityTitle}>
            {isFull ? "Course Full" : `${availableSpots} of ${maxCapacity} spots available`}
          </Text>
          {isLow && !isFull && (
            <View style={styles.urgencyBadge}>
              <Ionicons name="warning" size={14} color={COLORS.warning} />
              <Text style={styles.urgencyBadgeText}>Only {availableSpots} spots left!</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.capacityProgressBar}>
        <View style={[styles.capacityProgressFill, { width: `${filledPercent}%`, backgroundColor: progressColor }]} />
      </View>
    </View>
  );
});

const SubjectPage = ({ subjectId }) => {
  const segments = useSegments() as string[];
  const stackTab = segments.includes('profile') ? 'profile' : 'home';
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
  const [showAllTopics, setShowAllTopics] = useState(false);

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

  // Fetch capacity info for multi-student and multi-package courses
  React.useEffect(() => {
    const fetchCapacityInfo = async () => {
      if ((singleSubjectData.courseType === 'MULTI_STUDENT' || singleSubjectData.courseType === 'MULTI_PACKAGE') && subjectId) {
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
      alert('Please purchase the course to chat with the tutor');
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
      alert('Tutor information not available');
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
                router.push(`/(tabs)/${stackTab}/chat/${conversation.id}`);
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
                    router.push(`/(tabs)/${stackTab}/chat/${response.data.id}`);
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
                                router.push(`/(tabs)/${stackTab}/chat/${conversation.id}`);
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
    // For multi-student and multi-package courses, skip date/time selection and go directly to payment (slots/capacity only)
    if (singleSubjectData.courseType === 'MULTI_STUDENT' || singleSubjectData.courseType === 'MULTI_PACKAGE') {
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

        // MULTI_STUDENT: use subject.scheduledDateTime; MULTI_PACKAGE: use first topic's scheduledAt for display (or leave empty)
        if (singleSubjectData.courseType === 'MULTI_STUDENT' && singleSubjectData.scheduledDateTime) {
          const scheduledDate = new Date(singleSubjectData.scheduledDateTime);
          setSelectedBookingDate(scheduledDate.toISOString().split('T')[0]);
          setSelectedBookingTime(scheduledDate.toTimeString().split(' ')[0].slice(0, 5));
        } else if (singleSubjectData.courseType === 'MULTI_PACKAGE' && singleSubjectData.subjectTopics?.length) {
          const first = singleSubjectData.subjectTopics.find((t: SubjectTopic) => t.scheduledAt);
          if (first?.scheduledAt) {
            const d = new Date(first.scheduledAt);
            setSelectedBookingDate(d.toISOString().split('T')[0]);
            setSelectedBookingTime(d.toTimeString().split(' ')[0].slice(0, 5));
          } else {
            setSelectedBookingDate('');
            setSelectedBookingTime('');
          }
        } else if (singleSubjectData.courseType === 'MULTI_STUDENT') {
          alert('Course schedule information is missing. Please contact support.');
          return;
        } else {
          setSelectedBookingDate('');
          setSelectedBookingTime('');
        }
        setShowBookingSummary(true);
      } catch (error) {
        console.error('Error checking capacity:', error);
        alert('Failed to check course availability. Please try again.');
      }
    } else if (singleSubjectData.courseType === 'SINGLE_PACKAGE') {
      // SINGLE_PACKAGE: open per-topic booking flow (calendar per topic)
      setIsBookingModalVisible(true);
    } else {
      // SINGLE_STUDENT: show single-session booking calendar
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
    router.push(`/(tabs)/${stackTab}/subjectReviews/${subjectId}`);
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
            style={[styles.voteButton, voteState.userVote === 'up' && styles.activeUpVote]}
            onPress={() => handleVote('up')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
            style={[styles.voteButton, voteState.userVote === 'down' && styles.activeDownVote]}
            onPress={() => handleVote('down')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
   isPageLoading ? (
    <View style={styles.loadingWrap}>
      <ActivityIndicator size="large" color="#1A4C6E" />
      <Text style={styles.loadingText}>Loading course</Text>
    </View>
   ) : (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" />
      <Animated.ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.headerImageContainer, headerStyle]}>
          <CoverImage uri={singleSubjectData?.subjectImage} />
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconButton, isSaved && styles.iconButtonSaved]}
              onPress={handleSaveSubject}
              disabled={isSaving}
              accessibilityRole="button"
              accessibilityLabel={isSaved ? "Unsave course" : "Save course"}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={isSaved ? "#1A4C6E" : "#FFFFFF"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleMenuPress}
              accessibilityRole="button"
              accessibilityLabel="More options"
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {showMenu && (
          <TouchableOpacity
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={handleMenuPress}
          />
        )}

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
          <Text style={styles.subjectName}>{singleSubjectData.subjectName}</Text>
          {singleSubjectData.subjectNameSubHeading ? (
            <Text style={styles.subjectNameSubHeading}>{singleSubjectData.subjectNameSubHeading}</Text>
          ) : null}

          <View style={styles.badgeRow}>
            {singleSubjectData.courseType && (
              <View style={styles.badge}>
                <Ionicons
                  name={
                    singleSubjectData.courseType === 'SINGLE_STUDENT' ? 'person-outline' :
                    singleSubjectData.courseType === 'MULTI_STUDENT' ? 'people-outline' :
                    singleSubjectData.courseType === 'SINGLE_PACKAGE' ? 'layers-outline' : 'albums-outline'
                  }
                  size={14}
                  color="#1A4C6E"
                />
                <Text style={styles.badgeText} numberOfLines={1}>
                  {singleSubjectData.courseType === 'SINGLE_STUDENT' ? '1-on-1' :
                   singleSubjectData.courseType === 'MULTI_STUDENT' ? 'Group class' :
                   singleSubjectData.courseType === 'SINGLE_PACKAGE' ? 'Package' : 'Group package'}
                </Text>
              </View>
            )}
            {!!singleSubjectData.subjectBoard && (
              <View style={[styles.badge, styles.badgeShrink]}>
                <Text style={styles.badgeText} numberOfLines={1}>{singleSubjectData.subjectBoard}</Text>
              </View>
            )}
            {singleSubjectData.subjectGrade != null && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Grade {singleSubjectData.subjectGrade}</Text>
              </View>
            )}
          </View>

          {singleSubjectData.subjectTags && singleSubjectData.subjectTags.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsRow}
            >
              {singleSubjectData.subjectTags.map((tag: string, idx: number) => (
                <View key={idx} style={styles.tagChip}>
                  <Text style={styles.tagChipText}>{tag}</Text>
                </View>
              ))}
            </ScrollView>
          ) : null}

          {singleSubjectData?.user && teacherId && (
            <TouchableOpacity
              style={styles.teacherCard}
              onPress={() => router.push(`/(tabs)/${stackTab}/singleProfile/${teacherId}`)}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: singleSubjectData.user?.profileImage || '' }}
                style={styles.teacherImage}
                placeholder={blurhash}
                contentFit="cover"
                transition={100}
              />
              <View style={styles.teacherInfo}>
                <Text style={styles.teacherName}>{singleSubjectData.user?.name || 'Tutor'}</Text>
                <Text style={styles.teacherRole}>Tutor</Text>
              </View>
              <Text style={styles.viewProfileText}>Profile</Text>
              <Ionicons name="chevron-forward" size={18} color="#5C6B76" />
            </TouchableOpacity>
          )}

          <View style={styles.factsCard}>
            <View style={styles.priceBlock}>
              <Text style={styles.price}>{singleSubjectData.subjectPrice != null ? `AED ${Number(singleSubjectData.subjectPrice) / 100}` : '—'}</Text>
              <Text style={styles.priceLabel}>Course fee</Text>
            </View>
            <View style={styles.factsDivider} />
            <View style={styles.factsMeta}>
              {!!singleSubjectData.subjectDuration && (
                <Text style={styles.factValue}>{singleSubjectData.subjectDuration} hrs</Text>
              )}
              {!!singleSubjectData.subjectLanguage && (
                <Text style={styles.factValue}>{singleSubjectData.subjectLanguage}</Text>
              )}
            </View>
          </View>

          {/* Multi-Student Course Schedule Info */}
          {singleSubjectData.courseType === 'MULTI_STUDENT' && singleSubjectData.scheduledDateTime && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Course schedule</Text>
              <View style={styles.scheduleInfo}>
                  <View style={styles.scheduleItem}>
                  <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
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
                  <Ionicons name="time-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.scheduleText}>
                    {new Date(singleSubjectData.scheduledDateTime).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </Text>
                </View>
                {capacityInfo && (
                  <CapacityCard
                    availableSpots={capacityInfo.availableSpots}
                    maxCapacity={singleSubjectData.maxCapacity ?? 0}
                    isFull={capacityInfo.isFull}
                  />
                )}
              </View>
            </View>
          )}

          {/* Package course (Single/Multi): topic blocks with timeline + capacity above for multi */}
          {(singleSubjectData.courseType === 'SINGLE_PACKAGE' || singleSubjectData.courseType === 'MULTI_PACKAGE') &&
            singleSubjectData.subjectTopics &&
            singleSubjectData.subjectTopics.length > 0 && (() => {
              const sortedTopics = [...singleSubjectData.subjectTopics].sort((a, b) => a.orderIndex - b.orderIndex);
              const topicCount = sortedTopics.length;
              const showExpand = topicCount > 4;
              const displayedTopics = showExpand && !showAllTopics ? sortedTopics.slice(0, 3) : sortedTopics;
              const isMultiPackage = singleSubjectData.courseType === 'MULTI_PACKAGE';
              return (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Course topics</Text>
                  {isMultiPackage && capacityInfo && (
                    <CapacityCard
                      availableSpots={capacityInfo.availableSpots}
                      maxCapacity={singleSubjectData.maxCapacity ?? 0}
                      isFull={capacityInfo.isFull}
                    />
                  )}
                  <View style={styles.topicList}>
                    {displayedTopics.map((topic) => (
                      <View key={topic.id} style={styles.topicRow}>
                        <Text style={styles.topicTitleText}>{topic.topicTitle}</Text>
                        <View style={styles.topicMetaRow}>
                            <View style={styles.topicMetaItem}>
                              <Ionicons name="hourglass-outline" size={14} color={COLORS.primary} />
                              <Text style={styles.topicMetaText}>{topic.hours} {topic.hours === 1 ? 'hour' : 'hours'}</Text>
                            </View>
                            {isMultiPackage && topic.scheduledAt && (
                              <View style={styles.topicMetaItem}>
                                <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                              <Text style={styles.topicMetaText}>
                                {new Date(topic.scheduledAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                                {' · '}
                                {new Date(topic.scheduledAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                  {showExpand && !showAllTopics && (
                    <TouchableOpacity style={styles.showAllTopicsButton} onPress={() => setShowAllTopics(true)}>
                      <Text style={styles.showAllTopicsButtonText}>Show all {topicCount} topics</Text>
                      <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })()}

          {/* Description Section */}
          {singleSubjectData.subjectDescription && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this course</Text>
              <Text style={styles.description}>{singleSubjectData.subjectDescription}</Text>
            </View>
          )}

          {/* Key Points Section */}
          {singleSubjectData.subjectPoints && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What you'll learn</Text>
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
              <Text style={[styles.sectionTitle, styles.sectionTitleFlush]}>Reviews</Text>
              {reviews.length > 0 && (
                <TouchableOpacity onPress={handleViewAllReviews}>
                  <Text style={styles.viewAllButton}>See all</Text>
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
            (singleSubjectData.courseType === 'MULTI_STUDENT' || singleSubjectData.courseType === 'MULTI_PACKAGE') && purchaseStatus && styles.disabledButton
          ]} 
          onPress={() => {
            handleButtonPress();
            handleEnrollPress();
          }}
          disabled={
            isUserType === 'TEACHER' ||
            ((singleSubjectData.courseType === 'MULTI_STUDENT' || singleSubjectData.courseType === 'MULTI_PACKAGE') && purchaseStatus)
          }
        >
          <View style={styles.buttonTextContainer}>
            <Text style={styles.primaryButtonText} numberOfLines={2}>
              {isUserType === 'TEACHER'
                ? "Log in as a student to enroll"
                : (singleSubjectData.courseType === 'MULTI_STUDENT' || singleSubjectData.courseType === 'MULTI_PACKAGE') && purchaseStatus
                ? "Already enrolled"
                : (singleSubjectData.courseType === 'MULTI_STUDENT' || singleSubjectData.courseType === 'MULTI_PACKAGE') && capacityInfo?.isFull
                ? "Course full"
                : "Enroll now"}
            </Text>
            {(singleSubjectData.courseType === 'MULTI_STUDENT' || singleSubjectData.courseType === 'MULTI_PACKAGE') && capacityInfo && !capacityInfo.isFull && !purchaseStatus && (
              <Text style={styles.capacityText}>
                {capacityInfo.availableSpots} of {singleSubjectData.maxCapacity} spots left
              </Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.secondaryButton, isInitializingChat && styles.disabledOutline]} 
          onPress={() => {
            handleButtonPress();
            handleChatNow();
          }}
          disabled={isInitializingChat}
          accessibilityRole="button"
          accessibilityLabel="Chat with tutor"
        >
          {isInitializingChat ? (
            <ActivityIndicator size="small" color="#1A4C6E" />
          ) : (
            <Ionicons name="chatbubbles-outline" size={22} color="#1A4C6E" />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Show BookingCalendar for single-student and single-package (per-topic booking) */}
      {(singleSubjectData.courseType === 'SINGLE_STUDENT' || singleSubjectData.courseType === 'SINGLE_PACKAGE') && (
        <BookingCalendar
          teacherId={teacherId}
          teacherProfileId={singleSubjectData.teacherProfileId}
          subjectId={subjectId}
          visible={isBookingModalVisible}
          onClose={() => setIsBookingModalVisible(false)}
          courseType={singleSubjectData.courseType}
          subjectTopics={singleSubjectData.subjectTopics}
          subjectDuration={parseInt(singleSubjectData.subjectDuration || '1', 10)}
        />
      )}

      {/* BookingSummaryModal for multi-student and multi-package (slots/capacity, direct payment) */}
      {(singleSubjectData.courseType === 'MULTI_STUDENT' || singleSubjectData.courseType === 'MULTI_PACKAGE') && (
        <BookingSummaryModal
          visible={showBookingSummary}
          onClose={() => setShowBookingSummary(false)}
          teacherId={teacherId}
          subjectId={subjectId}
          date={selectedBookingDate}
          time={selectedBookingTime}
          onConfirm={() => {
            setShowBookingSummary(false);
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
              placeholderTextColor="#8A97A3"
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
   )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#5C6B76',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(112),
  },
  headerImageContainer: {
    position: 'relative',
    backgroundColor: '#D7DEE5',
  },
  headerActions: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(18, 38, 58, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonSaved: {
    backgroundColor: '#FFFFFF',
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  contentContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(18),
  },
  subjectName: {
    fontSize: moderateScale(24),
    fontFamily: FONT.bold,
    color: '#12263A',
    lineHeight: moderateScale(30),
  },
  subjectNameSubHeading: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(14),
    fontFamily: FONT.medium,
    color: '#5C6B76',
    lineHeight: moderateScale(20),
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: verticalScale(14),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF3F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: '100%',
  },
  badgeShrink: {
    flexShrink: 1,
    minWidth: 0,
  },
  badgeText: {
    color: '#1A4C6E',
    fontSize: moderateScale(12),
    fontFamily: FONT.medium,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: verticalScale(12),
  },
  tagChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EBF0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagChipText: {
    fontSize: moderateScale(12),
    fontFamily: FONT.medium,
    color: '#12263A',
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 12,
    minHeight: 72,
    marginTop: verticalScale(4),
    marginBottom: verticalScale(12),
  },
  teacherImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D7DEE5',
  },
  teacherInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teacherName: {
    fontSize: moderateScale(16),
    fontFamily: FONT.semiBold,
    color: '#12263A',
  },
  teacherRole: {
    marginTop: 2,
    fontSize: moderateScale(13),
    fontFamily: FONT.regular,
    color: '#5C6B76',
  },
  viewProfileText: {
    fontSize: moderateScale(13),
    fontFamily: FONT.medium,
    color: '#1A4C6E',
    marginRight: 4,
  },
  factsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 16,
    marginBottom: verticalScale(16),
  },
  priceBlock: {
    flex: 1,
  },
  price: {
    fontSize: moderateScale(22),
    fontFamily: FONT.bold,
    color: '#12263A',
  },
  priceLabel: {
    marginTop: 2,
    fontSize: moderateScale(12),
    fontFamily: FONT.medium,
    color: '#5C6B76',
  },
  factsDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E6EBF0',
    marginHorizontal: 14,
  },
  factsMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  factValue: {
    fontSize: moderateScale(13),
    fontFamily: FONT.medium,
    color: '#12263A',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 16,
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(17),
    fontFamily: FONT.bold,
    color: '#12263A',
    marginBottom: verticalScale(12),
  },
  sectionTitleFlush: {
    marginBottom: 0,
  },
  capacityCard: {
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  capacityCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF3F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  capacityTextWrap: {
    flex: 1,
  },
  capacityTitle: {
    fontSize: moderateScale(14),
    fontFamily: FONT.bold,
    color: '#12263A',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  urgencyBadgeText: {
    fontSize: moderateScale(12),
    fontFamily: FONT.semiBold,
    color: COLORS.warning,
  },
  capacityProgressBar: {
    height: 6,
    backgroundColor: '#E6EBF0',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  capacityProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  topicList: {
    gap: 12,
  },
  topicRow: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F7',
  },
  showAllTopicsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: 4,
    gap: 8,
  },
  showAllTopicsButtonText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.semiBold,
    color: COLORS.primary,
  },
  topicTitleText: {
    fontSize: moderateScale(15),
    fontFamily: FONT.semiBold,
    color: '#12263A',
    marginBottom: 6,
  },
  description: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#5C6B76',
    lineHeight: 22,
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
    backgroundColor: '#EEF3F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletNumber: {
    color: '#1A4C6E',
    fontSize: moderateScale(12),
    fontFamily: FONT.bold,
  },
  pointText: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#5C6B76',
    lineHeight: 22,
  },
  reviewItem: {
    backgroundColor: '#F4F6F8',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D7DEE5',
  },
  reviewerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reviewerName: {
    fontSize: moderateScale(14),
    fontFamily: FONT.semiBold,
    color: '#12263A',
  },
  reviewDate: {
    fontSize: moderateScale(12),
    fontFamily: FONT.regular,
    color: '#5C6B76',
    marginTop: 2,
  },
  reviewTitle: {
    fontSize: moderateScale(14),
    fontFamily: FONT.semiBold,
    color: '#12263A',
    marginBottom: 4,
  },
  reviewDescription: {
    fontSize: moderateScale(13),
    fontFamily: FONT.regular,
    color: '#5C6B76',
    lineHeight: 20,
  },
  reviewForm: {
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#12263A',
    minHeight: 48,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1A4C6E',
    borderRadius: 12,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontFamily: FONT.bold,
  },
  noReviewsText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#5C6B76',
    marginBottom: 8,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  viewAllButton: {
    fontSize: moderateScale(14),
    fontFamily: FONT.medium,
    color: '#1A4C6E',
    minHeight: 44,
    textAlignVertical: 'center',
    paddingTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6EBF0',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1A4C6E',
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  buttonTextContainer: {
    alignItems: 'flex-start',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontFamily: FONT.bold,
  },
  capacityText: {
    fontSize: moderateScale(11),
    color: 'rgba(255,255,255,0.85)',
    fontFamily: FONT.medium,
    marginTop: 2,
  },
  secondaryButton: {
    width: 52,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#C5CDD6',
  },
  disabledOutline: {
    opacity: 0.6,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  activeUpVote: {
    backgroundColor: '#E8F8EE',
  },
  activeDownVote: {
    backgroundColor: '#FDECEC',
  },
  voteCount: {
    fontSize: moderateScale(13),
    fontFamily: FONT.medium,
    color: '#5C6B76',
  },
  activeVoteCount: {
    color: '#12263A',
  },
  menuContainer: {
    position: 'absolute',
    top: verticalScale(70),
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 6,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
    gap: 8,
  },
  menuItemText: {
    fontSize: moderateScale(15),
    color: '#12263A',
    fontFamily: FONT.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 38, 58, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontFamily: FONT.bold,
    color: '#12263A',
    marginBottom: 12,
  },
  reportInput: {
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 12,
    marginBottom: 16,
    fontSize: moderateScale(14),
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#12263A',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#EEF3F7',
  },
  modalSubmitButton: {
    backgroundColor: '#C2410C',
  },
  modalCancelButtonText: {
    color: '#1A4C6E',
    fontSize: moderateScale(14),
    fontFamily: FONT.medium,
  },
  modalSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontFamily: FONT.medium,
  },
  purchaseStatusText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#5C6B76',
  },
  scheduleInfo: {
    gap: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 36,
  },
  scheduleText: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#12263A',
    fontFamily: FONT.medium,
  },
  topicMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  topicMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicMetaText: {
    fontSize: moderateScale(12),
    color: '#5C6B76',
    fontFamily: FONT.medium,
  },
});

export default SubjectPage;
