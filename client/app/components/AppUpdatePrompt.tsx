import { useEffect, useRef } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import { ipURL } from '../utils/utils';

const APP_STORE_URL = 'https://apps.apple.com/us/app/coach-academ/id6745173635';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rise.coachacadem';

const parseVersion = (value: string) =>
  value.split('.').map((part) => {
    const match = part.match(/^\d+/);
    return match ? Number(match[0]) : 0;
  });

const isOlderVersion = (installed: string, latest: string) => {
  const current = parseVersion(installed);
  const required = parseVersion(latest);
  const length = Math.max(current.length, required.length);

  for (let index = 0; index < length; index += 1) {
    const left = current[index] ?? 0;
    const right = required[index] ?? 0;
    if (left < right) return true;
    if (left > right) return false;
  }

  return false;
};

const AppUpdatePrompt = () => {
  const hasPrompted = useRef(false);

  useEffect(() => {
    if (__DEV__ || hasPrompted.current) return;

    const installed = Constants.nativeAppVersion;
    if (!installed) return;

    const checkVersion = async () => {
      try {
        const response = await axios.get(`${ipURL}/api/app/version`, { timeout: 8000 });
        const latest = typeof response.data?.version === 'string' ? response.data.version.trim() : '';
        if (!latest || !isOlderVersion(installed, latest) || hasPrompted.current) return;

        hasPrompted.current = true;
        const storeUrl = Platform.OS === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
        Alert.alert(
          'Update available',
          'A new version of Coach Academ is available. Update to get the latest fixes.',
          [
            { text: 'Later', style: 'cancel' },
            {
              text: 'Update',
              onPress: () => {
                Linking.openURL(storeUrl).catch((error) => {
                  console.error('Failed to open the store listing', error);
                });
              },
            },
          ]
        );
      } catch (error) {
        console.error('Failed to check app version', error);
      }
    };

    void checkVersion();
  }, []);

  return null;
};

export default AppUpdatePrompt;
