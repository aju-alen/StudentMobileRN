import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { ipURL } from '../../utils'

const ProfilePage = () => {
   const [token, setToken] = useState('')
   const [user, setUser] = useState({})

  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem('authToken')

      setToken(token)
    }
    getToken()
    
  }, [])

  useEffect(() => {
    const getUser = async () => {
      if (token) {
        const resp = await axios.get(`http://${ipURL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setUser(resp.data)
      }
    }
    getUser()
  }, [token])
  return (
    <View>
      <Text>Profile</Text>
    </View>
  )
}

export default ProfilePage

const styles = StyleSheet.create({})