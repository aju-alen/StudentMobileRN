import React, { useState } from 'react';
import { View, TextInput, SafeAreaView, StyleSheet, KeyboardAvoidingView, TouchableOpacity, Text, Pressable, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Checkbox from 'expo-checkbox';
import axios from 'axios';
import { ipURL } from '../utils/utils';
import { COLORS, welcomeCOLOR } from '../../constants/theme';
import {Picker} from '@react-native-picker/picker';
import Button from '../components/Button';
import { verticalScale,horizontalScale,moderateScale } from '../utils/metrics';
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

    console.log(password, 'password');
    

    const handleRegister = async () => {
        const user = {
            name,
            email,
            password:password.trim(),
            profileImage,
            userDescription,
            isTeacher,
            confirmPassword,
            reccomendedSubjects,
            recommendedBoard,
            recommendedGrade,
        }
        console.log(user, 'user');
        
        try {
            if (password !== confirmPassword) {
                Alert.alert('Passwords do not match');
                return;
            }
            const resp = await axios.post(`${ipURL}/api/auth/register`, user)
            console.log(resp.data, 'Registered succesfully');
            Alert.alert('Registration Succesful, Verify email to login');
            router.replace(`/(authenticate)/${resp.data.userId}`);
        }
        catch (err) {
            console.log(err);
            Alert.alert('Something wrong has happened');
            return;
        }
    }

    const handleReccomendedSubject = () => {
        if (reccomendedSubjects.length < 3 && subjectInput.trim()) {
          setReccomendedSubjects([...reccomendedSubjects, subjectInput.trim().toLowerCase()]);
          setSubjectInput('');
        } else if (reccomendedSubjects.length >= 3) {
          alert('You can only add up to 3 subjects');
        } else {
          alert('Please enter a valid subject');
        }
      };
    
      console.log(reccomendedSubjects,'reccomendedSubjects');
      
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
                        <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8)
                            }}>Re-enter Password</Text>

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
                                    placeholder='Re-enter your password'
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
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
                        <View style={{ marginBottom: verticalScale(12) }}>
      <Text style={{
        fontSize: 16,
        fontWeight: "400",
        marginVertical: 8
      }}>Choose three subjects</Text>

      <View style={{
        display: "flex",
        flexDirection: "row",
      }}>
        <View style={{
          width: "85%",
          height: verticalScale(48),
          borderColor: welcomeCOLOR.black,
          borderWidth: moderateScale(1),
          borderRadius: moderateScale(8),
          alignItems: "center",
          justifyContent: "center",
          paddingLeft: horizontalScale(22)
        }}>
          <TextInput
            placeholder="Give us your three reccomended subjects"
            placeholderTextColor="gray"
            value={subjectInput}
            onChangeText={setSubjectInput}
            keyboardType='default'
            style={{
              width: "100%",
            }}
          />
        </View>
        <Button
          title="+"
          filled
          color={COLORS.primary}
          style={{
            width: "15%",
            height: verticalScale(48),
            borderColor: welcomeCOLOR.black,
            borderWidth: moderateScale(1),
            borderRadius: moderateScale(8),
          }}
          onPress={handleReccomendedSubject}
        />
      </View>

      <View style={{ marginTop: verticalScale(12), flexDirection: 'row', flexWrap: 'wrap' }}>
        {reccomendedSubjects.map((subject, index) => (
          <View key={index} style={styles.chip}>
            <Text style={styles.chipText}>
              {subject}
            </Text>
          </View>
        ))}
      </View>
    </View>

    <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black,

                            }}>Select Your Board</Text>

                            <View style={[{

                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                            },]}>
                                <Picker
                                    mode='dropdown'
                                    dropdownIconColor={COLORS.white}
                                    style={{ backgroundColor: COLORS.background }}
                                    selectedValue={recommendedBoard}
                                    onValueChange={(itemValue, itemIndex) =>
                                        setRecommendedBoard(itemValue)
                                    }>
                                    
                                    <Picker.Item label="CBSE" value="CBSE" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="ICSE" value="ICSE" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="AP" value="AP" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="IGCSE-A Levels" value="IGCSE-A Levels" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="IB" value="IB" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                </Picker>
                            </View>


                        </View>
    <View style={{ marginBottom: verticalScale(12) }}>
                            <Text style={{
                                fontSize: moderateScale(16),
                                fontWeight: "400",
                                marginVertical: verticalScale(8),
                                color: welcomeCOLOR.black,

                            }}>Select Your Grade</Text>

                            <View style={[{

                                borderColor: welcomeCOLOR.black,
                                borderWidth: moderateScale(1),
                                borderRadius: moderateScale(8),
                            },]}>
                                <Picker
                                    mode='dropdown'
                                    dropdownIconColor={COLORS.white}
                                    style={{ backgroundColor: COLORS.background }}
                                    selectedValue={recommendedGrade}
                                    onValueChange={(itemValue, itemIndex) =>
                                        setRecommendedGrade(Number(itemValue))
                                    }>
                                    
                                    <Picker.Item label="1" value='1' style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="2" value='2' style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="2" value="3" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="4" value="4" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="5" value="5" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="6" value="6" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="7" value="7" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="8" value="8" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="9" value="9" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="10" value="10" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="11" value="11" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="12" value="12" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                    <Picker.Item label="13" value="13" style={{ color: COLORS.white, backgroundColor: COLORS.background }} />
                                </Picker>
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
    chip: {
        backgroundColor: COLORS.primary,
        borderRadius: moderateScale(20),
        paddingVertical: verticalScale(6),
        paddingHorizontal: horizontalScale(12),
        marginRight: horizontalScale(8),
        marginBottom: verticalScale(8),
      },
      chipText: {
        color: 'white',
        fontSize: moderateScale(14),
      },
});








