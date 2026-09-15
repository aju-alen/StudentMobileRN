import { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import {
  getTeacherProfileAppPath,
  setPendingTeacherProfileId,
} from '../utils/teacherProfileLink';
import { ipURL } from '../utils/utils';
import TeacherProfileView from '../components/TeacherProfileView';
import { FONT } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';

interface User {
  id?: string;
  name?: string;
  profileImage?: string;
  userDescription?: string;
  subjects?: { id: string; subjectName: string }[];
  reccomendedSubjects?: string[];
}

export default function TeacherDeepLinkScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User>({});

  useEffect(() => {
    const openTeacherProfile = async () => {
      const id = Array.isArray(teacherId) ? teacherId[0] : teacherId;
      if (!id) {
        router.replace('/');
        return;
      }

      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        router.replace(getTeacherProfileAppPath(id));
        return;
      }

      try {
        const apiUser = await axios.get(`${ipURL}/api/auth/teacher/profile/${id}`);
        setUser(apiUser.data);
        setError(null);
      } catch {
        setError('Teacher profile not found.');
      } finally {
        setLoading(false);
      }
    };

    void openTeacherProfile();
  }, [teacherId]);

  const goToAuth = async (path: '/(authenticate)/login' | '/(authenticate)/register') => {
    const id = Array.isArray(teacherId) ? teacherId[0] : teacherId;
    if (id) {
      await setPendingTeacherProfileId(id);
    }
    router.push(path);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1A2B4B" />
      </View>
    );
  }

  const authFooter = (
    <View style={styles.authSection}>
      <Text style={styles.authTitle}>Sign in to book and open courses</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={() => void goToAuth('/(authenticate)/login')}>
        <Text style={styles.primaryButtonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => void goToAuth('/(authenticate)/register')}>
        <Text style={styles.secondaryButtonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        {authFooter}
      </View>
    );
  }

  return (
    <TeacherProfileView
      user={user}
      userDetails={{}}
      coursesInteractive={false}
      roleLabel="Tutor"
      showTutorStats
      footer={authFooter}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: horizontalScale(20),
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#1A2B4B',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  authSection: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(32),
  },
  authTitle: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(15),
    color: '#475569',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  primaryButton: {
    backgroundColor: '#1A2B4B',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  primaryButtonText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#1A2B4B',
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A2B4B',
  },
});
