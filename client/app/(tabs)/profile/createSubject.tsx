import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet, Alert } from 'react-native';
import { ipURL } from '../../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const CreateSubject = () => {
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectImage, setSubjectImage] = useState('');
  const [subjectPrice, setSubjectPrice] = useState('');
  const [subjectBoard, setSubjectBoard] = useState('');
  const [subjectGrade, setSubjectGrade] = useState('');
  const [teacherVerification, setTeacherVerification] = useState(['']);

  const addTeacherVerificationField = () => {
    setTeacherVerification([...teacherVerification, '']);
  };

  const handleTeacherVerificationChange = (index: number, value: string) => {
    const updatedTeacherVerification = [...teacherVerification];
    updatedTeacherVerification[index] = value;
    setTeacherVerification(updatedTeacherVerification);
  };

  const handleCreateSubject = async() => {
    const subject = {
      subjectName,
      subjectDescription,
      subjectImage,
      subjectPrice,
      subjectBoard,
      subjectGrade,
      teacherVerification,
    };
    const token = await AsyncStorage.getItem('authToken');
    try{

      axios.post(`http://${ipURL}/api/subjects/create`, subject, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      Alert.alert('Subject Created Successfully');
      router.replace('/(tabs)/profile');
    }
    catch(err){
      Alert.alert('Subject not created, Something Happened');
      console.log(err);
    }

  };
  console.log(subjectName, subjectDescription, subjectImage, subjectPrice, subjectBoard, subjectGrade, teacherVerification);
  
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Subject Name"
        value={subjectName}
        onChangeText={setSubjectName}
      />
      <TextInput
        style={styles.input}
        placeholder="Subject Description"
        value={subjectDescription}
        onChangeText={setSubjectDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Subject Image"
        value={subjectImage}
        onChangeText={setSubjectImage}
      />
      <TextInput
        style={styles.input}
        placeholder="Subject Price"
        keyboardType="numeric"
        value={subjectPrice.toString()}
        onChangeText={ setSubjectPrice}
      />
      <TextInput
        style={styles.input}
        placeholder="Subject Board"
        value={subjectBoard}
        onChangeText={setSubjectBoard}
      />
      <TextInput
        style={styles.input}
        placeholder="Subject Grade"
        value={subjectGrade}
        onChangeText={setSubjectGrade}
      />
      {teacherVerification.map((verification, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder="Teacher Verification"
          value={verification}
          onChangeText={(value) => handleTeacherVerificationChange(index, value)}
        />
      ))}
      <Button title="Add Teacher Verification" onPress={addTeacherVerificationField} />
 <Button title="Create Your Subject" onPress={handleCreateSubject} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
});

export default CreateSubject;
