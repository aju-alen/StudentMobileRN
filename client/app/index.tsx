import { Redirect } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Page() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto/Roboto-Bold.ttf')
    
  });
  
  if (!fontsLoaded) {
    return null;
  }
  return (
   <Redirect href={'/(authenticate)/login'}/>
  );
}

