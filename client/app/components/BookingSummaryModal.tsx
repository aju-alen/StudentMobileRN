import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, ScrollView, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../constants';
import { moderateScale, verticalScale } from '../utils/metrics';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ipURL } from '../utils/utils';
import { useStripe } from '@stripe/stripe-react-native';
import { fromUaeDateTime, normalizeHHmm } from '../utils/uaeDateTime';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

interface TopicSlot {
  subjectTopicId: string;
  date: string;
  time: string;
}

interface BookingSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  teacherId: string;
  subjectId: string;
  date: string;
  time: string;
  onConfirm: () => void;
  topicSlots?: TopicSlot[];
}

const formatTime = (timeString: string) => {
  const time = normalizeHHmm(timeString);
  const hour = Number(time.slice(0, 2));
  const minute = time.slice(3, 5);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${period}`;
};

const formatAed = (fils: number) => `AED ${Number(fils) / 100}`;

const dubaiDateOptions: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Dubai',
};

const dubaiTimeOptions: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Dubai',
};

const BookingSummaryModal: React.FC<BookingSummaryModalProps> = ({
  visible,
  onClose,
  teacherId,
  subjectId,
  date,
  time,
  onConfirm,
  topicSlots,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [subjectData, setSubjectData] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        
        // Fetch subject details (which includes teacher info)
        const subjectResponse = await axios.get(`${ipURL}/api/subjects/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjectData(subjectResponse.data);

        // Extract teacher data from subject response
        if (subjectResponse.data.user) {
          setTeacherData({
            id: subjectResponse.data.user.id,
            name: subjectResponse.data.user.name,
            email: subjectResponse.data.user.email,
            profileImage: subjectResponse.data.user.profileImage,
          });
        } else {
          // Fallback: Fetch teacher details if not in subject response
          const teacherResponse = await axios.get(`${ipURL}/api/auth/teacher/profile/${teacherId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTeacherData(teacherResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingModal(false);
      }
    };

    if (visible) {
      fetchData();
    }
  }, [visible, subjectId, teacherId]);

  useEffect(() => {
    const initializePayment = async () => {
      if (!subjectData || !teacherData) return;
      if (subjectData.courseType === 'SINGLE_PACKAGE' && (!topicSlots || !topicSlots.length)) return;

      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        const user = JSON.parse(await AsyncStorage.getItem('userDetails'));

        const response = await fetch(`${ipURL}/api/stripe/payment-sheet`, {
          method: 'POST',
          body: JSON.stringify({
            amount: subjectData.subjectPrice,
            currency: 'aed',
            teacherId: teacherId,
            subjectId: subjectId,
            userId: user.userId,
            date: (subjectData.courseType === 'MULTI_STUDENT' || subjectData.courseType === 'MULTI_PACKAGE') ? '' : date,
            time: (subjectData.courseType === 'MULTI_STUDENT' || subjectData.courseType === 'MULTI_PACKAGE') ? '' : time,
            subjectDuration: subjectData.subjectDuration,
            teacherEmail: teacherData.email,
            subjectName: subjectData.subjectName,
            userEmail: user.email,
            courseType: subjectData.courseType || 'SINGLE_STUDENT',
            topicSlots: subjectData.courseType === 'SINGLE_PACKAGE' && topicSlots?.length ? topicSlots : undefined,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to initialize payment');
        }

        const { paymentIntent, ephemeralKey, customer } = await response.json();

        const { error } = await initPaymentSheet({
          merchantDisplayName: "Coach Academ",
          customerId: customer,
          customerEphemeralKeySecret: ephemeralKey,
          paymentIntentClientSecret: paymentIntent,
          allowsDelayedPaymentMethods: true,
          defaultBillingDetails: {
            name: 'Jane Doe',
          },
          returnURL: 'coachacadem://booking-success',
        });

        if (error) {
          console.error('Payment initialization error:', error);
          Alert.alert('Error', 'Failed to initialize payment system. Please try again.');
          return;
        }

        setPaymentInitialized(true);
      } catch (error) {
        console.error('Error initializing payment:', error);
        Alert.alert('Error', 'Failed to initialize payment system. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (visible && subjectData && teacherData) {
      initializePayment();
    }
  }, [visible, subjectData, teacherData, topicSlots, initPaymentSheet]);

  const formatDate = (dateString: string) => {
    const raw = String(dateString || '').trim();
    const d = /^\d{4}-\d{2}-\d{2}$/.test(raw)
      ? fromUaeDateTime(raw, '12:00')
      : new Date(dateString);
    return d.toLocaleDateString('en-US', dubaiDateOptions);
  };

  useEffect(() => {
    if (!showSuccess) return;

    fadeAnim.setValue(0);
    scaleAnim.setValue(0.5);
    fadeOutAnim.setValue(1);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeOutAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccess(false);
        onConfirm();
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [showSuccess]);

  const openPaymentSheet = async () => {
    if (!paymentInitialized) {
      Alert.alert('Error', 'Payment system is not ready. Please try again.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert('Payment Error', error.message);
      } else {
        setShowSuccess(true);
        fadeOutAnim.setValue(1);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isEnrollment =
    subjectData?.courseType === 'MULTI_STUDENT' || subjectData?.courseType === 'MULTI_PACKAGE';
  const amountLabel = subjectData ? formatAed(subjectData.subjectPrice) : '';

  const renderSessionDetails = () => {
    if (subjectData.courseType === 'SINGLE_PACKAGE' && topicSlots?.length) {
      return topicSlots.map((slot: TopicSlot, idx: number) => {
        const topic = subjectData.subjectTopics?.find((t: { id: string }) => t.id === slot.subjectTopicId);
        return (
          <View key={slot.subjectTopicId} style={styles.topicRow}>
            <View style={styles.topicIndex}>
              <Text style={styles.topicIndexText}>{idx + 1}</Text>
            </View>
            <View style={styles.topicCopy}>
              <Text style={styles.topicTitle}>{topic?.topicTitle ?? `Topic ${idx + 1}`}</Text>
              <Text style={styles.topicMeta}>
                {formatDate(slot.date)} · {formatTime(slot.time)}
              </Text>
            </View>
          </View>
        );
      });
    }

    if (subjectData.courseType === 'MULTI_PACKAGE' && subjectData.subjectTopics?.length) {
      return (
        <>
          {subjectData.subjectTopics.map((topic: { topicTitle: string; hours: number; scheduledAt?: string | null }, idx: number) => (
            <View key={idx} style={styles.topicRow}>
              <View style={styles.topicIndex}>
                <Text style={styles.topicIndexText}>{idx + 1}</Text>
              </View>
              <View style={styles.topicCopy}>
                <Text style={styles.topicTitle}>
                  {topic.topicTitle}
                  {topic.hours ? ` · ${topic.hours}h` : ''}
                </Text>
                {topic.scheduledAt ? (
                  <Text style={styles.topicMeta}>
                    {new Date(topic.scheduledAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                      timeZone: 'Asia/Dubai',
                    })}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
          {subjectData.maxCapacity ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Capacity</Text>
              <Text style={styles.detailValue}>Up to {subjectData.maxCapacity} students</Text>
            </View>
          ) : null}
        </>
      );
    }

    if (subjectData.courseType === 'MULTI_STUDENT') {
      return (
        <>
          {subjectData.scheduledDateTime && (
            <>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>
                  {new Date(subjectData.scheduledDateTime).toLocaleDateString('en-US', dubaiDateOptions)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>
                  {new Date(subjectData.scheduledDateTime).toLocaleTimeString('en-US', dubaiTimeOptions)}
                </Text>
              </View>
            </>
          )}
          {subjectData.maxCapacity ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Capacity</Text>
              <Text style={styles.detailValue}>Up to {subjectData.maxCapacity} students</Text>
            </View>
          ) : null}
        </>
      );
    }

    return (
      <>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time</Text>
          <Text style={styles.detailValue}>{formatTime(time)}</Text>
        </View>
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <SafeAreaView style={styles.modalContent} edges={['bottom']}>
          <View style={styles.handle} />

          {showSuccess ? (
            <Animated.View
              style={[
                styles.successContainer,
                { opacity: fadeOutAnim },
              ]}
            >
              <Animated.View
                style={[
                  styles.successContent,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <View style={styles.checkmarkCircle}>
                  <Ionicons name="checkmark" size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.successTitle}>Payment successful</Text>
                <Text style={styles.successMessage}>
                  {isEnrollment
                    ? 'Your enrollment has been confirmed'
                    : 'Your booking has been confirmed'}
                </Text>
              </Animated.View>
            </Animated.View>
          ) : (
            <>
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.iconButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Ionicons name="chevron-back" size={22} color="#12263A" />
                </TouchableOpacity>
                <View style={styles.headerCopy}>
                  <Text style={styles.title}>
                    {isEnrollment ? 'Review enrollment' : 'Review booking'}
                  </Text>
                  <Text style={styles.subtitle}>Confirm the details before you pay</Text>
                </View>
                <View style={styles.iconButton} />
              </View>

              {loadingModal || !subjectData || !teacherData ? (
                <View style={styles.loadingWrap}>
                  <ActivityIndicator size="large" color="#1A4C6E" />
                </View>
              ) : (
                <>
                  <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.card}>
                      <View style={styles.teacherRow}>
                        {teacherData.profileImage ? (
                          <Image
                            source={{ uri: teacherData.profileImage }}
                            style={styles.teacherImage}
                            placeholder={blurhash}
                            contentFit="cover"
                            transition={100}
                          />
                        ) : (
                          <View style={[styles.teacherImage, styles.teacherFallback]}>
                            <Ionicons name="person" size={20} color="#5C6B76" />
                          </View>
                        )}
                        <View style={styles.teacherInfo}>
                          <Text style={styles.teacherName}>{teacherData.name}</Text>
                          <Text style={styles.teacherRole}>Tutor</Text>
                        </View>
                      </View>

                      <Text style={styles.subjectName}>{subjectData.subjectName}</Text>
                      <View style={styles.chipRow}>
                        {!!subjectData.subjectBoard && (
                          <View style={styles.chip}>
                            <Text style={styles.chipText}>{subjectData.subjectBoard}</Text>
                          </View>
                        )}
                        {!!subjectData.subjectGrade && (
                          <View style={styles.chip}>
                            <Text style={styles.chipText}>Grade {subjectData.subjectGrade}</Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.card}>
                      <Text style={styles.sectionTitle}>
                        {isEnrollment ? 'Course details' : 'Session details'}
                      </Text>
                      {renderSessionDetails()}
                      {!!subjectData.subjectDuration && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Duration</Text>
                          <Text style={styles.detailValue}>{subjectData.subjectDuration} hours/session</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.card}>
                      <Text style={styles.sectionTitle}>Payment</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Course fee</Text>
                        <Text style={styles.priceValue}>{amountLabel}</Text>
                      </View>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Duration</Text>
                        <Text style={styles.priceMuted}>{subjectData.subjectDuration} hours</Text>
                      </View>
                      <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalPrice}>{amountLabel}</Text>
                      </View>
                    </View>
                  </ScrollView>

                  <View style={styles.footer}>
                    <TouchableOpacity
                      style={[
                        styles.confirmButton,
                        (!paymentInitialized || loading) && styles.disabledButton,
                      ]}
                      onPress={openPaymentSheet}
                      disabled={!paymentInitialized || loading}
                      accessibilityRole="button"
                      accessibilityLabel={paymentInitialized ? `Pay ${amountLabel}` : 'Preparing payment'}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.confirmButtonText}>
                          {paymentInitialized ? `Pay ${amountLabel}` : 'Preparing payment'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(18, 38, 58, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F4F6F8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '92%',
    maxHeight: '92%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D7DEE5',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#12263A',
  },
  subtitle: {
    marginTop: 2,
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 16,
    marginBottom: 12,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  teacherImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D7DEE5',
  },
  teacherFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teacherName: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(16),
    color: '#12263A',
  },
  teacherRole: {
    marginTop: 2,
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  subjectName: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(18),
    color: '#12263A',
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#EEF3F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#1A4C6E',
  },
  sectionTitle: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(15),
    color: '#12263A',
    marginBottom: 12,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  topicIndex: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EEF3F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  topicIndexText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(12),
    color: '#1A4C6E',
  },
  topicCopy: {
    flex: 1,
  },
  topicTitle: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(14),
    color: '#12263A',
  },
  topicMeta: {
    marginTop: 2,
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
    lineHeight: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  detailLabel: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5C6B76',
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#12263A',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5C6B76',
  },
  priceValue: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#12263A',
  },
  priceMuted: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#5C6B76',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6EBF0',
    marginBottom: 0,
  },
  totalLabel: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(16),
    color: '#12263A',
  },
  totalPrice: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A4C6E',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E6EBF0',
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: '#1A4C6E',
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
  },
  confirmButtonText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successContent: {
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A4C6E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  successTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(22),
    color: '#12263A',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(15),
    color: '#5C6B76',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default BookingSummaryModal;
