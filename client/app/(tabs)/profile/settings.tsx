import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, ActivityIndicator, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { axiosWithAuth } from '../../utils/customAxios';
import { ipURL } from '../../utils/utils';
import { SafeAreaView } from 'react-native-safe-area-context';

const SettingsRow = ({ label, onPress, destructive = false, accessibilityLabel }) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel || label}
  >
    <Text style={[styles.settingText, destructive && styles.destructiveText]}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={destructive ? '#C44747' : '#5C6B76'} />
  </TouchableOpacity>
);

const SettingsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axiosWithAuth.get(`${ipURL}/api/auth/metadata`);
        setUser(response.data);

        if (response.data?.isTeacher === true) {
          if (!response.data?.organization) {
            console.warn('Teacher user but no organization data found');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        Alert.alert('Error', 'Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEditSubject = () => {
    Alert.alert('Edit Subject', 'To edit your subject, please contact support.');
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            await AsyncStorage.removeItem("authToken");
            await AsyncStorage.removeItem("isTeacher");
            router.replace("/(authenticate)/login");
          },
          style: "destructive"
        }
      ]
    );
  };

  const handlePrivacyPolicy = async () => {
    const url = 'https://coachacademic.s3.ap-southeast-1.amazonaws.com/EULA+/Privacy+Policy+for+CoachAcadem1.pdf';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.log("Cannot open URL: " + url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  const header = (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back to profile"
      >
        <Ionicons name="chevron-back" size={24} color="#12263A" />
      </TouchableOpacity>
      <View style={styles.headerText}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Account, support, and privacy</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />
        {header}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A4C6E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      {header}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.group}>
          <SettingsRow label="Edit Profile" onPress={() => router.push('/(tabs)/profile/edit-profile')} />
          <View style={styles.divider} />
          <SettingsRow label="Change Password" onPress={() => router.push('/(tabs)/profile/change-password')} />
          <View style={styles.divider} />
          <SettingsRow label="Edit Subject" onPress={handleEditSubject} />
        </View>

        {user?.isTeacher === true && (
          <>
            <Text style={styles.sectionTitle}>Organization</Text>
            <View style={styles.group}>
              <SettingsRow label="Organization Settings" onPress={() => router.push('/(tabs)/profile/organization')} />
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.group}>
          <SettingsRow label="Your Reports" onPress={() => router.push('/(tabs)/profile/reports')} />
          <View style={styles.divider} />
          <SettingsRow label="Blocked Users" onPress={() => router.push('/(tabs)/profile/blocked-users')} />
          {user?.isTeacher !== true && (
            <>
              <View style={styles.divider} />
              <SettingsRow label="Your Reviews" onPress={() => router.push('/(tabs)/profile/your-reviews')} />
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.group}>
          <SettingsRow label="Help Center" onPress={() => router.push('/(tabs)/profile/help-center')} />
          <View style={styles.divider} />
          <SettingsRow label="Contact Us" onPress={() => router.push('/(tabs)/profile/contact-us')} />
          <View style={styles.divider} />
          <SettingsRow label="Privacy Policy" onPress={handlePrivacyPolicy} />
        </View>

        <Text style={styles.sectionTitle}>Developer</Text>
        <View style={styles.group}>
          <SettingsRow label="Dev Stats" onPress={() => router.push('/(tabs)/profile/dev-stats')} />
        </View>

        <Text style={styles.sectionTitle}>Danger zone</Text>
        <View style={styles.group}>
          <SettingsRow
            label="Delete Account"
            onPress={() => router.push('/(tabs)/profile/delete-account')}
            destructive
          />
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Logout"
        >
          <Ionicons name="log-out-outline" size={20} color="#C44747" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(12),
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 4,
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#12263A',
  },
  subtitle: {
    marginTop: 2,
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5C6B76',
  },
  scrollContent: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(32),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(13),
    color: '#5C6B76',
    marginTop: verticalScale(18),
    marginBottom: verticalScale(8),
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  group: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    overflow: 'hidden',
  },
  settingItem: {
    minHeight: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E6EBF0',
    marginLeft: 16,
  },
  settingText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(15),
    color: '#12263A',
  },
  destructiveText: {
    color: '#C44747',
  },
  logoutButton: {
    marginTop: verticalScale(24),
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    gap: 8,
  },
  logoutText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(15),
    color: '#C44747',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SettingsPage;
