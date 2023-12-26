import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { Tabs } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

const TabsLayout = () => {
    
  return (
    <Tabs  >
        <Tabs.Screen name='home/index' />
        <Tabs.Screen name='profile/index'/>
    </Tabs>
  )
}

export default TabsLayout

