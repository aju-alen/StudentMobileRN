import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from '../../utils/utils';
import { router, useLocalSearchParams } from "expo-router";
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as WebBrowser from 'expo-web-browser';

const { width } = Dimensions.get('window');

interface SubjectData {
  id?: string;
  subjectName?: string;
  subjectNameSubHeading?: string;
  subjectDuration?: number;
  subjectSearchHeading?: string;
  subjectDescription?: string;
  subjectPoints?: string[];
  subjectImage?: string;
  subjectPrice?: number;
  subjectBoard?: string;
  subjectLanguage?: string;
  subjectTags?: string[];
  subjectGrade?: number;
  subjectVerification?: boolean;
  teacherVerification?: string[];
  createdAt?: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

const VerifySingleSubject = () => {
  const [subjectData, setSubjectData] = useState<SubjectData>({});
  const [loading, setLoading] = useState(false);
  const { verifySingleSubject } = useLocalSearchParams();

  useEffect(() => {
    getSubjects();
  }, []);

  const getSubjects = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const resp = await axios.get(
        `${ipURL}/api/subjects/${verifySingleSubject}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubjectData(resp.data);
    } catch (error) {
      console.error("Error fetching subject data:", error);
    }
  };

  const handleOpenPDF = async (url: string) => {
    setLoading(true);
    try {
      if (Platform.OS === 'ios') {
        await WebBrowser.openBrowserAsync(url);
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      alert('Unable to open PDF. Please try again.');
    }
    setLoading(false);
  };

  const handleVerifySubject = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.put(
        `${ipURL}/api/subjects/verify/${verifySingleSubject}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      router.replace('/(tabs)/verification');
    } catch (error) {
      console.error("Error verifying subject:", error);
      alert('Failed to verify subject. Please try again.');
    }
  };

  const handleRejectSubject = async () => {
    // Implement reject logic
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: subjectData.subjectImage }}
        style={styles.headerImage}
        resizeMode="cover"
      />

      <View style={styles.contentContainer}>
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusIndicator}>
            <Ionicons name={subjectData.subjectVerification ? "checkmark-circle" : "time"} 
                     size={24} 
                     color={subjectData.subjectVerification ? "#4CAF50" : "#FFA000"} />
            <Text style={[styles.statusText, 
                        {color: subjectData.subjectVerification ? "#4CAF50" : "#FFA000"}]}>
              {subjectData.subjectVerification ? "Verified" : "Pending Verification"}
            </Text>
          </View>
          <Text style={styles.dateText}>
            Submitted on {formatDate(subjectData.createdAt || '')}
          </Text>
        </View>

        {/* Subject Header */}
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.subjectName}>{subjectData.subjectName}</Text>
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <Ionicons name="school" size={16} color="#0066cc" />
                <Text style={styles.badgeText}>{subjectData.subjectBoard}</Text>
              </View>
              <View style={[styles.badge, styles.gradeBadge]}>
                <Ionicons name="bookmark" size={16} color="#f57c00" />
                <Text style={[styles.badgeText, {color: '#f57c00'}]}>
                  Grade {subjectData.subjectGrade}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Course Fee</Text>
            <Text style={styles.price}>{subjectData.subjectPrice}</Text>
            <Text style={styles.durationText}>
              {subjectData.subjectDuration} months
            </Text>
          </View>
        </View>

        {/* Quick Info Cards */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.quickInfoCard}>
            <Ionicons name="language" size={24} color="#1976D2" />
            <Text style={styles.quickInfoLabel}>Language</Text>
            <Text style={styles.quickInfoValue}>{subjectData.subjectLanguage}</Text>
          </View>
          <View style={styles.quickInfoCard}>
            <Ionicons name="time" size={24} color="#388E3C" />
            <Text style={styles.quickInfoLabel}>Duration</Text>
            <Text style={styles.quickInfoValue}>{subjectData.subjectDuration} Months</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Description</Text>
          <Text style={styles.description}>{subjectData.subjectDescription}</Text>
        </View>

        {/* Key Points Section */}
        {subjectData.subjectPoints && subjectData.subjectPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Course Highlights</Text>
            {subjectData.subjectPoints.map((point, index) => (
              <View key={index} style={styles.pointRow}>
                <View style={styles.bulletPoint}>
                  <Text style={styles.bulletNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Verification Documents */}
        {subjectData.teacherVerification && subjectData.teacherVerification.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification Documents</Text>
            {subjectData.teacherVerification.map((url, index) => (
              <TouchableOpacity
                key={index}
                style={styles.documentButton}
                onPress={() => handleOpenPDF(url)}
                disabled={loading}
              >
                <Ionicons name="document-text" size={24} color="#fff" />
                <Text style={styles.documentButtonText}>
                  View Document {index + 1}
                </Text>
                <Ionicons name="open-outline" size={20} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={handleVerifySubject}
          >
            <Ionicons name="checkmark-circle" size={24} color="white" />
            <Text style={styles.buttonText}>Verify Subject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rejectButton}
            onPress={handleRejectSubject}
          >
            <Ionicons name="close-circle" size={24} color="white" />
            <Text style={styles.buttonText}>Reject Subject</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerImage: {
    width: width,
    height: 220,
    backgroundColor: '#e0e0e0',
  },
  contentContainer: {
    padding: 16,
    marginTop: -30,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    color: '#666',
    fontSize: 14,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  subjectName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: '#f0f7ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gradeBadge: {
    backgroundColor: '#fff3e0',
  },
  badgeText: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2e7d32',
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quickInfoContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  quickInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  bulletPoint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletNumber: {
    color: '#0066cc',
    fontSize: 14,
    fontWeight: '600',
  },
  pointText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  documentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  verifyButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VerifySingleSubject;