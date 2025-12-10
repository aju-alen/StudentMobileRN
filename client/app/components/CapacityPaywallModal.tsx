import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useRevenueCat } from '../providers/RevenueCatProvider';
import { axiosWithAuth } from '../utils/customAxios';
import { ipURL } from '../utils/utils';
import { COLORS } from '../../constants/theme';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { FONT } from '../../constants';

interface CapacityPaywallModalProps {
  visible: boolean;
  onClose: () => void;
  currentCapacity: number;
  onPurchaseSuccess: () => void;
  userEmail: string;
}

// Configure product identifiers in RevenueCat dashboard
// Expected product identifiers should contain "10", "15", or "30" in their identifier
// Entitlement identifier: "teacher_capacity" (already configured in RevenueCatProvider)
// Example product identifiers: "capacity_10", "capacity_15", "capacity_30" or similar

const CapacityPaywallModal: React.FC<CapacityPaywallModalProps> = ({
  visible,
  onClose,
  currentCapacity,
  onPurchaseSuccess,
  userEmail,
}) => {
  const revenueCatContext = useRevenueCat();
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  if (!revenueCatContext) {
    return null;
  }

  const { identifyUser, getOfferings, purchasePackage, isReady } = revenueCatContext;

  useEffect(() => {
    if (visible && isReady) {
      fetchOfferings();
    }
  }, [visible, isReady]);

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
              onPurchaseSuccess();
              onClose();
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

  const availablePlans = getAvailablePlans();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Increase Organization Capacity</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1A2B4B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

                  return (
                    <View key={pkg.identifier} style={styles.planCard}>
                      <View style={styles.planHeader}>
                        <View>
                          <Text style={styles.planCapacity}>
                            +{capacity} Members
                          </Text>
                          <Text style={styles.planTotalCapacity}>
                            Total: {totalCapacity} members
                          </Text>
                        </View>
                        {product.priceString && (
                          <Text style={styles.planPrice}>
                            {product.priceString}
                          </Text>
                        )}
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

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Subscriptions are managed through your App Store account.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    width: '90%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A2B4B',
    flex: 1,
  },
  closeButton: {
    padding: moderateScale(5),
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
    marginBottom: verticalScale(10),
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
  planPrice: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: COLORS.primary,
  },
  planDescription: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#64748B',
    marginBottom: verticalScale(15),
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
  footer: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(11),
    color: '#64748B',
    textAlign: 'center',
  },
});

export default CapacityPaywallModal;
