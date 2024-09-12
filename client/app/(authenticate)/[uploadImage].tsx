import React, { useState } from 'react';
import { Button, Image, View, Alert, TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios'; // If you need to upload the image to a server
import { ipURL } from '../utils/utils.js'
import { router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

const ProfilePictureUpload = () => {
  const { uploadImage } = useLocalSearchParams();
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission to access the gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 800 } }], // Resize the image
        { compress: 0.0, format: ImageManipulator.SaveFormat.WEBP } // Compress the image
      );
      setImage(manipResult.uri);
    }
  };

  const uploadImageToBe = async () => {
    if (!image) return;

    const uriParts = image.split('.');
    const fileType = uriParts[uriParts.length - 1];

    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    });
    formData.append('uploadKey','userProfileImageId' );
    formData.append('awsId',''); // assuming userId is a variable

    try {
      console.log(formData, 'form data');
      
      const response = await axios.post(`${ipURL}/api/s3/upload-to-aws/${uploadImage}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image uploaded successfully', response.data.data.Location);

      const updateUser = await axios.put(`${ipURL}/api/auth/update-profile/${uploadImage}`, {
        profileImage: response.data.data.Location,
      });

      Alert.alert('Image uploaded successfully. You can now verify your email and login');
      
      router.replace('/(authenticate)/login');
    } catch (error) {
      console.error('Image upload failed', error);
      Alert.alert('Image upload failed', error.message);
    }
  };

  console.log(uploadImage, 'uploadImage');
  

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.profilePictureContainer} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profilePicture} />
        ) : (
          <Text style={styles.addProfilePictureText}>Add Profile Picture</Text>
        )}
      </TouchableOpacity>
      {image && (
        <Button title="Upload Profile Picture" onPress={uploadImageToBe} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePictureContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addProfilePictureText: {
    fontSize: 16,
    color: '#555',
  },
});

export default ProfilePictureUpload;
