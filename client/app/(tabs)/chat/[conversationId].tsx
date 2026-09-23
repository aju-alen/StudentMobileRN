import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Animated,
  Alert,
} from "react-native";
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Audio } from 'expo-av';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { socket, connectSocket } from "../../utils/socket";
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
import { uploadChatMedia } from "../../utils/uploadChatMedia";
import ChatVoiceNote from "../../components/ChatVoiceNote";

interface Message {
  text?: string;
  senderId?: string;
  messageId?: string;
  type?: 'TEXT' | 'IMAGE' | 'AUDIO';
  mediaUrl?: string;
  mediaMime?: string;
  durationMs?: number;
  timestamp?: Date | string;
  createdAt?: Date | string;
  status?: 'sending' | 'sent' | 'failed';
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
  const [isSendingMedia, setIsSendingMedia] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const recordingRef = useRef<Audio.Recording | null>(null);
  const { conversationId } = useLocalSearchParams();
  const conversationKey = String(conversationId || '');

  const otherParty = isTeacher ? allMessages.user : allMessages.client;

  const upsertMessage = useCallback((incoming: Message) => {
    setAllMessages((prev) => {
      const list = prev.messages || [];
      const index = list.findIndex((item) => item.messageId === incoming.messageId);
      if (index >= 0) {
        const next = [...list];
        next[index] = { ...next[index], ...incoming };
        return { ...prev, messages: next };
      }
      return { ...prev, messages: [...list, incoming] };
    });
  }, []);

  const emitChatMessage = useCallback((payload: Message) => {
    socket.emit("send-single-message-to-server", {
      conversationId: conversationKey,
      ...payload,
    });
  }, [conversationKey]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !conversationKey) return;

