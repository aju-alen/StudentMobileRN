import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, StyleSheet, KeyboardAvoidingView, TouchableOpacity, Text, Pressable, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Checkbox from 'expo-checkbox';
import axios from 'axios';
import { ipURL } from '../utils/utils';
import { COLORS, welcomeCOLOR } from '../../constants/theme';
import { Picker } from '@react-native-picker/picker';
import Button from '../components/Button';
import { verticalScale, horizontalScale, moderateScale } from '../utils/metrics';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [isPasswordShown, setIsPasswordShown] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [userDescription, setUserDescription] = useState('');
    const [reccomendedSubjects, setReccomendedSubjects] = useState([]);
    const [subjectInput, setSubjectInput] = useState('');
    const [isTeacher, setIsTeacher] = useState(false);
    const [recommendedBoard, setRecommendedBoard] = useState('');
    const [recommendedGrade, setRecommendedGrade] = useState(0);

    const handleRegister = async () => {
        const user = {
            name,
            email,
            password: password.trim(),
            profileImage,
            userDescription,
            isTeacher,
            confirmPassword,
            reccomendedSubjects,
            recommendedBoard,
            recommendedGrade,
        }
        
        try {
            if (password !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }
            const resp = await axios.post(`${ipURL}/api/auth/register`, user)
            Alert.alert('Success', 'Registration successful! Please verify email to login');
            router.replace(`/(authenticate)/${resp.data.userId}`);
        }
        catch (err) {
            Alert.alert('Error', err.response.data.message);
        }
    }

    const handleReccomendedSubject = () => {
        if (reccomendedSubjects.length < 3 && subjectInput.trim()) {
            setReccomendedSubjects([...reccomendedSubjects, subjectInput.trim().toLowerCase()]);
            setSubjectInput('');
        } else if (reccomendedSubjects.length >= 3) {
            Alert.alert('Limit Reached', 'You can only add up to 3 subjects');
        } else {
            Alert.alert('Invalid Input', 'Please enter a valid subject');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join our learning community</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            placeholderTextColor="#666"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#666"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Create password"
                                placeholderTextColor="#666"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!isPasswordShown}
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon}
                                onPress={() => setIsPasswordShown(!isPasswordShown)}
                            >
                                <Ionicons name={isPasswordShown ? "eye-off" : "eye"} size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Re-enter password"
                                placeholderTextColor="#666"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!isPasswordShown}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>About You</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Write a short description about yourself"
                            placeholderTextColor="#666"
                            value={userDescription}
                            onChangeText={setUserDescription}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Add Subjects (Max 3)</Text>
                        <View style={styles.subjectContainer}>
                            <TextInput
                                style={styles.subjectInput}
                                placeholder="Enter a subject"
                                placeholderTextColor="#666"
                                value={subjectInput}
                                onChangeText={setSubjectInput}
                            />
                            <TouchableOpacity 
                                style={styles.addButton}
                                onPress={handleReccomendedSubject}
                            >
                                <Text style={styles.addButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.chipContainer}>
                            {reccomendedSubjects.map((subject, index) => (
                                <View key={index} style={styles.chip}>
                                    <Text style={styles.chipText}>{subject}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Board</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={recommendedBoard}
                                style={styles.picker}
                                onValueChange={setRecommendedBoard}
                            >
                                <Picker.Item label="Select your board" value="" />
                                <Picker.Item label="CBSE" value="CBSE" />
                                <Picker.Item label="ICSE" value="ICSE" />
                                <Picker.Item label="AP" value="AP" />
                                <Picker.Item label="IGCSE-A Levels" value="IGCSE-A Levels" />
                                <Picker.Item label="IB" value="IB" />
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Grade</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={recommendedGrade}
                                style={styles.picker}
                                onValueChange={(value) => setRecommendedGrade(Number(value))}
                            >
                                <Picker.Item label="Select your grade" value="0" />
                                {[...Array(13)].map((_, i) => (
                                    <Picker.Item key={i + 1} label={`Grade ${i + 1}`} value={i + 1} />
                                ))}
                            </Picker>
                        </View>
                    </View>

                    <View style={styles.checkboxContainer}>
                        <Checkbox
                            style={styles.checkbox}
                            value={isTeacher}
                            onValueChange={setIsTeacher}
                            color={isTeacher ? COLORS.primary : undefined}
                        />
                        <Text style={styles.checkboxLabel}>I am a teacher</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                    >
                        <Text style={styles.registerButtonText}>Create Account</Text>
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <Pressable onPress={() => router.replace('/(authenticate)/login')}>
                            <Text style={styles.loginLink}>Login</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: moderateScale(20),
    },
    headerSection: {
        marginBottom: verticalScale(30),
    },
    title: {
        fontSize: moderateScale(28),
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: verticalScale(8),
    },
    subtitle: {
        fontSize: moderateScale(16),
        color: '#666',
    },
    inputGroup: {
        marginBottom: verticalScale(20),
    },
    label: {
        fontSize: moderateScale(14),
        color: '#333',
        marginBottom: verticalScale(8),
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: moderateScale(8),
        padding: moderateScale(12),
        fontSize: moderateScale(16),
        backgroundColor: '#fff',
        color: '#333',
    },
    textArea: {
        height: verticalScale(80),
        textAlignVertical: 'top',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: moderateScale(8),
        backgroundColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        padding: moderateScale(12),
        fontSize: moderateScale(16),
        color: '#333',
    },
    eyeIcon: {
        padding: moderateScale(10),
    },
    subjectContainer: {
        flexDirection: 'row',
        gap: horizontalScale(10),
    },
    subjectInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: moderateScale(8),
        padding: moderateScale(12),
        fontSize: moderateScale(16),
    },
    addButton: {
        backgroundColor: COLORS.primary,
        width: verticalScale(45),
        borderRadius: moderateScale(8),
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: moderateScale(24),
        fontWeight: 'bold',
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: verticalScale(10),
        gap: moderateScale(8),
    },
    chip: {
        backgroundColor: COLORS.primary + '20',
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(16),
    },
    chipText: {
        color: COLORS.primary,
        fontSize: moderateScale(14),
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: moderateScale(8),
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        height: verticalScale(50),
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: verticalScale(20),
    },
    checkbox: {
        marginRight: horizontalScale(10),
    },
    checkboxLabel: {
        fontSize: moderateScale(16),
        color: '#333',
    },
    registerButton: {
        backgroundColor: COLORS.primary,
        padding: moderateScale(16),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        marginTop: verticalScale(10),
    },
    registerButtonText: {
        color: '#fff',
        fontSize: moderateScale(18),
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(20),
    },
    loginText: {
        fontSize: moderateScale(16),
        color: '#666',
    },
    loginLink: {
        fontSize: moderateScale(16),
        color: COLORS.primary,
        fontWeight: '600',
    },
});

export default RegisterPage;