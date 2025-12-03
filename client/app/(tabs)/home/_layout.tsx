import { View, Text } from 'react-native'
import React from 'react'
import { Stack, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons';


const HomeLayout = () => {
  return (
    <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name='filter' options={{presentation:'modal', headerShown:false, }}/>
        <Stack.Screen name='[subjectId]' options={{ headerShown:true, headerTitle:'Subject' }}/>
        <Stack.Screen name='allSubject' options={{ headerShown:false, headerTitle:'Subject' }}/>
        <Stack.Screen name='saved' options={{ headerShown:true, headerTitle:'Subject',
          headerLeft: () => (
            <Ionicons name="arrow-back" size={24} color="black" onPress={()=>router.back()} style={{ marginLeft: 0 }} />
          )
         }}/>
        <Stack.Screen name='progress' options={{ 
          headerShown: true, 
          headerTitle: 'Progress',
          headerLeft: () => (
            <Ionicons name="arrow-back" size={24} color="black" onPress={() => router.back()} style={{ marginLeft: 0 }} />
          )
        }}/>
        
        <Stack.Screen name= 'singleProfile/[singleProfileId]' options={{presentation:'modal',
         headerShown:true, headerTitle:'Profile',
      headerLeft: () => (
        <Ionicons name="arrow-back" size={24} color="black" onPress={()=>router.back()} style={{ marginLeft: 0 }} />
      ),}}/>
        <Stack
        .Screen name= 'subjectReviews/[subjectId]' options={{
         headerShown:true, headerTitle:'Reviews',
      headerLeft: () => (
        <Ionicons name="arrow-back" size={24} color="black" onPress={()=>router.back()} style={{ marginLeft: 0 }} />
      ),}}/>


        
    </Stack>
  )
}

export default HomeLayout