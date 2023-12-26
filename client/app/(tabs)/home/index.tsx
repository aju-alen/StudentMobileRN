import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const HomePage = () => {
  const handleLogout = async() => {
    await AsyncStorage.removeItem('authToken');
    router.replace('/(authenticate)/login');
  }
  return (
    <View>
      <Text>HomePage</Text>
      <TouchableOpacity onPress={handleLogout} >
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

export default HomePage