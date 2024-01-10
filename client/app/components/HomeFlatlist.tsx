import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import React, { useState } from "react";

const HomeFlatlist = ({ homeData, handleItemPress }) => {
  console.log(homeData, "child component");

  const [showAllText, setShowAllText] = useState(false);
  const maxLines = 2;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={homeData}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleItemPress(item)}>
            <View style={styles.card}>
              <View style={styles.titlePriceContainer}>
                <Text style={styles.text1}>{item.subjectName}</Text>
                <Text style={[styles.text2, styles.button2]}>
                  {item.subjectBoard}
                </Text>
              </View>
              <View style={styles.rowContainer}>
                <Image
                  source={{ uri: item.subjectImage }}
                  style={styles.image}
                />
                <View style={styles.textContainer}>
                  <Text numberOfLines={showAllText ? undefined : maxLines}>
                    {item.subjectDescription}
                  </Text>
                  <View style={styles.priceGradeContainer}>
                    <Text style={styles.text2}>Price: {item.subjectPrice}</Text>
                    <Text style={styles.text2}>Grade: {item.subjectGrade}</Text>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

export default HomeFlatlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 40,
    fontFamily: "Roboto-Regular",
  },
  text1: {
    fontSize: 20,
    fontFamily: "Roboto-Regular",
  },
  text2: {
    fontSize: 15,
    fontFamily: "Roboto-Regular",
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
    elevation: 5,
  },
  image: {
    width: 75,
    height: 75,
    resizeMode: "cover",
    borderRadius: 10,
  },
  rowContainer: {
    flexDirection: "row",
  },
  textContainer: {
    marginLeft: 5,
    flex: 1,
  },
  titlePriceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 2,
    paddingBottom: 3,
  },
  button1: {
    backgroundColor: "#808080",
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  button2: {
    backgroundColor: "orange",
    borderRadius: 20,
    paddingLeft: 6,
    paddingRight: 6,
  },
  priceGradeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 5,
  },
});
