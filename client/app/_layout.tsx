import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

const MainLayout = () => {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FFFFFF' },
          animation: 'slide_from_right',
          // Customize stack navigation presentation
          presentation: 'card',
          // Add animation speeds
          animationDuration: 200,
          // Add gesture handling
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          // Add card styling
          
          // Add safe area handling
        }}
      >
        <Stack.Screen 
          name='index' 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name='(tabs)' 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name='(authenticate)' 
          options={{ 
            headerShown: false,
          }} 
        />
      </Stack>
    </View>
  );
};

export default MainLayout;