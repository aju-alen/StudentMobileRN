import { Stack, useLocalSearchParams } from "expo-router";
import ChatPage from "../../components/ChatPage";
import { View,Text, TextInput, ScrollView, SafeAreaView } from "react-native";
import React, { useEffect, useState } from "react";
import { socket } from "../../utils/socket";
import { TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { v4 as uuidv4 } from 'uuid';
import {  router } from 'expo-router';

interface Conversation {
  messages?: Message[];
  userId?: string;
  clientId?: string;
  subjectId?: string;
}
interface Message {
  text?: string;
  senderId?: string;
  messageId?: string;
}

const ConversationId = () => {
  const [allMessages,setAllMessages] = useState<Conversation>({});
  const [message,setMessage] = useState('');
  const [user, setUser] = useState('');
  const { conversationId } = useLocalSearchParams();

  console.log(ConversationId,'this is chatId');
  
  console.log(useLocalSearchParams(),'chat local params');

  const handleSendMessage = () => {
    const messageId = uuidv4();
    socket.emit("send-single-message-to-server",{conversationId,...{text:message},...{senderId:user},...{messageId}})
    setAllMessages((prev)=>({...prev,messages:[...prev.messages,{text:message,senderId:user,messageId}]
  }))
    setMessage('')
  }

  const handleLeaveRoom = ()=>{
    console.log('this is the conversationId',allMessages);
    
    const data = {allMessages,conversationId}
    socket.emit("leave-room",data)
    router.replace('/(tabs)/chat')
  }
  let count =0;

  useEffect(() => {
    socket.on("server-joining-message",message=>{
      console.log(message,'this is the message from the server');
    })
    socket.on("server-message",(message) =>{
      console.log("this is message recieved by the client side from the server",message);
      setAllMessages((prev)=>({...prev,messages:[...prev.messages,{text:message.text,senderId:message.senderId,messageId:uuidv4()}]}))
      console.log(count,'this is count');
      
    })
    console.log('rendering socket useEffect');

    
    
  }, [socket]);

  useEffect(() => {
    const getSingleConversation = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const userDetails = JSON.parse( await AsyncStorage.getItem("userDetails"));
      setUser(userDetails.userId)
      const resp = await axios.get(`http://${ipURL}/api/conversation/single/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllMessages(resp.data)
      
    }
    getSingleConversation();
  },[])

  console.log(allMessages,'this is all messages1111111111111111111');
  
  

return (
  <SafeAreaView style={{flex:1}}>
    <Stack.Screen options={{
                headerStyle: { backgroundColor: "white" },
                headerShadowVisible: false,
                headerBackVisible: false,
                headerLeft: () => (
                    <Ionicons name="arrow-back" size={24} color="black" onPress={handleLeaveRoom}  style={{ marginLeft: 0 }} />
                ),
                headerTitle: 'Testing Chat'
            }}>
              </Stack.Screen>
  <View>
    <Text>{conversationId}</Text>
    

    
    
  <ScrollView >
    <View>
      {allMessages.messages?.map((message)=>(
        <View key={message.messageId}>
          {user === message.senderId ? <Text style={{textAlign:"right"}}>{message?.text}</Text>:
          <Text style={{textAlign:"left"}}>{message?.text}</Text>
          }
        </View>
      ))}
      </View>
      </ScrollView>
      <View style={{flexDirection:"row", justifyContent:'center',alignItems:'center'}}>
      <TextInput style={{height:100,width:200,}}
      placeholder="Type a message"
      placeholderTextColor={"black"}
      onChangeText={(text) => setMessage(text)}
      value={message}
    
    />
    <Ionicons name="send" size={18} color="gray" onPress={handleSendMessage} />
      </View>
  </View>
  </SafeAreaView>
)

  // return <ChatPage chatName={conversationId} />;
};

export default ConversationId;
