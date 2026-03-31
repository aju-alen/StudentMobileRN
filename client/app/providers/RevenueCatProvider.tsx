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
  multiStudentCapacity: number | null;
  hasSinglePackage: boolean;
  hasMultiPackage: boolean;
  isReady: boolean;
  identifyUser: (email: string) => Promise<void>;
  getOfferings: () => Promise<PurchasesOffering | null>;
  getTeacherCapacityOffering: () => Promise<PurchasesOffering | null>;
  getTeacherCapacityPackages: () => Promise<PurchasesPackage[]>;
  getStudentZoomCapacityOffering: () => Promise<PurchasesOffering | null>;
  getSinglePackageOffering: () => Promise<PurchasesOffering | null>;
  getMultiPackageOffering: () => Promise<PurchasesOffering | null>;
  purchasePackage: (packageToPurchase: PurchasesPackage) => Promise<CustomerInfo>;
  getMultiStudentCapacity: () => Promise<number | null>;
  checkSinglePackageEntitlement: () => Promise<boolean>;
  checkMultiPackageEntitlement: () => Promise<boolean>;
}

const RevenueCatContext = createContext<RevenueCatProps | null>(null);

// Provide RevenueCat functions to our app
 const RevenueCatProvider = ({ children }: any) => {
  const [isReady, setIsReady] = useState(false);
  const [plan, setPlan] = useState<number | null>(null);
  const [multiStudentCapacity, setMultiStudentCapacity] = useState<number | null>(null);
  const [hasSinglePackage, setHasSinglePackage] = useState(false);
  const [hasMultiPackage, setHasMultiPackage] = useState(false);

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
    // Check teacher_capacity entitlement
    const teacherEntitlement = customerInfo?.entitlements.active['teacher_capacity'];
    
    if (teacherEntitlement !== undefined) {
      // Extract plan number from product identifier or entitlement identifier
      // Assuming product identifiers like "plan_10", "plan_15", "plan_30" or similar
      const productIdentifier = teacherEntitlement.productIdentifier;
      
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
        const entitlementIdentifier = teacherEntitlement.identifier;
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

    // Check student_zoom_capacity entitlement
    const studentEntitlement = customerInfo?.entitlements.active['student_zoom_capacity'];
    
    if (studentEntitlement !== undefined) {
      // Extract capacity number from product identifier (e.g., "zoom_capacity_10" -> 10)
      const productIdentifier = studentEntitlement.productIdentifier;
      
      // Try to extract number from product identifier
      const capacityMatch = productIdentifier.match(/(\d+)/);
      if (capacityMatch) {
        const capacity = parseInt(capacityMatch[1], 10);
        setMultiStudentCapacity(capacity);
      } else {
        // If no number found, check entitlement identifier
        const entitlementIdentifier = studentEntitlement.identifier;
        const entitlementMatch = entitlementIdentifier.match(/(\d+)/);
        if (entitlementMatch) {
          const capacity = parseInt(entitlementMatch[1], 10);
          setMultiStudentCapacity(capacity);
        } else {
          setMultiStudentCapacity(null);
        }
      }
    } else {
      setMultiStudentCapacity(null);
    }

    // Check single course package entitlement
    const singlePackageEntitlement = customerInfo?.entitlements.active['single_course_package'];
    setHasSinglePackage(singlePackageEntitlement !== undefined);

    // Check multi course package entitlement
    const multiPackageEntitlement = customerInfo?.entitlements.active['multi_course_package'];
    setHasMultiPackage(multiPackageEntitlement !== undefined);
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

  // Get available offerings (returns current offering)
  const getOfferings = async (): Promise<PurchasesOffering | null> => {
    try {
      const offerings = await Purchases.getOfferings();
      console.log(offerings, 'offerings in revenu cat provider');
      return offerings.current;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  };

  // Get student_zoom_capacity offering specifically
  const getTeacherCapacityOffering = async (): Promise<PurchasesOffering | null> => {
    try {
      const offerings = await Purchases.getOfferings();
      const offering = offerings.all['teacher_capacity'];
      return offering ?? offerings.current;
    } catch (error) {
      console.error('Error fetching teacher_capacity offering:', error);
      return null;
    }
  };

  // Get student_zoom_capacity offering specifically
  const getTeacherCapacityPackages = async (): Promise<PurchasesPackage[]> => {
    try {
      const offerings = await Purchases.getOfferings();
      const teacherCapacityOffering = offerings.all['teacher_capacity'];
      if (!teacherCapacityOffering) {
        return [];
      }

      return teacherCapacityOffering.availablePackages || [];
    } catch (error) {
      console.error('Error fetching teacher capacity packages:', error);
      return [];
    }
  };

  // Get student_zoom_capacity offering specifically
  const getStudentZoomCapacityOffering = async (): Promise<PurchasesOffering | null> => {
    try {
      const offerings = await Purchases.getOfferings();
      console.log('All offerings keys:', Object.keys(offerings.all));
      console.log('Looking for student_zoom_capacity offering');
      
      // Get the specific offering for student_zoom_capacity
      const studentZoomOffering = offerings.all['student_zoom_capacity'];
      
      if (studentZoomOffering) {
        console.log('Found student_zoom_capacity offering:', studentZoomOffering.identifier);
        console.log('Packages in offering:', studentZoomOffering.availablePackages?.length || 0);
      } else {
        console.log('student_zoom_capacity offering not found in offerings.all');
        // Fallback to current offering if specific one not found
        return offerings.current;
      }
      
      return studentZoomOffering;
    } catch (error) {
      console.error('Error fetching student_zoom_capacity offering:', error);
      return null;
    }
  };

  const getSinglePackageOffering = async (): Promise<PurchasesOffering | null> => {
    try {
      const offerings = await Purchases.getOfferings();
      const offering = offerings.all['single_course_package'];
      return offering ?? offerings.current;
    } catch (error) {
      console.error('Error fetching single_course_package offering:', error);
      return null;
    }
  };

  const getMultiPackageOffering = async (): Promise<PurchasesOffering | null> => {
    try {
      const offerings = await Purchases.getOfferings();
      const offering = offerings.all['multi_course_package'];
      return offering ?? offerings.current;
    } catch (error) {
      console.error('Error fetching multi_course_package offering:', error);
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
    try {
      // First check if we have the capacity in state (from updateCustomerInformation)
      if (multiStudentCapacity !== null) {
        return multiStudentCapacity;
      }

      // If not in state, fetch from RevenueCat
      const customerInfo = await Purchases.getCustomerInfo();
      const activeEntitlement = customerInfo?.entitlements.active['student_zoom_capacity'];
      
      if (activeEntitlement !== undefined) {
        // Extract capacity number from product identifier (e.g., "zoom_capacity_10" -> 10)
        const productIdentifier = activeEntitlement.productIdentifier;
        
        // Try to extract number from product identifier
        const capacityMatch = productIdentifier.match(/(\d+)/);
        if (capacityMatch) {
          const capacity = parseInt(capacityMatch[1], 10);
          setMultiStudentCapacity(capacity);
          return capacity;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching multi-student capacity:', error);
      return null;
    }
  };

  const checkSinglePackageEntitlement = async (): Promise<boolean> => {
    try {
      if (hasSinglePackage) return true;
      const customerInfo = await Purchases.getCustomerInfo();
      const entitled = customerInfo?.entitlements.active['single_course_package'] !== undefined;
      setHasSinglePackage(entitled);
      return entitled;
    } catch (error) {
      console.error('Error checking single_course_package entitlement:', error);
      return false;
    }
  };

  const checkMultiPackageEntitlement = async (): Promise<boolean> => {
    try {
      if (hasMultiPackage) return true;
      const customerInfo = await Purchases.getCustomerInfo();
      const entitled = customerInfo?.entitlements.active['multi_course_package'] !== undefined;
      setHasMultiPackage(entitled);
      return entitled;
    } catch (error) {
      console.error('Error checking multi_course_package entitlement:', error);
      return false;
    }
  };

  const value = {
    plan,
    multiStudentCapacity,
    hasSinglePackage,
    hasMultiPackage,
    isReady,
    identifyUser,
    getOfferings,
    getTeacherCapacityOffering,
    getTeacherCapacityPackages,
    getStudentZoomCapacityOffering,
    getSinglePackageOffering,
    getMultiPackageOffering,
    purchasePackage,
    getMultiStudentCapacity,
    checkSinglePackageEntitlement,
    checkMultiPackageEntitlement,
  };

  // Return empty fragment if provider is not ready (Purchase not yet initialised)
  if (!isReady) return <View></View>;

  return (
  <RevenueCatContext.Provider value={value}>
    {children}
  </RevenueCatContext.Provider>
  )
};

export default RevenueCatProvider;
// Export context for easy usage
export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  console.log(context, 'context');
  
  return useContext(RevenueCatContext) as RevenueCatProps;
};