import React from 'react';
import { Stack } from 'expo-router';

const OrganizationLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: true, headerTitle:'Organization Settings' }} />
      <Stack.Screen name="members" options={{ headerShown: true, headerTitle:'Organization Members' }} />
      <Stack.Screen name="invite" options={{ headerShown: true, headerTitle:'Invite Teacher' }} />
      <Stack.Screen name="join" options={{ headerShown: true, headerTitle:'Join Organization' }} />
      <Stack.Screen name="capacity" options={{ headerShown: true, headerTitle:'Purchase Capacity' }} />
    </Stack>
  );
};

export default OrganizationLayout;

