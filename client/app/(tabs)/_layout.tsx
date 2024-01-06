import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// interface UserDetails {
//   isTeacher?: boolean;
//   isAdmin?: boolean;
// }
const TabsLayout = () => {
  // const [userDetails, setUserDetails] = useState<UserDetails>({});
  
  // useEffect(() => {
  //  const getUserDetails = async () => {
  //     const user = await AsyncStorage.getItem("userDetails");
  //     setUserDetails(JSON.parse(user));
  //  }
  //  getUserDetails();
    
  // }, []);
  
  // console.log(userDetails.isAdmin,'zzzzz');
  
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName;
          if (route.name === "home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "community") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "chat") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "profile") {
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
        name="home"
        options={{ headerShown: false, tabBarLabel: "Home" }}
      />
      <Tabs.Screen
        name="community"
        options={{ headerShown: false, tabBarLabel: "Community" }}
      />
      <Tabs.Screen
        name="chat"
        options={{ headerShown: false, tabBarLabel: "Chat" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ headerShown: false, tabBarLabel: "Profile" }}
      />
      {/* {userDetails.isAdmin &&<Tabs.Screen
        name="verification"
        options={{ headerShown: false, tabBarLabel: "Verification" }}
      />} */}
      
      
    </Tabs>
  );
};

export default TabsLayout;
