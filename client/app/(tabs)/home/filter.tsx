import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import { COLORS, FONT, SIZES } from '../../../constants';
import { horizontalScale, verticalScale, moderateScale } from '../../utils/metrics';

const Filter = () => {
  const [grade, setGrade] = React.useState('');
  const [board, setBoard] = React.useState('');
  const [tags, setTags] = React.useState('');
  // const [teacher, setTeacher] = React.useState('');

  console.log(grade,'this is tagsInput');
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Ionicons name="search" size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>Advanced Search</Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Grade</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input}
                placeholder="Enter grade (e.g., 10, 11, 12)"
                placeholderTextColor="#999"
                value={grade}
                onChangeText={setGrade}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Board</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input}
                placeholder="Enter board (e.g., CBSE, ICSE)"
                placeholderTextColor="#999"
                value={board}
                onChangeText={setBoard}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Subject Tags</Text>
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input}
                placeholder="Enter subjects (e.g., Maths, Science)"
                placeholderTextColor="#999"
                value={tags}
                onChangeText={setTags}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => {
            router.replace({
              pathname: "/(tabs)/home/",
              params: {
                ...(grade && { subjectGrade: grade }),
                ...(board && { subjectBoard: board }),
                ...(tags && { subjectTags: tags }),
              },
            });
          }}
        >
          <Text style={styles.searchButtonText}>Search Courses</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Filter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: verticalScale(30),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(10),
  },
  headerTitle: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(24),
    color: COLORS.primary,
    marginLeft: horizontalScale(10),
  },
  searchSection: {
    paddingHorizontal: horizontalScale(20),
    marginTop: verticalScale(20),
  },
  inputContainer: {
    marginBottom: verticalScale(20),
  },
  label: {
    fontFamily: FONT.medium,
    fontSize: moderateScale(16),
    color: COLORS.primary,
    marginBottom: verticalScale(8),
  },
  inputWrapper: {
    backgroundColor: '#F5F5F5',
    borderRadius: moderateScale(12),
    paddingHorizontal: horizontalScale(15),
    height: verticalScale(50),
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    fontFamily: FONT.regular,
    fontSize: moderateScale(16),
    color: '#333',
    height: '100%',
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(15),
    paddingHorizontal: horizontalScale(20),
    marginHorizontal: horizontalScale(20),
    marginTop: verticalScale(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    //shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchButtonText: {
    fontFamily: FONT.bold,
    fontSize: moderateScale(16),
    color: '#FFFFFF',
    marginRight: horizontalScale(10),
  },
});