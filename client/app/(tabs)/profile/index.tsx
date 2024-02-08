import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  Pressable,
  StatusBar,
  ScrollView,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { ipURL } from "../../utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import HomeFlatlist from "../../components/HomeFlatlist";
import KebabIcon from "../../components/KebabIcon";
import { FONT } from "../../../constants";
import { horizontalScale, moderateScale, verticalScale } from "../../utils/metrics";
import SubjectCards from "../../components/SubjectCards";

interface User {
  email?: string;
  name?: string;
  profileImage?: string;
  userDescription?: string;
  subjects?: SubjectItem[];
}

interface SubjectItem {
  _id: string;
  subjectName: string;
  subjectDescription?: string;
  subjectImage?: string;
  subjectPrice?: number;
  subjectBoard?: string;
  subjectGrade?: number;
}

interface UserDetails {
  isTeacher?: boolean;
  isAdmin?: boolean;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User>({});
  const [userDetails, setUserDetails] = useState<UserDetails>({});
  useEffect(() => {
    const getUser = async () => {
      const apiUser = await axios.get(`http://${ipURL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
        },
      });
      setUser(apiUser.data);
      console.log("User", apiUser.data);
      const user = JSON.parse(await AsyncStorage.getItem("userDetails"));
      setUserDetails(user);
    };
    getUser();
  }, []);

  console.log("user", user);
  const subjectArray = user.subjects;
  console.log("subjects", subjectArray);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("isTeacher");
    router.replace("/(authenticate)/login");
  };

  const handleItemPress = (itemId: { _id: any }) => {
    router.push(`/(tabs)/profile/${itemId._id}`);
  };
  const handleCreateNewSubject = () => {
    router.push(`/(tabs)/profile/createSubject`);
  }
  const [showDropdown, setShowDropdown] = useState(false);
  const closeDropdown = () => {
    setShowDropdown(false);
  };

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
    <SafeAreaView style={styles.MainContainer}>
      <ScrollView>
     <View style={styles.topBarContainer}>
      <Text style={styles.topBarText}>Profile</Text>
      <KebabIcon handleLogout={handleLogout} handleCreateNewSubject={handleCreateNewSubject} isTeacher={userDetails?.isTeacher} setShowDropdown={setShowDropdown} showDropdown={showDropdown} />
     </View>
     <View style={styles.userImageAndDetailsContainer}>
     <Image
  source={{ uri: user.profileImage }}
           style={styles.profileImage}
           resizeMode="cover"
         />     
         <View style={styles.userDetailsContainer} >
          <Text style={styles.userNameText}>{user.name}</Text>
          <Text style={styles.userDesignationText}>Sr. Professor</Text>
         </View>
         
         </View>
         <View>
         <Text style={styles.userDescriptionText}>{user.userDescription}</Text>
         </View>
         <View style={styles.userStatsContainer}>
          <View style={styles.box1Container}>
          <Text style={styles.boxHeadingText}>Sessions Completed</Text>
          <Text style={styles.boxResultsText}>12</Text>
          <Text style={styles.boxHeadingText}>Average Rating</Text>
          <Text style={styles.boxResultsText}>4.2</Text>
          </View>
          <View style={styles.box2Container}>
          <Text style={styles.boxHeadingText}>Another Stat</Text>
          </View>
          </View>        
          <View>
            <Text style={styles.yourCourseHeading}>Your Courses</Text>
          </View>
          <View style={{ flex: 1 }}>
        <SubjectCards subjectData={subjectArray} handleItemPress={handleItemPress} isHorizontal={false} />
    </View>
    </ScrollView>
    </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};


const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    backgroundColor:"white" 
  },
  topBarContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: moderateScale(10),
  },
  topBarText:{
    fontFamily:FONT.semiBold,
    fontSize:moderateScale(14),
  },
  userImageAndDetailsContainer: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: verticalScale(100),
    zIndex: -1,
    // marginHorizontal: horizontalScale(50),
  },
  profileImage:{
    width: horizontalScale(60),
    height: verticalScale(60),
    borderRadius: moderateScale(70),
    marginBottom: verticalScale(16),
    resizeMode: "contain",
    marginTop: verticalScale(20),
  },
  userDetailsContainer:{
    marginLeft:horizontalScale(30),

  },
  userNameText:{
    fontFamily:FONT.medium,
    fontSize:moderateScale(18),
  },
  userDesignationText:{
    fontFamily:FONT.regular,
    fontSize:14,
    color:"#1A4C6E",
  },
  aboutMeText:{
    fontFamily:FONT.semiBold,
    fontSize:moderateScale(16),
    marginTop:verticalScale(20),
    marginLeft:horizontalScale(20),
  },
  userDescriptionText:{
    fontFamily:FONT.regular,
    textAlign:'justify',
    fontSize:moderateScale(12),
    marginHorizontal:horizontalScale(20),
  },
  userStatsContainer: {
    flexDirection: "row",
    justifyContent: 'space-around',
    alignItems: 'center',
    height: verticalScale(200),
    zIndex: -1,
    // marginHorizontal: horizontalScale(50),
  },
  box1Container:{
    
    justifyContent: "center",
    alignItems: "center",
    width: horizontalScale(140),
    height: verticalScale(150),
    borderRadius: moderateScale(20),
    backgroundColor: "#FFD7E0",
  },
  boxHeadingText:{
    justifyContent:"center",
    fontFamily:FONT.thinItalic,
    fontSize:moderateScale(14),
    marginBottom:verticalScale(10),
    color:"black"
  },
  boxResultsText:{
    justifyContent:"center",
    fontFamily:FONT.bold,
    fontSize:moderateScale(28),
    color:"#3b3561",
  },
 
  box2Container:{
    justifyContent: "center",
    alignItems: "center",
    width: horizontalScale(140),
    height: verticalScale(150),
    borderRadius: moderateScale(20),
    backgroundColor: "#F08EA6",
  }, 
  boxResultsText2:{
    justifyContent:"center",
    fontFamily:FONT.bold,
    fontSize:moderateScale(28),
    color:"#3b3561",
  },
  yourCourseHeading:{
    fontFamily:FONT.semiBold,
    fontSize:moderateScale(18),
    marginTop:verticalScale(20),
    marginLeft:horizontalScale(20),
  
  }
});

export default ProfilePage;




// return (
//   <TouchableWithoutFeedback onPress={closeDropdown}>
//   <SafeAreaView style={styles.MainContainer}>
//     <View style={styles.container}>
//       <View style={styles.buttonContainer}>
     
//         <KebabIcon handleLogout={handleLogout} handleCreateNewSubject={handleCreateNewSubject} isTeacher={userDetails?.isTeacher} setShowDropdown={setShowDropdown} showDropdown={showDropdown} />
//       </View>
//       <View style={styles.profileContainer}>
       
//         <Image
//           source={{ uri: user.profileImage }}
//           style={styles.profileImage}
//           resizeMode="cover"
//         />
//         <Text style={styles.title}>{user.name}</Text>
//         <View style={styles.rowContainer}>
//           <Text style={styles.ratingText}>Rating: 4.5</Text>
//           <Text style={styles.sessionsText}>Sessions Done: 10</Text>
//         </View>
//         <View style={styles.descriptionContainer}>
//           <Text style={styles.descriptionText}>{user.userDescription}</Text>
//         </View>
//         <View style={styles.horizontalLine} />
//         <Text style={styles.title}>Available Subjects</Text>
//       </View>
//     </View>
//     <View style={{ flex: 1 }}>
//       <HomeFlatlist 
//       homeData={subjectArray}
//       handleItemPress={handleItemPress}
//       />
//     </View>
//   </SafeAreaView>
//   </TouchableWithoutFeedback>
// );


// const styles = StyleSheet.create({
//   MainContainer: {
//     flex: 1,
//     backgroundColor:"white" 
//   },
//   container: {
//     backgroundColor: "light-gray",
//   },
//   profileContainer: {
//     alignItems: "center",
//     zIndex: -1,
//   },
//   priceGradeContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingTop: 5,
//   },
//   textContainer: {
//     marginLeft: 5,
//     flex: 1,
//   },
//   image: {
//     width: 75,
//     height: 75,
//     resizeMode: "cover",
//     borderRadius: 10,
//   },
//   button2: {
//     backgroundColor: "orange",
//     borderRadius: 20,
//     paddingLeft: 6,
//     paddingRight: 6,
//   },
//   text1: {
//     fontSize: 20,
//     fontFamily: "Roboto-Regular",
//   },
//   text2: {
//     fontSize: 15,
//     fontFamily: "Roboto-Regular",
//   },
//   descriptionContainer: {
//     width: "95%",
//     marginBottom: 10,
//   },
//   profileImage: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     marginBottom: 16,
//     resizeMode: "contain",
//     marginTop: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 16,
//     color: "black",
//   },
//   rowContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "95%",
//     marginBottom: 16,
//   },
//   ratingText: {
//     color: "black",
//     fontSize: 15,
//     fontWeight: "bold",
//   },
//   sessionsText: {
//     fontSize: 15,
//     fontWeight: "bold",
//     color: "black",
//   },
//   horizontalLine: {
//     width: "90%",
//     marginVertical: 5,
//     height: 1,
//     backgroundColor: "black",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     marginHorizontal: 10,
//     marginVertical: 10,
//   },
//   button: {
//     backgroundColor: "#36A0E2",
//     borderRadius: 5,
//     padding:4,
//   },
//   descriptionText: {
//     textAlign: "justify",
//   },
//   card: {
//     backgroundColor: "white",
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ddd",
//     padding: 10,
//     margin: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   titlePriceContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingLeft: 2,
//     paddingBottom: 3,
//   },
// });