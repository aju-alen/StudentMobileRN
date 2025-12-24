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
  ActivityIndicator,
  Platform,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { limitTextLength } from "../../utils/helperFunctions";
import React, { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {axiosWithAuth} from "../../utils/customAxios";
import { ipURL } from "../../utils/utils";
import { Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale } from "../../utils/metrics";
import { socket } from "../../utils/socket";
import useSafeAreaInsets, { addBasePaddingToTopInset } from "../../hooks/useSafeAreaInsets";
import { FONT } from "../../../constants/theme";

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

// Dummy data for demonstration


const ChatPage = () => {
  const insets = useSafeAreaInsets();
  const [conversation, setConversation] = useState();
  const [user, setUser] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [originalConversation, setOriginalConversation] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getConversation = async () => {
    try {
      setError(null);
      const token = await AsyncStorage.getItem("authToken");
      const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
      
      const resp = await axiosWithAuth.get(`${ipURL}/api/conversation/${userDetails.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setConversation(resp.data);
      setOriginalConversation(resp.data);
      setUser(userDetails.userId);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError("Failed to load conversations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getConversation();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await getConversation();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handlePress = async (id) => {
    socket.emit("chat-room", id);
    router.push(`/(tabs)/chat/${id}`);
  };

  const handleLongPress = (client, userObj) => {
    const profileId = user === userObj?.id ? client?.id : userObj?.id;
    router.push(`/(tabs)/chat/singleProfile/${profileId}`);
  };


  console.log(conversation,'conversation');
  

  const ChatItem = ({ item }) => {
    const isCurrentUser = user === item.user?.id;
    const displayName = isCurrentUser ? item.client?.name : item.user?.name;
    const profileImage = isCurrentUser ? item.client?.profileImage : item.user?.profileImage;
    const lastMessage = item.messages[item.messages.length - 1]?.text;

    return (
      <TouchableOpacity 
        onPress={() => handlePress(item.id)} 
        onLongPress={() => handleLongPress(item.client, item.user)}
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

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1A4C6E" />
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={getConversation}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? addBasePaddingToTopInset(16, insets.top) : undefined }]}>
        <Text style={styles.headerTitle}>Messages</Text>
        {/* <TouchableOpacity style={styles.newChatButton}>
          <Ionicons name="add-circle-outline" size={moderateScale(24)} color="#1A4C6E" />
        </TouchableOpacity> */}
      </View>
      
      {/* <View style={styles.searchContainer}>
        <Ionicons name="search" size={moderateScale(20)} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          placeholderTextColor="#999"
          value={searchInput}
          onChangeText={(text) => {
            setSearchInput(text);
          }}
        />
        {searchInput.length > 0 && (
          <TouchableOpacity onPress={() => setSearchInput("")}>
            <Ionicons name="close-circle" size={moderateScale(20)} color="#666" />
          </TouchableOpacity>
        )}
      </View> */}
      
      <FlatList
        data={conversation}
        renderItem={({ item }) => <ChatItem item={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#1A4C6E"]}
            tintColor="#1A4C6E"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !refreshing && (
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={moderateScale(64)} color="#666" />
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubText}>Start a new conversation to begin chatting</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: moderateScale(28),
    fontFamily: FONT.bold,
    color: '#1A4C6E',
  },
  newChatButton: {
    padding: moderateScale(8),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    margin: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    borderRadius: moderateScale(16),
    height: verticalScale(52),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: horizontalScale(12),
    fontSize: moderateScale(16),
    fontFamily: FONT.regular,
    color: '#333',
  },
  listContainer: {
    padding: moderateScale(16),
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: moderateScale(20),
    padding: moderateScale(16),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: horizontalScale(60),
    height: verticalScale(60),
    borderRadius: moderateScale(30),
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(7),
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: 'white',
  },
  chatInfo: {
    flex: 1,
    marginLeft: horizontalScale(16),
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: verticalScale(6),
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontSize: moderateScale(17),
    fontFamily: FONT.semiBold,
    color: '#1A4C6E',
  },
  timeText: {
    fontSize: moderateScale(13),
    fontFamily: FONT.regular,
    color: '#666',
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
  },
  subjectText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#666',
  },
  messageContainer: {
    marginTop: verticalScale(6),
  },
  messageText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#666',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#FF4A4A',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  retryButton: {
    backgroundColor: '#1A4C6E',
    paddingHorizontal: horizontalScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(12),
  },
  retryButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: verticalScale(48),
  },
  emptyText: {
    fontFamily: FONT.semiBold,
    fontSize: moderateScale(18),
    color: '#1A4C6E',
    marginTop: verticalScale(16),
  },
  emptySubText: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#666',
    marginTop: verticalScale(8),
    textAlign: 'center',
  },
});

export default ChatPage;