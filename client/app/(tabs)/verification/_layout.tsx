import { View, Text } from 'react-native'
import React from 'react'
import { router, Stack } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const VerificationLayout = () => {
  return (
    <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="[verifySingleSubject]" options={{ headerShown: true, headerTitle:'Subject Verification', headerLeft: () => (
      <Ionicons name="arrow-back" size={24} color="black" onPress={()=>router.back()} style={{ marginLeft: 0 }} />
    ) }} />
</Stack>
  )
}

export default VerificationLayout