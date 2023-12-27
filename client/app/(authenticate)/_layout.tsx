import React from 'react';
import { Stack } from 'expo-router';

  



const AuthenticateLayout = () => {
    return (
        
        <Stack >
            <Stack.Screen name='login' options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
        </Stack>
        
    );
};

export default AuthenticateLayout;
