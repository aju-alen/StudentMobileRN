import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, StyleSheet, KeyboardAvoidingView, TouchableOpacity, Text,Pressable, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {  router } from 'expo-router';
import Checkbox from 'expo-checkbox';
import axios from 'axios';
import { z } from 'zod';
import { ipURL } from '../utils/utils';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [userDescription, setUserDescription] = useState('');
    const [isTeacher, setIsTeacher] = useState(false);

    const handleRegister = async () => {
        const user = {
            name,
            email,
            password,
            profileImage,
            userDescription,
            isTeacher,
        }
        try{
            const resp = await axios.post(`http://${ipURL}/api/auth/register`, user)
            console.log(resp.data, 'Registered succesfully');
            Alert.alert('Registration Succesful, Verify email to login');
            router.replace('/(authenticate)/login');
        }
        catch(err){
            console.log(err);
            Alert.alert('Something wrong has happened');
            return;
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.container} behavior="padding">
                <Text style={styles.header}>Create Your Account</Text>

                <View style={styles.inputContainer}>
                    <Ionicons name="person" size={24} color="gray" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Your Name"
                        placeholderTextColor="gray"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="mail" size={24} color="gray" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Your Email"
                        placeholderTextColor="gray"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={24} color="gray" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Your Password"
                        placeholderTextColor="gray"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="image" size={24} color="gray" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Your Profile Image url/ Temp till S3"
                        placeholderTextColor="gray"
                        value={profileImage}
                        onChangeText={setProfileImage}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="person-circle" size={24} color="gray" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Write Something About Yourself"
                        placeholderTextColor="gray"
                        value={userDescription}
                        onChangeText={setUserDescription}
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Ionicons name="school" size={24} color="gray" style={styles.icon} />
                    <Text>Are you a teacher?</Text>
                    <Checkbox style={styles.checkbox} value={isTeacher} onValueChange={()=>setIsTeacher(prev=>!prev)} />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                    <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>

                <View>
                    <Pressable onPress={() => router.replace('/(authenticate)/login')} style={styles.link}>
                        <Text>Already Have an account? Login Here</Text>
                    </Pressable>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 50,
        alignItems: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        width: 300,
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
    },
    button: {
        backgroundColor: '#1E90FF',
        padding: 10,
        borderRadius: 5,
        marginTop: 25,
        width: 150,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 22,
    },
    link: {
        marginTop: 10,
        color: 'gray',
        textAlign: 'center',
        fontSize: 14,
    },
    checkbox: {
        margin: 8,
      },
});



    




