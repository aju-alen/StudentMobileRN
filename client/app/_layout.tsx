import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import * as Notifications from 'expo-notifications';
import  StripeProviderWrapper  from './components/StripeProviderWrapper';
import * as Sentry from '@sentry/react-native';
import  RevenueCatProvider  from './providers/RevenueCatProvider';
import AppUpdatePrompt from './components/AppUpdatePrompt';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

Sentry.init({
  dsn: 'https://851470963daf9849a9ae739b0172546e@o4508838422118400.ingest.de.sentry.io/4509444142989392',

  sendDefaultPii: false,
  attachScreenshot: false,

  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  integrations: [Sentry.feedbackIntegration()],
});
const MainLayout = () => {
  return (
    <StripeProviderWrapper>
    <RevenueCatProvider>
    <View style={{ flex: 1 }}>
      <AppUpdatePrompt />
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
        <Stack.Screen
          name='teacher/[teacherId]'
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </View>
    </RevenueCatProvider>
    </StripeProviderWrapper>

  );
};

export default Sentry.wrap(MainLayout);