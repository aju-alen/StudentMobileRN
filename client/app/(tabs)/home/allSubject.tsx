import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { COLORS, FONT } from '../../../constants';
import StatusBarComponent from '../../components/StatusBarComponent';
import SubjectCards from '../../components/SubjectCards';
import { axiosWithAuth } from '../../utils/customAxios';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { goBack } from '../../utils/navigation';
import { ipURL } from '../../utils/utils';
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [subjectData, setSubjectData] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
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
        ? `${ipURL}/api/subjects/advance-search?q=${encodeURIComponent(searchTerm.trim())}&page=${page}`
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
    }, 400);

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
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
       <StatusBarComponent />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => goBack('/(tabs)/home')}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={moderateScale(24)} color="#12263A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All courses</Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/home/filter')}
            style={styles.filterButton}
            accessibilityRole="button"
            accessibilityLabel="Advanced search"
          >
            <Ionicons name="options-outline" size={moderateScale(22)} color="#1A4C6E" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={moderateScale(20)} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by course or tutor name"
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
    backgroundColor: '#F4F6F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(12),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(8),
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#12263A',
  },
  filterButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: horizontalScale(20),
    marginBottom: verticalScale(12),
    borderRadius: moderateScale(14),
    paddingHorizontal: horizontalScale(14),
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#E6EBF0',
  },
  searchIcon: {
    marginRight: horizontalScale(10),
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontFamily: FONT.medium,
    fontSize: moderateScale(15),
    color: '#12263A',
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
    color: '#C2410C',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(12),
    minHeight: 44,
    borderRadius: moderateScale(12),
    justifyContent: 'center',
  },
  retryButtonText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(14),
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(32),
  },
  emptyText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(18),
    color: '#12263A',
    marginTop: verticalScale(20),
  },
  emptySubtext: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(14),
    color: '#5C6B76',
    marginTop: verticalScale(8),
    textAlign: 'center',
    lineHeight: moderateScale(20),
  },
  loadingMoreContainer: {
    paddingVertical: verticalScale(20),
    alignItems: 'center',
  },
});