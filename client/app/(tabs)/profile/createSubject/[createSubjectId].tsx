import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ipURL } from "../../../utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { horizontalScale, moderateScale, verticalScale } from "../../../utils/metrics";
import { COLORS } from "../../../../constants";
import { welcomeCOLOR } from "../../../../constants/theme";
import Button from "../../../components/Button";
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { nanoid } from 'nanoid'
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system'; // Optional, for file manipulation


const CreateSubject = () => {
  const { createSubjectId } = useLocalSearchParams(); //userId
  const [subjectName, setSubjectName] = useState("");
  const [subjectDescription, setSubjectDescription] = useState("");
  const [image, setImage] = useState(null);
  const [subjectPrice, setSubjectPrice] = useState("");
  const [subjectBoard, setSubjectBoard] = useState("");
  const [subjectGrade, setSubjectGrade] = useState("");
  const [teacherVerification, setTeacherVerification] = useState([""]);
  const [subjectLanguage, setSubjectLanguage] = useState("");
  const [subjectNameSubHeading, setSubjectNameSubHeading] = useState("");
  const [subjectSearchHeading, setSubjectSearchHeading] = useState("");
  const [subjectDuration, setSubjectDuration] = useState("");
  const [subjectPoints, setsubjectPoints] = useState([]);
  const [pdf1, setPdf1] = useState(null);
  const [pdf2, setPdf2] = useState(null);
  
  const awsId = nanoid();

  const pickPdf = async (pdfName) => {
    try {
      // Launch the document picker for PDFs
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', // Restrict to PDF files
        copyToCacheDirectory: true, // Store a copy in cache
      });
  
      if (result.type === 'cancel') {
        // User canceled the picker
        return;
      }
      console.log('Selected PDF:', result.assets[0]['uri']);
  
      // Store the PDF URI depending on which PDF was picked
      if (pdfName === 'pdf1') {
        setPdf1(result.assets[0]['uri']); // Directly set the PDF URI
      } else {
        setPdf2(result.assets[0]['uri']); // Directly set the PDF URI
      }
  
      // Optionally get file info
      const fileInfo = await FileSystem.getInfoAsync(result.assets[0]['uri']);
      console.log('File info:', fileInfo);
  
    } catch (error) {
      console.log('Error while picking PDF:', error);
    }
  };

  const uploadPdfsToAws = async () => {
    if (!pdf1 || !pdf2) {
      Alert.alert('Please select both PDFs before uploading.');
      return;
    }
    console.log(awsId, 'awsIdinUploadPdf');
    
    const uriParts1 = pdf1.split('.');
    const fileType1 = uriParts1[uriParts1.length - 1];
  
    const uriParts2 = pdf2.split('.');
    const fileType2 = uriParts2[uriParts2.length - 1];
  
    const formData = new FormData();
  
    // Append both PDFs
    formData.append('pdf1', {
      uri: pdf1,
      name: `pdf1.${fileType1}`,
      type: 'application/pdf',
    });
    formData.append('pdf2', {
      uri: pdf2,
      name: `pdf2.${fileType2}`,
      type: 'application/pdf',
    });
  
    // Append additional data if needed
    formData.append('uploadKey', 'pdfId'); // your key
    formData.append('awsId', awsId); // assuming awsId is a variable
  
    try {
      console.log('Form Data to be sent:', formData);
  
      const response = await axios.post(
        `${ipURL}/api/s3/upload-to-aws/pdf-verify/${createSubjectId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      console.log('PDFs uploaded successfully:', response.data);
  
      // Handle response locations for both PDFs
      setPdf1(response['data']['data1']['Location']); // Assume API sends back locations
      
      setPdf2(response['data']['data2']['Location']);
  
      Alert.alert('PDFs uploaded successfully.');
  
    } catch (error) {
      console.error('PDF upload failed:', error);
      Alert.alert('PDF upload failed', error.message);
    }
  };
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission to access the gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }], // Resize the image
        { compress: 0.5, format: ImageManipulator.SaveFormat.WEBP } // Compress the image
      );
      setImage(manipResult.uri);
    }
  };

  const uploadImageToBe = async () => {
    if (!image) return;
    console.log(awsId, 'awsIdinUploadImage');
    
    const uriParts = image.split('.');
    const fileType = uriParts[uriParts.length - 1];
    console.log("file type", fileType);
    console.log("uri parts", uriParts);
    

    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });
    formData.append('uploadKey','subjectImageId' ); // assuming userId is a variable
    formData.append('awsId',awsId); // assuming userId is a variable

    try {
      console.log(formData, 'form data');
      
      const response = await axios.post(`${ipURL}/api/s3/upload-to-aws/${createSubjectId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image uploaded successfully', response.data.data.Location);

      setImage(response.data.data.Location);

      // Alert.alert('Image uploaded successfully. You can now submit the form');
      
    } catch (error) {
      console.error('Image upload failed', error);
      Alert.alert('Image upload failed', error.message);
    }
  };


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
    console.log("image in final link", image);
    console.log("pdf1", pdf1);
    
    
    const subject = {
      subjectName,
      subjectDescription,
      subjectPrice,
      subjectBoard,
      subjectGrade,
      subjectImage: image,
      teacherVerification:[pdf1, pdf2],
      subjectNameSubHeading,
      subjectDuration,
      subjectPoints,
      subjectLanguage,
      subjectSearchHeading:'search'
    };
    console.log("subject", subject);
    const token = await AsyncStorage.getItem("authToken");
    try {
      axios.post(`${ipURL}/api/subjects/create`, subject, {
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
  console.log(image, "imageeee in the end");
  
  
  return (
    <SafeAreaView style={{ flex: 1,  }}>
    <ScrollView>
      
    <View style={{ flex: 1, marginHorizontal: horizontalScale(22) }}>
                    {/* <KeyboardAvoidingView style={styles.container} behavior= > */}
                        <View style={{ marginVertical: verticalScale(22) }}>
                            <Text style={{
                                fontSize: moderateScale(22),
                                fontWeight: 'bold',
                                marginVertical: verticalScale(12),
                                color: welcomeCOLOR.black
                            }}>
                                Create Account
                            </Text>


                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Subject Title</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="This name will be displayed to students"
                                    placeholderTextColor="gray"
                                    value={subjectName}
                                    onChangeText={setSubjectName}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Subject Description</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="A brief description of the subject"
                                    placeholderTextColor="gray"
                                    multiline
                                    numberOfLines={10}
                                    value={subjectDescription}
                                    onChangeText={setSubjectDescription}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Upload Image</Text>

<TouchableOpacity style={styles.profilePictureContainer} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profilePicture} />
        ) : (
          <Text style={styles.addProfilePictureText}>Add Subject Image</Text>
        )}
      </TouchableOpacity>
      {image && (
        <View style={styles.imageConfirmContainer}> 
      <TouchableOpacity onPress={uploadImageToBe}>
        <Text> ✅ </Text>
        </TouchableOpacity>
        </View>
        )}
     
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Subject Price</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="Enter Subject Price"
                                    placeholderTextColor="gray"
                                    multiline
                                    numberOfLines={10}
                                    value={subjectPrice.toString()}
                                    onChangeText={setSubjectPrice}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Subject Board</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="What Subject board"
                                    placeholderTextColor="gray"
                                    multiline
                                    numberOfLines={10}
                                    value={subjectBoard}
                                    onChangeText={setSubjectBoard}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Subject Grade</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="What Subject Grade"
                                    placeholderTextColor="gray"
                                    multiline
                                    numberOfLines={10}
                                    value={subjectGrade}
                                    onChangeText={setSubjectGrade}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Subject Language</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="What language will you teach in"
                                    placeholderTextColor="gray"
                                    multiline
                                    numberOfLines={10}
                                    value={subjectLanguage}
                                    onChangeText={setSubjectLanguage}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Subject Name Heading</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="Subject Name Heading"
                                    placeholderTextColor="gray"
                                    multiline
                                    numberOfLines={10}
                                    value={subjectNameSubHeading}
                                    onChangeText={setSubjectNameSubHeading}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Subject Search Heading</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="Subject Search Heading"
                                    placeholderTextColor="gray"
                                    multiline
                                    numberOfLines={10}
                                    value={subjectSearchHeading}
                                    onChangeText={setSubjectSearchHeading}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Subject Duration</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="Subject Duration"
                                    placeholderTextColor="gray"
                                    multiline
                                    numberOfLines={10}
                                    value={subjectDuration}
                                    onChangeText={setSubjectDuration}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Add a skill</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="Subject Duration"
                                    placeholderTextColor="gray"
                                    multiline
                                    numberOfLines={10}
                                    value={inputText}
                                    onChangeText={handleInputChange}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                                <TouchableOpacity onPress={handleAddItem}>
            <View style={styles.addButton}>
              <Ionicons name="add-circle-outline" size={20} color="#900" />
              <Text>Add</Text>
            </View>
          </TouchableOpacity>
                            </View>
                        </View>


                        <View style={styles.container}>
      <Text style={styles.title}>Upload Two PDFs</Text>

      {/* PDF 1 Input */}
      <TouchableOpacity
        style={[styles.pdfBox,pdf1]} 
        onPress={() => pickPdf('pdf1')}>
        {pdf1 ? (
          <>
            <Ionicons name="document-attach-outline" size={24} color="#4CAF50" />
            <Text style={styles.pdfUploadedText}>PDF 1 Uploaded</Text>
          </>
        ) : (
          <>
            <Ionicons name="document-outline" size={24} color="#AAAAAA" />
            <Text style={styles.pdfBoxText}>Add PDF 1</Text>
          </>
        )}
      </TouchableOpacity >
      <TouchableOpacity onPress={() => setPdf1(null)} style={{
        alignItems: 'center',
      }}>
      <Text> ✅ </Text>
            </TouchableOpacity>

      {/* PDF 2 Input */}
      <TouchableOpacity
        style={[styles.pdfBox, pdf2]} 
        onPress={() => pickPdf('pdf2')}>
        {pdf2 ? (
          <>
            <Ionicons name="document-attach-outline" size={24} color="#4CAF50" />
            <Text style={styles.pdfUploadedText}>PDF 2 Uploaded</Text>
          </>
        ) : (
          <>
            <Ionicons name="document-outline" size={24} color="#AAAAAA" />
            <Text style={styles.pdfBoxText}>Add PDF 2</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={uploadPdfsToAws} style={{
        alignItems: 'center',
      }}>
      <Text> ✅ </Text>
            </TouchableOpacity>
    </View>
                    
                    <Button
                        title="Create Subject"
                        filled
                        color={COLORS.primary
                        }
                        style={{
                            marginTop: verticalScale(18),
                            marginBottom: verticalScale(4),
                        }}
                        onPress={handleCreateSubject}
                    />
                    {/* </KeyboardAvoidingView> */}

                </View>
    </ScrollView>
    </SafeAreaView>
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
  profilePictureContainer: {
    width: horizontalScale(300),
    height: verticalScale(150),
    marginLeft: horizontalScale(15),
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addProfilePictureText: {
    fontSize: 16,
    color: '#555',
  },
  imageConfirmContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    marginBottom: verticalScale(16),
    textAlign: 'center',
    color: '#333',
  },
  pdfBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(16),
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#DDD',
  },
  pdfBoxFilled: {
    backgroundColor: '#e8f5e9', // Light green for uploaded state
    borderColor: '#4CAF50', // Green border for uploaded state
  },
  pdfBoxText: {
    fontSize: moderateScale(16),
    marginLeft: moderateScale(8),
    color: '#AAAAAA',
  },
  pdfUploadedText: {
    fontSize: moderateScale(16),
    marginLeft: moderateScale(8),
    color: '#4CAF50',
  },
});

export default CreateSubject;

  {/* <View style={styles.container}>
      
       
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
      </View> */}