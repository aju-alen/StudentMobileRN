import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  FlatList,
  Image,
} from "react-native";
import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";
import { ipURL } from "../../utils.js";
import HomeFlatlist from "../../components/HomeFlatlist";

//http://localhost:3000/api/subjects - GET

const HomePage = () => {
  const [subjectData, setSubjectData] = React.useState([]);

  useEffect(() => {
    const getSubjects = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const resp = await axios.get(`http://${ipURL}/api/subjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(resp.data);
      setSubjectData(resp.data);
    };
    getSubjects();
  }, []);

  console.log(subjectData);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    router.replace("/(authenticate)/login");
  };

  const handleItemPress = (itemId: { _id: any }) => {
    router.push(`/(tabs)/home/${itemId._id}`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={styles.titlePriceContainer}>
          <Text style={[styles.text, { marginLeft: 10 }]}>Welcome</Text>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.button1, { left: 120 }]}
          >
            <Text style={[styles.text1]}>Logout</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[styles.line, styles.text1]}
          placeholder="Search Subjects"
        />
        <View
          style={{
            borderBottomColor: "black", // Change the color as needed
            borderBottomWidth: 1,
            marginVertical: 1, // Adjust the margin as needed
            marginHorizontal: 20, //Adjust the margin as needed
          }}
        ></View>

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
  line: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    margin: 16,
    padding: 10,
    borderRadius: 5,
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
    elevation: 5, // Android
  },
  image: {
    width: 100, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    resizeMode: "cover", // or 'contain' or 'stretch' or 'center'
    borderRadius: 8, // Adjust as needed for rounded corners
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center", // Optional: Align items vertically in the middle
  },
  textContainer: {
    marginLeft: 1, // Add space between image and text
    flex: 1,
  },
  titlePriceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button1: {
    backgroundColor: "#808080", // Default background color
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});
