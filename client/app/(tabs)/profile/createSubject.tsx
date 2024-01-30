import axios from "axios";
import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Button,
  ScrollView,
} from "react-native";
import { ipURL } from "../../utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const CreateSubject = () => {
  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");
  const [subjectImage, setSubjectImage] = useState("");
  const [subjectPrice, setSubjectPrice] = useState("");
  const [subjectBoard, setSubjectBoard] = useState("");
  const [subjectGrade, setSubjectGrade] = useState("");
  const [teacherVerification, setTeacherVerification] = useState([""]);
  const [subjectLanguage, setSubjectLanguage] = useState("");
  const [subjectNameSubHeading, setSubjectNameSubHeading] = useState("");
  const [subjectDuration, setSubjectDuration] = useState("");
  const [subjectPoints, setsubjectPoints] = useState([]);

  const addTeacherVerificationField = () => {
    setTeacherVerification([...teacherVerification, ""]);
  };

  // const handleTeacherVerificationChange = (index: number, value: string) => {
  //   const updatedTeacherVerification = [...teacherVerification];
  //   updatedTeacherVerification[index] = value;
  //   setTeacherVerification(updatedTeacherVerification);
  // };
  const handleTeacherVerificationChange = (index: number, value: string) => {
    const updatedTeacherVerification = [...teacherVerification];
    updatedTeacherVerification[index] = value;
    setTeacherVerification(updatedTeacherVerification);
  };

  const handleCreateSubject = async () => {
    const subject = {
      subjectName,
      subjectDescription,
      subjectImage,
      subjectPrice,
      subjectBoard,
      subjectGrade,
      teacherVerification,
      subjectNameSubHeading,
      subjectDuration,
      subjectPoints,
      subjectLanguage
    };
    const token = await AsyncStorage.getItem("authToken");
    try {
      axios.post(`http://${ipURL}/api/subjects/create`, subject, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert("Subject Created Successfully");
      router.push(`/(tabs)/profile`);
    } catch (err) {
      Alert.alert("Subject not created, Something Happened");
      console.log(err);
    }
  };
  console.log(
    subjectName,
    subjectDescription,
    subjectImage,
    subjectPrice,
    subjectBoard,
    subjectGrade,
    teacherVerification
  );

  const [inputText, setInputText] = useState("");

  const handleInputChange = (text) => {
    setInputText(text);
  };

  const handleAddItem = () => {
    if (inputText.trim() !== "") {
      setsubjectPoints([...subjectPoints, inputText]);
      setInputText("");
    }
  };
  console.log("dataArray", subjectPoints);

  return (
    <ScrollView>
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
        <View style={styles.inputContainerDesc}>
          <Ionicons name="menu-outline" size={20} color="#900" />
          <TextInput
            editable
            multiline
            numberOfLines={10}
            placeholder="Subject Description"
            value={subjectDescription}
            onChangeText={setSubjectDescription}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="camera-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            placeholder="Subject Image"
            value={subjectImage}
            onChangeText={setSubjectImage}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="cash-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            placeholder="Subject Price"
            keyboardType="numeric"
            value={subjectPrice.toString()}
            onChangeText={setSubjectPrice}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="school-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            placeholder="Subject Board"
            value={subjectBoard}
            onChangeText={setSubjectBoard}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="trophy-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            placeholder="Subject Grade"
            value={subjectGrade}
            onChangeText={setSubjectGrade}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="chatbox-ellipses-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            placeholder="Subject Language"
            value={subjectLanguage}
            onChangeText={setSubjectLanguage}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="chatbox-ellipses-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            placeholder="Subject Sub Heading"
            value={subjectNameSubHeading}
            onChangeText={setSubjectNameSubHeading}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="chatbox-ellipses-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            placeholder="Subject Duration"
            value={subjectDuration}
            onChangeText={setSubjectDuration}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="construct-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Add One Skill At A Time"
            placeholderTextColor={"gray"}
          />
          <TouchableOpacity onPress={handleAddItem}>
            <View style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={20} color="#900" />
              <Text>Add</Text>
            </View>
          </TouchableOpacity>
        </View>

        {teacherVerification.map((verification, index) => (
          <View key={index}>
            <View style={styles.inputContainer}>
              <Ionicons name="body-outline" size={20} color="#900" />
              <TextInput
                style={styles.input1}
                placeholder="Teacher Verification"
                value={verification}
                onChangeText={(value) =>
                  handleTeacherVerificationChange(index, value)
                }
              />
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={addTeacherVerificationField}>
          <View style={styles.addButton1}>
            <Ionicons name="add-circle-outline" size={20} color="#900" />
            <Text>Add</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleCreateSubject}>
          <Text style={styles.text}>Create Your Subject</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
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
  addButton1: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#b54034",
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2,
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
  inputContainerDesc: {
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
  },
  inputContainer1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    paddingHorizontal: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "gray",
  },
  button: {
    backgroundColor: "#b54034",
    padding: 10,
    borderRadius: 100,
    margin: 12,
  },
  text: {
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    color: "white",
    textAlign: "center",
  },
});

export default CreateSubject;
