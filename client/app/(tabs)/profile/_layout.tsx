import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const ProfileLayout = () => {
  return (
    <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="createSubject"/>
    <Stack.Screen name="editSubject/[editSubjectId]" options={{presentation:'modal'}}/>
    
</Stack>
  )
}

export default ProfileLayout