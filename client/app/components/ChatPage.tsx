import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../utils";
import React from "react";
const ChatId = ({chatName}) => {
  const [messages, setMessages] = React.useState([]);
  const [newMessage, setNewMessage] = React.useState("");
  const isUser = true;

const handleSendMessage = async () => {
  //THis is to send a message and store it in the backend.

  // we send the conversationId and the message to the backend with the senderId .
}

useEffect(() => {
  const getMessages = async () => {
    const token = await AsyncStorage.getItem('authToken')
    const userDetails = await AsyncStorage.getItem('userDetails')
    const user = JSON.parse(userDetails)
    const resp = await axios.get(`http://${ipURL}/api/message/${chatName}`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(resp.data,'this is resp.data');
    }
    getMessages();
}, []);

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
      
        {isUser?(
        <View style={styles.messageContainerLeft}>
        <View style={styles.messageContainer2}>
          <Text style={styles.message}>Hi</Text>
          <Text style={styles.time}>9:30PM</Text>
        </View>
        </View>
        )
        :(
        
          <View style={styles.messageContainerRight}>
          <View style={styles.messageContainer2}>
            <Text style={styles.message}>Hi</Text>
            <Text style={styles.time}>9:30PM</Text>
          </View>
          </View>
      )}
        {!isUser?(
        <View style={styles.messageContainerLeft}>
        <View style={styles.messageContainer2}>
          <Text style={styles.message}>Hi</Text>
          <Text style={styles.time}>9:30PM</Text>
        </View>
        </View>
        )
        :(
        
          <View style={styles.messageContainerRight}>
          <View style={styles.messageContainer2}>
            <Text style={styles.message}>Hi</Text>
            <Text style={styles.time}>9:30PM</Text>
          </View>
          </View>
      
      )}
        {!isUser?(
        <View style={styles.messageContainerLeft}>
        <View style={styles.messageContainer2}>
          <Text style={styles.message}>Hi</Text>
          <Text style={styles.time}>9:30PM</Text>
        </View>
        </View>
        )
        :(
        
          <View style={styles.messageContainerRight}>
          <View style={styles.messageContainer2}>
            <Text style={styles.message}>Hi</Text>
            <Text style={styles.time}>9:30PM</Text>
          </View>
          </View>
      
      )}
      
      <View style={styles.keyboardContainer}>
        <View style={styles.inputConatiner}>
          <Ionicons name="happy" size={30} color="grey" />
          <TextInput
            placeholder="Message"
            placeholderTextColor="grey"
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity onPress={handleSendMessage}>
          <Ionicons name="send" size={30} color="grey" />
          </TouchableOpacity>
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
  messageContainerLeft: {
    backgroundColor: "#93E9BE",
    justifyContent: "flex-start",
    flexDirection: "row",
  },
  messageContainerRight: {
    backgroundColor: "#93E9BE",
    justifyContent: "flex-end",
    flexDirection: "row",
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
