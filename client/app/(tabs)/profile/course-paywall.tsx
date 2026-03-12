import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useRevenueCat } from '../../providers/RevenueCatProvider';
import { COLORS } from '../../../constants/theme';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { FONT } from '../../../constants';
import { axiosWithAuth } from '../../utils/customAxios';
import { ipURL } from '../../utils/utils';

type PaidCourseType = 'MULTI_STUDENT' | 'SINGLE_PACKAGE' | 'MULTI_PACKAGE';

const CoursePaywallPage = () => {
  const params = useLocalSearchParams();
  const courseType = (params.courseType as PaidCourseType) || 'MULTI_STUDENT';
  const userEmail = (params.userEmail as string) || '';

  const revenueCatContext = useRevenueCat();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const copy = useMemo(() => {
    switch (courseType) {
      case 'SINGLE_PACKAGE':
        return {
          title: 'Single Course Package',
          description:
            'Unlock the ability to create single course packages (3–20 hours) with topic blocks.',
        };
      case 'MULTI_PACKAGE':
        return {
          title: 'Multi Course Package',
          description:
            'Unlock the ability to create multi course packages (3–20 hours) with scheduled topic blocks.',
        };
      case 'MULTI_STUDENT':
      default:
        return {
          title: 'Multi-Student Subscription',
          description:
            'Unlock the ability to create multi-student courses and host classes for multiple students at once.',
        };
    }
  }, [courseType]);

  if (!revenueCatContext) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{copy.title}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Initializing subscription service...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const {
    identifyUser,
    purchasePackage,
    isReady,
    getStudentZoomCapacityOffering,
    getSinglePackageOffering,
    getMultiPackageOffering,
    getMultiStudentCapacity,
    checkSinglePackageEntitlement,
    checkMultiPackageEntitlement,
  } = revenueCatContext;

  const checkEntitled = async (): Promise<boolean> => {
    if (courseType === 'MULTI_STUDENT') {
      const cap = await getMultiStudentCapacity();
      return !!cap && cap > 0;
    }
    if (courseType === 'SINGLE_PACKAGE') {
      return await checkSinglePackageEntitlement();
    }
    return await checkMultiPackageEntitlement();
  };

  const fetchOffering = async (): Promise<PurchasesOffering | null> => {
    if (courseType === 'MULTI_STUDENT') return await getStudentZoomCapacityOffering();
    if (courseType === 'SINGLE_PACKAGE') return await getSinglePackageOffering();
    return await getMultiPackageOffering();
  };

  useEffect(() => {
    const run = async () => {
      if (!isReady) return;
      try {
        if (userEmail) {
          await identifyUser(userEmail);
        }
        const entitled = await checkEntitled();
        if (entitled) {
          router.back();
          return;
        }
      } catch (e) {
        // If entitlement check fails, continue to show paywall.
      }
    };
    run();
  }, [isReady, userEmail, courseType]);

  useEffect(() => {
    if (isReady) {
      void loadOffering();
    }
  }, [isReady, courseType]);

  const loadOffering = async () => {
    try {
      setLoading(true);
      setError('');
      if (userEmail) {
        await identifyUser(userEmail);
      }
      const o = await fetchOffering();
      setOffering(o);
    } catch (err: any) {
      console.error('Error fetching offering:', err);
      setError('Failed to load plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasing(packageToPurchase.identifier);
      setError('');

      await purchasePackage(packageToPurchase);

      Alert.alert('Success!', 'Purchase completed.', [
        {
          text: 'OK',
          onPress: async () => {
            router.back();
            setTimeout(async () => {
              try {
                const userverificationCheck = await axiosWithAuth.get(
                  `${ipURL}/api/auth/verification-check`
                );
                const { id } = userverificationCheck.data.userDetail;

                if (courseType === 'MULTI_STUDENT') {
                  const cap = await revenueCatContext.getMultiStudentCapacity();
                  if (cap && cap > 0) {
                    router.push(
                      `/(tabs)/profile/createSubject/${id}?courseType=MULTI_STUDENT&maxCapacity=${cap}`
                    );
                  }
                  return;
                }

                if (courseType === 'SINGLE_PACKAGE') {
                  router.push(
                    `/(tabs)/profile/createSubject/${id}?courseType=SINGLE_PACKAGE&maxHours=20`
                  );
                  return;
                }

                router.push(
                  `/(tabs)/profile/createSubject/${id}?courseType=MULTI_PACKAGE&maxHours=20`
                );
              } catch (error) {
                console.error('Error navigating to course creation:', error);
              }
            }, 300);
          },
        },
      ]);
    } catch (err: any) {
      console.error('Purchase error:', err);
      if (err.userCancelled) {
        setError('');
        return;
      }
      const msg = err.message || 'Purchase failed. Please try again.';
      setError(msg);
      Alert.alert('Purchase Failed', msg);
    } finally {
      setPurchasing(null);
    }
  };

  const packages = useMemo(() => {
    return offering?.availablePackages || [];
  }, [offering]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{copy.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>{copy.description}</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading plans...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={32} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadOffering}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.packagesContainer}>
            {packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.packageCard, purchasing === pkg.identifier && styles.packageCardDisabled]}
                onPress={() => handlePurchase(pkg)}
                disabled={!!purchasing}
              >
                <View style={styles.packageHeader}>
                  <View>
                    <Text style={styles.packageTitle}>{pkg.product.title || 'Plan'}</Text>
                    {!!pkg.product.description && (
                      <Text style={styles.packageSubtitle}>{pkg.product.description}</Text>
                    )}
                  </View>

                </View>

                <View style={styles.packagePrice}>
                  <Text style={styles.priceText}>{pkg.product.priceString}</Text>
                  <Text style={styles.pricePeriod}>/month</Text>
                </View>

                {purchasing === pkg.identifier ? (
                  <View style={styles.purchasingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.purchasingText}>Processing...</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.purchaseButton} onPress={() => handlePurchase(pkg)}>
                    <Text style={styles.purchaseButtonText}>Subscribe</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}

            {packages.length === 0 && (
              <View style={styles.noPackagesContainer}>
                <Ionicons name="information-circle" size={32} color="#999" />
                <Text style={styles.noPackagesText}>No plans available at the moment.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: moderateScale(4),
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontFamily: FONT.bold,
    color: COLORS.primary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: moderateScale(32),
  },
  content: {
    flex: 1,
    padding: moderateScale(20),
  },
  description: {
    fontSize: moderateScale(14),
    color: '#666',
    lineHeight: moderateScale(20),
    marginBottom: verticalScale(24),
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  loadingText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  errorText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    color: 'white',
    fontSize: moderateScale(14),
    fontFamily: FONT.bold,
  },
  packagesContainer: {
    gap: verticalScale(16),
  },
  packageCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packageCardDisabled: {
    opacity: 0.6,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(16),
  },
  packageTitle: {
    fontSize: moderateScale(18),
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginBottom: verticalScale(4),
  },
  packageSubtitle: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  packagePrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: verticalScale(16),
  },
  priceText: {
    fontSize: moderateScale(24),
    fontFamily: FONT.bold,
    color: COLORS.primary,
  },
  pricePeriod: {
    fontSize: moderateScale(14),
    color: '#666',
    marginLeft: horizontalScale(4),
  },
  purchaseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    alignItems: 'center',
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: moderateScale(16),
    fontFamily: FONT.bold,
  },
  purchasingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(8),
    gap: horizontalScale(8),
  },
  purchasingText: {
    color: 'white',
    fontSize: moderateScale(16),
    fontFamily: FONT.bold,
  },
  noPackagesContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  noPackagesText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(14),
    color: '#999',
    textAlign: 'center',
  },
});

export default CoursePaywallPage;

