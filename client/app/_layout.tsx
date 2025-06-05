import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { StripeProviderWrapper } from './components/StripeProviderWrapper';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://851470963daf9849a9ae739b0172546e@o4508838422118400.ingest.de.sentry.io/4509444142989392',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
  attachScreenshot: true,


  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});
const MainLayout = () => {
  return (
    <StripeProviderWrapper>
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
    </StripeProviderWrapper>
  );
};

export default Sentry.wrap(MainLayout);