import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,

} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FONT } from '../../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../utils/metrics';
import * as Linking from 'expo-linking';


const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);

  const [helpCategories, setHelpCategories] = useState([
    {
      title: 'Account & Security',
      icon: 'shield-checkmark-outline',
      items: [
        {
          id: 'change-password',
          title: 'How to change your password',
          content: 'To change your password, go to Settings > Change Password under Account. Enter your current password and your new password twice to confirm.'
        },
        {
          id: 'account-security',
          title: 'Account security tips',
          content: 'Keep your account secure by using a strong password and never sharing your login credentials.'
        },
        {
          id: 'manage-profile',
          title: 'Managing your profile',
          content: 'You can update your profile information by going to Settings > Edit Profile. Here you can change your name and bio. For any other changes, please contact support.'
        },
        
      ],
    },
    {
      title: 'Learning & Courses',
      icon: 'book-outline',
      items: [
        {
          id: 'enroll-courses',
          title: 'How to enroll in courses',
          content: 'Browse available courses in the Courses section. Click on a course to view details and click "Enroll Now", book your slot, complete payment and you will be able to access the course on the day of the slot.'
        },
        {
          id: 'access-materials',
          title: 'What to do after enrolling in a course',
          content: 'Once payment is completed, you can click on the "Your Bookings" tab on the home page and you will be able to see the course details and the date of the slot. Clicking on the course details will give you the zoom link to join the course.'
        },
        // {
        //   id: 'track-progress',
        //   title: 'Tracking your progress',
        //   content: 'Your progress is automatically tracked in the course dashboard. You can see completed lessons and overall course progress.'
        // },
        // {
        //   id: 'completion-certificates',
        //   title: 'Course completion certificates',
        //   content: 'Upon completing all course requirements, you can download your certificate from the course dashboard.'
        // },
      ],
    },
    {
      title: 'Technical Support',
      icon: 'construct-outline',
      items: [
        {
          id: 'app-troubleshooting',
          title: 'App troubleshooting',
          content: 'If you experience issues, try clearing the app cache, updating to the latest version, or reinstalling the app.'
        },
        {
          id: 'video-playback',
          title: 'Video playback issues',
          content: 'Check your internet connection. If nothing works, please contact support.'
        },
        {
          id: 'connection-problems',
          title: 'Connection problems',
          content: 'Ensure you have a stable internet connection. Try switching between WiFi and mobile data if issues persist.'
        },
      ],
    },
    {
      title: 'Billing & Payments',
      icon: 'card-outline',
      items: [
        {
          id: 'payment-methods',
          title: 'Payment methods',
          content: 'We accept credit cards and debit cards for now. We will be adding more payment methods soon. If you have any issues with payment, please contact support.'
        },
        {
          id: 'refund-policy',
          title: 'Refund policy',
          content: 'Please contact support for any issues with payment.'
        },
        // {
        //   id: 'subscription-management',
        //   title: 'Subscription management',
        //   content: 'Manage your subscription in Settings > Billing. You can upgrade, downgrade, or cancel your subscription.'
        // },
        // {
        //   id: 'billing-history',
        //   title: 'Billing history',
        //   content: 'View your complete billing history and download invoices in Settings > Billing > History.'
        // },
      ],
    },
  ]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(helpCategories);
      return;
    }

    const searchResults = helpCategories.map(category => {
      const filteredItems = category.items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (filteredItems.length > 0) {
        return {
          ...category,
          items: filteredItems
        };
      }
      return null;
    }).filter(Boolean);

    setFilteredCategories(searchResults);
  }, [searchQuery]);

  const handleHelpItemPress = (item) => {
    router.push({
      pathname: '/(tabs)/profile/help-item',
      params: { id: item.id, title: item.title, content: item.content }
    });
  };

  const renderCategory = (category) => (
    <View key={category.title} style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <Ionicons name={category.icon} size={moderateScale(24)} color="#1A4C6E" />
        <Text style={styles.categoryTitle}>{category.title}</Text>
      </View>
      {category.items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.helpItem}
          onPress={() => handleHelpItemPress(item)}
        >
          <Text style={styles.helpItemText}>{item.title}</Text>
          <Ionicons name="chevron-forward" size={moderateScale(20)} color="#64748B" />
        </TouchableOpacity>
      ))}
    </View>
  );

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={moderateScale(20)} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for help..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={moderateScale(20)} color="#64748B" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Contact Support Button */}
      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => router.push('/(tabs)/profile/contact-us')}
      >
        <Ionicons name="mail-outline" size={moderateScale(20)} color="#FFFFFF" />
        <Text style={styles.contactButtonText}>Contact Support</Text>
      </TouchableOpacity>

      {/* Help Categories */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {filteredCategories.length > 0 ? (
          filteredCategories.map(renderCategory)
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={moderateScale(48)} color="#64748B" />
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>Try different keywords or contact support</Text>
          </View>
        )}
        
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    margin: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(12),
    height: verticalScale(48),
  },
  searchInput: {
    flex: 1,
    marginLeft: horizontalScale(8),
    fontSize: moderateScale(16),
    fontFamily: FONT.regular,
    color: '#1A4C6E',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A4C6E',
    margin: moderateScale(16),
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: moderateScale(16),
    fontFamily: FONT.semiBold,
    marginLeft: horizontalScale(8),
  },
  scrollView: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: verticalScale(24),
    paddingHorizontal: moderateScale(16),
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  categoryTitle: {
    fontSize: moderateScale(18),
    fontFamily: FONT.semiBold,
    color: '#1A4C6E',
    marginLeft: horizontalScale(12),
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  helpItemText: {
    fontSize: moderateScale(16),
    fontFamily: FONT.regular,
    color: '#1A4C6E',
    flex: 1,
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
  clearButton: {
    padding: moderateScale(4),
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(32),
  },
  noResultsText: {
    fontSize: moderateScale(18),
    fontFamily: FONT.semiBold,
    color: '#1A4C6E',
    marginTop: verticalScale(16),
  },
  noResultsSubtext: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#64748B',
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
});

export default HelpCenter; 