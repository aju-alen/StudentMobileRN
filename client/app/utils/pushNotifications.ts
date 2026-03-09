import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

/** Platforms that support push. Configure per project. */
const ENABLED_PLATFORMS: ('ios' | 'android')[] = ['ios'];

export const isPushSupported = () =>
  ENABLED_PLATFORMS.includes(Platform.OS as 'ios' | 'android');

export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  if (!ENABLED_PLATFORMS.includes(Platform.OS as 'ios' | 'android')) return null;
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
  if (!projectId) return null;

  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  return data ?? null;
};
