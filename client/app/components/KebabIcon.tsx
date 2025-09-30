
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

import { horizontalScale, moderateScale, verticalScale } from '../utils/metrics';

const KebabIcon = ({handleLogout,handleCreateNewSubject,isTeacher,setShowDropdown,showDropdown}) => {

 

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.menuButton}>
        <AntDesign name="ellipsis1" size={24} color="white" />
      </TouchableOpacity>
      {showDropdown && (
        <View style={styles.dropdown}>

          {isTeacher&& <TouchableOpacity style={styles.dropdownItem} onPress={handleCreateNewSubject}>
            <Text style={styles.text}>Create New Subject</Text>
          </TouchableOpacity>}
          <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
            <Text style={styles.text}>Logout</Text>
          </TouchableOpacity>
          
        </View>
      )}
    </View>
  );
}

const screenWidth = Dimensions.get('window').width;

export default KebabIcon

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    padding: moderateScale(10),
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#fff',
    borderRadius: moderateScale(15),
    paddingHorizontal: moderateScale(5),
    shadowColor: '#000',
    width: horizontalScale(160),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    //shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: screenWidth * 0.8, // Set maximum width to 80% of screen width
  },
  dropdownItem: {
    paddingVertical: 8,
    marginBottom: 5,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
});