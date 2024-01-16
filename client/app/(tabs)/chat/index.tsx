import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../utils";

const ChatPage = () => {
  const teachersInformation = [
    {
      id: 1,
      name: "John Smith",
      subject: "Mathematics",
    },
    {
      id: 2,
      name: "Emily Johnson",
      subject: "English",
    },
    {
      id: 3,
      name: "Michael Davis",
      subject: "Science",
    },
    {
      id: 4,
      name: "Lisa Williams",
      subject: "History",
    },
    {
      id: 5,
      name: "Daniel Miller",
      subject: "Physical Education",
    },
  ];
  const [conversation, setConversation] = React.useState([]);
  useEffect(() => {

    const getConversation = async () => {
    const token = await AsyncStorage.getItem("authToken");
    const resp = await axios.get(`http://${ipURL}/api/conversation`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setConversation(resp.data);
    console.log('this is useeffect in chat');
  
  }
    getConversation();
  }, []);
  

  const handlePress = (item) => {
    const conversationId = item.userId + item.clientId._id;
    console.log(conversationId, "this is conversationId");
    
    router.push(`/(tabs)/chat/${conversationId}`);
  };
  console.log(conversation, "this is conversation");
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for your chats here"
          style={styles.searchInput}
        />
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.checkq}>
          <FlatList
            data={conversation}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handlePress(item)} style={[styles.shadowProp,styles.card]}>
              <View>
                  <View style={styles.listContainer}>
                    <View>
                      <Text style={styles.name}>{item.clientId.name}</Text>
                      <Text style={styles.message}>{}</Text>
                      
                    </View>
                  </View>
              </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item._id}
          />
        </View>
      </View>
    </View>
  );
};

export default ChatPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DBE8D8",
    padding: 10,
    flexDirection: "column",
  },
  searchContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    height: 45,
    marginVertical: 10,
  },
  searchInput: {
    paddingLeft: 10,
    fontSize: 16,
    flex: 1,
    fontFamily: "Roboto-Regular",
  },
  mainContainer: {
    backgroundColor: "#45B08C",
    borderRadius: 10,
    width: "100%",
    height: "100%",
  },
  listContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  checkq: {
    marginTop: 10,
    borderRadius: 10,
  },
  name: {
    fontFamily: "Roboto-Regular",
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
  },
  message: {
    fontSize: 15,
    color: "lightgrey",
    fontFamily: "Roboto-Regular",
  },
  card: {
    
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 25,
    width: '100%',
    marginVertical: 2,
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
