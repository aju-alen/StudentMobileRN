import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { ipURL } from '../../utils/utils';
import { axiosWithAuth } from '../../utils/customAxios';

interface BlockedUser {
  id: string;
  blockedTeacherId: string;
  blockedTeacher: {
    name: string;
    email: string;
    profileImage?: string;
  };
  createdAt: string;
}

const BlockedUsersPage = () => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    try {
      const response = await axiosWithAuth.get(`${ipURL}/api/reports/blocked-users`);
      setBlockedUsers(response.data);
    } catch (err) {
      setError('Failed to fetch blocked users');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async (blockedTeacherId: string) => {
    console.log("blockedTeacherId", blockedTeacherId);
    Alert.alert(
      'Unblock User',
      'Are you sure you want to unblock this user?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosWithAuth.post(`${ipURL}/api/reports/unblock-user`, {
                blockedTeacherId: blockedTeacherId,
              });
              // Refresh the list after unblocking
              fetchBlockedUsers();
            } catch (err) {
              Alert.alert('Error', 'Failed to unblock user');
              console.error(err);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : blockedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>No blocked users</Text>
        </View>
      ) : (
        <ScrollView style={styles.usersList}>
          {blockedUsers.map((blockedUser) => (
            <View key={blockedUser.id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.userHeader}>
                  <Text style={styles.userName}>{blockedUser.blockedTeacher.name}</Text>
                  <Text style={styles.userEmail}>{blockedUser.blockedTeacher.email}</Text>
                </View>
                <Text style={styles.blockedDate}>Blocked on {formatDate(blockedUser.createdAt)}</Text>
              </View>
              <TouchableOpacity
                style={styles.unblockButton}
                onPress={() => handleUnblock(blockedUser.blockedTeacherId)}
              >
                <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                <Text style={styles.unblockText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorContainer: {
    padding: moderateScale(16),
    backgroundColor: '#ffebee',
    margin: moderateScale(16),
    borderRadius: moderateScale(8),
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(24),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: '#666',
    marginTop: verticalScale(16),
  },
  usersList: {
    flex: 1,
    padding: moderateScale(16),
  },
  userCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
  },
  userHeader: {
    marginBottom: verticalScale(4),
  },
  userName: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: moderateScale(14),
    color: '#666',
  },
  blockedDate: {
    fontSize: moderateScale(12),
    color: '#999',
  },
  unblockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(8),
  },
  unblockText: {
    color: '#EF4444',
    fontSize: moderateScale(14),
    fontWeight: '600',
    marginLeft: horizontalScale(4),
  },
});

export default BlockedUsersPage; 