import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import axios from "axios";
import { ipURL } from '../../utils/utils'
import HomeFlatlist from "../../components/HomeFlatlist";
import { Ionicons } from "@expo/vector-icons";
import {COLORS, FONT, SIZES} from '../../../constants'
import {horizontalScale, verticalScale, moderateScale} from '../../utils/metrics'
import { debounce } from "lodash";
import { StatusBar } from "expo-status-bar";
import SubjectCards from "../../components/SubjectCards";


//http://localhost:3000/api/subjects - GET

interface User {
  email?: string;
  name?: string;
  profileImage?: string;
  userDescription?: string;
}

const HomePage = () => {
  const [subjectData, setSubjectData] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [focus, setFocus] = React.useState(false);
  const params = useLocalSearchParams();
const { subjectGrade,subjectBoard,subjectTeacher,subjectTags} = params;
console.log(params,'this is params in homeeee');


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

      const resp = await axios.get(`http://${ipURL}/api/subjects?subjectGrade=${subjectGrade}&subjectBoard=${subjectBoard}&subjectTags=${subjectTags}`, {
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
    <View style={styles.mainContainer}>
    
      <View style={styles.wecomeAndSearchContainer}>
      <View style={styles.welcomeUserContainer}>
        <View style={styles.imageContainer}>
        <Image
          source={{ uri: user.profileImage }}
           resizeMode="contain"
           style={styles.welcomeUserImage}
         />
        </View>
        <View style={styles.welcomeUserTextContainer}>
          <Text style={styles.welcomeTextHeading}>Hi, {user.name}</Text>
          <Text style={styles.welcomeTextSubHeading}>Find Your Favoirite Course</Text>
          </View>
      </View>
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
       <TouchableOpacity onPress={()=>router.push('/home/filter')}>
       <Ionicons name={"filter"} size={moderateScale(26)} color={"gray"} />
       </TouchableOpacity>
      </View>
      </View>
     
      <View style={styles.flatlistHeaderContainer}>
        <Text style={styles.flatlistHeaderTextLeft}>Browse Courses</Text>
        <Text style={styles.flatlistHeaderTextRight}>See All</Text>
      </View>
      <SubjectCards subjectData={subjectData} handleItemPress={handleItemPress} isHorizontal={false} />
    </View>
  );
};

export default HomePage;


const styles = StyleSheet.create({

  mainContainer:{
    flex:1,
    backgroundColor:"white",
  },
  wecomeAndSearchContainer:{
    borderWidth:1,
    borderColor:"black",
    paddingTop:verticalScale(40),
    borderEndEndRadius:moderateScale(25),
    borderEndStartRadius:moderateScale(25),
    backgroundColor:"#1A4C6E"
  },

  welcomeUserContainer:{
    flexDirection: 'row',
    marginLeft:horizontalScale(25),
    marginTop:verticalScale(10),
    alignItems:"center",
  },
  imageContainer:{
  },
  welcomeUserImage:{
    height: verticalScale(52),
    width: horizontalScale(52),
    borderRadius: moderateScale(60),
  },
  welcomeUserTextContainer:{
    marginLeft:horizontalScale(8),
  },
  welcomeTextHeading:{
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(18),
    marginBottom:verticalScale(5),
    color:"white",
  },
  welcomeTextSubHeading:{
    color:"white",
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),

  },

  searchContainer:{
    backgroundColor:"white",
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-around",
    marginHorizontal:horizontalScale(25),
    marginTop:verticalScale(24),
    height:verticalScale(52),
    borderRadius:moderateScale(20),
    borderWidth:1,
    borderColor:"black",
    marginBottom:verticalScale(24),
  },
  searchInput:{
    width:horizontalScale(200),
    height:verticalScale(40),
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
  },
  horizontalFlatlistHeaderContainer:{
    justifyContent:"space-between",
    alignItems:"flex-start",
    marginHorizontal:horizontalScale(25),
    marginTop:verticalScale(24),
  },
  flatlistHeaderContainer:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginHorizontal:horizontalScale(25),
    marginTop:verticalScale(24),

  },
  flatlistHeaderTextLeft:{
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(18),
  },
  flatlistHeaderTextRight:{
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color:"#F1A568"
  },
  flatlistRecommendedContainer:{
    height:verticalScale(309),
    width:horizontalScale(339),
    marginHorizontal:horizontalScale(15),
    marginTop:verticalScale(10),
    borderColor:"gray",
    borderRadius:moderateScale(40),
    borderWidth:1,
  },
  flatlistInnerContainer:{
    marginHorizontal:horizontalScale(14),
  },
  subjectImage:{
    width:"100%",
    marginTop:verticalScale(16),
    height:verticalScale(189),
    borderRadius:moderateScale(40),
  },
  subjectBoardContainer:{
    flexDirection:"row",
    backgroundColor:"'rgba(255, 255, 255, 0.8)'",
    padding:moderateScale(5),
    height:verticalScale(29),
    width:horizontalScale(110),
    borderRadius:moderateScale(40),
    marginTop:verticalScale(21),
    marginLeft:horizontalScale(20),
    justifyContent:"space-around",
    alignItems:"center",
    position:"absolute",
  },
  subjectBoardText:{
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(12),
  },
  subjectGradeText:{
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
  },
  flatlistSubjectNameText:{
    marginTop:verticalScale(14),
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(20),


  },
  subjectDetailsContainer:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    marginHorizontal:horizontalScale(14),
  },
  imageandNameContainer:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-around",
    width:horizontalScale(120),
  },
  subjectTeacherImage:{
    height:verticalScale(51),
    width:horizontalScale(51),
    borderRadius: moderateScale(60),
  },
  subjectTeacherNameText:{
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(15),
    marginLeft:horizontalScale(8),
  
  },
  subjectTeacherDesignation:{
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    marginLeft:horizontalScale(8),
  },
  subjectPrice:{
    fontFamily: FONT.bold,
    fontSize: moderateScale(15),
    color:"#2DCB63",
  
  }
})




// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginLeft: 10,
//     marginVertical: 10,
//     paddingHorizontal: 8,
//     borderRadius:10,
//     borderWidth: 1,
//     borderColor: "gray",
//     backgroundColor: "#C15E49",
//     width: "75%",
//   },
//   filterContainer:{
//     justifyContent:"center",
//     marginHorizontal:7,
//   },
//   input1: {
//     flex: 1,
//     height: 40,
//     paddingHorizontal: 8,
    
//   },
//   profilePic: {
//     width: 60,
//     height: 60,
//     borderRadius: 100,
//     resizeMode: "contain",
//     marginTop: 20,
//     borderWidth: 0.5,
//   },
//   search: {
//     height: 40,
//     borderColor: "gray",
//     borderWidth: 1,
//     margin: 16,
//     padding: 10,
//     borderRadius: 5,
//   },
//   line: {
//     borderBottomColor: "black",
//     borderBottomWidth: 1,
//     marginVertical: 1,
//     marginHorizontal: 20,
//   },
//   text: {
//     fontSize: 22,
//     fontFamily: "Roboto-Regular",
//   },
//   titleImageContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 10,
    
//   },
//   inputBox:{
//     backgroundColor: "white",
//     borderRadius: 10,
//     height: 45,
//     marginVertical: 5,
//     paddingLeft: 10,
//   },
//   userName: {
//     fontFamily: FONT.regular,
//     fontSize: SIZES.large,
//     color: COLORS.secondary,
//   },
//   welcomeMessage: {
//     fontFamily: FONT.bold,
//     fontSize: SIZES.xLarge,
//     color: COLORS.primary,
//     marginLeft: 10,
//   },
//   welcome: {
//     fontFamily: FONT.bold,
//     fontSize: SIZES.xLarge,
//     color: COLORS.primary,
    
//   },
//   searchContainer: {
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row",
//     marginTop: SIZES.large,
//     height: 50,
    
//   },
//   searchContainerOnFocus: {
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row",
//     marginTop: SIZES.large,
//     height: 50,
//     marginHorizontal: SIZES.small,
//     width: "85%",    
    
//   },
 
