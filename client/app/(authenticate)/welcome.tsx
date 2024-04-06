import { View, Text, Pressable, Image } from 'react-native'
import React from 'react'
import { LinearGradient } from "expo-linear-gradient";
import {welcomeCOLOR} from '../../constants/theme';
import Button from '../components/Button';
import { router } from 'expo-router';
import { verticalScale,horizontalScale,moderateScale } from '../utils/metrics';

const Welcome = () => {

    return (
        <LinearGradient
            style={{
                flex: 1
            }}
            colors={[welcomeCOLOR.secondary, welcomeCOLOR.primary]}
        >
            <View style={{ flex: 1, marginTop: verticalScale(20) }}>
                <View>
                    <Image
                         source={require("../../assets/images/hero1.jpg")}
                        style={{
                            height: verticalScale(100),
                            width: horizontalScale(100),
                            borderRadius: moderateScale(20),
                            position: "absolute",
                            top: moderateScale(10),
                            transform: [
                                { translateX: 20 },
                                { translateY: 50 },
                                { rotate: "-15deg" }
                            ]
                        }}
                    />

                    <Image
                        source={require("../../assets/images/hero2.jpg")}
                        style={{
                            height: verticalScale(100),
                            width: horizontalScale(100),
                            borderRadius: moderateScale(20),
                            position: "absolute",
                            top: moderateScale(-30),
                            left: moderateScale(100),
                            transform: [
                                { translateX: 50 },
                                { translateY: 50 },
                                { rotate: "-5deg" }
                            ]
                        }}
                    />

                    <Image
                         source={require("../../assets/images/hero2.jpg")}
                         style={{
                            height: verticalScale(100),
                            width: horizontalScale(100),
                            borderRadius: moderateScale(20),
                            position: "absolute",
                            top: moderateScale(130),
                            left: moderateScale(-50),
                            transform: [
                                { translateX: 50 },
                                { translateY: 50 },
                                { rotate: "15deg" }
                            ]
                        }}
                    />

                    <Image
                        source={require("../../assets/images/hero1.jpg")}
                        style={{
                            height: verticalScale(200),
                            width: horizontalScale(200),
                            borderRadius: moderateScale(20),
                            position: "absolute",
                            top: moderateScale(110),
                            left: moderateScale(100),
                            transform: [
                                { translateX: 50 },
                                { translateY: 50 },
                                { rotate: "-15deg" }
                            ]
                        }}
                    />
                </View>

                {/* content  */}

                <View style={{
                    paddingHorizontal: horizontalScale(22),
                    position: "absolute",
                    top: moderateScale(400),
                    width: "100%"
                }}>
                    <Text style={{
                        fontSize: moderateScale(50),
                        fontWeight: "800",
                        color: welcomeCOLOR.white
                    }}>Let's Get</Text>
                    <Text style={{
                        fontSize: moderateScale(46),
                        fontWeight: "800",
                        color: welcomeCOLOR.white
                    }}>Started</Text>

                    <View style={{ marginVertical: verticalScale(22) }}>
                        <Text style={{
                            fontSize: moderateScale(16),
                            color: welcomeCOLOR.white,
                            marginVertical: verticalScale(4)
                        }}>Learn and teach what you love, anytime, anywhere. </Text>
                        <Text style={{
                            fontSize: moderateScale(16),
                            color: welcomeCOLOR.white,
                        }}>Join us!</Text>
                    </View>

                    <Button
                        title="Register"
                        onPress={() => router.replace('/(authenticate)/register')}
                        style={{
                            marginTop: verticalScale(22),
                            width: "100%"
                        }}
                    />

                    <View style={{
                        flexDirection: "row",
                        marginTop: verticalScale(12),
                        justifyContent: "center"
                    }}>
                        <Text style={{
                            fontSize: moderateScale(16),
                            color: welcomeCOLOR.white
                        }}>Already have an account?</Text>
                        <Pressable
                            onPress={() => router.replace('/(authenticate)/login')}
                        >
                            <Text style={{
                                fontSize: moderateScale(16),
                                color: welcomeCOLOR.white,
                                fontWeight: "bold",
                                marginLeft: horizontalScale(4)
                            }}>Login</Text>
                        </Pressable>

                    </View>
                </View>
            </View>
        </LinearGradient>
    )
}

export default Welcome