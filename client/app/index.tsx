import { Redirect } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getPostAuthHref,
  getTeacherProfileAppPath,
  parseTeacherIdFromUrl,
  setPendingTeacherProfileId,
} from "./utils/teacherProfileLink";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Page() {
  const [initialHref, setInitialHref] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    NotoSemiBold: require('../assets/fonts/NotoSans/NotoSans-SemiBold.ttf'),
    NotoRegular: require('../assets/fonts/NotoSans/NotoSans-Regular.ttf'),
    NotoMedium: require('../assets/fonts/NotoSans/NotoSans-Medium.ttf'),
    NotoBold: require('../assets/fonts/NotoSans/NotoSans-Bold.ttf'),
    NotoThinItalic: require('../assets/fonts/NotoSans/NotoSans-ThinItalic.ttf'),
  });

  // Handle authentication check
  useEffect(() => {
    async function checkLogin() {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const initialUrl = await Linking.getInitialURL();
        const teacherIdFromLink = parseTeacherIdFromUrl(initialUrl);

        if (teacherIdFromLink) {
          if (storedToken) {
            setInitialHref(getTeacherProfileAppPath(teacherIdFromLink));
          } else {
            await setPendingTeacherProfileId(teacherIdFromLink);
            setInitialHref('/(authenticate)/welcome');
          }
        } else if (storedToken) {
          setInitialHref(await getPostAuthHref());
        } else {
          setInitialHref('/(authenticate)/welcome');
        }
      } catch (err) {
        console.error('Error checking login', err);
        setInitialHref('/(authenticate)/welcome');
      }
    }
    checkLogin();
  }, []);

  // Handle splash screen and initialization
  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load
        if (fontsLoaded) {
          // Keep splash screen visible for 4 seconds
          await new Promise(resolve => setTimeout(resolve, 4000));
          // Hide splash screen
          await SplashScreen.hideAsync();
          setIsReady(true);
        }
      } catch (error) {
        console.error('Error preparing app:', error);
      }
    }

    prepare();
  }, [fontsLoaded]);

  // Show splash screen while preparing
  if (!fontsLoaded || !isReady || !initialHref) {
    return (
      <View style={styles.container}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.splashImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View>
      <Redirect href={initialHref} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Match this with your splash screen background color
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});