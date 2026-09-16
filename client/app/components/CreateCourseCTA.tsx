import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { FONT } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { axiosWithAuth } from '../utils/customAxios';
import { ipURL } from '../utils/utils';
import { useRevenueCat } from '../providers/RevenueCatProvider';
import CourseTypeModal from './CourseTypeModal';

type CreateCourseCTAProps = {
  variant: 'compact' | 'banner';
  email?: string;
  disabled?: boolean;
};

const CreateCourseCTA = ({
  variant,
  email,
  disabled,
}: CreateCourseCTAProps) => {
  const revenueCatContext = useRevenueCat();
  const [showCourseTypeModal, setShowCourseTypeModal] = useState(false);
  const [isButtonCooldown, setIsButtonCooldown] = useState(false);
  const [hasSingleStudentDraft, setHasSingleStudentDraft] = useState(false);
  const [hasMultiStudentDraft, setHasMultiStudentDraft] = useState(false);
  const [hasSinglePackageDraft, setHasSinglePackageDraft] = useState(false);
  const [hasMultiPackageDraft, setHasMultiPackageDraft] = useState(false);

  const isMultiStudentSubscribed = !!revenueCatContext?.multiStudentCapacity;
  const isSinglePackageSubscribed = !!revenueCatContext?.hasSinglePackage;
  const isMultiPackageSubscribed = !!revenueCatContext?.hasMultiPackage;
  const busy = disabled || isButtonCooldown;

  const refreshDraftFlags = async (userId: string) => {
    try {
      const keys = [
        `subjectDraft:${userId}:SINGLE_STUDENT`,
        `subjectDraft:${userId}:MULTI_STUDENT`,
        `subjectDraft:${userId}:SINGLE_PACKAGE`,
        `subjectDraft:${userId}:MULTI_PACKAGE`,
      ];
      const results = await AsyncStorage.multiGet(keys);
      setHasSingleStudentDraft(!!results[0][1]);
      setHasMultiStudentDraft(!!results[1][1]);
      setHasSinglePackageDraft(!!results[2][1]);
      setHasMultiPackageDraft(!!results[3][1]);
    } catch (e) {
      console.error('Failed to read subject draft flags', e);
    }
  };

  const handleCreateNewSubject = async () => {
    if (busy) return;

    setIsButtonCooldown(true);
    setTimeout(() => {
      setIsButtonCooldown(false);
    }, 3000);

    try {
      const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);
      const { isTeacher, id, zoomAccountCreated, zoomUserAcceptedInvite } =
        userverificationCheck.data.userDetail;
      const zoomVerified = zoomUserAcceptedInvite || zoomAccountCreated;

      if (!isTeacher) {
        Alert.alert('Incomplete Profile', 'You need to be registered as a tutor to create a course.');
        return;
      }
      if (!zoomVerified) {
        Alert.alert(
          'Zoom Account Not Verified',
          'Your Zoom account has not been verified yet. Please check your email (including spam folder) for the Zoom activation link and accept the invite. After that you can create courses.',
          [
            { text: 'OK', style: 'cancel' },
            {
              text: 'Resend Email',
              onPress: async () => {
                try {
                  await axiosWithAuth.post(`${ipURL}/api/auth/resend-zoom-invite`);
                  Alert.alert(
                    'Email Sent',
                    'A reminder has been sent to your email. Please check your inbox and spam folder.'
                  );
                } catch (err) {
                  const msg = err.response?.data?.message || 'Failed to resend email. Please try again.';
                  Alert.alert('Error', msg);
                }
              },
            },
          ]
        );
        return;
      }

      if (!id) {
        throw new Error('User ID not found in user details');
      }
      await refreshDraftFlags(id);
      setShowCourseTypeModal(true);
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          location: 'handleCreateNewSubject',
          action: 'new_course_button_click',
        },
        extra: {
          error: error.message,
          stack: error.stack,
          userDetails: await AsyncStorage.getItem('userDetails'),
        },
      });
      Alert.alert('Error', 'Failed to create new course. Please try again.');
    }
  };

  const handleSelectSingleStudent = async () => {
    try {
      const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);
      const { id } = userverificationCheck.data.userDetail;
      router.push(`/(tabs)/profile/createSubject/${id}?courseType=SINGLE_STUDENT`);
    } catch {
      Alert.alert('Error', 'Failed to navigate to course creation.');
    }
  };

  const handleSelectMultiStudent = async () => {
    try {
      if (revenueCatContext && revenueCatContext.getMultiStudentCapacity) {
        const capacity = await revenueCatContext.getMultiStudentCapacity();
        if (capacity && capacity > 0) {
          const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);
          const { id } = userverificationCheck.data.userDetail;
          router.push(
            `/(tabs)/profile/createSubject/${id}?courseType=MULTI_STUDENT&maxCapacity=${capacity}`
          );
          return;
        }
      }
      router.push(
        `/(tabs)/profile/course-paywall?courseType=MULTI_STUDENT&userEmail=${encodeURIComponent(email || '')}`
      );
    } catch {
      Alert.alert('Error', 'Failed to navigate to course creation.');
    }
  };

  const handleSelectSinglePackage = async () => {
    try {
      if (!revenueCatContext?.checkSinglePackageEntitlement) {
        router.push(
          `/(tabs)/profile/course-paywall?courseType=SINGLE_PACKAGE&userEmail=${encodeURIComponent(email || '')}`
        );
        return;
      }
      const entitled = await revenueCatContext.checkSinglePackageEntitlement();
      if (!entitled) {
        router.push(
          `/(tabs)/profile/course-paywall?courseType=SINGLE_PACKAGE&userEmail=${encodeURIComponent(email || '')}`
        );
        return;
      }
      const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);
      const { id } = userverificationCheck.data.userDetail;
      router.push(`/(tabs)/profile/createSubject/${id}?courseType=SINGLE_PACKAGE&maxHours=20`);
    } catch {
      Alert.alert('Error', 'Failed to navigate to course creation.');
    }
  };

  const handleSelectMultiPackage = async () => {
    try {
      if (!revenueCatContext?.checkMultiPackageEntitlement) {
        router.push(
          `/(tabs)/profile/course-paywall?courseType=MULTI_PACKAGE&userEmail=${encodeURIComponent(email || '')}`
        );
        return;
      }
      const entitled = await revenueCatContext.checkMultiPackageEntitlement();
      if (!entitled) {
        router.push(
          `/(tabs)/profile/course-paywall?courseType=MULTI_PACKAGE&userEmail=${encodeURIComponent(email || '')}`
        );
        return;
      }
      const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);
      const { id } = userverificationCheck.data.userDetail;
      router.push(`/(tabs)/profile/createSubject/${id}?courseType=MULTI_PACKAGE&maxHours=20`);
    } catch {
      Alert.alert('Error', 'Failed to navigate to course creation.');
    }
  };

  const modal = (
    <CourseTypeModal
      visible={showCourseTypeModal}
      onClose={() => setShowCourseTypeModal(false)}
      onSelectSingle={handleSelectSingleStudent}
      onSelectMulti={handleSelectMultiStudent}
      onSelectSinglePackage={handleSelectSinglePackage}
      onSelectMultiPackage={handleSelectMultiPackage}
      isMultiStudentSubscribed={isMultiStudentSubscribed}
      isSinglePackageSubscribed={isSinglePackageSubscribed}
      isMultiPackageSubscribed={isMultiPackageSubscribed}
      hasSingleStudentDraft={hasSingleStudentDraft}
      hasMultiStudentDraft={hasMultiStudentDraft}
      hasSinglePackageDraft={hasSinglePackageDraft}
      hasMultiPackageDraft={hasMultiPackageDraft}
    />
  );

  if (variant === 'banner') {
    return (
      <TouchableOpacity
        style={styles.banner}
        onPress={() => router.navigate('/(tabs)/profile')}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Create New Course"
      >
        <View style={styles.bannerIcon}>
          <Ionicons name="add-circle-outline" size={22} color="#1A4C6E" />
        </View>
        <View style={styles.bannerCopy}>
          <Text style={styles.bannerTitle}>Create a new course</Text>
          <Text style={styles.bannerSub}>Add a subject so students can find and book you.</Text>
        </View>
        <View style={styles.bannerButton}>
          <Text style={styles.bannerButtonText}>Create New Course</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        onPress={handleCreateNewSubject}
        disabled={busy}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Create New Course"
      >
        <View style={[styles.compactButton, busy && styles.compactButtonDisabled]}>
          <Text style={styles.compactButtonText}>Create New Course</Text>
        </View>
      </TouchableOpacity>
      {modal}
    </>
  );
};

const styles = StyleSheet.create({
  compactButton: {
    minHeight: 44,
    backgroundColor: '#1A4C6E',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactButtonDisabled: {
    backgroundColor: '#C5CDD6',
  },
  compactButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#FFFFFF',
  },
  banner: {
    marginTop: verticalScale(16),
    marginHorizontal: horizontalScale(20),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: moderateScale(14),
    gap: verticalScale(12),
  },
  bannerDisabled: {
    opacity: 0.6,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E8F0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerCopy: {
    gap: 2,
  },
  bannerTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
  },
  bannerSub: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(13),
    color: '#5C6B76',
  },
  bannerButton: {
    backgroundColor: '#1A4C6E',
    borderRadius: 12,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  bannerButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
});

export default CreateCourseCTA;
