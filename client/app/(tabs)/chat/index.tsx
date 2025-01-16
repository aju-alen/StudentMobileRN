import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Image } from 'expo-image';
import { limitTextLength } from "../../utils/helperFunctions";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale } from "../../utils/metrics";
import { socket } from "../../utils/socket";
import { debounce } from "lodash";
import { FONT } from "../../../constants/theme";

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const ChatPage = () => {
  const [conversation, setConversation] = useState([]);
  const [user, setUser] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [originalConversation, setOriginalConversation] = useState([]);

  const getConversation = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      
      const resp = await axios.get(`${ipURL}/api/conversation/${userDetails.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setConversation(resp.data);
      setOriginalConversation(resp.data);
      setUser(userDetails.userId);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  useEffect(() => {
    getConversation();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getConversation().finally(() => setRefreshing(false));
  }, []);

  const handlePress = async (id) => {
    socket.emit("chat-room", id);
    router.push(`/(tabs)/chat/${id}`);
  };

  const handleLongPress = (clientId, userId) => {
    const profileId = user === userId._id ? clientId._id : userId._id;
    router.push(`/(tabs)/chat/singleProfile/${profileId}`);
  };

  const handleSearch = debounce((text) => {
    if (!text.trim()) {
      setConversation(originalConversation);
      return;
    }

    const filtered = originalConversation.filter((conv) => 
      conv.clientId.name.toLowerCase().includes(text.toLowerCase())
    );
    setConversation(filtered);
  }, 300);

  const ChatItem = ({ item }) => {
    const isCurrentUser = user === item.userId._id;
    const displayName = isCurrentUser ? item.clientId.name : item.userId.name;
    const profileImage = isCurrentUser ? item.clientId.profileImage : item.userId.profileImage;
    const lastMessage = item.messages[item.messages.length - 1]?.text;

    return (
      <TouchableOpacity 
        onPress={() => handlePress(item._id)} 
        onLongPress={() => handleLongPress(item.clientId, item.userId)}
        style={styles.chatCard}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: profileImage }}
          style={styles.avatar}
          placeholder={blurhash}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.chatInfo}>
          <View style={styles.headerContainer}>
            <Text style={styles.nameText}>{displayName}</Text>
            <Text style={styles.subjectText}>{item?.subjectId?.subjectName}</Text>
          </View>
          {lastMessage && (
            <Text style={styles.messageText}>
              {limitTextLength(lastMessage, 50)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={moderateScale(20)} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#666"
          value={searchInput}
          onChangeText={(text) => {
            setSearchInput(text);
            handleSearch(text);
          }}
        />
      </View>
      
      <FlatList
        data={conversation}
        renderItem={({ item }) => <ChatItem item={item} />}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(12),
    height: verticalScale(48),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: horizontalScale(8),
    fontSize: moderateScale(16),
    fontFamily: FONT.regular,
    color: '#000',
  },
  listContainer: {
    padding: moderateScale(16),
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: horizontalScale(56),
    height: verticalScale(56),
    borderRadius: moderateScale(28),
  },
  chatInfo: {
    flex: 1,
    marginLeft: horizontalScale(12),
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: verticalScale(4),
  },
  nameText: {
    fontSize: moderateScale(16),
    fontFamily: FONT.semiBold,
    color: '#000',
    marginBottom: verticalScale(2),
  },
  subjectText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#666',
  },
  messageText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#444',
    marginTop: verticalScale(4),
  },
});

export default ChatPage;