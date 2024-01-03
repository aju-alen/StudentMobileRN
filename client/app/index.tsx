import { Redirect } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Page() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    
  });
  
  if (!fontsLoaded) {
    return null;
  }
  return (
   <Redirect href={'/(authenticate)/login'}/>
  );
}

