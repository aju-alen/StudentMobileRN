import { StyleSheet, Text, View,TouchableOpacity,FlatList,Image } from 'react-native'
import React from 'react'

const HomeFlatlist = ({homeData,handleItemPress}) => {
    console.log(homeData,'child component');
    
  return (
    <View style={{ flex: 1 }}>
    <FlatList
      data={homeData}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleItemPress(item)}>
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
                        
                        backgroundColor: "lightblue",
                        borderRadius: 20,
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
                <Text style={styles.text1}>
                  Price: {item.subjectPrice}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item._id}
    />
  </View>
  )
}

export default HomeFlatlist

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
      justifyContent: "space-between",
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