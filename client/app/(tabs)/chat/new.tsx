import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { axiosWithAuth } from '../../utils/customAxios';
import { ipURL } from '../../utils/utils';
import { FONT } from '../../../constants';
import { goBack } from '../../utils/navigation';
import { Ionicons } from '@expo/vector-icons';

const NewParentChat = () => {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await axiosWithAuth.get(`${ipURL}/api/parent/chat-targets`);
        setTargets(resp.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const startChat = async (target) => {
    try {
      const resp = await axiosWithAuth.post(`${ipURL}/api/parent/conversations`, {
        studentUserId: target.studentUserId,
        subjectId: target.subjectId,
      });
      router.replace(`/(tabs)/chat/parent/${resp.data.id}`);
    } catch (error) {
      const msg = error.response?.data?.message;
      Alert.alert('Cannot start chat', msg && typeof msg === 'string' ? msg : 'Try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableOpacity onPress={() => goBack('/(tabs)/chat')} style={styles.back}>
        <Ionicons name="chevron-back" size={24} color="#12263A" />
        <Text style={styles.backText}>Chats</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Message a tutor</Text>
      <Text style={styles.helper}>
        You can only chat with tutors of courses your linked student has purchased.
      </Text>
      {loading ? (
        <ActivityIndicator color="#1A2B4B" />
      ) : (
        <ScrollView>
          {targets.length === 0 ? (
            <Text style={styles.empty}>No eligible tutors yet. Link a student who has purchased a course.</Text>
          ) : (
            targets.map((target) => (
              <TouchableOpacity
                key={`${target.studentUserId}-${target.subjectId}`}
                style={styles.card}
                onPress={() => startChat(target)}
              >
                <Text style={styles.name}>{target.teacherName}</Text>
                <Text style={styles.meta}>
                  {target.subjectName} · {target.studentName}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA', paddingHorizontal: 20 },
  back: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backText: { fontFamily: FONT.medium, color: '#12263A' },
  title: { fontFamily: FONT.bold, fontSize: 22, color: '#12263A', marginBottom: 6 },
  helper: { fontFamily: FONT.regular, color: '#5C6B76', marginBottom: 16 },
  empty: { fontFamily: FONT.regular, color: '#5C6B76' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6EBF0',
  },
  name: { fontFamily: FONT.bold, color: '#12263A' },
  meta: { fontFamily: FONT.regular, color: '#5C6B76', marginTop: 4 },
});

export default NewParentChat;
