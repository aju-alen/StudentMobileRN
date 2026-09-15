import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { axiosWithAuth } from '../utils/customAxios';
import { ipURL } from '../utils/utils';
import { FONT } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const ParentHome = ({ firstName = 'there' }) => {
  const [email, setEmail] = useState('');
  const [children, setChildren] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inviting, setInviting] = useState(false);

  const loadChildren = async () => {
    const resp = await axiosWithAuth.get(`${ipURL}/api/parent/children`);
    setChildren(resp.data.children || []);
    setPending(resp.data.pending || []);
  };

  const refresh = async () => {
    try {
      await loadChildren();
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  const handleInvite = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert('Student email', 'Enter the email of the student account to link.');
      return;
    }
    try {
      setInviting(true);
      await axiosWithAuth.post(`${ipURL}/api/parent/invites`, { email: trimmed });
      setEmail('');
      Alert.alert('Invite sent', 'The student must accept this request in the app.');
      await loadChildren();
    } catch (error) {
      const msg = error.response?.data?.message;
      Alert.alert('Invite failed', msg && typeof msg === 'string' ? msg : 'Could not send invite.');
    } finally {
      setInviting(false);
    }
  };

  const handleUnlink = (linkId) => {
    Alert.alert('Unlink student', 'They will no longer appear in your parent account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unlink',
        style: 'destructive',
        onPress: async () => {
          try {
            await axiosWithAuth.delete(`${ipURL}/api/parent/links/${linkId}`);
            await loadChildren();
          } catch (error) {
            Alert.alert('Error', 'Could not unlink this student.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Parent account</Text>
          <Text style={styles.userName}>{firstName}</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refresh(); }} />
        }
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Link a student</Text>
          <Text style={styles.helper}>
            Enter the student&apos;s account email. They must accept before you can see their progress.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="student@email.com"
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TouchableOpacity style={styles.primaryButton} onPress={handleInvite} disabled={inviting}>
            {inviting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Send invite</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Linked students</Text>
        {loading ? (
          <ActivityIndicator color="#1A4C6E" />
        ) : children.length === 0 ? (
          <Text style={styles.empty}>No linked students yet.</Text>
        ) : (
          children.map((child) => (
            <TouchableOpacity
              key={child.linkId}
              style={styles.childCard}
              onPress={() => router.push(`/(tabs)/home/child/${child.studentUserId}`)}
            >
              {child.profileImage ? (
                <Image source={{ uri: child.profileImage }} style={styles.avatar} placeholder={blurhash} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Ionicons name="person" size={20} color="#1A4C6E" />
                </View>
              )}
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.name}</Text>
                <Text style={styles.childMeta}>{child.email}</Text>
              </View>
              <TouchableOpacity onPress={() => handleUnlink(child.linkId)} hitSlop={8}>
                <Ionicons name="unlink-outline" size={20} color="#8B1E1E" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}

        {pending.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Pending invites</Text>
            {pending.map((child) => (
              <View key={child.linkId} style={styles.childCard}>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childMeta}>Waiting for the student to accept</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA' },
  topBar: { paddingHorizontal: horizontalScale(20), paddingVertical: verticalScale(12) },
  greeting: { fontFamily: FONT.medium, fontSize: moderateScale(13), color: '#5C6B76' },
  userName: { fontFamily: FONT.bold, fontSize: moderateScale(24), color: '#12263A' },
  content: { paddingHorizontal: horizontalScale(20), paddingBottom: verticalScale(32) },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: '#E6EBF0',
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
    marginBottom: verticalScale(8),
    marginTop: verticalScale(8),
  },
  helper: { fontFamily: FONT.regular, fontSize: moderateScale(13), color: '#5C6B76', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#E6EBF0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: FONT.regular,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#1A2B4B',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: { color: '#fff', fontFamily: FONT.bold },
  empty: { fontFamily: FONT.regular, color: '#5C6B76', marginBottom: 12 },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6EBF0',
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  avatarFallback: { backgroundColor: '#E8EEF4', alignItems: 'center', justifyContent: 'center' },
  childInfo: { flex: 1 },
  childName: { fontFamily: FONT.bold, color: '#12263A' },
  childMeta: { fontFamily: FONT.regular, color: '#5C6B76', fontSize: moderateScale(12) },
});

export default ParentHome;
