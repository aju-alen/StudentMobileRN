import { Redirect } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function Page() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto/Roboto-Regular.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto/Roboto-Bold.ttf'),

    NotoSemiBold : require(`../assets/fonts/NotoSans/NotoSans-SemiBold.ttf`),
    NotoRegular : require(`../assets/fonts/NotoSans/NotoSans-Regular.ttf`),
    NotoMedium: require(`../assets/fonts/NotoSans/NotoSans-Medium.ttf`),
    NotoBold: require(`../assets/fonts/NotoSans/NotoSans-Bold.ttf`),
    NotoThinItalic: require(`../assets/fonts/NotoSans/NotoSans-ThinItalic.ttf`), 

    DMMedium : require(`../assets/fonts/DMSans-Medium.ttf`),
    DMRegular : require(`../assets/fonts/DMSans-Regular.ttf`)
    
  });
  
  if (!fontsLoaded) {
    return null;
  }
  return (
   <Redirect href={'/(authenticate)/login'}/>
  );
}

