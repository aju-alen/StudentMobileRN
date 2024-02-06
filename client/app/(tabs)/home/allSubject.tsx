import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Image, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import SubjectCards from '../../components/SubjectCards'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { debounce } from "lodash";
import { Ionicons } from "@expo/vector-icons";
import { ipURL } from '../../utils/utils';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { FONT } from '../../../constants';
import { ScrollView } from 'react-native-gesture-handler';

interface User {
    email?: string;
    name?: string;
    profileImage?: string;
    userDescription?: string;
  }

const allSubject = () => {
    const [subjectData, setSubjectData] = React.useState([]);
    const [search, setSearch] = React.useState("");
    const [focus, setFocus] = React.useState(false);
    const params = useLocalSearchParams();
    const { subjectGrade, subjectBoard, subjectTeacher, subjectTags } = params;
    console.log(params, 'this is params in homeeee');
  
  
    const handleSearch = debounce(async () => {
      const token = await AsyncStorage.getItem("authToken");
      const resp = await axios.get(`http://${ipURL}/api/subjects?subjectGrade=${subjectGrade}&subjectBoard=${subjectBoard}&subjectTags=${subjectTags}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(resp.data, "resp data normal function");
  
      const filtered = resp.data.filter((subject: { subjectName: string }) => {
        return subject.subjectName.toLowerCase().includes(search.toLowerCase());
      });
      setSubjectData(filtered);
    }, 1000);
  
    const [user, setUser] = useState<User>({});
    useEffect(() => {
      const getUser = async () => {
        const apiUser = await axios.get(`http://${ipURL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
        });
        setUser(apiUser.data);
      };
      getUser();
    }, []);
  
    console.log("User11>>>>", user);
  
    useEffect(() => {
      const getSubjects = async () => {
        const token = await AsyncStorage.getItem("authToken");
  
        const resp = await axios.get(`http://${ipURL}/api/subjects/search?subjectGrade=${subjectGrade}&subjectBoard=${subjectBoard}&subjectTags=${subjectTags}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(resp.data, "resp data in useEffect");
        setSubjectData(resp.data);
  
        console.log("THIS IS RERENDERING AGAIN AFTER MODAL");
  
      };
      getSubjects();
    }, []);
  
    console.log(subjectData, "outside");
  
    const handleItemPress = (itemId: { _id: any }) => {
      console.log(itemId, "this is the item id");
  
      router.push(`/(tabs)/home/${itemId._id}`);
    };

    return (
        <SafeAreaView style={styles.mainContainer}>
        <View >
            <ScrollView>
          <View >
            <View style={styles.searchContainer}>
              <Ionicons name={"search"} size={moderateScale(26)} color={"black"} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Course..."
                placeholderTextColor="gray"
                value={search}
                onChangeText={(text) => {
                  setSearch(text);
                  handleSearch();
                }}
              />
              <TouchableOpacity onPress={() => router.push('/home/filter')}>
                <Ionicons name={"filter"} size={moderateScale(26)} color={"gray"} />
              </TouchableOpacity>
            </View>
          </View>
          {/* <View style={[styles.horizontalFlatlistHeaderContainer,{flex:1}]}>
            <Text style={styles.flatlistHeaderTextLeft}>Popular Courses</Text>
            <SubjectCards subjectData={subjectData} handleItemPress={handleItemPress} isHorizontal={true} />
          </View> */}
    
          <View style={styles.flatlistHeaderContainer}>
            <Text style={styles.flatlistHeaderTextLeft}>All Courses</Text>
            
          </View>
          <SubjectCards subjectData={subjectData} handleItemPress={handleItemPress} isHorizontal={false} />
        </ScrollView>
        </View>
        </SafeAreaView>
      );
}

export default allSubject

const styles = StyleSheet.create({

    mainContainer: {
      flex: 1,
      backgroundColor: "white",
    },
    
 
   
  
    searchContainer: {
      backgroundColor: "white",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    //   marginTop: verticalScale(24),
      height: verticalScale(50),
      borderRadius: moderateScale(10),
      borderWidth: 1,
      borderColor: "black",
      marginBottom: verticalScale(24),
    },
    searchInput: {
      width: horizontalScale(250),
      height: verticalScale(40),
      fontFamily: FONT.medium,
      fontSize: moderateScale(13),
    },
    horizontalFlatlistHeaderContainer: {
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginHorizontal: horizontalScale(25),
      marginTop: verticalScale(24),
    },
    flatlistHeaderContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: horizontalScale(25),
      marginTop: verticalScale(24),
    },
    flatlistHeaderTextLeft: {
      fontFamily: FONT.semiBold,
      fontSize: moderateScale(18),
    },
  })