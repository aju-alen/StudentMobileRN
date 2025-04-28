import { View, Text } from 'react-native'
import React from 'react'
import { Stack, router } from 'expo-router'


const ProfileLayout = () => {
  return (
    <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="editSubject/[editSubjectId]" options={{presentation:'modal'}}/>
    <Stack.Screen name="createSubject/[createSubjectId]" options={{presentation:'modal'}}/>
    <Stack.Screen name="settings" options={{ headerShown: false }}/>
    
    
</Stack>
  )
}

export default ProfileLayout