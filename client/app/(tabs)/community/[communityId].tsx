import React, { useEffect, useCallback, useRef, useState } from "react";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { ipURL } from "../../utils/utils";
import {
  Text,
  SafeAreaView,
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
import { socket } from "../../utils/socket";
import { horizontalScale, moderateScale, verticalScale } from "../../utils/metrics";
import { COLORS, FONT } from "../../../constants";
import { axiosWithAuth } from "../../utils/customAxios";

interface User {
  userId?: string;
  isTeacher?: boolean;
  isAdmin?: boolean;
}

interface Community {
  messages: Message[];
  communityName: string;
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
    router.replace('/(tabs)/community');
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
          alert(error.message || 'Only teachers can send messages in communities');
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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerStyle: styles.header,
          headerShadowVisible: false,
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={handleLeaveRoom} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {allMessages.communityName}
                </Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {allMessages.users?.length || 0} members
                </Text>
              </View>
            </View>
          ),
          headerTitle: () => null,
        }}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <View style={styles.chatWrapper}>
          <ScrollView
            style={styles.chatContainer}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {allMessages.messages?.map((msg, index, arr) => 
              renderMessage({ msg, index, arr })
            )}
          </ScrollView>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={100}
            style={styles.keyboardAvoidingView}
          >
            {isTeacher ? (
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { height: Math.max(40, inputHeight) }]}
                  placeholder="Type your message..."
                  placeholderTextColor="#95A5A6"
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
                >
                  <Ionicons
                    name="send"
                    size={24}
                    color={message.trim() ? COLORS.primary : "#BDC3C7"}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.restrictedContainer}>
                <Ionicons name="lock-closed" size={20} color="#7F8C8D" />
                <Text style={styles.restrictedText}>
                  Only teachers can send messages in communities
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#FFFFFF",
    elevation: 0,
    //shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: horizontalScale(16),
  },
  backButton: {
    padding: moderateScale(8),
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: horizontalScale(20),
  },
  headerTitle: {
    fontSize: moderateScale(16),
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginBottom: verticalScale(2),
  },
  headerSubtitle: {
    fontSize: moderateScale(12),
    fontFamily: FONT.regular,
    color: COLORS.gray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatWrapper: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  chatContainer: {
    flex: 1,
    padding: moderateScale(16),
  },
  messageRow: {
    marginVertical: verticalScale(4),
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
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    marginRight: horizontalScale(8),
    marginBottom: verticalScale(4),
  },
  messageBubble: {
    borderRadius: moderateScale(20),
    padding: moderateScale(12),
    paddingBottom: moderateScale(8),
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
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: moderateScale(4),
  },
  senderName: {
    fontSize: moderateScale(12),
    fontFamily: FONT.medium,
    color: "#7F8C8D",
    marginBottom: verticalScale(4),
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
    color: '#2C3E50',
  },
  timeText: {
    fontSize: moderateScale(12),
    marginTop: verticalScale(4),
    textAlign: 'right',
    fontFamily: FONT.regular,
  },
  userTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: '#95A5A6',
  },
  keyboardAvoidingView: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: moderateScale(12),
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: moderateScale(20),
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    fontSize: moderateScale(16),
    maxHeight: verticalScale(120),
    color: '#2C3E50',
    fontFamily: FONT.regular,
  },
  sendButton: {
    marginLeft: horizontalScale(12),
    padding: moderateScale(8),
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  restrictedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(16),
    backgroundColor: '#F8F9FA',
  },
  restrictedText: {
    marginLeft: horizontalScale(8),
    color: '#7F8C8D',
    fontSize: moderateScale(14),
    fontFamily: FONT.medium,
  },
});

export default CommunityId;