import React, { useEffect, useCallback, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { ipURL } from "../../utils/utils";
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Animated,
  TouchableOpacity,
} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import { socket } from "../../utils/socket";
import { moderateScale } from "../../utils/metrics";
import { FONT } from "../../../constants";
import { axiosWithAuth } from "../../utils/customAxios";
import { goBack } from "../../utils/navigation";
import useSafeAreaInsets, { addBasePaddingToInset } from "../../hooks/useSafeAreaInsets";

interface User {
  userId?: string;
  isTeacher?: boolean;
  isAdmin?: boolean;
}

interface Community {
  messages: Message[];
  communityName: string;
  communityProfileImage?: string;
  users?: User[];
}

interface SenderData {
  createdAt?: Date;
  name?: string;
  profileImage?: string;
}

interface Message {
  text?: string;
  senderId?: User;
  messageId?: string;
  timestamp?: Date;
  sender?: SenderData;
}

const CommunityId = () => {
  const insets = useSafeAreaInsets();
  const chatName = useLocalSearchParams().communityId;
  const [allMessages, setAllMessages] = useState<Community>({messages: [], communityName: ''});
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User>({});
  const [userImage, setUserImage] = useState<string>('');
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inputHeight, setInputHeight] = useState(40);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;
    
    const messageId = uuidv4();
    const timestamp = new Date();
    
    socket.emit("send-single-message-to-Community-server", {
      chatName,
      text: message,
      senderId: user,
      messageId,
      timestamp,
      userImage
    });
    
    setAllMessages(prev => ({
      ...prev,
      messages: [
        ...(prev?.messages || []),
        { 
          text: message, 
          senderId: user, 
          messageId, 
          timestamp, 
          sender: { 
            profileImage: userImage 
          } 
        }
      ],
    }));
    
    setMessage('');
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [message, user, chatName, userImage]);

  const handleLeaveRoom = useCallback(async () => {
    socket.emit("leave-room-community", { allMessages, chatName });
    goBack('/(tabs)/community');
  }, [allMessages, chatName]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    const getMessages = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        
        const resp = await axiosWithAuth.get(`${ipURL}/api/community/${chatName}`);
        
        const parsedDetails = JSON.parse(userDetails);
        setUser(parsedDetails.userId);
        setIsTeacher(parsedDetails.isTeacher);
        setUserImage(parsedDetails.userProfileImage);
        setIsAdmin(parsedDetails.isAdmin);
        setAllMessages(resp.data);

        // Join the community chat room when component mounts
        if (chatName) {
          socket.emit('chat-room', chatName);
        }

        socket.on("server-message", (message) => {
          // Use the messageId from server, don't generate a new one
          setAllMessages(prev => ({
            ...prev,
            messages: [...(prev.messages || []), {
              ...message,
              timestamp: message.timestamp || new Date()
            }]
          }));
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });

        // Handle error when trying to send message (e.g., if student tries to send)
        socket.on("community-message-error", (error) => {
          alert(error.message || 'Only tutors can send messages in communities');
        });
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    getMessages();

    return () => {
      socket.off("server-message");
      socket.off("community-message-error");
    };
  }, [chatName]);

  const formatTime = useCallback((date: Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }, []);

  const renderMessage = useCallback(({ msg, index, arr }) => {
    const isLastFromUser = index === arr.length - 1 || 
      arr[index + 1].senderId !== msg.senderId;

    return (
      <Animated.View
        style={[
          styles.messageRow,
          user === msg.senderId ? styles.userMessageRow : styles.otherMessageRow,
          { opacity: fadeAnim }
        ]}
        key={msg.messageId}
      >
        <View style={styles.messageContainer}>
          {user !== msg.senderId && (
            <Image
              source={{ uri: msg.sender?.profileImage }}
              style={styles.avatarImage}
            />
          )}
          <View
            style={[
              styles.messageBubble,
              user === msg.senderId ? styles.userBubble : styles.otherBubble
            ]}
          >
            {user !== msg.senderId && isLastFromUser && (
              <Text style={styles.senderName}>{msg.sender?.name}</Text>
            )}
            <Text style={[
              styles.messageText,
              user === msg.senderId ? styles.userMessageText : styles.otherMessageText
            ]}>
              {msg?.text}
            </Text>
            <Text style={[
              styles.timeText,
              user === msg.senderId ? styles.userTimeText : styles.otherTimeText
            ]}>
              {formatTime(msg.timestamp)}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }, [user, formatTime, fadeAnim]);

  const memberCount = allMessages.users?.length || 0;
  const messageCount = allMessages.messages?.length || 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A4C6E" />
        </View>
      ) : (
        <View style={styles.chatWrapper}>
          <View style={styles.communityHeader}>
            <TouchableOpacity
              onPress={handleLeaveRoom}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Back to communities"
            >
              <Ionicons name="chevron-back" size={24} color="#12263A" />
            </TouchableOpacity>

            {allMessages.communityProfileImage ? (
              <Image
                source={{ uri: allMessages.communityProfileImage }}
                style={styles.communityAvatar}
              />
            ) : (
              <View style={styles.communityAvatarPlaceholder}>
                <Ionicons name="people-outline" size={20} color="#1A4C6E" />
              </View>
            )}

            <View style={styles.communityHeaderContent}>
              <Text style={styles.communityHeaderTitle} numberOfLines={1}>
                {allMessages.communityName || 'Community'}
              </Text>
              <Text style={styles.communityHeaderSubtitle} numberOfLines={1}>
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
                {messageCount > 0 ? ` · ${messageCount} ${messageCount === 1 ? 'message' : 'messages'}` : ''}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          >
            {(!allMessages.messages || allMessages.messages.length === 0) ? (
              <View style={styles.emptyChat}>
                <Text style={styles.emptyChatTitle}>No messages yet</Text>
                <Text style={styles.emptyChatSub}>
                  {isTeacher ? 'Be the first to post in this community.' : 'Tutors post here. You can read along.'}
                </Text>
              </View>
            ) : (
              allMessages.messages.map((msg, index, arr) =>
                renderMessage({ msg, index, arr })
              )
            )}
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
          >
            {isTeacher ? (
              <View style={[styles.inputContainer, { paddingBottom: Platform.OS === 'android' ? addBasePaddingToInset(12, insets.bottom) : 12 }]}>
                <TextInput
                  style={[styles.input, { height: Math.min(120, Math.max(44, inputHeight)) }]}
                  placeholder="Write a message"
                  placeholderTextColor="#8A97A3"
                  onChangeText={setMessage}
                  value={message}
                  multiline
                  maxLength={1000}
                  onContentSizeChange={(e) =>
                    setInputHeight(e.nativeEvent.contentSize.height)
                  }
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    !message.trim() && styles.sendButtonDisabled
                  ]}
                  onPress={handleSendMessage}
                  disabled={!message.trim()}
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
            ) : (
              <View style={[styles.restrictedContainer, { paddingBottom: Platform.OS === 'android' ? addBasePaddingToInset(16, insets.bottom) : 16 }]}>
                <Ionicons name="lock-closed-outline" size={18} color="#5C6B76" />
                <Text style={styles.restrictedText}>
                  Only tutors can post in this community
                </Text>
              </View>
            )}
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
  communityHeader: {
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
  communityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#D7DEE5',
  },
  communityAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF3F7',
  },
  communityHeaderContent: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  communityHeaderTitle: {
    fontSize: moderateScale(16),
    fontFamily: FONT.bold,
    color: '#12263A',
  },
  communityHeaderSubtitle: {
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
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageRow: {
    alignSelf: 'flex-end',
  },
  otherMessageRow: {
    alignSelf: 'flex-start',
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 2,
    backgroundColor: '#D7DEE5',
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
  senderName: {
    fontSize: moderateScale(12),
    fontFamily: FONT.medium,
    color: '#5C6B76',
    marginBottom: 4,
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
  restrictedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E6EBF0',
    gap: 8,
  },
  restrictedText: {
    color: '#5C6B76',
    fontSize: moderateScale(13),
    fontFamily: FONT.medium,
  },
});

export default CommunityId;