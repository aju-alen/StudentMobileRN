import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { FONT } from '../../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../utils/metrics';

const HelpItem = () => {
  const { title, content } = useLocalSearchParams();

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
        <Text style={styles.headerTitle}>Help Center</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.content}>{content}</Text>
        </View>

        {/* Developer Credit */}
      
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  contentContainer: {
    padding: moderateScale(16),
  },
  title: {
    fontSize: moderateScale(24),
    fontFamily: FONT.bold,
    color: '#1A4C6E',
    marginBottom: verticalScale(16),
  },
  content: {
    fontSize: moderateScale(16),
    fontFamily: FONT.regular,
    color: '#1A4C6E',
    lineHeight: verticalScale(24),
  },
  developerCreditContainer: {
    alignItems: 'center',
    marginTop: verticalScale(30),
    marginBottom: verticalScale(20),
    paddingHorizontal: moderateScale(16),
  },
  developerCreditLine: {
    width: moderateScale(40),
    height: 2,
    backgroundColor: '#1A4C6E',
    marginBottom: verticalScale(12),
    opacity: 0.3,
  },
  developerCreditText: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  developerCreditLabel: {
    fontSize: moderateScale(10),
    fontFamily: FONT.regular,
    color: '#64748B',
  },
  developerName: {
    fontSize: moderateScale(10),
    fontFamily: FONT.semiBold,
    color: '#1A4C6E',
  },
});

export default HelpItem; 