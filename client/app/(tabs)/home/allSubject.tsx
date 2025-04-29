import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import SubjectCards from '../../components/SubjectCards'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router, useLocalSearchParams } from 'expo-router';
import { debounce } from "lodash";
import { Ionicons } from "@expo/vector-icons";
import { ipURL } from '../../utils/utils';
import { horizontalScale, moderateScale, verticalScale } from '../../utils/metrics';
import { FONT, COLORS } from '../../../constants';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';

interface Subject {
  _id: string;
  subjectName: string;
  subjectDescription: string;
  subjectGrade: string;
  subjectBoard: string;
  subjectTags: string[];
  thumbnail: string;
}

const allSubject = () => {
  const [subjectData, setSubjectData] = useState<Subject[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const fetchSubjects = async (searchTerm?: string) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      const url = searchTerm && searchTerm.trim() !== ''
        ? `${ipURL}/api/subjects?q=${encodeURIComponent(searchTerm.trim())}`
        : `${ipURL}/api/subjects`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjectData(response.data);
    } catch (err) {
      setError('Failed to fetch subjects. Please try again.');
      console.error('Error fetching subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
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
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      // Trigger search immediately
      if (!search.trim()) {
        fetchSubjects();
        return;
      }
      fetchSubjects(search);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup timeout on component unmount
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleItemPress = (itemId: { _id: string }) => {
    router.push(`/(tabs)/home/${itemId._id}`);
  };

  const handleFilterPress = () => {
    router.push('/home/filter');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>All Courses</Text>
          <TouchableOpacity onPress={handleFilterPress} style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses, subjects, or tags..."
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
              <Ionicons name="close-circle" size={20} color={COLORS.gray} />
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
            <Ionicons name="search-outline" size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>No courses found</Text>
            <Text style={styles.emptySubtext}>Try different search terms</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <SubjectCards 
              subjectData={subjectData} 
              handleItemPress={handleItemPress} 
              isHorizontal={false} 
            />
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
});