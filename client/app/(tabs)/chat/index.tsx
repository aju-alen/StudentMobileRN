import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { limitTextLength } from "../../utils/helperFunctions";
import React, { useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosWithAuth } from "../../utils/customAxios";
import { ipURL } from "../../utils/utils";
import { Ionicons } from '@expo/vector-icons';
import { horizontalScale, verticalScale, moderateScale } from "../../utils/metrics";
import { socket } from "../../utils/socket";
import { FONT } from "../../../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

const formatPreviewTime = (date?: string | Date) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ChatPage = () => {
  const [conversation, setConversation] = useState([]);
  const [user, setUser] = useState("");
  const [isTeacher, setIsTeacher] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [originalConversation, setOriginalConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const debouncedSearchQuery = useDebounce(searchInput, 400);

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

      const data = Array.isArray(resp.data) ? resp.data : [];
      setConversation(data);
      setOriginalConversation(data);
      setUser(userDetails.userId);
      setIsTeacher(!!userDetails.isTeacher);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError("Failed to load conversations. Please try again.");
      setConversation([]);
      setOriginalConversation([]);
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

  const filteredConversations = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (!query) return originalConversation;

    return originalConversation.filter((item) => {
      const otherParty = isTeacher ? item.user : item.client;
      const name = otherParty?.name || '';
      const subject = item?.subject?.subjectName || '';
      const lastMessage = item.messages?.[item.messages.length - 1]?.text || '';
      return (
        name.toLowerCase().includes(query) ||
        subject.toLowerCase().includes(query) ||
        lastMessage.toLowerCase().includes(query)
      );
    });
  }, [originalConversation, debouncedSearchQuery, isTeacher]);

  const handlePress = async (id) => {
    socket.emit("chat-room", id);
    router.push(`/(tabs)/chat/${id}`);
  };

  const handleLongPress = (client, userObj) => {
    const profileId = user === userObj?.id ? client?.id : userObj?.id;
    router.push(`/(tabs)/chat/singleProfile/${profileId}`);
  };

  const ChatItem = ({ item }) => {
    const otherParty = isTeacher ? item.user : item.client;
    const displayName = otherParty?.name || 'Conversation';
    const profileImage = otherParty?.profileImage;
    const lastMessage = item.messages?.[item.messages.length - 1];
    const lastMessageText = lastMessage?.text;
    const lastMessageTime = formatPreviewTime(lastMessage?.createdAt || lastMessage?.timestamp);
    const subjectName = item?.subject?.subjectName;

    return (
      <TouchableOpacity
        onPress={() => handlePress(item.id)}
        onLongPress={() => handleLongPress(item.client, item.user)}
        style={styles.card}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${displayName}${subjectName ? `, ${subjectName}` : ''}`}
      >
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={styles.avatar}
            placeholder={blurhash}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-outline" size={22} color="#1A4C6E" />
          </View>
        )}

        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {displayName}
            </Text>
            {!!lastMessageTime && (
              <Text style={styles.timeText}>{lastMessageTime}</Text>
            )}
          </View>
          {!!subjectName && (
            <Text style={styles.subjectText} numberOfLines={1}>
              {subjectName}
            </Text>
          )}
          {!!lastMessageText && (
            <Text style={styles.messageText} numberOfLines={1}>
              {limitTextLength(lastMessageText, 50)}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#5C6B76" />
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <ActivityIndicator size="large" color="#1A4C6E" />
      </SafeAreaView>
    );
  }

  if (error && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]} edges={['top']}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={getConversation}
          accessibilityRole="button"
          accessibilityLabel="Retry loading conversations"
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <Text style={styles.headerSubtitle}>Your conversations with tutors and students</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#5C6B76" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages"
          placeholderTextColor="#8A97A3"
          value={searchInput}
          onChangeText={setSearchInput}
          returnKeyType="search"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchInput('');
              Keyboard.dismiss();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={20} color="#5C6B76" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredConversations}
        renderItem={({ item }) => <ChatItem item={item} />}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="handled"
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
              <Ionicons name="chatbubble-ellipses-outline" size={40} color="#5C6B76" />
              <Text style={styles.emptyText}>
                {searchInput ? 'No matching conversations' : 'No conversations yet'}
              </Text>
              <Text style={styles.emptySubText}>
                {searchInput
                  ? 'Try a different name or subject.'
                  : 'Messages with tutors and students will show up here.'}
              </Text>
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
    backgroundColor: '#F4F6F8',
  },
  header: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(12),
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontFamily: FONT.bold,
    color: '#12263A',
  },
  headerSubtitle: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#5C6B76',
  },
  searchBar: {
    marginHorizontal: horizontalScale(20),
    marginBottom: verticalScale(12),
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EBF0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: FONT.medium,
    fontSize: moderateScale(15),
    color: '#12263A',
  },
  listContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(24),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EBF0',
    padding: 12,
    minHeight: 76,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#D7DEE5',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#EEF3F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameText: {
    flex: 1,
    fontSize: moderateScale(16),
    fontFamily: FONT.semiBold,
    color: '#12263A',
  },
  timeText: {
    fontSize: moderateScale(12),
    fontFamily: FONT.regular,
    color: '#8A97A3',
  },
  subjectText: {
    marginTop: 3,
    fontSize: moderateScale(13),
    fontFamily: FONT.medium,
    color: '#5C6B76',
  },
  messageText: {
    marginTop: 3,
    fontSize: moderateScale(13),
    fontFamily: FONT.regular,
    color: '#5C6B76',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: '#C44747',
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  retryButton: {
    minHeight: 44,
    backgroundColor: '#1A4C6E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: verticalScale(48),
    paddingHorizontal: horizontalScale(24),
  },
  emptyText: {
    marginTop: verticalScale(12),
    fontSize: moderateScale(16),
    fontFamily: FONT.bold,
    color: '#12263A',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#5C6B76',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ChatPage;
