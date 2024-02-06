import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Image,
} from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale } from "../../utils/metrics";
import { socket } from "../../utils/socket";
import { debounce } from "lodash";
import { FONT } from "../../../constants/theme";

interface User {
  userId?: string;
}

const ChatPage = () => {

  const [conversation, setConversation] = React.useState([]);
  const [user, setUser] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  useEffect(() => {

    const getConversation = async () => {
      console.log("this is the getConversation function");

      const token = await AsyncStorage.getItem("authToken");
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
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
    socket.emit("chat-room", id)
    router.push(`/(tabs)/chat/${id}`);
  };
  console.log(conversation, "this is conversation");
  console.log(user, "this is user");

  const handleSearch = debounce(async () => {
    const token = await AsyncStorage.getItem("authToken");


    const filtered = conversation.filter((conversations) => {
      return conversations.clientId.name.toLowerCase().includes(searchInput.toLowerCase());
    });
    setConversation(filtered);
  }, 1000);


  return (
    <SafeAreaView style={styles.mainContainer}>
      <View>
        <View style={styles.searchContainer}>
          <Ionicons name={"search"} size={moderateScale(26)} color={"black"} style={styles.searchIconContainer} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Course..."
            placeholderTextColor="gray"
            value={searchInput}
            onChangeText={(text) => {
              setSearchInput(text);
              // handleSearch(); Implement Search feature later
            }}
          />
        </View>
        <View>
          <FlatList
            data={conversation}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handlePress(item._id)} style={styles.chatButtonContainer}>
                <View style={styles.chatIconContainer}>
                  <Image
                    source={{ uri: item.clientId.profileImage }} // Render this as teachers img if student and likewise. In each chat also do the same on the profile image.
                    style={styles.chatIconImage} />
                </View>
                <View style={styles.chatDetails}>
                  <View style={styles.chatDetailsMainHeadingContainer}>
                  <Text style={styles.chatDetailsMainHeading}>{user === item.userId._id ? item.clientId.name : item.userId.name}</Text> 
                  <Text style={styles.chatDetailsMainHeadingSubjectName}>{`(${item.subjectId.subjectName})`}</Text>
                  </View>
                  {item.messages.length > 0 && <Text style={styles.chatDetailsRecentChat}>{item.messages[item.messages.length - 1].text}</Text>}
                </View>

              </TouchableOpacity>
            )}
          />
        </View>

      </View>
    </SafeAreaView>
  );
};

export default ChatPage;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 10,
  },
  searchContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'flex-start',
    marginHorizontal: horizontalScale(10),
    marginTop: verticalScale(24),
    height: verticalScale(52),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: "black",
    marginBottom: verticalScale(24),
  },
  searchInput: {
    width: horizontalScale(200),
    height: verticalScale(40),
    fontFamily: FONT.medium,
    fontSize: moderateScale(13),
  },
  searchIconContainer: {
    flex: 0.3,
    marginLeft: horizontalScale(10)
  },
  chatButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: verticalScale(70),
    borderBottomWidth: 1,
  },
  chatDetails: {
    flexDirection: 'column',
    justifyContent:'space-around',
    width:'80%',
    
  },
  chatIconContainer: {
    padding: moderateScale(10),
  },
  chatIconImage: {
     width: horizontalScale(50), height: verticalScale(50), borderRadius: 25 
    },
    chatDetailsMainHeadingContainer:{
      flexDirection: "row",
      justifyContent: 'flex-start',
    },
    chatDetailsMainHeading:{
   
      alignItems: "center",
      fontFamily: FONT.semiBold,
      fontSize: moderateScale(14),
      marginBottom: verticalScale(2),
      color: "black",

    },
    chatDetailsMainHeadingSubjectName:{
      fontFamily: FONT.regular,
      fontSize: moderateScale(12),
      marginBottom: verticalScale(5),
      color: "black",
    },
    chatDetailsRecentChat:{
      color: "black",
      fontFamily: FONT.regular,
      fontSize: moderateScale(12),
    }
    

});
