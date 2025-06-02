import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, StyleSheet, TouchableOpacity, Text, Pressable, Alert, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import { ipURL } from '../utils/utils';
import { COLORS } from '../../constants/theme';
import { verticalScale, horizontalScale, moderateScale } from '../utils/metrics';

const UserTypeScreen = ({ onSelect }) => {
    return (
        <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                <View style={styles.headerSection}>
                    <Text style={styles.title}>Register to</Text>
                    <Text style={styles.titleBold}>Coach Academ</Text>
                    <Text style={styles.subtitle}>Choose how you want to join our learning community</Text>
                </View>

                <View style={styles.userTypeContainer}>
                    <TouchableOpacity 
                        style={styles.userTypeButton}
                        onPress={() => onSelect(false)}
                    >
                        <View style={styles.userTypeIconContainer}>
                            <Ionicons name="school-outline" size={50} color={COLORS.primary} />
                        </View>
                        <Text style={styles.userTypeTitle}>Student</Text>
                        <Text style={styles.userTypeDescription}>Join as a student to learn and grow with personalized guidance and interactive lessons</Text>
                        <View style={styles.userTypeFeatures}>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                <Text style={styles.featureText}>Personalized Learning</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                <Text style={styles.featureText}>Interactive Lessons</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                <Text style={styles.featureText}>Track Progress</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.userTypeButton}
                        onPress={() => onSelect(true)}
                    >
                        <View style={styles.userTypeIconContainer}>
                            <Ionicons name="person-outline" size={50} color={COLORS.primary} />
                        </View>
                        <Text style={styles.userTypeTitle}>Teacher</Text>
                        <Text style={styles.userTypeDescription}>Join as a teacher to share your knowledge and help students achieve their goals</Text>
                        <View style={styles.userTypeFeatures}>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                <Text style={styles.featureText}>Create Courses</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                <Text style={styles.featureText}>Engage Students</Text>
                            </View>
                            <View style={styles.featureItem}>
                                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                                <Text style={styles.featureText}>Monitor Progress</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
        </SafeAreaView>
    );
};

