import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, ScrollView, Image, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ipURL } from '../utils/utils';
import { useStripe } from '@stripe/stripe-react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface BookingSummaryModalProps {
  visible: boolean;
  onClose: () => void;
  teacherId: string;
  subjectId: string;
  date: string;
  time: string;
  onConfirm: () => void;
}

const BookingSummaryModal: React.FC<BookingSummaryModalProps> = ({
  visible,
  onClose,
  teacherId,
  subjectId,
  date,
  time,
  onConfirm,
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
  const confettiRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const fadeOutAnim = useRef(new Animated.Value(1)).current;

  console.log(subjectData, 'subjectData');
  console.log(teacherData, 'teacherData');
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        
        // Fetch subject details
        const subjectResponse = await axios.get(`${ipURL}/api/subjects/${subjectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjectData(subjectResponse.data);

        // Fetch teacher details
        const teacherResponse = await axios.get(`${ipURL}/api/auth/teacher/profile/${teacherId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeacherData(teacherResponse.data);
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

      try {
        const token = await AsyncStorage.getItem('authToken');
        console.log(token, 'this is the token in stripe');
        
        const response = await fetch(`${ipURL}/api/stripe/payment-sheet`, {
          method: 'POST',
          body: JSON.stringify({
            amount: subjectData.subjectPrice,
            currency: 'aed',
            teacherId: teacherId,
            subjectId: subjectId,
            date: date,
            time: time,
            subjectDuration: subjectData.subjectDuration,
            teacherEmail: teacherData.email,
            subjectName: subjectData.subjectName,
          }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
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
          returnURL: 'coachacadem://home',
        });
        console.log(error, 'error');
        

        if (!error) {
          setPaymentInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing payment:', error);
      }
    };

    initializePayment();
  }, [subjectData, teacherData, initPaymentSheet]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const SuccessAnimation = () => {
    useEffect(() => {
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

      // Start confetti animation
      if (confettiRef.current) {
        confettiRef.current.start();
      }

      // Start closing sequence after 4 seconds
      const timer = setTimeout(() => {
        setIsClosing(true);
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
    }, []);

    return (
      <Animated.View 
        style={[
          styles.successContainer,
          {
            opacity: fadeOutAnim
          }
        ]}
      >
        <ConfettiCannon
          ref={confettiRef}
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={false}
          fadeOut={true}
          fallSpeed={3000}
          colors={['#2DCB63', '#1A4C6E', '#F1A568', '#FFFFFF']}
        />
        <Animated.View 
          style={[
            styles.successContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={50} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successMessage}>Your booking has been confirmed</Text>
        </Animated.View>
      </Animated.View>
    );
  };

  const openPaymentSheet = async () => {
    if (!paymentInitialized) {
      Alert.alert('Error', 'Payment system is not ready. Please try again.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert(`Error code: ${error.code}`, error.message);
      } else {
        setShowSuccess(true);
        setIsClosing(false);
        fadeOutAnim.setValue(1);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  if (loadingModal || !subjectData || !teacherData) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#2DCB63" />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {showSuccess ? (
            <SuccessAnimation />
          ) : (
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                  <Ionicons name="arrow-back" size={24} color="#1A4C6E" />
                </TouchableOpacity>
                <Text style={styles.title}>Booking Summary</Text>
              </View>

              <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                  {/* Teacher Profile Section */}
                  <View style={styles.teacherProfileSection}>
                    <Image
                      source={{ uri: teacherData.profileImage || 'https://via.placeholder.com/100' }}
                      style={styles.teacherImage}
                    />
                    <View style={styles.teacherInfo}>
                      <Text style={styles.teacherName}>{teacherData.name}</Text>
                      <Text style={styles.teacherRole}>Teacher</Text>
                    </View>
                  </View>

                  {/* Subject Details Section */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="book" size={24} color="#1A4C6E" />
                      <Text style={styles.sectionTitle}>Subject Details</Text>
                    </View>
                    <View style={styles.sectionContent}>
                      <Text style={styles.subjectName}>{subjectData.subjectName}</Text>
                      <View style={styles.subjectMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="school" size={16} color="#64748B" />
                          <Text style={styles.metaText}>{subjectData.subjectBoard}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="bookmark" size={16} color="#64748B" />
                          <Text style={styles.metaText}>Grade {subjectData.subjectGrade}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Session Details Section */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="calendar" size={24} color="#1A4C6E" />
                      <Text style={styles.sectionTitle}>Session Details</Text>
                    </View>
                    <View style={styles.sectionContent}>
                      <View style={styles.sessionDetail}>
                        <Ionicons name="calendar-outline" size={20} color="#64748B" />
                        <Text style={styles.detailText}>{formatDate(date)}</Text>
                      </View>
                      <View style={styles.sessionDetail}>
                        <Ionicons name="time-outline" size={20} color="#64748B" />
                        <Text style={styles.detailText}>{time}</Text>
                      </View>
                      <View style={styles.sessionDetail}>
                        <Ionicons name="hourglass-outline" size={20} color="#64748B" />
                        <Text style={styles.detailText}>{subjectData.subjectDuration} months duration</Text>
                      </View>
                    </View>
                  </View>

                  {/* Payment Details Section */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="wallet" size={24} color="#1A4C6E" />
                      <Text style={styles.sectionTitle}>Payment Details</Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Course Fee</Text>
                        <Text style={styles.price}>AED {(subjectData.subjectPrice) / 100}</Text>
                      </View>
                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Duration</Text>
                        <Text style={styles.priceValue}>{subjectData.subjectDuration} months</Text>
                      </View>
                      <View style={[styles.priceRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalPrice}>AED {(subjectData.subjectPrice) / 100}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                <TouchableOpacity 
                  style={[
                    styles.confirmButton,
                    (!paymentInitialized || loading) && styles.disabledButton
                  ]} 
                  onPress={openPaymentSheet}
                  disabled={!paymentInitialized || loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" style={styles.confirmIcon} />
                      <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    height: '90%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: horizontalScale(15),
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A4C6E',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: moderateScale(20),
    flexGrow: 1,
  },
  teacherProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(20),
  },
  teacherImage: {
    width: moderateScale(60),
    height: moderateScale(60),
    borderRadius: moderateScale(30),
    marginRight: horizontalScale(15),
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A4C6E',
    marginBottom: verticalScale(4),
  },
  teacherRole: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
  },
  section: {
    marginBottom: verticalScale(25),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A4C6E',
    marginLeft: horizontalScale(10),
  },
  sectionContent: {
    padding: moderateScale(15),
  },
  subjectName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A4C6E',
    marginBottom: verticalScale(10),
  },
  subjectMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(10),
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(6),
  },
  metaText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#64748B',
    marginLeft: horizontalScale(5),
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  detailText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#374151',
    marginLeft: horizontalScale(10),
  },
  priceContainer: {
    padding: moderateScale(15),
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  priceLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
  },
  price: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A4C6E',
  },
  priceValue: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
  },
  totalRow: {
    marginTop: verticalScale(10),
    paddingTop: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A4C6E',
  },
  totalPrice: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#2DCB63',
  },
  footer: {
    padding: moderateScale(20),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: '#2DCB63',
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#A0AEC0',
    opacity: 0.7,
  },
  confirmIcon: {
    marginRight: horizontalScale(10),
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
    backgroundColor: '#FFFFFF',
    height: '100%',
  },
  successContent: {
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: '#2DCB63',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    shadowColor: '#2DCB63',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  successTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A4C6E',
    marginBottom: verticalScale(10),
    textAlign: 'center',
  },
  successMessage: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#64748B',
    textAlign: 'center',
  },
});

export default BookingSummaryModal;