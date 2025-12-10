import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../../../utils/metrics';
import { ipURL } from '../../../utils/utils';
import { axiosWithAuth } from '../../../utils/customAxios';
import StatusBarComponent from '../../../components/StatusBarComponent';
import { Image as ExpoImage } from 'expo-image';

interface Member {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  isTeamLead: boolean;
}

interface Organization {
  id: string;
  orgName: string;
  orgCapacity: number;
  currentMemberCount: number;
}

const OrganizationMembersPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isTeamLead, setIsTeamLead] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    fetchOrganizationMembers();
    fetchUserEmail();
  }, []);

  // Refresh data when screen comes into focus (e.g., returning from capacity page)
  useFocusEffect(
    React.useCallback(() => {
      fetchOrganizationMembers();
    }, [])
  );

  const fetchUserEmail = async () => {
    try {
      const response = await axiosWithAuth.get(`${ipURL}/api/auth/metadata`);
      setUserEmail(response.data.email || '');
    } catch (err) {
      console.error('Error fetching user email:', err);
    }
  };

  const fetchOrganizationMembers = async () => {
    try {
      setError('');
      const response = await axiosWithAuth.get(`${ipURL}/api/auth/organization/members`);
      setMembers(response.data.members);
      setOrganization(response.data.organization);
      setIsTeamLead(response.data.isTeamLead);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch organization members');
      console.error('Error fetching organization members:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrganizationMembers();
  };

  const handleRemoveTeacher = (member: Member) => {
    if (member.isTeamLead) {
      Alert.alert('Error', 'Cannot remove team lead from organization');
      return;
    }

    Alert.alert(
      'Remove Teacher',
      `Are you sure you want to remove ${member.name} from the organization?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosWithAuth.post(`${ipURL}/api/auth/organization/remove-teacher`, {
                teacherUserId: member.id,
              });
              Alert.alert('Success', `${member.name} has been removed from the organization`);
              fetchOrganizationMembers(); // Refresh the list
            } catch (err: any) {
              const errorMessage = err.response?.data?.message || 'Failed to remove teacher';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBarComponent />
     
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A2B4B" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <StatusBarComponent />

   
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          {organization && (
            <View style={styles.infoSection}>
              <Text style={styles.orgName}>{organization.orgName}</Text>
              <Text style={styles.capacityText}>
                {organization.currentMemberCount} / {organization.orgCapacity} members
              </Text>
              {isTeamLead && (
                <TouchableOpacity
                  style={styles.increaseCapacityButton}
                  onPress={() => router.push({
                    pathname: '/(tabs)/profile/organization/capacity',
                    params: {
                      currentCapacity: organization.orgCapacity.toString(),
                      userEmail: userEmail,
                    },
                  })}
                >
                  <Ionicons name="trending-up-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.increaseCapacityButtonText}>Purchase Capacity</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {isTeamLead && organization && organization.currentMemberCount < organization.orgCapacity && (
            <View style={styles.inviteSection}>
              <TouchableOpacity 
                style={styles.inviteButton}
                onPress={() => router.push('/(tabs)/profile/organization/invite')}
              >
                <Ionicons name="person-add-outline" size={24} color="#FFFFFF" />
                <Text style={styles.inviteButtonText}>Invite Teacher</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.membersSection}>
            <Text style={styles.sectionTitle}>Members</Text>
            {members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberInfo}>
                  {member.profileImage ? (
                    <ExpoImage
                      source={{ uri: member.profileImage }}
                      style={styles.profileImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Ionicons name="person" size={24} color="#64748B" />
                    </View>
                  )}
                  <View style={styles.memberDetails}>
                    <View style={styles.memberNameRow}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {member.isTeamLead && (
                        <View style={styles.teamLeadBadge}>
                          <Text style={styles.teamLeadText}>Team Lead</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                </View>
                {isTeamLead && !member.isTeamLead && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveTeacher(member)}
                  >
                    <Ionicons name="close-circle" size={24} color="#DC2626" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </>
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
  errorContainer: {
    margin: horizontalScale(20),
    padding: moderateScale(15),
    backgroundColor: '#FEE2E2',
    borderRadius: moderateScale(12),
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#DC2626',
    textAlign: 'center',
  },
  infoSection: {
    marginTop: verticalScale(20),
    marginHorizontal: horizontalScale(20),
    padding: moderateScale(20),
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  orgName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A2B4B',
    marginBottom: verticalScale(5),
  },
  capacityText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginBottom: verticalScale(10),
  },
  increaseCapacityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A2B4B',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    marginTop: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  increaseCapacityButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    marginLeft: horizontalScale(8),
  },
  inviteSection: {
    marginTop: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
  },
  inviteButton: {
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
  inviteButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    marginLeft: horizontalScale(8),
  },
  membersSection: {
    marginTop: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
    marginBottom: verticalScale(40),
  },
  sectionTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#1A2B4B',
    marginBottom: verticalScale(15),
  },
  memberItem: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  removeButton: {
    marginLeft: horizontalScale(10),
    padding: moderateScale(5),
  },
  profileImage: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
  },
  profileImagePlaceholder: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberDetails: {
    flex: 1,
    marginLeft: horizontalScale(15),
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(5),
  },
  memberName: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#1A2B4B',
  },
  teamLeadBadge: {
    marginLeft: horizontalScale(10),
    backgroundColor: '#1A2B4B',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(4),
  },
  teamLeadText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(10),
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  memberEmail: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#64748B',
  },
});

export default OrganizationMembersPage;

