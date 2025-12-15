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
import Purchases, { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useRevenueCat } from '../providers/RevenueCatProvider';
import { COLORS } from '../../constants/theme';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { FONT } from '../../constants';

interface MultiStudentPaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess: () => void;
  userEmail: string;
}

// Configure product identifiers in RevenueCat dashboard
// Entitlement identifier: "student_zoom_capacity"
// Product identifiers: "zoom_capacity_10", "zoom_capacity_15", etc.

const MultiStudentPaywallModal: React.FC<MultiStudentPaywallModalProps> = ({
  visible,
  onClose,
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
      
      const allOfferings = await Purchases.getOfferings();
      // Get the specific offering for multi-student courses
      const multiStudentOffering = allOfferings.all['student_zoom_capacity'] || allOfferings.current;
      setOfferings(multiStudentOffering);
    } catch (err: any) {
      console.error('Error fetching offerings:', err);
      setError('Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const extractCapacity = (packageIdentifier: string): number | null => {
    // Extract number from product identifier (e.g., "zoom_capacity_10" -> 10)
    const match = packageIdentifier.match(/(\d+)/);
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

  const getAvailablePackages = (): Array<{ package: PurchasesPackage; capacity: number }> => {
    if (!offerings) return [];

    const packages: Array<{ package: PurchasesPackage; capacity: number }> = [];
    
    const availablePackages = offerings.availablePackages || [];
    
    for (const pkg of availablePackages) {
      const capacity = extractCapacity(pkg.identifier);
      if (capacity !== null) {
        packages.push({ package: pkg, capacity });
      }
    }
    
    // Sort by capacity
    return packages.sort((a, b) => a.capacity - b.capacity);
  };

  const formatPrice = (price: number, currencyCode: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
    }).format(price);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Multi-Student Course Subscription</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={COLORS.primary} />
            </TouchableOpacity>
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    maxHeight: '90%',
    paddingBottom: verticalScale(20),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: moderateScale(20),
    fontFamily: FONT.bold,
    color: COLORS.primary,
    flex: 1,
  },
  closeButton: {
    padding: moderateScale(4),
  },
  content: {
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
    backgroundColor: '#fafafa',
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

export default MultiStudentPaywallModal;



