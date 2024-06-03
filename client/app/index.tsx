import { Redirect } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export default function Page() {
  const [token, setToken] = useState(null);  // Change initial state to null for better handling
  const [wait, setWait] = useState(true);
  const [fontsLoaded] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto/Roboto-Bold.ttf'),
    NotoSemiBold: require('../assets/fonts/NotoSans/NotoSans-SemiBold.ttf'),
    NotoRegular: require('../assets/fonts/NotoSans/NotoSans-Regular.ttf'),
    NotoMedium: require('../assets/fonts/NotoSans/NotoSans-Medium.ttf'),
    NotoBold: require('../assets/fonts/NotoSans/NotoSans-Bold.ttf'),
    NotoThinItalic: require('../assets/fonts/NotoSans/NotoSans-ThinItalic.ttf'),
    DMMedium: require('../assets/fonts/DMSans-Medium.ttf'),
    DMRegular: require('../assets/fonts/DMSans-Regular.ttf')
  });

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const user = await AsyncStorage.getItem('userDetails');
        console.log(token, 'this is token');
        console.log(JSON.parse(user), 'this is userDetails');
        setToken(token);
      } catch (err) {
        console.log(err);
      }
    };

    checkLogin();
  }, []);

  useEffect(() => {
    const hideSplashScreen = async () => {
      if (fontsLoaded) {
        // Wait for 10 seconds before hiding the splash screen
        setTimeout(async () => {
          await SplashScreen.hideAsync();
          setWait(false);  // Update state to reflect that the splash screen has been hidden
        }, 4000);
      }
    };
    hideSplashScreen();
  }, [fontsLoaded]);

  if (!fontsLoaded || wait) {
    return null;
  }

  return (
    <View>
      {!token ? <Redirect href={'/(authenticate)/welcome'} /> : <Redirect href={'/(tabs)/home'} />}
      {/* <Redirect href={'/(authenticate)/uploadImage'} /> */}
    </View>
  );
}
