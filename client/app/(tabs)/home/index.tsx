import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  FlatList,
  Image,
  Button,
} from "react-native";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";
import { ipURL } from "../../utils.js";
import HomeFlatlist from "../../components/HomeFlatlist";

//http://localhost:3000/api/subjects - GET
import { debounce } from "lodash";

  const HomePage = () => {
    const [subjectData, setSubjectData] = React.useState([]);
    const [search, setSearch] = React.useState("");

    const handleSearch = debounce(async () => {
      const token = await AsyncStorage.getItem("authToken");
      const resp = await axios.get(`http://${ipURL}/api/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(resp.data, 'resp data normal function');

      const filtered = resp.data.filter((subject: { subjectName: string }) => {
        return subject.subjectName.toLowerCase().includes(search.toLowerCase());
      });
      setSubjectData(filtered);
    }, 400);

    useEffect(() => {
      const getSubjects = async () => {
        const token = await AsyncStorage.getItem("authToken");
        const resp = await axios.get(`http://${ipURL}/api/subjects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(resp.data, 'resp data in useEffect');
        setSubjectData(resp.data);
      };
      getSubjects();
    }, []);

    console.log(subjectData, 'outside');

    const handleLogout = async () => {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("isTeacher");
      router.replace("/(authenticate)/login");
    };

    const handleItemPress = (itemId: { _id: any }) => {
      router.push(`/(tabs)/home/${itemId._id}`);
    };

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <View style={styles.titlePriceContainer}>
            <Text style={[styles.text]}>Welcome</Text>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.button1]}
            >
              <Text style={[styles.text1]}>Logout</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TextInput
              style={[styles.search]}
              placeholder="Search Subjects"
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                handleSearch();
              }}
            />
          </View>
          <View style={styles.line}></View>

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
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 40,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  text1: {
    fontSize: 20,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  text2: {
    fontSize: 18,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchInput: {
    width: "100%",
    height: "100%",
  },
  searchContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    height: 50,
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
  image: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    borderRadius: 8,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 1,
    flex: 1,
  },
  titlePriceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 11,
  },
  button1: {
    backgroundColor: "#808080",
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});
