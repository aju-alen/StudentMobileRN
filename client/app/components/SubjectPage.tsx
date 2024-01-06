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
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipURL } from "../utils";

interface SubjectData {
  subjectImage?: string;
  subjectName?: string;
  subjectBoard?: string;
  subjectDescription?: string;
  subjectGrade?: number;
  subjectPrice?: number;
}

const SubjectPage = ({subjectId}) => {
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
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
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
            {singleSubjectData.subjectDescription}.{"\n"} 
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim
            veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in
            voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
            officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit
            amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
            nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit
            esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo
            consequat. Duis aute irure dolor in reprehenderit in voluptate velit
            esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </Text>
        </View>
      </ScrollView>
      <View> 
        <View style={[styles.buttonContainer]}>
          <TouchableOpacity
            style={styles.fixedButton}
            onPress={() => console.log("Button 1 pressed")}
          >
            <Text style={styles.buttonText}>Chat Now </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fixedButton}
            onPress={() => console.log("Button 2 pressed")}
          >
            <Text style={styles.buttonText}>Book Session Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SubjectPage;

const styles = StyleSheet.create({
  image: { width: 120, height: 120 },
  container: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  text: {
    fontSize: 30,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  text1: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    backgroundColor: "#f3f3f3",
  },
  line: {
    borderBottomColor: "black",
    borderBottomWidth: 1,
    marginVertical: 1,
    marginHorizontal: 20,
    padding: 2,
  },
  descriptionText: {
    fontSize: 16,
    color: "#555",
    lineHeight: 22,
    marginTop: 8,
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
    textAlign: 'justify',
  },
  buttonText: {
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 18,
  },
  fixedButton: {
    bottom: 1,
    backgroundColor: "#b54034",
    padding: 15,
    borderRadius: 100,
    marginVertical: 5,
  },
});
