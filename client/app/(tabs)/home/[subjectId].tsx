import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
} from "react-native";
import React, { useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SubjectData {
  subjectImage: string;
  subjectName: string;
  subjectBoard: string;
  subjectDescription: string;
  subjectGrade: number;
  subjectPrice: number;
}

const SubjectId = () => {
  const { subjectId } = useLocalSearchParams();
  const [singleSubjectData, setSingleSubjectData] = React.useState<SubjectData>({});

  useEffect(() => {
    const getSubjects = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const resp = await axios.get(
          `http://localhost:3000/api/subjects/${subjectId}`,
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
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <Image
            source={{ uri: singleSubjectData.subjectImage }}
            style={styles.image}
          />
          <Text style={styles.text}>{singleSubjectData.subjectName}</Text>
        </View>
        <View style={styles.text1}>
          <Text>{singleSubjectData.subjectName}</Text>
          <Text>{singleSubjectData.subjectBoard}</Text>
        </View>
      </View>
      <Text>Das</Text>
    </SafeAreaView>
  );
};

export default SubjectId;

const styles = StyleSheet.create({
  image: { width: 200, height: 200 },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 40,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  text1: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 10,
    paddingRight: 10,
  },
  line: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    margin: 16,
    padding: 10,
    borderRadius: 5,
  },
});