//   searchWrapper: {
//     flex: 1,
//     flexDirection: "row",
//     backgroundColor: COLORS.lightWhite,
//     marginRight: SIZES.small,
//     justifyContent: "space-around",
//     alignItems: "center",
//     borderRadius: SIZES.medium,
//     height: "100%",
//     width: "100%",
     
//   },

//   searchInput: {
   
//     fontFamily: FONT.regular,
//     width: "60%",
//     height: "100%",
//     paddingHorizontal: SIZES.medium,
//   },
//   searchBtn: {
//     width: 50,
//     height: "100%",
//     backgroundColor: " #45B08C",
//     borderRadius: SIZES.medium,
//     justifyContent: "flex-end",
//     alignItems: "center",
//   },
//   crossIcon:{
//     flexDirection: "row",
//     height: "100%",
//     width: "40%",
//     backgroundColor: " #45B08C",
//     borderRadius: SIZES.medium,
//     justifyContent: "flex-end",
//     alignItems: "center",
   
//   }
// });



// return (
//   <SafeAreaView style={styles.container}>
//     <View style={styles.container}>
//       <View style={styles.titleImageContainer}>
//         <Image
//           source={{ uri: user.profileImage }}
//           style={styles.profilePic}
//           resizeMode="contain"
//         />
//         <View style={[{ paddingLeft: 10 },{paddingTop:10}]}>
//           <Text style={styles.welcome}>Welcome
           
          
//           </Text>
//           <Text style={styles.userName}>
//              {` ${ user.name}`}
//           </Text>           
//         </View>
//       </View>
//       <Text style={styles.welcomeMessage}>
//             Find your subject here </Text>
//       {/* <View style={{flexDirection:"row"}}>
        
//       <View style={styles.inputContainer}>
//         <Ionicons name={"search"} size={20} />
//         <TextInput
//           style={styles.input1}
//           placeholder="Search Subjects"
//           value={search}
//           onChangeText={(text) => {
//             setSearch(text);
//             handleSearch();
//           }}
//         />
       
//       </View>
//       <View style={styles.filterContainer}>
//       <TouchableOpacity onPress={()=>router.push('/home/filter')}>
//         <Ionicons name={"filter"} size={25} />
//         </TouchableOpacity>
//       </View>
//       <View style={styles.filterContainer}>
//       <TouchableOpacity onPress={()=>router.replace('/home/')}>
//         <Ionicons name={"close-circle-outline"} size={25} />
//         </TouchableOpacity>
//       </View>
//       </View> */}
//       <View style ={focus? styles.searchContainerOnFocus : styles.searchContainer}>
//       <View style = { styles.searchWrapper }>
//         <TextInput style={styles.searchInput}
//         value={search}
//         onChangeText={(text) => {
//           setSearch(text);
//           handleSearch();
        
//         }}
//         onFocus={()=>setFocus(true)}
//         onBlur={()=>setFocus(false)}
//         placeholder='Search For Your Subject...'
//         placeholderTextColor={COLORS.secondary}
//         />
//         {<TouchableOpacity onPress={()=>router.replace('/home/')} style={styles.crossIcon}>
//         <Ionicons name={"close-outline"} size={25} color={search ? "black": "white"} />
//         </TouchableOpacity>}
//       </View>
//       {/* <TouchableOpacity onPress={()=>router.push('/home/filter')} style = {styles.searchBtn}>
//         <Ionicons name={"filter"} size={25}  />
//         </TouchableOpacity> */}

         
//     </View>
    
//       <Text style={[styles.text, { paddingLeft: 20 }, { paddingVertical: 7 }]}>
//         All Subjects
//       </Text>

//       <HomeFlatlist
//         homeData={subjectData}
//         handleItemPress={handleItemPress}
//       />
//     </View>
//   </SafeAreaView>
// );


{/* <View style={styles.horizontalFlatlistHeaderContainer}>
<Text style={styles.flatlistHeaderTextLeft}>Browse Courses</Text>
<SubjectCards subjectData={subjectData} handleItemPress={handleItemPress} isHorizontal={true} />
</View> */}