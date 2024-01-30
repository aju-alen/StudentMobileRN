import {
  ScrollView,
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
import { ipURL } from '../../utils/utils'
import { router, useLocalSearchParams, usePathname } from "expo-router";
interface SubjectData {
  subjectImage?: string;
  subjectName?: string;
  subjectBoard?: string;
  subjectDescription?: string;
  subjectGrade?: number;
  subjectPrice?: number;
  subjectTags?: [string];
}

const VerifySingleSubject = () => {
  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");
  const [subjectImage, setSubjectImage] = useState("");
  const [subjectPrice, setSubjectPrice] = useState("");
  const [subjectBoard, setSubjectBoard] = useState("");
  const [subjectGrade, setSubjectGrade] = useState("");
  const [subjectLanguage, setSubjectLanguage] = useState("");
  const [skillTags, setSkillTags] = useState([]);
  const [inputText, setInputText] = useState("");
  const [teacherVerification, setTeacherVerification] = useState(['']);
  const [singleSubjectData, setSingleSubjectData] = React.useState<SubjectData>(
    {}
  );
  const { verifySingleSubject } = useLocalSearchParams();
  console.log("local search params", useLocalSearchParams());
  const routeInfo = usePathname();
  console.log(routeInfo, 'route info');




  useEffect(() => {
    const getSubjects = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const resp = await axios.get(
          `http://${ipURL}/api/subjects/${verifySingleSubject}`,
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
        setSubjectGrade((resp.data.subjectGrade).toString());
        setSubjectPrice((resp.data.subjectPrice).toString());
        setSubjectLanguage(resp.data.subjectLanguage);
        setSubjectImage(resp.data.subjectImage);
        setTeacherVerification(resp.data.teacherVerification);

      } catch (error) {
        console.error("Error fetching subject data:", error);
      }
    };

    getSubjects();
  }, []);
  console.log(teacherVerification, 'teacher verification');


  const handleVerifySubject = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const resp = await axios.put(
        `http://${ipURL}/api/subjects/verify/${verifySingleSubject}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("resp data in useEffect", resp.data);
      router.replace('/(tabs)/verification');
    } catch (error) {
      console.error("Error fetching subject data:", error);
    }
  }
  const handleRejectSubject = async () => {}

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
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Ionicons name="book-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            value={subjectName}
            onChangeText={setSubjectName}
            editable={false}
          />
        </View>
        <View style={styles.inputContainerDesc}>
          <Ionicons name="menu-outline" size={20} color="#900" />
          <TextInput

            multiline
            numberOfLines={10}
            style={styles.input1}
            value={subjectDescription}
            onChangeText={setSubjectDescription}
            editable={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="camera-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            value={subjectImage}
            onChangeText={setSubjectImage}
            editable={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="cash-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            value={subjectPrice}
            onChangeText={setSubjectPrice}
            editable={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="school-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            value={subjectBoard}
            onChangeText={setSubjectBoard}
            editable={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="trophy-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            value={subjectGrade}
            onChangeText={setSubjectGrade}
            editable={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="chatbox-ellipses-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            value={subjectLanguage}
            onChangeText={setSubjectLanguage}
            editable={false}
          />
        </View>

        {teacherVerification.map((item) => {
          
          return (
            <View key={item}  style={styles.inputContainer}>
              <Ionicons name="chatbox-ellipses-outline" size={20} color="#900" />
              <TextInput
                style={styles.input1}
                value={item}
                onChangeText={setSubjectLanguage}
                editable={false}
              />
            </View>
          );
        })}


        {/* <View style={styles.inputContainer}>
          <Ionicons name="construct-outline" size={20} color="#900" />
          <TextInput
            style={styles.input1}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Add One Skill At A Time"
            editable = {false}
          /> */}
        {/* <TouchableOpacity onPress={handleAddItem}>
            <View style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={20} color="#900" />
              <Text>Add</Text>
            </View>
          </TouchableOpacity> */}
        {/* </View> */}
        {/* <TouchableOpacity style={styles.button} onPress={handleUpdateSubject}>
          <Text style={styles.text}>Create Your Subject</Text>
        </TouchableOpacity> */}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.verifybutton} onPress={handleVerifySubject}>
          <Text style={styles.text}>Verify Subject</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleRejectSubject}>
          <Text style={styles.text}>Reject Subject</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default VerifySingleSubject;

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
  verifybutton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 100,
    margin: 12,
  },
  buttonContainer: { flexDirection: "row", justifyContent: "center" }
});


