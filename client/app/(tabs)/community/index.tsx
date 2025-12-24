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
  Animated,
  Easing,
  Dimensions,
  TextInput,
  Keyboard,
  Platform
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FONT } from "../../../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ipURL } from "../../utils/utils";
import { socket } from "../../utils/socket";
import { horizontalScale, moderateScale, verticalScale } from "../../utils/metrics";
import { COLORS } from "../../../constants";
import useSafeAreaInsets, { addBasePaddingToTopInset } from "../../hooks/useSafeAreaInsets";

const { width } = Dimensions.get('window');

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

const CommunityCard = ({ item, onPress, index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 500,
        delay: index * 100,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{
      opacity: opacityAnim,
      transform: [
        { translateY: translateYAnim },
        { scale: scaleAnim }
      ]
    }}>
      <TouchableOpacity 
        style={styles.card}
        onPress={onPress}
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
            <Text style={styles.memberCount}>{item.users?.length || 0}</Text>
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
    </Animated.View>
  );
};

// Add custom debounce hook at the top of the file
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

const CommunityPage = () => {
  const insets = useSafeAreaInsets();
  const [communities, setCommunities] = useState([]);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnimation] = useState(new Animated.Value(0));
  const debouncedSearchQuery = useDebounce(searchQuery, 400); // 500ms delay

  // Animation values
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(20)).current;
  const subHeaderOpacity = useRef(new Animated.Value(0)).current;
  const subHeaderTranslateY = useRef(new Animated.Value(20)).current;
  const searchButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(headerTranslateY, {
        toValue: 0,
        duration: 600,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(subHeaderOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(subHeaderTranslateY, {
        toValue: 0,
        duration: 600,
        delay: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleSearchPress = () => {
    setIsSearchVisible(prev => !prev);
    Animated.spring(searchAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const handleSearchClose = () => {
    Animated.spring(searchAnimation, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start(() => {
      setIsSearchVisible(false);
      setSearchQuery('');
      Keyboard.dismiss();
    });
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

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
  }

  useEffect(() => {
    getAllCommunities();
  }, [debouncedSearchQuery]);

  const handlePress = async(item) => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      const resp = await axios.post(
        `${ipURL}/api/community/${item.id}`, 
        {}, 
        { headers: { Authorization: `Bearer ${storedToken || token}` }}
      );
      socket.emit('chat-room', item.id);
      router.push(`/(tabs)/community/${item.id}`);
    } catch (error: any) {
      console.error("Error joining community:", error);
      // If already part of community, still navigate
      if (error.response?.status === 200 || error.response?.data?.message?.includes('already part')) {
        socket.emit('chat-room', item.id);
        router.push(`/(tabs)/community/${item.id}`);
      } else {
        alert(error.response?.data?.message || 'Failed to join community. Please try again.');
      }
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    getAllCommunities();
  }

  // if (isLoading) {
  //   return (
  //     <SafeAreaView style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#007AFF" />
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Animated.View style={[
        styles.header,
        {
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
          paddingTop: Platform.OS === 'android' ? addBasePaddingToTopInset(16, insets.top) : undefined
        }
      ]}>
        <Text style={styles.headerTitle}>Communities</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearchPress}
        >
          <Animated.View style={{ transform: [{ scale: searchButtonScale }] }}>
            <Ionicons name="search-outline" size={22} color="#333" />
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      {isSearchVisible && (
        <Animated.View 
          style={[
            styles.searchContainer,
            {
              transform: [{
                translateY: searchAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0]
                })
              }],
              opacity: searchAnimation
            }
          ]}
        >
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search communities..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus={true}
              placeholderTextColor={COLORS.gray}
            />
            {/* <TouchableOpacity onPress={handleSearchClose}>
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
            </TouchableOpacity> */}
          </View>
        </Animated.View>
      )}

      <Animated.View style={[
        styles.subHeader,
        {
          opacity: subHeaderOpacity,
          transform: [{ translateY: subHeaderTranslateY }]
        }
      ]}>
        <Text style={styles.subHeaderText}>
          Join communities to connect with like-minded people
        </Text>
      </Animated.View>

      {isLoading ? <ActivityIndicator size="large" color="#007AFF" style={{margin: 'auto'}} /> : <FlatList
        data={communities}
        renderItem={({ item, index }) => (
          <CommunityCard 
            item={item} 
            onPress={() => handlePress(item)} 
            index={index}
          />
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
      />}
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
  searchContainer: {
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(8),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(10),
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    //shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGray,
  },
  searchIcon: {
    marginRight: horizontalScale(10),
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: moderateScale(16),
    color: COLORS.primary,
    paddingVertical: verticalScale(5),
  },
});