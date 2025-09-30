import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { COLORS } from '../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';
import { ipURL } from '../utils/utils';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current; // For fade-in animation

  useEffect(() => {
    // Fade-in animation when the component mounts
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    const user = {
      email,
      password: password.trim(),
    };

    try {
      const resp = await axios.post(`${ipURL}/api/auth/login`, user);
      console.log(resp.data, 'Logged in successfully');

      await AsyncStorage.setItem('authToken', resp.data.token);
      await AsyncStorage.setItem('userDetails', JSON.stringify({
        isTeacher: resp.data.isTeacher,
        isAdmin: resp.data.isAdmin,
        userId: resp.data.userId,
        userProfileImage: resp.data.userProfileImage,
        email: resp.data.email,
      }));

      if (resp.data.hasSeenOnboarding === false) {
        // First time user - redirect to onboarding
        router.replace({
          pathname: '/onboarding',
          params: { userType: resp.data.isTeacher ? 'teacher' : 'student' }
        });
        const userUpdate = await axios.put(`${ipURL}/api/auth/update-user-has-seen-onboarding`, {
          userId: resp.data.userId,
        });
        console.log(userUpdate, 'User has seen onboarding');
      } else {
        // Returning user - redirect to home
        router.replace('/(tabs)/home');
      }
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Welcome Back</Text>
          <Text style={styles.subHeaderText}>Login to continue</Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

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
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordShown}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordShown(!isPasswordShown)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={isPasswordShown ? 'eye-off' : 'eye'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.loginButtonPressed,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable 
              onPress={() => router.replace('/(authenticate)/register')}
              style={({ pressed }) => pressed && { opacity: 0.7 }}
            >
              <Text style={styles.footerLink}>Register</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>
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
    justifyContent: 'center',
    marginHorizontal: horizontalScale(24),
  },
  header: {
    marginBottom: verticalScale(32),
  },
  headerText: {
    fontSize: moderateScale(28),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: moderateScale(16),
    color: '#666',
    textAlign: 'center',
    marginTop: verticalScale(8),
  },
  form: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
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
  loginButton: {
    width: '100%',
    height: verticalScale(50),
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(24),
  },
  loginButtonPressed: {
    opacity: 0.9,
  },
  loginButtonText: {
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
});

export default LoginPage;