import {
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import SubjectPage from "../../components/SubjectPage";
import { COLORS } from "../../../constants/theme";
import { Ionicons } from "@expo/vector-icons";


const SubjectId = () => {
  const { subjectId } = useLocalSearchParams();
  return (
    <View style={{flex:1}}>
       <Stack.Screen options={{
        headerStyle: { backgroundColor: "'rgba(255, 255, 255, 0.1)'" },
        headerTitle: "",
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: () => (
          <Ionicons name="arrow-back" size={24} color="black" onPress={()=>router.replace('/(tabs)/home')}  style={{ marginLeft: 0 }} />
        ),
      }}>
      </Stack.Screen>
      <SubjectPage subjectId={subjectId}/>

    </View>
  );
};

export default SubjectId;

const styles = StyleSheet.create({});
