import { Stack, useLocalSearchParams } from "expo-router";
import ChatPage from "../../components/ChatPage";
import { View, Text, TextInput, ScrollView, SafeAreaView, Image, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import React, { useEffect, useState } from "react";
import { socket } from "../../utils/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { v4 as uuidv4 } from 'uuid';
import { router } from 'expo-router';
import { horizontalScale, moderateScale, verticalScale } from "../../utils/metrics";
import { FONT } from "../../../constants";

interface Conversation {
  messages?: Message[];
  userId?: UserId;
  clientId?: ClientId;

}
interface Message {
  text?: string;
  senderId?: string;
  messageId?: string;

}
interface ClientId {
  _id?: string;
  name?: string;
  profileImage?: string;
}
interface UserId {
  _id?: string;
  name?: string;
  profileImage?: string;
}

const ConversationId = () => {
  const [allMessages, setAllMessages] = useState<Conversation>({});
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  const { conversationId } = useLocalSearchParams();

  console.log(ConversationId, 'this is chatId');

  console.log(useLocalSearchParams(), 'chat local params');

  const handleSendMessage = () => {
    const messageId = uuidv4();
    socket.emit("send-single-message-to-server", { conversationId, ...{ text: message }, ...{ senderId: user }, ...{ messageId } })
    setAllMessages((prev) => ({
      ...prev, messages: [...prev.messages, { text: message, senderId: user, messageId }]
    }))
    setMessage('')
  }

  const handleLeaveRoom = () => {
    console.log('this is the conversationId', allMessages);

    const data = { allMessages, conversationId }
    socket.emit("leave-room", data)
    router.replace('/(tabs)/chat')
  }
  let count = 0;

  useEffect(() => {
    socket.on("server-joining-message", message => {
      console.log(message, 'this is the message from the server');
    })
    socket.on("server-message", (message) => {
      console.log("this is message recieved by the client side from the server", message);
      setAllMessages((prev) => ({ ...prev, messages: [...prev.messages, { text: message.text, senderId: message.senderId, messageId: uuidv4() }] }))
      console.log(count, 'this is count');

    })
    console.log('rendering socket useEffect');
  }, [socket]);

  useEffect(() => {
    const getSingleConversation = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      setUser(userDetails.userId)
      const resp = await axios.get(`${ipURL}/api/conversation/single/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllMessages(resp.data)

    }
    getSingleConversation();
  }, [])

  console.log(allMessages, 'this is all messages1111111111111111111');

  console.log(user, 'this is userId');


  return (
    <SafeAreaView style={styles.mainContainer} >
      <Stack.Screen options={{
        headerStyle: { backgroundColor: "white" },
        headerShadowVisible: false,
        headerBackVisible: false,
        gestureEnabled:false,
        headerLeft: () => (
          <Ionicons name="arrow-back" size={24} color="black" onPress={handleLeaveRoom} style={{ marginLeft: 0 }} />
        ),
        headerTitle: user === allMessages.userId?._id ? allMessages.clientId?.name : allMessages.userId?.name,
        headerRight: () => (
          <Image source={{ uri: user === allMessages.userId?._id ? allMessages.clientId?.profileImage : allMessages.userId?.profileImage }} style={styles.stackHeaderImage}
            resizeMode="contain"
          />
        ),
      }}>
      </Stack.Screen>

      <ScrollView style={styles.chatContainer} >
        {allMessages.messages?.map((message) => (
          <View style={user === message.senderId ? styles.chatContainerRight : styles.chatContainerLeft} key={message.messageId}>
            <View style={styles.chatBubbleContainer} >
              <View style={user === message.senderId ? styles.userchatBubble : styles.clientchatBubble}>
                 <Text style={styles.textStyle}>{message?.text}</Text> 
                
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
      <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}> 
      <View style={styles.typeMessageContainer}>
        <TextInput style={styles.typeMessageInputBox}
          placeholder="Type a message"
          placeholderTextColor={"black"}
          onChangeText={(text) => setMessage(text)}
          value={message}

        />
        <View style={styles.typeMessageSendIcon}>
          <Ionicons name="send" size={18} color="gray" onPress={handleSendMessage} disabled={message.length > 0 ? false : true }  />
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )

  // return <ChatPage chatName={conversationId} />;
};

export default ConversationId;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
  },
  stackHeaderImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 10
  },
  chatContainer: {
    backgroundColor: '#F5F5F1',
    
  },
  chatContainerLeft: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  chatContainerRight: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },

  typeMessageContainer: {
    borderWidth: 1,
    borderColor: "gray",
    flexDirection: "row",
    justifyContent: 'center',

    alignItems: 'center',
    height: verticalScale(80),
    borderStartStartRadius: moderateScale(0),
    borderStartEndRadius: moderateScale(0),
    backgroundColor: "white"
  },

  typeMessageInputBox: {
    borderWidth: 1,
    padding: moderateScale(10),
    fontSize: moderateScale(15),
    
    borderColor: "gray",
    height: verticalScale(50),
    width: verticalScale(300),
    borderRadius: moderateScale(20),
    backgroundColor: "white",
  },
  typeMessageSendIcon: {
    marginLeft: moderateScale(10),
    height: '100%',
    width: verticalScale(30),
    justifyContent: 'center',
    alignItems: 'center',
  },

  chatBubbleContainer: {
    maxWidth: '80%', // Set the maximum width of the chat container
    alignItems: 'flex-start',
    margin:moderateScale(3),

  },

  userchatBubble: {
    maxWidth: '80%', // Set the maximum width of the chat bubble
    borderRadius: 15, // Rounded corners for the bubble
    padding: 10, // Padding inside the bubble
    backgroundColor: '#75CAD7', // Background color of the bubble
    position: 'relative', // Required for positioning the tail
  },
  clientchatBubble: {
    maxWidth: '80%', // Set the maximum width of the chat bubble
    borderRadius: 15, // Rounded corners for the bubble
    padding: 10, // Padding inside the bubble
    backgroundColor: '#DCF8C6', // Background color of the bubble
    position: 'relative', // Required for positioning the tail
  },
  textStyle:{
textAlign:'justify'
  }
});