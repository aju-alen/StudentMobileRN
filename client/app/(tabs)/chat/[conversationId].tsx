import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  ScrollView,
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
import { moderateScale } from "../../utils/metrics";
import { FONT } from "../../../constants";
import useSafeAreaInsets, { addBasePaddingToInset } from "../../hooks/useSafeAreaInsets";
import { SafeAreaView } from "react-native-safe-area-context";
import { goBack } from "../../utils/navigation";

interface Message {
  text?: string;
  senderId?: string;
  messageId?: string;
  timestamp?: Date;
  createdAt?: Date | string;
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

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const ConversationId = () => {
  const insets = useSafeAreaInsets();
  const [allMessages, setAllMessages] = useState<Conversation>({});
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inputHeight, setInputHeight] = useState(40);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { conversationId } = useLocalSearchParams();

  const otherParty = isTeacher ? allMessages.user : allMessages.client;

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
    goBack('/(tabs)/chat');
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
        setIsTeacher(!!userDetails.isTeacher);

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

    if (conversationId) {
      socket.emit("chat-room", conversationId);
    }

    socket.on("server-message", (incoming) => {
      setAllMessages(prev => ({
        ...prev,
        messages: [...(prev.messages || []), incoming]
      }));

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      socket.off("server-message");
    };
  }, [conversationId]);

  const formatTime = useCallback((date?: Date | string) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }, []);

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

  const renderMessage = useCallback(({ item: msg }) => (
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
        {(msg.timestamp || msg.createdAt) ? (
          <Text style={[
            styles.timeText,
            user === msg.senderId ? styles.userTimeText : styles.otherTimeText
          ]}>
            {formatTime(msg.timestamp || msg.createdAt)}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  ), [user, formatMessageText, formatTime, fadeAnim]);

  const messageCount = allMessages.messages?.length || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A4C6E" />
        </View>
      ) : (
        <View style={styles.chatWrapper}>
          <View style={styles.chatHeader}>
            <TouchableOpacity
              onPress={handleLeaveRoom}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Back to messages"
            >
              <Ionicons name="chevron-back" size={24} color="#12263A" />
            </TouchableOpacity>

            {otherParty?.profileImage ? (
              <Image
                source={{ uri: otherParty.profileImage }}
                style={styles.headerAvatar}
                placeholder={blurhash}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Ionicons name="person-outline" size={18} color="#1A4C6E" />
              </View>
            )}

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {otherParty?.name || 'Conversation'}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {messageCount > 0
                  ? `${messageCount} ${messageCount === 1 ? 'message' : 'messages'}`
                  : 'Direct chat'}
              </Text>
            </View>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          >
            {(!allMessages.messages || allMessages.messages.length === 0) ? (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatTitle}>No messages yet</Text>
                <Text style={styles.emptyChatSub}>
                  Send a message to start this conversation.
                </Text>
              </View>
            ) : (
              allMessages.messages.map((msg) => renderMessage({ item: msg }))
            )}
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
          >
            <View style={[styles.inputContainer, { paddingBottom: Platform.OS === 'android' ? addBasePaddingToInset(12, insets.bottom) : 12 }]}>
              <TextInput
                style={[styles.input, { height: Math.min(120, Math.max(44, inputHeight)) }]}
                placeholder="Write a message"
                placeholderTextColor="#8A97A3"
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
                accessibilityRole="button"
                accessibilityLabel="Send message"
              >
                <Ionicons
                  name="send"
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatWrapper: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F4F6F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E6EBF0',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D7DEE5',
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF3F7',
  },
  headerContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: moderateScale(16),
    fontFamily: FONT.bold,
    color: '#12263A',
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: moderateScale(12),
    fontFamily: FONT.regular,
    color: '#5C6B76',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
  },
  emptyChatTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#12263A',
  },
  emptyChatSub: {
    marginTop: 6,
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5C6B76',
    textAlign: 'center',
    lineHeight: 20,
  },
  messageRow: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  userMessageRow: {
    alignSelf: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  userBubble: {
    backgroundColor: '#1A4C6E',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EBF0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: moderateScale(15),
    lineHeight: 21,
    fontFamily: FONT.regular,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#12263A',
  },
  timeText: {
    fontSize: moderateScale(11),
    marginTop: 4,
    textAlign: 'right',
    fontFamily: FONT.regular,
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: '#8A97A3',
  },
  linkText: {
    color: "#2B6CB0",
    textDecorationLine: "underline",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6EBF0',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: moderateScale(15),
    maxHeight: 120,
    color: '#12263A',
    fontFamily: FONT.regular,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1A4C6E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C5CDD6',
  },
});

export default ConversationId;
