import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { ipURL } from '../../utils/utils'
import HomeFlatlist from "../../components/HomeFlatlist";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT, SIZES } from '../../../constants'
import { horizontalScale, verticalScale, moderateScale } from '../../utils/metrics'
import { debounce } from "lodash";
import { StatusBar } from "expo-status-bar";
import SubjectCards from "../../components/SubjectCards";
import HorizontalSubjectCard from "../../components/horizontalSubjectCard";
import ColumnSubjectCards from "../../components/colSubjectCards";
import Video from "../../components/Video";


//http://localhost:3000/api/subjects - GET

interface User {
  email?: string;
  name?: string;
  profileImage?: string;
  userDescription?: string;
  reccomendedSubjects?: [string];
}

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const HomePage = () => {
  const [subjectData, setSubjectData] = React.useState([]);
  const [recommendedSubjects, setRecommendedSubjects] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const params = useLocalSearchParams();
  const { subjectGrade, subjectBoard, subjectTeacher, subjectTags } = params;
  console.log(params, 'this is params in homeeee');


  const handleSearch = debounce(async () => {
    const token = await AsyncStorage.getItem("authToken");
    const resp = await axios.get(`${ipURL}/api/subjects?subjectGrade=${subjectGrade}&subjectBoard=${subjectBoard}&subjectTags=${subjectTags}`, {
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
      const apiUser = await axios.get(`${ipURL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
        },
      });
      setUser(apiUser.data);
      console.log(apiUser?.data?.reccomendedSubjects, "api user data");

      const recommendedSubjects = apiUser?.data?.reccomendedSubjects;
      const recommendedGrade = apiUser?.data?.recommendedGrade;
      const recommendedBoard = apiUser?.data?.recommendedBoard;
      console.log(recommendedSubjects, "this is recommended subjects");
      
      const getUserRecommendedSubjects = await axios.post(`${ipURL}/api/subjects/get-recommended-subjects`, { recommendedSubjects, recommendedBoard, recommendedGrade},  {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
        },
      })
      setRecommendedSubjects(getUserRecommendedSubjects.data);
    };
    getUser();
  }, []);

  console.log("User11>>>>", user);

  useEffect(() => {
    const getSubjects = async () => {
      try{
        const token = await AsyncStorage.getItem("authToken");
      const resp = await axios.get(`${ipURL}/api/subjects/search?subjectGrade=${subjectGrade}&subjectBoard=${subjectBoard}&subjectTags=${subjectTags}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(resp.data, "resp data in useEffect");
      setSubjectData(resp.data);
     
      console.log("THIS IS RERENDERING AGAIN AFTER MODAL");
      }
      catch(error){
        console.log(error,'this is error');
      }

    };
    getSubjects();
  }, []);


  console.log(subjectData, "outside");

  const handleItemPress = (itemId: { _id: any }) => {
    console.log(itemId, "this is the item id");

    router.push(`/(tabs)/home/${itemId._id}`);
  };

  return (
    <View style={styles.mainContainer}>
     
      <View style={styles.wecomeAndSearchContainer}>
        <View style={styles.welcomeUserContainer}>
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/profile')}>
            <Image
              source={{ uri: user.profileImage }}
              style={styles.welcomeUserImage}
              placeholder={blurhash}
              contentFit="cover"
              transition={100}
            />
            </TouchableOpacity>
          </View>
          <View style={styles.welcomeUserTextContainer}>
            <Text style={styles.welcomeTextHeading}>Hi, {user.name}</Text>
            <Text style={styles.welcomeTextSubHeading}>Find Your Favoirite Course</Text>
          </View>
        </View>

      </View>
      {/* <View style={[styles.horizontalFlatlistHeaderContainer,{flex:1}]}>
        <Text style={styles.flatlistHeaderTextLeft}>Popular Courses</Text>
        <SubjectCards subjectData={subjectData} handleItemPress={handleItemPress} isHorizontal={true} />
      </View> */}
      <ScrollView style={{flex:1}}>
      <View style={styles.flatlistHeaderContainer}>
        <Text style={styles.flatlistHeaderTextLeft}>Recommended Courses</Text>
      </View>
      
      <HorizontalSubjectCard subjectData={recommendedSubjects} handleItemPress={handleItemPress} isHorizontal={true} />

      <View style={styles.flatlistHeaderContainer}>
        <Text style={styles.flatlistHeaderTextLeft}>Popular Courses</Text>
      </View>
      
      <HorizontalSubjectCard subjectData={subjectData} handleItemPress={handleItemPress} isHorizontal={true} />

      
      <View style={styles.flatlistHeaderContainer}>
        <Text style={styles.flatlistHeaderTextLeft}>Browse Courses</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/home/allSubject')}>
          <Text style={styles.flatlistHeaderTextRight}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <ColumnSubjectCards subjectData={subjectData} handleItemPress={handleItemPress} isHorizontal={false} />
      <View style={styles.flatlistHeaderContainer}>
        <Text style={styles.flatlistHeaderTextLeft}>{`Recommended Video(s)`}</Text>
        {/* <TouchableOpacity onPress={() => router.push('/(tabs)/home/allSubject')}> */}
          {/* <Text style={styles.flatlistHeaderTextRight}>See All</Text> */}
        {/* </TouchableOpacity> */}
      </View>
      <Video/>

      </ScrollView>
    </View>
  );
};

export default HomePage;


const styles = StyleSheet.create({

  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  wecomeAndSearchContainer: {
    borderWidth: 1,
    borderColor: "black",
    paddingTop: verticalScale(40),
    borderEndEndRadius: moderateScale(25),
    borderEndStartRadius: moderateScale(25),
    backgroundColor: "#1A4C6E"
  },

  welcomeUserContainer: {
    flexDirection: 'row',
    marginLeft: horizontalScale(25),
    marginTop: verticalScale(10),
    alignItems: "center",
  },
  imageContainer: {
  },
  welcomeUserImage: {
    height: verticalScale(52),
    width: horizontalScale(52),
    borderRadius: moderateScale(60),
  },
  welcomeUserTextContainer: {
    marginLeft: horizontalScale(8),
    padding: verticalScale(10),
  },
  welcomeTextHeading: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(18),
    marginBottom: verticalScale(5),
    color: "white",
  },
  welcomeTextSubHeading: {
    color: "white",
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),

  },

  searchContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginHorizontal: horizontalScale(25),
    marginTop: verticalScale(24),
    height: verticalScale(52),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: "black",
    marginBottom: verticalScale(24),
  },
  searchInput: {
    width: horizontalScale(200),
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
  flatlistHeaderTextRight: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: "#F1A568"
  },
})