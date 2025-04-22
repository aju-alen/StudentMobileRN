import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import HomeFlatlist from '../../components/HomeFlatlist'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ipURL } from '../../utils/utils'
import { router } from 'expo-router'
import { Ionicons } from "@expo/vector-icons"

const VerificationIndex = () => {
  const [verifySubjects, setVerifySubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleItemPress = (itemId: { id: any }) => {
    router.push(`/(tabs)/verification/${itemId.id}`);
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const apiUser = await axios.get(`${ipURL}/api/subjects/verify`, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("authToken")}`,
          },
        });
        setVerifySubjects(apiUser.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch subjects');
        setLoading(false);
      }
    }
    getUser();
  }, [])

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading subjects...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.headerContainer}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#0066cc" />
          <Text style={styles.headerText}>Subject Verification</Text>
        </View>
        
        <View style={styles.divider} />
        
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

export default VerificationIndex

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  headerText: {
    fontSize: 20,
    fontFamily: "Roboto-Regular",
    color: '#0066cc',
    marginLeft: 10,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#dee2e6',
    marginHorizontal: 20,
    marginBottom: 10,
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
    fontFamily: "Roboto-Regular",
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
    fontFamily: "Roboto-Regular",
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
    fontFamily: "Roboto-Regular",
  },
})