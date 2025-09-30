import { View, Text } from 'react-native'
import React from 'react'
import { Stack, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';

const ProfileLayout = () => {
  return (
    <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="reports" options={{ headerShown: true, headerTitle:'Reports' }} />
    <Stack.Screen name="edit-profile" options={{ headerShown: true, headerTitle:'Edit Profile' }} />
    <Stack.Screen name="change-password" options={{ headerShown: true, headerTitle:'Change Password' }} />
    <Stack.Screen name="delete-account" options={{ headerShown: true, headerTitle:'Delete Account' }} />
    <Stack.Screen name="blocked-users" options={{ headerShown:true, headerTitle:'Blocked Users' }} />
    <Stack.Screen name="help-center" options={{ headerShown:false }} />
    <Stack.Screen name="help-item" options={{ headerShown:false }} />
    <Stack.Screen name="contact-us" options={{ headerShown:false }} />
    <Stack.Screen name="dev-stats" options={{ headerShown:false }} />
    <Stack.Screen name="settings" options={{ headerShown: false }}/>
    <Stack.Screen name="[subjectId]" options={{ headerShown:true, headerTitle:'Your Subject', headerLeft: () => (
      <Ionicons name="arrow-back" size={24} color="black" onPress={()=>router.back()} style={{ marginLeft: 0 }} />
    ),}} />

    <Stack.Screen name='schedule' options={{ headerShown:false,
    headerLeft: () => (
        <Ionicons name="arrow-back" size={24} color="black" onPress={()=>router.replace('/(tabs)/profile')} style={{ marginLeft: 0 }} />
      ),
    }}/>
    <Stack.Screen name="editSubject/[editSubjectId]" options={{presentation:'modal'}}/>
    <Stack.Screen name="createSubject/[createSubjectId]" options={{presentation:'modal', headerShown:true, headerTitle:'Create Subject', headerLeft: () => (
      <Ionicons name="arrow-back" size={24} color="black" onPress={()=>router.back()} style={{ marginLeft: 0 }} />
    ),}}/>
    
    
    
</Stack>
  )
}

export default ProfileLayout