import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const ProfilePage = () => {
  return (
    <View style={styles.container}>
      {/* <Image source={require('./assets/favicon.png')} style={styles.profileImage} /> */}
      <Text style={styles.title}>Profile Page</Text>
      <View style={styles.rowContainer}>
        <Text style={styles.ratingText}>Ratings: 4.5</Text>
        <Text style={styles.sessionsText}>Sessions Booked: 10</Text>
      </View>
      <View style={styles.horizontalLine} />
      <Text style={styles.bulletPoint}>- Bullet point 1</Text>
      <Text style={styles.bulletPoint}>- Bullet point 2</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Button 1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Button 2</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'light-gray',
  },
  profileImage: {
    width: 150,
    height: 50,
    borderRadius: 75,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  ratingText: {
    marginRight: 16,
    color: 'white',
  },
  sessionsText: {
    marginLeft: 16,
    color: 'white',
  },
  horizontalLine: {
    width: '100%',
    height: 1,
    backgroundColor: 'black',
    marginBottom: 16,
  },
  bulletPoint: {
    marginBottom: 8,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfilePage;
