import React from 'react';
import { Stack } from 'expo-router';

const OrganizationLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="members" options={{ headerShown: false }} />
      <Stack.Screen name="invite" options={{ headerShown: true, headerTitle:'Invite Teacher' }} />
      <Stack.Screen name="create-organization" options={{ headerShown: false }} />
      <Stack.Screen name="join" options={{ headerShown: true, headerTitle:'Join Organization' }} />
      <Stack.Screen name="capacity" options={{ headerShown: true, headerTitle:'Purchase Capacity' }} />
    </Stack>
  );
};

export default OrganizationLayout;

