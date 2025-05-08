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
  Platform,
  Linking,
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
import { nanoid } from 'nanoid';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';


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
  const [isEulaAccepted, setIsEulaAccepted] = useState(false);
  const EULA_PDF_URL = `https://coachacademic.s3.ap-southeast-1.amazonaws.com/EULA+/COACHACADEM_TOU_(EULA).pdf`; // Replace with your actual EULA PDF URL

  console.log(pdf1, 'pdf1');
  console.log(pdf2, 'pdf2');
  
  
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
      subjectImage: image,
      subjectPrice,
      subjectBoard,
      subjectGrade,
      subjectDuration,
      subjectNameSubHeading,
      subjectSearchHeading:'search',
      subjectLanguage,
      subjectPoints,
      teacherVerification:[pdf1, pdf2],
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Create New Subject</Text>
            <Text style={styles.subHeaderText}>Fill in the details to create your subject</Text>
          </View>

          {/* Image Upload Section */}
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imageUploadContainer} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="image-outline" size={40} color={welcomeCOLOR.black} />
                  <Text style={styles.uploadText}>Upload Subject Image</Text>
                </View>
              )}
            </TouchableOpacity>
            {image && (
              <TouchableOpacity style={styles.confirmButton} onPress={uploadImageToBe}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Basic Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <FormInput
                label="Subject Title"
                placeholder="Enter subject title"
                value={subjectName}
                onChangeText={setSubjectName}
              />
              <FormInput
                label="Description"
                placeholder="Brief description of the subject"
                value={subjectDescription}
                onChangeText={setSubjectDescription}
                multiline
                height={100}
              />
              <FormInput
                label="Price"
                placeholder="Enter price"
                value={subjectPrice.toString()}
                onChangeText={setSubjectPrice}
                keyboardType="numeric"
              />
            </View>

            {/* Academic Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Academic Details</Text>
              <FormInput
                label="Board"
                placeholder="Educational board"
                value={subjectBoard}
                onChangeText={setSubjectBoard}
              />
              <FormInput
                label="Grade"
                placeholder="Target grade level"
                value={subjectGrade}
                onChangeText={setSubjectGrade}
              />
              <FormInput
                label="Language"
                placeholder="Teaching language"
                value={subjectLanguage}
                onChangeText={setSubjectLanguage}
              />
              <FormInput
                label="Duration"
                placeholder="Course duration"
                value={subjectDuration}
                onChangeText={setSubjectDuration}
              />
              <FormInput
                label="Search Heading"
                placeholder="What text should students seach to find this?"
                value={subjectSearchHeading}
                onChangeText={setSubjectSearchHeading}
              />
            </View>

            {/* Skills Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills & Points</Text>
              <View style={styles.skillInputContainer}>
                <TextInput
                  style={styles.skillInput}
                  placeholder="Add a new skill"
                  value={inputText}
                  onChangeText={handleInputChange}
                />
                <TouchableOpacity style={styles.addSkillButton} onPress={handleAddItem}>
                  <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              {subjectPoints.map((point, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{point}</Text>
                </View>
              ))}
            </View>

            {/* Document Upload Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Verification Documents</Text>
              <View style={styles.documentSection}>
                <TouchableOpacity
                  style={[styles.documentUpload, pdf1 && styles.documentUploaded]}
                  onPress={() => pickPdf('pdf1')}
                >
                  <Ionicons 
                    name={pdf1 ? "document-text" : "document-text-outline"} 
                    size={24} 
                    color={pdf1 ? COLORS.primary : "#666"}
                  />
                  <Text style={[styles.documentText, pdf1 && styles.documentUploadedText]}>
                    {pdf1 ? "Document 1 Uploaded" : "Upload Document 1"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.documentUpload, pdf2 && styles.documentUploaded]}
                  onPress={() => pickPdf('pdf2')}
                >
                  <Ionicons 
                    name={pdf2 ? "document-text" : "document-text-outline"} 
                    size={24} 
                    color={pdf2 ? COLORS.primary : "#666"}
                  />
                  <Text style={[styles.documentText, pdf2 && styles.documentUploadedText]}>
                    {pdf2 ? "Document 2 Uploaded" : "Upload Document 2"}
                  </Text>
                </TouchableOpacity>

                {(pdf1 || pdf2) && (
                  <TouchableOpacity 
                    style={styles.uploadDocsButton} 
                    onPress={uploadPdfsToAws}
                  >
                    <Text style={styles.uploadDocsText}>Confirm Documents</Text>
                    <Ionicons name="cloud-upload-outline" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* EULA Section */}
            <View style={styles.section}>
              <View style={styles.eulaContainer}>
                <TouchableOpacity 
                  style={styles.checkboxContainer}
                  onPress={() => setIsEulaAccepted(!isEulaAccepted)}
                >
                  <View style={[styles.checkbox, isEulaAccepted && styles.checked]}>
                    {isEulaAccepted && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text style={styles.eulaText}>
                    I agree to the{' '}
                    <Text 
                      style={styles.eulaLink}
                      onPress={() => Linking.openURL(EULA_PDF_URL)}
                    >
                      End User License Agreement (EULA)
                    </Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Create Subject"
              filled
              color={COLORS.primary}
              style={styles.submitButton}
              onPress={handleCreateSubject}
              disabled={!isEulaAccepted}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const FormInput = ({ label, ...props }) => (
  <View style={styles.inputWrapper}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, props.multiline && { height: props.height }]}
      placeholderTextColor="#666"
      {...props}
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: moderateScale(20),
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: moderateScale(24),
    fontWeight: 'bold',
    color: welcomeCOLOR.black,
  },
  subHeaderText: {
    fontSize: moderateScale(14),
    color: '#666',
    marginTop: verticalScale(5),
  },
  formContainer: {
    padding: moderateScale(20),
  },
  section: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: welcomeCOLOR.black,
    marginBottom: verticalScale(12),
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: verticalScale(20),
  },
  imageUploadContainer: {
    width: horizontalScale(300),
    height: verticalScale(150),
    borderRadius: moderateScale(12),
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: verticalScale(8),
    color: '#666',
    fontSize: moderateScale(14),
  },
  inputWrapper: {
    marginBottom: verticalScale(16),
  },
  inputLabel: {
    fontSize: moderateScale(14),
    color: '#444',
    marginBottom: verticalScale(6),
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    fontSize: moderateScale(16),
    color: welcomeCOLOR.black,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  skillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  skillInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginRight: horizontalScale(8),
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  addSkillButton: {
    padding: moderateScale(8),
  },
  skillTag: {
    backgroundColor: '#e3f2fd',
    borderRadius: moderateScale(16),
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(6),
    marginRight: horizontalScale(8),
    marginBottom: verticalScale(8),
    alignSelf: 'flex-start',
  },
  skillText: {
    color: COLORS.primary,
    fontSize: moderateScale(14),
  },
  documentSection: {
    gap: verticalScale(12),
  },
  documentUpload: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  documentUploaded: {
    backgroundColor: '#e3f2fd',
    borderColor: COLORS.primary,
  },
  documentText: {
    marginLeft: horizontalScale(12),
    fontSize: moderateScale(14),
    color: '#666',
  },
  documentUploadedText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  uploadDocsButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(8),
  },
  uploadDocsText: {
    color: 'white',
    fontSize: moderateScale(14),
    marginRight: horizontalScale(8),
  },
  confirmButton: {
    marginTop: verticalScale(8),
  },
  submitButton: {
    marginTop: verticalScale(24),
    marginBottom: verticalScale(40),
  },
  eulaContainer: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(20),
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(4),
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: horizontalScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: COLORS.primary,
  },
  eulaText: {
    fontSize: moderateScale(14),
    color: '#666',
    flex: 1,
  },
  eulaLink: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

export default CreateSubject;