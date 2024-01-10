import {
  View,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
  Image,
} from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";
import { ipURL } from "../../utils.js";
import HomeFlatlist from "../../components/HomeFlatlist";
import { Ionicons } from "@expo/vector-icons";

//http://localhost:3000/api/subjects - GET
import { debounce } from "lodash";
interface User {
  email?: string;
  name?: string;
  profileImage?: string;
  userDescription?: string;
}

const HomePage = () => {
  const [subjectData, setSubjectData] = React.useState([]);
  const [search, setSearch] = React.useState("");
  // const [isFocused, setIsFocused] = useState(false);
  // setIsFocused(!isFocused);

  const handleSearch = debounce(async () => {
    const token = await AsyncStorage.getItem("authToken");
    const resp = await axios.get(`http://${ipURL}/api/subjects`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(resp.data, "resp data normal function");

    const filtered = resp.data.filter((subject: { subjectName: string }) => {
      return subject.subjectName.toLowerCase().includes(search.toLowerCase());
    });
    setSubjectData(filtered);
  }, 400);

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

  console.log("User>>>>", user);

  useEffect(() => {
    const getSubjects = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const resp = await axios.get(`http://${ipURL}/api/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(resp.data, "resp data in useEffect");
      setSubjectData(resp.data);
    };
    getSubjects();
  }, []);

  console.log(subjectData, "outside");

  const handleItemPress = (itemId: { _id: any }) => {
    router.push(`/(tabs)/home/${itemId._id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.titleImageContainer}>
          <Image
            source={{ uri: user.profileImage }}
            style={styles.profilePic}
          />
          <View style={[{ paddingLeft: 10 },{paddingTop:10}]}>
            <Text style={[styles.text]}>Welcome</Text>
            <Text style={[styles.text, { fontWeight: "bold" }]}>
              {user.name}
            </Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name={"search"} size={20} />
          <TextInput
            style={styles.input1}
            placeholder="Search Subjects"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              handleSearch();
            }}
          />
        </View>
        <View style={styles.line}></View>
        <Text style={[styles.text, { paddingLeft: 20 }, { paddingVertical: 7 }]}>
          All Subjects
        </Text>

        <HomeFlatlist
          homeData={subjectData}
          handleItemPress={handleItemPress}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    paddingHorizontal: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "gray",
    backgroundColor: "orange",
  },
  input1: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
    
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 75,
    resizeMode: "contain",
    marginTop: 20,
    borderWidth: 1,
  },
  search: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    margin: 16,
    padding: 10,
    borderRadius: 5,
  },
  line: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    marginVertical: 1,
    marginHorizontal: 20,
  },
  text: {
    fontSize: 22,
    fontFamily: "Roboto-Regular",
  },
  titleImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
});
