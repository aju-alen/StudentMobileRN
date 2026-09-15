import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { ipURL } from '../../utils/utils';
import TeacherProfileView from '../../components/TeacherProfileView';

const GuestTutorProfile = () => {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await axios.get(`${ipURL}/api/auth/teacher/profile/${id}`);
        setUser(resp.data);
      } catch (error) {
        console.error('Error loading tutor profile:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#1A2B4B" />
      </View>
    );
  }

  return (
    <TeacherProfileView
      user={user}
      userDetails={{ isTeacher: true }}
      coursesInteractive={false}
      roleLabel="Tutor"
      showTutorStats
    />
  );
};

export default GuestTutorProfile;
