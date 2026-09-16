import React, { useEffect, useState } from 'react'
import { router, Stack } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { ipURL } from '../../utils/utils'

const CommunityLayout = () => {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const confirmAccess = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          router.replace('/(authenticate)/welcome');
          return;
        }
        const resp = await axios.get(`${ipURL}/api/auth/metadata`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.data?.userType === 'PARENT') {
          router.replace('/(tabs)/home');
          return;
        }
        setAllowed(true);
      } catch {
        router.replace('/(tabs)/home');
      }
    };
    confirmAccess();
  }, []);

  if (!allowed) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[communityId]" options={{ headerShown: false }} />
    </Stack>
  )
}

export default CommunityLayout
