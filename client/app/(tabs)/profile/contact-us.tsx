import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FONT } from '../../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../utils/metrics';
import * as Linking from 'expo-linking';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = () => {
    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Here you would typically send the form data to your backend
    Alert.alert(
      'Success',
      'Your message has been sent. We will get back to you soon.',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const contactMethods = [
    {
      title: 'Email Support',
      description: 'Get in touch with our support team',
      icon: 'mail-outline' as const,
      action: () => Linking.openURL('mailto:support@coachacadem.ae'),
    },
    // {
    //   title: 'WhatsApp Support',
    //   description: 'Chat with us on WhatsApp',
    //   icon: 'logo-whatsapp' as const,
    //   action: () => Linking.openURL('https://wa.me/971501234567'),
    // },
    // {
    //   title: 'Phone Support',
    //   description: 'Call us directly',
    //   icon: 'call-outline' as const,
    //   action: () => Linking.openURL('tel:+971501234567'),
    // },
  ];

  const handleContactPress = (action: () => void) => {
    try {
      action();
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#1A4C6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Contact Methods */}
          <View style={styles.contactMethodsContainer}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactMethod}
                onPress={() => handleContactPress(method.action)}
                activeOpacity={0.7}
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name={method.icon} size={moderateScale(24)} color="#1A4C6E" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>{method.title}</Text>
                  <Text style={styles.contactDescription}>{method.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={moderateScale(20)} color="#64748B" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Developer Credit */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: moderateScale(8),
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontFamily: FONT.bold,
    color: '#1A4C6E',
    marginLeft: horizontalScale(12),
  },
  scrollView: {
    flex: 1,
  },
  contactMethodsContainer: {
    padding: moderateScale(16),
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(12),
  },
  contactIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: horizontalScale(12),
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: moderateScale(16),
    fontFamily: FONT.semiBold,
    color: '#1A4C6E',
    marginBottom: verticalScale(4),
  },
  contactDescription: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#64748B',
  },
  formContainer: {
    padding: moderateScale(16),
  },
  formTitle: {
    fontSize: moderateScale(20),
    fontFamily: FONT.bold,
    color: '#1A4C6E',
    marginBottom: verticalScale(20),
  },
  inputContainer: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(14),
    fontFamily: FONT.medium,
    color: '#1A4C6E',
    marginBottom: verticalScale(8),
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    fontSize: moderateScale(16),
    fontFamily: FONT.regular,
    color: '#1A4C6E',
  },
  messageInput: {
    height: verticalScale(120),
  },
  submitButton: {
    backgroundColor: '#1A4C6E',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginTop: verticalScale(16),
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontFamily: FONT.semiBold,
  },
  footer: {
    padding: moderateScale(16),

    marginTop: verticalScale(20),
  },
  footerText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#64748B',
  },
});

export default ContactUs; 