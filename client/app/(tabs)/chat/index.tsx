import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import React from "react";
import { router } from "expo-router";

const ChatPage = () => {
  const teachersInformation = [
    {
      id: 1,
      name: "John Smith",
      subject: "Mathematics",
    },
    {
      id: 2,
      name: "Emily Johnson",
      subject: "English",
    },
    {
      id: 3,
      name: "Michael Davis",
      subject: "Science",
    },
    {
      id: 4,
      name: "Lisa Williams",
      subject: "History",
    },
    {
      id: 5,
      name: "Daniel Miller",
      subject: "Physical Education",
    },
  ];
  const handlePress = (item) => {
    router.push(`/(tabs)/chat/${item.name}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for your chats here"
          style={styles.searchInput}
        />
      </View>
      <View style={styles.mainContainer}>
        <View style={styles.checkq}>
          <FlatList
            data={teachersInformation}
            renderItem={({ item }) => (
              <View>
                <TouchableOpacity onPress={() => handlePress(item)}>
                  <View style={styles.listContainer}>
                    <View>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.message}>{item.subject}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
          />
        </View>
      </View>
    </View>
  );
};

export default ChatPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DBE8D8",
    padding: 10,
    flexDirection: "column",
  },
  searchContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    height: 45,
    marginVertical: 10,
  },
  searchInput: {
    paddingLeft: 10,
    fontSize: 16,
    flex: 1,
    fontFamily: "Roboto-Regular",
  },
  mainContainer: {
    backgroundColor: "#45B08C",
    borderRadius: 10,
    width: "100%",
    height: "100%",
  },
  listContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
  checkq: {
    marginTop: 10,
    borderRadius: 10,
  },
  name: {
    fontFamily: "Roboto-Regular",
    fontWeight: "bold",
    fontSize: 18,
    color: "white",
  },
  message: {
    fontSize: 15,
    color: "lightgrey",
    fontFamily: "Roboto-Regular",
  },
});
