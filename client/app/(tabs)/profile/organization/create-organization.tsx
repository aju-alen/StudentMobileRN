import React, { useState, useEffect } from 'react';
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
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { FONT } from '../../../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../../../utils/metrics';
import { ipURL } from '../../../utils/utils';
import { axiosWithAuth } from '../../../utils/customAxios';
import StatusBarComponent from '../../../components/StatusBarComponent';

const ROLE_OPTIONS = [
  { label: 'Owner', value: 'OWNER' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Tutor', value: 'TEACHER' },
] as const;

const CreateOrganizationPage = () => {
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [organizationRole, setOrganizationRole] = useState<'OWNER' | 'MANAGER' | 'TEACHER'>('OWNER');
  const [tradeLicenseUri, setTradeLicenseUri] = useState<string | null>(null);
  const [tradeLicenseLocation, setTradeLicenseLocation] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosWithAuth.get(`${ipURL}/api/auth/metadata`);
        setUserId(res.data?.id ?? null);
      } catch {
        // ignore
      }
    };
    fetchUser();
  }, []);

  const uploadTradeLicenseToAws = async (pdfUri: string, uid: string): Promise<string> => {
    const uriParts = pdfUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const fileInfo = await FileSystem.getInfoAsync(pdfUri);
    if (!fileInfo.exists) throw new Error('File does not exist');

    const fileName = `trade-license-${Date.now()}.${fileType}`;
    const formData = new FormData();
    formData.append('tradeLicense', {
      uri: pdfUri,
      name: fileName,
      type: 'application/pdf',
    } as any);

    const response = await axios.post(
      `${ipURL}/api/s3/upload-to-aws/organization-trade-license/${uid}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    const location = response.data?.location || response.data?.data?.Location;
    if (!location) throw new Error('No location returned from upload');
    return location;
  };

  const pickTradeLicensePDF = async () => {
    if (!userId) {
      Alert.alert('Error', 'Please wait for the page to load.');
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;

      const pdfUri = result.assets[0].uri;
      setTradeLicenseUri(pdfUri);
      setError('');
      setUploadingPdf(true);
      const location = await uploadTradeLicenseToAws(pdfUri, userId);
      setTradeLicenseLocation(location);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err?.message || 'Failed to pick or upload PDF');
      setTradeLicenseUri(null);
      setTradeLicenseLocation(null);
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleCreate = async () => {
    const trimmedName = orgName.trim();
    const trimmedEmail = orgEmail.trim();

    if (!trimmedName) {
      setError('Organization name is required');
      return;
    }
    if (!trimmedEmail) {
      setError('Organization email is required');
      return;
    }
    if (!tradeLicenseLocation) {
      setError('Trade license PDF is required. Please select and upload a PDF.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axiosWithAuth.post(`${ipURL}/api/auth/organization/create`, {
        orgName: trimmedName,
        orgEmail: trimmedEmail,
        organizationRole,
        tradeLicenseLocation,
      });

      if (response.status === 201) {
        Alert.alert(
          'Success',
          `Organization "${response.data.organization.orgName}" has been created. You can now invite teachers and manage your organization.`,
          [{ text: 'OK', onPress: () => router.replace('/(tabs)/profile/organization') }]
        );
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create organization';
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#1A2B4B" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Organization</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Create your organization to manage multiple teachers and invite them with a code. You will be the team lead.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Organization Name *</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="Enter organization name"
            placeholderTextColor="#94A3B8"
            value={orgName}
            onChangeText={(text) => { setOrgName(text); setError(''); }}
            autoCapitalize="words"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Organization Email *</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            placeholder="org@example.com"
            placeholderTextColor="#94A3B8"
            value={orgEmail}
            onChangeText={(text) => { setOrgEmail(text); setError(''); }}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Trade License PDF *</Text>
          <TouchableOpacity
            style={[styles.pdfButton, uploadingPdf && styles.pdfButtonDisabled]}
            onPress={pickTradeLicensePDF}
            disabled={uploadingPdf || !userId || loading}
          >
            {uploadingPdf ? (
              <ActivityIndicator size="small" color="#1A2B4B" />
            ) : (
              <>
                <Ionicons name="document-attach-outline" size={22} color="#1A2B4B" />
                <Text style={styles.pdfButtonText}>
                  {tradeLicenseLocation ? 'PDF Selected ✓' : 'Select Trade License PDF'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Number of Teachers</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value="3"
            editable={false}
          />
          <Text style={styles.noteText}>
            Default is 3. If more required, can be purchased later in Organization Settings.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your role in organization</Text>
          <View style={styles.roleRow}>
            {ROLE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.roleOption,
                  organizationRole === opt.value && styles.roleOptionActive,
                ]}
                onPress={() => setOrganizationRole(opt.value)}
                disabled={loading}
              >
                <Text style={[
                  styles.roleOptionText,
                  organizationRole === opt.value && styles.roleOptionTextActive,
                ]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="business-outline" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Organization</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F8' },
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
  backButton: { marginRight: horizontalScale(15), padding: moderateScale(8) },
  title: { fontFamily: FONT.bold, fontSize: moderateScale(24), color: '#1A2B4B' },
  content: { padding: horizontalScale(20), marginTop: verticalScale(20) },
  description: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#64748B',
    marginBottom: verticalScale(20),
    lineHeight: moderateScale(20),
  },
  inputContainer: { marginBottom: verticalScale(20) },
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
  inputDisabled: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  inputError: { borderColor: '#DC2626' },
  noteText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#64748B',
    marginTop: verticalScale(8),
    lineHeight: moderateScale(16),
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: horizontalScale(8),
  },
  pdfButtonDisabled: { opacity: 0.6 },
  pdfButtonText: { fontFamily: FONT.medium, fontSize: moderateScale(16), color: '#1A2B4B' },
  roleRow: { flexDirection: 'row', gap: horizontalScale(10) },
  roleOption: {
    flex: 1,
    paddingVertical: verticalScale(12),
    paddingHorizontal: horizontalScale(12),
    borderRadius: moderateScale(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  roleOptionActive: {
    backgroundColor: '#1A2B4B',
    borderColor: '#1A2B4B',
  },
  roleOptionText: { fontFamily: FONT.medium, fontSize: moderateScale(14), color: '#1A2B4B' },
  roleOptionTextActive: { color: '#FFFFFF' },
  errorText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#DC2626',
    marginBottom: verticalScale(12),
  },
  createButton: {
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
  createButtonDisabled: { opacity: 0.6 },
  createButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    marginLeft: horizontalScale(8),
  },
});

export default CreateOrganizationPage;
