import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import {
  getTeacherProfileAppPath,
  setPendingTeacherProfileId,
} from '../utils/teacherProfileLink';

export default function TeacherDeepLinkScreen() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();

  useEffect(() => {
    const openTeacherProfile = async () => {
      const id = Array.isArray(teacherId) ? teacherId[0] : teacherId;
      if (!id) {
        router.replace('/');
        return;
      }

      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        await setPendingTeacherProfileId(id);
        router.replace('/(authenticate)/welcome');
        return;
      }

      router.replace(getTeacherProfileAppPath(id));
    };

    void openTeacherProfile();
  }, [teacherId]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1A2B4B" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
