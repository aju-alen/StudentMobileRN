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
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { limitTextLength } from "../../utils/helperFunctions";
import React, { useState } from "react";
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

// Dummy data for demonstration


const ChatPage = () => {
  const [conversation, setConversation] = useState();
  const [user, setUser] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [originalConversation, setOriginalConversation] = useState();

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

  useFocusEffect(
    React.useCallback(() => {
      getConversation();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getConversation().finally(() => setRefreshing(false));
  }, []);

  const handlePress = async (id) => {
    socket.emit("chat-room", id);
    router.push(`/(tabs)/chat/${id}`);
  };

  const handleLongPress = (clientId, userId) => {
    const profileId = user === userId.id ? clientId.id : userId.id;
    router.push(`/(tabs)/chat/singleProfile/${profileId}`);
  };

  const handleSearch = debounce((text) => {
    if (!text.trim()) {
      setConversation(originalConversation);
      return;
    }

    const filtered = originalConversation.filter((conv) => {
      console.log(conv,'conv-a-sd-as-d-asd-a-sd-as-da-sd');
      
      
      return conv.client.name.toLowerCase().includes(text.toLowerCase())
  });

    setConversation(filtered);
  }, 100);

  console.log(conversation,'conversation');
  

  const ChatItem = ({ item }) => {
    const isCurrentUser = user === item.userId;
    const displayName = isCurrentUser ? item.client.name : item.user.name;
    const profileImage = isCurrentUser ? item.client.profileImage : item.user.profileImage;
    const lastMessage = item.messages[item.messages.length - 1]?.text;

    return (
      <TouchableOpacity 
        onPress={() => handlePress(item.id)} 
        onLongPress={() => handleLongPress(item.clientId, item.userId)}
        style={styles.chatCard}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: profileImage }}
            style={styles.avatar}
            placeholder={blurhash}
            contentFit="cover"
            transition={200}
          />
          {item.client.status === 'online' && (
            <View style={styles.onlineIndicator} />
          )}
        </View>
        
        <View style={styles.chatInfo}>
          <View style={styles.headerContainer}>
            <View style={styles.nameContainer}>
              <Text style={styles.nameText}>{displayName}</Text>
              <Text style={styles.timeText}>{item.lastActive}</Text>
            </View>
            <View style={styles.subjectContainer}>
              <Text style={styles.subjectText}>
                <Ionicons name="book-outline" size={moderateScale(14)} color="#666" />
                {' '}{item?.subject?.subjectName}
              </Text>
            </View>
          </View>
          {lastMessage && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>
                {limitTextLength(lastMessage, 50)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
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
        keyExtractor={item => item.id}
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
  header: {
    padding: moderateScale(16),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontFamily: FONT.bold,
    color: '#000',
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
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: horizontalScale(56),
    height: verticalScale(56),
    borderRadius: moderateScale(28),
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: moderateScale(12),
    height: moderateScale(12),
    borderRadius: moderateScale(6),
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  chatInfo: {
    flex: 1,
    marginLeft: horizontalScale(12),
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: verticalScale(4),
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: moderateScale(16),
    fontFamily: FONT.semiBold,
    color: '#000',
  },
  timeText: {
    fontSize: moderateScale(12),
    fontFamily: FONT.regular,
    color: '#666',
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
  subjectText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#666',
  },
  messageContainer: {
    marginTop: verticalScale(4),
  },
  messageText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#444',
  },
});

export default ChatPage;