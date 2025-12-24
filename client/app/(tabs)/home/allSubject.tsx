import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, RefreshControl, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { COLORS, FONT } from '../../../constants';
import StatusBarComponent from '../../components/StatusBarComponent';
import SubjectCards from '../../components/SubjectCards';
import useSafeAreaInsets, { addBasePaddingToTopInset } from '../../hooks/useSafeAreaInsets';
import { axiosWithAuth } from '../../utils/customAxios';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { ipURL } from '../../utils/utils';

interface Subject {
  id: string;
  subjectName: string;
  subjectDescription: string;
  subjectGrade: string;
  subjectBoard: string;
  subjectTags: string[];
  thumbnail: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalSubjects: number;
  hasMore: boolean;
}

const allSubject = () => {
  const insets = useSafeAreaInsets();
  const [subjectData, setSubjectData] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalSubjects: 0,
    hasMore: true
  });

  const fetchSubjects = async (searchTerm?: string, page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const url = searchTerm && searchTerm.trim() !== ''
        ? `${ipURL}/api/subjects/advance-search?q=${searchTerm}&page=${page}`
        : `${ipURL}/api/subjects/advance-search?page=${page}`;
      
      const response = await axiosWithAuth.get(url);
      
      if (append) {
        setSubjectData(prev => [...prev, ...response.data.subjects]);
      } else {
        setSubjectData(response.data.subjects);
      }
      
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to fetch subjects. Please try again.');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (!text.trim()) {
        fetchSubjects();
        return;
      }
      fetchSubjects(text);
    }, 1500);

    setSearchTimeout(timeout);
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter') {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (!search.trim()) {
        fetchSubjects();
        return;
      }
      fetchSubjects(search);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && pagination.hasMore) {
      const nextPage = pagination.currentPage + 1;
      fetchSubjects(search, nextPage, true);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && !loadingMore && pagination.hasMore) {
      handleLoadMore();
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSubjects(search);
  }, [search]);

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleItemPress = (itemId: { id: string }) => {
    router.push(`/(tabs)/home/${itemId.id}`);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.mainContainer}>
       <StatusBarComponent />
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? addBasePaddingToTopInset(20, insets.top) : verticalScale(20) }]}>
          <Text style={styles.headerTitle}>All Courses</Text>
          {/* <TouchableOpacity onPress={handleFilterPress} style={styles.filterButton}>
            <Ionicons name="options-outline" size={moderateScale(24)} color={COLORS.primary} />
          </TouchableOpacity> */}
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={moderateScale(20)} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses by name"
            placeholderTextColor={COLORS.gray}
            value={search}
            onChangeText={handleSearch}
            onKeyPress={handleKeyPress}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearch('');
                fetchSubjects();
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={moderateScale(20)} color={COLORS.gray} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => fetchSubjects()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : subjectData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={moderateScale(48) } color={COLORS.gray} />
            <Text style={styles.emptyText}>No courses found</Text>
            <Text style={styles.emptySubtext}>We might not have the course you're looking for yet. Please leave us a feedback and we'll add it to our list.</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={400}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          >
            <SubjectCards 
              subjectData={subjectData} 
              handleItemPress={handleItemPress} 
              isHorizontal={false} 
            />
            {loadingMore && (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default allSubject;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: COLORS.primary,
  },
  filterButton: {
    padding: moderateScale(8),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    marginHorizontal: horizontalScale(20),
    marginVertical: verticalScale(10),
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(15),
  },
  searchIcon: {
    marginRight: horizontalScale(10),
  },
  searchInput: {
    flex: 1,
    height: verticalScale(45),
    fontFamily: FONT.medium,
    fontSize: moderateScale(14),
    color: COLORS.black,
  },
  clearButton: {
    padding: moderateScale(5),
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(20),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  errorText: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(8),
  },
  retryButtonText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
  },
  emptyText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: COLORS.black,
    marginTop: verticalScale(20),
  },
  emptySubtext: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: COLORS.gray,
    marginTop: verticalScale(10),
  },
  loadingMoreContainer: {
    paddingVertical: verticalScale(20),
    alignItems: 'center',
  },
});