import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useRevenueCat } from '../../../providers/RevenueCatProvider';
import { axiosWithAuth } from '../../../utils/customAxios';
import { ipURL } from '../../../utils/utils';
import { COLORS } from '../../../../constants/theme';
import { horizontalScale, moderateScale, verticalScale } from '../../../utils/metrics';
import { FONT } from '../../../../constants';
import StatusBarComponent from '../../../components/StatusBarComponent';

const EULA_PDF_URL = `https://coachacademic.s3.ap-southeast-1.amazonaws.com/EULA+/COACHACADEM_TOU_(EULA).pdf`;
const PRIVACY_POLICY_URL = `https://coachacademic.s3.ap-southeast-1.amazonaws.com/EULA+/Privacy+Policy+for+CoachAcadem1.pdf`;

const CapacitySubscriptionPage = () => {
  const params = useLocalSearchParams();
  const currentCapacity = params.currentCapacity ? parseInt(params.currentCapacity as string, 10) : 3;
  const userEmail = (params.userEmail as string) || '';

  const revenueCatContext = useRevenueCat();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  if (!revenueCatContext) {
    return (
      <View style={styles.container}>
        <StatusBarComponent />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1A2B4B" />
          </TouchableOpacity>
          <Text style={styles.title}>Increase Capacity</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>RevenueCat not initialized</Text>
        </View>
      </View>
    );
  }

  const { identifyUser, getOfferings, purchasePackage, isReady } = revenueCatContext;

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
      
      const currentOffering = await getOfferings();
      setOfferings(currentOffering);
    } catch (err: any) {
      console.error('Error fetching offerings:', err);
      setError('Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractPlanCapacity = (packageIdentifier: string): number | null => {
    // Extract number from product identifier (e.g., "capacity_10" -> 10)
    const match = packageIdentifier.match(/(\d+)/);
    if (match) {
      const capacity = parseInt(match[1], 10);
      if (capacity === 10 || capacity === 15 || capacity === 30) {
        return capacity;
      }
    }
    return null;
  };

  const getSubscriptionPeriod = (pkg: PurchasesPackage): string => {
    try {
      // Try to get subscription period from product
      // Note: subscriptionPeriod is available on Android, may not be on iOS
      console.log("pkg", pkg);
      const product = pkg.product as any;
      if (product.subscriptionPeriod) {
        const period = product.subscriptionPeriod;
        // Parse ISO 8601 duration (e.g., "P1M" = 1 month, "P1Y" = 1 year)
        if (period.includes('M')) {
          const months = parseInt(period.replace('P', '').replace('M', ''), 10);
          if (months === 1) return '1 month';
          if (months === 3) return '3 months';
          if (months === 6) return '6 months';
          if (months === 12) return '1 year';
          return `${months} months`;
        }
        if (period.includes('Y')) {
          const years = parseInt(period.replace('P', '').replace('Y', ''), 10);
          return years === 1 ? '1 year' : `${years} years`;
        }
        if (period.includes('W')) {
          const weeks = parseInt(period.replace('P', '').replace('W', ''), 10);
          return weeks === 1 ? '1 week' : `${weeks} weeks`;
        }
        if (period.includes('D')) {
          const days = parseInt(period.replace('P', '').replace('D', ''), 10);
          return days === 1 ? '1 day' : `${days} days`;
        }
      }
    } catch (err) {
      console.error('Error parsing subscription period:', err);
    }
    
    // Fallback: try to infer from package identifier
    const identifier = pkg.identifier.toLowerCase();
    if (identifier.includes('annual') || identifier.includes('year')) return '1 year';
    if (identifier.includes('monthly') || identifier.includes('month')) return '1 month';
    if (identifier.includes('weekly') || identifier.includes('week')) return '1 week';
    
    // Default fallback
    return 'Subscription';
  };

  const calculatePricePerUnit = (price: string, capacity: number, period: string): string => {
    try {
      // Extract numeric value from price string (e.g., "$9.99" -> 9.99)
      const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
      if (isNaN(numericPrice) || capacity === 0) return 'N/A';
      
      const pricePerMember = numericPrice / capacity;
      
      // Parse period to get number of months
      let months = 1;
      if (period.includes('year')) months = 12;
      else if (period.includes('month')) {
        const match = period.match(/(\d+)/);
        if (match) months = parseInt(match[1], 10);
      }
      
      const pricePerMemberPerMonth = pricePerMember / months;
      
      return `$${pricePerMemberPerMonth.toFixed(2)}/member/month`;
    } catch (err) {
      return 'N/A';
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    try {
      setPurchasing(packageToPurchase.identifier);
      setError('');

      const customerInfo = await purchasePackage(packageToPurchase);
      
      // Extract plan capacity from product identifier (e.g., "capacity_10")
      const planCapacity = extractPlanCapacity(packageToPurchase.product.identifier);
      
      if (!planCapacity) {
        throw new Error('Could not determine plan capacity from package identifier');
      }

      // Calculate new capacity (3 free + purchased capacity)
      const newCapacity = 3 + planCapacity;

      // Update organization capacity in database
      await axiosWithAuth.put(`${ipURL}/api/auth/organization/capacity`, {
        newCapacity,
      });

      Alert.alert(
        'Success!',
        `Your organization capacity has been increased to ${newCapacity} members.`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.back();
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

  const getAvailablePlans = (): Array<{ package: PurchasesPackage; capacity: number }> => {
    if (!offerings) return [];

    const plans: Array<{ package: PurchasesPackage; capacity: number }> = [];
    
    // Check available packages
    const availablePackages = offerings.availablePackages || [];
    
    for (const pkg of availablePackages) {
      // Use product.identifier instead of package.identifier
      // Product identifier contains the actual product name (e.g., "capacity_10")
      const capacity = extractPlanCapacity(pkg.product.identifier);
      if (capacity) {
        plans.push({ package: pkg, capacity });
      }
    }

    // Sort by capacity (10, 15, 30)
    return plans.sort((a, b) => a.capacity - b.capacity);
  };

  const handleOpenEULA = async () => {
    try {
      const canOpen = await Linking.canOpenURL(EULA_PDF_URL);
      if (canOpen) {
        await Linking.openURL(EULA_PDF_URL);
      } else {
        Alert.alert('Error', 'Unable to open Terms of Use');
      }
    } catch (err) {
      console.error('Error opening EULA:', err);
      Alert.alert('Error', 'Unable to open Terms of Use');
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      const canOpen = await Linking.canOpenURL(PRIVACY_POLICY_URL);
      if (canOpen) {
        await Linking.openURL(PRIVACY_POLICY_URL);
      } else {
        Alert.alert('Error', 'Unable to open Privacy Policy');
      }
    } catch (err) {
      console.error('Error opening Privacy Policy:', err);
      Alert.alert('Error', 'Unable to open Privacy Policy');
    }
  };

  const availablePlans = getAvailablePlans();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBarComponent />


      <View style={styles.content}>
        <View style={styles.currentCapacitySection}>
          <Text style={styles.currentCapacityLabel}>Current Capacity</Text>
          <Text style={styles.currentCapacityValue}>{currentCapacity} members</Text>
          <Text style={styles.freeCapacityNote}>3 members are free</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading plans...</Text>
          </View>
        ) : error && !loading ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#DC2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchOfferings}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : availablePlans.length === 0 ? (
          <View style={styles.noPlansContainer}>
            <Ionicons name="information-circle" size={48} color="#64748B" />
            <Text style={styles.noPlansText}>
              No subscription plans available at the moment.
            </Text>
            <Text style={styles.noPlansSubtext}>
              Please check back later or contact support.
            </Text>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            <Text style={styles.plansTitle}>Available Plans</Text>
            {availablePlans.map(({ package: pkg, capacity }) => {
              const totalCapacity = 3 + capacity;
              const isPurchasing = purchasing === pkg.identifier;
              const product = pkg.product;
              console.log("product", product);
              const subscriptionPeriod = getSubscriptionPeriod(pkg);
              const priceString = product.priceString || 'N/A';
              const pricePerUnit = calculatePricePerUnit(priceString, capacity, subscriptionPeriod);

              return (
                <View key={pkg.identifier} style={styles.planCard}>
                  <View style={styles.planHeader}>
                    <View style={styles.planInfo}>
                      <Text style={styles.planCapacity}>
                        +{capacity} Members
                      </Text>
                      <Text style={styles.planTotalCapacity}>
                        Total: {totalCapacity} members
                      </Text>
                    </View>
                    {product.priceString && (
                      <View style={styles.priceContainer}>
                        <Text style={styles.planPrice}>
                          {product.priceString}
                        </Text>
                        {subscriptionPeriod && (
                          <Text style={styles.subscriptionPeriod}>
                            per {subscriptionPeriod}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Subscription Details */}
                  <View style={styles.subscriptionDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons name="document-text-outline" size={16} color="#64748B" />
                      <Text style={styles.detailLabel}>Subscription Title:</Text>
                      <Text style={styles.detailValue}>
                        {product.title || 'Organization Capacity'}
                      </Text>
                    </View>
                    
                    {subscriptionPeriod && (
                      <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color="#64748B" />
                        <Text style={styles.detailLabel}>Subscription Length:</Text>
                        <Text style={styles.detailValue}>{subscriptionPeriod}</Text>
                      </View>
                    )}

                    <View style={styles.detailRow}>
                      <Ionicons name="cash-outline" size={16} color="#64748B" />
                      <Text style={styles.detailLabel}>Price:</Text>
                      <Text style={styles.detailValue}>{product.priceString}</Text>
                    </View>

                  
                  </View>

                  {product.description && (
                    <Text style={styles.planDescription}>
                      {product.description}
                    </Text>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.purchaseButton,
                      isPurchasing && styles.purchaseButtonDisabled,
                    ]}
                    onPress={() => handlePurchase(pkg)}
                    disabled={isPurchasing}
                  >
                    {isPurchasing ? (
                      <>
                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
                          style={styles.buttonLoader}
                        />
                        <Text style={styles.purchaseButtonText}>
                          Processing...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons
                          name="card-outline"
                          size={20}
                          color="#FFFFFF"
                        />
                        <Text style={styles.purchaseButtonText}>
                          Purchase
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Legal Links Section */}
        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>Legal Information</Text>
          
          <TouchableOpacity 
            style={styles.legalLink}
            onPress={handleOpenEULA}
          >
            <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
            <Text style={styles.legalLinkText}>Terms of Use (EULA)</Text>
            <Ionicons name="open-outline" size={16} color="#64748B" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.legalLink}
            onPress={handleOpenPrivacyPolicy}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} />
            <Text style={styles.legalLinkText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Subscriptions are managed through your App Store account and will auto-renew unless cancelled.
          </Text>
        </View>
      </View>
    </ScrollView>
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
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
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
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A2B4B',
    flex: 1,
  },
  content: {
    padding: moderateScale(20),
  },
  currentCapacitySection: {
    backgroundColor: '#F1F5F9',
    padding: moderateScale(20),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(20),
    alignItems: 'center',
  },
  currentCapacityLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginBottom: verticalScale(5),
  },
  currentCapacityValue: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(28),
    color: '#1A2B4B',
    marginBottom: verticalScale(5),
  },
  freeCapacityNote: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#64748B',
  },
  loadingContainer: {
    padding: verticalScale(40),
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginTop: verticalScale(10),
  },
  errorContainer: {
    padding: moderateScale(20),
    backgroundColor: '#FEE2E2',
    borderRadius: moderateScale(12),
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#DC2626',
    marginTop: verticalScale(10),
    textAlign: 'center',
  },
  retryButton: {
    marginTop: verticalScale(15),
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    backgroundColor: '#DC2626',
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
  noPlansContainer: {
    padding: verticalScale(40),
    alignItems: 'center',
  },
  noPlansText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#1A2B4B',
    marginTop: verticalScale(15),
    textAlign: 'center',
  },
  noPlansSubtext: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginTop: verticalScale(10),
    textAlign: 'center',
  },
  plansContainer: {
    marginBottom: verticalScale(20),
  },
  plansTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A2B4B',
    marginBottom: verticalScale(15),
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: moderateScale(12),
    padding: moderateScale(20),
    marginBottom: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(15),
  },
  planInfo: {
    flex: 1,
  },
  planCapacity: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A2B4B',
    marginBottom: verticalScale(5),
  },
  planTotalCapacity: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#64748B',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: COLORS.primary,
    marginBottom: verticalScale(2),
  },
  subscriptionPeriod: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#64748B',
  },
  subscriptionDetails: {
    backgroundColor: '#F8F9FA',
    padding: moderateScale(15),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(15),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  detailLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: '#64748B',
    marginLeft: horizontalScale(8),
    marginRight: horizontalScale(8),
    minWidth: horizontalScale(140),
  },
  detailValue: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#1A2B4B',
    flex: 1,
  },
  planDescription: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#64748B',
    marginBottom: verticalScale(15),
    lineHeight: moderateScale(18),
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: moderateScale(15),
    borderRadius: moderateScale(8),
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  buttonLoader: {
    marginRight: horizontalScale(8),
  },
  purchaseButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    marginLeft: horizontalScale(8),
  },
  legalSection: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    padding: moderateScale(20),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  legalTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A2B4B',
    marginBottom: verticalScale(15),
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  legalLinkText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#1A2B4B',
    marginLeft: horizontalScale(12),
    flex: 1,
  },
  footer: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: verticalScale(10),
  },
  footerText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(11),
    color: '#64748B',
    textAlign: 'center',
    lineHeight: moderateScale(16),
  },
});

export default CapacitySubscriptionPage;
