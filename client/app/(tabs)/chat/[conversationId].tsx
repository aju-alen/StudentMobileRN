import { Stack, useLocalSearchParams } from "expo-router";
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  SafeAreaView,
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState, useRef } from "react";
import { socket } from "../../utils/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { Ionicons } from "@expo/vector-icons";
import 'react-native-get-random-values';
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

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const ConversationId = () => {
  const [allMessages, setAllMessages] = useState<Conversation>({});
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef(null);
  const { conversationId } = useLocalSearchParams();

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const messageId = uuidv4();
    socket.emit("send-single-message-to-server", { 
      conversationId, 
      text: message, 
      senderId: user, 
      messageId 
    });
    
    setAllMessages((prev) => ({
      ...prev, 
      messages: [...prev.messages, { text: message, senderId: user, messageId }]
    }));
    setMessage('');
    
    // Scroll to bottom after sending message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleLeaveRoom = () => {
    const data = { allMessages, conversationId };
    socket.emit("leave-room", data);
    router.replace('/(tabs)/chat');
  };

  useEffect(() => {
    socket.on("server-joining-message", message => {
      console.log(message);
    });
    
    socket.on("server-message", (message) => {
      setAllMessages((prev) => ({ 
        ...prev, 
        messages: [...prev.messages, { 
          text: message.text, 
          senderId: message.senderId, 
          messageId: uuidv4() 
        }]
      }));
      
      // Scroll to bottom when receiving message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      socket.off("server-joining-message");
      socket.off("server-message");
    };
  }, []);

  useEffect(() => {
    const getSingleConversation = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
        setUser(userDetails.userId);
        
        const resp = await axios.get(
          `${ipURL}/api/conversation/single/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAllMessages(resp.data);
      } catch (error) {
        console.error("Error fetching conversation:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getSingleConversation();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerStyle: { backgroundColor: "white" },
          headerShadowVisible: true,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={handleLeaveRoom}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Text style={styles.headerName}>
                {user === allMessages.userId?._id 
                  ? allMessages.clientId?.name 
                  : allMessages.userId?.name}
              </Text>
            </View>
          ),
          headerRight: () => (
            <Image 
              source={{ 
                uri: user === allMessages.userId?._id 
                  ? allMessages.clientId?.profileImage 
                  : allMessages.userId?.profileImage 
              }}
              style={styles.headerAvatar}
              placeholder={blurhash}
              contentFit="cover"
              transition={200}
            />
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {allMessages.messages?.map((msg) => (
            <View 
              key={msg.messageId}
              style={[
                styles.messageRow,
                user === msg.senderId ? styles.userMessageRow : styles.otherMessageRow
              ]}
            >
              <View 
                style={[
                  styles.messageBubble,
                  user === msg.senderId ? styles.userBubble : styles.otherBubble
                ]}
              >
                <Text style={[
                  styles.messageText,
                  user === msg.senderId ? styles.userMessageText : styles.otherMessageText
                ]}>
                  {msg?.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput 
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={!message.trim()}
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled
            ]}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={message.trim() ? "#007AFF" : "#999"} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F6",
  },
  headerButton: {
    padding: moderateScale(8),
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerName: {
    fontSize: moderateScale(17),
    fontFamily: FONT.semiBold,
    color: '#000',
  },
  headerAvatar: {
    height: moderateScale(36),
    width: moderateScale(36),
    borderRadius: moderateScale(18),
    marginRight: horizontalScale(16),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: moderateScale(16),
  },
  messageRow: {
    marginVertical: verticalScale(4),
    maxWidth: '80%',
  },
  userMessageRow: {
    alignSelf: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: moderateScale(20),
    padding: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    maxWidth: '100%',
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  otherBubble: {
    backgroundColor: '#E9E9EB',
  },
  messageText: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22),
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    padding: moderateScale(8),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: moderateScale(24),
    paddingHorizontal: horizontalScale(16),
    marginHorizontal: horizontalScale(8),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22),
    maxHeight: verticalScale(100),
    padding: moderateScale(12),
    color: '#000000',
    fontFamily: FONT.regular,
  },
  sendButton: {
    padding: moderateScale(8),
    marginLeft: horizontalScale(8),
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ConversationId;