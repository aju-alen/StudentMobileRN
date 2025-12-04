import { Redirect } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Page() {
  const [token, setToken] = useState(null);
  const [isReady, setIsReady] = useState(false);
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

  // Handle authentication check
  useEffect(() => {
    async function checkLogin() {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const user = await AsyncStorage.getItem('userDetails');

        setToken(storedToken);
      } catch (err) {
  throw new Error('Error checking login');
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
  if (!fontsLoaded || !isReady) {
    return (
      <View style={styles.container}>
        <Image 
          source={require('../assets/images/logo.png')}  // Make sure this path matches your splash image location
          style={styles.splashImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Once ready, redirect based on authentication status
  return (
    <View>
      {!token ? (
        <Redirect href={'/(authenticate)/welcome'} />
      ) : (
        <Redirect href={'/(tabs)/home'} />
      )}
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