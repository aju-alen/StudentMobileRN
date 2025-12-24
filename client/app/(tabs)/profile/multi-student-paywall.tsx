import React, { useState, useEffect } from 'react';
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
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useRevenueCat } from '../../providers/RevenueCatProvider';
import { COLORS } from '../../../constants/theme';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { FONT } from '../../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosWithAuth } from '../../utils/customAxios';
import { ipURL } from '../../utils/utils';

// Configure product identifiers in RevenueCat dashboard
// Entitlement identifier: "student_zoom_capacity"
// Product identifiers: "zoom_capacity_10", "zoom_capacity_15", etc.

const MultiStudentPaywallPage = () => {
  const params = useLocalSearchParams();
  const userEmail = (params.userEmail as string) || '';
  
  const revenueCatContext = useRevenueCat();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  if (!revenueCatContext) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Multi-Student Subscription</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Initializing subscription service...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { identifyUser, getStudentZoomCapacityOffering, purchasePackage, getMultiStudentCapacity, isReady } = revenueCatContext;

  // Check if user already has an active subscription and redirect if they do
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!isReady) return;

      try {
        // Identify user first to ensure we have latest subscription status
        if (userEmail) {
          await identifyUser(userEmail);
        }

        // Check if user already has an active subscription
        const capacity = await getMultiStudentCapacity();
        
        if (capacity && capacity > 0) {
          console.log('User already has active subscription with capacity:', capacity);
          // User already has subscription, redirect back
          router.back();
        }
      } catch (error) {
        console.error('Error checking existing subscription:', error);
        // Continue to show paywall if check fails
      }
    };

    checkExistingSubscription();
  }, [isReady, userEmail]);

  useEffect(() => {
    if (isReady) {
      fetchOfferings();
    }
  }, [isReady]);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Identify user by email before fetching offerings
      if (userEmail) {
        await identifyUser(userEmail);
      }
      
      // Use the provider's method to get student_zoom_capacity offering
      const multiStudentOffering = await getStudentZoomCapacityOffering();
      
      console.log('=== Multi-Student Paywall Offerings ===');
      if (multiStudentOffering) {
        console.log('Offering identifier:', multiStudentOffering.identifier);
        console.log('Available packages count:', multiStudentOffering.availablePackages?.length || 0);
        console.log('Packages:', multiStudentOffering.availablePackages?.map(p => ({
          identifier: p.identifier,
          productIdentifier: p.product.identifier,
          packageType: p.packageType,
          price: p.product.priceString
        })));
      } else {
        console.log('No student_zoom_capacity offering found');
      }
      
      setOfferings(multiStudentOffering);
    } catch (err: any) {
      console.error('Error fetching offerings:', err);
      setError('Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractCapacity = (packageIdentifier: string, productIdentifier: string): number | null => {
    // Extract number from product identifier (e.g., "zoom_capacity_10" -> 10)
    // Product identifier is where the actual product ID like "zoom_capacity_10" is stored
    const identifierToCheck = productIdentifier || packageIdentifier;
    
    // Try to match zoom_capacity_XX pattern first
    const zoomCapacityMatch = identifierToCheck.match(/zoom_capacity[_-]?(\d+)/i);
    if (zoomCapacityMatch) {
      return parseInt(zoomCapacityMatch[1], 10);
    }
    
    // Fallback: extract any number
    const match = identifierToCheck.match(/(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasing(packageToPurchase.identifier);
      setError('');

      const customerInfo = await purchasePackage(packageToPurchase);
      
      Alert.alert(
        'Success!',
        'You can now create multi-student courses!',
        [
          {
            text: 'OK',
            onPress: async () => {
              // Navigate back and then to course creation
              router.back();
              
              // Small delay to ensure navigation completes
              setTimeout(async () => {
                try {
                  const userverificationCheck = await axiosWithAuth.get(`${ipURL}/api/auth/verification-check`);
                  const { id } = userverificationCheck.data.userDetail;
                  const capacity = await revenueCatContext.getMultiStudentCapacity();
                  
                  if (capacity && capacity > 0) {
                    router.push(`/(tabs)/profile/createSubject/${id}?courseType=MULTI_STUDENT&maxCapacity=${capacity}`);
                  }
                } catch (error) {
                  console.error('Error navigating to course creation:', error);
                }
              }, 300);
            },
          },
        ]
      );
    } catch (err: any) {
      console.error('Purchase error:', err);
      
      // Handle user cancellation
      if (err.userCancelled) {
        setError('');
        return;
      }

      // Handle other errors
      const errorMessage = err.message || 'Purchase failed. Please try again.';
      setError(errorMessage);
      Alert.alert('Purchase Failed', errorMessage);
    } finally {
      setPurchasing(null);
    }
  };

  const getAvailablePackages = (): Array<{ package: PurchasesPackage; capacity: number }> => {
    if (!offerings) {
      console.log('getAvailablePackages: No offerings available');
      return [];
    }

    const packages: Array<{ package: PurchasesPackage; capacity: number }> = [];
    
    const availablePackages = offerings.availablePackages || [];
    
    console.log('getAvailablePackages: Processing', availablePackages.length, 'packages from offering:', offerings.identifier);
    
    // Display ALL packages from the student_zoom_capacity offering
    for (const pkg of availablePackages) {
      // Extract capacity from product.identifier (where "zoom_capacity_10" is stored)
      const capacity = extractCapacity(pkg.identifier, pkg.product.identifier);
      
      console.log('Package:', {
        identifier: pkg.identifier,
        productIdentifier: pkg.product.identifier,
        extractedCapacity: capacity
      });
      
      if (capacity !== null) {
        packages.push({ package: pkg, capacity });
        console.log('✓ Added package with capacity:', capacity);
      } else {
        console.log('✗ Skipped package - could not extract capacity');
      }
    }
    
    console.log('Final packages count:', packages.length);
    
    // Sort by capacity
    return packages.sort((a, b) => a.capacity - b.capacity);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Multi-Student Subscription</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Unlock the ability to create multi-student courses and host classes for multiple students at once.
        </Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading plans...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={32} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchOfferings}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.packagesContainer}>
            {getAvailablePackages().map(({ package: pkg, capacity }) => (
              <TouchableOpacity
                key={pkg.identifier}
                style={[
                  styles.packageCard,
                  purchasing === pkg.identifier && styles.packageCardDisabled,
                ]}
                onPress={() => handlePurchase(pkg)}
                disabled={!!purchasing}
              >
                <View style={styles.packageHeader}>
                  <View>
                    <Text style={styles.packageTitle}>
                      {capacity} Student Capacity
                    </Text>
                    <Text style={styles.packageSubtitle}>
                      Host up to {capacity} students per course
                    </Text>
                  </View>
                  <Ionicons name="people" size={32} color={COLORS.primary} />
                </View>
                
                <View style={styles.packagePrice}>
                  <Text style={styles.priceText}>
                    {pkg.product.priceString}
                  </Text>
                  {pkg.packageType === 'MONTHLY' && (
                    <Text style={styles.pricePeriod}>/month</Text>
                  )}
                  {pkg.packageType === 'ANNUAL' && (
                    <Text style={styles.pricePeriod}>/year</Text>
                  )}
                </View>

                {purchasing === pkg.identifier ? (
                  <View style={styles.purchasingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={styles.purchasingText}>Processing...</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.purchaseButton}
                    onPress={() => handlePurchase(pkg)}
                  >
                    <Text style={styles.purchaseButtonText}>Subscribe</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}

            {getAvailablePackages().length === 0 && (
              <View style={styles.noPackagesContainer}>
                <Ionicons name="information-circle" size={32} color="#999" />
                <Text style={styles.noPackagesText}>
                  No subscription plans available at the moment.
                </Text>
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

export default MultiStudentPaywallPage;
