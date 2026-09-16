import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useCallback, useState } from 'react'
import HomeFlatlist from '../../components/HomeFlatlist'
import { ipURL } from '../../utils/utils'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from "@expo/vector-icons"
import { axiosWithAuth } from '../../utils/customAxios'
import { SafeAreaView } from "react-native-safe-area-context";

const PendingVerification = () => {
  const [verifySubjects, setVerifySubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleItemPress = (itemId: { id: any }) => {
    router.push(`/(tabs)/verification/${itemId.id}`);
  };

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          setError(null);
          const apiUser = await axiosWithAuth.get(`${ipURL}/api/subjects/verify`);
          if (active) {
            setVerifySubjects(apiUser.data);
            setLoading(false);
          }
        } catch {
          if (active) {
            setError('Failed to fetch subjects');
            setLoading(false);
          }
        }
      };
      load();
      return () => {
        active = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A2B4B" />
          <Text style={styles.loadingText}>Loading subjects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.mainContainer}>
        {verifySubjects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={48} color="#666" />
            <Text style={styles.emptyText}>No subjects pending verification</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <HomeFlatlist
              homeData={verifySubjects}
              handleItemPress={handleItemPress}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

export default PendingVerification

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
})
