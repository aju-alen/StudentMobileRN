import { StyleSheet, Text, View } from 'react-native'
import React from 'react' 
import { useLocalSearchParams } from 'expo-router';

const SubjectPage = () => {
    console.log(useLocalSearchParams());
    
    const {subjectPage} = useLocalSearchParams();

    console.log(subjectPage);
    
    
    
  return (
    <View>
      <Text> SubjectPage</Text>
    </View>
  )
}

export default SubjectPage

const styles = StyleSheet.create({})


123