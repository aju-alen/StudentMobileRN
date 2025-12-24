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
  ActivityIndicator,
  Linking,
  Animated,
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { socket } from "../../utils/socket";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { Ionicons } from "@expo/vector-icons";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { router } from 'expo-router';
import { horizontalScale, moderateScale, verticalScale } from "../../utils/metrics";
import { COLORS, FONT } from "../../../constants";
import useSafeAreaInsets, { addBasePaddingToInset } from "../../hooks/useSafeAreaInsets";

// Types moved to separate interfaces for better organization
interface Message {
  text?: string;
  senderId?: string;
  messageId?: string;
  timestamp?: Date;
}

interface UserProfile {
  id?: string;
  name?: string;
  profileImage?: string;
}

interface Conversation {
  messages?: Message[];
  user?: UserProfile;
  client?: UserProfile;
}

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const ConversationId = () => {
  const insets = useSafeAreaInsets();
  const [allMessages, setAllMessages] = useState<Conversation>({});
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [inputHeight, setInputHeight] = useState(40);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { conversationId } = useLocalSearchParams();

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;
    
    const messageId = uuidv4();
    const newMessage = { 
      text: message, 
      senderId: user, 
      messageId,
      timestamp: new Date()
    };

    socket.emit("send-single-message-to-server", { 
      conversationId, 
      ...newMessage
    });
    
    setAllMessages(prev => ({
      ...prev, 
      messages: [...(prev.messages || []), newMessage]
    }));
    setMessage('');
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [message, user, conversationId]);

  const handleLeaveRoom = useCallback(() => {
    if (conversationId && allMessages?.messages) {
      socket.emit("leave-room", { 
        allMessages: { messages: allMessages.messages },
        conversationId: conversationId as string
      });
    }
    router.replace('/(tabs)/chat');
  }, [allMessages, conversationId]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const fetchConversation = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const userDetails = JSON.parse(await AsyncStorage.getItem("userDetails"));
        setUser(userDetails.userId);
        
        const response = await axios.get(
          `${ipURL}/api/conversation/single/${conversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAllMessages(response.data);
      } catch (error) {
        console.error("Error fetching conversation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversation();

    // Join the chat room when component mounts
    if (conversationId) {
      socket.emit("chat-room", conversationId);
    }

    socket.on("server-message", (message) => {
      // Use the messageId from server, don't generate a new one
      setAllMessages(prev => ({ 
        ...prev, 
        messages: [...(prev.messages || []), message]
      }));
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      socket.off("server-message");
      // Note: Leave room cleanup is handled in handleLeaveRoom when user navigates away
    };
  }, [conversationId]);

  const formatMessageText = useCallback((text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        const link = part.startsWith("http") ? part : `https://${part}`;
        return (
          <Text 
            key={index} 
            style={styles.linkText}
            onPress={() => Linking.openURL(link)}
          >
            {part}
          </Text>
        );
      }
      return part;
    });
  }, []);

  const renderMessage = useCallback(({ item: msg, index }) => (
    <Animated.View 
      key={msg.messageId}
      style={[
        styles.messageRow,
        user === msg.senderId ? styles.userMessageRow : styles.otherMessageRow,
        { opacity: fadeAnim }
      ]}
    >
      <View style={[
        styles.messageBubble,
        user === msg.senderId ? styles.userBubble : styles.otherBubble
      ]}>
        <Text style={[
          styles.messageText,
          user === msg.senderId ? styles.userMessageText : styles.otherMessageText
        ]}>
          {formatMessageText(msg?.text)}
        </Text>
      </View>
    </Animated.View>
  ), [user, formatMessageText, fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerStyle: styles.header,
          headerShadowVisible: false,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={handleLeaveRoom}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ),
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Text style={styles.headerName}>
                {user === allMessages.user?.id 
                  ? allMessages.client?.name 
                  : allMessages.user?.name}
              </Text>
              <Text style={styles.headerStatus}>Online</Text>
            </View>
          ),
          headerRight: () => (
            <View style={styles.headerAvatarContainer}>
              <Image 
                source={{ 
                  uri: user === allMessages.user?.id
                    ? allMessages.client?.profileImage 
                    : allMessages.user?.profileImage 
                }}
                style={styles.headerAvatar}
                placeholder={blurhash}
                contentFit="cover"
                transition={200}
              />
            </View>
          ),
        }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {allMessages.messages?.map((msg, index) => renderMessage({ item: msg, index }))}
        </ScrollView>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={[styles.inputContainer, { paddingBottom: Platform.OS === 'android' ? addBasePaddingToInset(8, insets.bottom) : undefined }]}
      >
        <View style={styles.inputWrapper}>
          <TextInput 
            style={[styles.input, { height: Math.max(40, inputHeight) }]}
            placeholder="Type a message..."
            placeholderTextColor="#666"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            onContentSizeChange={(e) => 
              setInputHeight(e.nativeEvent.contentSize.height)
            }
          />
          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={!message.trim()}
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={message.trim() ? COLORS.primary : "#999"} 
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    elevation: 0,
    //shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
    marginBottom: verticalScale(2),
  },
  headerStatus: {
    fontSize: moderateScale(12),
    fontFamily: FONT.regular,
    color: '#4CAF50',
  },
  headerAvatarContainer: {
    padding: moderateScale(4),
    borderRadius: moderateScale(24),
    backgroundColor: '#F5F5F5',
  },
  headerAvatar: {
    height: moderateScale(36),
    width: moderateScale(36),
    borderRadius: moderateScale(18),
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
    maxWidth: '75%',
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    //shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: moderateScale(4),
  },
  otherBubble: {
    backgroundColor: '#F5F5F5',
    borderBottomLeftRadius: moderateScale(4),
  },
  messageText: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22),
    fontFamily: FONT.regular,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  linkText: {
    color: "#2196F3",
    textDecorationLine: "underline",
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: moderateScale(8),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F8F8',
    borderRadius: moderateScale(24),
    paddingHorizontal: horizontalScale(16),
    marginHorizontal: horizontalScale(8),
  },
  input: {
    flex: 1,
    fontSize: moderateScale(16),
    maxHeight: verticalScale(120),
    minHeight: verticalScale(40),
    padding: moderateScale(12),
    color: '#000000',
    fontFamily: FONT.regular,
  },
  sendButton: {
    padding: moderateScale(12),
    marginLeft: horizontalScale(8),
    marginBottom: verticalScale(6),
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ConversationId;