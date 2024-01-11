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

const EditSingleSubject = () => {
  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");
  const [subjectImage, setSubjectImage] = useState("");
  const [subjectPrice, setSubjectPrice] = useState("");
  const [subjectBoard, setSubjectBoard] = useState("");
  const [subjectGrade, setSubjectGrade] = useState("");
  const [subjectLanguage, setSubjectLanguage] = useState("");

  const { editSubjectId } = useLocalSearchParams();

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
        console.log("resp data in useEffect", resp.data);

        setSubjectName(resp.data.subjectName);
        setSubjectBoard(resp.data.subjectBoard);
        setSubjectDescription(resp.data.subjectDescription);
        setSubjectGrade(resp.data.subjectGrade);
        setSubjectPrice(resp.data.subjectPrice);
        setSubjectLanguage(resp.data.subjectLanguage);
        setSubjectImage(resp.data.subjectImage);
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
    };
    console.log("this is subject", subject);
    try{
      const token = await AsyncStorage.getItem("authToken");
      axios.post(`https://${ipURL}/api/subjects/${editSubjectId}`, subject, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }catch(error){
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder={subjectName}
          defaultValue={subjectName}
          onChangeText={(text) => {
            setSubjectName(text);
          }}
        />
      </View>
      <View style={styles.inputContainerDesc}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          editable
          multiline
          placeholder={subjectDescription}
          defaultValue={subjectDescription}
          onChangeText={setSubjectDescription}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder={subjectImage}
          value={subjectImage}
          onChangeText={setSubjectImage}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder={subjectPrice}
          value={subjectPrice}
          onChangeText={setSubjectPrice}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder={subjectBoard}
          value={subjectBoard}
          onChangeText={setSubjectBoard}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder={subjectGrade}
          value={subjectGrade}
          onChangeText={setSubjectGrade}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="book-outline" size={20} color="#900" />
        <TextInput
          style={styles.input1}
          placeholder={subjectLanguage}
          value={subjectLanguage}
          onChangeText={setSubjectLanguage}
        />
      </View>
      
      <TouchableOpacity style={styles.button} onPress={handleCreateSubject}>
        <Text style={styles.text}>Edit Your Subject</Text>
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
  inputContainerDesc: {
    marginBottom: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 20,
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
