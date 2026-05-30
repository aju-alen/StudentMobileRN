import {
  StyleSheet,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import SubjectPage from "../../components/SubjectPage";
import { COLORS } from "../../../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const SubjectId = () => {
  const { subjectId } = useLocalSearchParams();
  return (
    <View style={{flex:1}}>
       <Stack.Screen options={{
        headerStyle: { backgroundColor: COLORS.primary }, 
        headerTintColor: COLORS.primary,
        headerTitle: "",
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: () => (
          <Ionicons name="arrow-back" size={24} color={COLORS.white} onPress={()=>router.replace('/(tabs)/home')}  style={{ marginLeft: 0 }} />
        ),
      }}>
      </Stack.Screen>
      <SubjectPage subjectId={subjectId}/>

    </View>
  );
};

export default SubjectId;

const styles = StyleSheet.create({});
