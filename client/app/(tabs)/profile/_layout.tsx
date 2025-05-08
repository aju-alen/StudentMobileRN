import { View, Text } from 'react-native'
import React from 'react'
import { Stack, router } from 'expo-router'


const ProfileLayout = () => {
  return (
    <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="reports" options={{ headerShown: true }} />
    <Stack.Screen name="edit-profile" options={{ headerShown: true }} />
    <Stack.Screen name="change-password" options={{ headerShown: true }} />
    <Stack.Screen name="delete-account" options={{ headerShown: true }} />
    <Stack.Screen name="blocked-users" options={{ headerShown:true }} />
    <Stack.Screen name="editSubject/[editSubjectId]" options={{presentation:'modal'}}/>
    <Stack.Screen name="createSubject/[createSubjectId]" options={{presentation:'modal'}}/>
    <Stack.Screen name="settings" options={{ headerShown: false }}/>
    
    
</Stack>
  )
}

export default ProfileLayout