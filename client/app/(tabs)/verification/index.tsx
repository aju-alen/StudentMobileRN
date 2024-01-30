import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import HomeFlatlist from '../../components/HomeFlatlist'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ipURL } from '../../utils/utils'
import { router } from 'expo-router'




const VerificationIndex = () => {
  const [verifySubjects, setVerifySubjects] = useState([]);

  const handleItemPress = (itemId: { _id: any }) => {
    router.push(`/(tabs)/verification/${itemId._id}`);
  };
  console.log('123123123123123123123123123123123');
  
  useEffect(() => {
    const getUser = async () => {
      console.log('iniinninini');
      
      const apiUser = await axios.get(`http://${ipURL}/api/subjects/verify`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
        },
      });
      setVerifySubjects(apiUser.data);
      
      
    }
    getUser();

  }, [])
  
  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={{flex:1}}>
      <View >
      <Text style={[styles.text1]}>Verifiy All the Subjects Here</Text>
      </View>
      <View style={styles.line}></View>
      <View style={{ flex: 1 }}>
        <HomeFlatlist 
        homeData={verifySubjects}
        handleItemPress={handleItemPress}
        />
      </View>
    </View>
    </SafeAreaView>
  )
}

export default VerificationIndex

const styles = StyleSheet.create({
  text1: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 20,
    fontFamily: "Roboto-Regular",
    padding: 10,

  },
  line: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    marginVertical: 1,
    marginHorizontal: 20,
  },
})