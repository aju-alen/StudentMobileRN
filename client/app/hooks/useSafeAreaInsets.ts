import { useSafeAreaInsets as useRNSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { verticalScale, horizontalScale } from '../utils/metrics';


 const useSafeAreaInsets = () => {
  const insets = useRNSafeAreaInsets();

  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    // Convenience getters for individual insets
    getTop: () => insets.top,
    getBottom: () => insets.bottom,
    getLeft: () => insets.left,
    getRight: () => insets.right,
    // Helper to get all insets as an object (useful for spread operations)
    all: {
      top: insets.top,
      bottom: insets.bottom,
      left: insets.left,
      right: insets.right,
    },
  };
};


export const addBasePaddingToInset = (basePadding: number, insetBottom: number): number => {
  return verticalScale(basePadding) + insetBottom;
};


export const addBasePaddingToTopInset = (basePadding: number, insetTop: number): number => {
  return verticalScale(basePadding) + insetTop;
};


export const addBasePaddingToHorizontalInset = (basePadding: number, insetHorizontal: number): number => {
  return horizontalScale(basePadding) + insetHorizontal;
};

export default useSafeAreaInsets;