import { Redirect } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

SplashScreen.preventAutoHideAsync();

export default function Page() {
  const [token, setToken] = useState({});
  const [wait, setWait] = useState(true);
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
  useEffect(() => {
    const checkLogin = async () => {
      try{
        const token = await AsyncStorage.getItem('authToken');
        const user = await AsyncStorage.getItem('userDetails');
        console.log(token,'this is token');
        console.log(JSON.parse(user),'this is userDetails');
        setToken(token);
      }
      catch(err){
        console.log(err);
    }
  }
    checkLogin();
}, []);
  
  if (!fontsLoaded) {
    return null;
  }
  return (
    <View>
   {!token ?<Redirect href={'/(authenticate)/welcome'}/>:<Redirect href={'/(tabs)/home'}/>}
   </View>
  );
}

