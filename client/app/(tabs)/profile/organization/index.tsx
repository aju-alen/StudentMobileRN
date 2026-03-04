import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Share, TextInput, Modal } from 'react-native';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
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
  const [deleting, setDeleting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

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

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await Clipboard.setStringAsync(inviteCode);
      Alert.alert('Copied', 'Invite code copied to clipboard.');
    } catch (err) {
      Alert.alert('Error', 'Could not copy to clipboard.');
    }
  };

  const handleShareCode = async () => {
    if (!inviteCode) return;
    const message = `Join my organization on Coach Academ. Use this invite code: ${inviteCode}`;
    try {
      await Share.share({
        message,
        title: 'Organization Invite Code',
      });
    } catch (err) {
      if ((err as { message?: string })?.message !== 'User did not share') {
        Alert.alert('Error', 'Could not open share sheet.');
      }
    }
  };

  const handleDeleteOrganization = () => {
    setDeleteError('');
    setDeletePassword('');
    setDeleteModalVisible(true);
  };

  const confirmDeleteOrganization = () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password');
      return;
    }

    Alert.alert(
      'Delete Organization',
      'Are you sure you want to delete this organization? All members will be removed and this cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await axiosWithAuth.delete(`${ipURL}/api/auth/organization`, {
                data: { password: deletePassword.trim() },
              });
              setDeleteModalVisible(false);
              setDeletePassword('');
              setDeleteError('');
              Alert.alert('Deleted', 'Organization has been deleted.', [
                { text: 'OK', onPress: () => { fetchUserData(); setInviteCode(null); } },
              ]);
            } catch (err) {
              const message = (err as any)?.response?.data?.message || 'Failed to delete organization';
              setDeleteError(message);
              Alert.alert('Error', message);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#1A2B4B" />
        </TouchableOpacity>
        <Text style={styles.title}>Organization Settings</Text>
      </View>

      {isTeamLead && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invite Code</Text>
          <View style={styles.inviteCodeContainer}>
            <TouchableOpacity
              style={styles.inviteCodeBox}
              onPress={handleCopyCode}
              activeOpacity={0.7}
              disabled={!inviteCode}
            >
              <Text style={styles.inviteCodeLabel}>Organization Invite Code (tap to copy)</Text>
              <View style={styles.inviteCodeRow}>
                <Text style={styles.inviteCodeText}>
                  {inviteCode || 'Generating...'}
                </Text>
                {inviteCode && (
                  <Ionicons name="copy-outline" size={22} color="#64748B" style={styles.copyIcon} />
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.inviteCodeButtonRow}>
              <TouchableOpacity
                style={[styles.shareButton, !inviteCode && styles.buttonDisabled]}
                onPress={handleShareCode}
                disabled={!inviteCode}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled, !inviteCode && styles.buttonDisabled]}
                onPress={handleRefreshCode}
                disabled={refreshing || !inviteCode}
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
          </View>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#64748B" />
            <Text style={styles.infoText}>
              Tap the code to copy, or use Share to send via WhatsApp, email, etc.
            </Text>
          </View>
        </View>
      )}

      {!isInOrganization && !isTeamLead && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {user?.userType === 'TEACHER' || user?.isTeacher ? 'Organization' : 'Join Organization'}
          </Text>
          {(user?.userType === 'TEACHER' || user?.isTeacher) && (
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => router.push('/(tabs)/profile/organization/create-organization')}
            >
              <Text style={styles.settingText}>Create Organization</Text>
              <Ionicons name="chevron-forward" size={24} color="#64748B" />
            </TouchableOpacity>
          )}
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

      {isTeamLead && (
        <View style={[styles.section, styles.dangerZoneSection]}>
          <Text style={styles.sectionTitle}>Danger zone</Text>
          <TouchableOpacity
            style={[styles.deleteButton, deleting && styles.buttonDisabled]}
            onPress={handleDeleteOrganization}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>Delete Organization</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal
        animationType="slide"
        transparent
        visible={deleteModalVisible}
        onRequestClose={() => {
          if (!deleting) {
            setDeleteModalVisible(false);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm deletion</Text>
            <Text style={styles.modalMessage}>
              To delete this organization, please enter your account password.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              autoCapitalize="none"
              value={deletePassword}
              editable={!deleting}
              onChangeText={(text) => {
                setDeletePassword(text);
                if (deleteError) setDeleteError('');
              }}
            />
            {deleteError ? <Text style={styles.modalError}>{deleteError}</Text> : null}
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  if (!deleting) {
                    setDeleteModalVisible(false);
                    setDeletePassword('');
                    setDeleteError('');
                  }
                }}
                disabled={deleting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalDeleteButton, deleting && styles.buttonDisabled]}
                onPress={confirmDeleteOrganization}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalDeleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    padding: moderateScale(8),
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
  dangerZoneSection: {
    marginBottom: verticalScale(40),
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
    marginBottom: verticalScale(12),
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
  inviteCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inviteCodeText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A2B4B',
    letterSpacing: moderateScale(2),
    flex: 1,
  },
  copyIcon: {
    marginLeft: horizontalScale(8),
  },
  inviteCodeButtonRow: {
    flexDirection: 'row',
    gap: horizontalScale(12),
  },
  shareButton: {
    flex: 1,
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
  shareButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    marginLeft: horizontalScale(8),
  },
  refreshButton: {
    flex: 1,
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
  buttonDisabled: {
    opacity: 0.5,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    gap: horizontalScale(8),
  },
  deleteButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A2B4B',
    marginBottom: verticalScale(8),
  },
  modalMessage: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginBottom: verticalScale(16),
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#1A2B4B',
  },
  modalError: {
    marginTop: verticalScale(6),
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#DC2626',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: verticalScale(20),
    gap: horizontalScale(12),
  },
  modalCancelButton: {
    paddingVertical: moderateScale(10),
    paddingHorizontal: horizontalScale(18),
    borderRadius: moderateScale(10),
    backgroundColor: '#F1F5F9',
  },
  modalCancelText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#0F172A',
  },
  modalDeleteButton: {
    paddingVertical: moderateScale(10),
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(10),
    backgroundColor: '#DC2626',
  },
  modalDeleteText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
});

export default OrganizationSettingsPage;

