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
} from "react-native";
import { ipURL } from "../../utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import HomeFlatlist from "../../components/HomeFlatlist";

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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          {userDetails?.isTeacher && (
            <View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  router.push(`/(tabs)/profile/createSubject`);
                }}
              >
                <Text style={styles.text1}>Create a Subject</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={handleLogout} style={[styles.button]}>
            <Text style={[styles.text1]}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.profileContainer}>
         
          <Image
            source={{ uri: user.profileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.title}>{user.name}</Text>
          <View style={styles.rowContainer}>
            <Text style={styles.ratingText}>Rating: 4.5</Text>
            <Text style={styles.sessionsText}>Sessions Done: 10</Text>
          </View>
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionText}>{user.userDescription}</Text>
          </View>
          <View style={styles.horizontalLine} />
          <Text style={styles.title}>Available Subjects</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <HomeFlatlist 
        homeData={subjectArray}
        handleItemPress={handleItemPress}
        />
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    backgroundColor: "light-gray",
  },
  profileContainer: {
    alignItems: "center",
  },
  priceGradeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 5,
  },
  textContainer: {
    marginLeft: 5,
    flex: 1,
  },
  image: {
    width: 75,
    height: 75,
    resizeMode: "cover",
    borderRadius: 10,
  },
  button2: {
    backgroundColor: "orange",
    borderRadius: 20,
    paddingLeft: 6,
    paddingRight: 6,
  },
  text1: {
    fontSize: 20,
    fontFamily: "Roboto-Regular",
  },
  text2: {
    fontSize: 15,
    fontFamily: "Roboto-Regular",
  },
  descriptionContainer: {
    width: "95%",
    marginBottom: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
    resizeMode: "contain",
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "black",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    marginBottom: 16,
  },
  ratingText: {
    color: "black",
    fontSize: 15,
    fontWeight: "bold",
  },
  sessionsText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "black",
  },
  horizontalLine: {
    width: "90%",
    marginVertical: 5,
    height: 1,
    backgroundColor: "black",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#36A0E2",
    borderRadius: 5,
    padding:4,
  },
  descriptionText: {
    textAlign: "justify",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  titlePriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 2,
    paddingBottom: 3,
  },
});

export default ProfilePage;
