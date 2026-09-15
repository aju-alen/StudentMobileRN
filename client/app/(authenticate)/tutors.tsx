import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ipURL } from '../utils/utils';
import { FONT } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { goBack } from '../utils/navigation';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const RegisterTutors = () => {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async (q = '') => {
    try {
      setLoading(true);
      const url = q.trim()
        ? `${ipURL}/api/auth/teachers?q=${encodeURIComponent(q.trim())}`
        : `${ipURL}/api/auth/teachers`;
      const resp = await axios.get(url);
      setTeachers(resp.data.teachers || []);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchTeachers(search), 350);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.back}>
          <Ionicons name="arrow-back" size={22} color="#1A2B4B" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>All tutors</Text>
        <Text style={styles.subtitle}>Browse tutor profiles, courses, and stats. You can finish signup after.</Text>
      </View>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#5C6B76" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search tutors"
          placeholderTextColor="#666"
          style={styles.searchInput}
        />
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color="#1A2B4B" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => fetchTeachers(search)} />}
        >
          {teachers.length === 0 ? (
            <Text style={styles.empty}>No tutors found.</Text>
          ) : (
            teachers.map((teacher) => (
              <TouchableOpacity
                key={teacher.id}
                style={styles.card}
                onPress={() => router.push(`/(authenticate)/tutor/${teacher.teacherProfileId || teacher.id}`)}
              >
                {teacher.profileImage ? (
                  <Image source={{ uri: teacher.profileImage }} style={styles.avatar} placeholder={blurhash} />
                ) : (
                  <View style={[styles.avatar, styles.fallback]}>
                    <Ionicons name="person" size={22} color="#1A4C6E" />
                  </View>
                )}
                <View style={styles.info}>
                  <Text style={styles.name}>{teacher.name}</Text>
                  <Text style={styles.meta} numberOfLines={2}>
                    {teacher.courseCount} course{teacher.courseCount === 1 ? '' : 's'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#5C6B76" />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  header: { paddingHorizontal: horizontalScale(20), paddingBottom: verticalScale(8) },
  back: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backText: { marginLeft: 6, color: '#1A2B4B', fontFamily: FONT.medium },
  title: { fontFamily: FONT.bold, fontSize: moderateScale(24), color: '#12263A' },
  subtitle: { fontFamily: FONT.regular, color: '#5C6B76', marginTop: 4 },
  searchBox: {
    marginHorizontal: horizontalScale(20),
    marginVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontFamily: FONT.regular, paddingVertical: 8, color: '#12263A' },
  list: { paddingHorizontal: horizontalScale(20), paddingBottom: verticalScale(24) },
  empty: { textAlign: 'center', color: '#5C6B76', marginTop: 24 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6EBF0',
  },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12 },
  fallback: { backgroundColor: '#E8EEF4', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  name: { fontFamily: FONT.bold, color: '#12263A', fontSize: moderateScale(16) },
  meta: { fontFamily: FONT.regular, color: '#5C6B76', marginTop: 2 },
});

export default RegisterTutors;
