import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, StyleSheet, KeyboardAvoidingView, TouchableOpacity, Text, Pressable, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Checkbox from 'expo-checkbox';
import axios from 'axios';
import { ipURL } from '../utils/utils';
import { COLORS, welcomeCOLOR } from '../../constants/theme';
import Button from '../components/Button';
import { verticalScale,horizontalScale,moderateScale } from '../utils/metrics';
const RegisterPage = () => {
    const [name, setName] = useState('');
    const [isPasswordShown, setIsPasswordShown] = useState(false);
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
        try {
            const resp = await axios.post(`${ipURL}/api/auth/register`, user)
            console.log(resp.data, 'Registered succesfully');
            Alert.alert('Registration Succesful, Verify email to login');
            router.replace('/(authenticate)/login');
        }
        catch (err) {
            console.log(err);
            Alert.alert('Something wrong has happened');
            return;
        }
    }

    return (
       
        <SafeAreaView style={{ flex: 1,  }}>
            <ScrollView  >

                <View style={{ flex: 1, marginHorizontal: horizontalScale(22) }}>
                    <KeyboardAvoidingView style={styles.container} behavior='height' >
                        <View style={{ marginVertical: verticalScale(22) }}>
                            <Text style={{
                                fontSize: moderateScale(22),
                                fontWeight: 'bold',
                                marginVertical: verticalScale(12),
                                color: welcomeCOLOR.black
                            }}>
                                Create Account
                            </Text>


                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Name</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="Enter Your Name"
                                    placeholderTextColor="gray"
                                    value={name}
                                    onChangeText={setName}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Email address</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="Enter Your Email"
                                    placeholderTextColor="gray"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType='email-address'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>



                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Password</Text>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder='Enter your password'
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholderTextColor="gray"
                                    secureTextEntry={isPasswordShown}
                                    style={{
                                        width: "100%"
                                    }}
                                />

                                <TouchableOpacity
                                    onPress={() => setIsPasswordShown(!isPasswordShown)}
                                    style={{
                                        position: "absolute",
                                        right: 12
                                    }}
                                >
                                    {
                                        isPasswordShown == true ? (
                                            <Ionicons name="eye-off" size={24} color={welcomeCOLOR.black} />
                                        ) : (
                                            <Ionicons name="eye" size={24} color={welcomeCOLOR.black} />
                                        )
                                    }

                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                    <KeyboardAvoidingView>
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <View style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}>
                                <Text style={{
                                    fontSize: moderateScale(16),
                                    fontWeight: "400",
                                    marginVertical: verticalScale(8)
                                }}>{`Profile Image `}</Text>
                                <Text style={{
                                    fontSize: moderateScale(8),
                                    fontWeight: "800",
                                }}>Select image feature in still in development </Text>
                            </View>

                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="Enter Your Profile Image URL"
                                    placeholderTextColor="gray"
                                    value={profileImage}
                                    onChangeText={setProfileImage}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{ marginBottom: verticalScale(12) }}>

                            <Text style={{
                                fontSize: 16,
                                fontWeight: "400",
                                marginVertical: 8
                            }}>User Description</Text>



                            <View style={{
                                width: "100%",
                                height: verticalScale(48),
                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                                alignItems: "center",
                                justifyContent: "center",
                                paddingLeft: horizontalScale(22)
                            }}>
                                <TextInput
                                    placeholder="Write a short description about yourself"
                                    placeholderTextColor="gray"
                                    value={userDescription}
                                    onChangeText={setUserDescription}
                                    keyboardType='default'
                                    style={{
                                        width: "100%"
                                    }}
                                />
                            </View>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginVertical: verticalScale(6)
                        }}>
                            <Checkbox
                                style={{ marginRight: 8 }}
                                value={isTeacher}
                                onValueChange={setIsTeacher}
                                color={isTeacher ? welcomeCOLOR.primary : undefined}
                            />

                            <Text>Are you a teacher?</Text>
                        </View>
                    </KeyboardAvoidingView>
                    <Button
                        title="Sign Up"
                        filled
                        color={COLORS.primary
                        }
                        style={{
                            marginTop: verticalScale(18),
                            marginBottom: verticalScale(4),
                        }}
                        onPress={handleRegister}
                    />



                    <View style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        marginVertical: verticalScale(22)
                    }}>
                        <Text style={{ fontSize: moderateScale(16), color: welcomeCOLOR.black }}>Already have an account?</Text>
                        <Pressable
                            onPress={() => router.replace('/(authenticate)/login')}
                        >
                            <Text style={{
                                fontSize: moderateScale(16),
                                color: COLORS.primary,
                                fontWeight: "bold",
                                marginLeft: horizontalScale(6)
                            }}>Login</Text>
                        </Pressable>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
};

export default RegisterPage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
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








