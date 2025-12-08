import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../../../utils/metrics';
import StatusBarComponent from '../../../components/StatusBarComponent';
import { axiosWithAuth } from '../../../utils/customAxios';
import { ipURL } from '../../../utils/utils';

const OrganizationSettingsPage = () => {
  const [user, setUser] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchInviteCode();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axiosWithAuth.get(`${ipURL}/api/auth/metadata`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInviteCode = async () => {
    try {
      const response = await axiosWithAuth.get(`${ipURL}/api/auth/organization/invite-code`);
      setInviteCode(response.data.inviteCode);
    } catch (error) {
      // If user is not a team lead, this will fail - that's expected
      if (error.response?.status !== 403) {
        console.error('Error fetching invite code:', error);
      }
    }
  };

  const handleRefreshCode = async () => {
    Alert.alert(
      "Refresh Invite Code",
      "Are you sure you want to refresh the invite code? The old code will no longer work.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Refresh",
          onPress: async () => {
            try {
              setRefreshing(true);
              const response = await axiosWithAuth.put(`${ipURL}/api/auth/organization/refresh-invite`);
              setInviteCode(response.data.inviteCode);
              Alert.alert("Success", "Invite code refreshed successfully");
            } catch (error) {
              console.error('Error refreshing invite code:', error);
              Alert.alert("Error", error.response?.data?.message || "Failed to refresh invite code");
            } finally {
              setRefreshing(false);
            }
          }
        }
      ]
    );
  };

  const isTeamLead = user?.isTeamLead === true;
  const isInOrganization = user?.organization !== null;

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBarComponent />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1A2B4B" />
          </TouchableOpacity>
          <Text style={styles.title}>Organization Settings</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A2B4B" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <StatusBarComponent />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A2B4B" />
        </TouchableOpacity>
        <Text style={styles.title}>Organization Settings</Text>
      </View>

      {isTeamLead && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite Code</Text>
          <View style={styles.inviteCodeContainer}>
            <View style={styles.inviteCodeBox}>
              <Text style={styles.inviteCodeLabel}>Organization Invite Code</Text>
              <Text style={styles.inviteCodeText}>
                {inviteCode || 'Generating...'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
              onPress={handleRefreshCode}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.refreshButtonText}>Refresh Code</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#64748B" />
            <Text style={styles.infoText}>
              Share this code with teachers to allow them to join your organization.
            </Text>
          </View>
        </View>
      )}

      {!isInOrganization && !isTeamLead && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Join Organization</Text>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/profile/organization/join')}
          >
            <Text style={styles.settingText}>Join Organization</Text>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
      )}

      {isInOrganization && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Organization</Text>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/(tabs)/profile/organization/members')}
          >
            <Text style={styles.settingText}>Organization Members</Text>
            <Ionicons name="chevron-forward" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: verticalScale(100),
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
  inviteCodeContainer: {
    marginBottom: verticalScale(15),
  },
  inviteCodeBox: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(20),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  inviteCodeLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginBottom: verticalScale(10),
  },
  inviteCodeText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A2B4B',
    letterSpacing: moderateScale(2),
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A2B4B',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  refreshButtonDisabled: {
    opacity: 0.6,
  },
  refreshButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    marginLeft: horizontalScale(8),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(10),
  },
  infoText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#64748B',
    marginLeft: horizontalScale(10),
    lineHeight: moderateScale(16),
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
    shadowRadius: 4,
    elevation: 2,
  },
  settingText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#1A2B4B',
  },
});

export default OrganizationSettingsPage;

