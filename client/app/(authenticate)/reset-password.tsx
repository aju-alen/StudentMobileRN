import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { COLORS } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { ipURL } from '../utils/utils';

const ResetPasswordPage = () => {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordShown, setIsNewPasswordShown] = useState(false);
  const [isConfirmPasswordShown, setIsConfirmPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const emailFromParams = Boolean(params.email);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter the 6-digit code from your email.');
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await axios.post(`${ipURL}/api/auth/reset-password`, {
        email: trimmedEmail,
        otp: otp.trim(),
        newPassword,
      });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg && typeof msg === 'string' ? msg : 'Invalid or expired code. Please request a new password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#2e7d32" style={styles.successIcon} />
            <Text style={styles.successTitle}>Password reset successfully</Text>
            <Text style={styles.successText}>You can now log in with your new password.</Text>
            <Pressable
              onPress={() => router.replace('/(authenticate)/login')}
              style={({ pressed }) => [styles.loginButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.loginButtonText}>Back to Login</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.headerText}>Set New Password</Text>
            <Text style={styles.subHeaderText}>
              Enter the 6-digit code we sent to your email, then choose a new password.
            </Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                  editable={!emailFromParams && !isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>6-digit code</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Enter code from email"
                  placeholderTextColor="#999"
                  value={otp}
                  onChangeText={(text) => setOtp(text.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={styles.input}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!isNewPasswordShown}
                  style={styles.input}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setIsNewPasswordShown(!isNewPasswordShown)}
                  style={styles.eyeIcon}
                >
                  <Ionicons name={isNewPasswordShown ? 'eye-off' : 'eye'} size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!isConfirmPasswordShown}
                  style={styles.input}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setIsConfirmPasswordShown(!isConfirmPasswordShown)}
                  style={styles.eyeIcon}
                >
                  <Ionicons name={isConfirmPasswordShown ? 'eye-off' : 'eye'} size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitButtonPressed,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Reset Password</Text>
              )}
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    marginHorizontal: horizontalScale(24),
    paddingTop: verticalScale(16),
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: verticalScale(24),
  },
  header: {
    marginBottom: verticalScale(32),
  },
  headerText: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: '#333',
  },
  subHeaderText: {
    fontSize: moderateScale(16),
    color: '#666',
    marginTop: verticalScale(8),
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: moderateScale(14),
    color: '#333',
    marginBottom: verticalScale(8),
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  inputWrapper: {
    width: '100%',
    height: verticalScale(50),
    borderColor: '#ddd',
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(16),
    backgroundColor: '#f8f8f8',
  },
  inputIcon: {
    marginRight: horizontalScale(12),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    color: '#333',
  },
  eyeIcon: {
    padding: moderateScale(8),
  },
  submitButton: {
    width: '100%',
    height: verticalScale(50),
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(16),
  },
  errorText: {
    fontSize: moderateScale(14),
    color: '#c62828',
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: verticalScale(16),
  },
  successTitle: {
    fontSize: moderateScale(22),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: verticalScale(8),
  },
  successText: {
    fontSize: moderateScale(16),
    color: '#666',
    textAlign: 'center',
    marginBottom: verticalScale(32),
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(14),
    paddingHorizontal: horizontalScale(32),
    borderRadius: moderateScale(12),
  },
  loginButtonText: {
    fontSize: moderateScale(16),
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ResetPasswordPage;
