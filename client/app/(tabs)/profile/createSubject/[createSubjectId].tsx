import axios from "axios";
import React, { useEffect, useMemo, useState } from "react";
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
import { Calendar } from 'react-native-calendars';
import { useRevenueCat } from '../../../providers/RevenueCatProvider';

// Add type definition for file object
type FileObject = {
  uri: string;
  name: string;
  type: string;
};

const CreateSubject = () => {
  const { createSubjectId, courseType, maxCapacity, maxHours } = useLocalSearchParams(); //userId
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

  // Package course (Single/Multi): duration 3–20, topics with hours per topic (max 3h); multi = teacher assigns date/time per topic
  const isPackageCourse = currentCourseType === 'SINGLE_PACKAGE' || currentCourseType === 'MULTI_PACKAGE';
  const [numberOfTopics, setNumberOfTopics] = useState('');
  type TopicBlock = { topicTitle: string; hours: string; scheduledDateTime?: Date | null };
  const [topicBlocks, setTopicBlocks] = useState<TopicBlock[]>([]);
  const [showTopicDatePicker, setShowTopicDatePicker] = useState<number | null>(null);
  const [showTopicTimePicker, setShowTopicTimePicker] = useState<number | null>(null);

  // Teacher availability for MULTI_STUDENT / MULTI_PACKAGE (only book when teacher is free)
  const [teacherBookedSlots, setTeacherBookedSlots] = useState<string[]>([]);
  const [teacherUnavailableDates, setTeacherUnavailableDates] = useState<string[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedAvailDate, setSelectedAvailDate] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [editingTopicIndex, setEditingTopicIndex] = useState<number | null>(null);
  const [topicCalendarDate, setTopicCalendarDate] = useState('');

  // Topic hours sum must match duration (package courses); computed once per topicBlocks change for performance
  const topicHoursSum = useMemo(
    () => topicBlocks.reduce((sum, b) => sum + parseInt(b.hours || '0', 10), 0),
    [topicBlocks]
  );
  const durationNum = useMemo(() => parseInt(subjectDuration, 10) || 0, [subjectDuration]);
  const topicHoursMatchDuration = isPackageCourse && topicBlocks.length > 0 && topicHoursSum === durationNum;

  const getDraftKey = (userId: string | string[] | undefined, courseType: string) =>
    `subjectDraft:${userId}:${courseType}`;

  // Add initialization error tracking
  useEffect(() => {
    try {
      if (!createSubjectId) {
        throw new Error('createSubjectId is undefined');
      }

      // Set course type from params
      if (courseType) {
        setCurrentCourseType(courseType as string);
      }

      // Get max capacity from params for multi-student
      if (courseType === 'MULTI_STUDENT') {
        if (maxCapacity) {
          const cap = parseInt(maxCapacity as string, 10);
          setCurrentMaxCapacity(Number.isNaN(cap) ? 10 : cap);
        } else {
          setCurrentMaxCapacity(10);
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

  // Load draft (if any) on mount
  useEffect(() => {
    const loadDraftIfExists = async () => {
      if (!createSubjectId || !currentCourseType) return;
      try {
        const key = getDraftKey(createSubjectId, currentCourseType);
        const stored = await AsyncStorage.getItem(key);
        if (!stored) return;

        const draft = JSON.parse(stored);

        setSubjectName(draft.subjectName ?? "");
        setSubjectDescription(draft.subjectDescription ?? "");
        setSubjectPrice(draft.subjectPrice ?? "");
        setSubjectBoard(draft.subjectBoard ?? "");
        setSubjectGrade(draft.subjectGrade ?? "");
        setSubjectLanguage(draft.subjectLanguage ?? "");
        setSubjectNameSubHeading(draft.subjectNameSubHeading ?? "");
        setSubjectSearchHeading(draft.subjectSearchHeading ?? "");
        setSubjectDuration(draft.subjectDuration ?? "");
        setsubjectPoints(draft.subjectPoints ?? []);
        // Do not restore image or PDFs from draft to avoid heavy data in storage
        setIsEulaAccepted(!!draft.isEulaAccepted);
        setIsDocumentsConfirmed(!!draft.isDocumentsConfirmed);

        if (draft.currentMaxCapacity != null) {
          setCurrentMaxCapacity(draft.currentMaxCapacity);
        }

        if (draft.scheduledDateTime) {
          try {
            setScheduledDateTime(new Date(draft.scheduledDateTime));
          } catch {
            setScheduledDateTime(null);
          }
        }

        if (draft.numberOfTopics != null) {
          setNumberOfTopics(draft.numberOfTopics);
        }

        if (Array.isArray(draft.topicBlocks)) {
          const hydratedBlocks = draft.topicBlocks.map((b: any) => ({
            topicTitle: b.topicTitle ?? "",
            hours: b.hours ?? "1",
            ...(b.scheduledDateTime
              ? { scheduledDateTime: new Date(b.scheduledDateTime) as Date }
              : { scheduledDateTime: null as Date | null }),
          }));
          setTopicBlocks(hydratedBlocks);
        }
      } catch (e) {
        console.error("Failed to load subject draft", e);
      }
    };

    loadDraftIfExists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createSubjectId, currentCourseType]);

  // Generate time slots 09:00–17:00 (HH:mm)
  const generateTimeSlots = (): { time: string; available: boolean }[] => {
    const slots: { time: string; available: boolean }[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, available: true });
    }
    return slots;
  };

  const normalizeTime = (t: string): string => {
    const parts = String(t || '').trim().split(':');
    const h = parseInt(parts[0], 10);
    const m = parts[1] != null ? parseInt(parts[1], 10) : 0;
    return `${(isNaN(h) ? 0 : h).toString().padStart(2, '0')}:${(isNaN(m) ? 0 : m).toString().padStart(2, '0')}`;
  };

  const fetchTeacherAvailability = async (dateStr: string, durationHours: number, sessionBlockedSlots: string[] = []) => {
    if (!dateStr) return;
    setAvailabilityLoading(true);
    try {
      const res = await axiosWithAuth.get(`${ipURL}/api/bookings/teacher/my-availability`, {
        params: { date: dateStr },
      });
      const booked = (res.data.bookedSlots || []).map(normalizeTime);
      const unavailable = res.data.unavailableDates || [];
      setTeacherBookedSlots(booked);
      setTeacherUnavailableDates(unavailable);
      const allBlocked = [...new Set([...booked, ...sessionBlockedSlots.map(normalizeTime)])];
      const baseSlots = generateTimeSlots();

      // Prevent creating courses in past times for *today*:
      // - Compare selected calendar date to today's date
      // - Ceil current time to the next whole hour (10:10 → 11:00).
      //   If already at an exact hour (10:00), use that hour as the minimum.
      const todayStr = new Date().toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      let minAllowedHourForToday = 0;
      if (isToday) {
        const now = new Date();
        let hour = now.getHours();
        if (now.getMinutes() > 0 || now.getSeconds() > 0 || now.getMilliseconds() > 0) {
          hour += 1;
        }
        minAllowedHourForToday = hour;
      }

      const duration = Math.max(1, Math.min(3, durationHours));
      const updated = baseSlots.map((slot) => {
        const normalized = normalizeTime(slot.time);
        const [h] = normalized.split(':').map(Number);
        if (duration === 1) {
          let available = !allBlocked.includes(normalized);
          if (isToday && h < minAllowedHourForToday) {
            available = false;
          }
          return { ...slot, available };
        }
        let allFree = true;
        for (let i = 0; i < duration; i++) {
          const checkHour = h + i;
          if (checkHour > 17) {
            allFree = false;
            break;
          }
          const checkTime = `${checkHour.toString().padStart(2, '0')}:00`;
          if (allBlocked.includes(checkTime)) {
            allFree = false;
            break;
          }
        }
        let available = allFree;
        if (isToday && h < minAllowedHourForToday) {
          available = false;
        }
        return { ...slot, available };
      });
      setAvailableTimeSlots(updated);
    } catch (err) {
      console.error('Failed to fetch teacher availability', err);
      Alert.alert('Error', 'Failed to load your availability. Please try again.');
      setAvailableTimeSlots(generateTimeSlots());
    } finally {
      setAvailabilityLoading(false);
    }
  };

 
  const awsId = Crypto.randomUUID();

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
  
      // Store the PDF URI depending on which PDF was picked
      if (pdfName === 'pdf1') {
        setPdf1(result.assets[0]['uri']); // Directly set the PDF URI
      } else {
        setPdf2(result.assets[0]['uri']); // Directly set the PDF URI
      }
  
      // Optionally get file info
      await FileSystem.getInfoAsync(result.assets[0]['uri']);
  
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
    
      const response = await axios.post(
        `${ipURL}/api/s3/upload-to-aws/pdf-verify/${createSubjectId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    
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
      const validationErrors: string[] = [];
      
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

      // Validate package course (Single/Multi): topics, hours per topic (max 3), sum = duration; multi = date/time per topic
      if (isPackageCourse) {
        const numTopics = parseInt(numberOfTopics, 10);
        if (!numberOfTopics || numTopics < 1 || numTopics > 20) {
          validationErrors.push("Enter number of topics (1–20) for package course");
          setIsLoading(false);
          return;
        }
        if (topicBlocks.length !== numTopics) {
          validationErrors.push("Set hours for each topic");
          setIsLoading(false);
          return;
        }
        const totalHours = topicBlocks.reduce((sum, b) => sum + parseInt(b.hours || '0', 10), 0);
        const durationNum = parseInt(subjectDuration, 10);
        if (totalHours !== durationNum) {
          validationErrors.push(`Topic hours (${totalHours}) must add up to course duration (${durationNum}h)`);
          setIsLoading(false);
          return;
        }
        const invalidHours = topicBlocks.some(b => {
          const h = parseInt(b.hours || '0', 10);
          return h < 1 || h > 3;
        });
        if (invalidHours) {
          validationErrors.push("Each topic must be 1–3 hours");
          setIsLoading(false);
          return;
        }
        const missingTitle = topicBlocks.some(b => !(b.topicTitle && b.topicTitle.trim()));
        if (missingTitle) {
          validationErrors.push("Enter what you'll teach for each topic block");
          setIsLoading(false);
          return;
        }
        if (currentCourseType === 'MULTI_PACKAGE') {
          const missingDateTime = topicBlocks.some(b => !b.scheduledDateTime);
          if (missingDateTime) {
            validationErrors.push("Set date and time for each topic (Multi Course Package)");
            setIsLoading(false);
            return;
          }
          const pastDateTime = topicBlocks.some(b => b.scheduledDateTime && b.scheduledDateTime <= new Date());
          if (pastDateTime) {
            validationErrors.push("All topic dates and times must be in the future");
            setIsLoading(false);
            return;
          }
          const durationNum = parseInt(String(subjectDuration), 10) || 0;
          const dates = topicBlocks.map(b => b.scheduledDateTime).filter(Boolean) as Date[];
          if (dates.length >= 2 && durationNum > 0) {
            const minTs = Math.min(...dates.map(d => d.getTime()));
            const maxTs = Math.max(...dates.map(d => d.getTime()));
            const spanDays = (maxTs - minTs) / (24 * 60 * 60 * 1000);
            if (spanDays > durationNum) {
              validationErrors.push(
                `All topics must be scheduled within ${durationNum} days from the starting date (current span: ${Math.ceil(spanDays)} days).`
              );
              setIsLoading(false);
              return;
            }
          }
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

      // Add multi-student specific fields
      if (currentCourseType === 'MULTI_STUDENT') {
        subject.scheduledDateTime = scheduledDateTime?.toISOString();
        subject.maxCapacity = currentMaxCapacity;
      }

      // Add package course topics: hours per topic; multi = scheduledDateTime per topic
      if (isPackageCourse && topicBlocks.length > 0) {
        subject.topics = topicBlocks.map(b => ({
          topicTitle: (b.topicTitle || '').trim(),
          hours: parseInt(b.hours, 10),
          ...(currentCourseType === 'MULTI_PACKAGE' && b.scheduledDateTime
            ? { scheduledDateTime: b.scheduledDateTime.toISOString() }
            : {}),
        }));
      }

      // For MULTI_PACKAGE, send a fixed maxCapacity of 10 to the API
      if (currentCourseType === 'MULTI_PACKAGE') {
        subject.maxCapacity = 10;
      }
      
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
        try {
          await AsyncStorage.removeItem(getDraftKey(createSubjectId, currentCourseType));
        } catch (e) {
          console.error("Failed to remove subject draft", e);
        }
        Alert.alert(
          "Success",
          "Subject created successfully! The subject will be verified by the admin and will be live soon.",
          [
            {
              text: "OK",
              onPress: () => {
                router.back();
              }
            }
          ]
        );
      }
      setIsLoading(false);
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to create subject. Please try again.",
        [{ text: "OK" }]
      );
      setIsLoading(false);
    } finally {
      setIsCreatingSubject(false);
      setIsLoading(false);
    }
  };

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

  const getHeaderTitleByCourseType = (type: string) => {
    switch (type) {
      case 'MULTI_STUDENT':
        return 'Create Multi Student Course';
      case 'SINGLE_PACKAGE':
        return 'Create Single Student Package';
      case 'MULTI_PACKAGE':
        return 'Create Multi Student Package';
      case 'SINGLE_STUDENT':
      default:
        return 'Create Single Student Course';
    }
  };

  // Auto-save draft to AsyncStorage as user edits
  useEffect(() => {
    if (!createSubjectId || !currentCourseType) return;

    const timeout = setTimeout(() => {
      const key = getDraftKey(createSubjectId, currentCourseType);
      const draft = {
        subjectName,
        subjectDescription,
        subjectPrice,
        subjectBoard,
        subjectGrade,
        subjectLanguage,
        subjectNameSubHeading,
        subjectSearchHeading,
        subjectDuration,
        subjectPoints,
        // Intentionally exclude image and PDFs from draft to avoid heavy storage
        isEulaAccepted,
        isDocumentsConfirmed,
        scheduledDateTime: scheduledDateTime ? scheduledDateTime.toISOString() : null,
        currentMaxCapacity,
        numberOfTopics,
        topicBlocks: topicBlocks.map((b) => ({
          topicTitle: b.topicTitle,
          hours: b.hours,
          scheduledDateTime: b.scheduledDateTime ? b.scheduledDateTime.toISOString() : null,
        })),
        courseType: currentCourseType,
        updatedAt: new Date().toISOString(),
      };

      AsyncStorage.setItem(key, JSON.stringify(draft)).catch((e) => {
        console.error("Failed to save subject draft", e);
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    createSubjectId,
    currentCourseType,
    subjectName,
    subjectDescription,
    image,
    subjectPrice,
    subjectBoard,
    subjectGrade,
    subjectLanguage,
    subjectNameSubHeading,
    subjectSearchHeading,
    subjectDuration,
    subjectPoints,
    pdf1,
    pdf2,
    isEulaAccepted,
    isDocumentsConfirmed,
    scheduledDateTime,
    currentMaxCapacity,
    numberOfTopics,
    topicBlocks,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>{getHeaderTitleByCourseType(currentCourseType)}</Text>
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
              <CustomDropdown
                label="Duration"
                info={isPackageCourse ? 'Select total hours for this package (3–20). You will split these into topics (max 3h per topic).' : 'Select the total number of hours for this course (capped at 2 hours).'}
                value={subjectDuration}
                options={isPackageCourse ? Array.from({ length: 18 }, (_, i) => ({ label: `${i + 3} hours`, value: `${i + 3}` })) : [{ label: '1 hour', value: '1' }, { label: '2 hours', value: '2' }]}
                onSelect={(val) => {
                  setSubjectDuration(val);
                  if (isPackageCourse && numberOfTopics) setTopicBlocks([]);
                }}
                placeholder={isPackageCourse ? 'Select duration (3–20h)' : 'Select duration'}
              />
              {/* Package course: number of topics and hours per topic (max 3h); multi = date/time per topic */}
              {isPackageCourse && subjectDuration && (
                <View style={styles.inputWrapper}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>Number of topics</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Number of topics', 'Split the course into topics. Each topic can be 1–3 hours. Topic hours must add up to the total duration.')} style={styles.infoButton}>
                      <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. 4"
                      placeholderTextColor="#666"
                      keyboardType="number-pad"
                      value={numberOfTopics}
                      onChangeText={(t) => {
                        const n = t.replace(/[^0-9]/g, '');
                        setNumberOfTopics(n);
                        const num = parseInt(n, 10);
                        if (num >= 1 && num <= 20) {
                          setTopicBlocks(prev => Array.from({ length: num }, (_, i) =>
                            prev[i] ?? {
                              topicTitle: '',
                              hours: '1',
                              ...(currentCourseType === 'MULTI_PACKAGE' ? { scheduledDateTime: null as Date | null } : {}),
                            }
                          ));
                        } else if (n === '') {
                          setTopicBlocks([]);
                        }
                      }}
                    />
                  </View>
                  {topicBlocks.length > 0 && (
                    <View style={styles.topicBlocksSection}>
                      <Text style={styles.topicBlocksTitle}>Hours per topic (max 3h each). Total must equal course duration.</Text>
                      <View style={[styles.topicHoursSumRow, topicHoursSum !== durationNum && styles.topicHoursSumMismatch]}>
                        <Text style={[styles.topicHoursSumText, topicHoursSum !== durationNum && styles.topicHoursSumTextMismatch]}>
                          Topic hours: {topicHoursSum} / {subjectDuration || 0} h
                          {topicHoursSum !== durationNum && topicBlocks.length > 0 && " — adjust so they match"}
                        </Text>
                        {topicHoursSum === durationNum && topicBlocks.length > 0 && (
                          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                        )}
                      </View>
                      {currentCourseType === 'MULTI_PACKAGE' && durationNum > 0 && (
                        <Text style={styles.topicDeadlineHint}>
                          All topic dates must be within {durationNum} days of the starting date (e.g. 20h course = 20 days).
                        </Text>
                      )}
                      {topicBlocks.map((block, index) => (
                        <View key={index} style={styles.topicBlockCard}>
                          <Text style={styles.topicBlockLabel}>Topic {index + 1}</Text>
                          <FormInput
                            label="What you'll teach"
                            info="Brief name or description of what this topic block covers."
                            placeholder="e.g. Introduction to Algebra"
                            value={block.topicTitle}
                            onChangeText={(text) => {
                              setTopicBlocks(prev => {
                                const next = [...prev];
                                next[index] = { ...next[index], topicTitle: text };
                                return next;
                              });
                            }}
                          />
                          <View style={styles.topicBlockRow}>
                            <CustomDropdown
                            label="Hours"
                            info="Max 3 hours per topic."
                            value={block.hours}
                            options={[{ label: '1 hour', value: '1' }, { label: '2 hours', value: '2' }, { label: '3 hours', value: '3' }]}
                            onSelect={(hours) => {
                              setTopicBlocks(prev => {
                                const next = [...prev];
                                next[index] = { ...next[index], hours };
                                return next;
                              });
                            }}
                            placeholder="Hours"
                          />
                          {currentCourseType === 'MULTI_PACKAGE' && (
                            <View style={styles.topicBlockDateTime}>
                              <TouchableOpacity
                                style={styles.dateTimeButton}
                                onPress={() => {
                                  setEditingTopicIndex(index);
                                  const d = block.scheduledDateTime;
                                  setTopicCalendarDate(d ? d.toISOString().split('T')[0] : '');
                                  if (!d) setAvailableTimeSlots(generateTimeSlots());
                                }}
                              >
                                <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                                <Text style={styles.dateTimeText}>
                                  {block.scheduledDateTime ? `${block.scheduledDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} ${block.scheduledDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'Pick Date & Time'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        {currentCourseType === 'MULTI_PACKAGE' && editingTopicIndex === index && (
                          <View style={styles.topicCalendarSection}>
                            <Text style={styles.topicBlocksTitle}>Pick date & time for Topic {index + 1} (only available slots)</Text>
                            <Calendar
                              onDayPress={(day) => {
                                setTopicCalendarDate(day.dateString);
                                const topicHours = parseInt(topicBlocks[index]?.hours || '1', 10);
                                const sessionBlocked: string[] = [];
                                topicBlocks.forEach((b, j) => {
                                  if (j === index || !b.scheduledDateTime) return;
                                  const bDate = b.scheduledDateTime.toISOString().split('T')[0];
                                  if (bDate !== day.dateString) return;
                                  const h = b.scheduledDateTime.getUTCHours();
                                  const dur = parseInt(b.hours || '1', 10);
                                  for (let k = 0; k < dur; k++) {
                                    sessionBlocked.push(`${(h + k).toString().padStart(2, '0')}:00`);
                                  }
                                });
                                fetchTeacherAvailability(day.dateString, topicHours, sessionBlocked);
                              }}
                              markedDates={{
                                ...teacherUnavailableDates.reduce((acc, d) => {
                                  acc[d] = { disabled: true, disableTouchEvent: true };
                                  return acc;
                                }, {} as Record<string, { disabled: boolean; disableTouchEvent: boolean }>),
                                ...(topicCalendarDate ? {
                                  [topicCalendarDate]: { selected: true, selectedColor: COLORS.primary },
                                } : {}),
                              }}
                              minDate={new Date().toISOString().split('T')[0]}
                              theme={{
                                todayTextColor: COLORS.primary,
                                selectedDayBackgroundColor: COLORS.primary,
                                selectedDayTextColor: '#ffffff',
                                textDayFontSize: moderateScale(14),
                                textMonthFontSize: moderateScale(16),
                              }}
                            />
                            {topicCalendarDate && (
                              <View style={styles.timeSlotsSection}>
                                <Text style={styles.timeSlotsSectionTitle}>Available slots</Text>
                                {availabilityLoading ? (
                                  <View style={styles.availabilityLoadingContainer}>
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                  </View>
                                ) : (
                                  <View style={styles.timeSlotsGrid}>
                                    {availableTimeSlots.map((slot, idx) => (
                                      <TouchableOpacity
                                        key={idx}
                                        style={[styles.timeSlotChip, !slot.available && styles.timeSlotChipUnavailable]}
                                        onPress={() => {
                                          if (!slot.available) return;
                                          const [h, m] = slot.time.split(':').map(Number);
                                          const d = new Date(topicCalendarDate + 'T00:00:00');
                                          d.setHours(h, m || 0, 0, 0);
                                          setTopicBlocks(prev => {
                                            const p = [...prev];
                                            p[index] = { ...p[index], scheduledDateTime: d };
                                            return p;
                                          });
                                          setEditingTopicIndex(null);
                                          setTopicCalendarDate('');
                                        }}
                                        disabled={!slot.available}
                                      >
                                        <Text style={[styles.timeSlotChipText, !slot.available && styles.timeSlotChipTextUnavailable]}>{slot.time}</Text>
                                      </TouchableOpacity>
                                    ))}
                                  </View>
                                )}
                              </View>
                            )}
                            <TouchableOpacity style={styles.cancelTopicTimeButton} onPress={() => { setEditingTopicIndex(null); setTopicCalendarDate(''); }}>
                              <Text style={styles.cancelTopicTimeButtonText}>Cancel</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
              {/* Multi-Student Course: calendar + availability-based time slots */}
              {currentCourseType === 'MULTI_STUDENT' && (
                <View style={styles.inputWrapper}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>Scheduled Date & Time</Text>
                    <TouchableOpacity 
                      onPress={() => Alert.alert('Scheduled Date & Time', 'Select a date and an available time slot. Only times when you are not already booked are shown.')}
                      style={styles.infoButton}
                    >
                      <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <Calendar
                    onDayPress={(day) => {
                      setSelectedAvailDate(day.dateString);
                      fetchTeacherAvailability(day.dateString, durationNum || 1, []);
                    }}
                    markedDates={{
                      ...teacherUnavailableDates.reduce((acc, d) => {
                        acc[d] = { disabled: true, disableTouchEvent: true };
                        return acc;
                      }, {} as Record<string, { disabled: boolean; disableTouchEvent: boolean }>),
                      ...(selectedAvailDate ? {
                        [selectedAvailDate]: {
                          selected: true,
                          selectedColor: COLORS.primary,
                        },
                      } : {}),
                    }}
                    minDate={new Date().toISOString().split('T')[0]}
                    theme={{
                      todayTextColor: COLORS.primary,
                      selectedDayBackgroundColor: COLORS.primary,
                      selectedDayTextColor: '#ffffff',
                      textDayFontFamily: FONT.regular,
                      textMonthFontFamily: FONT.bold,
                      textDayHeaderFontFamily: FONT.medium,
                      textDayFontSize: moderateScale(14),
                      textMonthFontSize: moderateScale(16),
                      textDayHeaderFontSize: moderateScale(14),
                    }}
                  />
                  {selectedAvailDate && (
                    <View style={styles.timeSlotsSection}>
                      <Text style={styles.timeSlotsSectionTitle}>Available Time Slots</Text>
                      {availabilityLoading ? (
                        <View style={styles.availabilityLoadingContainer}>
                          <ActivityIndicator size="large" color={COLORS.primary} />
                        </View>
                      ) : (
                        <View style={styles.timeSlotsGrid}>
                          {availableTimeSlots.map((slot, idx) => (
                            <TouchableOpacity
                              key={idx}
                              style={[styles.timeSlotChip, !slot.available && styles.timeSlotChipUnavailable]}
                              onPress={() => {
                                if (!slot.available) return;
                                const [h, m] = slot.time.split(':').map(Number);
                                const d = new Date(selectedAvailDate + 'T00:00:00');
                                d.setHours(h, m || 0, 0, 0);
                                setScheduledDateTime(d);
                              }}
                              disabled={!slot.available}
                            >
                              <Text style={[styles.timeSlotChipText, !slot.available && styles.timeSlotChipTextUnavailable]}>
                                {slot.time}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                  {scheduledDateTime && (
                    <View style={styles.scheduledSummary}>
                      <Text style={styles.scheduledSummaryText}>
                        Scheduled: {scheduledDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} at {scheduledDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </Text>
                    </View>
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
                      <Text style={styles.uploadDocsText}>Upload Documents</Text>
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
                  opacity: (!isEulaAccepted || !isDocumentsConfirmed || isLoading || (isPackageCourse && topicBlocks.length > 0 && !topicHoursMatchDuration)) ? 0.5 : 1
                }
              ]}
              onPress={handleCreateSubject}
              disabled={!isEulaAccepted || !isDocumentsConfirmed || isLoading || (isPackageCourse && topicBlocks.length > 0 && !topicHoursMatchDuration)}
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
    color: '#222222',
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
  timeSlotsSection: {
    marginTop: verticalScale(16),
  },
  timeSlotsSectionTitle: {
    fontSize: moderateScale(16),
    fontFamily: FONT.bold,
    color: welcomeCOLOR.black,
    marginBottom: verticalScale(12),
  },
  availabilityLoadingContainer: {
    paddingVertical: verticalScale(24),
    alignItems: 'center',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: horizontalScale(10),
  },
  timeSlotChip: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(14),
    borderRadius: moderateScale(10),
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    minWidth: horizontalScale(72),
    alignItems: 'center',
  },
  timeSlotChipUnavailable: {
    backgroundColor: '#E8E8E8',
    borderColor: '#D1D5DB',
    opacity: 0.6,
  },
  timeSlotChipText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.medium,
    color: welcomeCOLOR.black,
  },
  timeSlotChipTextUnavailable: {
    color: '#999',
  },
  scheduledSummary: {
    marginTop: verticalScale(10),
    padding: moderateScale(10),
    backgroundColor: '#E8F5E9',
    borderRadius: moderateScale(8),
  },
  scheduledSummaryText: {
    fontSize: moderateScale(13),
    color: '#2E7D32',
    fontFamily: FONT.medium,
  },
  topicBlocksSection: {
    marginTop: verticalScale(12),
    gap: verticalScale(10),
  },
  topicBlocksTitle: {
    fontSize: moderateScale(13),
    color: '#444',
    marginBottom: verticalScale(6),
  },
  topicHoursSumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(10),
    backgroundColor: '#E8F5E9',
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(10),
  },
  topicHoursSumMismatch: {
    backgroundColor: '#FFEBEE',
  },
  topicHoursSumText: {
    fontSize: moderateScale(14),
    color: '#2E7D32',
    fontFamily: FONT.medium,
  },
  topicHoursSumTextMismatch: {
    color: '#C62828',
  },
  topicBlockCard: {
    marginBottom: verticalScale(16),
    padding: moderateScale(12),
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  topicBlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: horizontalScale(8),
    marginBottom: verticalScale(8),
    paddingVertical: verticalScale(6),
    paddingHorizontal: moderateScale(8),
    backgroundColor: '#f8f9fa',
    borderRadius: moderateScale(8),
  },
  topicBlockLabel: {
    fontSize: moderateScale(14),
    color: welcomeCOLOR.black,
    minWidth: horizontalScale(56),
  },
  topicBlockDateTime: {
    flexDirection: 'row',
    gap: horizontalScale(8),
    marginLeft: 'auto',
  },
  topicDeadlineHint: {
    fontSize: moderateScale(12),
    color: '#555',
    marginBottom: verticalScale(8),
    fontFamily: FONT.medium,
  },
  topicCalendarSection: {
    marginTop: verticalScale(12),
    padding: moderateScale(12),
    backgroundColor: '#f0f7ff',
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: '#e1e8f0',
  },
  cancelTopicTimeButton: {
    marginTop: verticalScale(10),
    paddingVertical: verticalScale(8),
    alignItems: 'center',
  },
  cancelTopicTimeButtonText: {
    fontSize: moderateScale(14),
    color: '#666',
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
    color: '#222222',
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