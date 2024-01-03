import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipURL } from "../../utils";

interface SubjectData {
  subjectImage?: string;
  subjectName?: string;
  subjectBoard?: string;
  subjectDescription?: string;
  subjectGrade?: number;
  subjectPrice?: number;
}

const SubjectId = () => {
  const { subjectId } = useLocalSearchParams();
  const [singleSubjectData, setSingleSubjectData] = React.useState<SubjectData>(
    {}
  );

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
        setSingleSubjectData(resp.data);
      } catch (error) {
        console.error("Error fetching subject data:", error);
      }
    };

    getSubjects();
  }, [subjectId]);

  console.log("Single Subject Data:", singleSubjectData);

  return (
    <SafeAreaView >
      <View >
        <View >
          <View style={[styles.container]}>
            <Image
              source={{ uri: singleSubjectData.subjectImage }}
              style={styles.image}
            />
            <Text style={styles.text}>{singleSubjectData.subjectName}</Text>
          </View>
          <View style={[styles.text1]}>
            <Text>Board: {singleSubjectData.subjectBoard}</Text>
            <Text>Grade: {singleSubjectData.subjectGrade}</Text>
            <Text>Price: {singleSubjectData.subjectPrice}</Text>
          </View>
        </View>
        <View style={styles.line}></View>
        <Text style={styles.descriptionText}>
          {singleSubjectData.subjectDescription}
          {"\n"}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </Text>
        <View style={styles.buttonContainer1}>
          <View style={styles.text1}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => console.log("Button 1 pressed")}
            >
              <Text style={styles.buttonText}>Book Session Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => console.log("Button 2 pressed")}
            >
              <Text style={styles.buttonText}>Chat Now </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SubjectId;

const styles = StyleSheet.create({
  image: { width: 200, height: 200 },
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 40,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  text1: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  line: {
    borderBottomColor: "black", // Change the color as needed
    borderBottomWidth: 1,
    marginVertical: 1, // Adjust the margin as needed
    marginHorizontal: 20, //Adjust the margin as needed
    padding: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
    marginTop: 8,
    paddingLeft: 15,
    paddingRight: 15,
  },
  button: {
    backgroundColor: "#ae3833",
    padding: 18,
    borderRadius: 100,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer1: {
    top: 20,
  },
  
});
