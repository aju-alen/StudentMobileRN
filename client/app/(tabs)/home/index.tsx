import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';





const HomePage = () => {
  const handleLogout = async() => {
    await AsyncStorage.removeItem('authToken');
    router.replace('/(authenticate)/login');
  }
  return (
    <View style={styles.container}>
      <Text style={styles.text}>HomePage</Text>
      <TouchableOpacity onPress={handleLogout} >
        <Text style={styles.text}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

export default HomePage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    fontFamily: 'SpaceMono-Regular',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});