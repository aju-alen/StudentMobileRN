import React, { useEffect, useState } from 'react';
import { View, TextInput, SafeAreaView, StyleSheet, KeyboardAvoidingView, TouchableOpacity, Text, Button, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { Router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ipURL } from '../utils';


const LoginPage = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const checkLogin = async () => {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
                router.replace('/(tabs)/home');
            }
        }
        checkLogin();

    }, []);

    const handleLogin = async () => {
        const user = {
            email,
            password,
        }
        try {
            const resp = await axios.post(`${ipURL}/api/auth/login`, user)
            console.log(resp.data, 'Logged in succesfully');
            
            AsyncStorage.setItem('authToken', resp.data.token);
            router.replace('/(tabs)/home');

        }
        catch (err) {
            console.log(err);
            Alert.alert('Either email or password is incorrect or user is not verified by mail')
            return;
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.container} behavior="padding">

                <Text style={styles.header}>Login To Your Account</Text>
                <View style={styles.inputContainer}>
                    <Ionicons name="mail" size={24} color="gray" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={24} color="gray" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <View>
                    <Pressable onPress={()=>router.replace('/(authenticate)/register')} style={styles.link}>
                        <Text>Don't have an account? Register Here</Text>
                    </Pressable>
                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom:50,
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
    }
});

export default LoginPage;
