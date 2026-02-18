import React from 'react';
import { Stack } from 'expo-router';

  



const AuthenticateLayout = () => {
    return (
        
        <Stack >
            <Stack.Screen name='login' options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="reset-password" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="aws" options={{ headerShown: false }} />
            <Stack.Screen name="[uploadImage]" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
        
    );
};

export default AuthenticateLayout;
