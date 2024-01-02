import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Tabs } from "expo-router";

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName;
          if (route.name === "home/index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "community/index") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "chat/index") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "profile/index") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={"black"} />;
        },
        tabBarLabelStyle: {
          color: "black",
        },
        tabBarStyle: {
          backgroundColor: "white",
        },
      })}
    >
      <Tabs.Screen
        name="home/index"
        options={{ headerShown: false, tabBarLabel: "Home" }}
      />
      <Tabs.Screen
        name="community/index"
        options={{ headerShown: false, tabBarLabel: "Community" }}
      />
      <Tabs.Screen
        name="chat/index"
        options={{ headerShown: false, tabBarLabel: "Chat" }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{ headerShown: false, tabBarLabel: "Profile" }}
      />
    </Tabs>
  );
};

export default TabsLayout;
