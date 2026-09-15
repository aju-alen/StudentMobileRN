import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import axios from "axios";
import { ipURL } from "../../../utils/utils";
import TeacherProfileView from "../../../components/TeacherProfileView";

interface User {
  id?: string;
  email?: string;
  name?: string;
  profileImage?: string;
  userDescription?: string;
  subjects?: SubjectItem[];
  reccomendedSubjects?: string[];
}

interface SubjectItem {
  id: string;
  subjectName: string;
  subjectDescription?: string;
  subjectImage?: string;
  subjectPrice?: number;
  subjectBoard?: string;
  subjectGrade?: number;
}

interface UserDetails {
  isTeacher?: boolean;
  isAdmin?: boolean;
}

const SingleProfilePage = () => {
  const {singleProfileId} = useLocalSearchParams()
  const segments = useSegments() as string[];
  const stackTab = segments.includes('profile') ? 'profile' : 'home';
  console.log("singleProfileId", singleProfileId);
  

  const [user, setUser] = useState<User>({});
  const [userDetails, setUserDetails] = useState<UserDetails>({});


  useEffect(() => {
    const getUser = async () => {
      const apiUser = await axios.get(`${ipURL}/api/auth/teacher/profile/${singleProfileId}`, {
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
        },
      });
      console.log("apiUser", apiUser.data);
      
      setUser(apiUser.data);
      const storedUser = await AsyncStorage.getItem("userDetails");
      setUserDetails(storedUser ? JSON.parse(storedUser) : {});
    };
    getUser();
  }, []);


  const handleItemPress = (itemId: { id: any }) => {
    router.push(`/(tabs)/${stackTab}/${itemId.id}`);
  };

  return (
    <TeacherProfileView
      user={user}
      userDetails={userDetails}
      coursesInteractive
      onCoursePress={handleItemPress}
    />
  );
};

export default SingleProfilePage;
