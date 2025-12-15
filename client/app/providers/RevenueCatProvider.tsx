import { createContext, useContext, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { CustomerInfo } from 'react-native-purchases';

// Use keys from you RevenueCat API Keys
const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY as string,
  google: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY as string,
};

interface RevenueCatProps {
  plan: number | null;
  isReady: boolean;
  identifyUser: (email: string) => Promise<void>;
  getOfferings: () => Promise<PurchasesOffering | null>;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<CustomerInfo>;
  getMultiStudentCapacity: () => Promise<number | null>;
}

const RevenueCatContext = createContext<RevenueCatProps | null>(null);

// Provide RevenueCat functions to our app
export const RevenueCatProvider = ({ children }: any) => {
  const [isReady, setIsReady] = useState(false);
  const [plan, setPlan] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
       console.log(APIKeys.apple,'api apple key');
      if (Platform.OS === 'android') {
        await Purchases.configure({ apiKey: APIKeys.google });
      } else {
        await Purchases.configure({ apiKey: APIKeys.apple });
      }
      setIsReady(true);

      // Use more logging during debug if want!
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      // Listen for customer updates
      Purchases.addCustomerInfoUpdateListener(async (info) => {
        updateCustomerInformation(info);
      });

      // Get initial customer info
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        updateCustomerInformation(customerInfo);
      } catch (error) {
        console.error('Error fetching initial customer info:', error);
      }
    };
    init();
  }, []);

  // Update user state based on previous purchases
  const updateCustomerInformation = async (customerInfo: CustomerInfo) => {
    const activeEntitlement = customerInfo?.entitlements.active['teacher_capacity'];
    
    if (activeEntitlement !== undefined) {
      // Extract plan number from product identifier or entitlement identifier
      // Assuming product identifiers like "plan_10", "plan_15", "plan_30" or similar
      const productIdentifier = activeEntitlement.productIdentifier;
      
      // Try to extract number from product identifier
      const planMatch = productIdentifier.match(/(\d+)/);
      if (planMatch) {
        const planNumber = parseInt(planMatch[1], 10);
        // Only set if it's one of the valid plans (10, 15, or 30)
        if (planNumber === 10 || planNumber === 15 || planNumber === 30) {
          setPlan(planNumber);
        } else {
          setPlan(null);
        }
      } else {
        // If no number found, check entitlement identifier
        const entitlementIdentifier = activeEntitlement.identifier;
        const entitlementMatch = entitlementIdentifier.match(/(\d+)/);
        if (entitlementMatch) {
          const planNumber = parseInt(entitlementMatch[1], 10);
          if (planNumber === 10 || planNumber === 15 || planNumber === 30) {
            setPlan(planNumber);
          } else {
            setPlan(null);
          }
        } else {
          setPlan(null);
        }
      }
    } else {
      setPlan(null);
    }
  };

  // Identify user by email
  const identifyUser = async (email: string) => {
    try {
      const { customerInfo } = await Purchases.logIn(email);
      updateCustomerInformation(customerInfo);
    } catch (error) {
      console.error('Error identifying user:', error);
      throw error;
    }
  };

  // Get available offerings
  const getOfferings = async (): Promise<PurchasesOffering | null> => {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  };

  // Purchase a package
  const purchasePackage = async (packageToPurchase: PurchasesPackage): Promise<CustomerInfo> => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      updateCustomerInformation(customerInfo);
      return customerInfo;
    } catch (error: any) {
      console.error('Error purchasing package:', error);
      throw error;
    }
  };

  // Get multi-student capacity from RevenueCat entitlement
  const getMultiStudentCapacity = async (): Promise<number | null> => {
    // TODO: Re-enable RevenueCat checks after entitlement verification
    // For testing: return default capacity
    return 10; // Default capacity for testing
    
    // Original RevenueCat check code (commented out for testing):
    // try {
    //   const customerInfo = await Purchases.getCustomerInfo();
    //   const activeEntitlement = customerInfo?.entitlements.active['student_zoom_capacity'];
    //   
    //   if (activeEntitlement !== undefined) {
    //     // Extract capacity number from product identifier (e.g., "zoom_capacity_10" -> 10)
    //     const productIdentifier = activeEntitlement.productIdentifier;
    //     
    //     // Try to extract number from product identifier
    //     const planMatch = productIdentifier.match(/(\d+)/);
    //     if (planMatch) {
    //       const capacity = parseInt(planMatch[1], 10);
    //       // Return the capacity number
    //       return capacity;
    //     }
    //   }
    //   
    //   // For testing: assume zoom_capacity_10 if entitlement exists but can't parse
    //   // Remove this in production
    //   if (customerInfo?.entitlements.active['student_zoom_capacity']) {
    //     return 10; // Default for testing
    //   }
    //   
    //   return null;
    // } catch (error) {
    //   console.error('Error fetching multi-student capacity:', error);
    //   return null;
    // }
  };

  const value = {
    plan,
    isReady,
    identifyUser,
    getOfferings,
    purchasePackage,
    getMultiStudentCapacity,
  };

  // Return empty fragment if provider is not ready (Purchase not yet initialised)
  if (!isReady) return <View></View>;

  return (
  <RevenueCatContext.Provider value={value}>
    {children}
  </RevenueCatContext.Provider>
  )
};

// Export context for easy usage
export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  console.log(context, 'context');
  
  return useContext(RevenueCatContext) as RevenueCatProps;
};