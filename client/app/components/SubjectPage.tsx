import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipURL } from "../utils";
import {Ionicons} from '@expo/vector-icons';
import { FlatList } from "react-native-gesture-handler";
interface SubjectData {
  subjectImage?: string;
  subjectName?: string;
  subjectBoard?: string;
  subjectDescription?: string;
  subjectLanguage?: string;
  subjectGrade?: number;
  subjectPrice?: number;
  subjectTags?: [string]; 
  user?: User;
  profileImage?: User;
}

interface User {
  name?: string;
  profileImage?: string;
}



const SubjectPage = ({subjectId}) => {
  const [singleSubjectData, setSingleSubjectData] = React.useState<SubjectData>(
    {}
  );
  console.log("this is subjectId", subjectId);
  const name=singleSubjectData.user?.name
  const profileImage=singleSubjectData.user?.profileImage
const [userData, setUserData] = React.useState<User>({});

  useEffect(() => {
    const getSubjects = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const resp = await axios.get(
          `http://${ipURL}/api/subjects/${subjectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSingleSubjectData(resp.data);
      } catch (error) {
        console.error("Error fetching subject data:", error);
      }
    };

    getSubjects();
  }, []);

  console.log("Single Subject Data:", singleSubjectData);

  return (
    <SafeAreaView style={{ flex:1}}>
      <ScrollView>
        <View style={{width:'100%',height:200}}>
          <Image source={{ uri: singleSubjectData?.subjectImage }} style={styles.image} />
          </View>
        <View style={{marginLeft:15,marginRight:10}}>
          <Text style={styles.text}>{singleSubjectData?.subjectName}</Text>
          <View style={{flexDirection:'row',paddingTop:5}}>

          <Text style={{fontSize:18}}>Course Tutor: {name} </Text>
          <Text style={styles.text1}>
            {singleSubjectData?.subjectBoard} - {singleSubjectData?.subjectGrade}
          </Text>
          </View>
          <Text style={{fontWeight:'bold', fontSize:18,paddingTop:10}}>About this course</Text>
          <Text style={styles.course}>{singleSubjectData?.subjectDescription}</Text>
        
        <View style={{paddingBottom:25,paddingLeft:25}}>
        <View style={{flexDirection:'row', paddingTop:25}}>
          <Ionicons name='globe' size={30} color={'black'} />
          <Text style={styles.detail}>100% Online</Text>
        </View>
        <View style={{flexDirection:'row'}}>
          <Ionicons name='calendar' size={30} color={'black'} />
          <Text style={styles.detail}>Flexible Deadlines</Text>
        </View>
        <View style={{flexDirection:'row'}}>
          <Ionicons name='chatbox-ellipses'size={30} color={'black'} />
          <Text style={styles.detail}>Medium of Instruction: {singleSubjectData.subjectLanguage}</Text>
        </View>
        </View>
        <Text style={{fontSize:16}}>Skills you will gain</Text>
        {/* <View style={{paddingTop:10,flexDirection:'row'}}>
          <FlatList data={singleSubjectData?.subjectTags} renderItem={({ item }) => 
          <View style={{borderRadius:10,backgroundColor:'#b54034',marginTop:8,justifyContent:'center',marginRight:5}}>
          <Text style={{padding:10,fontSize:16,color:'white'}}>{item} </Text>
          </View>
          } keyExtractor={(item) => item} />
        </View> */}
        <Text style={{fontWeight:'bold',fontSize:20,paddingTop:20}}>Course Instructor</Text>
        <View style={{flexDirection:'row',alignItems:'center', paddingBottom:25,paddingTop:20 }}>
        <Image source={{ uri: singleSubjectData?.user?.profileImage }} style={{width:150,height:150, borderRadius:100}} />
          <View style={{flexDirection:'column'}}>
          <Text style={{fontSize:18,paddingLeft:20}}>{name}</Text>
          <Text style={{paddingLeft:20}}>UI/UX Expert</Text>
          </View>

        </View>
        <View>
        </View>
          </View>
      <View> 
        <View style={[styles.buttonContainer]}>
          <TouchableOpacity
            style={styles.fixedButton}
            onPress={() => console.log("Button 1 pressed")}
          >
            <Text style={styles.buttonText}>Enrol Now - AED {singleSubjectData?.subjectPrice}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chatbutton}
            onPress={() => console.log("Button 2 pressed")}
          >
            <Ionicons name='chatbox-ellipses'size={30} color={'white'} />
            <Text style={styles.buttonText}>Chat Now</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubjectPage;

const styles = StyleSheet.create({
  image: { 
    width: "100%",
     height: 200, 
     alignSelf: "center" ,
     resizeMode:'cover', 
    },
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 25,
    paddingTop: 5,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  text1: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    paddingLeft:10,
    backgroundColor: "#f3f3f3",
  },
  line: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    marginVertical: 1,
    marginHorizontal: 20,
    padding: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
    marginTop: 8,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
    textAlign: 'justify',
  },
  buttonText: {
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 18,
  },
  fixedButton: {
    bottom: 1,
    backgroundColor: "#b54034",
    borderRadius: 10,
    marginVertical: 5,
    width:'65%',
    justifyContent:'center',
    alignItems: 'center',
  },
  chatbutton:{
    bottom: 1,
    backgroundColor: "#b54034",
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    width:'30%',
    justifyContent:'center',
    alignItems: 'center',
    height:70,
    marginRight:10,
    marginLeft:10,
  },
  detail:{
    fontSize:17,
    color:'black',
    paddingLeft:20
  },
  course:{
    textAlign:'justify',
    fontSize:16,
    alignItems: 'center',
    flex:1,
    paddingRight:8,
  },
  skill:{
    fontSize:18,
  },
  coursegain:{
    color:'red'

  }
});
