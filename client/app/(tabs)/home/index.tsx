import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  SafeAreaView,
  FlatList,
  Image,
} from "react-native";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const HomePage = () => {
  const cardData = [
    {
      subjectName: "Maths",
      subjectDescription:
        "Maths is the study of topics such as quantity (numbers), structure, space, and change.",
      subjectImage:
        "https://cdn.iconscout.com/icon/premium/png-512-thumb/maths-book-5674609-4765400.png?f=webp&w=256",
      subjectPrice: 100,
      subjectBoard: "CBSE",
    },
    {
      subjectName: "English",
      subjectDescription:
        "English is the study of topics such as quantity (numbers), structure, space, and change.",
      subjectImage:
        "https://image.similarpng.com/very-thumbnail/2020/07/English-course--book-and-dvd-on-transparent-PNG.png",
      subjectPrice: 600,
      subjectBoard: "ICSE",
    },
    {
      subjectName: "Physics",
      subjectDescription:
        "Physics is the study of topics such as quantity (numbers), structure, space, and change.",
      subjectImage:
        "https://cdn.iconscout.com/icon/premium/png-512-thumb/physics-book-2054930-1730255.png?f=webp&w=256",
      subjectPrice: 60,
      subjectBoard: "CBSE",
    },
    {
      subjectName: "Physics",
      subjectDescription:
        "Physics is the study of topics such as quantity (numbers), structure, space, and change.",
      subjectImage:
        "https://cdn.iconscout.com/icon/premium/png-512-thumb/physics-book-2054930-1730255.png?f=webp&w=256",
      subjectPrice: 60,
      subjectBoard: "CBSE",
    },
  ];
  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    router.replace("/(authenticate)/login");
  };

  const handleItemPress = (itemId) => {
    // Handle the press event for the item with the given itemId
    console.log("Item pressed:", itemId);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <View style={styles.titlePriceContainer}>
          <Text style={[styles.text, { marginLeft: 10 }]}>Welcome</Text>
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.button1, { left: 120 }]}
          >
            <Text style={[styles.text1]}>Logout</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={[
            {
              height: 40,
              borderColor: "gray",
              borderWidth: 1,
              margin: 16,
              padding: 10,
              borderRadius: 5,
            },
            styles.text1,
          ]}
          placeholder="Search Subjects"
        />
        <View
          style={{
            borderBottomColor: "black", // Change the color as needed
            borderBottomWidth: 1,
            marginVertical: 1, // Adjust the margin as needed
            marginHorizontal: 20, //Adjust the margin as needed
          }}
        ></View>
        <View style={{ flex: 1 }}>
          <FlatList
            data={cardData}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleItemPress(item.subjectName)}
              >
                <View style={styles.card}>
                  <View style={styles.rowContainer}>
                    <Image
                      source={{ uri: item.subjectImage }}
                      style={styles.image}
                    />
                    <View style={styles.textContainer}>
                      <View style={styles.titlePriceContainer}>
                        <Text style={styles.text1}>{item.subjectName}</Text>
                        <Text
                          style={[
                            styles.text1,
                            {
                              marginLeft: 120,
                              backgroundColor: "red",
                              borderRadius: 10,
                              paddingLeft: 5,
                              paddingRight: 5,
                            },
                          ]}
                        >
                          {item.subjectBoard}
                        </Text>
                      </View>
                      <Text style={styles.text2}>
                        {item.subjectDescription}
                      </Text>
                      <Text style={styles.text1}>Price: {item.subjectPrice}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            // keyExtractor={(item) => item.subjectId.toString()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 40,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  text1: {
    fontSize: 20,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  text2: {
    fontSize: 18,
    fontFamily: "SpaceMono-Regular",
    fontWeight: "bold",
  },
  button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "blue",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  searchInput: {
    width: "100%",
    height: "100%",
  },
  searchContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    height: 50,
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
    elevation: 5, // Android
  },
  image: {
    width: 100, // Adjust the width as needed
    height: 100, // Adjust the height as needed
    resizeMode: "cover", // or 'contain' or 'stretch' or 'center'
    borderRadius: 8, // Adjust as needed for rounded corners
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center", // Optional: Align items vertically in the middle
  },
  textContainer: {
    marginLeft: 1, // Add space between image and text
    flex: 1,
  },
  titlePriceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  button1: {
    backgroundColor: "#808080", // Default background color
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});
