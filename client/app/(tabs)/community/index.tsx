import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
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
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


const CommunityPage = () => {
 

  const [communites, setCommunites] = useState([]);
  const [token, setToken] = useState("");

  useEffect(()=>{
    const getAllCommunities = async () => {
      const token = await AsyncStorage.getItem("authToken");
      console.log(token, "this is token in useEffect");


      const resp = await axios.get(`${ipURL}/api/community`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCommunites(resp.data);
      setToken(token);
    }
    getAllCommunities();
  },[])

  const handlePress = async(item) => {
    console.log(item._id);
    
    const resp = await axios.post(`${ipURL}/api/community/${item._id}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    socket.emit('chat-room',item._id)
    router.push(`/(tabs)/community/${item._id}`);
  }
  console.log("this is all community",communites );
  
  return (
    <SafeAreaView style={{ flex: 1,backgroundColor:"white" }}>
      <Text style={[styles.text1]}>
        <Ionicons name="people-outline" size={20} color="gray" /> Discover New
        Communities
      </Text>
    
      <FlatList
        data={communites}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity onPress={() => handlePress(item)}>
              <View style={styles.card}>
                <View style={styles.rowContainer1}>
                  <Image source={{ uri: item.communityProfileImage }} 
                  style={styles.image}
                  placeholder={blurhash}
                  contentFit="cover"
                  transition={100}
                   />
                  <View style={[styles.textContainer, { marginLeft: 10 }]}>
                    <Text style={styles.text2}>{item.communityName}</Text>
                    <Text style={styles.text2}>{item.users.length}Members</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default CommunityPage;

const styles = StyleSheet.create({
  text1: {
    fontSize: moderateScale(20),
    // fontFamily: FONT.semiBold,
    padding: horizontalScale(10),
    marginTop: verticalScale(15),

    fontWeight: "800",
    
  },
  text2: {
    fontSize: 18,
    fontFamily: FONT.regular,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: "cover",
    borderRadius: 8,
  },
  rowContainer1: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    marginLeft: 1,
    flex: 1,
  },

});
