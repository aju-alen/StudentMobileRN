import {
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import SubjectPage from "../../components/SubjectPage";
import { COLORS } from "../../../constants/theme";
import { Ionicons } from "@expo/vector-icons";


const SubjectId = () => {
  const { subjectId } = useLocalSearchParams();
  return (
    <SubjectPage subjectId={subjectId}/>
  );
};

export default SubjectId;

const styles = StyleSheet.create({});
