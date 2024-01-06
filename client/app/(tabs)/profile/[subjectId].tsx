import {
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import SubjectPage from "../../components/SubjectPage";

const SubjectId = () => {
  const { subjectId } = useLocalSearchParams();
  return (
    <SubjectPage subjectId={subjectId}/>
  );
};

export default SubjectId;

const styles = StyleSheet.create({});
