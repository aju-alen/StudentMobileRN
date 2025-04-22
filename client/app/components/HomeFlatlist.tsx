import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
import { router, usePathname } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipURL } from "../utils/utils";
import { SIZES } from "../../constants";

const { width } = Dimensions.get('window');
const CARD_PADDING = 16;
const IMAGE_SIZE = 90;

const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';

interface User {
  isTeacher?: boolean;
  subjects?: SubjectItem[];
}

interface SubjectItem {
  id: string;
  subjectName: string;
  subjectDescription?: string;
  subjectImage?: string;
  subjectPrice?: number;
  subjectBoard?: string;
  subjectGrade?: number;
}

const HomeFlatlist = ({ homeData, handleItemPress }) => {
  const [showAllText, setShowAllText] = useState({});
  const maxLines = 3;
  const routeInfo = usePathname();
  const [user, setUser] = useState<User>({});

  useEffect(() => {
    const getUser = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const apiUser = await axios.get(`${ipURL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(apiUser.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    getUser();
  }, []);

  const handlePressEdit = (item) => {
    router.push(`../profile/editSubject/${item.id}`);
  };

  const handleIPressDelete = async (item) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.delete(`${ipURL}/api/subjects/${item.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Subject deleted successfully");
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Failed to delete subject");
    }
  };

  const toggleShowAllText = (itemId) => {
    setShowAllText(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const renderActionButtons = (item) => (
    <View style={styles.actionButtons}>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={() => handlePressEdit(item)}
      >
        <Text style={styles.actionButtonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionButton, styles.deleteButton]} 
        onPress={() => handleIPressDelete(item)}
      >
        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={homeData}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.cardWrapper}
            onPress={() => handleItemPress(item)}
          >
            <View style={styles.card}>
              <View style={styles.headerContainer}>
                <View style={styles.titleContainer}>
                  <Text style={styles.subjectName}>{item.subjectName}</Text>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badge}>{item.subjectBoard}</Text>
                  </View>
                </View>
                {routeInfo === "/profile" && user.isTeacher && renderActionButtons(item)}
              </View>

              <View style={styles.contentContainer}>
                <Image
                  source={{ uri: item.subjectImage }}
                  style={styles.image}
                  placeholder={blurhash}
                  contentFit="cover"
                  transition={200}
                />
                <View style={styles.textContainer}>
                  <TouchableOpacity onPress={() => toggleShowAllText(item.id)}>
                    <Text 
                      numberOfLines={showAllText[item.id] ? undefined : maxLines}
                      style={styles.description}
                    >
                      {item.subjectDescription}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.detailsContainer}>
                    <Text style={styles.price}>{item.subjectPrice}</Text>
                    <Text style={styles.grade}>Grade {item.subjectGrade}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContent}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flatListContent: {
    padding: SIZES.small,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: CARD_PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  subjectName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    fontFamily: "Roboto-Regular",
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: '500',
    overflow: 'hidden',
  },
  contentContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  grade: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f57c00',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#dc3545',
  },
});

export default HomeFlatlist;