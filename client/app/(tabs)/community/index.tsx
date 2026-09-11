import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Keyboard,
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FONT } from "../../../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { socket } from "../../utils/socket";
import { horizontalScale, moderateScale, verticalScale } from "../../utils/metrics";
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

const CommunityCard = ({ item, onPress }) => {
  const memberCount = item.users?.length || 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${item.communityName}, ${memberCount} members`}
    >
      {item.communityProfileImage ? (
        <Image
          source={{ uri: item.communityProfileImage }}
          style={styles.communityImage}
          placeholder={blurhash}
          contentFit="cover"
          transition={200}
        />
      ) : (
        <View style={styles.communityImagePlaceholder}>
          <Ionicons name="people-outline" size={22} color="#1A4C6E" />
        </View>
      )}

      <View style={styles.cardContent}>
        <Text style={styles.communityName} numberOfLines={1}>
          {item.communityName}
        </Text>
        <Text style={styles.memberText}>
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#5C6B76" />
    </TouchableOpacity>
  );
};

const CommunityPage = () => {
  const [communities, setCommunities] = useState([]);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const getAllCommunities = async () => {
    try {
      setIsLoading(true);
      const storedToken = await AsyncStorage.getItem("authToken");
      const searchParam = debouncedSearchQuery ? `?q=${encodeURIComponent(debouncedSearchQuery)}` : '';
      const resp = await axios.get(`${ipURL}/api/community${searchParam}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setCommunities(resp.data || []);
      setToken(storedToken);
    } catch (error) {
      console.error("Error fetching communities:", error);
      setCommunities([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getAllCommunities();
  }, [debouncedSearchQuery]);

  const handlePress = async (item) => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      await axios.post(
        `${ipURL}/api/community/${item.id}`,
        {},
        { headers: { Authorization: `Bearer ${storedToken || token}` }}
      );
      socket.emit('chat-room', item.id);
      router.push(`/(tabs)/community/${item.id}`);
    } catch (error: any) {
      console.error("Error joining community:", error);
      if (error.response?.status === 200 || error.response?.data?.message?.includes('already part')) {
        socket.emit('chat-room', item.id);
        router.push(`/(tabs)/community/${item.id}`);
      } else {
        alert(error.response?.data?.message || 'Failed to join community. Please try again.');
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getAllCommunities();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communities</Text>
        <Text style={styles.headerSubtitle}>Find a group and join the conversation</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#5C6B76" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search communities"
          placeholderTextColor="#8A97A3"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A4C6E" />
        </View>
      ) : (
        <FlatList
          data={communities}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <CommunityCard
              item={item}
              onPress={() => handlePress(item)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#1A4C6E']}
              tintColor="#1A4C6E"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={40} color="#5C6B76" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No matching communities' : 'No communities yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? 'Try a different name or pull to refresh.'
                  : 'Pull to refresh, or check back later.'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default CommunityPage;

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
  communityImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#D7DEE5',
  },
  communityImagePlaceholder: {
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
  communityName: {
    fontSize: moderateScale(16),
    fontFamily: FONT.semiBold,
    color: '#12263A',
  },
  memberText: {
    marginTop: 4,
    fontSize: moderateScale(13),
    fontFamily: FONT.regular,
    color: '#5C6B76',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptySubtext: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#5C6B76',
    textAlign: 'center',
    lineHeight: 20,
  },
});
