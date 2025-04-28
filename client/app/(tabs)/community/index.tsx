import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
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

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const CommunityCard = ({ item, onPress }) => {
  console.log(item,'community card');
  return(
  <TouchableOpacity 
    style={styles.card}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.cardImageContainer}>
      <Image 
        source={{ uri: item.communityProfileImage }} 
        style={styles.communityImage}
        placeholder={blurhash}
        contentFit="fill"
        transition={200}
      />
      <View style={styles.memberBadge}>
        <Ionicons name="people" size={12} color="#FFF" />
        <Text style={styles.memberCount}>{item.users.length}</Text>
      </View>
    </View>
    
    <View style={styles.cardContent}>
      <View style={styles.titleContainer}>
        <Text style={styles.communityName} numberOfLines={1}>
          {item.communityName}
        </Text>
        <View style={styles.statusIndicator} />
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>Active</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#A0A0A0" />
      </View>
    </View>
  </TouchableOpacity>
)};

const CommunityPage = () => {
  const [communities, setCommunities] = useState([]);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getAllCommunities = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      const resp = await axios.get(`${ipURL}/api/community`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setCommunities(resp.data);
      setToken(storedToken);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    getAllCommunities();
  }, []);

  const handlePress = async(item) => {
    try {
      const resp = await axios.post(
        `${ipURL}/api/community/${item.id}`, 
        null, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      socket.emit('chat-room', item.id);
      router.push(`/(tabs)/community/${item.id}`);
    } catch (error) {
      console.error("Error joining community:", error);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    getAllCommunities();
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Communities</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.subHeaderText}>
          Join communities to connect with like-minded people
        </Text>
      </View>

      <FlatList
        data={communities}
        renderItem={({ item }) => (
          <CommunityCard item={item} onPress={() => handlePress(item)} />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No communities found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default CommunityPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: moderateScale(24),
    fontFamily: FONT.bold,
    color: '#1A1A1A',
  },
  searchButton: {
    padding: moderateScale(8),
  },
  subHeader: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(12),
    backgroundColor: '#F8F9FA',
  },
  subHeaderText: {
    fontSize: moderateScale(14),
    fontFamily: FONT.regular,
    color: '#666666',
  },
  listContainer: {
    padding: moderateScale(16),
    gap: verticalScale(16),
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    marginBottom: verticalScale(16),
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardImageContainer: {
    position: 'relative',
  },
  communityImage: {
    width: horizontalScale(70),
    height: verticalScale(70),
    borderRadius: moderateScale(12),
  },
  memberBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    gap: 4,
  },
  memberCount: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontFamily: FONT.medium,
  },
  cardContent: {
    flex: 1,
    marginLeft: horizontalScale(16),
    justifyContent: 'space-between',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
  },
  communityName: {
    fontSize: moderateScale(16),
    fontFamily: FONT.semiBold,
    color: '#1A1A1A',
    flex: 1,
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalScale(8),
  },
  tagContainer: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  tag: {
    fontSize: moderateScale(12),
    fontFamily: FONT.medium,
    color: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(50),
  },
  emptyText: {
    fontSize: moderateScale(16),
    fontFamily: FONT.medium,
    color: '#666666',
  },
});