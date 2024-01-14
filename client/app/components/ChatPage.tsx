import { StyleSheet, Text, View, SafeAreaView, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
const ChatId = ({chatName}) => {

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.nameContainer}>
        <Ionicons
          name="people-circle"
          size={50}
          color="white"
          style={{ paddingLeft: 8 }}
        />
        <Text style={styles.nameText}>{chatName}</Text>
        <Ionicons
          name="ellipsis-vertical"
          size={30}
          color="white"
          style={styles.icon}
        />
      </View>
      <View style={styles.messageContainer}>
        <View style={styles.messageContainer2}>
          <Text style={styles.message}>Hi</Text>
          <Text style={styles.time}>9:30PM</Text>
        </View>
        <View style={styles.messageContainer2}>
          <Text style={styles.message}>Why</Text>
          <Text style={styles.time}>10:30AM</Text>
        </View>
      </View>
      <View style={styles.keyboardContainer}>
        <View style={styles.inputConatiner}>
          <Ionicons name="happy" size={30} color="grey" />
          <TextInput
            placeholder="Message"
            placeholderTextColor="grey"
            style={styles.textInput}
          />
          <Ionicons name="camera" size={30} color="grey" />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatId;

const styles = StyleSheet.create({
  message: {
    color: "white",
    fontSize: 18,
    paddingLeft: 10,
  },
  time: {
    fontSize: 10,
    color: "white",
    paddingTop: 13,
    alignItems: "flex-end",
    paddingRight: 8,
    flex: 1,
    textAlign: "right",
  },
  container: {
    flex: 1,
    flexDirection: "column",
  },
  nameContainer: {
    backgroundColor: "#45B08C",
    height: 80,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    paddingLeft: 10,
    fontSize: 20,
    color: "white",
  },
  icon: {
    paddingRight: 8,
    flex: 1,
    textAlign: "right",
  },
  messageContainer: {
    backgroundColor: "#93E9BE",
    flex: 1,
    flexDirection: "column",
  },
  messageContainer2: {
    backgroundColor: "#81B69D",
    height: 43,
    width: "40%",
    borderRadius: 10,
    marginLeft: 15,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  keyboardContainer: {
    backgroundColor: "#45B08C",
    paddingVertical: 5,
    paddingHorizontal: 3,
  },
  inputConatiner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    height: 40,
    borderRadius: 6,
    paddingHorizontal: 5,
  },
  textInput: {
    paddingLeft: 12,
    fontSize: 18,
    flex: 1,
  },
});
