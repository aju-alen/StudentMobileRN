import React from 'react';
import { Stack } from 'expo-router';

const OrganizationLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="members" options={{ headerShown: false }} />
      <Stack.Screen name="invite" options={{ headerShown: false }} />
      <Stack.Screen name="join" options={{ headerShown: false }} />
    </Stack>
  );
};

export default OrganizationLayout;

