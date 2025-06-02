import React, { useState } from 'react';
import { Image, View, Alert, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';
import { ipURL } from '../utils/utils.js';
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';

const ProfilePictureUpload = () => {
  const { uploadImage } = useLocalSearchParams();
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress] = useState(new Animated.Value(0));

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
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
      setImage(manipResult.uri);
    }
  };

  const uploadImageToBe = async () => {
    if (!image) return;
    setIsLoading(true);

    const uriParts = image.split('.');
    const fileType = uriParts[uriParts.length - 1];

    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });
    formData.append('uploadKey', 'userProfileImageId');
    formData.append('awsId', '');

    try {
      // Animate progress
      Animated.timing(uploadProgress, {
        toValue: 0.5,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      const response = await axios.post(`${ipURL}/api/s3/upload-to-aws/${uploadImage}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Animated.timing(uploadProgress, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: false,
      }).start();

      const updateUser = await axios.put(`${ipURL}/api/auth/update-profile/${uploadImage}`, {
        profileImage: response.data.data.Location,
      });

      Alert.alert(
        'Success!',
        'Your profile picture has been uploaded successfully.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(authenticate)/login'),
          },
        ]
      );
    } catch (error) {
      console.error('Image upload failed', error);
      Alert.alert('Upload Failed', 'Please try again or contact support if the problem persists.');
    } finally {
      setIsLoading(false);
      uploadProgress.setValue(0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Profile Picture</Text>
        <Text style={styles.subtitle}>Add a photo to personalize your account</Text>

        <TouchableOpacity 
          style={[styles.profilePictureContainer, image && styles.profilePictureContainerWithImage]} 
          onPress={pickImage}
          disabled={isLoading}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.profilePicture} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="camera" size={moderateScale(40)} color={COLORS.primary} />
              <Text style={styles.addProfilePictureText}>Add Photo</Text>
            </View>
          )}
          {!image && (
            <View style={styles.editIconContainer}>
              <Ionicons name="add-circle" size={moderateScale(24)} color={COLORS.primary} />
            </View>
          )}
        </TouchableOpacity>

        {image && (
          <TouchableOpacity 
            style={[styles.uploadButton, isLoading && styles.uploadButtonDisabled]} 
            onPress={uploadImageToBe}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.uploadButtonText}>Uploading...</Text>
              </View>
            ) : (
              <Text style={styles.uploadButtonText}>Upload Profile Picture</Text>
            )}
          </TouchableOpacity>
        )}

        {isLoading && (
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: uploadProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]} 
            />
          </View>
        )}
      </View>
    </View>
  );
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(20),
  },
  title: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: verticalScale(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(16),
    color: COLORS.primary,
    marginBottom: verticalScale(40),
    textAlign: 'center',
  },
  profilePictureContainer: {
    width: horizontalScale(180),
    height: verticalScale(180),
    borderRadius: moderateScale(90),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  profilePictureContainerWithImage: {
    borderWidth: 0,
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(90),
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addProfilePictureText: {
    fontSize: moderateScale(16),
    color: '#666',
    marginTop: verticalScale(8),
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(4),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(30),
    borderRadius: moderateScale(8),
    marginTop: verticalScale(20),
    minWidth: horizontalScale(200),
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    width: '100%',
    height: verticalScale(4),
    backgroundColor: '#e0e0e0',
    borderRadius: moderateScale(2),
    marginTop: verticalScale(20),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});

export default ProfilePictureUpload;
