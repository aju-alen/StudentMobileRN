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

const InviteTeacherPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendInvite = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axiosWithAuth.post(`${ipURL}/api/auth/organization/invite`, {
        email: email.trim().toLowerCase(),
      });

      if (response.status === 200) {
        Alert.alert(
          'Success',
          `Invitation sent successfully to ${response.data.teacher.name}`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send invitation';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.title}>Invite Teacher</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Enter the email address of a teacher to invite them to your organization.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="teacher@example.com"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError('');
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.sendButton, loading ? styles.sendButtonDisabled : null]}
          onPress={handleSendInvite}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="send-outline" size={20} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Send Invite</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#64748B" />
          <Text style={styles.infoText}>
            The teacher must already have an account and not be part of another organization.
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
    fontFamily: FONT.regular,
    fontSize: moderateScale(16),
    color: '#1A2B4B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  sendButton: {
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
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
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

export default InviteTeacherPage;

