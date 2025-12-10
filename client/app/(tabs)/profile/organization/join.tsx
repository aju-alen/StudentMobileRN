import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../../../utils/metrics';
import { ipURL } from '../../../utils/utils';
import { axiosWithAuth } from '../../../utils/customAxios';
import StatusBarComponent from '../../../components/StatusBarComponent';

const JoinOrganizationPage = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }

    // Validate format (8 alphanumeric characters)
    const codeRegex = /^[A-Z0-9]{8}$/;
    if (!codeRegex.test(inviteCode.trim().toUpperCase())) {
      setError('Invalid invite code format. Code must be 8 alphanumeric characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axiosWithAuth.post(`${ipURL}/api/auth/organization/join`, {
        inviteCode: inviteCode.trim().toUpperCase(),
      });

      if (response.status === 200) {
        Alert.alert(
          'Success',
          `You have successfully joined ${response.data.organization.orgName}`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)/profile/organization/members'),
            },
          ]
        );
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to join organization';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBarComponent />


      <View style={styles.content}>
        <Text style={styles.description}>
          Enter the organization invite code provided by the team lead to join their organization.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Invite Code</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="ABCD1234"
            placeholderTextColor="#94A3B8"
            value={inviteCode}
            onChangeText={(text) => {
              setInviteCode(text.toUpperCase());
              setError('');
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
            editable={!loading}
          />
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.joinButton, loading ? styles.joinButtonDisabled : null]}
          onPress={handleJoin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="people-outline" size={20} color="#FFFFFF" />
              <Text style={styles.joinButtonText}>Join Organization</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>
            You must be a verified teacher to join an organization. Once joined, you'll be able to view organization members.
          </Text>
        </View>
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
  content: {
    padding: horizontalScale(20),
    marginTop: verticalScale(20),
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginBottom: verticalScale(20),
    lineHeight: moderateScale(20),
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#1A2B4B',
    marginBottom: verticalScale(8),
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    fontFamily: FONT.bold,
    fontSize: moderateScale(20),
    color: '#1A2B4B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    letterSpacing: moderateScale(2),
    textAlign: 'center',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#DC2626',
    marginTop: verticalScale(5),
  },
  joinButton: {
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
    marginBottom: verticalScale(20),
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
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
});

export default JoinOrganizationPage;

