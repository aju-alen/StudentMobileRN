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
import { ipURL } from "../../utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

interface User {
  email?: string;
  name?: string;
  profileImage?: string;
  userDescription?: string;
  subjects?: string[];
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
  const subjectsArray = user.subjects;
  console.log("subjects", subjectsArray);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {userDetails?.isTeacher && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                router.push("/(tabs)/profile/createSubject");
              }}
            >
              <Text style={styles.buttonText}>
                Create a New Subject to Teach
              </Text>
            </TouchableOpacity>
          </View>
        )}
        <Image
          style={styles.profileImage}
          source={{ uri: `${user?.profileImage}` }}
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
        <ScrollView>
          <View>
            {/* <FlatList
              data={[subjectsArray]}
              renderItem={({ item }) => (
                <View>
                  <Text >{item.subjectName}</Text>
                </View>
              )}
            /> */}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    backgroundColor: "light-gray",
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
  bulletPoint: {
    marginBottom: 8,
    color: "black",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end", // Pushes the button to the right
    marginBottom: 10,
    width: "95%",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#36A0E2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  descriptionText: {
    textAlign: "justify",
  },
});

export default ProfilePage;
