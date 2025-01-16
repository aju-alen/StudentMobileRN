import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import { Image } from 'expo-image';
import { ipURL } from "../../utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import KebabIcon from "../../components/KebabIcon";
import { FONT } from "../../../constants";
import { horizontalScale, moderateScale, verticalScale } from "../../utils/metrics";
import SubjectCards from "../../components/SubjectCards";

interface User {
  _id?: string;
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

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const { width } = Dimensions.get('window');

const ProfilePage = () => {
  const [user, setUser] = useState<User>({});
  const [userDetails, setUserDetails] = useState<UserDetails>({});
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const apiUser = await axios.get(`${ipURL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
        },
      });
      setUser(apiUser.data);
      const user = JSON.parse(await AsyncStorage.getItem("userDetails"));
      setUserDetails(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("isTeacher");
    router.replace("/(authenticate)/login");
  };

  const handleItemPress = (itemId: { _id: any }) => {
    router.push(`/(tabs)/profile/${itemId._id}`);
  };

  const handleCreateNewSubject = () => {
    router.push(`/(tabs)/profile/createSubject/${user._id}`);
  }

  const closeDropdown = () => {
    setShowDropdown(false);
  };

  return (
    <TouchableWithoutFeedback onPress={closeDropdown}>
      <ScrollView style={styles.mainContainer}>
        {/* Curved Header with Gradient Overlay */}
        <View style={styles.headerContainer}>
          <View style={styles.headerOverlay} />
          <View style={styles.topBarContainer}>
            <Text style={styles.topBarText}>Profile</Text>
            <KebabIcon 
              handleLogout={handleLogout} 
              handleCreateNewSubject={handleCreateNewSubject} 
              isTeacher={userDetails?.isTeacher} 
              setShowDropdown={setShowDropdown} 
              showDropdown={showDropdown} 
            />
          </View>
          
          <View style={styles.profileSection}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileImage}
                placeholder={blurhash}
                contentFit="cover"
                transition={300}
              />
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {userDetails?.isTeacher ? 'Teacher' : 'Student'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, styles.sessionsBox]}>
            <View style={styles.statIconContainer}>
              <View style={[styles.statIcon, styles.sessionsIcon]} />
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Sessions Completed</Text>
          </View>
          <View style={[styles.statBox, styles.ratingBox]}>
            <View style={styles.statIconContainer}>
              <View style={[styles.statIcon, styles.ratingIcon]} />
            </View>
            <Text style={styles.statValue}>4.2</Text>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutContainer}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              {user.userDescription || "No description available"}
            </Text>
          </View>
        </View>

        {/* Courses Section */}
        <View style={styles.coursesContainer}>
          <Text style={styles.sectionTitle}>Your Courses</Text>
          <SubjectCards 
            subjectData={user.subjects} 
            handleItemPress={handleItemPress} 
            isHorizontal={false} 
          />
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    height: verticalScale(300),
    backgroundColor: '#1A4C6E',
    borderBottomLeftRadius: moderateScale(40),
    borderBottomRightRadius: moderateScale(40),
    overflow: 'hidden',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  topBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(20),
    zIndex: 1,
  },
  topBarText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: verticalScale(20),
    zIndex: 1,
  },
  imageWrapper: {
    padding: moderateScale(3),
    borderRadius: moderateScale(75),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  profileImage: {
    width: horizontalScale(140),
    height: verticalScale(140),
    borderRadius: moderateScale(70),
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(28),
    color: '#FFFFFF',
    marginTop: verticalScale(16),
    letterSpacing: 0.5,
  },
  roleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: horizontalScale(16),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    marginTop: verticalScale(8),
  },
  roleText: {
    color: '#FFFFFF',
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(-30),
    marginBottom: verticalScale(20),
  },
  statBox: {
    width: '47%',
    padding: moderateScale(20),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statIconContainer: {
    width: horizontalScale(50),
    height: verticalScale(50),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  statIcon: {
    width: horizontalScale(30),
    height: verticalScale(30),
    borderRadius: moderateScale(15),
  },
  sessionsIcon: {
    backgroundColor: '#FFD700',
  },
  ratingIcon: {
    backgroundColor: '#90EE90',
  },
  statValue: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(36),
    color: '#2D3748',
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#718096',
    textAlign: 'center',
  },
  aboutContainer: {
    padding: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(22),
    color: '#2D3748',
    marginBottom: verticalScale(16),
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  descriptionText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(16),
    color: '#4A5568',
    lineHeight: moderateScale(24),
  },
  coursesContainer: {
    padding: moderateScale(20),
  },
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