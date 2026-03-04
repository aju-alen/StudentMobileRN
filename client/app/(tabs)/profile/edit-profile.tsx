import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FONT } from '../../../constants';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ipURL } from '../../utils/utils';
import { axiosWithAuth } from '../../utils/customAxios';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const EditProfilePage = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    userDescription: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [userIdForImageUpload, setUserIdForImageUpload] = useState<string | null>(null);
  const [profileImageVersion, setProfileImageVersion] = useState<string>('0');

  useEffect(() => {
    fetchUserData();
  }, []);

  // Refetch user when screen is focused (e.g. returning from image picker or after updating photo elsewhere)
  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
      AsyncStorage.getItem('profileImageVersion').then((v) => {
        if (v != null) setProfileImageVersion(v);
      });
    }, [])
  );

  const fetchUserData = async () => {
    try {
      const response = await axiosWithAuth.get(`${ipURL}/api/auth/metadata`);
                
      setUserData({
        name: response.data.name || '',
        email: response.data.email || '',
        userDescription: response.data.userDescription || '',
      });
      setProfileImage(response.data.profileImage || null);
      if (response.data.id) {
        setUserIdForImageUpload(response.data.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const resolveUserIdForUpload = async (): Promise<string> => {
    if (userIdForImageUpload) return userIdForImageUpload;

    const storedUserDetails = await AsyncStorage.getItem('userDetails');
    if (!storedUserDetails) {
      throw new Error('User details not found');
    }

    const parsed = JSON.parse(storedUserDetails);
    if (!parsed.userId) {
      throw new Error('User ID not found');
    }

    setUserIdForImageUpload(parsed.userId);
    return parsed.userId;
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to update your profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.WEBP }
      );
      setSelectedImageUri(manipResult.uri);
    }
  };

  const uploadProfileImage = async () => {
    if (!selectedImageUri) {
      Alert.alert('No Image Selected', 'Please choose an image first.');
      return;
    }

    setIsUploadingImage(true);

    try {
      const userId = await resolveUserIdForUpload();

      const uriParts = selectedImageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append('image', {
        uri: selectedImageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
      formData.append('uploadKey', 'userProfileImageId');
      formData.append('awsId', '');

      const response = await axiosWithAuth.post(
        `${ipURL}/api/s3/upload-to-aws/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const imageLocation = response.data?.data?.Location;
      if (!imageLocation) {
        throw new Error('Image location not returned from server');
      }

      await axiosWithAuth.put(`${ipURL}/api/auth/update-profile/${userId}`, {
        profileImage: imageLocation,
      });

      setProfileImage(imageLocation);
      setSelectedImageUri(null);
      setProfileImageVersion(String(Date.now()));

      // Update AsyncStorage userDetails so home (and any screen using it) shows the new image
      const stored = await AsyncStorage.getItem('userDetails');
      if (stored) {
        const parsed = JSON.parse(stored);
        await AsyncStorage.setItem('userDetails', JSON.stringify({
          ...parsed,
          userProfileImage: imageLocation,
        }));
      }

      // Bump version so profile screen revalidates image cache
      await AsyncStorage.setItem('profileImageVersion', String(Date.now()));

      Alert.alert('Success', 'Your profile picture has been updated.');
    } catch (error: any) {
      console.error('Image upload failed', error);
      Alert.alert(
        'Upload Failed',
        error?.message || 'Please try again or contact support if the problem persists.'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await axiosWithAuth.put(`${ipURL}/api/auth/update-metadata`, {
        body: userData,
      });
      console.log(response.data, 'this is the response');
      await AsyncStorage.setItem('authToken', response.data.token);
      router.back();

    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const displayImageUri = selectedImageUri || (profileImage ? `${profileImage}${profileImage.includes('?') ? '&' : '?'}v=${profileImageVersion}` : null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A2B4B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Photo section */}
      <View style={styles.photoSection}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={pickImage}
          activeOpacity={0.9}
          disabled={isUploadingImage}
        >
          {displayImageUri ? (
            <Image source={{ uri: displayImageUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={moderateScale(48)} color="#94A3B8" />
            </View>
          )}
          <View style={styles.avatarBadge}>
            <Ionicons name="camera" size={moderateScale(16)} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        {selectedImageUri ? (
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={uploadProfileImage}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.uploadButtonText}>Upload photo</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelPhotoButton} onPress={() => setSelectedImageUri(null)}>
              <Text style={styles.cancelPhotoText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={pickImage} style={styles.changePhotoLink}>
            <Text style={styles.changePhotoText}>Change photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Form card */}
      <View style={styles.formCard}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            style={styles.fieldInput}
            value={userData.name}
            onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
            placeholder="Your name"
            placeholderTextColor="#94A3B8"
          />
        </View>
        <View style={styles.fieldDivider} />
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={[styles.fieldInput, styles.fieldInputDisabled]}
            value={userData.email}
            editable={false}
            placeholderTextColor="#94A3B8"
          />
          <Text style={styles.fieldHint}>Email cannot be changed</Text>
        </View>
        <View style={styles.fieldDivider} />
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            style={[styles.fieldInput, styles.fieldInputArea]}
            value={userData.userDescription}
            onChangeText={(text) => setUserData(prev => ({ ...prev, userDescription: text }))}
            placeholder="A short bio about you"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.saveButtonText}>Save changes</Text>
        )}
      </TouchableOpacity>
      </ScrollView>
    </View>
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
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(16),
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
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A2B4B',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: horizontalScale(24),
    paddingTop: verticalScale(32),
    paddingBottom: verticalScale(48),
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: verticalScale(32),
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: verticalScale(12),
  },
  avatar: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: '#1A2B4B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F4F6F8',
  },
  changePhotoLink: {
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(8),
  },
  changePhotoText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#1A2B4B',
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(12),
  },
  uploadButton: {
    backgroundColor: '#1A2B4B',
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(20),
    minWidth: horizontalScale(120),
    alignItems: 'center',
  },
  uploadButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
  cancelPhotoButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(12),
  },
  cancelPhotoText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#64748B',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(8),
    marginBottom: verticalScale(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    elevation: 3,
  },
  field: {
    paddingVertical: verticalScale(16),
  },
  fieldDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 0,
  },
  fieldLabel: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
    color: '#64748B',
    marginBottom: verticalScale(6),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(16),
    color: '#1A2B4B',
    paddingVertical: verticalScale(4),
  },
  fieldInputDisabled: {
    color: '#64748B',
  },
  fieldInputArea: {
    minHeight: verticalScale(72),
    textAlignVertical: 'top',
    paddingVertical: verticalScale(8),
  },
  fieldHint: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(12),
    color: '#94A3B8',
    marginTop: verticalScale(4),
  },
  saveButton: {
    backgroundColor: '#1A2B4B',
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: verticalScale(52),
  },
  saveButtonDisabled: {
    opacity: 0.8,
  },
  saveButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
  },
});

export default EditProfilePage; 