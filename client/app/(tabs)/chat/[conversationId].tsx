import { Stack, useLocalSearchParams } from "expo-router";
import ChatPage from "../../components/ChatPage";
import { View, Text, TextInput, ScrollView, SafeAreaView, Image, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import { socket } from "../../utils/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { v4 as uuidv4 } from 'uuid';
import { router } from 'expo-router';
import { horizontalScale, moderateScale, verticalScale } from "../../utils/metrics";

interface Conversation {
  messages?: Message[];
  userId?: string;
  clientId?: ClientId;

}
interface Message {
  text?: string;
  senderId?: string;
  messageId?: string;
}
interface ClientId {
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
      const resp = await axios.get(`http://${ipURL}/api/conversation/single/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllMessages(resp.data)

    }
    getSingleConversation();
  }, [])

  console.log(allMessages, 'this is all messages1111111111111111111');



  return (
    <SafeAreaView style={styles.mainContainer} >
      <Stack.Screen options={{
        headerStyle: { backgroundColor: "white" },
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: () => (
          <Ionicons name="arrow-back" size={24} color="black" onPress={handleLeaveRoom} style={{ marginLeft: 0 }} />
        ),
        headerTitle: `${allMessages.clientId?.name}`,
        headerRight: () => (
          <Image source={{ uri: allMessages.clientId?.profileImage }} style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }} />
        ),
      }}>
      </Stack.Screen>

      <ScrollView style={styles.chatContainer} >
        <View style={{flex:1}}>
          {allMessages.messages?.map((message) => (
            <View key={message.messageId} style={user === message.senderId ?styles.userMessageContainer:styles.clientMessageContainer}>
              {user === message.senderId ? <Text>{message?.text}</Text> :
                <Text >{message?.text}</Text>
              }
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.typeMessageContainer}>
        <TextInput  style={styles.typeMessageInputBox}
          placeholder="Type a message"
          placeholderTextColor={"black"}
          onChangeText={(text) => setMessage(text)}
          value={message}

        />
        <View style={styles.typeMessageSendIcon}>
        <Ionicons name="send" size={18} color="white" onPress={handleSendMessage}  />
        </View>
      </View>
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

  chatContainer: {
    borderWidth: 1,
    borderColor: "black",
  },

  typeMessageContainer: {
    borderWidth: 1,
    borderColor: "black",
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    height:verticalScale(80),
    borderStartStartRadius:moderateScale(0),
    borderStartEndRadius:moderateScale(0),
    backgroundColor: "#1A4C6E"
  },

  typeMessageInputBox:{
    borderWidth: 1,
    borderColor: "gray",
    height: verticalScale(50),
    width:verticalScale(300),
    borderRadius:moderateScale(20),
    backgroundColor: "white",
  },
  typeMessageSendIcon:{
    marginLeft:moderateScale(10),

    height:'100%',
    width:verticalScale(30),
    justifyContent:'center',
    alignItems:'center',
    
  },

  textContainer:{
    borderWidth: 1,
    borderColor: "black",
    padding:verticalScale(10),
    margin:verticalScale(10),
    borderRadius:moderateScale(20),
    backgroundColor: "white",
  },

  userMessageContainer:{
    
      alignItems: 'center',
      borderWidth: 1,
      borderColor: "black",
      height: verticalScale(50),
      width:'40%',
      marginTop:verticalScale(10) ,
      marginLeft:horizontalScale(210),
      borderRadius:moderateScale(20),
      backgroundColor: "lightgray",
      justifyContent: 'center',
   
  },
  clientMessageContainer:{
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "black",
    height: verticalScale(50),
    marginLeft:horizontalScale(10),
    width:'40%',
    borderRadius:moderateScale(20),
    justifyContent: 'center',
    backgroundColor: "gray",
  },
  
  
});