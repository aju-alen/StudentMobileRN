import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { Tabs, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from 'react-native';
import { COLORS } from "../../constants";

interface UserDetails {
  isTeacher?: boolean;
  isAdmin?: boolean;
}

const TabsLayout = () => {
  const segments = useSegments() as string[];
  const [userDetails, setUserDetails] = useState<UserDetails>({});
  
  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const user = await AsyncStorage.getItem("userDetails");
        if (user) {
          setUserDetails(JSON.parse(user));
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    getUserDetails();
  }, []);

  const getTabIcon = (routeName: string, focused: boolean) => {
    const icons = {
      home: focused ? "home" : "home-outline",
      community: focused ? "people" : "people-outline",
      chat: focused ? "chatbubbles" : "chatbubbles-outline",
      profile: focused ? "person" : "person-outline",
      verification: focused ? "file-tray-full" : "file-tray-full-outline"
    };
    return icons[routeName] || "help-outline";
  };

  // Check if we're in a chat detail route
  const isChatDetailRoute = segments.includes('chat') && segments.length > 2;

  const isCommunityDetailRoute = segments.includes('community') && segments.length > 2;

  const defaultTabBarStyle = {
    height: Platform.OS === 'ios' ? 88 : 60,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: Platform.OS === 'ios' ? 8 : 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    //shadowOpacity: 0.1,
    shadowRadius: 3,
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          const iconName = getTabIcon(route.name, focused);
          return (
            <Ionicons 
              name={iconName} 
              size={25} 
              color={focused ? COLORS.primary || '#000' : '#666'}
            />
          );
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
          color: COLORS.primary || '#000',
        },
        tabBarStyle: isChatDetailRoute || isCommunityDetailRoute ? { display: 'none' } : defaultTabBarStyle,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarActiveTintColor: COLORS.primary || '#000',
        tabBarInactiveTintColor: '#666',
      })}
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
          tabBarLabel: "Verification",
          href: userDetails.isAdmin ? "/verification" : null,
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;