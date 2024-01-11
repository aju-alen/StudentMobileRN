import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../../utils";
import { useLocalSearchParams } from "expo-router";
interface SubjectData {
  subjectImage?: string;
  subjectName?: string;
  subjectBoard?: string;
  subjectDescription?: string;
  subjectGrade?: number;
  subjectPrice?: number;
  subjectTags?: [string];
}

const EditSingleSubject = () => {
  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");
  const [subjectImage, setSubjectImage] = useState("");
  const [subjectPrice, setSubjectPrice] = useState("");
  const [subjectBoard, setSubjectBoard] = useState("");
  const [subjectGrade, setSubjectGrade] = useState("");
  const [subjectLanguage, setSubjectLanguage] = useState("");
  const [skillTags, setSkillTags] = useState([]);
  const [inputText, setInputText] = useState("");
  const [singleSubjectData, setSingleSubjectData] = React.useState<SubjectData>(
    {}
  );
  const { editSubjectId } = useLocalSearchParams();
  console.log("local search params", useLocalSearchParams());

  useEffect(() => {
    const getSubjects = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const resp = await axios.get(
          `http://${ipURL}/api/subjects/${editSubjectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("this is resp", resp.data);

        setSingleSubjectData(resp.data);
      } catch (error) {
        console.error("Error fetching subject data:", error);
      }
    };

    getSubjects();
  }, []);

  const handleCreateSubject = async () => {
    const subject = {
      subjectName,
      subjectDescription,
      subjectImage,
      subjectPrice,
      subjectBoard,
      subjectGrade,
      subjectLanguage,
      skillTags,
    };
    console.log("this is subject", subject);
  };

  const handleInputChange = (text) => {
    setInputText(text);
  };
  const handleAddItem = () => {
    if (inputText.trim() !== "") {
      setSkillTags([...skillTags, inputText]);
      setInputText("");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder="Subject Name"
          value={subjectName}
          onChangeText={setSubjectName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder="Subject Description"
          value={subjectDescription}
          onChangeText={setSubjectDescription}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder="Subject Image"
          value={subjectImage}
          onChangeText={setSubjectImage}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder="Subject Price"
          value={subjectPrice}
          onChangeText={setSubjectPrice}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder="Subject Board"
          value={subjectBoard}
          onChangeText={setSubjectBoard}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder="Subject Grade"
          value={subjectGrade}
          onChangeText={setSubjectGrade}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder="Subject Language"
          value={subjectLanguage}
          onChangeText={setSubjectLanguage}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="construct-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Add One Skill At A Time"
        />
        <TouchableOpacity onPress={handleAddItem}>
          <View style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={20} color="#900" />
            <Text>Add</Text>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleCreateSubject}>
        <Text style={styles.text}>Create Your Subject</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditSingleSubject;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "gray",
  },
  input1: {
    flex: 1,
    height: 40,
    paddingHorizontal: 8,
  },
  addButton: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#b54034",
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    color: "white",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#b54034",
    padding: 10,
    borderRadius: 100,
    margin: 12,
  },
});