const CustomDropdown = ({ label, value, options, onSelect, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setIsOpen(true)}
            >
                <Text style={[
                    styles.dropdownButtonText,
                    !value && styles.placeholderText
                ]}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label}</Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.optionsList}>
                            {options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.optionItem,
                                        value === option.value && styles.selectedOption
                                    ]}
                                    onPress={() => {
                                        onSelect(option.value);
                                        setIsOpen(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        value === option.value && styles.selectedOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {value === option.value && (
                                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const RegisterPage = () => {
    const [showUserType, setShowUserType] = useState(true);
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
    const [isLoading, setIsLoading] = useState(false);



    const boardOptions = [
        { label: 'Select your board', value: '' },
        { label: 'CBSE', value: 'CBSE' },
        { label: 'ICSE', value: 'ICSE' },
        { label: 'AP', value: 'AP' },
        { label: 'IGCSE-A Levels', value: 'IGCSE-A Levels' },
        { label: 'IB', value: 'IB' },
    ];

    const gradeOptions = [
        { label: 'Select your grade', value: 0 },
        ...Array.from({ length: 13 }, (_, i) => ({
            label: `Grade ${i + 1}`,
            value: i + 1
        }))
    ];

    const handleUserTypeSelect = (isTeacherSelected) => {
        setIsTeacher(isTeacherSelected);
        setShowUserType(false);
    };

    const handleGoBack = () => {
        setShowUserType(true);
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (name.trim() === '' || email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '' || userDescription.trim() === '' || reccomendedSubjects.length === 0 || recommendedBoard === '' || recommendedGrade === 0) {
            Alert.alert('Error', 'Please fill all the fields');
            return;
        }
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
        console.log(user,'user details');
        
        try {
            setIsLoading(true);
            if (password !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }
            const resp = await axios.post(`${ipURL}/api/auth/register`, user)
            Alert.alert('Success', 'Registration successful! Please verify email to login');
            router.replace(`/(authenticate)/${resp.data.userId}`);
            setIsLoading(false);
        }
        catch (err) {
            setIsLoading(false);
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

    if (showUserType) {
        return <UserTypeScreen onSelect={handleUserTypeSelect} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={handleGoBack}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                        <Text style={styles.backButtonText}>Change User Type</Text>
                    </TouchableOpacity>

                    <View style={styles.headerSection}>
                        <Text style={styles.title}>Create {isTeacher ? 'Teacher' : 'Student'} Account</Text>
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
                            <View style={styles.subjectInputWrapper}>
                                <TextInput
                                    style={styles.subjectInput}
                                    placeholder="Enter a subject"
                                    placeholderTextColor="#666"
                                    value={subjectInput}
                                    onChangeText={setSubjectInput}
                                />
                              {reccomendedSubjects.length < 3 && <TouchableOpacity 
                                    style={styles.addButton}
                                    onPress={handleReccomendedSubject}
                                >
                                    <Ionicons name="add-circle" size={24} color={COLORS.primary} />
                                </TouchableOpacity>}
                            </View>
                        </View>
                        <View style={styles.chipContainer}>
                            {reccomendedSubjects.map((subject, index) => (
                                <View key={index} style={styles.chip}>
                                    <Text style={styles.chipText}>{subject.toUpperCase()}</Text>
                                    <TouchableOpacity 
                                        onPress={() => {
                                            const newSubjects = [...reccomendedSubjects];
                                            newSubjects.splice(index, 1);
                                            setReccomendedSubjects(newSubjects);
                                        }}
                                        style={styles.chipDeleteButton}
                                    >
                                        <Ionicons name="close-circle" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    <CustomDropdown
                        label="Board"
                        value={recommendedBoard}
                        options={boardOptions}
                        onSelect={setRecommendedBoard}
                        placeholder="Select your board"
                    />

                    <CustomDropdown
                        label="Grade"
                        value={recommendedGrade}
                        options={gradeOptions}
                        onSelect={(value) => setRecommendedGrade(Number(value))}
                        placeholder="Select your grade"
                    />

                    {/* <View style={styles.checkboxContainer}>
                        <Checkbox
                            style={styles.checkbox}
                            value={isTeacher}
                            onValueChange={setIsTeacher}
                            color={isTeacher ? COLORS.primary : undefined}
                        />
                        <Text style={styles.checkboxLabel}>I am a teacher</Text>
                    </View> */}

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                    >
                        {isLoading ? <ActivityIndicator size="small" color={COLORS.white} /> : <Text style={styles.registerButtonText}>Create Account</Text>}
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
    titleBold: {
        fontSize: moderateScale(35),
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: verticalScale(8),
        textAlign: 'center',
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
        marginBottom: verticalScale(10),
    },
    subjectInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: moderateScale(8),
        backgroundColor: '#fff',
        paddingRight: horizontalScale(8),
    },
    subjectInput: {
        flex: 1,
        padding: moderateScale(12),
        fontSize: moderateScale(16),
        color: '#333',
    },
    addButton: {
        padding: moderateScale(8),
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: verticalScale(10),
        gap: moderateScale(8),
    },
    chip: {
        backgroundColor: COLORS.primary + '15',
        paddingHorizontal: horizontalScale(12),
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(20),
        flexDirection: 'row',
        alignItems: 'center',
        gap: horizontalScale(4),
        borderWidth: 1,
        borderColor: COLORS.primary + '30',
    },
    chipText: {
        color: COLORS.primary,
        fontSize: moderateScale(14),
        fontWeight: '500',
    },
    chipDeleteButton: {
        padding: moderateScale(2),
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: moderateScale(8),
        paddingHorizontal: horizontalScale(16),
        paddingVertical: verticalScale(12),
        backgroundColor: '#FFF',
    },
    dropdownButtonText: {
        fontSize: moderateScale(16),
        color: '#333',
        fontFamily: 'System',
    },
    placeholderText: {
        color: '#666',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: moderateScale(16),
        width: '90%',
        maxHeight: '80%',
        padding: moderateScale(16),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(16),
        paddingBottom: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    modalTitle: {
        fontSize: moderateScale(18),
        fontWeight: '600',
        color: '#333',
    },
    optionsList: {
        maxHeight: verticalScale(300),
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: verticalScale(12),
        paddingHorizontal: horizontalScale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    selectedOption: {
        backgroundColor: '#F0F7FF',
    },
    optionText: {
        fontSize: moderateScale(16),
        color: '#333',
    },
    selectedOptionText: {
        color: COLORS.primary,
        fontWeight: '500',
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
    userTypeContainer: {
        flexDirection: 'column',
        gap: moderateScale(20),
        marginTop: verticalScale(20),
        paddingHorizontal: horizontalScale(10),
    },
    userTypeButton: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: moderateScale(24),
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    userTypeIconContainer: {
        width: moderateScale(80),
        height: moderateScale(80),
        borderRadius: moderateScale(40),
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: verticalScale(16),
    },
    userTypeTitle: {
        fontSize: moderateScale(24),
        fontWeight: '700',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: verticalScale(12),
    },
    userTypeDescription: {
        fontSize: moderateScale(16),
        color: '#666',
        textAlign: 'center',
        marginBottom: verticalScale(20),
        lineHeight: moderateScale(22),
    },
    userTypeFeatures: {
        marginTop: verticalScale(10),
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(12),
        paddingHorizontal: horizontalScale(10),
    },
    featureText: {
        fontSize: moderateScale(15),
        color: '#444',
        marginLeft: horizontalScale(10),
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(10),
        marginBottom: verticalScale(10),
    },
    backButtonText: {
        fontSize: moderateScale(16),
        color: COLORS.primary,
        marginLeft: horizontalScale(8),
        fontWeight: '500',
    },
});

export default RegisterPage;