import React, { useEffect } from "react";
import ChatPage from "../../components/ChatPage";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from 'uuid';
import axios from "axios";
import { ipURL } from "../../utils/utils";
import {Text, FlatList, SafeAreaView, TextInput, TouchableOpacity, View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform} from "react-native";
import { socket } from "../../utils/socket";
import { moderateScale, verticalScale } from "../../utils/metrics";
import {useSegments} from 'expo-router';
import { FONT } from "../../../constants";
interface User {
  userId?: string;
 isTeacher?: boolean;
 isAdmin?: boolean;
}
interface Community {
  messages?: Message[];
}
interface Message {
  text?: string;
  senderId?: User;
  messageId?: string;
}

const CommunityId = () => {
  const chatName = useLocalSearchParams().communityId;

  const [allMessages, setAllMessages] = React.useState<Community>({});
  const [message, setMessage] = React.useState("");
  const [user, setUser] = React.useState<User>({});
  const [isTeacher, setIsTeacher] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);


  useEffect(() => {
    socket.on("server-joining-message", message => {
      console.log(message, 'this is the message from the server');
    })
   
    console.log('rendering socket useEffect');
  }, [socket]);


  
  const handleSendMessage = () => {
    const messageId = uuidv4();
    socket.emit("send-single-message-to-Community-server", {chatName,  ...{ text: message }, ...{ senderId: user }, ...{ messageId } }) //create this new socket function
    setAllMessages((prev) => ({
      ...prev, messages: [...prev.messages, { text: message, senderId: user, messageId }]
    }))
    setMessage('')
  }

useEffect(() => {
  const getMessages = async () => {

    socket.on("server-message", (message) => {
      console.log(message, 'this is the message from the server');
      setAllMessages((prev) => ({ ...prev, messages: [...prev.messages, { text: message.text, senderId: message.senderId, messageId: uuidv4() }] }))
    })
    const token = await AsyncStorage.getItem('authToken')
    const userDetails = await AsyncStorage.getItem('userDetails')
     
    const resp = await axios.get(`${ipURL}/api/community/${chatName}`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(JSON.parse(userDetails), 'full teacher details');
    
    setUser(JSON.parse(userDetails).userId);
    setIsTeacher(JSON.parse(userDetails).isTeacher);
    setIsAdmin(JSON.parse(userDetails).isAdmin);
    setAllMessages(resp.data);
    
    }
    getMessages();
}, []);
console.log(allMessages,'this is resp.data for getting chat messages');
console.log(user,'this is user details in chat');
console.log(isTeacher,'this is teacher details in chat');
console.log(isAdmin,'this is Admin details in chat');
console.log(message,'this is message');
const handleLeaveRoom = async() => {

  const data = { allMessages, chatName }
    socket.emit("leave-room-community", data)
    router.replace('/(tabs)/community')

}
const mainPath = useSegments()[1];
console.log(mainPath, 'this is NAV location');


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
      headerTitle: 'Community',
     
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
    <View >
     {isAdmin === true || isTeacher === true ? (
  <View style={styles.typeMessageContainer} >
    <TextInput
      style={styles.typeMessageInputBox}
      placeholder="Type a message"
      placeholderTextColor={"black"}
      onChangeText={(text) => setMessage(text)}
      value={message}
    />
    <View style={styles.typeMessageSendIcon}>
      <Ionicons
        name="send"
        size={18}
        color="gray"
        onPress={handleSendMessage}
        disabled={message.length > 0 ? false : true}
      />
    </View>
  </View>
) : (
  <Text style={styles.studentTextField}>Only Teachers & Admins can send Text</Text>
)}
    </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
)


};



export default CommunityId;

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
  },
  studentTextField:{
    fontSize: 14,
    fontFamily:FONT.medium,
    color: "black",
    textAlign: "center",
    marginTop: 10,
  }
});
