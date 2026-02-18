import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { COLORS } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { ipURL } from '../utils/utils';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess(false);
    try {
      await axios.post(`${ipURL}/api/auth/forgot-password`, {
        email: trimmedEmail,
      });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg && typeof msg === 'string' ? msg : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Text style={styles.headerText}>Forgot Password</Text>
            <Text style={styles.subHeaderText}>
              Enter your email and we'll send you a 6-digit code to reset your password.
            </Text>
          </View>

          <View style={styles.form}>
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            {success ? (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>
                  If an account exists with this email, you will receive a 6-digit code. Check your inbox and spam folder, then enter the code on the next screen.
                </Text>
                <Pressable
                  onPress={() => router.replace({ pathname: '/(authenticate)/reset-password', params: { email: email.trim() } })}
                  style={({ pressed }) => [styles.loginLinkButton, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.loginLinkText}>Enter code & set new password</Text>
                </Pressable>
                <Pressable
                  onPress={() => router.replace('/(authenticate)/login')}
                  style={({ pressed }) => [styles.backToLoginLink, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.backToLoginLinkText}>Back to Login</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Email Address"
                      placeholderTextColor="#999"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                      editable={!isLoading}
                    />
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
                    <Text style={styles.submitButtonText}>Send Reset Link</Text>
                  )}
                </Pressable>
              </>
            )}

            {!success && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>Remember your password?</Text>
                <Pressable
                  onPress={() => router.replace('/(authenticate)/login')}
                  style={({ pressed }) => pressed && { opacity: 0.7 }}
                >
                  <Text style={styles.footerLink}>Login</Text>
                </Pressable>
              </View>
            )}
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(24),
  },
  footerText: {
    fontSize: moderateScale(16),
    color: '#666',
  },
  footerLink: {
    fontSize: moderateScale(16),
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: horizontalScale(6),
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
    backgroundColor: '#e8f5e9',
    padding: moderateScale(16),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(16),
  },
  successText: {
    fontSize: moderateScale(14),
    color: '#2e7d32',
    textAlign: 'center',
  },
  loginLinkButton: {
    marginTop: verticalScale(16),
    alignSelf: 'center',
  },
  loginLinkText: {
    fontSize: moderateScale(16),
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  backToLoginLink: {
    marginTop: verticalScale(12),
    alignSelf: 'center',
  },
  backToLoginLinkText: {
    fontSize: moderateScale(14),
    color: '#666',
  },
});

export default ForgotPasswordPage;
