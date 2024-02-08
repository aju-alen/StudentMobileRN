import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import{useLocalSearchParams} from 'expo-router'

const SingleProfilePage = () => {
  console.log(useLocalSearchParams(), 'this is the single profile page');
  const {singleProfileId} = useLocalSearchParams()
  return (
    <View>
      <Text>{singleProfileId}</Text>
    </View>
  )
}

export default SingleProfilePage

const styles = StyleSheet.create({})