    const messageId = uuidv4();
    const newMessage: Message = {
      text: message.trim(),
      senderId: user,
      messageId,
      type: 'TEXT',
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    upsertMessage(newMessage);
    setMessage('');

    await connectSocket();
    if (!socket.connected) {
      upsertMessage({ messageId, status: 'failed' });
      return;
    }

    emitChatMessage(newMessage);
  }, [message, user, conversationKey, emitChatMessage, upsertMessage]);

  const sendMediaMessage = useCallback(async ({
    uri,
    mime,
    fileName,
    kind,
    durationMs,
  }: {
    uri: string;
    mime: string;
    fileName: string;
    kind: 'image' | 'audio';
    durationMs?: number;
  }) => {
    if (!conversationKey || !user) return;
    const messageId = uuidv4();
    const type = kind === 'audio' ? 'AUDIO' : 'IMAGE';
    const optimistic: Message = {
      messageId,
      senderId: user,
      type,
      text: '',
      mediaUrl: uri,
      mediaMime: mime,
      durationMs,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };
    upsertMessage(optimistic);
    setIsSendingMedia(true);
    try {
      const uploaded = await uploadChatMedia({
        uri,
        mime,
        fileName,
        conversationId: conversationKey,
        messageId,
        kind,
      });
      const uploadedMessage: Message = {
        ...optimistic,
        mediaUrl: uploaded.url,
        mediaMime: uploaded.mime || mime,
        status: 'sending',
      };
      await connectSocket();
      if (!socket.connected) {
        upsertMessage({ ...uploadedMessage, status: 'failed' });
        return;
      }
      emitChatMessage(uploadedMessage);
      upsertMessage(uploadedMessage);
    } catch (error) {
      console.error('Failed to send media message', error);
      upsertMessage({ ...optimistic, status: 'failed' });
      Alert.alert('Could not send', 'The image or voice note could not be uploaded. Please try again.');
    } finally {
      setIsSendingMedia(false);
    }
  }, [conversationKey, user, emitChatMessage, upsertMessage]);

  const handlePickImage = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Photos needed', 'Allow photo access to send images in messages.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        selectionLimit: 1,
      });
      if (result.canceled || !result.assets?.[0]?.uri) return;

      let uri = result.assets[0].uri;
      try {
        const jpeg = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 1600 } }],
          { compress: 0.72, format: ImageManipulator.SaveFormat.JPEG }
        );
        uri = jpeg.uri;
      } catch (error) {
        console.error('Image convert failed, sending original', error);
      }

      await sendMediaMessage({
        uri,
        mime: 'image/jpeg',
        fileName: `chat-${Date.now()}.jpg`,
        kind: 'image',
      });
    } catch (error) {
      console.error('Image picker failed', error);
      Alert.alert('Could not open photos', 'Please try again.');
    }
  }, [sendMediaMessage]);

  const handleToggleRecording = useCallback(async () => {
    if (isRecording && recordingRef.current) {
      try {
        const recording = recordingRef.current;
        const status = await recording.getStatusAsync();
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        recordingRef.current = null;
        setIsRecording(false);
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        if (uri) {
          await sendMediaMessage({
            uri,
            mime: 'audio/mp4',
            fileName: `voice-${Date.now()}.m4a`,
            kind: 'audio',
            durationMs: status.isLoaded ? status.durationMillis : undefined,
          });
        }
      } catch (error) {
        console.error('Stop recording failed', error);
        setIsRecording(false);
      }
      return;
    }

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Microphone needed', 'Allow microphone access to send voice notes.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('Start recording failed', error);
      Alert.alert('Recording failed', 'Could not start a voice note. Please try again.');
    }
  }, [isRecording, sendMediaMessage]);

  const handleLeaveRoom = useCallback(() => {
    if (conversationKey) {
      socket.emit("leave-room", { conversationId: conversationKey });
    }
    goBack('/(tabs)/chat');
  }, [conversationKey]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

    const joinRoom = async () => {
      await connectSocket();
      if (conversationId) {
        socket.emit("chat-room", conversationId);
      }
    };
    joinRoom();

    socket.on("server-message", (incoming) => {
      upsertMessage({ ...incoming, status: 'sent' });
    });
    socket.on("message-ack", ({ messageId }) => {
      if (messageId) upsertMessage({ messageId, status: 'sent' });
    });
    socket.on("message-error", ({ messageId, error }) => {
      if (messageId) upsertMessage({ messageId, status: 'failed' });
      if (error) console.error('Chat message error', error);
    });

    return () => {
      socket.off("server-message");
      socket.off("message-ack");
      socket.off("message-error");
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => undefined);
        recordingRef.current = null;
      }
    };
  }, [conversationId, upsertMessage]);

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
        {msg.type === 'IMAGE' && msg.mediaUrl ? (
          <Image
            source={{ uri: msg.mediaUrl }}
            style={styles.chatImage}
            contentFit="cover"
            transition={200}
          />
        ) : null}
        {msg.type === 'AUDIO' ? (
          <ChatVoiceNote
            uri={msg.mediaUrl}
            durationMs={msg.durationMs}
            isOwn={user === msg.senderId}
          />
        ) : null}
        {msg.type !== 'IMAGE' && msg.type !== 'AUDIO' ? (
        <Text style={[
          styles.messageText,
          user === msg.senderId ? styles.userMessageText : styles.otherMessageText
        ]}>
          {formatMessageText(msg?.text)}
        </Text>
        ) : null}
        {msg.status === 'sending' ? (
          <Text style={[styles.timeText, user === msg.senderId ? styles.userTimeText : styles.otherTimeText]}>
            Sending
          </Text>
        ) : null}
        {msg.status === 'failed' ? (
          <Text style={styles.failedText}>Not sent</Text>
        ) : null}
        {(msg.timestamp || msg.createdAt) && msg.status !== 'sending' ? (
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
        <KeyboardAvoidingView
          style={styles.chatWrapper}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
        >
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

            <View style={[styles.inputContainer, { paddingBottom: keyboardOpen ? 8 : addBasePaddingToInset(12, insets.bottom) }]}>
              <TouchableOpacity
                onPress={handlePickImage}
                disabled={isSendingMedia || isRecording}
                style={styles.mediaButton}
                accessibilityRole="button"
                accessibilityLabel="Send image"
              >
                <Ionicons name="image-outline" size={22} color="#1A4C6E" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleToggleRecording}
                disabled={isSendingMedia}
                style={[styles.mediaButton, isRecording && styles.recordingButton]}
                accessibilityRole="button"
                accessibilityLabel={isRecording ? 'Stop recording' : 'Record voice note'}
              >
                <Ionicons name={isRecording ? 'stop' : 'mic-outline'} size={22} color={isRecording ? '#FFFFFF' : '#1A4C6E'} />
              </TouchableOpacity>
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
                disabled={!message.trim() || isRecording}
                style={[styles.sendButton, (!message.trim() || isRecording) && styles.sendButtonDisabled]}
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
  mediaButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: '#C44747',
  },
  chatImage: {
    width: 220,
    height: 220,
    borderRadius: 12,
    backgroundColor: '#D7DEE5',
    marginBottom: 6,
  },
  failedText: {
    marginTop: 4,
    fontFamily: FONT.medium,
    fontSize: moderateScale(11),
    color: '#C44747',
  },
});

export default ConversationId;
