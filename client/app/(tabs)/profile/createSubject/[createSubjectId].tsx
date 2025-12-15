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
  ActivityIndicator,
  Modal,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ipURL } from "../../../utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { horizontalScale, moderateScale, verticalScale } from "../../../utils/metrics";
import { COLORS, FONT } from "../../../../constants";
import { welcomeCOLOR } from "../../../../constants/theme";
import Button from "../../../components/Button";
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { axiosWithAuth } from "../../../utils/customAxios";
import * as Sentry from '@sentry/react-native';
import * as Crypto from 'expo-crypto';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRevenueCat } from '../../../providers/RevenueCatProvider';

// Add type definition for file object
type FileObject = {
  uri: string;
  name: string;
  type: string;
};

const CreateSubject = () => {
  const { createSubjectId, courseType, maxCapacity } = useLocalSearchParams(); //userId
  const revenueCatContext = useRevenueCat();
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
  const [isDocumentsConfirmed, setIsDocumentsConfirmed] = useState(false);
  const [isCreatingSubject, setIsCreatingSubject] = useState(false);
  const EULA_PDF_URL = `https://coachacademic.s3.ap-southeast-1.amazonaws.com/EULA+/COACHACADEM_TOU_(EULA).pdf`;
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Multi-student course fields
  const [currentCourseType, setCurrentCourseType] = useState<string>(courseType as string || 'SINGLE_STUDENT');
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentMaxCapacity, setCurrentMaxCapacity] = useState<number>(parseInt(maxCapacity as string) || 1);

  // Add initialization error tracking
  useEffect(() => {
    try {
      console.log('Initializing CreateSubject with ID:', createSubjectId);
      
      if (!createSubjectId) {
        throw new Error('createSubjectId is undefined');
      }

      // Set course type from params
      if (courseType) {
        setCurrentCourseType(courseType as string);
      }

      // Get max capacity from RevenueCat if multi-student
      // TODO: Re-enable RevenueCat checks after entitlement verification
      // For testing: use maxCapacity from params or default to 10
      if (courseType === 'MULTI_STUDENT') {
        if (maxCapacity) {
          setCurrentMaxCapacity(parseInt(maxCapacity as string));
        } else {
          setCurrentMaxCapacity(10); // Default for testing
        }
      }
      
      // Original RevenueCat check code (commented out for testing):
      // if (courseType === 'MULTI_STUDENT' && revenueCatContext?.getMultiStudentCapacity) {
      //   revenueCatContext.getMultiStudentCapacity().then((capacity) => {
      //     if (capacity) {
      //       setCurrentMaxCapacity(capacity);
      //     } else if (maxCapacity) {
      //       setCurrentMaxCapacity(parseInt(maxCapacity as string));
      //     }
      //   });
      // }

      Sentry.addBreadcrumb({
        category: 'component',
        message: 'CreateSubject component initialized',
        level: 'info',
        data: {
          createSubjectId,
          courseType: courseType || 'SINGLE_STUDENT',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          location: 'CreateSubject_initialization',
          component: 'CreateSubject'
        },
        extra: {
          error: error.message,
          stack: error.stack,
          createSubjectId
        }
      });
      
      Alert.alert(
        'Error',
        'Failed to initialize course creation. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }
  }, [createSubjectId, courseType, maxCapacity]);

  console.log(pdf1, 'pdf1');
  console.log(pdf2, 'pdf2');
  
  
  const awsId = Crypto.randomUUID();
  console.log(awsId, 'awsId');

  const pickPdf = async (pdfName) => {
    try {
      // Launch the document picker for PDFs
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', // Restrict to PDF files
        copyToCacheDirectory: true, // Store a copy in cache
      });
  
      if (result.canceled) {
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
      Sentry.captureException(error, {
        tags: {
          location: 'pickPdf',
          pdfName: pdfName
        },
        extra: {
          error: error.message,
          stack: error.stack
        }
      });
      Alert.alert('Error', 'Failed to pick PDF. Please try again.');
    }
  };

  const uploadPdfsToAws = async () => {
    if (!pdf1 || !pdf2) {
      Alert.alert('Please select both PDFs before uploading.');
      return;
    }
    
    try {
      console.log(awsId, 'awsIdinUploadPdf');
      
      const uriParts1 = pdf1.split('.');
      const fileType1 = uriParts1[uriParts1.length - 1];
    
      const uriParts2 = pdf2.split('.');
      const fileType2 = uriParts2[uriParts2.length - 1];
    
      const formData = new FormData();
    
      // Append both PDFs with type assertion
      formData.append('pdf1', {
        uri: pdf1,
        name: `pdf1.${fileType1}`,
        type: 'application/pdf',
      } as unknown as Blob);
      formData.append('pdf2', {
        uri: pdf2,
        name: `pdf2.${fileType2}`,
        type: 'application/pdf',
      } as unknown as Blob);
    
      // Append additional data if needed
      formData.append('uploadKey', 'pdfId');
      formData.append('awsId', awsId);
    
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
      setPdf1(response['data']['data1']['Location']);
      setPdf2(response['data']['data2']['Location']);
      setIsDocumentsConfirmed(true);
    
      Alert.alert('PDFs uploaded successfully.');
    
    } catch (error) {
 
      console.error('PDF upload failed:', error);
      Alert.alert('PDF upload failed', error.message);
      setIsDocumentsConfirmed(false);
    }
  };
  const pickImage = async () => {
    try {
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
        setIsImageUploading(true);
        const manipResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 800 } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.WEBP }
        );
        
        // Show temporary image while uploading
        setImage(manipResult.uri);
        
        // Automatically upload the image
        await uploadImageToBe(manipResult.uri);
        setIsImageUploading(false);
      }
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          location: 'pickImage'
        },
        extra: {
          error: error.message,
          stack: error.stack
        }
      });
      setIsImageUploading(false);
      Alert.alert('Error', 'Failed to process image. Please try again.');
      setImage(null);
    }
  };

  const uploadImageToBe = async (imageUri) => {
    if (!imageUri) return;
    
    try {
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as unknown as Blob);
      formData.append('uploadKey', 'subjectImageId');
      formData.append('awsId', awsId);

      const response = await axios.post(
        `${ipURL}/api/s3/upload-to-aws/${createSubjectId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setImage(response.data.data.Location);
    } catch (error) {
      
      console.error('Image upload failed', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
      setImage(null);
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

    setIsLoading(true);
    if (!isDocumentsConfirmed) {
      Alert.alert('Please confirm your documents first.');
      setIsLoading(false);
      return;
    }

    setIsCreatingSubject(true);
    
    try {
      // Validate all required fields
      const validationErrors = [];
      
      if (!subjectName.trim()) {
        validationErrors.push("Subject name is required");
        setIsLoading(false);
        return;
      }
      if (!subjectDescription.trim()) {
        validationErrors.push("Subject description is required");
        setIsLoading(false);
        return;
      }
      if (!image) {
        validationErrors.push("Subject image is required");
        setIsLoading(false);
        return;
      }
      if (!subjectPrice.trim()) {
        validationErrors.push("Subject price is required");
        setIsLoading(false);
        return;
      }
      if (!subjectBoard.trim()) {
        validationErrors.push("Educational board is required");
        setIsLoading(false);
        return;
      }
      if (!subjectGrade.trim()) {
        validationErrors.push("Grade level is required");
        setIsLoading(false);
        return;
      }
      if (!subjectDuration.trim()) {
        validationErrors.push("Course duration is required");
        setIsLoading(false);
        return;
      }
      if (!subjectLanguage.trim()) {
        validationErrors.push("Teaching language is required");
        setIsLoading(false);
        return;
      }

      // Validate multi-student course requirements
      if (currentCourseType === 'MULTI_STUDENT') {
        console.log(scheduledDateTime, 'scheduledDateTime');
        
        if (!scheduledDateTime) {
          validationErrors.push("Scheduled date and time is required for multi-student courses");
          setIsLoading(false);
          return;
        }
        if (scheduledDateTime <= new Date()) {
          validationErrors.push("Scheduled date and time must be in the future");
          setIsLoading(false);
          return;
        }
        if (currentMaxCapacity < 1) {
          validationErrors.push("Max capacity must be at least 1");
          setIsLoading(false);
          return;
        }
      }

      // if (!subjectNameSubHeading.trim()) {
      //   validationErrors.push("Subject subheading is required");
      // }
      if (subjectPoints.length === 0) {
        validationErrors.push("At least one skill point is required");
        setIsLoading(false);
        return;
      }
      if (!pdf1 || !pdf2) {
        validationErrors.push("Both verification documents are required");
        setIsLoading(false);
        return;
      }
      if (!isEulaAccepted) {
        validationErrors.push("You must accept the EULA to continue");
        setIsLoading(false);
        return;
      }

      // If there are validation errors, show them and return
      if (validationErrors.length > 0) {
        Alert.alert(
          "Missing Information",
          validationErrors.join("\n\n"),
          [{ text: "OK" }]
        );
        setIsCreatingSubject(false);
        setIsLoading(false);
        return;
      }
      
      const subject: any = {
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
        courseType: currentCourseType,
      };
      console.log(currentCourseType, 'currentCourseType');
      

      // Add multi-student specific fields
      if (currentCourseType === 'MULTI_STUDENT') {
        subject.scheduledDateTime = scheduledDateTime?.toISOString();
        subject.maxCapacity = currentMaxCapacity;
        console.log('inside multi');
        
      }
      
      console.log("subject", subject);
      const token = await AsyncStorage.getItem("authToken");
      
      const response = await axiosWithAuth.post(
        `${ipURL}/api/subjects/create`, 
        subject,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.status === 200 || response.status === 202) {
        Alert.alert(
          "Success",
          "Subject created successfully! The subject will be verified by the admin and will be live soon.",
          [
            {
              text: "OK",
              onPress: () => router.back()
            }
          ]
        );
      }
      setIsLoading(false);
    } catch (err) {
    
      console.log("error", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to create subject. Please try again.",
        [{ text: "OK" }]
      );
      setIsLoading(false);
    } finally {
      setIsCreatingSubject(false);
      setIsLoading(false);
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
            <TouchableOpacity 
              style={[
                styles.imageUploadContainer,
                image && styles.imageUploadContainerActive,
                isImageUploading && styles.uploadingContainer
              ]} 
              onPress={pickImage}
              disabled={isImageUploading}
            >
              {image ? (
                <>
                  <Image source={{ uri: image }} style={styles.uploadedImage} />
                  {isImageUploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                      <Text style={styles.uploadingText}>Uploading...</Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="image-outline" size={40} color={welcomeCOLOR.black} />
                  <Text style={styles.uploadText}>Upload Subject Image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Basic Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <FormInput
                label="Subject Title"
                info="Enter a clear and concise title for your subject. This will be the main identifier for your course."
                placeholder="Enter subject title"
                value={subjectName}
                onChangeText={setSubjectName}
              />
              <FormInput
                label="Description"
                info="Provide a detailed description of what students will learn in this subject. Include key topics and learning outcomes."
                placeholder="Brief description of the subject"
                value={subjectDescription}
                onChangeText={setSubjectDescription}
                multiline
                height={100}
              />
              <FormInput
                label="Price"
                info="Set the price for your subject in AED."
                placeholder="Enter price"
                value={subjectPrice.toString()}
                onChangeText={(text) => {
                  // Only allow numbers
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setSubjectPrice(numericValue);
                }}
                isPrice
              />
            </View>

            {/* Academic Details Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Academic Details</Text>
              <CustomDropdown
                label="Board"
                info="Select the educational board that this subject aligns with."
                value={subjectBoard}
                options={[
                  { label: 'CBSE', value: 'CBSE' },
                  { label: 'ICSE', value: 'ICSE' },
                  { label: 'AP', value: 'AP' },
                  { label: 'IGCSE-A Levels', value: 'IGCSE-A Levels' },
                  { label: 'IB', value: 'IB' },
                ]}
                onSelect={setSubjectBoard}
                placeholder="Select educational board"
              />
              <CustomDropdown
                label="Grade"
                info="Select the target grade level for this subject."
                value={subjectGrade}
                options={Array.from({ length: 13 }, (_, i) => ({
                  label: `Grade ${i + 1}`,
                  value: (i + 1).toString()
                }))}
                onSelect={setSubjectGrade}
                placeholder="Select grade level"
              />
              <FormInput
                label="Language"
                info="Specify the primary language of instruction for this subject."
                placeholder="Teaching language"
                value={subjectLanguage}
                onChangeText={setSubjectLanguage}
              />
              <FormInput
                label="Duration"
                info="Enter the total number of hours for this course."
                placeholder="Enter duration"
                value={subjectDuration}
                onChangeText={(text) => {
                  // Only allow numbers
                  const numericValue = text.replace(/[^0-9]/g, '');
                  setSubjectDuration(numericValue);
                }}
                keyboardType="numeric"
                isDuration
              />
              {/* Multi-Student Course Date/Time Picker */}
              {currentCourseType === 'MULTI_STUDENT' && (
                <View style={styles.inputWrapper}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>Scheduled Date & Time</Text>
                    <TouchableOpacity 
                      onPress={() => Alert.alert('Scheduled Date & Time', 'Select the date and time when this multi-student course will take place. This will be the same for all enrolled students.')}
                      style={styles.infoButton}
                    >
                      <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.dateTimeContainer}>
                    <TouchableOpacity
                      style={styles.dateTimeButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.dateTimeText}>
                        {scheduledDateTime 
                          ? scheduledDateTime.toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })
                          : 'Select Date'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.dateTimeButton}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.dateTimeText}>
                        {scheduledDateTime
                          ? scheduledDateTime.toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: true
                            })
                          : 'Select Time'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {Platform.OS === 'ios' ? (
                    <>
                      {showDatePicker && (
                        <Modal
                          visible={showDatePicker}
                          transparent={true}
                          animationType="slide"
                          onRequestClose={() => setShowDatePicker(false)}
                        >
                          <View style={styles.pickerModalContainer}>
                            <View style={styles.pickerModalContent}>
                              <View style={styles.iosPickerHeader}>
                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                  <Text style={styles.iosPickerCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={styles.iosPickerTitle}>Select Date</Text>
                                <TouchableOpacity
                                  onPress={() => setShowDatePicker(false)}
                                >
                                  <Text style={styles.iosPickerDoneText}>Done</Text>
                                </TouchableOpacity>
                              </View>
                              <DateTimePicker
                                value={scheduledDateTime || new Date()}
                                mode="date"
                                display="spinner"
                                minimumDate={new Date()}
                                onChange={(event, selectedDate) => {
                                  if (selectedDate) {
                                    const currentTime = scheduledDateTime || new Date();
                                    const newDateTime = new Date(selectedDate);
                                    newDateTime.setHours(currentTime.getHours());
                                    newDateTime.setMinutes(currentTime.getMinutes());
                                    setScheduledDateTime(newDateTime);
                                    
                                  }
                                }}
                                style={styles.iosPicker}
                              />
                            </View>
                          </View>
                        </Modal>
                      )}
                      {showTimePicker && (
                        <Modal
                          visible={showTimePicker}
                          transparent={true}
                          animationType="slide"
                          onRequestClose={() => setShowTimePicker(false)}
                        >
                          <View style={styles.pickerModalContainer}>
                            <View style={styles.pickerModalContent}>
                              <View style={styles.iosPickerHeader}>
                                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                  <Text style={styles.iosPickerCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <Text style={styles.iosPickerTitle}>Select Time</Text>
                                <TouchableOpacity
                                  onPress={() => setShowTimePicker(false)}
                                >
                                  <Text style={styles.iosPickerDoneText}>Done</Text>
                                </TouchableOpacity>
                              </View>
                              <DateTimePicker
                                value={scheduledDateTime || new Date()}
                                mode="time"
                                display="spinner"
                                onChange={(event, selectedTime) => {
                                  if (selectedTime) {
                                    const currentDate = scheduledDateTime || new Date();
                                    const newDateTime = new Date(currentDate);
                                    newDateTime.setHours(selectedTime.getHours());
                                    newDateTime.setMinutes(selectedTime.getMinutes());
                                    setScheduledDateTime(newDateTime);
                                  }
                                }}
                                style={styles.iosPicker}
                              />
                            </View>
                          </View>
                        </Modal>
                      )}
                    </>
                  ) : (
                    <>
                      {showDatePicker && (
                        <DateTimePicker
                          value={scheduledDateTime || new Date()}
                          mode="date"
                          display="default"
                          minimumDate={new Date()}
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (event.type === 'set' && selectedDate) {
                              const currentTime = scheduledDateTime || new Date();
                              const newDateTime = new Date(selectedDate);
                              newDateTime.setHours(currentTime.getHours());
                              newDateTime.setMinutes(currentTime.getMinutes());
                              setScheduledDateTime(newDateTime);
                            }
                          }}
                        />
                      )}
                      {showTimePicker && (
                        <DateTimePicker
                          value={scheduledDateTime || new Date()}
                          mode="time"
                          display="default"
                          onChange={(event, selectedTime) => {
                            setShowTimePicker(false);
                            if (event.type === 'set' && selectedTime) {
                              const currentDate = scheduledDateTime || new Date();
                              const newDateTime = new Date(currentDate);
                              newDateTime.setHours(selectedTime.getHours());
                              newDateTime.setMinutes(selectedTime.getMinutes());
                              setScheduledDateTime(newDateTime);
                            }
                          }}
                        />
                      )}
                    </>
                  )}
                  <View style={styles.capacityInfo}>
                    <Text style={styles.capacityText}>
                      Max Capacity: {currentMaxCapacity} students
                    </Text>
                  </View>
                </View>
              )}
              <FormInput
                label="Search Heading"
                info="Add keywords that will help students find your subject when searching. Use relevant terms and topics."
                placeholder="What text should students search to find this?"
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
                    {pdf1 ? "Subject License Uploaded" : "Upload Subject License"}
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
                    {pdf2 ? "Emirates ID Uploaded" : "Upload Emirates ID"}
                    </Text>
                </TouchableOpacity>

                {(pdf1 || pdf2) && (
                  <TouchableOpacity 
                    style={styles.uploadDocsButton} 
                    onPress={uploadPdfsToAws}
                    activeOpacity={0.7}
                  >
                    <View style={styles.uploadDocsButtonContent}>
                      <Ionicons name="cloud-upload" size={24} color="white" />
                      <Text style={styles.uploadDocsText}>Confirm Documents</Text>
                    </View>
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

            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: COLORS.primary,
                  opacity: (!isEulaAccepted || !isDocumentsConfirmed || isLoading) ? 0.5 : 1
                }
              ]}
              onPress={handleCreateSubject}
              disabled={!isEulaAccepted || !isDocumentsConfirmed || isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? <ActivityIndicator size="large" color={COLORS.white} /> : "Create Subject"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

interface FormInputProps {
  label: string;
  info?: string;
  isPrice?: boolean;
  isDuration?: boolean;
  [key: string]: any;
}

const FormInput = ({ label, info, isPrice = false, isDuration = false, ...props }: FormInputProps) => (
  <View style={styles.inputWrapper}>
    <View style={styles.labelContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      {info && (
        <TouchableOpacity 
          onPress={() => Alert.alert(label, info)}
          style={styles.infoButton}
        >
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          props.multiline && { height: props.height },
          (isPrice || isDuration) && styles.numericInput
        ]}
        placeholderTextColor="#666"
        keyboardType={(isPrice || isDuration) ? "numeric" : "default"}
        {...props}
      />
      {isPrice && (
        <View style={styles.currencySuffix}>
          <Text style={styles.currencyText}>/AED</Text>
        </View>
      )}
      {isDuration && (
        <View style={styles.currencySuffix}>
          <Text style={styles.currencyText}>/hours</Text>
        </View>
      )}
    </View>
  </View>
);

const CustomDropdown = ({ label, info, value, options, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.inputWrapper}>
      <View style={styles.labelContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        {info && (
          <TouchableOpacity 
            onPress={() => Alert.alert(label, info)}
            style={styles.infoButton}
          >
            <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={[
          styles.dropdownButtonText,
          !value && styles.placeholderText
        ]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    value === option.value && styles.selectedOption
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[
                    styles.optionText,
                    value === option.value && styles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

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
  imageUploadContainerActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff',
  },
  uploadingContainer: {
    opacity: 0.7,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  input: {
    flex: 1,
    padding: moderateScale(12),
    fontSize: moderateScale(16),
    color: welcomeCOLOR.black,
  },
  priceInput: {
    flex: 1,
    padding: moderateScale(12),
    fontSize: moderateScale(16),
    color: welcomeCOLOR.black,
  },
  currencySuffix: {
    paddingRight: moderateScale(12),
    paddingLeft: moderateScale(4),
    borderLeftWidth: 1,
    borderLeftColor: '#e1e1e1',
  },
  currencyText: {
    fontSize: moderateScale(14),
    color: '#666',
    fontWeight: '500',
  },
  skillInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  skillInput: {
    flex: 1,
    padding: moderateScale(12),
    fontSize: moderateScale(16),
    color: welcomeCOLOR.black,
  },
  addSkillButton: {
    padding: moderateScale(12),
    borderLeftWidth: 1,
    borderLeftColor: '#e1e1e1',
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
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginTop: verticalScale(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  uploadDocsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(8),
  },
  uploadDocsText: {
    color: 'white',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  confirmButton: {
    marginTop: verticalScale(12),
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  confirmButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(8),
  },
  confirmButtonText: {
    color: 'white',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  submitButton: {
    width: '100%',
    height: verticalScale(50),
    borderRadius: moderateScale(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(40),
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontFamily: FONT.bold,
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
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 8,
    color: COLORS.primary,
    fontSize: moderateScale(14),
    fontWeight: '500',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(6),
  },
  infoButton: {
    marginLeft: horizontalScale(8),
    padding: moderateScale(4),
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  dropdownButtonText: {
    fontSize: moderateScale(16),
    color: welcomeCOLOR.black,
  },
  placeholderText: {
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: moderateScale(12),
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: welcomeCOLOR.black,
  },
  optionsList: {
    maxHeight: moderateScale(300),
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  selectedOption: {
    backgroundColor: '#f8f9fa',
  },
  optionText: {
    fontSize: moderateScale(16),
    color: welcomeCOLOR.black,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  numericInput: {
    flex: 1,
    padding: moderateScale(12),
    fontSize: moderateScale(16),
    color: welcomeCOLOR.black,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: horizontalScale(12),
    marginTop: verticalScale(8),
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#e1e1e1',
    gap: horizontalScale(8),
  },
  dateTimeText: {
    fontSize: moderateScale(14),
    color: welcomeCOLOR.black,
    flex: 1,
  },
  capacityInfo: {
    marginTop: verticalScale(8),
    padding: moderateScale(8),
    backgroundColor: '#E3F2FD',
    borderRadius: moderateScale(8),
  },
  capacityText: {
    fontSize: moderateScale(12),
    color: COLORS.primary,
    fontFamily: FONT.medium,
  },
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    paddingBottom: verticalScale(20),
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  iosPickerTitle: {
    fontSize: moderateScale(18),
    fontFamily: FONT.bold,
    color: welcomeCOLOR.black,
  },
  iosPickerCancelText: {
    fontSize: moderateScale(16),
    color: '#666',
    fontFamily: FONT.medium,
  },
  iosPickerDoneText: {
    fontSize: moderateScale(16),
    color: COLORS.primary,
    fontFamily: FONT.bold,
  },
  iosPicker: {
    height: verticalScale(200),
  },
});

export default CreateSubject;