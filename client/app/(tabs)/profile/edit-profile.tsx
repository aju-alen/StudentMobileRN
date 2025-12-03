import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
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

  useEffect(() => {
    fetchUserData();
  }, []);

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
      router.replace('/profile');

    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileImageContainer}>
        {selectedImageUri ? (
          <Image source={{ uri: selectedImageUri }} style={styles.profileImage} />
        ) : profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.label}>Add Photo</Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', marginTop: verticalScale(12) }}>
          <TouchableOpacity
            style={[styles.saveButton, { marginRight: horizontalScale(10) }]}
            onPress={pickImage}
          >
            <Text style={styles.saveButtonText}>Choose Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!selectedImageUri || isUploadingImage) && { opacity: 0.7 },
            ]}
            onPress={uploadProfileImage}
            disabled={!selectedImageUri || isUploadingImage}
          >
            {isUploadingImage ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>Uploading...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Update Photo</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={userData.name}
            onChangeText={(text) => setUserData(prev => ({ ...prev, name: text }))}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={userData.email}
            editable={false}
            placeholder="Your email"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={userData.userDescription}
            onChangeText={(text) => setUserData(prev => ({ ...prev, userDescription: text }))}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    paddingTop: verticalScale(60),
    paddingBottom: verticalScale(20),
    paddingHorizontal: horizontalScale(20),
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    marginRight: horizontalScale(15),
  },
  title: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: '#1A2B4B',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: verticalScale(20),
  },
  profileImage: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
  },
  profileImagePlaceholder: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(60),
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1A2B4B',
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(20),
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
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
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  textArea: {
    height: verticalScale(100),
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1A2B4B',
    padding: moderateScale(15),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    marginTop: verticalScale(20),
    marginBottom: verticalScale(40),
  },
  saveButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
  },
});

export default EditProfilePage; 