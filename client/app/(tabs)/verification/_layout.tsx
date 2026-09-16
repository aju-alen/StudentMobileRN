import React, { useEffect, useState } from 'react'
import { router, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { ipURL } from '../../utils/utils'

const VerificationLayout = () => {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const confirmAdmin = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          router.replace('/(authenticate)/welcome');
          return;
        }
        const resp = await axios.get(`${ipURL}/api/auth/metadata`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.data?.userType !== 'ADMIN') {
          router.replace('/(tabs)/home');
          return;
        }
        setAllowed(true);
      } catch {
        router.replace('/(tabs)/home');
      }
    };
    confirmAdmin();
  }, []);

  if (!allowed) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="pending" options={{ headerShown: true, headerTitle: 'Pending verification', headerBackTitle: 'Admin' }} />
      <Stack.Screen name="teachers" options={{ headerShown: true, headerTitle: 'Teachers', headerBackTitle: 'Admin' }} />
      <Stack.Screen name="organizations" options={{ headerShown: true, headerTitle: 'Organizations', headerBackTitle: 'Admin' }} />
      <Stack.Screen name="parents" options={{ headerShown: true, headerTitle: 'Parents', headerBackTitle: 'Admin' }} />
      <Stack.Screen name="purchases" options={{ headerShown: true, headerTitle: 'Purchases', headerBackTitle: 'Admin' }} />
      <Stack.Screen name="[verifySingleSubject]" options={{ headerShown: true, headerTitle:'Subject Verification', headerLeft: () => (
        <Ionicons name="arrow-back" size={24} color="black" onPress={()=>router.back()} style={{ marginLeft: 0 }} />
      ) }} />
    </Stack>
  )
}

export default VerificationLayout
