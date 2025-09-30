import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FONT } from '../../../constants/theme';
import { horizontalScale, verticalScale, moderateScale } from '../../utils/metrics';

const DevStats = () => {
  const clickCountRef = useRef(0);
  const [showCredit, setShowCredit] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleHiddenPress = () => {
    clickCountRef.current += 1;
    
    if (clickCountRef.current === 13) {
      setShowCredit(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
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
        <Text style={styles.headerTitle}>Dev Stats</Text>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.loadingText}>Nothing here for now, stats still loading...</Text>
        
        {/* Hidden Clickable Area */}
        <TouchableOpacity
          style={styles.hiddenButton}
          onPress={handleHiddenPress}
          activeOpacity={1}
        >
          <View style={styles.loadingDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </TouchableOpacity>

        {/* Developer Credit */}
        {showCredit && (
          <Animated.View 
            style={[
              styles.developerCreditContainer,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.developerCreditLine} />
            <Text style={styles.developerCreditText}>
              <Text style={styles.developerCreditLabel}>From the desk of </Text>
              <Text style={styles.developerName}>Alenaju</Text>
            </Text>
          </Animated.View>
        )}
      </View>
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
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(16),
  },
  loadingText: {
    fontSize: moderateScale(16),
    fontFamily: FONT.regular,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: verticalScale(24),
  },
  hiddenButton: {
    width: moderateScale(100),
    height: moderateScale(40),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#1A4C6E',
    marginHorizontal: moderateScale(4),
    opacity: 0.3,
  },
  developerCreditContainer: {
    position: 'absolute',
    bottom: verticalScale(40),
    alignItems: 'center',
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

export default DevStats; 