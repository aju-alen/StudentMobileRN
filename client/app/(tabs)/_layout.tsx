import React, { useEffect, useState } from "react";
import { Tabs, useSegments, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CoachTabBar from "../components/CoachTabBar";
import { connectSocket } from "../utils/socket";
import { axiosWithAuth } from "../utils/customAxios";
import { ipURL } from "../utils/utils";
import { registerForPushNotificationsAsync, isPushSupported } from "../utils/pushNotifications";

interface UserDetails {
  isTeacher?: boolean;
  isAdmin?: boolean;
  isParent?: boolean;
  userType?: string;
}

const TabsLayout = () => {
  const segments = useSegments() as string[];
  const [userDetails, setUserDetails] = useState<UserDetails>({});
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          setHasSession(false);
          router.replace('/(authenticate)/welcome');
          return;
        }
        setHasSession(true);
        const user = await AsyncStorage.getItem("userDetails");
        if (user) {
          setUserDetails(JSON.parse(user));
        }
        await connectSocket();
      } catch (error) {
        console.error("Error fetching user details:", error);
        setHasSession(false);
        router.replace('/(authenticate)/welcome');
      }
    };
    getUserDetails();
  }, []);

  useEffect(() => {
    const roleKnown = Boolean(
      userDetails.userType || userDetails.isTeacher || userDetails.isAdmin || userDetails.isParent
    );
    if (hasSession !== true || !roleKnown) return;
    const isParentUser = userDetails.userType === 'PARENT' || userDetails.isParent;
    if (isParentUser || !isPushSupported()) return;

    const register = async () => {
      const token = await registerForPushNotificationsAsync();
      if (!token) return;
      try {
        await axiosWithAuth.put(`${ipURL}/api/auth/push-token`, { pushToken: token });
      } catch (error) {
        console.error('Failed to register push token', error);
      }
    };
    register();
  }, [hasSession, userDetails.userType, userDetails.isTeacher, userDetails.isAdmin, userDetails.isParent]);

  const isChatDetailRoute = segments.includes('chat') && segments.length > 2;
  const isCommunityDetailRoute = segments.includes('community') && segments.length > 2;
  const hideTabBar = isChatDetailRoute || isCommunityDetailRoute;

  const isAdmin = userDetails.userType === 'ADMIN';
  const isParent = userDetails.userType === 'PARENT' || userDetails.isParent;

  if (hasSession !== true) {
    return null;
  }

  return (
    <Tabs
      tabBar={(props) => (hideTabBar ? null : <CoachTabBar {...props} isAdmin={isAdmin} isParent={isParent} />)}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: "Home",
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          headerShown: false,
          tabBarLabel: "Community",
          ...(isParent ? { href: null } : {}),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          headerShown: false,
          tabBarLabel: "Chat",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarLabel: "Profile",
        }}
      />
      <Tabs.Screen
        name="verification"
        options={{
          headerShown: false,
          tabBarLabel: "Admin",
          href: isAdmin ? "/verification" : null,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;