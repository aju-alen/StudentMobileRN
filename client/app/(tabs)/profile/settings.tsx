import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatusBarComponent from '../../components/StatusBarComponent';

const SettingsPage = () => {
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

  return (
    <ScrollView style={styles.container}>
      <StatusBarComponent />
      <Stack.Screen 
        options={{
          title: 'Settings',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#1A2B4B',
          headerTitleStyle: {
            fontFamily: FONT.bold,
          },
        }} 
      />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A2B4B" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/(tabs)/profile/edit-profile')}
        >
          <Text style={styles.settingText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={24} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/(tabs)/profile/change-password')}
        >
          <Text style={styles.settingText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={24} color="#64748B" />
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Notification Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#64748B" />
        </TouchableOpacity> */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/(tabs)/profile/reports')}
        >
          <Text style={styles.settingText}>Your Reports</Text>
          <Ionicons name="chevron-forward" size={24} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/(tabs)/profile/blocked-users')}
        >
          <Text style={styles.settingText}>Blocked Users</Text>
          <Ionicons name="chevron-forward" size={24} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Your Reviews</Text>
          <Ionicons name="chevron-forward" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/(tabs)/profile/help-center')}
        >
          <Text style={styles.settingText}>Help Center</Text>
          <Ionicons name="chevron-forward" size={24} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/(tabs)/profile/contact-us')}>
          <Text style={styles.settingText}>Contact Us</Text>
          <Ionicons name="chevron-forward" size={24} color="#64748B" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPolicy}>
          <Text style={styles.settingText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Developer</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/(tabs)/profile/dev-stats')}
        >
          <Text style={styles.settingText}>Dev Stats</Text>
          <Ionicons name="chevron-forward" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dangerous Zone</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => router.push('/(tabs)/profile/delete-account')}
        >
          <Text style={[styles.settingText, { color: '#DC2626' }]}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={24} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    marginRight: horizontalScale(15),
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A2B4B',
  },
  section: {
    marginTop: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A2B4B',
    marginBottom: verticalScale(15),
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#1A2B4B',
  },
  logoutSection: {
    marginTop: verticalScale(30),
    marginBottom: verticalScale(40),
    paddingHorizontal: horizontalScale(20),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#DC2626',
    marginLeft: horizontalScale(8),
  },
});

export default SettingsPage; 