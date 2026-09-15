import React, { useEffect, useState } from 'react';
import { Stack, useSegments, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPostAuthHref } from '../utils/teacherProfileLink';

const AUTH_ENTRY_SCREENS = new Set([
  'login',
  'register',
  'welcome',
  'forgot-password',
  'reset-password',
]);

const AuthenticateLayout = () => {
    const segments = useSegments() as string[];
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const redirectIfSignedIn = async () => {
            const token = await AsyncStorage.getItem('authToken');
            const leaf = segments[segments.length - 1];
            if (token && AUTH_ENTRY_SCREENS.has(leaf)) {
                router.replace(await getPostAuthHref());
                return;
            }
            setReady(true);
        };
        redirectIfSignedIn();
    }, [segments]);

    if (!ready) {
        return null;
    }

    return (
        
        <Stack >
            <Stack.Screen name='login' options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="reset-password" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="aws" options={{ headerShown: false }} />
            <Stack.Screen name="[uploadImage]" options={{ headerShown: false }} />
            <Stack.Screen name="tutors" options={{ headerShown: false }} />
            <Stack.Screen name="tutor/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
        
    );
};

export default AuthenticateLayout;
