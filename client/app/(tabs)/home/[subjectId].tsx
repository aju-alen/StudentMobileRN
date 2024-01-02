import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubjectId = () => {
  const { subjectId } = useLocalSearchParams();
  const [singleSubjectData, setSingleSubjectData] = React.useState([]);

  useEffect(() => {
    const getSubjects = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const resp = await axios.get(`http://localhost:3000/api/subjects/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSingleSubjectData(resp.data);
    };
    getSubjects();
  }, [])

  return (
    <View>
      <Text> SubjectId</Text>
    </View>
  )
}

export default SubjectId

const styles = StyleSheet.create({})

