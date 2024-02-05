import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
} from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { horizontalScale,verticalScale,moderateScale } from "../../utils/metrics";
import { socket } from "../../utils/socket";

interface User {
  userId?: string;
}

const ChatPage = () => {
 
  const [conversation, setConversation] = React.useState([]);
  const [user, setUser] = React.useState("");
  useEffect(() => {

    const getConversation = async () => {
      console.log("this is the getConversation function");
      
    const token = await AsyncStorage.getItem("authToken");
    const userDetails = JSON.parse( await AsyncStorage.getItem("userDetails"));
    console.log(userDetails.userId, "this is user.userId");
    
    const resp = await axios.get(`http://${ipURL}/api/conversation/${userDetails.userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setConversation(resp.data);
    setUser(userDetails.userId);
    
  }
    getConversation();
  }, []);


  console.log(conversation, "this is the conversation for the user");
  

  const handlePress = async (id) => {
    
    socket.emit("chat-room",id)
    router.push(`/(tabs)/chat/${id}`);
    
    
  };
  console.log(conversation, "this is conversation");
  console.log(user, "this is user");
  
  
  return (
    <SafeAreaView style={styles.mainContainer}>
    <View>
      <FlatList
        data={conversation}
        renderItem={({item})=>(
          <TouchableOpacity onPress={()=> handlePress(item._id)} style={styles.chatButtonContainer}>
           <Text>{user === item.userId._id ? item.clientId.name : item.userId.name} {`(${item.subjectId.subjectName})`}</Text>
           {item.messages.length >0 &&<Text>{item.messages[item.messages.length - 1].text}</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
    </SafeAreaView>
  );
};

export default ChatPage;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#DBE8D8",
    padding: 10,
    flexDirection: "column",
  },
  chatButtonContainer:{
    margin: 10,
    backgroundColor: "#45B08C",
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
  }
});
