import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, StyleSheet, TouchableOpacity, Text, Pressable, Alert, ScrollView, Modal, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import axios from 'axios';
import { ipURL } from '../utils/utils';
import { COLORS } from '../../constants/theme';
import { verticalScale, horizontalScale, moderateScale } from '../utils/metrics';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSafeAreaInsets, { addBasePaddingToTopInset, addBasePaddingToInset } from '../hooks/useSafeAreaInsets';

const UserTypeScreen = ({ onSelect }) => {
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const toggleExpand = (cardType: string) => {
        setExpandedCard(expandedCard === cardType ? null : cardType);
    };

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
                        onPress={() => onSelect('student')}
                    >
                        <View style={styles.userTypeIconContainer}>
                            <Ionicons name="school-outline" size={32} color={COLORS.primary} />
                        </View>
                        <Text style={styles.userTypeTitle}>Student</Text>
                        <Text style={styles.userTypeDescription}>Join as a student to learn and grow with personalized guidance</Text>
                        <TouchableOpacity 
                            style={styles.knowMoreButton}
                            onPress={() => toggleExpand('student')}
                        >
                            <Text style={styles.knowMoreText}>Know More</Text>
                            <Ionicons 
                                name={expandedCard === 'student' ? 'chevron-up' : 'chevron-down'} 
                                size={20} 
                                color={COLORS.primary} 
                            />
                        </TouchableOpacity>
                        {expandedCard === 'student' && (
                            <View style={styles.expandedContent}>
                                <View style={styles.userTypeFeatures}>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Personalized Learning</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Interactive Lessons</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Track Progress</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.userTypeButton}
                        onPress={() => onSelect('teacher')}
                    >
                        <View style={styles.userTypeIconContainer}>
                            <Ionicons name="person-outline" size={40} color={COLORS.primary} />
                        </View>
                        <Text style={styles.userTypeTitle}>Teacher</Text>
                        <Text style={styles.userTypeDescription}>Join as a teacher to share your knowledge and help students</Text>
                        <TouchableOpacity 
                            style={styles.knowMoreButton}
                            onPress={() => toggleExpand('teacher')}
                        >
                            <Text style={styles.knowMoreText}>Know More</Text>
                            <Ionicons 
                                name={expandedCard === 'teacher' ? 'chevron-up' : 'chevron-down'} 
                                size={20} 
                                color={COLORS.primary} 
                            />
                        </TouchableOpacity>
                        {expandedCard === 'teacher' && (
                            <View style={styles.expandedContent}>
                                <View style={styles.userTypeFeatures}>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Create Courses</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Engage Students</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Monitor Progress</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.userTypeButton}
                        onPress={() => onSelect('organization')}
                    >
                        <View style={styles.userTypeIconContainer}>
                            <Ionicons name="business-outline" size={32} color={COLORS.primary} />
                        </View>
                        <Text style={styles.userTypeTitle}>Organization</Text>
                        <Text style={styles.userTypeDescription}>Register your organization to manage multiple teachers and students</Text>
                        <TouchableOpacity 
                            style={styles.knowMoreButton}
                            onPress={() => toggleExpand('organization')}
                        >
                            <Text style={styles.knowMoreText}>Know More</Text>
                            <Ionicons 
                                name={expandedCard === 'organization' ? 'chevron-up' : 'chevron-down'} 
                                size={20} 
                                color={COLORS.primary} 
                            />
                        </TouchableOpacity>
                        {expandedCard === 'organization' && (
                            <View style={styles.expandedContent}>
                                <View style={styles.userTypeFeatures}>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Manage Multiple Teachers</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                        <Text style={styles.featureText}>Centralized Administration</Text>
                                    </View>
                                    <View style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                                        <Text style={styles.featureText}>3 Users Free, Premium Available</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
        </SafeAreaView>
    );
};

const CustomDropdown = ({ label, value, options, onSelect, placeholder, isMultiSelect = false, selectedValues = [], hasError = false, errorMessage = '' }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (optionValue) => {
        if (isMultiSelect) {
            const newValue = Number(optionValue);
            if (selectedValues.includes(newValue)) {
                onSelect(selectedValues.filter(v => v !== newValue));
            } else {
                onSelect([...selectedValues, newValue]);
            }
        } else {
            // Pass the value as-is (preserve type: string for boards, number for grades)
            // The optionValue from options array is already the correct type
            onSelect(optionValue);
        }
        if (!isMultiSelect) {
            setIsOpen(false);
        }
    };

    const getDisplayValue = () => {
        if (isMultiSelect) {
            if (selectedValues.length === 0) return placeholder;
            return selectedValues.map(v => `Grade ${v}`).join(', ');
        }
        // Find the selected option and display its label
        if (!value && value !== 0) return placeholder;
        const selectedOption = options.find(opt => opt.value === value);
        return selectedOption ? selectedOption.label : placeholder;
    };

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity 
                style={[styles.dropdownButton, hasError && styles.dropdownButtonError]}
                onPress={() => setIsOpen(true)}
            >
                <Text style={[
                    styles.dropdownButtonText,
                    (!value && !selectedValues.length) && styles.placeholderText
                ]}>
                    {getDisplayValue()}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

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
                                        (isMultiSelect ? selectedValues.includes(option.value) : value === option.value) && styles.selectedOption
                                    ]}
                                    onPress={() => handleSelect(option.value)}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        (isMultiSelect ? selectedValues.includes(option.value) : value === option.value) && styles.selectedOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                    {(isMultiSelect ? selectedValues.includes(option.value) : value === option.value) && (
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
    const insets = useSafeAreaInsets();
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
    const [userType, setUserType] = useState<'student' | 'teacher' | 'organization' | null>(null);
    const [recommendedBoard, setRecommendedBoard] = useState('');
    const [recommendedGrade, setRecommendedGrade] = useState(0);
    const [selectedGrades, setSelectedGrades] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // Organization-specific fields
    const [organizationName, setOrganizationName] = useState('');
    const [organizationEmail, setOrganizationEmail] = useState('');
    const [organizationWebsite, setOrganizationWebsite] = useState('');
    const [tradeLicensePdf, setTradeLicensePdf] = useState<string | null>(null);
    const [tradeLicensePdfUri, setTradeLicensePdfUri] = useState<string | null>(null);
    const [isUploadingTradeLicense, setIsUploadingTradeLicense] = useState(false);
    const [teacherCount, setTeacherCount] = useState('3');



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

    const handleUserTypeSelect = (selectedType: 'student' | 'teacher' | 'organization') => {
        setUserType(selectedType);
        setShowUserType(false);
    };

    const handleGoBack = () => {
        setShowUserType(true);
    };

    const clearFieldError = (fieldName) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const newErrors: Record<string, string> = {};

        if (name.trim() === '') {
            newErrors.name = 'Name is required';
        }

        if (email.trim() === '') {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(email.trim())) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (password.trim() === '') {
            newErrors.password = 'Password is required';
        }

        if (confirmPassword.trim() === '') {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (userDescription.trim() === '') {
            newErrors.userDescription = 'About you is required';
        }

        if (reccomendedSubjects.length === 0) {
            newErrors.reccomendedSubjects = 'Please add at least one subject';
        }

        if (recommendedBoard === '') {
            newErrors.recommendedBoard = 'Please select a board';
        }

        if (userType === 'teacher' || userType === 'organization') {
            if (selectedGrades.length === 0) {
                newErrors.selectedGrades = 'Please select at least one grade';
            }
        } else if (userType === 'student') {
            if (recommendedGrade === 0) {
                newErrors.recommendedGrade = 'Please select your grade';
            }
        }

        // Organization-specific validation
        if (userType === 'organization') {
            if (organizationName.trim() === '') {
                newErrors.organizationName = 'Organization name is required';
            }
            if (organizationEmail.trim() === '') {
                newErrors.organizationEmail = 'Organization email is required';
            } else if (!emailRegex.test(organizationEmail.trim())) {
                newErrors.organizationEmail = 'Please enter a valid organization email address';
            }
            if (organizationWebsite.trim() === '') {
                newErrors.organizationWebsite = 'Website is required';
            }
            if (!tradeLicensePdfUri) {
                newErrors.tradeLicensePdf = 'Trade license PDF is required';
            }
            // Teacher count is fixed at 3 (free tier)
            if (teacherCount !== '3') {
                newErrors.teacherCount = 'Invalid teacher count';
            }
        }

        return newErrors;
    };

    const handleRegister = async () => {
        const validationErrors = validateForm();
        
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        // For organizations, validate PDF is selected (but not uploaded yet)
        if (userType === 'organization' && !tradeLicensePdfUri) {
            setErrors({ ...validationErrors, tradeLicensePdf: 'Trade license PDF is required' });
            return;
        }

        const user = {
            name,
            userType,
            email,
            password: password.trim(),
            profileImage,
            userDescription,
            isTeacher: userType === 'teacher' || userType === 'organization',
            isOrganization: userType === 'organization',
            confirmPassword,
            reccomendedSubjects,
            recommendedBoard,
            recommendedGrade,
            selectedGrades: (userType === 'teacher' || userType === 'organization') ? selectedGrades : [recommendedGrade],
            ...(userType === 'organization' && {
                organizationName,
                organizationEmail,
                organizationWebsite,
                // Don't send tradeLicensePdf here - we'll upload it after registration
                teacherCount: parseInt(teacherCount),
            }),
        }
        console.log(user,'user details');
        
        try {
            setIsLoading(true);
            const resp = await axios.post(`${ipURL}/api/auth/register`, user);
            const userId = resp.data.userId;
            
            // Upload PDF after registration with actual userId
            if (userType === 'organization' && tradeLicensePdfUri) {
                try {
                    const s3Location = await uploadTradeLicenseToAws(tradeLicensePdfUri, userId);
                    console.log('Trade license uploaded to:', s3Location);
                    
                    // Update the organization record with the trade license location
                    // Using userId from registration response (no auth token needed)
                    try {
                        await axios.put(
                            `${ipURL}/api/auth/organization/trade-license`,
                            { 
                                userId: userId,
                                tradeLicenseLocation: s3Location 
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                        );
                        console.log('Organization trade license updated successfully');
                    } catch (updateError) {
                        console.error('Failed to update organization trade license:', updateError);
                        // Non-critical error - registration succeeded, just log it
                        Alert.alert(
                            'Note', 
                            'Registration successful, but trade license update failed. You can update it later from your profile.'
                        );
                    }
                } catch (uploadError) {
                    console.error('PDF upload failed:', uploadError);
                    // Registration succeeded but PDF upload failed
                    Alert.alert(
                        'Registration Successful', 
                        'Your account has been created, but the trade license upload failed. Please upload it later from your profile settings.'
                    );
                    router.replace(`/(authenticate)/${userId}`);
                    setIsLoading(false);
                    return;
                }
            }
            
            Alert.alert('Success', 'Registration successful! Please verify email to login');
            router.replace(`/(authenticate)/${userId}`);
            setIsLoading(false);
        }
        catch (err) {
            setIsLoading(false);
            Alert.alert('Error', err.response?.data?.message || 'Registration failed');
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

    const pickTradeLicensePDF = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const pdfUri = result.assets[0].uri;
            setTradeLicensePdfUri(pdfUri);
            clearFieldError('tradeLicensePdf');
            // Don't upload here - will upload after registration with actual userId
        } catch (error) {
            console.error('Error picking PDF:', error);
            Alert.alert('Error', 'Failed to pick PDF file');
        }
    };

    const uploadTradeLicenseToAws = async (pdfUri: string, userId: string) => {
        if (!pdfUri) {
            throw new Error('PDF URI is required');
        }

        try {
            setIsUploadingTradeLicense(true);

            const uriParts = pdfUri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            
            // Verify file exists
            const fileInfo = await FileSystem.getInfoAsync(pdfUri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist');
            }

            const fileName = `trade-license-${Date.now()}.${fileType}`;

            const formData = new FormData();
            formData.append('tradeLicense', {
                uri: pdfUri,
                name: fileName,
                type: 'application/pdf',
            } as any);

            console.log('Uploading trade license to S3 with userId:', userId);

            const response = await axios.post(
                `${ipURL}/api/s3/upload-to-aws/organization-trade-license/${userId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Trade license uploaded successfully:', response.data);
            
            // Store the S3 location
            const s3Location = response.data.location || response.data.data?.Location;
            if (s3Location) {
                setTradeLicensePdf(s3Location);
                return s3Location;
            } else {
                throw new Error('No location returned from upload');
            }
        } catch (error) {
            console.error('Trade license upload failed:', error);
            throw error; // Re-throw to handle in handleRegister
        } finally {
            setIsUploadingTradeLicense(false);
        }
    };

    if (showUserType) {
        return <UserTypeScreen onSelect={handleUserTypeSelect} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.content, { paddingBottom: Platform.OS === 'android' ? addBasePaddingToInset(20, insets.bottom) : undefined }]}>
                    <TouchableOpacity 
                        style={[styles.backButton, { paddingTop: Platform.OS === 'android' ? addBasePaddingToTopInset(6, insets.top) : undefined }]}
                        onPress={handleGoBack}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                        <Text style={styles.backButtonText}>Change User Type</Text>
                    </TouchableOpacity>

                    <View style={[styles.headerSection, { paddingTop: Platform.OS === 'android' ? addBasePaddingToTopInset(20, insets.top) : undefined }]}>
                        <Text style={styles.title}>
                            Create {
                                userType === 'organization' ? 'Organization' : 
                                userType === 'teacher' ? 'Teacher' : 
                                'Student'
                            } Account
                        </Text>
                        <Text style={styles.subtitle}>Join our learning community</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            placeholder="Enter your name"
                            placeholderTextColor="#666"
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                clearFieldError('name');
                            }}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="Enter your email"
                            placeholderTextColor="#666"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                clearFieldError('email');
                            }}
                            keyboardType="email-address"
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.passwordContainer, errors.password && styles.passwordContainerError]}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Create password"
                                placeholderTextColor="#666"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    clearFieldError('password');
                                }}
                                secureTextEntry={!isPasswordShown}
                            />
                            <TouchableOpacity 
                                style={styles.eyeIcon}
                                onPress={() => setIsPasswordShown(!isPasswordShown)}
                            >
                                <Ionicons name={isPasswordShown ? "eye-off" : "eye"} size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={[styles.passwordContainer, errors.confirmPassword && styles.passwordContainerError]}>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Re-enter password"
                                placeholderTextColor="#666"
                                value={confirmPassword}
                                onChangeText={(text) => {
                                    setConfirmPassword(text);
                                    clearFieldError('confirmPassword');
                                }}
                                secureTextEntry={!isPasswordShown}
                            />
                        </View>
                        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>About You</Text>
                        <TextInput
                            style={[styles.input, styles.textArea, errors.userDescription && styles.inputError]}
                            placeholder="Write a short description about yourself"
                            placeholderTextColor="#666"
                            value={userDescription}
                            onChangeText={(text) => {
                                setUserDescription(text);
                                clearFieldError('userDescription');
                            }}
                            multiline
                            numberOfLines={3}
                        />
                        {errors.userDescription && <Text style={styles.errorText}>{errors.userDescription}</Text>}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Add Subjects (Max 3)</Text>
                        <View style={styles.subjectContainer}>
                            <View style={[styles.subjectInputWrapper, errors.reccomendedSubjects && styles.subjectInputWrapperError]}>
                                <TextInput
                                    style={styles.subjectInput}
                                    placeholder="Enter a subject"
                                    placeholderTextColor="#666"
                                    value={subjectInput}
                                    onChangeText={(text) => {
                                        setSubjectInput(text);
                                        if (reccomendedSubjects.length > 0) {
                                            clearFieldError('reccomendedSubjects');
                                        }
                                    }}
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
                                            if (newSubjects.length > 0) {
                                                clearFieldError('reccomendedSubjects');
                                            }
                                        }}
                                        style={styles.chipDeleteButton}
                                    >
                                        <Ionicons name="close-circle" size={16} color={COLORS.primary} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                        {errors.reccomendedSubjects && <Text style={styles.errorText}>{errors.reccomendedSubjects}</Text>}
                    </View>

                    <CustomDropdown
                        label="Board"
                        value={recommendedBoard}
                        options={boardOptions}
                        onSelect={(value) => {
                            setRecommendedBoard(value);
                            clearFieldError('recommendedBoard');
                        }}
                        placeholder="Select your board"
                        hasError={!!errors.recommendedBoard}
                        errorMessage={errors.recommendedBoard || ''}
                    />

                    {userType === 'organization' && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Organization Name</Text>
                                <TextInput
                                    style={[styles.input, errors.organizationName && styles.inputError]}
                                    placeholder="Enter organization name"
                                    placeholderTextColor="#666"
                                    value={organizationName}
                                    onChangeText={(text) => {
                                        setOrganizationName(text);
                                        clearFieldError('organizationName');
                                    }}
                                />
                                {errors.organizationName && <Text style={styles.errorText}>{errors.organizationName}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Organization Email</Text>
                                <TextInput
                                    style={[styles.input, errors.organizationEmail && styles.inputError]}
                                    placeholder="Enter organization email"
                                    placeholderTextColor="#666"
                                    autoCapitalize="none"
                                    value={organizationEmail}
                                    onChangeText={(text) => {
                                        setOrganizationEmail(text);
                                        clearFieldError('organizationEmail');
                                    }}
                                    keyboardType="email-address"
                                />
                                {errors.organizationEmail && <Text style={styles.errorText}>{errors.organizationEmail}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Website</Text>
                                <TextInput
                                    style={[styles.input, errors.organizationWebsite && styles.inputError]}
                                    placeholder="Enter website URL"
                                    placeholderTextColor="#666"
                                    autoCapitalize="none"
                                    value={organizationWebsite}
                                    onChangeText={(text) => {
                                        setOrganizationWebsite(text);
                                        clearFieldError('organizationWebsite');
                                    }}
                                    keyboardType="url"
                                />
                                {errors.organizationWebsite && <Text style={styles.errorText}>{errors.organizationWebsite}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Trade License PDF</Text>
                                <TouchableOpacity 
                                    style={[styles.pdfUploadButton, errors.tradeLicensePdf && styles.inputError]}
                                    onPress={pickTradeLicensePDF}
                                    disabled={isUploadingTradeLicense}
                                >
                                    {isUploadingTradeLicense ? (
                                        <>
                                            <ActivityIndicator size="small" color={COLORS.primary} />
                                            <Text style={styles.pdfUploadText}>Uploading...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="document-attach-outline" size={24} color={COLORS.primary} />
                                            <Text style={styles.pdfUploadText}>
                                                {tradeLicensePdfUri ? 'PDF Selected ✓' : 'Select Trade License PDF'}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                {errors.tradeLicensePdf && <Text style={styles.errorText}>{errors.tradeLicensePdf}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Number of Teachers</Text>
                                <TextInput
                                    style={[styles.input, errors.teacherCount && styles.inputError, styles.inputDisabled]}
                                    placeholder="Enter number of teachers"
                                    placeholderTextColor="#666"
                                    value={teacherCount}
                                    editable={false}
                                    keyboardType="numeric"
                                />
                                <Text style={styles.infoText}>
                                    3 users are free. You can purchase additional capacity later in Organization Settings.
                                </Text>
                                {errors.teacherCount && <Text style={styles.errorText}>{errors.teacherCount}</Text>}
                            </View>
                        </>
                    )}

                    <CustomDropdown
                        label="Grade"
                        value={recommendedGrade}
                        options={gradeOptions}
                        onSelect={(value) => {
                            if (userType === 'teacher' || userType === 'organization') {
                                setSelectedGrades(value);
                                setRecommendedGrade(value[0] || 0);
                                if (value.length > 0) {
                                    clearFieldError('selectedGrades');
                                }
                            } else {
                                setRecommendedGrade(value);
                                if (value !== 0) {
                                    clearFieldError('recommendedGrade');
                                }
                            }
                        }}
                        placeholder="Select your grade"
                        isMultiSelect={userType === 'teacher' || userType === 'organization'}
                        selectedValues={selectedGrades}
                        hasError={!!(errors.recommendedGrade || errors.selectedGrades)}
                        errorMessage={errors.recommendedGrade || errors.selectedGrades || ''}
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
        marginTop: verticalScale(20),
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
        gap: moderateScale(10),
        marginTop: verticalScale(16),
        paddingHorizontal: horizontalScale(10),
    },
    userTypeButton: {
        backgroundColor: '#fff',
        borderRadius: moderateScale(20),
        padding: moderateScale(12),
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        //shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    userTypeIconContainer: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(25),
        backgroundColor: COLORS.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: verticalScale(6),
    },
    userTypeTitle: {
        fontSize: moderateScale(18),
        fontWeight: '700',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: verticalScale(4),
    },
    userTypeDescription: {
        fontSize: moderateScale(13),
        color: '#666',
        textAlign: 'center',
        marginBottom: verticalScale(6),
        lineHeight: moderateScale(16),
    },
    knowMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(8),
        marginBottom: verticalScale(8),
    },
    knowMoreText: {
        fontSize: moderateScale(14),
        color: COLORS.primary,
        fontWeight: '600',
        marginRight: horizontalScale(4),
    },
    expandedContent: {
        marginTop: verticalScale(8),
        paddingTop: verticalScale(8),
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    userTypeFeatures: {
        marginTop: verticalScale(5),
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(8),
        paddingHorizontal: horizontalScale(5),
    },
    featureText: {
        fontSize: moderateScale(13),
        color: '#444',
        marginLeft: horizontalScale(8),
    },
    pdfUploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: moderateScale(8),
        padding: moderateScale(16),
        backgroundColor: '#fff',
        borderStyle: 'dashed',
    },
    pdfUploadText: {
        fontSize: moderateScale(16),
        color: COLORS.primary,
        marginLeft: horizontalScale(8),
        fontWeight: '500',
    },
    infoText: {
        fontSize: moderateScale(12),
        color: '#666',
        marginTop: verticalScale(4),
        fontStyle: 'italic',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: verticalScale(6),
        marginBottom: verticalScale(6),
    },
    backButtonText: {
        fontSize: moderateScale(14),
        color: COLORS.primary,
        marginLeft: horizontalScale(8),
        fontWeight: '500',
    },
    inputError: {
        borderColor: '#DC2626',
    },
    inputDisabled: {
        backgroundColor: '#F3F4F6',
        color: '#666',
    },
    passwordContainerError: {
        borderColor: '#DC2626',
    },
    subjectInputWrapperError: {
        borderColor: '#DC2626',
    },
    dropdownButtonError: {
        borderColor: '#DC2626',
    },
    errorText: {
        fontSize: moderateScale(12),
        color: '#DC2626',
        marginTop: verticalScale(4),
    },
});

export default RegisterPage;