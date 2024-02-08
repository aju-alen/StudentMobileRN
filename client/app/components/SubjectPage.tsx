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
import { ipURL } from "../utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { horizontalScale, verticalScale, moderateScale } from '../utils/metrics'
import { FONT } from "../../constants";
import {socket} from '../utils/socket'
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
  subjectPoints?: [string];
  subjectNameSubHeading?: string;
  subjectDuration?: string;
}

interface User {
  name?: string;
  profileImage?: string;
  _id?: string;
}

//This gets a single Subject data, there is handleChat
const SubjectPage = ({ subjectId }) => {
  const [singleSubjectData, setSingleSubjectData] = React.useState<SubjectData>(
    {}
  );
  console.log("this is subjectId", subjectId);
  const name = singleSubjectData.user?.name;
  const profileImage = singleSubjectData.user?.profileImage;
  const [userData, setUserData] = React.useState<User>({});
  const [teacherId, setTeacherId] = React.useState<string>("");

  const handleChatNow = async () => {
    const token = await AsyncStorage.getItem('authToken')
    const userDetails = await AsyncStorage.getItem('userDetails')
    const userId = JSON.parse(userDetails).userId;
    const clientId = singleSubjectData.user?._id;
    try{
      socket.emit('send-chat-details', {userId, clientId, subjectId})
     
      socket.on("chat-details",(data)=>{
        console.log(data,'this is the chat room details from server');
        
      })
      router.replace(`/(tabs)/chat`);
    }
    catch(err){
      console.log(err,'this is the error when clciking chat now button');
      
    }
    
    
  };

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
        setTeacherId(resp.data.user._id);
        setSingleSubjectData(resp.data);
      } catch (error) {
        console.error("Error fetching subject data:", error);
      }
    };

    getSubjects();
  }, []);

  console.log(singleSubjectData, "this is singleSubjectData");
  

  return (

    <View style={styles.mainContainer} >
      <ScrollView  >
        <Image source={{ uri: singleSubjectData?.subjectImage }} style={styles.mainImageContainer} resizeMode="cover" />
        <SafeAreaView >
          <View style={styles.imageDetailsContainer}>
            <Text style={styles.teachingGradeText}>Grade: {singleSubjectData.subjectGrade}</Text>
            <Text style={styles.teachingLanguageText}>Mode of Instruction: {singleSubjectData.subjectLanguage}</Text>
          </View>
          <View style={styles.subjectHeaderContainer}>
            <Text style={styles.subjectHeaderText}>{singleSubjectData.subjectName}</Text>
            <Text style={styles.subjectSubHeaderText}>{singleSubjectData.subjectNameSubHeading && singleSubjectData.subjectNameSubHeading}</Text>
          </View>
         
            <TouchableOpacity onPress={() => router.replace(`/(tabs)/home/singleProfile/${teacherId}`)}>
          <View style={styles.userDetailsContainer}>
            <Image source={{ uri: singleSubjectData?.user?.profileImage }} style={styles.userDetailsImage} />
            <View style={styles.userDetailsTextContainer}>
              <Text style={styles.userDetailsText1}>{singleSubjectData.user?.name}</Text>
              <Text style={styles.userDetailsText2}>Sr.French Professor</Text>
            </View>
          </View>
            </TouchableOpacity>
          <View style={styles.subjectDetailsContainer}>
            <Text style={styles.subjectDetailsText}>{singleSubjectData.subjectDuration && `${singleSubjectData.subjectDuration} h`}</Text>
            <Text style={styles.subjectDetailsText}>•</Text>
            <Text style={styles.subjectDetailsText}>{singleSubjectData.subjectLanguage}</Text>
            <Text style={styles.subjectDetailsText}>•</Text>
            <Text style={styles.subjectDetailsText}>100% Online & Flexible Deadlines</Text>
          </View>
          {singleSubjectData.subjectDescription && <View style={styles.moreDetailsContainer}>
            <Text style={styles.moreDetailsHeadingText} >Description</Text>

            <Text style={styles.moreDetailsDescriptionText} >{singleSubjectData.subjectDescription}</Text>
          </View>}

          {singleSubjectData.subjectPoints && 
          <View style={styles.moreDetailsContainer}>
            <Text style={styles.moreDetailsHeadingText} >More Details</Text>
            {singleSubjectData?.subjectPoints?.map((point, i) => ( 
              <Text key={i} style={styles.moreDetailsPointText} >● {point}</Text>
             ))}
          </View>
          }
          


          <View style={styles.buttonsContainer2}>
            <TouchableOpacity style={styles.buyNowButton2}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.buttonText2}>ENROLL NOW FOR </Text>
                <Text style={styles.buttonBoldText2}>ONLY AED {singleSubjectData.subjectPrice}</Text>
              </View>
              <Text style={styles.buttonBoldText2Static}>(Premium Service) </Text>
            </TouchableOpacity>
            <Text style={styles.orText}>OR</Text>
            <TouchableOpacity onPress={handleChatNow} style={styles.ChatNowButton2}>
              <Text style={styles.buttonText2}>CHAT NOW</Text>
              <Text style={styles.buttonText2}>(Subscription Service)</Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </ScrollView>
      {/* Another View for Purchase and chat UI */}
      {/* <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.buyNowButton}>
          <Text style={styles.buttonText}>ENROLL NOW FOR </Text>
           <Text style={styles.buttonBoldText}> ONLY AED {singleSubjectData.subjectPrice}</Text>
           
        </TouchableOpacity>
        <TouchableOpacity style={styles.ChatNowButton}>
          <Text style={styles.buttonText}>CHAT NOW</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default SubjectPage;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  mainImageContainer: {
    width: "100%",
    height: verticalScale(290),
  },
  imageDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginTop: verticalScale(18),
    marginHorizontal: horizontalScale(30),
  },


  teachingGradeText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#2DCB63',
  },
  teachingLanguageText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
  },
  subjectHeaderContainer: {

    marginHorizontal: horizontalScale(33),
    marginTop: verticalScale(10),
  },
  subjectHeaderText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(22),
    textAlign: 'center',
  },
  subjectSubHeaderText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(20),
    textAlign: 'center',
  },
  subjectDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: verticalScale(12),
    marginHorizontal: horizontalScale(30),
  },
  subjectDetailsText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(12),
  },
  userDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: horizontalScale(30),
    marginTop: verticalScale(22),

  },
  userDetailsImage: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    marginRight: horizontalScale(11),

  },
  userDetailsTextContainer: {

  },
  userDetailsText1: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(19),
  },
  userDetailsText2: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
  },
  moreDetailsContainer: {
    marginHorizontal: horizontalScale(29),
    marginTop: verticalScale(26),

  },
  moreDetailsHeadingText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(20),
  },
  moreDetailsDescriptionText: {
    fontFamily: FONT.regular,
    textAlign: 'justify',
  },
  moreDetailsPointText: {
    fontFamily: FONT.regular,
    textAlign: 'justify',
    marginBottom: verticalScale(6),
  },
  subjectPointsContainer: {

  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: horizontalScale(3),
    height: verticalScale(70),
    borderRadius: 30,
    borderColor: 'black',
  },
  buyNowButton: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    height: "100%",
    borderRadius: 30,
    backgroundColor: '#2DCB63',
  },
  ChatNowButton: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    height: "100%",
    borderRadius: 30,
    backgroundColor: '#2DCB63',
  },

  buttonText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: 'white',
  },
  buttonBoldText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(16),
    color: 'white',
  },
  buttonsContainer2: {
    marginTop: verticalScale(40),
    justifyContent: 'space-between',
    // marginHorizontal:horizontalScale(10),
    height: verticalScale(150),
    borderStartStartRadius: 20,
    borderStartEndRadius: 20,
    backgroundColor: '#1A4C6E',
    padding: 10,

  },
  buyNowButton2: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',

    borderRadius: 10,
    height: verticalScale(50),
    backgroundColor: '#2DCB63',

  },
  ChatNowButton2: {
    justifyContent: 'center',
    borderRadius: 10,
    height: verticalScale(50),
    backgroundColor: '#147eb2',
  },
  buttonText2: {
    justifyContent: 'center',

    alignItems: 'center',
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: 'white',
    textAlign: 'center',
  },
  buttonBoldText2: {
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(16),
    color: 'black',
    textAlign: 'center',
  },
  orText: {
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(16),
    color: 'white',
    textAlign: 'center',

  },
  buttonBoldText2Static: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(12),
    color: 'white',
  }

});



// const styles = StyleSheet.create({
//   image: {
//     width: "100%",
//     height: 200,
//     alignSelf: "center",
//     resizeMode: "cover",
//   },
//   container: {
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   text: {
//     fontSize: 25,
//     paddingTop: 5,
//     fontFamily: "SpaceMono-Regular",
//     fontWeight: "bold",
//   },
//   text1: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     fontSize: 16,
//     fontFamily: "SpaceMono-Regular",
//     fontWeight: "bold",
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     paddingLeft: 10,
//     backgroundColor: "#f3f3f3",
//   },
//   line: {
//     borderBottomColor: "black",
//     borderBottomWidth: 1,
//     marginVertical: 1,
//     marginHorizontal: 20,
//     padding: 2,
//   },
//   descriptionText: {
//     fontSize: 16,
//     color: "#555",
//     lineHeight: 22,
//     marginTop: 8,
//     paddingLeft: 15,
//     paddingRight: 15,
//     paddingBottom: 15,
//     textAlign: "justify",
//   },
//   buttonText: {
//     color: "white",
//     justifyContent: "center",
//     alignItems: "center",
//     fontSize: 18,
//   },
//   fixedButton: {
//     bottom: 1,
//     backgroundColor: "#b54034",
//     borderRadius: 10,
//     marginVertical: 5,
//     width: "65%",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   chatbutton: {
//     bottom: 1,
//     backgroundColor: "#b54034",
//     padding: 15,
//     borderRadius: 10,
//     marginVertical: 5,
//     width: "30%",
//     justifyContent: "center",
//     alignItems: "center",
//     height: 70,
//     marginRight: 10,
//     marginLeft: 10,
//   },
//   detail: {
//     fontSize: 17,
//     color: "black",
//     paddingLeft: 20,
//   },
//   course: {
//     textAlign: "justify",
//     fontSize: 16,
//     alignItems: "center",
//     flex: 1,
//     paddingRight: 8,
//   },
//   skill: {
//     fontSize: 18,
//   },
//   coursegain: {
//     color: "red",
//   },
// });



// return (
//   <SafeAreaView style={{ flex: 1 }}>
//     <ScrollView>
//       <View style={{ width: "100%", height: 200 }}>
//         <Image
//           source={{ uri: singleSubjectData?.subjectImage }}
//           style={styles.image}
//         />
//       </View>
//       <View style={{ marginLeft: 15, marginRight: 10 }}>
//         <Text style={styles.text}>{singleSubjectData?.subjectName}</Text>
//         <View style={{ flexDirection: "row", paddingTop: 5 }}>
//           <Text style={{ fontSize: 18 }}>Course Tutor: {name} </Text>
//           <Text style={styles.text1}>
//             {singleSubjectData?.subjectBoard} -{" "}
//             {singleSubjectData?.subjectGrade}
//           </Text>
//         </View>
//         <Text style={{ fontWeight: "bold", fontSize: 18, paddingTop: 10 }}>
//           About this course
//         </Text>
//         <Text style={styles.course}>
//           {singleSubjectData?.subjectDescription}
//         </Text>

//         <View style={{ paddingBottom: 25, paddingLeft: 25 }}>
//           <View style={{ flexDirection: "row", paddingTop: 25 }}>
//             <Ionicons name="globe" size={30} color={"black"} />
//             <Text style={styles.detail}>100% Online</Text>
//           </View>
//           <View style={{ flexDirection: "row" }}>
//             <Ionicons name="calendar" size={30} color={"black"} />
//             <Text style={styles.detail}>Flexible Deadlines</Text>
//           </View>
//           <View style={{ flexDirection: "row" }}>
//             <Ionicons name="chatbox-ellipses" size={30} color={"black"} />
//             <Text style={styles.detail}>
//               Medium of Instruction: {singleSubjectData.subjectLanguage}
//             </Text>
//           </View>
//         </View>
//         <Text style={{ fontSize: 16 }}>Skills you will gain</Text>
//         {/* <View style={{paddingTop:10,flexDirection:'row'}}>
//         <FlatList data={singleSubjectData?.subjectTags} renderItem={({ item }) =>
//         <View style={{borderRadius:10,backgroundColor:'#b54034',marginTop:8,justifyContent:'center',marginRight:5}}>
//         <Text style={{padding:10,fontSize:16,color:'white'}}>{item} </Text>
//         </View>
//         } keyExtractor={(item) => item} />
//       </View> */}
//         <Text style={{ fontWeight: "bold", fontSize: 20, paddingTop: 20 }}>
//           Course Instructor
//         </Text>
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             paddingBottom: 25,
//             paddingTop: 20,
//           }}
//         >
//           <Image
//             source={{ uri: singleSubjectData?.user?.profileImage }}
//             style={{ width: 150, height: 150, borderRadius: 100 }}
//           />
//           <View style={{ flexDirection: "column" }}>
//             <Text style={{ fontSize: 18, paddingLeft: 20 }}>{name}</Text>
//             <Text style={{ paddingLeft: 20 }}>UI/UX Expert</Text>
//           </View>
//         </View>
//         <View></View>
//       </View>
//       <View>
//         <View style={[styles.buttonContainer]}>
//           <TouchableOpacity
//             style={styles.fixedButton}
//             onPress={() => console.log("Button 1 pressed")}
//           >
//             <Text style={styles.buttonText}>
//               Enrol Now - AED {singleSubjectData?.subjectPrice}
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.chatbutton}
//             onPress={handleChatNow}
//           >
//             <Ionicons name="chatbox-ellipses" size={30} color={"white"} />
//             <Text style={styles.buttonText}>Chat Now</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   </SafeAreaView>
// );