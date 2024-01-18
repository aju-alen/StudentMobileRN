import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, Touchable, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';

const Filter = () => {
  const [grade, setGrade] = React.useState('');
  const [board, setBoard] = React.useState('');
  const [tags, setTags] = React.useState('');
  // const [teacher, setTeacher] = React.useState('');

  console.log(grade,'this is tagsInput');
  
  return (
<SafeAreaView style={styles.container}>
  <ScrollView style={styles.container}>
    <View style={styles.container}>
      <View style={styles.searchHeaderContainer}>
        <Text style={styles.text1}>
        <Ionicons name="people-outline" size={20} color="#900" /> Advanced Search</Text>
      </View>
      <View style={styles.line}></View>
      <View style={styles.bodyContainer}>
        <Text style={styles.text2}>Search By Grade</Text>
        <TextInput style={styles.inputBox} 
        placeholder="Search By Grade"
        placeholderTextColor="gray"
        value={grade}
        onChangeText={setGrade}

        />
        
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.text2}>Search By Subject Board</Text>
        <TextInput style={styles.inputBox} 
        placeholder="Subject Board eg: CBSE, ICSE, State Board"
        placeholderTextColor="gray"
        value={board}
        onChangeText={setBoard}
        />
        
      </View>
      <View style={styles.bodyContainer}>
        <Text style={styles.text2}>Search By Subject Tags</Text>
        <TextInput style={styles.inputBox} 
        placeholder="Subject by Tags eg: Maths, Science, English"
        placeholderTextColor="gray"
        value={tags }
        onChangeText={setTags}
        />
        
      </View>
      {/* <View style={styles.bodyContainer}>
        <Text style={styles.text2}>Search By Teacher Name</Text>
        <TextInput style={styles.inputBox} 
        placeholder="Subject by teacher name"
        placeholderTextColor="gray"
        value={teacher}
        onChangeText={setTeacher}
        />
        
      </View> */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={()=>{
           router.replace({
            pathname: "/(tabs)/home/",
            params: {
              ...(grade && {subjectGrade: grade}),
              ...(board&& {subjectBoard: board}),
              ...(tags&& {subjectTags: tags}),
              // ...(teacher&& {subjectTeacher: teacher}),
            },
          });
        }} >
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
    </SafeAreaView>
    
  )
}

export default Filter

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DBE8D8",
  },
  searchHeaderContainer:{
    marginLeft: 10,
    borderRadius: 10,
    height: 45,
  },
  text1: {
    fontSize: 20,
    fontFamily: "Roboto-Regular",
    padding: 10,
  },
  text2: {
    fontSize: 17,
    fontFamily: "Roboto-Regular",
    padding: 10,
  },
  inputBox: {
    backgroundColor: "white",
    borderRadius: 10,
    height: 45,
    marginVertical: 5,
    paddingLeft: 10,
  },
  line: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    marginVertical: 1,
    marginHorizontal: 20,
  },
  bodyContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
  },
  buttonContainer: {
    backgroundColor: "#45B08C",
    borderRadius: 10,
    padding: 13,
    marginHorizontal: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  buttonText: {

    color: "white",
    fontSize: 20,
    fontFamily: "Roboto-Bold",
  },

})