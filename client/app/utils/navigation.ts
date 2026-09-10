import { Href, router } from 'expo-router';

export const goBack = (fallback: Href = '/(tabs)/home') => {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
};
